import { Link } from 'react-router-dom'


function ResultCard({ result, index }) {
    const canOpenDetails = Boolean(result.tmdb_id)
    const scoreText = typeof result.score === 'number' ? result.score.toFixed(2) : 'N/A'
    const posterUrl = result.poster_path
        ? `https://image.tmdb.org/t/p/w342${result.poster_path}`
        : null

    const cardBody = (
        <div className={`group bg-[#121212] border border-white/10 rounded-xl p-5 hover:border-[#FDB813]/50 hover:shadow-[0_0_30px_rgba(253,184,19,0.1)] hover:-translate-y-1 transition-all duration-300 ${canOpenDetails ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>

            <div className="flex gap-5">

                {/* ranking badge */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FDB813]/20 to-[#FDB813]/5 border border-[#FDB813]/40 rounded-xl flex items-center justify-center">
                    <span className="text-[#FDB813] font-black text-xl">#{index + 1}</span>
                </div>

                {/* movie poster */}
                <div className="flex-shrink-0 w-32 md:w-36 aspect-[2/3] bg-gradient-to-br from-[#222] to-[#101010] rounded-xl flex items-center justify-center overflow-hidden relative">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={result.title || result.movie_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-5xl opacity-30">🎬</span>
                    )}

                    {/* relevance badge */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/20">
                        <span className="text-[#FDB813] font-black text-sm">{scoreText}</span>
                    </div>
                </div>


                {/* movie info */}
                <div className="flex-1 min-w-0">

                    {/* title and rating */}
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-[#FDB813] transition-colors">
                        {result.title || result.movie_name}
                    </h3>

                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                        <span>{result.year ? result.year : 'N/A'}</span>

                        <span className="flex items-center gap-1">
                            <span className="text-[#FDB813]">⭐</span>
                            {result.rating ? result.rating.toFixed(1) : 'N/A'}
                        </span>
                    </div>


                    {/* quote */}
                    <div className="relative mb-5">
                        <p className="text-sm md:text-base text-gray-400 italic leading-relaxed pl-4 border-l-2 border-[#FDB813]/40">
                            {result.matched_lines[0]?.line || 'N/A'}
                        </p>
                    </div>


                    {/* view detail button */}
                    <button
                        className="px-5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-[#FDB813] hover:text-black hover:border-[#FDB813] transition-all"
                        disabled={!canOpenDetails}
                    >
                        {canOpenDetails ? 'VIEW SCENE DETAILS →' : 'TMDB MATCH UNAVAILABLE'}
                    </button>

                </div>
            </div>

        </div>
    )

    if (!canOpenDetails) {
        return cardBody
    }

    return (
        <Link
            to={`/movie/${result.tmdb_id}`}
            state={{
                matchedLines: result.matched_lines,
                backendMovieName: result.movie_name,
                backendScore: result.score
            }}
        >
            {cardBody}
        </Link>
    )
}

export default ResultCard