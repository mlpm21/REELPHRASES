import { useState, useEffect } from "react"

function FavoriteButton({ movie }) {
  // Track whether the movie is currently in the user's favorites
  const [favorited, setFavorited] = useState(false)

  // Check localStorage when the component loads
  useEffect(() => {
    // Retrieve saved favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem("favorites")) || []

    // Determine if this movie is already saved
    setFavorited(favorites.some(f => f.id === movie.id))
  }, [movie])

  function toggleFavorite() {
    // Retrieve current favorites list
    let favorites = JSON.parse(localStorage.getItem("favorites")) || []

    if (favorited) {
      // Remove movie from favorites
      favorites = favorites.filter(f => f.id !== movie.id)

    } else {
      // Add movie to favorites
      favorites.push(movie)
    }

    // Save updated list back to localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites))

    // Update button state
    setFavorited(!favorited)
  }

  return (
    <button
      onClick={toggleFavorite}
      className="px-4 py-2 bg-blue-500 rounded text-white"
    >
      {favorited ? "Remove Favorite" : "Add to Favorites"}
    </button>
  )
}

export default FavoriteButton