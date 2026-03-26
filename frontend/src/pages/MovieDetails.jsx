import { useLocation, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getMovieFullDetails } from "../services/tmdb"
import FavoriteButton from "../components/FavoriteButton"

function MovieDetails() {

  // Extract the id parameter from the URL
  // Example URL: /movie/603 -> id = "603"
  const { id } = useParams()
  const location = useLocation()
  const matchedLines = location.state?.matchedLines || []
  const backendMovieName = location.state?.backendMovieName
  const backendScore = location.state?.backendScore

  // Store movie data returned from the API
  const [movie, setMovie] = useState(null)

  // Track loading state while the API request is running
  const [loading, setLoading] = useState(true)

  // Fetch movie data when the component loads or when tmdbId changes
  useEffect(() => {

    async function loadMovie() {
      try {
        // Fetch base movie details plus appended sub-resources.
        const data = await getMovieFullDetails(id)

        // Save the returned movie data in component state
        setMovie(data)

      } catch (err) {
        console.error(err)

      } finally {
        // Stop loading state after request completes
        setLoading(false)
      }
    }

    loadMovie()

  }, [id])

  // Show loading message while waiting for API response
  if (loading) return <p>Loading...</p>

  // If no movie is returned, show error message
  if (!movie) return <p>Movie not found.</p>

  // Construct full image URL using TMDB poster path
  const posterURL = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null
  const backdropURL = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null

  const watchProviders = movie['watch/providers']?.results?.US
  const cast = movie.credits?.cast || []
  const crew = movie.credits?.crew || []
  const videos = movie.videos?.results || []
  const reviews = movie.reviews?.results || []
  const recommendations = movie.recommendations?.results || []
  const similar = movie.similar?.results || []
  const keywordItems = movie.keywords?.keywords || movie.keywords?.results || []
  const releaseRows = movie.release_dates?.results || []
  const usRelease = releaseRows.find((r) => r.iso_3166_1 === 'US')
  const topCrew = crew.filter((p) => ['Director', 'Writer', 'Screenplay', 'Producer'].includes(p.job)).slice(0, 8)
  const trailers = videos.filter((v) => v.site === 'YouTube' && v.type === 'Trailer').slice(0, 3)

  function formatMoney(value) {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {backdropURL && (
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-zinc-800">
          <img src={backdropURL} alt={`${movie.title} backdrop`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-10">

        {/* Movie poster */}
        {posterURL ? (
          <img
            src={posterURL}
            alt={movie.title}
            className="w-80 rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-80 aspect-[2/3] rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
            No poster
          </div>
        )}

        {/* Movie information */}
        <div className="flex flex-col gap-4">

          {/* Movie title */}
          <h1 className="text-4xl font-bold text-text-primary">
            {movie.title}
          </h1>

          {backendMovieName && backendMovieName !== movie.title && (
            <p className="text-sm text-gray-400">
              Backend match title: {backendMovieName}
            </p>
          )}

          <div className="flex items-center gap-3 text-sm">

          {/* Release date */}
          <p className="text-gray-400">
            {movie.release_date || 'Unknown release date'}
          </p>

          {/* Rating score from TMDB */}
          <p className="text-gray-400">
            ⭐ {movie.vote_average?.toFixed ? movie.vote_average.toFixed(1) : movie.vote_average} ({movie.vote_count} votes)
          </p>

          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {(movie.genres || []).map((g) => (
              <span key={g.id} className="px-3 py-1 rounded-full text-xs border border-zinc-700 bg-zinc-900 text-zinc-200">
                {g.name}
              </span>
            ))}
          </div>

          {/* Movie plot summary */}
          <p className="text-text-primary">
            {movie.overview || 'No overview available.'}
          </p>

          {/* Quote Match */}
          {matchedLines.length > 0 && (
            <div className="mt-4 p-4 rounded-lg border border-zinc-700 bg-zinc-900/70">
              <p className="text-xs uppercase tracking-widest text-[#FDB813] mb-3">Quote Match</p>
              <div className="space-y-3">
                {matchedLines.map((line, idx) => (
                  <div key={`${line.speaker}-${idx}`}>
                    <p className="text-sm text-gray-200 italic">"{line.line}"</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {line.speaker || 'Unknown speaker'}
                      {typeof line.score === 'number' ? ` • score ${line.score.toFixed(2)}` : ''}
                    </p>
                  </div>
                ))}
              </div>
              {typeof backendScore === 'number' && (
                <p className="text-xs text-gray-500 mt-3">Overall backend score: {backendScore.toFixed(2)}</p>
              )}
            </div>
          )}

          {/* Button allowing users to add/remove movie from favorites (removed since we ended up not using it) */}
          {/*<FavoriteButton movie={movie} />*/}

          {/* Movie Info Box */}
          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-300 mt-2">
            <div>Status: <span className="text-zinc-100">{movie.status || 'N/A'}</span></div>
            <div>Runtime: <span className="text-zinc-100">{movie.runtime ? `${movie.runtime} min` : 'N/A'}</span></div>
            <div>Budget: <span className="text-zinc-100">{formatMoney(movie.budget)}</span></div>
            <div>Revenue: <span className="text-zinc-100">{formatMoney(movie.revenue)}</span></div>
            <div>Original Language: <span className="text-zinc-100">{movie.original_language || 'N/A'}</span></div>
            <div>Popularity: <span className="text-zinc-100">{movie.popularity?.toFixed ? movie.popularity.toFixed(1) : movie.popularity}</span></div>
            <div className="col-span-2">Homepage: {movie.homepage ? <a href={movie.homepage} target="_blank" rel="noreferrer" className="text-[#FDB813] underline">{movie.homepage}</a> : <span className="text-zinc-100">N/A</span>}</div>
            <div className="col-span-2">IMDb: {movie.imdb_id ? <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noreferrer" className="text-[#FDB813] underline">{movie.imdb_id}</a> : <span className="text-zinc-100">N/A</span>}</div>
          </div>

        </div>

      </div>

      <section className="grid md:grid-cols-2 gap-6">

        {/* Cast */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-lg font-semibold mb-3 text-tertiary">Top Cast</h2>
          <div className="space-y-2 text-sm">
            {cast.slice(0, 12).map((person) => (
              <div key={`${person.id}-${person.cast_id}`} className="flex justify-between gap-3">
                <span className="text-zinc-100">{person.name}</span>
                <span className="text-zinc-400">{person.character || '—'}</span>
              </div>
            ))}
            {cast.length === 0 && <p className="text-zinc-400">No cast data available.</p>}
          </div>
        </div>

        {/* Crew */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-lg font-semibold mb-3 text-tertiary">Key Crew</h2>
          <div className="space-y-2 text-sm">
            {topCrew.map((person, idx) => (
              <div key={`${person.id}-${person.job}-${idx}`} className="flex justify-between gap-3">
                <span className="text-zinc-100">{person.name}</span>
                <span className="text-zinc-400">{person.job}</span>
              </div>
            ))}
            {topCrew.length === 0 && <p className="text-zinc-400">No crew data available.</p>}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">

        {/* Release Details */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-lg font-semibold mb-3 text-tertiary">Release Details</h2>
          <div className="text-sm text-zinc-300 space-y-2">
            <p>US certification: <span className="text-zinc-100">{usRelease?.release_dates?.[0]?.certification || 'N/A'}</span></p>
            <p>Spoken languages: <span className="text-zinc-100">{(movie.spoken_languages || []).map((l) => l.english_name).join(', ') || 'N/A'}</span></p>
            <p>Production countries: <span className="text-zinc-100">{(movie.production_countries || []).map((c) => c.name).join(', ') || 'N/A'}</span></p>
            <p>Production companies: <span className="text-zinc-100">{(movie.production_companies || []).map((c) => c.name).join(', ') || 'N/A'}</span></p>
          </div>
        </div>

        {/* Where to Watch */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-lg font-semibold mb-3 text-tertiary">Watch Providers (US)</h2>
          <div className="text-sm text-zinc-300 space-y-2">
            <p>Stream: <span className="text-zinc-100">{(watchProviders?.flatrate || []).map((p) => p.provider_name).join(', ') || 'N/A'}</span></p>
            <p>Rent: <span className="text-zinc-100">{(watchProviders?.rent || []).map((p) => p.provider_name).join(', ') || 'N/A'}</span></p>
            <p>Buy: <span className="text-zinc-100">{(watchProviders?.buy || []).map((p) => p.provider_name).join(', ') || 'N/A'}</span></p>
          </div>
        </div>
      </section>

      {/* Trailers */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-lg font-semibold mb-3 text-tertiary">Trailers</h2>
        <div className="space-y-2 text-sm">
          {trailers.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.key}`}
              target="_blank"
              rel="noreferrer"
              className="block text-[#FDB813] underline"
            >
              {video.name}
            </a>
          ))}
          {trailers.length === 0 && <p className="text-zinc-400">No trailer videos available.</p>}
        </div>
      </section>

      {/* Keywords */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-lg font-semibold mb-3 text-tertiary">Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {keywordItems.slice(0, 25).map((k) => (
            <span key={k.id} className="px-2 py-1 rounded-md bg-zinc-800 text-xs text-zinc-200 border border-zinc-700">
              {k.name}
            </span>
          ))}
          {keywordItems.length === 0 && <p className="text-zinc-400 text-sm">No keywords available.</p>}
        </div>
      </section>

      {/* Recommendations */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-lg font-semibold mb-3 text-tertiary">Recommendations</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            {recommendations.slice(0, 10).map((item) => (
              <li key={item.id}>{item.title} ({item.release_date?.slice(0, 4) || 'N/A'})</li>
            ))}
            {recommendations.length === 0 && <li>No recommendations available.</li>}
          </ul>
        </div>

        {/* Similar Movies */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-lg font-semibold mb-3 text-tertiary">Similar Movies</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            {similar.slice(0, 10).map((item) => (
              <li key={item.id}>{item.title} ({item.release_date?.slice(0, 4) || 'N/A'})</li>
            ))}
            {similar.length === 0 && <li>No similar movies available.</li>}
          </ul>
        </div>
      </section>

      {/* Latest Reviews */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-lg font-semibold mb-3 text-tertiary">Latest Reviews</h2>
        <div className="space-y-4 text-sm">
          {reviews.slice(0, 5).map((review) => (
            <article key={review.id} className="border border-zinc-800 rounded-lg p-3 bg-zinc-950/60">
              <p className="text-zinc-200 font-medium mb-1">{review.author || 'Anonymous'}</p>
              <p className="text-zinc-400 line-clamp-4">{review.content || 'No review body.'}</p>
            </article>
          ))}
          {reviews.length === 0 && <p className="text-zinc-400">No reviews available.</p>}
        </div>
      </section>

    </div>
  )
}

export default MovieDetails