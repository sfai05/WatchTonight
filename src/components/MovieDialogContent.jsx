import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { IconPlay } from "@/components/icons"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export default function MovieDialogContent({
  movie,
  trailerEmbedUrl,
  dialogPosterSrcSet,
  radarrUrl,
  sonarrUrl,
}) {
  const [isPosterLoaded, setIsPosterLoaded] = useState(false)
  const [showRadarrTip, setShowRadarrTip] = useState(false)
  const [showSonarrTip, setShowSonarrTip] = useState(false)

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
  const heroBg = movie.backdropUrl || movie.posterUrl

  return (
    <DialogContent className="left-0 top-0 h-[100dvh] w-[100dvw] max-w-none translate-x-0 translate-y-0 rounded-none border-white/10 bg-[#0d1321] p-0 text-white overflow-hidden sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[88vh] sm:w-[90vw] sm:max-w-4xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl [&>button]:text-white/50 [&>button]:hover:text-white">
      <div className="grid h-full sm:grid-cols-[2fr_3fr] overflow-hidden">

        {/* ── Left: atmospheric poster panel ── */}
        <div className="relative hidden sm:flex sm:items-center sm:justify-center overflow-hidden">
          {/* Blurred glow backdrop */}
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
              <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
              {/* Vignette edge fade */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d1321]/60" aria-hidden="true" />
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
        <div className="flex flex-col overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
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
            {/* Bottom fade into content */}
            <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#0d1321] to-transparent" aria-hidden="true" />
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
          <div className="flex flex-1 flex-col gap-5 p-7">

            {/* Title block */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-amber-400/75">
                {[
                  releaseYear,
                  movie.kind === "tv" && movie.network ? movie.network : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <DialogTitle asChild>
                <h2 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
                  {movie.title}
                </h2>
              </DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/50">
                {movie.kind === "tv" && (
                  <>
                    {movie.seasonNumber && <span>Season {movie.seasonNumber}</span>}
                    {movie.episodeCount && <span>· {movie.episodeCount} ep</span>}
                    {movie.runtime && <span>· {movie.runtime}m</span>}
                  </>
                )}
                {movie.genres?.length > 0 && (
                  <span>{movie.genres.slice(0, 2).join(" · ")}</span>
                )}
                {score && (
                  <span className="flex items-center gap-1 font-semibold text-amber-400" aria-label={`Rating: ${score} out of 10`}>
                    <StarIcon />
                    <span aria-hidden="true">{score}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Synopsis + Streaming */}
            <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
              {/* Synopsis */}
              <div className="min-w-0">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                  Synopsis
                </h3>
                <p className="text-sm leading-relaxed text-white/75">{movie.overview}</p>
                {movie.description && (
                  <p className="mt-2.5 text-xs italic text-white/45 leading-relaxed">
                    &ldquo;{movie.description}&rdquo;
                  </p>
                )}
              </div>

              {/* Where to stream */}
              {movie.streamingProviders?.length > 0 && (
                <div className="shrink-0 sm:min-w-[150px]">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                    Where to Stream
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {movie.streamingProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex items-center gap-2 rounded bg-white/[0.07] px-3 py-2 text-xs text-white/70"
                      >
                        {provider.logoUrl && (
                          <img
                            src={provider.logoUrl}
                            alt={provider.name}
                            width="20"
                            height="20"
                            className="h-5 w-5 rounded"
                          />
                        )}
                        <span>{provider.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Director */}
            {movie.director && (
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                  Director
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-400/80">
                    {movie.director}
                  </span>
                </div>
              </div>
            )}

            {/* Cast */}
            {movie.topActors?.length > 0 && (
              <div>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                  Cast
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {movie.topActors.map((actor) => (
                    <span
                      key={actor}
                      className="rounded-full bg-white/[0.07] px-3 py-1 text-xs text-white/65"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Watchlist */}
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                Add to Watchlist
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <a
                  href={traktLink}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Add ${movie.title} to Trakt watchlist`}
                  data-umami-event="Open Trakt"
                  data-umami-event-title={movie.title}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-xs text-white/60 transition hover:bg-white/15 hover:text-white hover:scale-[1.03] active:scale-[0.97]"
                >
                  <img src="/icons/trakt.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
                  Trakt
                </a>

                {movie.kind !== "tv" &&
                  (radarrLink ? (
                    <a
                      href={radarrLink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Add ${movie.title} to Radarr download queue`}
                      data-umami-event="Open Radarr"
                      data-umami-event-title={movie.title}
                      className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-xs text-white/60 transition hover:bg-white/15 hover:text-white hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <img src="/icons/radarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
                      Radarr
                    </a>
                  ) : (
                    <TooltipProvider>
                      <Tooltip open={showRadarrTip}>
                        <TooltipTrigger asChild>
                          <span
                            className="flex min-h-[44px] cursor-default items-center gap-1.5 rounded-full border border-white/[0.08] px-4 py-3 text-xs text-white/25"
                            aria-label="Radarr not configured — open Settings to add your URL"
                            onMouseEnter={() => setShowRadarrTip(true)}
                            onMouseLeave={() => setShowRadarrTip(false)}
                          >
                            <img src="/icons/radarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5 opacity-40" />
                            Radarr
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Configure your Radarr URL in Settings.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}

                {movie.kind === "tv" &&
                  (sonarrLink ? (
                    <a
                      href={sonarrLink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Add ${movie.title} to Sonarr download queue`}
                      data-umami-event="Open Sonarr"
                      data-umami-event-title={movie.title}
                      className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-xs text-white/60 transition hover:bg-white/15 hover:text-white hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <img src="/icons/sonarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5" />
                      Sonarr
                    </a>
                  ) : (
                    <TooltipProvider>
                      <Tooltip open={showSonarrTip}>
                        <TooltipTrigger asChild>
                          <span
                            className="flex min-h-[44px] cursor-default items-center gap-1.5 rounded-full border border-white/[0.08] px-4 py-3 text-xs text-white/25"
                            aria-label="Sonarr not configured — open Settings to add your URL"
                            onMouseEnter={() => setShowSonarrTip(true)}
                            onMouseLeave={() => setShowSonarrTip(false)}
                          >
                            <img src="/icons/sonarr.svg" alt="" width="14" height="14" className="h-3.5 w-3.5 opacity-40" />
                            Sonarr
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Configure your Sonarr URL in Settings.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
              </div>
            </div>

            {/* Watch Trailer button */}
            {trailerEmbedUrl && (
              <div className="mt-auto border-t border-white/10 pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="gap-2 bg-primary text-primary-foreground transition hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0.5"
                      data-umami-event="Watch trailer"
                      data-umami-event-title={movie.title}
                      data-umami-event-kind={movie.kind || "movie"}
                    >
                      <IconPlay className="h-4 w-4" />
                      Watch Trailer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="left-0 top-0 h-[100dvh] w-[100dvw] max-w-none translate-x-0 translate-y-0 rounded-none p-6 sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[90vh] sm:w-[92vw] sm:max-w-5xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl overflow-y-auto">
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                      <iframe
                        src={trailerEmbedUrl}
                        title={`${movie.title} trailer`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
