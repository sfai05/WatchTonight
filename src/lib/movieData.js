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
  const response = await fetch("/content/movies.json")
  if (!response.ok) {
    throw new Error("Unable to load movies data")
  }
  return response.json()
}

export async function fetchTvSeasonsData() {
  const response = await fetch("/content/tv_seasons.json")
  if (!response.ok) {
    throw new Error("Unable to load TV seasons data")
  }
  return response.json()
}

export function transformMovieData(raw) {
  const movies = raw?.movies ?? []
  return movies.map((movie) => ({
    id: movie.id,
    kind: "movie",
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

export function transformTvSeasonData(raw) {
  const seasons = raw?.seasons ?? []
  return seasons.map((season) => ({
    id: season.season_id || `${season.series_id}-s${season.season_number}`,
    kind: "tv",
    title: `${season.series_name} — Season ${season.season_number}`,
    description: season.description || season.overview,
    overview: season.overview || season.description,
    genres: season.genres || [],
    director: null,
    topActors: season.top_actors || [],
    releaseDate: season.air_date || null,
    posterPath: season.poster_path || null,
    posterUrl: getPosterUrl(season.poster_path, "w500"),
    trailerUrl: season.trailer_url || null,
    streamingUrl: getStreamingLink(season),
    rentalUrl: season?.streaming_availability?.US?.services?.rent?.[0]
      ? getStreamingLink(season)
      : null,
    streamingProviders: (() => {
      const services = season?.streaming_availability?.US?.services
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
    infoUrl: `https://www.themoviedb.org/tv/${season.series_id}/season/${season.season_number}`,
    seriesName: season.series_name,
    seasonNumber: season.season_number,
    episodeCount: season.episode_count,
    network: season.network,
    runtime: season.runtime,
    status: season.status,
    imdbRating: season?.ratings?.imdb?.rating ?? null,
  }))
}

export function getLatestGeneratedAt(...dates) {
  const parsed = dates
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
  if (!parsed.length) return ""
  return new Date(Math.max(...parsed.map((date) => date.getTime()))).toISOString()
}

export function sortByReleaseDateDesc(items) {
  return [...items].sort((a, b) => {
    const aTime = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
    const bTime = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
    return bTime - aTime
  })
}

export async function fetchAllContent() {
  const [moviesRaw, tvRaw] = await Promise.all([fetchMoviesData(), fetchTvSeasonsData()])
  const movies = transformMovieData(moviesRaw)
  const seasons = transformTvSeasonData(tvRaw)
  return {
    items: sortByReleaseDateDesc([...movies, ...seasons]),
    lastUpdated: getLatestGeneratedAt(moviesRaw?.generated_at, tvRaw?.generated_at),
  }
}
