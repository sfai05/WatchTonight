import { useEffect, useMemo, useState } from "react"

import { MovieCard } from "@/components/MovieCard"
import { ThemeToggle } from "@/components/ThemeToggle"
import { fetchMoviesData, transformMovieData } from "@/lib/movieData"

export default function App() {
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")

  const structuredData = useMemo(() => {
    const items = movies.map((movie, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Movie",
        name: movie.title,
        description: movie.overview || movie.description,
        image: movie.posterUrl || undefined,
        datePublished: movie.releaseDate || undefined,
        url: movie.infoUrl || "https://watchtonight.app/",
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
  }, [movies])

  useEffect(() => {
    let isMounted = true

    async function loadMovies() {
      try {
        const raw = await fetchMoviesData()
        const nextMovies = transformMovieData(raw)
        if (isMounted) {
          setMovies(nextMovies)
          setLastUpdated(raw?.generated_at || "")
          setError("")
        }
      } catch (err) {
        if (isMounted) {
          setError("Could not load movie data.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMovies()

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

      <main className="mx-auto max-w-7xl px-6 py-10">
        {isLoading && (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Loading fresh picks...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <section className="space-y-6">
            <h2 className="sr-only">Tonight’s picks</h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3 xl:grid-cols-5">
              {movies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} isAboveFold={index < 5} />
              ))}
            </div>
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
