import { Link } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import { useEffect, useState } from "react"
import { getTopRatedMovies, getTrendingMovies } from "../services/tmdb"


function Home() {

    // Store top rated movies
    const [topRatedMovies, setTopRatedMovies] = useState([])

    // Store trending movies
    const [trendingMovie, setTrendingMovie] = useState(null)


    // Fetch from TMDB when page loads
    useEffect(() => {
        async function loadMovies() {
            try {
                // --- Top Rated ---
                const data = await getTopRatedMovies()

                // format for MovieCard
                const formatted = data.results.slice(0, 5).map(movie => ({
                    id: movie.id,
                    title: movie.title,
                    year: movie.release_date?.split("-")[0],
                    rating: movie.vote_average,
                    poster_path: movie.poster_path
                }))

                setTopRatedMovies(formatted)

                // --- Trending ---
                const trendingData = await getTrendingMovies()
                
                // Guard against bad/empty data
                if (trendingData?.results?.length > 0) {
                    const firstTrending = trendingData.results[0]

                    setTrendingMovie({
                        id: firstTrending.id,
                        title: firstTrending.title,
                        year: firstTrending.release_date?.split("-")[0],
                        rating: firstTrending.vote_average,
                        backdrop: firstTrending.backdrop_path
                    })
                } else {
                    console.warn("No trending movies returned")
                }

            } catch (err) {
                console.error("Failed to load movies:", err)
            }
        }

        loadMovies()
    }, [])


    return (
        <div className="bg-[#0a0a0a] text-white min-h-screen relative selection:bg-[#FDB813] selection:text-black">

            {/* hero Section with vertical top-to-bottom glow */}
            <section className="relative px-6 py-16 md:py-24 text-center overflow-hidden">

                {/* vertical gradient fade - top to bottom */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FDB813]/20 from-5% via-[#FDB813]/10 via-40% to-transparent to-90% pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                        ReelPhrases
                    </h1>

                    <p className="text-base md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                        Movie quotes, TV lines, found fast.
                    </p>

                    <Link to="/search">
                        <button className="bg-[#FDB813] text-black px-7 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(253,184,19,0.3)]">
                            Search
                        </button>
                    </Link>

                </div>
            </section>

            {/* more spacing */}
            <div className="h-8 md:h-12" />


            {/* Top Rated Movies Section */}
            <section className="px-6 py-8 md:py-12">

                {/* Section Header */}
                <div className="flex justify-between items-center mb-5 md:mb-6 max-w-7xl mx-auto">

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#FDB813] rounded-full"></div>

                        <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest">
                            Top Rated Movies
                        </h2>
                    </div>
                </div>


                {/* movie cards grid - 5 cards max for bigger size */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 max-w-7xl mx-auto">
                    {topRatedMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            </section>


            {/* Trending Section */}
            <section className="px-6 py-8 md:py-12">

                {/* Section Header */}
                <div className="flex items-center gap-2 mb-5 md:mb-6 max-w-7xl mx-auto">
                    <div className="w-2 h-2 bg-[#FDB813] rounded-full"></div>

                    <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest">
                        Trending Now
                    </h2>
                </div>


                {/* trending hero */}
                {trendingMovie && (
                    <Link to={`/movie/${trendingMovie.id}`}>

                        {/* Trending movie poster */}
                        <div
                            className="max-w-7xl mx-auto h-72 md:h-[400px] rounded-xl flex items-end p-5 md:p-8 cursor-pointer hover:scale-[1.01] transition-transform bg-cover bg-center"
                            style={{
                                backgroundImage: trendingMovie.backdrop
                                    ? `url(https://image.tmdb.org/t/p/original${trendingMovie.backdrop})`
                                    : undefined
                            }}
                        >
                            <div className="max-w-xl">

                                <div className="inline-block bg-[#FDB813]/20 text-[#FDB813] border border-[#FDB813]/40 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide mb-2 md:mb-3">
                                    Trending
                                </div>

                                <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 leading-tight">
                                    {trendingMovie.title}
                                </h2>

                                <div className="flex gap-3 md:gap-5 text-xs md:text-sm text-gray-400">
                                    {/* Release year */}
                                    <span>{trendingMovie.year}</span>

                                    {/* Star rating */}
                                    <span>★ {trendingMovie.rating.toFixed(1)}</span>
                                </div>

                            </div>
                        </div>
                    </Link>
                )}
            </section>


            {/* footer */}
            <footer className="bg-black border-t border-white/10 px-6 py-6 text-center">
                <div className="max-w-7xl mx-auto">
                    <p className="text-sm text-gray-400 mb-1.5">
                        © ReelPhrases 2026
                    </p>

                    <p className="text-xs text-gray-600 mb-1.5">
                        CS 494 Final Project • Powered by TMDB
                    </p>

                    <p className="text-xs text-gray-600">
                        Zane Garvey • Michael Zandonella • Lapatrada Liawpairoj • Sawyer Fedderly
                    </p>

                </div>
            </footer>

            {/* "HOME" watermark */}
            <div className="fixed bottom-8 right-8 pointer-events-none opacity-20 hidden md:block">
                <p className="text-8xl font-black text-white/5 select-none">HOME</p>
            </div>

        </div>
    )
}

export default Home