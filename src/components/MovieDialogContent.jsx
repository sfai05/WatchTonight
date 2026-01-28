import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { IconMonitorPlay, IconPlay } from "@/components/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function MovieDialogContent({ movie, trailerEmbedUrl, dialogPosterSrcSet }) {
  const [isDialogPosterLoaded, setIsDialogPosterLoaded] = useState(false)

  return (
    <DialogContent
      className="left-0 top-0 h-[100dvh] w-[100dvw] max-w-none translate-x-0 translate-y-0 rounded-none p-0 overflow-y-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[90vh] sm:w-[92vw] sm:max-w-5xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl sm:overflow-y-auto"
      style={{ scrollbarGutter: "stable" }}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] items-stretch">
        <div className="h-full bg-muted/20 p-6">
          {movie.posterUrl ? (
            <div className="relative">
              {!isDialogPosterLoaded && (
                <Skeleton className="absolute inset-0 aspect-[2/3] w-full rounded-xl" />
              )}
              <img
                src={movie.posterUrl}
                srcSet={dialogPosterSrcSet || undefined}
                sizes="(min-width: 768px) 40vw, 80vw"
                alt={`${movie.title} movie poster`}
                width="500"
                height="750"
                className={`w-full rounded-xl object-cover ${
                  isDialogPosterLoaded ? "opacity-100" : "opacity-0"
                }`}
                decoding="async"
                onLoad={() => setIsDialogPosterLoaded(true)}
                onError={() => setIsDialogPosterLoaded(true)}
              />
            </div>
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-muted text-muted-foreground">
              No poster
            </div>
          )}
        </div>
        <div className="flex h-full flex-col gap-4 p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl">{movie.title}</DialogTitle>
            <DialogDescription>{movie.overview}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {movie.genres?.map((genre) => (
              <Badge
                key={`genre-${genre}`}
                variant="secondary"
                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200"
              >
                {genre}
              </Badge>
            ))}
            {movie.director ? (
              <Badge className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200">
                {movie.director}
              </Badge>
            ) : null}
            {movie.topActors?.map((actor) => (
              <Badge
                key={`actor-${actor}`}
                className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-200"
              >
                {actor}
              </Badge>
            ))}
          </div>
          <div className="grid gap-3">
            {trailerEmbedUrl ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-fit">
                    <IconPlay className="h-4 w-4" />
                    Watch trailer
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="left-0 top-0 h-[100dvh] w-[100dvw] max-w-none translate-x-0 translate-y-0 rounded-none p-6 overflow-y-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[90vh] sm:w-[92vw] sm:max-w-5xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl sm:overflow-y-auto"
                  style={{ scrollbarGutter: "stable" }}
                >
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
            ) : null}
            {movie.streamingProviders?.length ? (
              <div className="mt-4 grid gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <IconMonitorPlay className="h-4 w-4" />
                  Where to stream
                </div>
                <div className="flex flex-wrap gap-2">
                  {movie.streamingProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs text-secondary-foreground"
                    >
                      {provider.logoUrl ? (
                        <img
                          src={provider.logoUrl}
                          alt={provider.name}
                          width="20"
                          height="20"
                          className="h-5 w-5 rounded object-cover"
                        />
                      ) : null}
                      <span className="text-xs">{provider.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
