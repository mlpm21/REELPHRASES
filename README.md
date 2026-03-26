# Reel Phrases
A website for when you remember the quote but not the movie. Search for a quote and find the movie it came from.

## Project Structure

```
backend/
  data/
    movies.json        # Raw Kaggle dataset (not in git — 246 MB)
    scripts.py         # Dataset download helper
  preprocess.py        # Parses screenplays → SQLite FTS5 database
  main.py              # FastAPI server with /api/search endpoint
  reelphrases.db       # Generated search database (not in git — 115 MB)
  requirements.txt     # Python dependencies (fastapi, uvicorn)
frontend/              # React + Vite + Tailwind
  src/
  vite.config.js       # Proxies /api/* to FastAPI in dev
docs/
```

## Backend Setup

### 1. Get the dataset

```bash
cd backend
python3 data/fetch.py                    # downloads via kagglehub
mv ~/.cache/kagglehub/.../movies.json data/
```

### 2. Build the search database

```bash
python3 preprocess.py       # parses 1,053 screenplays → reelphrases.db
```

This extracts dialogue lines from raw screenplay text and indexes them in
a SQLite FTS5 full-text search table with BM25 ranking.

**Output:** `reelphrases.db` (~115 MB, 818K dialogue lines across 1,053 movies)

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

## Quote search + backend API

### Running the API server

```bash
cd backend
uvicorn main:app --reload     # starts on http://localhost:8000
```

### `GET /api/search`

Search for movies by a remembered quote.

| Param   | Type   | Default | Description                  |
|---------|--------|---------|------------------------------|
| `q`     | string | —       | Quote to search for (required) |
| `limit` | int    | 20      | Max results (1–100)          |

**Example:**

```
GET /api/search?q=its+not+your+fault&limit=5
```

```json
{
  "query": "its not your fault",
  "results": [
    {
      "movie_id": 7,
      "movie_name": "Good Will Hunting",
      "score": -12.71,
      "matched_lines": [
        { "speaker": "SEAN", "line": "It's not your fault.", "score": -12.71 }
      ]
    }
  ]
}
```

**Search features:**
- Phrase matching (words in order) tried first, falls back to all-words match
- Apostrophe-tolerant ("Its" matches "It's", "dont" matches "don't")
- Porter stemming ("remembered" matches "remember", "dying" matches "die")
- BM25 relevance scoring (more negative = better match)
- Results grouped by movie with up to 3 matched lines each

### Frontend proxy

In development, the Vite dev server proxies `/api/*` requests to `http://localhost:8000`.
From React, just `fetch('/api/search?q=...')` - no CORS config needed.

## Results page + state handling

## Front-end routes + UI/UX

## Movie details integration + favorites