import { buildMovieSlug, buildTvSlug } from "@/lib/slug"

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/"
const FETCH_TIMEOUT_MS = 10_000

async function fetchJsonWithTimeout(url, errorMessage, { signal } = {}) {
  let timeoutId = null
  let cleanup = null
  let fetchSignal = signal

  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    const timeoutSignal = AbortSignal.timeout(FETCH_TIMEOUT_MS)
    if (!signal) {
      fetchSignal = timeoutSignal
    } else if (typeof AbortSignal.any === "function") {
      fetchSignal = AbortSignal.any([signal, timeoutSignal])
    } else if (typeof AbortController !== "undefined") {
      const controller = new AbortController()
      const forwardAbort = (source) => {
        if (!controller.signal.aborted) {
          controller.abort(source.reason)
        }
      }
      if (signal.aborted) {
        forwardAbort(signal)
      } else if (timeoutSignal.aborted) {
        forwardAbort(timeoutSignal)
      } else {
        const onSignalAbort = () => forwardAbort(signal)
        const onTimeoutAbort = () => forwardAbort(timeoutSignal)
        signal.addEventListener("abort", onSignalAbort, { once: true })
        timeoutSignal.addEventListener("abort", onTimeoutAbort, { once: true })
        cleanup = () => {
          signal.removeEventListener("abort", onSignalAbort)
          timeoutSignal.removeEventListener("abort", onTimeoutAbort)
        }
      }
      fetchSignal = controller.signal
    }
  } else if (typeof AbortController !== "undefined") {
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    if (signal) {
      const onSignalAbort = () => controller.abort(signal.reason)
      if (signal.aborted) {
        onSignalAbort()
      } else {
        signal.addEventListener("abort", onSignalAbort, { once: true })
        cleanup = () => signal.removeEventListener("abort", onSignalAbort)
      }
    }
    fetchSignal = controller.signal
  }

  try {
    const response = await fetch(url, fetchSignal ? { signal: fetchSignal } : undefined)
    if (!response.ok) {
      throw new Error(errorMessage)
    }
    return await response.json()
  } finally {
    if (timeoutId !== null) clearTimeout(timeoutId)
    if (cleanup) cleanup()
  }
}

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

export function getBackdropUrl(backdropPath, size = "w1280") {
  if (!backdropPath) return null
  return `${TMDB_IMAGE_BASE}${size}${backdropPath}`
}

export function getProviderLogoUrl(logoPath, size = "w45") {
  if (!logoPath) return null
  return `${TMDB_IMAGE_BASE}${size}${logoPath}`
}

export function getStreamingLink(movie) {
  return movie?.streaming_availability?.US?.link || null
}

export async function fetchMoviesData({ signal } = {}) {
  return fetchJsonWithTimeout("/content/movies.json", "Unable to load movies data", { signal })
}

export async function fetchTvSeasonsData({ signal } = {}) {
  return fetchJsonWithTimeout("/content/tv_seasons.json", "Unable to load TV seasons data", {
    signal,
  })
}

function getRatingCount(item) {
  const total =
    (Number(item?.ratings?.imdb?.votes) || 0) + (Number(item?.ratings?.tmdb?.votes) || 0)
  return total > 0 ? total : null
}

function hasCustomDescription(rawDesc, rawOverview) {
  return Boolean(rawDesc && rawDesc.trim() && rawDesc.trim() !== (rawOverview || "").trim())
}

function mapProviders(list, seenIds) {
  const providers = []
  for (const provider of list || []) {
    if (!provider?.provider_id || seenIds.has(provider.provider_id)) continue
    seenIds.add(provider.provider_id)
    providers.push({
      id: provider.provider_id,
      name: provider.provider_name,
      logoUrl: getProviderLogoUrl(provider.logo_path),
    })
  }
  return providers
}

function buildStreamingData(item) {
  const services = item?.streaming_availability?.US?.services
  if (!services) {
    return {
      streamingBuckets: { subscription: [], rentBuy: [] },
      streamingProviders: [],
    }
  }
  const seenIds = new Set()
  const subscription = mapProviders(services.subscription, seenIds)
  const rentBuy = mapProviders([...(services.rent || []), ...(services.buy || [])], seenIds)
  return {
    streamingBuckets: { subscription, rentBuy },
    streamingProviders: [...subscription, ...rentBuy],
  }
}

export function transformMovieData(raw) {
  const movies = raw?.movies ?? []
  return movies.map((movie) => {
    const slug = buildMovieSlug(movie.title, movie.id)
    const { streamingBuckets, streamingProviders } = buildStreamingData(movie)
    return {
      id: movie.id,
      kind: "movie",
      slug,
      path: `/movie/${slug}/`,
      title: movie.title,
      description: movie.description || movie.overview,
      overview: movie.overview || movie.description,
      hasCustomDescription: hasCustomDescription(movie.description, movie.overview),
      genres: movie.genres || [],
      director: movie.director || null,
      topActors: movie.top_actors || [],
      releaseDate: movie.release_date || null,
      runtime: typeof movie.runtime === "number" && movie.runtime > 0 ? movie.runtime : null,
      posterPath: movie.poster_path || null,
      posterUrl: getPosterUrl(movie.poster_path, "w500"),
      backdropPath: movie.backdrop_path || null,
      backdropUrl: getBackdropUrl(movie.backdrop_path),
      compositeScore: movie.ratings?.composite_score ?? null,
      ratingCount: getRatingCount(movie),
      trailerUrl: movie.trailer_url || null,
      streamingUrl: getStreamingLink(movie),
      rentalUrl: movieOrSeasonRentalUrl(movie),
      streamingBuckets,
      streamingProviders,
      infoUrl: `https://www.themoviedb.org/movie/${movie.id}`,
    }
  })
}

export function transformTvSeasonData(raw) {
  const seasons = raw?.seasons ?? []
  return seasons.map((season) => {
    const id = season.season_id || `${season.series_id}-s${season.season_number}`
    const slug = buildTvSlug(season.series_name, season.season_number, id)
    const { streamingBuckets, streamingProviders } = buildStreamingData(season)
    return {
      id,
      kind: "tv",
      slug,
      path: `/tv/${slug}/`,
      title: `${season.series_name} — Season ${season.season_number}`,
      description: season.description || season.overview,
      overview: season.overview || season.description,
      hasCustomDescription: hasCustomDescription(season.description, season.overview),
      genres: season.genres || [],
      director: null,
      topActors: season.top_actors || [],
      releaseDate: season.air_date || null,
      posterPath: season.poster_path || null,
      posterUrl: getPosterUrl(season.poster_path, "w500"),
      backdropPath: season.backdrop_path || null,
      backdropUrl: getBackdropUrl(season.backdrop_path),
      compositeScore: season.ratings?.composite_score ?? null,
      ratingCount: getRatingCount(season),
      trailerUrl: season.trailer_url || null,
      streamingUrl: getStreamingLink(season),
      rentalUrl: movieOrSeasonRentalUrl(season),
      streamingBuckets,
      streamingProviders,
      infoUrl: `https://www.themoviedb.org/tv/${season.series_id}/season/${season.season_number}`,
      seriesName: season.series_name,
      seasonNumber: season.season_number,
      episodeCount: season.episode_count,
      network: season.network,
      runtime: typeof season.runtime === "number" && season.runtime > 0 ? season.runtime : null,
      status: season.status,
      imdbRating: season?.ratings?.imdb?.rating ?? null,
      tvdbId: season.tvdb_id || null,
    }
  })
}

function movieOrSeasonRentalUrl(item) {
  return item?.streaming_availability?.US?.services?.rent?.[0] ? getStreamingLink(item) : null
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
  return items.toSorted((a, b) => {
    const aTime = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
    const bTime = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
    return bTime - aTime
  })
}

export async function fetchAllContent({ signal } = {}) {
  const [moviesRaw, tvRaw] = await Promise.all([
    fetchMoviesData({ signal }),
    fetchTvSeasonsData({ signal }),
  ])
  const movies = transformMovieData(moviesRaw)
  const seasons = transformTvSeasonData(tvRaw)
  return {
    items: sortByReleaseDateDesc([...movies, ...seasons]),
    lastUpdated: getLatestGeneratedAt(moviesRaw?.generated_at, tvRaw?.generated_at),
  }
}
