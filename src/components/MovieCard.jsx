import { lazy, Suspense, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
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

export function MovieCard({ movie, isAboveFold = false }) {
  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailerUrl)
  const posterSrcSet = getPosterSrcSet(movie.posterPath, ["w185", "w342", "w500"])
  const dialogPosterSrcSet = getPosterSrcSet(movie.posterPath, ["w342", "w500", "w780"])
  const [isPosterLoaded, setIsPosterLoaded] = useState(false)

  return (
    <div className="flex h-full flex-col gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Card className="group cursor-pointer overflow-hidden border-0 shadow-none">
            <CardContent className="p-0">
              {movie.posterUrl ? (
                <div className="relative">
                  {!isPosterLoaded && (
                    <Skeleton className="absolute inset-0 aspect-[2/3] w-full" />
                  )}
                  <img
                    src={movie.posterUrl}
                    srcSet={posterSrcSet || undefined}
                    sizes="(min-width: 1280px) 200px, (min-width: 768px) 33vw, 50vw"
                    alt={`${movie.title} movie poster`}
                    className={`aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      isPosterLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    loading={isAboveFold ? "eager" : "lazy"}
                    fetchpriority={isAboveFold ? "high" : undefined}
                    decoding="async"
                    onLoad={() => setIsPosterLoaded(true)}
                    onError={() => setIsPosterLoaded(true)}
                  />
                </div>
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center bg-muted text-muted-foreground">
                  No poster
                </div>
              )}
            </CardContent>
          </Card>
        </DialogTrigger>
        <Suspense fallback={null}>
          <MovieDialogContent
            movie={movie}
            trailerEmbedUrl={trailerEmbedUrl}
            dialogPosterSrcSet={dialogPosterSrcSet}
          />
        </Suspense>
      </Dialog>
      <p className="text-sm italic text-muted-foreground">“{movie.description}”</p>
    </div>
  )
}
