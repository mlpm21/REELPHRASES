import { Link, useLocation } from 'react-router-dom'
import ResultCard from '../components/ResultCard'
import { useEffect, useState } from 'react'
import { searchMovieByTitle } from '../services/tmdb'


function Results() {
  const location = useLocation()
  const { quote, genre, yearFrom, yearTo, sortBy } = location.state || {}

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const genreToTmdbId = {
    action: 28,
    drama: 18,
    'sci-fi': 878,
    comedy: 35,
    horror: 27
  }

  function enrichResultWithTmdbData(result, tmdbMovie) {
    if (!tmdbMovie) {
      return {
        ...result,
        tmdb_id: null,
        title: result.movie_name,
        poster_path: null,
        year: null,
        rating: null,
        popularity: 0,
        genre_ids: []
      }
    }

    return {
      ...result,
      tmdb_id: tmdbMovie.id,
      title: tmdbMovie.title || result.movie_name,
      poster_path: tmdbMovie.poster_path || null,
      year: tmdbMovie.release_date ? Number(tmdbMovie.release_date.slice(0, 4)) : null,
      rating: typeof tmdbMovie.vote_average === 'number' ? tmdbMovie.vote_average : null,
      popularity: tmdbMovie.popularity || 0,
      genre_ids: tmdbMovie.genre_ids || []
    }
  }

  function applyFiltersAndSort(inputResults) {
    const from = Number(yearFrom)
    const to = Number(yearTo)
    const requestedGenreId = genre ? genreToTmdbId[genre] : null

    let output = [...inputResults]

    if (!Number.isNaN(from) && yearFrom) {
      output = output.filter((movie) => movie.year && movie.year >= from)
    }

    if (!Number.isNaN(to) && yearTo) {
      output = output.filter((movie) => movie.year && movie.year <= to)
    }

    if (requestedGenreId) {
      output = output.filter((movie) => movie.genre_ids.includes(requestedGenreId))
    }

    switch (sortBy) {
      case 'newest':
        output.sort((a, b) => (b.year || 0) - (a.year || 0))
        break
      case 'oldest':
        output.sort((a, b) => (a.year || 0) - (b.year || 0))
        break
      case 'popularity':
        output.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        break
      case 'relevance':
      default:
        output.sort((a, b) => a.score - b.score)
        break
    }

    return output
  }

  useEffect(() => {
    const fetchResults = async () => {
      if (!quote) {
        setResults([])
        return
      }

      setLoading(true)
      setError('')

      try {
        // Fetch lyric matches from backend first.
        const params = {
          q: quote,
          limit: 15
        }
        const queryString = new URLSearchParams(params).toString()
        const fetchResult = await fetch(`/api/search?${queryString}`).then((res) => res.json())
        const backendResults = fetchResult.results || []

        // Resolve each backend movie name to its closest TMDB equivalent.
        const enrichedResults = await Promise.all(
          backendResults.map(async (result) => {
            try {
              const tmdbMovie = await searchMovieByTitle(result.movie_name)
              return enrichResultWithTmdbData(result, tmdbMovie)
            } catch {
              return enrichResultWithTmdbData(result, null)
            }
          })
        )

        setResults(applyFiltersAndSort(enrichedResults))
      } catch {
        setError('Unable to load results right now. Please try again.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [quote, genre, yearFrom, yearTo, sortBy])

  const hasFilters = Boolean(genre || yearFrom || yearTo)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#FDB813] selection:text-black pb-20">

      {/* top bar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <Link to="/search">
            <button className="text-sm font-bold text-[#FDB813] hover:text-white transition-colors flex items-center gap-2">
              ← BACK TO SEARCH
            </button>
          </Link>

          <div className="text-xs tracking-widest font-black uppercase border-l border-white/20 pl-4">
            ReelPhrases
          </div>

        </div>
      </nav>


      <main className="max-w-6xl mx-auto px-6 pt-12">

        {/* header */}
        <header className="mb-12">
          <p className="text-[#FDB813] text-xs font-bold tracking-[0.2em] uppercase mb-2">Search Results for:</p>

          <h1 className="text-3xl md:text-5xl font-black italic bg-gradient-to-r from-white via-white to-white/30 bg-clip-text text-transparent mb-6">
            "{quote || 'Your search'}"
          </h1>

          {/* active filters display */}
          <div className="flex flex-wrap gap-3 mb-4">
            {genre && (
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400">
                🎬 <span className="ml-1 text-white">{genre}</span>
              </div>
            )}

            {(yearFrom || yearTo) && (
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400">
                📅 <span className="ml-1 text-white">{yearFrom || '—'} - {yearTo || '—'}</span>
              </div>
            )}

            <div className="px-3 py-1 bg-[#FDB813]/10 border border-[#FDB813]/20 rounded text-xs text-[#FDB813]">
              🎯 <span className="ml-1 font-bold">{sortBy || 'Top Ranked'}</span>
            </div>

          </div>


          <p className="text-sm text-gray-400">
            Found {results.length} {results.length === 1 ? 'match' : 'matches'}
          </p>

          {error && (
            <p className="text-sm text-red-400 mt-2">{error}</p>
          )}

        </header>


        {/* results list */}
        {loading ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <h3 className="text-xl font-bold">Matching lyrics to movies...</h3>
            <p className="text-gray-500 mt-2">Searching your quote archive and syncing with TMDB metadata.</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">

            <div className="space-y-6 flex flex-col">
              {results.map((movie, index) => (
                <ResultCard key={movie.movie_id} result={movie} index={index} />
              ))}
            </div>

          </div>
        ) : (

          /* Empty State */
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-xl font-bold">
              {hasFilters ? 'No matches after applying filters' : 'No matches found in the archive'}
            </h3>
            <p className="text-gray-500 mt-2">
              {hasFilters
                ? 'Try clearing genre/year filters, or switch sort mode to relevance.'
                : 'Try broadening your quote or adjusting the year range.'}
            </p>

            <Link to="/search">
              <button className="mt-8 px-8 py-3 bg-[#FDB813] text-black font-bold rounded-full hover:scale-105 transition-transform">
                RE-DRAFT SEARCH
              </button>
            </Link>

          </div>
        )}
      </main>


      {/* "RESULT" watermark  */}
      <footer className="fixed bottom-8 right-8 pointer-events-none opacity-20 hidden md:block">
        <p className="text-8xl font-black text-white/5 select-none">RESULTS</p>
      </footer>


    </div>
  )
}

export default Results