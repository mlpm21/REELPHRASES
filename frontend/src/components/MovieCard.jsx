import { Link } from 'react-router-dom'


// movie card show the top rates on the home page
function MovieCard({ movie }) {
    return (

        <Link to={`/movie/${movie.id}`}>
            <div className="bg-zinc-900 rounded-lg overflow-hidden border border-white/5 hover:border-[#FDB813]/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FDB813]/20 transition-all cursor-pointer">

                {/* poster */}
                <div className="w-full aspect-[2/3] relative">
                    <img
                        src={
                            movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : "https://via.placeholder.com/300x450?text=No+Image"
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />

                    {/* rating badge */}
                    <div className="absolute top-2 right-2 bg-black/85 px-2 py-1 rounded flex items-center gap-1 text-xs font-medium">
                        <span className="text-[#FDB813] text-xs">★</span>
                        <span>{movie.rating}</span>
                    </div>

                </div>


                {/* movie info */}
                <div className="p-3">
                    <p className="text-sm font-medium truncate">{movie.title}</p>
                    <p className="text-xs text-gray-500">{movie.year}</p>
                </div>

            </div>
        </Link>
    )
}

export default MovieCard