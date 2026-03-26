"""
FastAPI backend for ReelPhrases.

Provides the /api/search endpoint that queries the SQLite FTS5 database
for movie dialogue matching a user's quote.

Usage:
    uvicorn main:app --reload          # dev (port 8000)
"""

import re
import sqlite3
from pathlib import Path

from fastapi import FastAPI, Query

app = FastAPI(title="ReelPhrases API")

DB_PATH = Path(__file__).parent / "reelphrases.db"


def _get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def _normalize_for_search(text: str) -> str:
    """Same normalization applied at index time in preprocess.py."""
    text = text.replace("\u2019", "")
    text = text.replace("'", "")
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()


def _build_fts_query(raw_query: str) -> str:
    """Build an FTS5 query string from user input.

    Strategy:
      - Normalize the text (strip apostrophes, punctuation).
      - If 2+ words, try phrase match first (quoted), with a fallback
        to individual-word match (unquoted) handled in the SQL via OR.
      - Single words are searched as-is (stemmer handles variants).
    """
    cleaned = _normalize_for_search(raw_query)
    words = cleaned.split()
    if not words:
        return ""
    return " ".join(words)


@app.get("/api/search")
def search(
    q: str = Query(..., min_length=1, max_length=500, description="Quote to search for"),
    limit: int = Query(20, ge=1, le=100, description="Max results to return"),
):
    """Search for movies by a remembered quote.

    Returns ranked results grouped by movie. Each result includes
    the movie name, best-matching dialogue lines, and a relevance score.
    """
    fts_query = _build_fts_query(q)
    if not fts_query:
        return {"query": q, "results": []}

    conn = _get_db()

    # Phase 1: Try exact phrase match (words in order).
    phrase_query = f'"{fts_query}"'
    rows = _execute_search(conn, phrase_query, limit=limit * 3)

    # Phase 2: Fall back to all-words match if phrase match is thin.
    if len(rows) < limit:
        word_rows = _execute_search(conn, fts_query, limit=limit * 3)
        # Merge, avoiding duplicate dialogue IDs
        seen = {r["dialogue_id"] for r in rows}
        for r in word_rows:
            if r["dialogue_id"] not in seen:
                rows.append(r)
                seen.add(r["dialogue_id"])

    conn.close()

    # Group by movie, aggregate scores, pick top lines per movie.
    grouped = _group_by_movie(rows, max_lines=3)

    # Sort by best score (most negative = best BM25 match).
    grouped.sort(key=lambda m: m["score"])

    return {
        "query": q,
        "results": grouped[:limit],
    }


def _execute_search(conn: sqlite3.Connection, fts_query: str, limit: int) -> list[dict]:
    """Run an FTS5 query and return raw row dicts."""
    try:
        rows = conn.execute(
            """
            SELECT
                d.id       AS dialogue_id,
                d.movie_id,
                m.name     AS movie_name,
                d.speaker,
                d.line,
                bm25(dialogue_fts) AS score
            FROM dialogue_fts
            JOIN dialogue d ON d.id = dialogue_fts.rowid
            JOIN movies m   ON m.id = d.movie_id
            WHERE dialogue_fts MATCH ?
            ORDER BY score
            LIMIT ?
            """,
            (fts_query, limit),
        ).fetchall()
        return [dict(r) for r in rows]
    except sqlite3.OperationalError:
        # Malformed FTS query — return empty rather than 500
        return []


def _group_by_movie(rows: list[dict], max_lines: int = 3) -> list[dict]:
    """Group raw search rows by movie, keeping the best-scoring lines."""
    movies: dict[int, dict] = {}
    for r in rows:
        mid = r["movie_id"]
        if mid not in movies:
            movies[mid] = {
                "movie_id": mid,
                "movie_name": r["movie_name"],
                "score": r["score"],
                "matched_lines": [],
            }
        entry = movies[mid]
        # Keep the best (most negative) score
        if r["score"] < entry["score"]:
            entry["score"] = r["score"]
        # Collect up to max_lines per movie
        if len(entry["matched_lines"]) < max_lines:
            entry["matched_lines"].append({
                "speaker": r["speaker"],
                "line": r["line"],
                "score": r["score"],
            })
    return list(movies.values())
