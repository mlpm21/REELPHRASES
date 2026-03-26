"""
Preprocessing pipeline for ReelPhrases.

Reads the raw movies.json Kaggle dataset, extracts dialogue lines from
each screenplay, and writes them into a SQLite database with an FTS5
full-text search index for fast BM25-ranked quote lookup.

Usage:
    python preprocess.py                         # default paths
    python preprocess.py --input data/movies.json --output reelphrases.db
"""

import argparse
import json
import re
import sqlite3
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Dialogue extraction
# ---------------------------------------------------------------------------

# Matches a CHARACTER NAME line in a screenplay.
# Expects the name to be ALL-CAPS, optionally followed by parenthetical
# annotations like (CONT'D), (V.O.), (O.S.), etc.
_CHAR_NAME_RE = re.compile(
    r"^(?P<name>[A-Z][A-Z .'\-]{1,35}?)"
    r"(?:\s*\((?:CONT'?D?|V\.?O\.?|O\.?S\.?|O\.?C\.?|OVER|FILTERED|INTO PHONE|ON PHONE|ON RADIO|SINGING|SCREAMING|YELLING|WHISPERING|READING)[^)]*\))?"
    r"\s*$"
)

# Lines starting with these are scene headings / directions, not dialogue.
_SCENE_HEADING_PREFIXES = (
    "INT.", "INT ", "EXT.", "EXT ", "FADE", "CUT TO", "DISSOLVE",
    "SMASH CUT", "MATCH CUT", "TITLE:", "SUPER:", "INTERCUT",
    "CLOSE ON", "ANGLE ON", "BACK TO", "CONTINUED", "MORE",
    "THE END", "CREDITS",
)


def normalize_for_search(text: str) -> str:
    """Normalize text for FTS indexing/querying.

    Strips apostrophes (It's → Its), collapses punctuation to spaces,
    and lowercases. Used both at index time and query time so that
    fuzzy-ish matches work (e.g. searching 'Its' matches 'It's').
    """
    text = text.replace("\u2019", "")   # curly apostrophe
    text = text.replace("'", "")         # straight apostrophe
    text = re.sub(r"[^\w\s]", " ", text) # other punctuation → space
    text = re.sub(r"\s+", " ", text)     # collapse whitespace
    return text.strip().lower()


def _normalize_lines(raw_script: str) -> list[str]:
    """Split script into lines, normalise tabs → spaces, strip \\r."""
    text = raw_script.replace("\r", "")
    text = text.replace("\t", "    ")          # 1 tab → 4 spaces
    return text.split("\n")


def _leading_spaces(line: str) -> int:
    return len(line) - len(line.lstrip(" "))


def _is_parenthetical(stripped: str) -> bool:
    """Detect parenthetical direction lines like '(laughs)' or '(to John)'."""
    return stripped.startswith("(") and stripped.endswith(")")


def _extract_indented(lines: list[str], min_indent: int = 16) -> list[dict]:
    """
    Extract dialogue from standard indented screenplay format.
    Character names are ALL-CAPS lines indented ≥ min_indent.
    """
    dialogue = []
    i = 0

    while i < len(lines):
        stripped = lines[i].strip()
        indent = _leading_spaces(lines[i])

        if not stripped or len(stripped) < 2:
            i += 1
            continue

        upper_stripped = stripped.upper()
        if any(upper_stripped.startswith(p) for p in _SCENE_HEADING_PREFIXES):
            i += 1
            continue

        # Character names: indented, ALL-CAPS (allow mixed-case with (cont'd))
        if indent >= min_indent:
            # Try matching the uppercase version for names like "Caspar (cont'd)"
            check = stripped.upper()
            is_upper_enough = stripped.isupper() or (
                re.match(r"^[A-Z][A-Z .'\-]+", stripped)
                and "(cont" in stripped.lower()
            )
            if is_upper_enough:
                m = _CHAR_NAME_RE.match(check)
                if m:
                    speaker = m.group("name").strip()
                    if speaker in ("CONTINUED", "MORE", "THE END", "CREDITS"):
                        i += 1
                        continue

                    i += 1
                    dialogue_parts = []

                    while i < len(lines):
                        dline = lines[i]
                        dstripped = dline.strip()

                        if not dstripped:
                            break

                        d_indent = _leading_spaces(dline)
                        d_check = dstripped.upper()
                        if d_indent >= min_indent and _CHAR_NAME_RE.match(d_check):
                            d_is_upper = dstripped.isupper() or (
                                re.match(r"^[A-Z][A-Z .'\-]+", dstripped)
                                and "(cont" in dstripped.lower()
                            )
                            if d_is_upper:
                                break

                        d_upper = dstripped.upper()
                        if any(d_upper.startswith(p) for p in _SCENE_HEADING_PREFIXES):
                            break

                        if _is_parenthetical(dstripped):
                            i += 1
                            continue

                        dialogue_parts.append(dstripped)
                        i += 1

                    if dialogue_parts:
                        full_line = " ".join(dialogue_parts)
                        full_line = re.sub(r"\s{2,}", " ", full_line).strip()
                        if len(full_line) >= 2:
                            dialogue.append({"speaker": speaker, "line": full_line})
                    continue

        i += 1

    return dialogue


# Matches inline dialogue: "CHARACTER_NAME:  dialogue text"
# or "CHARACTER NAME:    dialogue text"
_INLINE_RE = re.compile(
    r"^(?P<name>[A-Z][A-Z .'\-]{1,30}?)\s*:\s+(?P<line>.+)$"
)


def _extract_inline(lines: list[str]) -> list[dict]:
    """
    Extract dialogue from inline format: NAME: dialogue text
    Used by scripts like Aladdin, some Rushmore-style scripts.
    """
    dialogue = []
    for raw_line in lines:
        stripped = raw_line.strip()
        if not stripped:
            continue
        m = _INLINE_RE.match(stripped)
        if m:
            speaker = m.group("name").strip()
            line_text = m.group("line").strip()
            if speaker in ("CONTINUED", "MORE", "THE END", "CREDITS"):
                continue
            upper_stripped = speaker.upper()
            if any(upper_stripped.startswith(p) for p in _SCENE_HEADING_PREFIXES):
                continue
            if len(line_text) >= 2:
                dialogue.append({"speaker": speaker, "line": line_text})
    return dialogue


def _extract_unindented(lines: list[str]) -> list[dict]:
    """
    Extract dialogue from Rushmore-style format: character name alone
    on a line (ALL-CAPS, minimal indent), blank line, then dialogue text.
    """
    dialogue = []
    i = 0

    while i < len(lines):
        stripped = lines[i].strip()
        indent = _leading_spaces(lines[i])

        if not stripped:
            i += 1
            continue

        upper_stripped = stripped.upper()
        if any(upper_stripped.startswith(p) for p in _SCENE_HEADING_PREFIXES):
            i += 1
            continue

        # Character name: ALL-CAPS, short, alone on a line, low indent
        if (
            indent <= 4
            and stripped.isupper()
            and 2 < len(stripped) < 40
            and _CHAR_NAME_RE.match(stripped)
        ):
            speaker = _CHAR_NAME_RE.match(stripped).group("name").strip()
            if speaker in ("CONTINUED", "MORE", "THE END", "CREDITS"):
                i += 1
                continue

            i += 1
            # Skip optional blank line between name and dialogue
            if i < len(lines) and not lines[i].strip():
                i += 1

            dialogue_parts = []
            while i < len(lines):
                dstripped = lines[i].strip()

                if not dstripped:
                    break

                # Another character name = stop
                if (
                    dstripped.isupper()
                    and 2 < len(dstripped) < 40
                    and _CHAR_NAME_RE.match(dstripped)
                ):
                    break

                d_upper = dstripped.upper()
                if any(d_upper.startswith(p) for p in _SCENE_HEADING_PREFIXES):
                    break

                if _is_parenthetical(dstripped):
                    i += 1
                    continue

                dialogue_parts.append(dstripped)
                i += 1

            if dialogue_parts:
                full_line = " ".join(dialogue_parts)
                full_line = re.sub(r"\s{2,}", " ", full_line).strip()
                if len(full_line) >= 2:
                    dialogue.append({"speaker": speaker, "line": full_line})
            continue

        i += 1

    return dialogue


def extract_dialogue(raw_script: str) -> list[dict]:
    """
    Parse a raw screenplay string and return a list of dialogue entries:
        [{"speaker": "WILL", "line": "It's not your fault."}, ...]

    Tries multiple format strategies in order:
      1. Standard indented format (indent ≥ 16)
      2. Lower indent threshold (indent ≥ 10) for some scripts
      3. Unindented / Rushmore-style (name at indent 0, dialogue below)
      4. Inline format (NAME: dialogue on one line)
    """
    lines = _normalize_lines(raw_script)

    # Strategy 1: standard indented (most common)
    dialogue = _extract_indented(lines, min_indent=16)
    if len(dialogue) >= 10:
        return dialogue

    # Strategy 2: lower indent threshold
    dialogue = _extract_indented(lines, min_indent=10)
    if len(dialogue) >= 10:
        return dialogue

    # Strategy 3: unindented format (like Rushmore)
    dialogue = _extract_unindented(lines)
    if len(dialogue) >= 5:
        return dialogue

    # Strategy 4: inline NAME: dialogue format (like Aladdin)
    dialogue = _extract_inline(lines)
    if len(dialogue) >= 5:
        return dialogue

    return dialogue


# ---------------------------------------------------------------------------
# Database creation
# ---------------------------------------------------------------------------

SCHEMA = """
CREATE TABLE IF NOT EXISTS movies (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL
);

-- Stores every extracted dialogue line, linked to its movie.
CREATE TABLE IF NOT EXISTS dialogue (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL REFERENCES movies(id),
    speaker  TEXT    NOT NULL,
    line     TEXT    NOT NULL
);

-- FTS5 virtual table for full-text search with BM25 ranking.
-- Stores normalized text (no apostrophes/punctuation) for fuzzy matching.
-- The original text lives in dialogue.line for display.
CREATE VIRTUAL TABLE IF NOT EXISTS dialogue_fts USING fts5(
    line,
    content='dialogue',
    content_rowid='id',
    tokenize='porter unicode61'
);

-- Speed up lookups by movie.
CREATE INDEX IF NOT EXISTS idx_dialogue_movie ON dialogue(movie_id);
"""


def build_database(movies: list[dict], db_path: str) -> None:
    """Create the SQLite database and populate it from parsed movies."""
    db = Path(db_path)
    if db.exists():
        db.unlink()

    conn = sqlite3.connect(str(db))
    conn.executescript(SCHEMA)

    total_lines = 0
    skipped = 0

    for movie in movies:
        name = movie["Name"]
        raw = movie["Script"]

        lines = extract_dialogue(raw)
        if not lines:
            skipped += 1
            continue

        cur = conn.execute("INSERT INTO movies (name) VALUES (?)", (name,))
        movie_id = cur.lastrowid

        conn.executemany(
            "INSERT INTO dialogue (movie_id, speaker, line) VALUES (?, ?, ?)",
            [(movie_id, d["speaker"], d["line"]) for d in lines],
        )

        # Insert normalized text into FTS index (original stays in dialogue.line)
        conn.executemany(
            "INSERT INTO dialogue_fts(rowid, line) VALUES (?, ?)",
            [
                (row[0], normalize_for_search(row[1]))
                for row in conn.execute(
                    "SELECT id, line FROM dialogue WHERE movie_id = ?",
                    (movie_id,),
                )
            ],
        )
        total_lines += len(lines)

    conn.commit()

    # Verify counts
    movie_count = conn.execute("SELECT COUNT(*) FROM movies").fetchone()[0]
    line_count = conn.execute("SELECT COUNT(*) FROM dialogue").fetchone()[0]
    fts_count = conn.execute(
        "SELECT COUNT(*) FROM dialogue_fts"
    ).fetchone()[0]

    conn.close()

    print(f"Database written to: {db}")
    print(f"  Movies processed: {movie_count} (skipped {skipped} with no dialogue)")
    print(f"  Dialogue lines:   {line_count}")
    print(f"  FTS5 index rows:  {fts_count}")
    print(f"  DB file size:     {db.stat().st_size / 1024 / 1024:.1f} MB")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Preprocess movie scripts into a searchable SQLite database."
    )
    parser.add_argument(
        "--input", "-i",
        default=str(Path(__file__).parent / "data" / "movies.json"),
        help="Path to the raw movies.json dataset",
    )
    parser.add_argument(
        "--output", "-o",
        default=str(Path(__file__).parent / "reelphrases.db"),
        help="Output path for the SQLite database",
    )
    args = parser.parse_args()

    print(f"Loading {args.input} ...")
    with open(args.input, "r", encoding="utf-8") as f:
        movies = json.load(f)
    print(f"  Loaded {len(movies)} movies")

    print("Extracting dialogue and building database ...")
    build_database(movies, args.output)
    print("Done.")


if __name__ == "__main__":
    main()
