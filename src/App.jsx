import { useEffect, useState } from "react"

import { MovieCard } from "@/components/MovieCard"
import { ThemeToggle } from "@/components/ThemeToggle"
import { fetchMoviesData, transformMovieData } from "@/lib/movieData"

export default function App() {
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadMovies() {
      try {
        const raw = await fetchMoviesData()
        const nextMovies = transformMovieData(raw)
        if (isMounted) {
          setMovies(nextMovies)
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
            <img
              src="/icon.png"
              alt="WatchTonight logo"
              className="h-14 w-14 rounded-2xl object-cover"
            />
            <div>
              <h1
                className="text-3xl font-semibold"
                style={{ fontFamily: "Archivo Black, sans-serif" }}
              >
                WatchTonight
              </h1>
              <p className="text-sm text-muted-foreground">
                Tonight’s picks, ready for your couch.
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
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3 xl:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
