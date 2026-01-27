import { MonitorPlay, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

export function MovieCard({ movie }) {
  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailerUrl)

  return (
    <div className="flex h-full flex-col gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Card className="group cursor-pointer overflow-hidden border-0 shadow-none">
            <CardContent className="p-0">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center bg-muted text-muted-foreground">
                  No poster
                </div>
              )}
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="w-[92vw] max-w-5xl p-0">
          <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] items-stretch">
            <div className="h-full bg-muted/20 p-6">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full rounded-xl object-cover"
                />
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
                        <Play className="h-4 w-4" />
                        Watch trailer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[92vw] max-w-5xl p-6">
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
                      <MonitorPlay className="h-4 w-4" />
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
      </Dialog>
      <p className="text-sm italic text-muted-foreground">“{movie.description}”</p>
    </div>
  )
}
