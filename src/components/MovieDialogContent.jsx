import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { IconPlay } from "@/components/icons"
import { DialogContent, DialogTitle } from "@/components/ui/dialog"

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function formatRuntime(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null
  const total = Math.round(minutes)
  const hours = Math.floor(total / 60)
  const mins = total % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function StreamingProviderGroup({ label, providers, streamingUrl, title }) {
  if (!providers.length) return null

  return (
    <div>
      <p className="mb-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand-text-soft">
        {label}
      </p>
      <div className="flex flex-col gap-1.5">
        {providers.map((provider) => {
          const content = (
            <>
              {provider.logoUrl && (
                <img
                  src={provider.logoUrl}
                  alt=""
                  aria-hidden="true"
                  width="20"
                  height="20"
                  className="h-5 w-5 shrink-0 rounded"
                />
              )}
              <span className="truncate">{provider.name}</span>
              {streamingUrl && (
                <span
                  aria-hidden="true"
                  className="ml-auto pl-2 text-brand-text-soft transition-colors group-hover:text-brand-gold"
                >
                  ↗
                </span>
              )}
            </>
          )

          if (streamingUrl) {
            return (
              <a
                key={provider.id}
                href={streamingUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${provider.name} — view where to watch ${title}`}
                data-umami-event="Open streaming link"
                data-umami-event-provider={provider.name}
                data-umami-event-title={title}
                className="group flex min-h-[40px] items-center gap-2 rounded-xl border border-[#e4d8ab]/12 bg-[rgba(228,216,171,0.04)] px-3 py-2 text-xs text-brand-cream-light/90 transition hover:border-[#d68e25]/40 hover:bg-[rgba(214,142,37,0.12)] hover:text-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {content}
              </a>
            )
          }

          return (
            <div
              key={provider.id}
              className="flex min-h-[40px] items-center gap-2 rounded-xl border border-[#e4d8ab]/8 bg-[rgba(228,216,171,0.04)] px-3 py-2 text-xs text-brand-cream-light/85"
            >
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MovieDialogContent({
  movie,
  trailerEmbedUrl,
  dialogPosterSrcSet,
  radarrUrl,
  sonarrUrl,
  onOpenSettings,
}) {
  const [isPosterLoaded, setIsPosterLoaded] = useState(false)
  const [trailerMovieId, setTrailerMovieId] = useState(null)
  const showTrailer = trailerMovieId === movie.id

  const hasRadarr = Boolean(radarrUrl) && movie?.kind !== "tv"
  const radarrLink = hasRadarr
    ? `${radarrUrl}/add/new?term=${encodeURIComponent(`tmdb:${movie.id}`)}`
    : null
  const hasSonarr = Boolean(sonarrUrl) && movie?.kind === "tv" && movie?.tvdbId
  const sonarrLink = hasSonarr
    ? `${sonarrUrl}/add/new?term=${encodeURIComponent(`tvdb:${movie.tvdbId}`)}`
    : null
  const traktLink =
    movie?.kind === "tv"
      ? `https://trakt.tv/search?query=${encodeURIComponent(movie.seriesName || movie.title)}&type=show`
      : `https://trakt.tv/search?query=${encodeURIComponent(movie.title)}&type=movie`

  const score =
    movie.compositeScore != null ? (movie.compositeScore / 10).toFixed(1) : null
  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null
  const formattedRuntime = formatRuntime(movie.runtime)
  const heroBg = movie.backdropUrl || movie.posterUrl

  const showCustomDescription =
    movie.hasCustomDescription ??
    (Boolean(movie.description) && movie.description !== movie.overview)

  const subscriptionProviders =
    movie.streamingBuckets?.subscription ?? movie.streamingProviders ?? []
  const rentBuyProviders = movie.streamingBuckets?.rentBuy ?? []
  const hasStreaming = subscriptionProviders.length > 0 || rentBuyProviders.length > 0

  const metaParts = [
    movie.kind === "tv" && movie.seasonNumber ? `Season ${movie.seasonNumber}` : null,
    movie.kind === "tv" && movie.episodeCount ? `${movie.episodeCount} ep` : null,
    formattedRuntime,
    movie.genres?.length > 0 ? movie.genres.slice(0, 2).join(" · ") : null,
  ].filter(Boolean)

  return (
    <DialogContent className="left-0 top-0 h-[100dvh] w-[100dvw] max-w-none translate-x-0 translate-y-0 rounded-none border-[#e4d8ab]/10 bg-[#0E1A18] p-0 text-brand-cream overflow-hidden sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[88vh] sm:w-[90vw] sm:max-w-4xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[1.75rem] [&>button]:text-brand-text-soft [&>button]:hover:text-brand-cream">
      <div className="grid h-full sm:grid-cols-[2fr_3fr] overflow-hidden">

        {/* ── Left: atmospheric poster panel ── */}
        <div className="relative hidden sm:flex sm:items-center sm:justify-center overflow-hidden">
          {heroBg && (
            <>
              <div
                className="absolute inset-0 scale-110 blur-2xl"
                style={{
                  backgroundImage: `url(${heroBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.55,
                }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-[rgba(10,20,18,0.38)]" aria-hidden="true" />
              <div className="absolute inset-0 brand-halftone opacity-15" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0E1A18]/68" aria-hidden="true" />
            </>
          )}

          {/* Poster */}
          <div className="relative z-10 w-full p-8">
            {movie.posterUrl ? (
              <div className="relative mx-auto">
                {!isPosterLoaded && (
                  <Skeleton className="absolute inset-0 aspect-[2/3] w-full rounded bg-white/10" />
                )}
                <img
                  src={movie.posterUrl}
                  srcSet={dialogPosterSrcSet || undefined}
                  sizes="(min-width: 768px) 35vw, 80vw"
                  alt={`${movie.title} poster`}
                  width="500"
                  height="750"
                  className={`w-full rounded object-cover shadow-2xl transition-opacity ${
                    isPosterLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  decoding="async"
                  onLoad={() => setIsPosterLoaded(true)}
                  onError={() => setIsPosterLoaded(true)}
                />
              </div>
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded bg-white/10 text-white/40 text-sm">
                No poster
              </div>
            )}
          </div>
        </div>

        {/* ── Right: content panel ── */}
        <div className="flex flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
          {/* Mobile: full-bleed poster panel */}
          <div className="relative sm:hidden" style={{ height: "55vw", minHeight: "220px", maxHeight: "340px" }}>
            {heroBg && (
              <div
                className="absolute inset-0 scale-110 blur-xl opacity-60"
                style={{
                  backgroundImage: `url(${heroBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-hidden="true"
              />
            )}
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            <div className="absolute inset-0 bg-[rgba(10,20,18,0.22)]" aria-hidden="true" />
            <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0E1A18] to-transparent" aria-hidden="true" />
            {movie.posterUrl && (
              <img
                src={movie.posterUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 m-auto h-full w-auto object-contain py-2 shadow-2xl"
              />
            )}
          </div>

          {/* Main text content */}
          <div className="flex flex-1 flex-col gap-5 p-5 sm:p-7">

            {/* Title block */}
            <div>
              <p className="mb-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-brand-gold/80">
                {[
                  releaseYear,
                  movie.kind === "tv" && movie.network ? movie.network : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <DialogTitle asChild>
                <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.04em] text-brand-cream sm:text-3xl">
                  {movie.title}
                </h2>
              </DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-text-soft">
                {metaParts.length > 0 && <span>{metaParts.join(" · ")}</span>}
                {score && (
                  <span className="flex items-center gap-1 font-semibold text-brand-gold">
                    <StarIcon />
                    <span className="sr-only">Rating: {score} out of 10</span>
                    <span aria-hidden="true">{score}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Synopsis + Streaming */}
            <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
              {/* Synopsis */}
              <div className="min-w-0">
                <h3 className="brand-kicker mb-2 text-brand-gold/70">
                  Synopsis
                </h3>
                <p className="text-sm leading-relaxed text-brand-cream-light/85">
                  {movie.overview || movie.description}
                </p>
                {showCustomDescription && (
                  <p className="mt-2.5 text-xs italic leading-relaxed text-brand-text-soft">
                    &ldquo;{movie.description}&rdquo;
                  </p>
                )}
              </div>

              {/* Where to stream */}
              {hasStreaming && (
                <div className="shrink-0 sm:min-w-[170px]">
                  <h3 className="brand-kicker mb-2 text-brand-gold/70">
                    Where to Stream
                  </h3>
                  <div className="flex flex-col gap-3">
                    <StreamingProviderGroup
                      label="Stream"
                      providers={subscriptionProviders}
                      streamingUrl={movie.streamingUrl}
                      title={movie.title}
                    />
                    <StreamingProviderGroup
                      label="Rent / Buy"
                      providers={rentBuyProviders}
                      streamingUrl={movie.streamingUrl}
                      title={movie.title}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Director */}
            {movie.director && (
              <div>
                <h3 className="brand-kicker mb-2 text-brand-gold/70">
                  Director
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-[#d68e25]/20 bg-[rgba(214,142,37,0.1)] px-3 py-1 text-xs text-brand-cream-light">
                    {movie.director}
                  </span>
                </div>
              </div>
            )}

            {/* Cast */}
            {movie.topActors?.length > 0 && (
              <div>
                <h3 className="brand-kicker mb-2 text-brand-gold/70">
                  Cast
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {movie.topActors.map((actor) => (
                    <span
                      key={actor}
                      className="rounded-full border border-[#e4d8ab]/8 bg-[rgba(228,216,171,0.04)] px-3 py-1 text-xs text-brand-cream-light/80"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Watchlist */}
            <div>
              <h3 className="brand-kicker mb-2 text-brand-gold/70">
                Add to Watchlist
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <a
                  href={traktLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Add ${movie.title} to Trakt watchlist`}
                  data-umami-event="Open Trakt"
                  data-umami-event-title={movie.title}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#e4d8ab]/14 bg-[rgba(228,216,171,0.04)] px-4 py-3 text-xs text-brand-cream-light/80 transition hover:bg-[rgba(214,142,37,0.16)] hover:text-brand-cream hover:scale-[1.03] active:scale-[0.97]"
                >
                  <img src="/icons/trakt.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
                  Trakt
                </a>

                {movie.kind !== "tv" &&
                  (radarrLink ? (
                    <a
                      href={radarrLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Add ${movie.title} to Radarr download queue`}
                      data-umami-event="Open Radarr"
                      data-umami-event-title={movie.title}
                      className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#e4d8ab]/14 bg-[rgba(228,216,171,0.04)] px-4 py-3 text-xs text-brand-cream-light/80 transition hover:bg-[rgba(214,142,37,0.16)] hover:text-brand-cream hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <img src="/icons/radarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
                      Radarr
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenSettings?.()}
                      aria-label="Connect Radarr in Settings"
                      className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-dashed border-[#e4d8ab]/20 bg-[rgba(228,216,171,0.02)] px-4 py-3 text-xs text-brand-text-soft transition hover:border-[#d68e25]/40 hover:bg-[rgba(214,142,37,0.08)] hover:text-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <img src="/icons/radarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5 opacity-60" />
                      Connect Radarr
                    </button>
                  ))}

                {movie.kind === "tv" &&
                  (sonarrLink ? (
                    <a
                      href={sonarrLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Add ${movie.title} to Sonarr download queue`}
                      data-umami-event="Open Sonarr"
                      data-umami-event-title={movie.title}
                      className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#e4d8ab]/14 bg-[rgba(228,216,171,0.04)] px-4 py-3 text-xs text-brand-cream-light/80 transition hover:bg-[rgba(214,142,37,0.16)] hover:text-brand-cream hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <img src="/icons/sonarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
                      Sonarr
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenSettings?.()}
                      aria-label="Connect Sonarr in Settings"
                      className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-dashed border-[#e4d8ab]/20 bg-[rgba(228,216,171,0.02)] px-4 py-3 text-xs text-brand-text-soft transition hover:border-[#d68e25]/40 hover:bg-[rgba(214,142,37,0.08)] hover:text-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <img src="/icons/sonarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5 opacity-60" />
                      Connect Sonarr
                    </button>
                  ))}
              </div>
            </div>

            {/* Inline Watch Trailer toggle + player */}
            {trailerEmbedUrl && (
              <div className="mt-auto border-t border-[#e4d8ab]/8 pt-4">
                <Button
                  type="button"
                  variant={showTrailer ? "outline" : "default"}
                  aria-expanded={showTrailer}
                  onClick={() =>
                    setTrailerMovieId((prev) => (prev === movie.id ? null : movie.id))
                  }
                  className="gap-2"
                  data-umami-event="Watch trailer"
                  data-umami-event-title={movie.title}
                  data-umami-event-kind={movie.kind || "movie"}
                >
                  <IconPlay className="h-4 w-4" />
                  {showTrailer ? "Hide Trailer" : "Watch Trailer"}
                </Button>

                {showTrailer && (
                  <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-[#e4d8ab]/10 bg-black">
                    <iframe
                      src={trailerEmbedUrl}
                      title={`${movie.title} trailer`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
