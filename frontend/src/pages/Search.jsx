import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


function Search() {
  const navigate = useNavigate()

  const [quote, setQuote] = useState('')
  const [genre, setGenre] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [sortBy, setSortBy] = useState('relevance')

  // can add more 
  const exampleQuotes = [
    "There is no spoon",
    "Throw me the idol, I throw you the whip!",
    "Chicken isn't vegan?",
    "Maximum effort"
  ]


  const handleSearch = (e) => {
    e.preventDefault()
    navigate('/results', {
      state: { quote, genre, yearFrom, yearTo, sortBy }
    })
  }


  const handleExampleClick = (text) => {
    setQuote(text)
  }


  const handleClearFilters = () => {
    setQuote('')
    setGenre('')
    setYearFrom('')
    setYearTo('')
    setSortBy('relevance')
  }


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#FDB813] selection:text-black">
      {/* background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FDB813]/10 blur-[120px] pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-6 py-10 md:py-16">

        {/* header section */}
        <header className="mb-10 text-center md:text-left">

          <h2 className="text-3xl md:text-5xl font-black mb-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Quote Search
          </h2>

          <p className="text-gray-400 text-base max-w-2xl leading-relaxed">
            Cinematic moments. Enter a fragment of dialogue, a character's vibe, or a famous one-liner to begin your search.
          </p>

        </header>


        <form onSubmit={handleSearch} className="space-y-6">
          {/* main input area */}
          <div className="relative group">
            <label className="block text-[#FDB813] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <span>✨</span> The Quote
            </label>

            <textarea
              required
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Type a movie quote here... (e.g. 'I am Groot')"
              className="w-full h-40 md:h-52 bg-[#161616] border-2 border-white/5 rounded-2xl p-5 text-lg md:text-xl focus:outline-none focus:border-[#FDB813] transition-all duration-300 resize-none placeholder:text-white/10 group-hover:border-white/10"
            />
          </div>


          {/* example */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-1">Try these:</span>

            {exampleQuotes.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleExampleClick(q)}
                className="px-3.5 py-1.5 rounded-full border border-white/10 text-sm bg-white/5 hover:bg-[#FDB813] hover:text-black hover:border-[#FDB813] transition-all duration-200"
              >
                {q}
              </button>

            ))}
          </div>


          {/* filter section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 bg-[#111111] rounded-2xl border border-white/5">

            {/* genre - dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <span>🎭</span> Genre
              </label>

              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FDB813] appearance-none cursor-pointer"
              >
                <option value="">All Genres</option>
                <option value="action">Action</option>
                <option value="drama">Drama</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="comedy">Comedy</option>
                <option value="horror">Horror</option>
              </select>
            </div>


            {/* year range */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <span>📅</span> Year Range
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="From"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FDB813]"
                />

                <span className="text-gray-600">-</span>
                <input
                  type="number"
                  placeholder="To"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FDB813]"
                />

              </div>
            </div>


            {/* sort by */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <span>↓</span> Sort Results
              </label>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#FDB813] appearance-none cursor-pointer"
              >
                <option value="relevance">By Relevance</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popularity">Popularity</option>
              </select>

            </div>
          </div>


          {/* action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="sm:order-1 px-5 py-2 bg-transparent border border-white/15 text-gray-400 text-sm rounded-full hover:text-white hover:border-white/30 transition-all"
            >
              Clear filters
            </button>

            <button
              type="submit"
              className="sm:order-2 group relative inline-flex items-center justify-center gap-2 bg-[#FDB813] text-black font-bold px-8 py-3 rounded-full overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(253,184,19,0.3)]"
            >
              <span className="relative z-10 text-sm">FIND MOVIE</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform">🔍</span>


              {/* add effect */}
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[100%] transition-all duration-700" />
            </button>

          </div>
        </form>


        {/* divider */}
        <div className="my-10 border-t border-white/10" />


        {/* search tip section */}
        <div className="space-y-5">
          <div className="mb-6">
            <span className="text-[#FDB813] text-xs font-bold uppercase tracking-[0.18em]">Search Smarter</span>
            <h3 className="text-2xl md:text-3xl font-bold mt-2.5">Shape the search before the reveal</h3>
          </div>

          <div className="space-y-3.5">
            {/* tip 1 */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:border-[#FDB813]/30 hover:bg-white/[0.05]">
              <h4 className="text-sm font-semibold mb-1.5">Use partial lines</h4>
              <p className="text-sm leading-6 text-white/60">
                Don't stress if you forgot the whole quote. Even a few words or a rough version can point you in the right direction.
              </p>
            </div>

            {/* tip 2 */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:border-[#FDB813]/30 hover:bg-white/[0.05]">
              <h4 className="text-sm font-semibold mb-1.5">Filter by movie era</h4>
              <p className="text-sm leading-6 text-white/60">
                Narrowing the year range helps when a phrase appears across remakes, sequels, or popular references.
              </p>
            </div>

            {/* tip 3 */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:border-[#FDB813]/30 hover:bg-white/[0.05]">
              <h4 className="text-sm font-semibold mb-1.5">Match the tone</h4>
              <p className="text-sm leading-6 text-white/60">
                Adding genre can cut through noise fast. A dramatic one-liner lands very differently from a sci-fi catchphrase.
              </p>
            </div>

            {/* special tip - yellow card */}
            <div className="rounded-xl border border-[#FDB813]/20 bg-[#FDB813]/8 p-4">
              <p className="text-sm leading-6 text-white/75">
                Think of this page like a quote lab: sketch the line, tune the filters, then jump into results with way better odds.
              </p>
            </div>
          </div>
        </div>

      </main>


      {/*  "Search" Watermark  */}
      <footer className="fixed bottom-8 right-8 pointer-events-none opacity-20 hidden md:block">
        <p className="text-8xl font-black text-white/5 select-none">SEARCH</p>
      </footer>
    </div>
  )
}

export default Search