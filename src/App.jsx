import { lazy, Suspense, useEffect, useMemo, useState } from "react"

import { MovieCard } from "@/components/MovieCard"
import { AboutDialog } from "@/components/AboutDialog"
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
          <div className="mx-auto flex max-w-7xl items-stretch justify-between gap-4 pl-0 pr-4 sm:px-6 min-h-[56px] sm:min-h-[64px] sm:pl-6">
            <div className="flex flex-1 shrink-0 items-stretch">
              <h1 className="sr-only">WatchTonight.app</h1>
              {/* Mobile: icon only */}
              <div className="flex items-center sm:hidden" aria-hidden="true">
                <img
                  src="/icon.png"
                  alt=""
                  className="h-14 w-auto object-cover shadow-[0_0_16px_rgba(232,168,64,0.2)]"
                />
              </div>
              {/* Desktop: banner with fade + overlay textmark */}
              <div className="relative hidden items-center sm:flex" aria-hidden="true">
                <img
                  src="/watchtonight-banner.png"
                  alt=""
                  className="h-16 w-auto object-contain"
                  style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 88%, transparent), linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)", maskComposite: "intersect" }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-base leading-none tracking-[-0.02em]">
                  <span className="text-brand-ivory">Watch</span><span className="text-brand-gold">Tonight</span><span className="text-brand-amber text-[0.75em]">.app</span>
                </span>
              </div>
            </div>

            {/* Nav tabs */}
            <TabsList className="self-center h-auto gap-0.5 border-0 bg-transparent p-0 sm:gap-1">
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
            <div className="flex flex-1 shrink-0 self-center items-center justify-end gap-2">
              <AboutDialog lastUpdated={lastUpdated} />
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

        <footer className="mx-auto flex max-w-7xl items-center gap-1.5 px-6 pb-10 pt-6 text-xs text-muted-foreground">
          <span>Got feedback or a suggestion?</span>
          <a
            href="mailto:contact@watchtonight.app"
            className="transition-colors hover:text-foreground"
          >
            contact@watchtonight.app
          </a>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </div>
    </Tabs>
  )
}
