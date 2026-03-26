// Read the TMDB API key from the environment variables
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

// Title normalization to prevent mismatch between backend titles and TMDB titles due to punctuation/casing
// "Spider-Man: No Way Home" -> "spider man no way home"
function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Best match algorithm ensures most relevant results (exact -> partial -> most popular)
function pickBestMatch(results, backendTitle) {
  if (!results?.length) {
    return null
  }

  const normalizedBackendTitle = normalizeTitle(backendTitle)

  // Return exact match movies, if possible
  const exact = results.find((movie) => normalizeTitle(movie.title) === normalizedBackendTitle)
  if (exact) {
    return exact
  }

  // If no exact matches, return partial match movies
  const startsWith = results.find((movie) => {
    const normalizedTmdbTitle = normalizeTitle(movie.title)
    return normalizedTmdbTitle.startsWith(normalizedBackendTitle) || normalizedBackendTitle.startsWith(normalizedTmdbTitle)
  })
  if (startsWith) {
    return startsWith
  }

  // If no exact/partial matches, return movies by most popular
  return [...results].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]
}

export async function searchMovieByTitle(title) {
  const trimmedTitle = (title || '').trim()
  if (!trimmedTitle || !API_KEY) {
    return null
  }

  const query = new URLSearchParams({
    api_key: API_KEY,
    query: trimmedTitle,
    include_adult: 'false',
    language: 'en-US',
    page: '1'
  })

  const response = await fetch(`${BASE_URL}/search/movie?${query.toString()}`)
  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return pickBestMatch(data?.results || [], trimmedTitle)
}

// Get full movie details with ONE request instead of 10+ API calls
export async function getMovieFullDetails(id) {
  if (!API_KEY) {
    throw new Error('TMDB API key is missing')
  }

  // URL search parameters include all desired info for Movie Details page
  const query = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    append_to_response: [
      'alternative_titles',
      'changes',
      'credits',
      'external_ids',
      'images',
      'keywords',
      'lists',
      'recommendations',
      'release_dates',
      'reviews',
      'similar',
      'translations',
      'videos',
      'watch/providers'
    ].join(',')
  })

  // Send HTTP request to TMDB movie endpoint
  const response = await fetch(`${BASE_URL}/movie/${id}?${query.toString()}`)

  // If the request fails, throw an error so the UI can handle it
  if (!response.ok) {
    throw new Error('Failed to fetch full movie payload')
  }

  // Convert the response body from JSON into a JS object
  return response.json()
}

// Fetch detailed information about a movie from TMDB
export async function getMovieDetails(id) {

  if (!API_KEY) {
    throw new Error('TMDB API key is missing')
  }

  // Send HTTP request to TMDB movie endpoint
  const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`)

  // If the request fails, throw an error so the UI can handle it
  if (!response.ok) {
    throw new Error("Failed to fetch movie")
  }

  // Convert the response body from JSON into a JS object
  return response.json()
}

// NEW: Fetch top rated movies from TMDB
export async function getTopRatedMovies() {
  if (!API_KEY) {
    throw new Error('TMDB API key is missing')
  }

  const response = await fetch(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch top rated movies')
  }

  return response.json()
}

// NEW: Fetch trending movies
export async function getTrendingMovies() {
  if (!API_KEY) {
    throw new Error('TMDB API key is missing')
  }

  const response = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch trending movies')
  }

  return response.json()
}