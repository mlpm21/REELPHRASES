import { useParams, Link } from 'react-router-dom'


function MovieDetail() {
    const { id } = useParams()

    // placeholder data - replace with API data later
    const movie = {
        id: id,
        title: "The Matrix",
        year: 1999,
        rating: 8.7,
        mpaaRating: "R",
        runtime: "2h 16m",
        poster: null,
        synopsis: "A disillusioned programmer discovers that the world he knows may be an elaborate illusion controlled by unseen forces. Pulled into a hidden rebellion, he begins to question reality, identity, and whether destiny can be rewritten.",
        genres: ["Sci-Fi", "Action", "Cyberpunk", "Thriller"],
        criticScore: 88,
        audienceScore: 85,
        cast: [
            { id: 1, name: "Keanu Reeves", role: "Neo" },
            { id: 2, name: "Laurence Fishburne", role: "Morpheus" },
            { id: 3, name: "Carrie-Anne Moss", role: "Trinity" },
            { id: 4, name: "Hugo Weaving", role: "Agent Smith" }
        ],
        matchingQuote: "I know kung fu.",
        quotes: [
            "Welcome to the real world.",
            "Free your mind."
        ],
        trailerUrl: null
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#FDB813] selection:text-black pb-20">

            {/* top bar */}
            <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">

                    <Link to="/results">
                        <button className="text-sm font-bold text-[#FDB813] hover:text-white transition-colors flex items-center gap-2">
                            ← BACK TO RESULTS
                        </button>
                    </Link>

                    <div className="text-xs tracking-widest font-black uppercase border-l border-white/20 pl-4">
                        ReelPhrases
                    </div>

                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">

                {/* floating poster */}
                <div className="float-left w-56 md:w-64 mr-8 mb-6">
                    <div className="aspect-[2/3] bg-gradient-to-br from-green-900/40 to-black rounded-2xl overflow-hidden relative group sticky top-24 border border-white/10">

                        {/* poster label */}
                        <div className="absolute top-3 left-3 z-10">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                🎬 Poster
                            </span>
                        </div>

                        {/* poster placeholder */}
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
                            🖼️
                        </div>

                        {/* bottom overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                            <p className="text-[10px] font-bold text-[#FDB813] uppercase tracking-wider mb-1">ReelPhrases Select</p>
                            <p className="text-sm font-bold leading-tight">{movie.title}</p>
                            <p className="text-xs text-gray-400">{movie.year} • Reality breaks here</p>
                        </div>
                    </div>
                </div>


                {/* content around the poster */}
                {/* Movie Detail Header */}
                <div className="mb-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Movie Detail • ID {id}</p>
                </div>


                {/* title */}
                <div className="mb-6">
                    <h1 className="text-4xl md:text-5xl font-black mb-3">
                        {movie.title}
                    </h1>

                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{movie.year}</span>
                        <span>•</span>

                        <span className="flex items-center gap-1">
                            <span className="text-[#FDB813]">⭐</span>
                            {movie.rating}
                        </span>

                        <span>•</span>
                        <span>{movie.runtime}</span>

                    </div>
                </div>


                {/* synopsis */}
                <div className="mb-6">
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                        {movie.synopsis}
                    </p>
                </div>


                {/* genre tags */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        {movie.genres.map((genre, i) => (
                            <button
                                key={i}
                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium hover:bg-[#FDB813] hover:text-black hover:border-[#FDB813] transition-all"
                            >
                                #{genre}
                            </button>
                        ))}
                    </div>
                </div>


                {/* scoreboard */}
                <div className="mb-10">
                    <div className="grid grid-cols-2 gap-4 max-w-lg">

                        {/* Critics Score */}
                        <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🎭</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Critics Score</span>
                            </div>

                            <div className="text-3xl font-black mb-3">{movie.criticScore}%</div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">

                                <div
                                    className="h-full bg-[#FDB813] rounded-full"
                                    style={{ width: `${movie.criticScore}%` }}
                                ></div>

                            </div>
                        </div>


                        {/* audience score */}
                        <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🍿</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Audience Score</span>
                            </div>

                            <div className="text-3xl font-black mb-3">{movie.audienceScore}%</div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">

                                <div
                                    className="h-full bg-[#FDB813] rounded-full"
                                    style={{ width: `${movie.audienceScore}%` }}
                                ></div>

                            </div>
                        </div>
                    </div>
                </div>


                {/* clear float before cast */}
                <div className="clear-both"></div>


                {/* cast */}
                <div className="mb-12 mt-12">
                    <h2 className="text-sm font-bold text-[#FDB813] uppercase tracking-wider mb-6">Cast</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                        {movie.cast.map((actor) => (
                            <Link key={actor.id} to={`/actor/${actor.id}`}>

                                <div className="group text-center cursor-pointer">
                                    {/* Purple circle avatar */}
                                    <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-900/60 to-purple-950/60 border-2 border-purple-800/40 flex items-center justify-center overflow-hidden group-hover:border-[#FDB813] group-hover:scale-110 transition-all">
                                        <span className="text-3xl opacity-60">👤</span>
                                    </div>

                                    <p className="text-sm font-medium group-hover:text-[#FDB813] transition-colors">{actor.name}</p>
                                    <p className="text-xs text-gray-500">{actor.role}</p>

                                </div>

                            </Link>
                        ))}

                    </div>
                </div>


                {/* two column layout -- quotes on the left, trailer video on the right */}
                {/* trailer video -- also depend on the API tho */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* left column -uotes */}
                    <div>
                        {/* user's quotes match */}
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-[#FDB813] uppercase tracking-wider mb-4">Your Match</h2>

                            <div className="bg-gradient-to-br from-[#FDB813]/15 to-[#FDB813]/5 border border-[#FDB813]/30 rounded-xl p-5">
                                <p className="text-base italic text-gray-200 leading-relaxed">
                                    "{movie.matchingQuote}"
                                </p>
                            </div>

                        </div>


                        {/* more quotes */}
                        <div>
                            <h2 className="text-sm font-bold text-[#FDB813] uppercase tracking-wider mb-4">More Quotes</h2>
                            <div className="space-y-3 mb-4">

                                {movie.quotes.map((quote, i) => (
                                    <div key={i} className="bg-[#111111] border border-white/10 rounded-xl p-4">
                                        <p className="text-sm italic text-gray-300 leading-relaxed">
                                            "{quote}"
                                        </p>
                                    </div>
                                ))}

                            </div>

                            <button className="w-full py-2 bg-transparent border border-white/10 rounded-lg text-xs font-bold tracking-wider uppercase text-gray-400 hover:bg-[#FDB813] hover:text-black hover:border-[#FDB813] transition-all">
                                More Quotes (3+ more quotes)
                            </button>

                        </div>
                    </div>


                    {/* right column - trailer */}
                    <div>
                        <h2 className="text-sm font-bold text-[#FDB813] uppercase tracking-wider mb-4">Trailer</h2>

                        <div className="aspect-video bg-[#111111] border border-white/10 rounded-xl flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-[#FDB813]/20 border-2 border-[#FDB813] flex items-center justify-center mb-3 hover:scale-110 transition-transform cursor-pointer">
                                <span className="text-[#FDB813] text-2xl">▶️</span>
                            </div>

                            <p className="text-sm text-gray-400">Trailer placeholder</p>
                            <p className="text-xs text-gray-600 mt-1">YouTube embed goes here later</p>
                        </div>

                    </div>
                </div>

            </main>

            {/* "MOVIET" watermark  */}
            <footer className="fixed bottom-8 right-8 pointer-events-none opacity-20 hidden md:block">
                <p className="text-8xl font-black text-white/5 select-none">MOVIE</p>
            </footer>

        </div>
    )
}

export default MovieDetail