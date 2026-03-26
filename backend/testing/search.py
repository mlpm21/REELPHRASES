import sqlite3
import re
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "reelphrases.db"
conn = sqlite3.connect(str(DB_PATH))


def normalize_for_search(text: str) -> str:
    """Same normalization used at index time."""
    text = text.replace("\u2019", "")
    text = text.replace("'", "")
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()


# Change your quote here:
raw_query = "like them apples"

# Normalize and wrap in quotes for phrase matching
query = normalize_for_search(raw_query)
print(f"Normalized query: {query}\n")

rows = conn.execute("""
    SELECT d.line, m.name, d.speaker, bm25(dialogue_fts) AS score
    FROM dialogue_fts
    JOIN dialogue d ON d.id = dialogue_fts.rowid
    JOIN movies m ON m.id = d.movie_id
    WHERE dialogue_fts MATCH ?
    ORDER BY score
    LIMIT 10
""", (query,)).fetchall()

for line, name, speaker, score in rows:
    print(f"[{score:.2f}] {name} - {speaker}: {line[:90]}")