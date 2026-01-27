const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/"

export function getPosterUrl(posterPath, size = "w500") {
  if (!posterPath) return null
  return `${TMDB_IMAGE_BASE}${size}${posterPath}`
}

export function getStreamingLink(movie) {
  return movie?.streaming_availability?.US?.link || null
}

export async function fetchMoviesData() {
  const response = await fetch("/data/movies.json")
  if (!response.ok) {
    throw new Error("Unable to load movies data")
  }
  return response.json()
}

export function transformMovieData(raw) {
  const movies = raw?.movies ?? []
  return movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    description: movie.description || movie.overview,
    posterUrl: getPosterUrl(movie.poster_path, "w500"),
    trailerUrl: movie.trailer_url || null,
    streamingUrl: getStreamingLink(movie),
    rentalUrl: movie?.streaming_availability?.US?.services?.rent?.[0]
      ? getStreamingLink(movie)
      : null,
    infoUrl: `https://www.themoviedb.org/movie/${movie.id}`,
  }))
}
