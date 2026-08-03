import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { MovieCard } from "@/components/MovieCard"
import { AboutDialog } from "@/components/AboutDialog"
import { SettingsDialog } from "@/components/SettingsDialog"
import { IconPanelToggle } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ensureItemVisible, trimToFullRows, useColumnCount } from "@/lib/grid"
import {
  fetchMoviesData,
  fetchTvSeasonsData,
  getLatestGeneratedAt,
  transformMovieData,
  transformTvSeasonData,
} from "@/lib/movieData"

const SITE_URL = "https://watchtonight.app"
const DEFAULT_TITLE = "WatchTonight — New releases streaming at home tonight"
const DEFAULT_DESCRIPTION =
  "Recently popular movies and TV shows available to stream at home. A minimalist poster wall with trailers and where to watch."
const BRAND_MARK = "/brand-mark-nobg.png"
const BRAND_MARK_SQUARE = "/brand-mark-square.png"
const HERO_COLLAPSE_COOKIE = "watchtonight-hero-collapsed"
const HERO_VIEW_COUNT_COOKIE = "watchtonight-hero-views"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function getCookie(name) {
  if (typeof document === "undefined") return ""

  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1] || ""
}

function setCookie(name, value, maxAge = COOKIE_MAX_AGE) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function getDefaultHeroCollapsed() {
  const savedPreference = getCookie(HERO_COLLAPSE_COOKIE)
  const storedViews = Number.parseInt(getCookie(HERO_VIEW_COUNT_COOKIE) || "0", 10)

  if (savedPreference === "true") return true
  if (storedViews + 1 > 3) return true
  if (savedPreference === "false") return false

  return false
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
  const navigate = useNavigate()
  const { kind: routeKind, slug: routeSlug } = useParams()
  const [movies, setMovies] = useState([])
  const [tvSeasons, setTvSeasons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")
  const [radarrUrl, setRadarrUrl] = useState("")
  const [sonarrUrl, setSonarrUrl] = useState("")
  const [activeTab, setActiveTab] = useState(routeKind === "tv" ? "tv" : "movies")
  const [heroCollapsed, setHeroCollapsed] = useState(getDefaultHeroCollapsed)
  const activeCount = activeTab === "tv" ? tvSeasons.length : movies.length
  const estimatedDecisionMinutes = activeTab === "tv" ? 17 : 23
  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "Daily refresh"

  const activeItem = useMemo(() => {
    if (!routeSlug) return null
    const pool =
      routeKind === "tv" ? tvSeasons : routeKind === "movie" ? movies : [...movies, ...tvSeasons]
    return pool.find((item) => item.slug === routeSlug) || null
  }, [movies, tvSeasons, routeKind, routeSlug])

  const columns = useColumnCount()
  const visibleMovies = useMemo(() => {
    const trimmed = trimToFullRows(movies, columns)
    return ensureItemVisible(trimmed, movies, activeItem)
  }, [movies, columns, activeItem])
  const visibleTvSeasons = useMemo(() => {
    const trimmed = trimToFullRows(tvSeasons, columns)
    return ensureItemVisible(trimmed, tvSeasons, activeItem)
  }, [tvSeasons, columns, activeItem])

  function handleCardOpenChange(item, open) {
    navigate(open ? item.path : "/")
  }

  const structuredData = useMemo(() => {
    if (activeItem) {
      return {
        "@context": "https://schema.org",
        "@type": activeItem.kind === "tv" ? "TVSeason" : "Movie",
        name: activeItem.title,
        description: activeItem.overview || activeItem.description,
        image: activeItem.posterUrl || undefined,
        datePublished: activeItem.releaseDate || undefined,
        url: `${SITE_URL}${activeItem.path}`,
        ...(activeItem.compositeScore != null
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: (activeItem.compositeScore / 10).toFixed(1),
                bestRating: "10",
                worstRating: "0",
              },
            }
          : {}),
      }
    }

    const items = [...movies, ...tvSeasons].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": item.kind === "tv" ? "TVSeason" : "Movie",
        name: item.title,
        description: item.overview || item.description,
        image: item.posterUrl || undefined,
        datePublished: item.releaseDate || undefined,
        url: `${SITE_URL}${item.path}`,
      },
    }))

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "WatchTonight",
          url: `${SITE_URL}/`,
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
  }, [movies, tvSeasons, activeItem])

  useEffect(() => {
    if (typeof document === "undefined") return

    const title = activeItem
      ? `${activeItem.title} — Where to Stream | WatchTonight`
      : DEFAULT_TITLE
    const description = activeItem
      ? (activeItem.overview || activeItem.description || DEFAULT_DESCRIPTION).slice(0, 300)
      : DEFAULT_DESCRIPTION
    const url = activeItem ? `${SITE_URL}${activeItem.path}` : `${SITE_URL}/`
    const image = activeItem?.posterUrl || `${SITE_URL}/og-image.png`

    document.title = title

    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector)
      if (el) el.setAttribute(attr, value)
    }

    setMeta('meta[name="description"]', "content", description)
    setMeta('link[rel="canonical"]', "href", url)
    setMeta('meta[property="og:title"]', "content", title)
    setMeta('meta[property="og:description"]', "content", description)
    setMeta('meta[property="og:url"]', "content", url)
    setMeta('meta[property="og:image"]', "content", image)
    setMeta('meta[name="twitter:title"]', "content", title)
    setMeta('meta[name="twitter:description"]', "content", description)
    setMeta('meta[name="twitter:image"]', "content", image)
  }, [activeItem])

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

  useEffect(() => {
    const nextViews = Number.parseInt(getCookie(HERO_VIEW_COUNT_COOKIE) || "0", 10) + 1
    setCookie(HERO_VIEW_COUNT_COOKIE, String(nextViews))

    const savedPreference = getCookie(HERO_COLLAPSE_COOKIE)
    if (savedPreference === "true") {
      setHeroCollapsed(true)
      return
    }

    if (savedPreference === "false") {
      if (nextViews > 3) {
        setHeroCollapsed(true)
        return
      }

      setHeroCollapsed(false)
      return
    }

    setHeroCollapsed(nextViews > 3)
  }, [])

  function handleHeroCollapsedChange(nextCollapsed) {
    setHeroCollapsed(nextCollapsed)
    setCookie(HERO_COLLAPSE_COOKIE, String(nextCollapsed))

    if (!nextCollapsed) {
      setCookie(HERO_VIEW_COUNT_COOKIE, "0")
    }
  }

  return (
    <Tabs defaultValue={routeKind === "tv" ? "tv" : "movies"} onValueChange={setActiveTab}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-[#e4d8ab]/10 bg-[rgba(14,26,24,0.88)] backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 sm:py-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-0">
              <div className="flex min-w-0 items-center gap-1 sm:gap-2.5 lg:col-start-1 lg:row-start-1">
                <h1 className="sr-only">WatchTonight.app</h1>
                <img
                  src={BRAND_MARK}
                  alt=""
                  aria-hidden="true"
                  className="h-8 w-8 shrink-0 -translate-y-1 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)] sm:h-12 sm:w-12"
                />
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-baseline gap-0.5 sm:gap-1 font-display text-[clamp(1.06rem,4.35vw,1.7rem)] font-extrabold leading-none tracking-[-0.04em] text-brand-cream sm:text-xl">
                    <span className="text-brand-cream">Watch</span>
                    <span className="text-brand-gold">Tonight</span>
                    <span className="ml-0.5 text-[0.42em] font-semibold text-brand-text-muted sm:ml-1 sm:text-[0.52em]">.app</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 justify-self-end sm:gap-2 lg:col-start-3 lg:row-start-1">
                <AboutDialog lastUpdated={lastUpdated} />
                <SettingsDialog
                  onSave={({ radarrUrl: next, sonarrUrl: nextSonarr }) => {
                    setRadarrUrl(next)
                    setSonarrUrl(nextSonarr)
                  }}
                />
              </div>

              <div className="col-span-2 flex justify-center lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:px-2">
              <TabsList className="w-auto justify-center rounded-full border border-[#e4d8ab]/10 bg-[rgba(19,34,32,0.9)] p-[3px] text-brand-text-soft">
                <TabsTrigger
                  value="movies"
                  className="min-h-[40px] min-w-[8.5rem] rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none data-[state=inactive]:text-brand-text-soft sm:min-h-[42px]"
                  data-umami-event="Tab: Movies"
                >
                  Movies
                </TabsTrigger>
                <TabsTrigger
                  value="tv"
                  className="min-h-[40px] min-w-[8.5rem] rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none data-[state=inactive]:text-brand-text-soft sm:min-h-[42px]"
                  data-umami-event="Tab: Series"
                >
                  Series
                </TabsTrigger>
              </TabsList>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <section
            className={`brand-surface relative mb-8 overflow-hidden rounded-[2rem] px-5 sm:px-8 lg:px-10 ${heroCollapsed ? "py-5 sm:py-6" : "py-6 sm:py-8 lg:py-10"}`}
          >
            <div className="brand-halftone absolute inset-0 opacity-25" aria-hidden="true" />
            <div className="absolute inset-y-0 right-0 hidden w-[32rem] bg-[radial-gradient(circle_at_center,rgba(214,142,37,0.18),transparent_65%)] lg:block" aria-hidden="true" />
            <div className={`relative ${heroCollapsed ? "flex flex-col gap-4" : "grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"}`}>
              <div className={heroCollapsed ? "" : "max-w-2xl"}>
                <div>
                  <div className="flex items-start justify-between gap-3 sm:block">
                    <p className="brand-kicker inline-flex max-w-[calc(100%-3.5rem)] rounded-full border border-[#d68e25]/30 bg-[rgba(214,142,37,0.08)] px-4 py-2 text-brand-gold sm:max-w-none sm:pr-4">
                      Curated for the streaming struggle
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleHeroCollapsedChange(!heroCollapsed)}
                      aria-expanded={!heroCollapsed}
                      aria-label={heroCollapsed ? "Expand banner" : "Collapse banner"}
                      title={heroCollapsed ? "Expand banner" : "Collapse banner"}
                      className="z-10 h-11 w-11 shrink-0 text-brand-cream-light hover:text-brand-cream sm:absolute sm:right-5 sm:top-5 sm:h-10 sm:w-10"
                    >
                      <IconPanelToggle
                        collapsed={heroCollapsed}
                        className="h-4 w-4 transition-transform duration-200"
                      />
                    </Button>
                  </div>
                  <h2 className={`mt-4 break-words font-display font-extrabold leading-[0.94] tracking-[-0.05em] text-brand-cream ${heroCollapsed ? "text-[clamp(1.7rem,4vw,2.6rem)]" : "text-[clamp(2.3rem,6vw,4.9rem)]"}`}>
                    {heroCollapsed ? "Tonight\u2019s picks" : "Stop scrolling."}
                    {!heroCollapsed && (
                      <>
                        <br />
                        Pick something <span className="text-brand-gold">good tonight.</span>
                      </>
                    )}
                  </h2>
                </div>

                {heroCollapsed ? (
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <p className="max-w-2xl text-sm leading-7 text-brand-text-soft sm:text-base">
                      We help you decide what to watch across your streaming services. No playback here, just better picks.
                    </p>
                    <div className="hidden flex-wrap gap-2.5 sm:flex sm:justify-end">
                      <span className="brand-kicker rounded-full border border-[#e4d8ab]/10 bg-[rgba(228,216,171,0.04)] px-3 py-2 text-brand-cream-light">
                        {formattedLastUpdated}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-brand-text-soft sm:text-base">
                      We surface what to watch across your streaming services, ranked with critic consensus, social
                      momentum, and a little taste. We do not host playback. No sign-in. No endless wandering.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2.5">
                      <span className="brand-kicker rounded-full border border-[#e4d8ab]/10 bg-[rgba(228,216,171,0.04)] px-3 py-2 text-brand-cream-light">
                        {formattedLastUpdated}
                      </span>
                      <span className="brand-kicker rounded-full border border-[#e4d8ab]/10 bg-[rgba(228,216,171,0.04)] px-3 py-2 text-brand-cream-light">
                        Across services
                      </span>
                      <span className="brand-kicker rounded-full border border-[#e4d8ab]/10 bg-[rgba(228,216,171,0.04)] px-3 py-2 text-brand-cream-light">
                        Critics first, algorithms second
                      </span>
                    </div>
                  </>
                )}
              </div>

              {!heroCollapsed && (
                <div className="relative flex items-end justify-start lg:justify-end">
                  <div className="brand-surface relative w-full max-w-sm overflow-hidden rounded-[1.75rem] px-5 py-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,142,37,0.18),transparent_55%)]" aria-hidden="true" />
                    <div className="relative flex items-end justify-between gap-4">
                      <div>
                        <p className="brand-kicker text-brand-gold">Estimated decision time saved</p>
                        <p className="mt-3 font-display text-5xl font-extrabold leading-none tracking-[-0.05em] text-brand-cream">
                          {estimatedDecisionMinutes} mins
                        </p>
                        <p className="mt-2 max-w-[12rem] text-sm leading-6 text-brand-text-soft">
                          {activeTab === "tv"
                            ? "Less time deciding, more time getting into the next season."
                            : "Less time scrolling, more time actually watching tonight."}
                        </p>
                      </div>
                      <img
                        src={BRAND_MARK_SQUARE}
                        alt=""
                        aria-hidden="true"
                        className="h-28 w-28 shrink-0 rotate-[-12deg] object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)] sm:h-32 sm:w-32"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {isLoading && <LoadingSkeleton />}

          {error && (
            <div className="brand-surface rounded-[1.5rem] border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <>
              <TabsContent value="movies" className="mt-0">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                  {visibleMovies.map((movie, index) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isAboveFold={index < 6}
                      featured={index === 0}
                      className={index === 0 ? "col-span-2 row-span-2" : ""}
                      radarrUrl={radarrUrl}
                      sonarrUrl={sonarrUrl}
                      isOpen={activeItem === movie}
                      onOpenChange={(open) => handleCardOpenChange(movie, open)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tv" className="mt-0">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                  {visibleTvSeasons.map((season, index) => (
                    <MovieCard
                      key={season.id}
                      movie={season}
                      isAboveFold={index < 6}
                      featured={index === 0}
                      className={index === 0 ? "col-span-2 row-span-2" : ""}
                      radarrUrl={radarrUrl}
                      sonarrUrl={sonarrUrl}
                      isOpen={activeItem === season}
                      onOpenChange={(open) => handleCardOpenChange(season, open)}
                    />
                  ))}
                </div>
              </TabsContent>
            </>
          )}

          {/* Feeling lucky */}
          {!isLoading && !error && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const pool = activeTab === "tv" ? tvSeasons : movies
                  if (!pool.length) return
                  const pick = pool[Math.floor(Math.random() * pool.length)]
                  navigate(pick.path)
                }}
                className="brand-kicker flex items-center gap-2 rounded-full border border-[#d68e25]/35 bg-[rgba(214,142,37,0.1)] px-5 py-3 text-brand-cream transition hover:-translate-y-0.5 hover:bg-[rgba(214,142,37,0.18)] hover:text-brand-cream active:translate-y-0"
                data-umami-event="Feeling lucky"
                data-umami-event-tab={activeTab}
              >
                <span aria-hidden="true">🎲</span>
                Feeling lucky?
              </button>
            </div>
          )}

        </main>

        <footer className="mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-6">
          <div className="flex flex-col gap-5 border-t border-[#e4d8ab]/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img src={BRAND_MARK} alt="" aria-hidden="true" className="h-11 w-11 object-contain" />
              <div>
                <p className="font-display text-lg font-bold tracking-[-0.04em] text-brand-cream">
                  <span className="text-brand-cream">Watch</span>
                  <span className="text-brand-gold">Tonight</span>
                </p>
                <p className="brand-kicker text-[0.58rem] text-brand-text-soft">Honest lists for evenings at home</p>
              </div>
            </div>
            <div className="text-sm text-brand-text-soft">
              Got feedback or a suggestion?{" "}
              <a href="mailto:contact@watchtonight.app" className="text-brand-cream transition-colors hover:text-brand-gold">
                contact@watchtonight.app
              </a>
            </div>
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
