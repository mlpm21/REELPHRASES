import { Link } from 'react-router-dom'

function Recognition() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#FDB813] selection:text-black">
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <header className="mb-10">
          <p className="text-[#FDB813] text-xs font-bold uppercase tracking-[0.2em] mb-2">Credits</p>
          <h1 className="text-3xl md:text-5xl font-black">Recognition</h1>
          <p className="text-gray-400 mt-4 max-w-3xl leading-relaxed">
            ReelPhrases was built with support from several APIs, datasets, and frameworks.
            This page recognizes those resources.
          </p>
        </header>

        <section className="space-y-4 mb-10">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-bold mb-2">TMDB API</h2>
            <p className="text-sm text-gray-300 leading-6 mb-3">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noreferrer"
              className="text-[#FDB813] text-sm underline"
            >
              The Movie Database (TMDB)
            </a>
          </article>

          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-bold mb-2">Primary Data Source</h2>
            <p className="text-sm text-gray-300 leading-6 mb-3">
              Dialogue search data was created from screenplay text provided in a Kaggle movie scripts dataset.
            </p>
            <a
              href="https://www.kaggle.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#FDB813] text-sm underline"
            >
              Kaggle
            </a>
          </article>

          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-xl font-bold mb-2">Core Technologies</h2>
            <ul className="text-sm text-gray-300 leading-7 list-disc pl-5">
              <li>Frontend: React + Vite + Tailwind CSS</li>
              <li>Backend: FastAPI + SQLite FTS5</li>
              <li>Search Ranking: SQLite BM25</li>
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-[#FDB813]/25 bg-[#FDB813]/10 p-5 mb-10">
          <h2 className="text-lg font-bold mb-2">Team</h2>
          <p className="text-sm text-gray-200 leading-6">
            Zane Garvey, Michael Zandonella, Lapatrada Liawpairoj, and Sawyer Fedderly.
          </p>
        </section>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-sm font-bold hover:border-[#FDB813] hover:text-[#FDB813] transition-colors"
        >
          ← Back to Home
        </Link>
      </main>
    </div>
  )
}

export default Recognition