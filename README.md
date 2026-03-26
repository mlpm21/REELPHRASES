# ReelPhrases

Movie quote search application - find the movie when you remember the quote but not the title.

## Overview
ReelPhrases is a full-stack web application that searches 1,053 movie screenplays containing 818,000+ dialogue lines. Built with React and FastAPI, it uses SQLite FTS5 (Full-Text Search) with BM25 ranking to deliver fast, relevant quote matches. The search engine handles misspellings, apostrophe variations, and word stemming to find quotes even when you don't remember them perfectly.

## Features

**Intelligent Search**
- Phrase matching with fallback to word-level search
- Apostrophe-tolerant ("Its" matches "It's", "dont" matches "don't")
- Porter stemming ("remembered" matches "remember")
- BM25 relevance scoring for accurate ranking

**Search Results**
- Results grouped by movie with up to 3 matched dialogue lines
- Shows speaker name and exact quote
- Sorted by relevance score

**Performance**
- Sub-second search response times
- 818K+ indexed dialogue lines across 1,053 movies
- Efficient SQLite FTS5 database (~115 MB)

## Tech Stack

**Frontend**
- React 19
- Vite (build tool & dev server)
- Tailwind CSS

**Backend**
- Python FastAPI
- Uvicorn ASGI server
- SQLite FTS5 (full-text search)
- BM25 ranking algorithm

**Data Processing**
- Kaggle Cornell Movie Dialogs dataset
- Custom screenplay parser
- 246 MB raw data → 115 MB search database

## Project Structure
```
backend/
  data/
    movies.json        # Raw Kaggle dataset (not in git — 246 MB)
    fetch.py           # Dataset download helper
  preprocess.py        # Parses screenplays → SQLite FTS5 database
  main.py              # FastAPI server with /api/search endpoint
  reelphrases.db       # Generated search database (not in git — 115 MB)
  requirements.txt     # Python dependencies (fastapi, uvicorn)
frontend/              # React + Vite + Tailwind
  src/
  vite.config.js       # Proxies /api/* to FastAPI in dev
docs/
```

## Setup & Installation

### Backend Setup

**1. Get the dataset**
```bash
cd backend
python3 data/fetch.py                    # downloads via kagglehub
mv ~/.cache/kagglehub/.../movies.json data/
```

**2. Build the search database**
```bash
python3 preprocess.py       # parses 1,053 screenplays → reelphrases.db
```

This extracts dialogue lines from raw screenplay text and indexes them in a SQLite FTS5 full-text search table with BM25 ranking.

**Output:** `reelphrases.db` (~115 MB, 818K dialogue lines across 1,053 movies)

**3. Install Python dependencies**
```bash
pip install -r requirements.txt
```

**4. Run the API server**
```bash
cd backend
uvicorn main:app --reload     # starts on http://localhost:8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

The Vite dev server automatically proxies `/api/*` requests to the FastAPI backend (no CORS config needed).

## API Documentation

### `GET /api/search`

Search for movies by a remembered quote.

**Parameters:**

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `q` | string | — | Quote to search for (required) |
| `limit` | int | 20 | Max results (1–100) |

**Example Request:**
```bash
GET /api/search?q=its+not+your+fault&limit=5
```

**Example Response:**
```json
{
  "query": "its not your fault",
  "results": [
    {
      "movie_id": 7,
      "movie_name": "Good Will Hunting",
      "score": -12.71,
      "matched_lines": [
        { 
          "speaker": "SEAN", 
          "line": "It's not your fault.", 
          "score": -12.71 
        }
      ]
    }
  ]
}
```

**Search Algorithm:**
1. First tries phrase matching (words in order)
2. Falls back to all-words match if no phrase matches found
3. Apostrophe normalization before search
4. Porter stemming applied to query terms
5. Results ranked by BM25 score (more negative = better match)
6. Grouped by movie with top 3 matched lines per movie

## Movie details integration + favorites
