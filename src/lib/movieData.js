const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/"

export function getPosterUrl(posterPath, size = "w500") {
  if (!posterPath) return null
  return `${TMDB_IMAGE_BASE}${size}${posterPath}`
}

export function getPosterSrcSet(posterPath, sizes = ["w185", "w342", "w500"]) {
  if (!posterPath) return ""
  return sizes
    .map((size) => {
      const width = Number(size.replace("w", ""))
      if (!Number.isFinite(width)) return null
      return `${getPosterUrl(posterPath, size)} ${width}w`
    })
    .filter(Boolean)
    .join(", ")
}

export function getProviderLogoUrl(logoPath, size = "w45") {
  if (!logoPath) return null
  return `${TMDB_IMAGE_BASE}${size}${logoPath}`
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
    overview: movie.overview || movie.description,
    genres: movie.genres || [],
    director: movie.director || null,
    topActors: movie.top_actors || [],
    releaseDate: movie.release_date || null,
    posterPath: movie.poster_path || null,
    posterUrl: getPosterUrl(movie.poster_path, "w500"),
    trailerUrl: movie.trailer_url || null,
    streamingUrl: getStreamingLink(movie),
    rentalUrl: movie?.streaming_availability?.US?.services?.rent?.[0]
      ? getStreamingLink(movie)
      : null,
    streamingProviders: (() => {
      const services = movie?.streaming_availability?.US?.services
      if (!services) return []
      const buckets = [services.subscription, services.rent, services.buy]
      const flattened = buckets.flatMap((list) => list || [])
      const deduped = new Map()
      flattened.forEach((provider) => {
        if (provider?.provider_id && !deduped.has(provider.provider_id)) {
          deduped.set(provider.provider_id, {
            id: provider.provider_id,
            name: provider.provider_name,
            logoUrl: getProviderLogoUrl(provider.logo_path),
          })
        }
      })
      return Array.from(deduped.values())
    })(),
    infoUrl: `https://www.themoviedb.org/movie/${movie.id}`,
  }))
}
