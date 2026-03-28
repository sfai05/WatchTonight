import { lazy, Suspense, useEffect, useMemo, useState } from "react"

import { MovieCard } from "@/components/MovieCard"
import { SettingsDialog } from "@/components/SettingsDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog } from "@/components/ui/dialog"
import {
  fetchMoviesData,
  fetchTvSeasonsData,
  getLatestGeneratedAt,
  getPosterSrcSet,
  transformMovieData,
  transformTvSeasonData,
} from "@/lib/movieData"

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


function LoadingSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-7 w-40" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`sk-${i}`} className={`flex flex-col gap-2 ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
            <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-muted-foreground/40 animate-pulse">
        Queuing up tonight&apos;s picks&hellip;
      </p>
    </div>
  )
}

export default function App() {
  const [movies, setMovies] = useState([])
  const [tvSeasons, setTvSeasons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")
  const [radarrUrl, setRadarrUrl] = useState("")
  const [sonarrUrl, setSonarrUrl] = useState("")
  const [activeTab, setActiveTab] = useState("movies")
  const [luckyMovie, setLuckyMovie] = useState(null)
  const [luckyOpen, setLuckyOpen] = useState(false)

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
          name: "Tonight's picks",
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
      } catch {
        if (isMounted) {
          setError("The projector\u2019s jammed \u2014 we couldn\u2019t load tonight\u2019s picks. Check your connection and refresh.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTitles()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    setRadarrUrl(localStorage.getItem("watchtonight-radarr-url") || "")
    setSonarrUrl(localStorage.getItem("watchtonight-sonarr-url") || "")
  }, [])

  return (
    <Tabs defaultValue="movies" onValueChange={setActiveTab}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
            {/* Logo + wordmark */}
            {/* Logo lockup — single SVG with icon, beam, and wordmark */}
            <div className="flex flex-1 shrink-0">
              <h1 className="sr-only">WatchTonight</h1>
              {/* Desktop: full logo with beam */}
              <svg
                viewBox="0 0 390 80"
                className="hidden h-10 w-auto sm:block"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="hdr-beam" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#ffdca1" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#ffdca1" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="hdr-body" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffdca1" />
                    <stop offset="100%" stopColor="#ffb800" />
                  </linearGradient>
                </defs>
                <polygon points="64,24 390,2 390,78 64,56" fill="url(#hdr-beam)" />
                <g transform="translate(6,4)">
                  <rect x="4" y="4" width="60" height="60" rx="15" ry="15" transform="rotate(-8,34,34)" fill="url(#hdr-body)" />
                  <circle cx="40" cy="30" r="14" fill="#0d1321" opacity="0.35" transform="rotate(-8,34,34)" />
                  <circle cx="40" cy="30" r="9"  fill="#0d1321" opacity="0.6"  transform="rotate(-8,34,34)" />
                  <circle cx="40" cy="30" r="5"  fill="#ffffff" opacity="0.9"  transform="rotate(-8,34,34)" />
                </g>
                <text
                  x="84" y="48"
                  fontFamily="'Epilogue', sans-serif"
                  fontWeight="700"
                  fontSize="25"
                  fill="#ffdca1"
                  letterSpacing="-0.5"
                >
                  WatchTonight<tspan fontWeight="400" opacity="0.3">.app</tspan>
                </text>
              </svg>
              {/* Mobile: icon + wordmark with short beam */}
              <svg
                viewBox="0 0 270 80"
                className="h-9 w-auto sm:hidden"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="mob-beam" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#ffdca1" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#ffdca1" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="mob-body" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffdca1" />
                    <stop offset="100%" stopColor="#ffb800" />
                  </linearGradient>
                </defs>
                <polygon points="64,24 270,8 270,72 64,56" fill="url(#mob-beam)" />
                <g transform="translate(6,4)">
                  <rect x="4" y="4" width="60" height="60" rx="15" ry="15" transform="rotate(-8,34,34)" fill="url(#mob-body)" />
                  <circle cx="40" cy="30" r="14" fill="#0d1321" opacity="0.35" transform="rotate(-8,34,34)" />
                  <circle cx="40" cy="30" r="9"  fill="#0d1321" opacity="0.6"  transform="rotate(-8,34,34)" />
                  <circle cx="40" cy="30" r="5"  fill="#ffffff" opacity="0.9"  transform="rotate(-8,34,34)" />
                </g>
                <text
                  x="84" y="48"
                  fontFamily="'Epilogue', sans-serif"
                  fontWeight="700"
                  fontSize="25"
                  fill="#ffdca1"
                  letterSpacing="-0.5"
                >
                  WatchTonight
                </text>
              </svg>
            </div>

            {/* Nav tabs */}
            <TabsList className="h-auto gap-0.5 border-0 bg-transparent p-0 sm:gap-1">
              <TabsTrigger
                value="movies"
                className="min-h-[44px] rounded-full px-3 py-2 text-xs font-medium transition-colors data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=inactive]:text-muted-foreground sm:px-4 sm:text-sm"
                data-umami-event="Tab: Movies"
              >
                Movies
              </TabsTrigger>
              <TabsTrigger
                value="tv"
                className="min-h-[44px] rounded-full px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=inactive]:text-muted-foreground"
                data-umami-event="Tab: Series"
              >
                Series
              </TabsTrigger>
            </TabsList>

            {/* Actions */}
            <div className="flex flex-1 shrink-0 items-center justify-end gap-2">
              <SettingsDialog
                onSave={({ radarrUrl: next, sonarrUrl: nextSonarr }) => {
                  setRadarrUrl(next)
                  setSonarrUrl(nextSonarr)
                }}
              />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {isLoading && <LoadingSkeleton />}

          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <>
              <TabsContent value="movies" className="mt-0">
                <h2 className="mb-6 font-display text-xl font-bold">Tonight&apos;s Picks</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                  {movies.map((movie, index) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isAboveFold={index < 6}
                      featured={index === 0}
                      className={index === 0 ? "col-span-2 row-span-2" : ""}
                      radarrUrl={radarrUrl}
                      sonarrUrl={sonarrUrl}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tv" className="mt-0">
                <h2 className="mb-6 font-display text-xl font-bold">Tonight&apos;s Picks</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                  {tvSeasons.map((season, index) => (
                    <MovieCard
                      key={season.id}
                      movie={season}
                      isAboveFold={index < 6}
                      featured={index === 0}
                      className={index === 0 ? "col-span-2 row-span-2" : ""}
                      radarrUrl={radarrUrl}
                      sonarrUrl={sonarrUrl}
                    />
                  ))}
                </div>
              </TabsContent>
            </>
          )}

          {/* Feeling lucky */}
          {!isLoading && !error && (
            <>
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const pool = activeTab === "tv" ? tvSeasons : movies
                    if (!pool.length) return
                    const pick = pool[Math.floor(Math.random() * pool.length)]
                    setLuckyMovie(pick)
                    setLuckyOpen(true)
                  }}
                  className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary/80 transition hover:bg-primary/20 hover:text-primary hover:scale-[1.03] active:scale-[0.97]"
                  data-umami-event="Feeling lucky"
                  data-umami-event-tab={activeTab}
                >
                  <span aria-hidden="true">🎲</span>
                  Feeling lucky?
                </button>
              </div>
              <Dialog open={luckyOpen} onOpenChange={setLuckyOpen}>
                <Suspense fallback={null}>
                  {luckyMovie && (
                    <MovieDialogContent
                      movie={luckyMovie}
                      trailerEmbedUrl={getYouTubeEmbedUrl(luckyMovie.trailerUrl)}
                      dialogPosterSrcSet={getPosterSrcSet(luckyMovie.posterPath, ["w342", "w500", "w780"])}
                      radarrUrl={radarrUrl}
                      sonarrUrl={sonarrUrl}
                    />
                  )}
                </Suspense>
              </Dialog>
            </>
          )}

        </main>

        <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-6 pb-10 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
            <span aria-hidden="true">·</span>
            <a
              href="https://x.com/timesfai"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
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
    </Tabs>
  )
}
