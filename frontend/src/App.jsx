import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import Results from './pages/Results'
import MovieDetails from './pages/MovieDetails'
import Recognition from './pages/Recognition'


function App() {
  return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/results" element={<Results />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/recognition" element={<Recognition />} />
        </Route>
      </Routes>
  )
}

export default App