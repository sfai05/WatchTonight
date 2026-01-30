import { useEffect, useMemo, useState } from "react"

import { MovieCard } from "@/components/MovieCard"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  fetchMoviesData,
  fetchTvSeasonsData,
  getLatestGeneratedAt,
  transformMovieData,
  transformTvSeasonData,
} from "@/lib/movieData"

export default function App() {
  const [movies, setMovies] = useState([])
  const [tvSeasons, setTvSeasons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")

  const structuredData = useMemo(() => {
    const items = [...movies, ...tvSeasons].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": item.kind === "tv" ? "TVSeason" : "Movie",
        name: item.title,
        description: item.overview || item.description,
        image: item.posterUrl || undefined,
        datePublished: item.releaseDate || undefined,
        url: item.infoUrl || "https://watchtonight.app/",
      },
    }))

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "WatchTonight",
          url: "https://watchtonight.app/",
          description: "Recently popular movies available to stream at home.",
          inLanguage: "en",
        },
        {
          "@type": "ItemList",
          name: "Tonight’s picks",
          itemListOrder: "ItemListOrderAscending",
          numberOfItems: items.length,
          itemListElement: items,
        },
      ],
    }
  }, [movies, tvSeasons])

  useEffect(() => {
    let isMounted = true

    async function loadTitles() {
      try {
        const [moviesRaw, tvRaw] = await Promise.all([fetchMoviesData(), fetchTvSeasonsData()])
        const nextMovies = transformMovieData(moviesRaw)
        const nextTv = transformTvSeasonData(tvRaw)
        if (isMounted) {
          setMovies(nextMovies)
          setTvSeasons(nextTv)
          setLastUpdated(getLatestGeneratedAt(moviesRaw?.generated_at, tvRaw?.generated_at))
          setError("")
        }
      } catch (err) {
        if (isMounted) {
          setError("Could not load content data.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTitles()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-3">
            <picture>
              <source srcSet="/icon-128.webp" type="image/webp" />
              <img
                src="/icon-128.png"
                alt="WatchTonight logo"
                width="64"
                height="64"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            </picture>
            <div>
              <h1
                className="text-3xl font-semibold"
                style={{ fontFamily: "Archivo Black, sans-serif" }}
              >
                WatchTonight
              </h1>
              <p className="text-sm text-muted-foreground">
                Tonight’s picks — newly released, streaming at home.
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {isLoading && (
          <section className="space-y-6">
            <h2 className="sr-only">Tonight’s picks</h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="flex h-full flex-col gap-3">
                  <div className="overflow-hidden rounded-xl">
                    <Skeleton className="aspect-[2/3] w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <section className="space-y-4">
            <h2 className="sr-only">Tonight’s picks</h2>
            <Tabs defaultValue="movies">
              <TabsList className="mb-2">
                <TabsTrigger value="movies">Movies</TabsTrigger>
                <TabsTrigger value="tv">TV Shows</TabsTrigger>
              </TabsList>
              <TabsContent value="movies">
                <div className="grid gap-8 grid-cols-1 md:grid-cols-3 xl:grid-cols-5">
                  {movies.map((movie, index) => (
                    <MovieCard key={movie.id} movie={movie} isAboveFold={index < 5} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="tv">
                <div className="grid gap-8 grid-cols-1 md:grid-cols-3 xl:grid-cols-5">
                  {tvSeasons.map((season, index) => (
                    <MovieCard key={season.id} movie={season} isAboveFold={index < 5} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        )}
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-6 pb-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Last updated:{" "}
          {lastUpdated
            ? new Date(lastUpdated).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Unknown"}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span>Powered by TMDB + OMDb + Gemini</span>
          <span aria-hidden="true">•</span>
          <a
            href="https://x.com/timesfai"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            @timesfai
          </a>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  )
}
