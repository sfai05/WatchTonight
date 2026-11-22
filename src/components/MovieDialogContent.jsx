import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { IconPlay } from "@/components/icons"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function ArrowLeftIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}

function ChevronDownIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function LinkIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
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

function StreamingBadgeList({ providers, selectedServiceId, muted = false }) {
  if (!providers.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {providers.map((provider) => {
        const isActiveFilter = selectedServiceId != null && provider.id === selectedServiceId
        const badgeStyle = isActiveFilter
          ? "border-[#d68e25]/45 bg-[rgba(214,142,37,0.14)] text-brand-cream"
          : muted
            ? "border-[#e4d8ab]/8 bg-[rgba(228,216,171,0.03)] text-brand-text-soft"
            : "border-[#e4d8ab]/12 bg-[rgba(228,216,171,0.05)] text-brand-cream-light/90"

        return (
          <div
            key={provider.id}
            className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${badgeStyle}`}
          >
            {provider.logoUrl && (
              <img
                src={provider.logoUrl}
                alt=""
                aria-hidden="true"
                width="18"
                height="18"
                className="h-[18px] w-[18px] shrink-0 rounded-sm"
              />
            )}
            <span className="truncate max-w-[11rem]">{provider.name}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function MovieDialogContent({
  movie,
  trailerEmbedUrl,
  dialogPosterSrcSet,
  radarrUrl,
  sonarrUrl,
  selectedServiceId = null,
  onOpenSettings,
}) {
  const [isPosterLoaded, setIsPosterLoaded] = useState(false)
  const [posterError, setPosterError] = useState(false)
  const [trailerMovieId, setTrailerMovieId] = useState(null)
  const [isTrailerLoaded, setIsTrailerLoaded] = useState(false)
  const [showRentBuy, setShowRentBuy] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  const showTrailer = trailerMovieId === movie.id && Boolean(trailerEmbedUrl)

  const hasRadarr = Boolean(radarrUrl) && movie?.kind !== "tv"
  const radarrLink = hasRadarr
    ? `${radarrUrl}/add/new?term=${encodeURIComponent(`tmdb:${movie.id}`)}`
    : null
  const hasSonarr = Boolean(sonarrUrl) && movie?.kind === "tv"
  const sonarrLink = hasSonarr
    ? `${sonarrUrl}/add/new?term=${encodeURIComponent(
        movie.tvdbId ? `tvdb:${movie.tvdbId}` : movie.seriesName || movie.title
      )}`
    : null
  const traktLink =
    movie?.kind === "tv"
      ? `https://trakt.tv/search?query=${encodeURIComponent(movie.seriesName || movie.title)}&type=show`
      : `https://trakt.tv/search?query=${encodeURIComponent(movie.title)}&type=movie`

  const score =
    movie.compositeScore != null ? (movie.compositeScore / 10).toFixed(1) : null
  const releaseYear = movie.releaseDate
    ? String(movie.releaseDate).slice(0, 4)
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

  const displayTitle =
    movie.kind === "tv" && movie.seriesName ? movie.seriesName : movie.title

  const kickerParts = [
    releaseYear,
    movie.kind === "tv" && movie.seasonNumber ? `Season ${movie.seasonNumber}` : null,
    movie.kind === "tv" && movie.network ? movie.network : null,
  ].filter(Boolean)

  const metaParts = [
    movie.kind === "tv" && movie.episodeCount ? `${movie.episodeCount} ep` : null,
    formattedRuntime,
    movie.genres?.length > 0 ? movie.genres.slice(0, 2).join(" · ") : null,
  ].filter(Boolean)

  function openTrailer() {
    if (!trailerEmbedUrl) return
    setIsTrailerLoaded(false)
    setTrailerMovieId(movie.id)
  }

  function closeTrailer() {
    setTrailerMovieId(null)
    setIsTrailerLoaded(false)
  }

  async function handleCopyLink() {
    if (typeof window === "undefined") return
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => {
        setCopied(false)
        copyTimerRef.current = null
      }, 1800)
    } catch {
      // Ignore clipboard failures in restricted contexts
    }
  }

  const showPosterImage = Boolean(movie.posterUrl) && !posterError

  const desktopPosterVisual = showPosterImage ? (
    <div className="relative aspect-[2/3] w-full max-w-[min(100%,calc((88dvh-10rem)*2/3))] overflow-hidden rounded-xl shadow-2xl ring-1 ring-[#e4d8ab]/12 transition duration-300 motion-safe:group-hover:scale-[1.015] group-hover:ring-[#d68e25]/55 group-focus-visible:ring-[#d68e25]/70">
      {!isPosterLoaded && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-xl bg-white/10" />
      )}
      <img
        src={movie.posterUrl}
        srcSet={dialogPosterSrcSet || undefined}
        sizes="(min-width: 768px) 35vw, 80vw"
        alt={`${movie.title} poster`}
        width="500"
        height="750"
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isPosterLoaded ? "opacity-100" : "opacity-0"
        }`}
        decoding="async"
        onLoad={() => setIsPosterLoaded(true)}
        onError={() => {
          setPosterError(true)
          setIsPosterLoaded(true)
        }}
      />
    </div>
  ) : (
    <div className="flex aspect-[2/3] w-full max-w-[min(100%,calc((88dvh-10rem)*2/3))] items-center justify-center rounded-xl bg-white/10 text-sm text-brand-text-soft ring-1 ring-[#e4d8ab]/12">
      No poster
    </div>
  )

  const compactPosterVisual = showPosterImage ? (
    <div className="relative h-full aspect-[2/3] overflow-hidden rounded-lg shadow-2xl ring-1 ring-[#e4d8ab]/15">
      {!isPosterLoaded && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-lg bg-white/10" />
      )}
      <img
        src={movie.posterUrl}
        srcSet={dialogPosterSrcSet || undefined}
        sizes="200px"
        alt={`${movie.title} poster`}
        width="500"
        height="750"
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isPosterLoaded ? "opacity-100" : "opacity-0"
        }`}
        decoding="async"
        onLoad={() => setIsPosterLoaded(true)}
        onError={() => {
          setPosterError(true)
          setIsPosterLoaded(true)
        }}
      />
    </div>
  ) : (
    <div className="flex h-full aspect-[2/3] items-center justify-center rounded-lg bg-white/10 text-xs text-brand-text-soft ring-1 ring-[#e4d8ab]/15">
      No poster
    </div>
  )

  return (
    <DialogContent className="movie-dialog-frame left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-[100dvw] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 border-[#e4d8ab]/12 bg-[#0E1A18] p-0 text-brand-cream [&>button]:text-brand-text-soft [&>button]:hover:text-brand-cream">
      <div
        className={
          showTrailer
            ? "flex flex-1 min-h-0 flex-col overflow-hidden"
            : "movie-dialog-split flex flex-1 min-h-0 overflow-hidden"
        }
      >
        {/* ── Option 1: Top 16:9 Cinema Stage (when trailer is playing) ── */}
        {showTrailer ? (
          <div className="movie-dialog-stage relative shrink-0 border-b border-[#e4d8ab]/10 bg-[#060C0B]">
            <div
              id="movie-trailer-player"
              className="relative mx-auto aspect-video w-full max-w-[calc(46dvh*16/9)] overflow-hidden bg-[#060C0B] md:rounded-xl md:border md:border-[#e4d8ab]/12"
            >
              {!isTrailerLoaded && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center bg-[#060C0B] font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-brand-text-soft animate-pulse"
                >
                  Loading trailer&hellip;
                </div>
              )}
              <iframe
                src={trailerEmbedUrl}
                title={`${movie.title} trailer`}
                className="relative z-10 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsTrailerLoaded(true)}
              />
            </div>
          </div>
        ) : (
          /* ── Desktop & Tall-Tablet: Atmospheric left poster column ── */
          <div className="movie-dialog-desktop-poster relative hidden w-[40%] shrink-0 items-center justify-center overflow-hidden">
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

            <div className="relative z-10 flex w-full max-w-[290px] flex-col items-center p-7">
              {trailerEmbedUrl ? (
                <button
                  type="button"
                  onClick={openTrailer}
                  aria-label={`Play trailer for ${movie.title}`}
                  aria-controls="movie-trailer-player"
                  aria-expanded={showTrailer}
                  data-umami-event="Watch trailer"
                  data-umami-event-title={movie.title}
                  data-umami-event-kind={movie.kind || "movie"}
                  className="group flex w-full flex-col items-center focus-visible:outline-none"
                >
                  {desktopPosterVisual}
                  <span className="mt-4 inline-flex min-h-[36px] items-center gap-2 rounded-full border border-[#d68e25]/35 bg-[rgba(214,142,37,0.12)] px-4 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-brand-cream transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#0E1A18]">
                    <IconPlay className="h-3.5 w-3.5" />
                    Watch trailer
                  </span>
                </button>
              ) : (
                desktopPosterVisual
              )}
            </div>
          </div>
        )}

        {/* ── Scrollable Details Panel ── */}
        <div className="flex flex-1 min-h-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* Mobile & Short-Landscape Banner */}
          {!showTrailer && (
            <div
              className="movie-dialog-compact-only movie-dialog-compact-banner relative shrink-0 overflow-hidden"
              style={{ height: "52vw", minHeight: "210px", maxHeight: "300px" }}
            >
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
              <div className="relative z-10 flex h-full w-full items-center justify-center py-3">
                {trailerEmbedUrl ? (
                  <button
                    type="button"
                    onClick={openTrailer}
                    aria-label={`Play trailer for ${movie.title}`}
                    aria-controls="movie-trailer-player"
                    aria-expanded={showTrailer}
                    data-umami-event="Watch trailer"
                    data-umami-event-title={movie.title}
                    data-umami-event-kind={movie.kind || "movie"}
                    className="h-full rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    {compactPosterVisual}
                  </button>
                ) : (
                  compactPosterVisual
                )}
              </div>
            </div>
          )}

          {/* Main editorial content */}
          <div className="flex flex-1 flex-col gap-5 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-7">
            {/* Title block */}
            <div className={showTrailer ? "flex flex-col gap-3" : "pr-14"}>
              {showTrailer && (
                <div>
                  <button
                    type="button"
                    onClick={closeTrailer}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#e4d8ab]/16 bg-[rgba(228,216,171,0.05)] px-3.5 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand-cream-light transition hover:border-[#d68e25]/45 hover:bg-[rgba(214,142,37,0.12)] hover:text-brand-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <ArrowLeftIcon className="h-3.5 w-3.5" />
                    Back to poster
                  </button>
                </div>
              )}

              <div>
                {kickerParts.length > 0 && (
                  <p className="mb-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-brand-gold">
                    {kickerParts.join(" · ")}
                  </p>
                )}
                <DialogTitle asChild>
                  <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.04em] text-brand-cream sm:text-3xl">
                    {displayTitle}
                    {movie.kind === "tv" && movie.seasonNumber && (
                      <span className="sr-only"> — Season {movie.seasonNumber}</span>
                    )}
                  </h2>
                </DialogTitle>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-text-soft">
                  {metaParts.length > 0 && <span>{metaParts.join(" · ")}</span>}
                  {score && (
                    <span
                      title="Critics composite score (out of 10)"
                      className="inline-flex items-center gap-1 font-semibold text-brand-gold"
                    >
                      <StarIcon />
                      <span className="sr-only">Rating: {score} out of 10</span>
                      <span aria-hidden="true">{score}</span>
                    </span>
                  )}
                </div>

                {!showTrailer && trailerEmbedUrl && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={openTrailer}
                    aria-controls="movie-trailer-player"
                    aria-expanded={showTrailer}
                    data-umami-event="Watch trailer"
                    data-umami-event-title={movie.title}
                    data-umami-event-kind={movie.kind || "movie"}
                    className="movie-dialog-compact-flex mt-3.5 min-h-[44px] px-4"
                  >
                    <IconPlay className="h-3.5 w-3.5" />
                    Watch trailer
                  </Button>
                )}
              </div>
            </div>

            {/* Synopsis + Inline Editorial Credits */}
            <div>
              <DialogDescription asChild>
                <p className="text-sm leading-relaxed text-brand-cream-light/90">
                  {movie.overview || movie.description}
                </p>
              </DialogDescription>
              {showCustomDescription && (
                <p className="mt-2 text-[0.8125rem] italic leading-relaxed text-brand-text-soft">
                  &ldquo;{movie.description}&rdquo;
                </p>
              )}

              {(movie.director || movie.topActors?.length > 0) && (
                <div className="mt-3.5 space-y-1 text-xs leading-relaxed text-brand-text-soft">
                  {movie.director && (
                    <p>
                      Directed by{" "}
                      <span className="text-brand-cream-light/90">{movie.director}</span>
                    </p>
                  )}
                  {movie.topActors?.length > 0 && (
                    <p>
                      Starring{" "}
                      <span className="text-brand-cream-light/90">
                        {movie.topActors.join(", ")}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Where to Stream (minimal badges, no outbound TMDB links) */}
            {hasStreaming && (
              <div>
                <h3 className="brand-kicker mb-2.5 text-brand-gold">
                  Where to stream
                  <span className="ml-2 text-brand-text-muted">US</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {subscriptionProviders.length > 0 && (
                    <StreamingBadgeList
                      providers={subscriptionProviders}
                      selectedServiceId={selectedServiceId}
                    />
                  )}

                  {rentBuyProviders.length > 0 &&
                    (subscriptionProviders.length === 0 ? (
                      <div>
                        <p className="mb-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand-text-soft">
                          Rent / Buy
                        </p>
                        <StreamingBadgeList
                          providers={rentBuyProviders}
                          selectedServiceId={selectedServiceId}
                        />
                      </div>
                    ) : rentBuyProviders.length <= 3 ? (
                      <div>
                        <p className="mb-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand-text-soft">
                          Rent / Buy
                        </p>
                        <StreamingBadgeList
                          providers={rentBuyProviders}
                          selectedServiceId={selectedServiceId}
                          muted
                        />
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          aria-expanded={showRentBuy}
                          onClick={() => setShowRentBuy((prev) => !prev)}
                          className="inline-flex min-h-[36px] items-center gap-1.5 py-1.5 text-xs text-brand-text-soft transition-colors hover:text-brand-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <span>Also to rent or buy on {rentBuyProviders.length} stores</span>
                          <ChevronDownIcon
                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                              showRentBuy ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {showRentBuy && (
                          <div className="mt-2">
                            <StreamingBadgeList
                              providers={rentBuyProviders}
                              selectedServiceId={selectedServiceId}
                              muted
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Utility Action Footer */}
            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#e4d8ab]/8 pt-4">
              <a
                href={traktLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Add ${movie.title} to Trakt watchlist`}
                data-umami-event="Open Trakt"
                data-umami-event-title={movie.title}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#e4d8ab]/14 bg-[rgba(228,216,171,0.04)] px-4 py-2 text-xs text-brand-cream-light/85 transition hover:border-[#d68e25]/40 hover:bg-[rgba(214,142,37,0.16)] hover:text-brand-cream motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <img src="/icons/trakt.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
                Trakt
              </a>

              {radarrLink && (
                <a
                  href={radarrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Add ${movie.title} to Radarr download queue`}
                  data-umami-event="Open Radarr"
                  data-umami-event-title={movie.title}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#e4d8ab]/14 bg-[rgba(228,216,171,0.04)] px-4 py-2 text-xs text-brand-cream-light/85 transition hover:border-[#d68e25]/40 hover:bg-[rgba(214,142,37,0.16)] hover:text-brand-cream motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <img src="/icons/radarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
                  Radarr
                </a>
              )}

              {sonarrLink && (
                <a
                  href={sonarrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Add ${movie.title} to Sonarr download queue`}
                  data-umami-event="Open Sonarr"
                  data-umami-event-title={movie.title}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#e4d8ab]/14 bg-[rgba(228,216,171,0.04)] px-4 py-2 text-xs text-brand-cream-light/85 transition hover:border-[#d68e25]/40 hover:bg-[rgba(214,142,37,0.16)] hover:text-brand-cream motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <img src="/icons/sonarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
                  Sonarr
                </a>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                aria-live="polite"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#e4d8ab]/14 bg-[rgba(228,216,171,0.04)] px-4 py-2 text-xs text-brand-cream-light/85 transition hover:border-[#d68e25]/40 hover:bg-[rgba(214,142,37,0.16)] hover:text-brand-cream motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {copied ? (
                  <CheckIcon className="h-3.5 w-3.5 text-brand-gold" />
                ) : (
                  <LinkIcon className="h-3.5 w-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy link"}</span>
              </button>

              {!radarrLink && !sonarrLink && (
                <button
                  type="button"
                  onClick={() => onOpenSettings?.()}
                  title="Self-hosted media manager — set URL in Settings"
                  aria-label={
                    movie.kind === "tv" ? "Connect Sonarr in Settings" : "Connect Radarr in Settings"
                  }
                  className="ml-auto inline-flex min-h-[44px] items-center gap-1.5 px-2 text-xs text-brand-text-muted transition-colors hover:text-brand-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <img
                    src={movie.kind === "tv" ? "/icons/sonarr.svg" : "/icons/radarr.svg"}
                    alt=""
                    width="13"
                    height="13"
                    className="h-3.5 w-3.5 opacity-60"
                  />
                  <span>{movie.kind === "tv" ? "Connect Sonarr" : "Connect Radarr"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
