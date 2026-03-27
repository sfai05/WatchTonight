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
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : null
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

export function MovieCard({ movie, isAboveFold = false, featured = false, radarrUrl = "", sonarrUrl = "", className = "" }) {
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
    <div className={`flex flex-col gap-2 ${className}`}>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full cursor-pointer overflow-hidden rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                    ? "(min-width: 1280px) 400px, (min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw"
                    : "(min-width: 1280px) 200px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  }
                  alt={`${movie.title} poster`}
                  width="500"
                  height="750"
                  className={`aspect-[2/3] w-full object-cover transition-[transform,opacity] duration-500 group-hover:scale-[1.04] ${
                    isPosterLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  loading={isAboveFold ? "eager" : "lazy"}
                  fetchpriority={isAboveFold ? "high" : undefined}
                  decoding="async"
                  onLoad={() => setIsPosterLoaded(true)}
                  onError={() => setIsPosterLoaded(true)}
                />
                {/* Composited hover darkening — replaces brightness() filter */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 rounded" aria-hidden="true" />
              </>
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded bg-muted text-muted-foreground text-sm">
                No poster
              </div>
            )}

            {/* Score badge — top right, always visible */}
            {score && (
              <div
                className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-amber-300 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
                aria-label={`Rating: ${score} out of 10`}
              >
                <StarIcon />
                <span aria-hidden="true">{score}</span>
              </div>
            )}

            {/* AI description — slides up from bottom on hover */}
            {movie.description && (
              <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent px-3 pb-3 pt-8">
                  <p className="text-[11px] italic leading-relaxed text-white/90 line-clamp-4">
                    &ldquo;{movie.description}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </button>
        </DialogTrigger>
        <Suspense fallback={null}>
          <MovieDialogContent
            movie={movie}
            trailerEmbedUrl={trailerEmbedUrl}
            dialogPosterSrcSet={dialogPosterSrcSet}
            radarrUrl={radarrUrl}
            sonarrUrl={sonarrUrl}
          />
        </Suspense>
      </Dialog>

      <div className="px-0.5">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{movie.title}</h3>
        {movie.genres?.length > 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {movie.genres.slice(0, 2).join(" · ")}
          </p>
        )}
      </div>
    </div>
  )
}
