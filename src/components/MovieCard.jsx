import { lazy, Suspense, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { getPosterSrcSet } from "@/lib/movieData"

const MovieDialogContent = lazy(() => import("@/components/MovieDialogContent"))

function getYouTubeEmbedUrl(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "")
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v")
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

function StarIcon() {
  return (
    <svg
      className="h-3 w-3 fill-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export function MovieCard({
  movie,
  isLcp = false,
  isAboveFold = false,
  isDeferred = false,
  featured = false,
  radarrUrl = "",
  sonarrUrl = "",
  className = "",
  isOpen = false,
  onOpenChange,
  onOpenSettings,
}) {
  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailerUrl)
  const posterSrcSet = featured
    ? getPosterSrcSet(movie.posterPath, ["w342", "w500", "w780"])
    : getPosterSrcSet(movie.posterPath, ["w185", "w342", "w500"])
  const dialogPosterSrcSet = getPosterSrcSet(movie.posterPath, ["w342", "w500", "w780"])
  const [isPosterLoaded, setIsPosterLoaded] = useState(false)

  const score = movie.compositeScore != null
    ? (movie.compositeScore / 10).toFixed(1)
    : null

  return (
    <div
      className={`brand-surface flex h-full flex-col gap-3 rounded-[1.55rem] p-2 transition-shadow duration-500 ease-out motion-safe:transition-[transform,box-shadow] motion-safe:hover:-translate-y-0.5 hover:shadow-[0_36px_88px_rgba(0,0,0,0.44),_0_8px_20px_rgba(0,0,0,0.2)] ${
        isDeferred ? "card-deferred" : ""
      } ${className}`}
    >
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full cursor-pointer overflow-hidden rounded-[1.2rem] border border-[#e4d8ab]/8 bg-[rgba(10,20,18,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={`View details for ${movie.title}`}
            data-umami-event="Open details"
            data-umami-event-title={movie.title}
            data-umami-event-kind={movie.kind || "movie"}
          >
            {movie.posterUrl ? (
              <>
                {!isPosterLoaded && (
                  <Skeleton className="aspect-[2/3] w-full rounded" />
                )}
                <img
                  src={movie.posterUrl}
                  srcSet={posterSrcSet || undefined}
                  sizes={featured
                    ? "(min-width: 1280px) 400px, (min-width: 1024px) 50vw, (min-width: 768px) 66vw, 50vw"
                    : "(min-width: 1280px) 200px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  }
                  alt={`${movie.title} poster`}
                  width="500"
                  height="750"
                  className={`aspect-[2/3] w-full object-cover transition-opacity duration-500 ease-out motion-safe:transition-[transform,opacity] motion-safe:group-hover:scale-[1.04] ${
                    isPosterLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  loading={isAboveFold ? "eager" : "lazy"}
                  fetchPriority={isLcp ? "high" : undefined}
                  decoding="async"
                  onLoad={() => setIsPosterLoaded(true)}
                  onError={() => setIsPosterLoaded(true)}
                />
              </>
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded bg-muted text-brand-cream text-sm">
                No poster
              </div>
            )}

            {/* Score badge — top right, always visible */}
            {score && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-[#e4d8ab]/20 bg-[rgba(10,20,18,0.72)] px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-brand-cream backdrop-blur-sm motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105">
                <StarIcon />
                <span className="sr-only">Rating: {score} out of 10</span>
                <span aria-hidden="true">{score}</span>
              </div>
            )}

            {/* AI description — fades in with a gentle upward drift on hover or focus */}
            {movie.description && (
              <div className="absolute bottom-0 left-0 right-0 opacity-0 transition-opacity duration-500 ease-out motion-safe:translate-y-2 motion-safe:transition-[opacity,transform] motion-safe:group-hover:translate-y-0 group-hover:opacity-100 motion-safe:group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <div className="bg-gradient-to-t from-[rgba(6,12,12,0.98)] via-[rgba(6,12,12,0.85)] via-45% to-transparent px-3 pb-3 pt-20">
                  <p className="text-sm leading-5 text-brand-cream line-clamp-4 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                    &ldquo;{movie.description}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </button>
        </DialogTrigger>
        <Suspense fallback={null}>
          <MovieDialogContent
            key={movie.id}
            movie={movie}
            trailerEmbedUrl={trailerEmbedUrl}
            dialogPosterSrcSet={dialogPosterSrcSet}
            radarrUrl={radarrUrl}
            sonarrUrl={sonarrUrl}
            onOpenSettings={onOpenSettings}
          />
        </Suspense>
      </Dialog>

      <div className="px-1 pb-1.5">
        <h3 className="mb-1 font-semibold text-sm leading-tight text-brand-cream line-clamp-2">
          {movie.title}
        </h3>
        {movie.genres?.length > 0 && (
          <p className="mt-0.5 text-xs text-brand-text-soft line-clamp-1">
            {movie.genres.slice(0, 2).join(" · ")}
          </p>
        )}
      </div>
    </div>
  )
}
