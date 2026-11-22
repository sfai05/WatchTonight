import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { MovieCard } from "@/components/MovieCard"
import { MysteryPickCard } from "@/components/MysteryPickCard"
import { AboutDialog } from "@/components/AboutDialog"
import { SettingsDialog } from "@/components/SettingsDialog"
import { IconInstagram, IconThreads, IconTwitterX, IconX } from "@/components/icons"
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
const MAX_TOP_SERVICES = 7

function readStoredSetting(key) {
  if (typeof window === "undefined") return ""
  try {
    return localStorage.getItem(key) || ""
  } catch {
    return ""
  }
}

function truncate(value, max) {
  const str = String(value ?? "")
  return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str
}

function getTopServices(pool) {
  const counts = new Map()
  for (const item of pool) {
    const seen = new Set()
    for (const provider of getSubscriptionProviders(item)) {
      if (!provider?.id || seen.has(provider.id)) continue
      seen.add(provider.id)
      const existing = counts.get(provider.id)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(provider.id, {
          id: provider.id,
          name: provider.name,
          logoUrl: provider.logoUrl || null,
          count: 1,
        })
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, MAX_TOP_SERVICES)
}

function normalizePath(path) {
  if (!path || path === "/") return "/"
  return path.endsWith("/") ? path : `${path}/`
}

function normalizeCanonicalUrl(path) {
  return `${SITE_URL}${normalizePath(path)}`
}

function getSubscriptionProviders(item) {
  return item?.streamingBuckets?.subscription ?? item?.streamingProviders ?? []
}

function filterByService(items, serviceId) {
  if (serviceId == null) return items
  return items.filter((item) =>
    getSubscriptionProviders(item).some((provider) => provider.id === serviceId)
  )
}

function LoadingSkeleton() {
  return (
    <div>
      <Skeleton className="mb-5 h-10 w-full max-w-xl rounded-full" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`sk-${i}`}
            className={`flex flex-col gap-2 ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
          >
            <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-brand-text-soft animate-pulse">
        Queuing up tonight&apos;s picks&hellip;
      </p>
    </div>
  )
}

function PosterGrid({
  items,
  activeTab,
  selectedServiceId,
  selectedServiceName,
  onClearService,
  radarrUrl,
  sonarrUrl,
  activeItem,
  onCardOpenChange,
  onOpenSettings,
  onLuckyPick,
}) {
  if (items.length === 0) {
    return (
      <div className="brand-surface flex flex-col items-center justify-center gap-4 rounded-[1.5rem] px-6 py-14 text-center">
        <p className="text-base font-medium text-brand-cream">
          {selectedServiceId != null
            ? "No titles match that streaming service right now."
            : "No titles in tonight\u2019s lineup yet."}
        </p>
        {selectedServiceId != null && (
          <Button type="button" variant="outline" onClick={onClearService}>
            Show all titles
          </Button>
        )}
      </div>
    )
  }

  const showMysteryCard = items.length >= 2 && typeof onLuckyPick === "function"

  function renderMovieItem(item, index) {
    const isFeatured = index === 0 && selectedServiceId == null
    return (
      <li
        key={item.id}
        className={isFeatured ? "md:col-span-2 md:row-span-2" : undefined}
      >
        <MovieCard
          movie={item}
          isLcp={index === 0}
          isAboveFold={index < 6}
          isDeferred={index >= 6}
          featured={isFeatured}
          radarrUrl={radarrUrl}
          sonarrUrl={sonarrUrl}
          selectedServiceId={selectedServiceId}
          isOpen={activeItem === item}
          onOpenChange={(open) => onCardOpenChange(item, open)}
          onOpenSettings={onOpenSettings}
        />
      </li>
    )
  }

  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6"
    >
      {renderMovieItem(items[0], 0)}
      {showMysteryCard && (
        <li key="mystery-pick">
          <MysteryPickCard
            poolCount={items.length}
            kind={activeTab}
            serviceName={selectedServiceName}
            onPick={() => onLuckyPick(items)}
          />
        </li>
      )}
      {items.slice(1).map((item, offset) => renderMovieItem(item, offset + 1))}
    </ul>
  )
}

export default function App() {
  const navigate = useNavigate()
  const { kind: routeKind, slug: routeSlug } = useParams()
  const [movies, setMovies] = useState([])
  const [tvSeasons, setTvSeasons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [loadVersion, setLoadVersion] = useState(0)
  const [lastUpdated, setLastUpdated] = useState("")
  const [radarrUrl, setRadarrUrl] = useState(() => readStoredSetting("watchtonight-radarr-url"))
  const [sonarrUrl, setSonarrUrl] = useState(() => readStoredSetting("watchtonight-sonarr-url"))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(routeKind === "tv" ? "tv" : "movies")
  const [prevRouteKind, setPrevRouteKind] = useState(routeKind)
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [dismissedMissingSlug, setDismissedMissingSlug] = useState(null)

  if (routeKind !== prevRouteKind) {
    setPrevRouteKind(routeKind)
    if (routeKind === "tv") {
      setActiveTab("tv")
    } else if (routeKind === "movie") {
      setActiveTab("movies")
    }
  }

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : ""

  const activeItem = useMemo(() => {
    if (!routeSlug) return null
    const pool =
      routeKind === "tv" ? tvSeasons : routeKind === "movie" ? movies : [...movies, ...tvSeasons]
    return pool.find((item) => item.slug === routeSlug) || null
  }, [movies, tvSeasons, routeKind, routeSlug])

  const activePool = activeTab === "tv" ? tvSeasons : movies

  const topServices = useMemo(() => getTopServices(activePool), [activePool])

  const filteredMovies = useMemo(
    () => filterByService(movies, selectedServiceId),
    [movies, selectedServiceId]
  )
  const filteredTvSeasons = useMemo(
    () => filterByService(tvSeasons, selectedServiceId),
    [tvSeasons, selectedServiceId]
  )

  const selectedServiceName =
    topServices.find((service) => service.id === selectedServiceId)?.name || ""

  const columns = useColumnCount()
  const visibleMovies = useMemo(() => {
    if (selectedServiceId != null) return filteredMovies
    const extraFixedCells = filteredMovies.length >= 2 ? 1 : 0
    const trimmed = trimToFullRows(filteredMovies, columns, columns >= 3 ? 4 : 1, extraFixedCells)
    return ensureItemVisible(trimmed, filteredMovies, activeItem)
  }, [filteredMovies, selectedServiceId, columns, activeItem])

  const visibleTvSeasons = useMemo(() => {
    if (selectedServiceId != null) return filteredTvSeasons
    const extraFixedCells = filteredTvSeasons.length >= 2 ? 1 : 0
    const trimmed = trimToFullRows(filteredTvSeasons, columns, columns >= 3 ? 4 : 1, extraFixedCells)
    return ensureItemVisible(trimmed, filteredTvSeasons, activeItem)
  }, [filteredTvSeasons, selectedServiceId, columns, activeItem])

  function handleLuckyPick(pool) {
    if (!pool.length) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    navigate(normalizePath(pick.path))
  }

  const showMissingRouteBanner =
    Boolean(routeSlug) &&
    !isLoading &&
    !error &&
    !activeItem &&
    dismissedMissingSlug !== routeSlug

  function handleCardOpenChange(item, open) {
    navigate(open ? normalizePath(item.path) : "/")
  }

  function handleTabChange(nextTab) {
    setActiveTab(nextTab)
    if (selectedServiceId != null) {
      const nextPool = nextTab === "tv" ? tvSeasons : movies
      const nextTopServices = getTopServices(nextPool)
      const isVisibleInNextTab = nextTopServices.some(
        (service) => service.id === selectedServiceId
      )
      if (!isVisibleInNextTab) {
        setSelectedServiceId(null)
      }
    }
  }

  function handleRetry() {
    setError("")
    setIsLoading(true)
    setLoadVersion((v) => v + 1)
  }

  const structuredData = useMemo(() => {
    if (activeItem) {
      const hasRating =
        activeItem.compositeScore != null &&
        activeItem.ratingCount != null &&
        activeItem.ratingCount > 0

      return {
        "@context": "https://schema.org",
        "@type": activeItem.kind === "tv" ? "TVSeason" : "Movie",
        name: activeItem.title,
        ...(activeItem.kind === "tv" && activeItem.seriesName
          ? {
              partOfSeries: {
                "@type": "TVSeries",
                name: activeItem.seriesName,
              },
            }
          : {}),
        ...(activeItem.kind === "tv" && activeItem.seasonNumber
          ? { seasonNumber: activeItem.seasonNumber }
          : {}),
        ...(activeItem.kind === "tv" && activeItem.episodeCount
          ? { numberOfEpisodes: activeItem.episodeCount }
          : {}),
        description: activeItem.overview || activeItem.description,
        image: activeItem.posterUrl || undefined,
        datePublished: activeItem.releaseDate || undefined,
        url: normalizeCanonicalUrl(activeItem.path),
        ...(hasRating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: (activeItem.compositeScore / 10).toFixed(1),
                bestRating: "10",
                worstRating: "0",
                ratingCount: activeItem.ratingCount,
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
        url: normalizeCanonicalUrl(item.path),
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
    if (typeof document === "undefined" || isLoading || error || (routeSlug && !activeItem)) return

    const title = activeItem
      ? `${activeItem.title} — Where to Stream | WatchTonight`
      : DEFAULT_TITLE
    const description = activeItem
      ? truncate(activeItem.overview || activeItem.description || DEFAULT_DESCRIPTION, 300)
      : DEFAULT_DESCRIPTION
    const url = activeItem ? normalizeCanonicalUrl(activeItem.path) : `${SITE_URL}/`
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
  }, [activeItem, isLoading, error, routeSlug])

  useEffect(() => {
    if (typeof document === "undefined" || isLoading || error || (routeSlug && !activeItem)) return

    let script =
      document.getElementById("wt-jsonld") ||
      document.head.querySelector('script[type="application/ld+json"]')

    if (!script) {
      script = document.createElement("script")
      script.type = "application/ld+json"
      document.head.appendChild(script)
    }
    script.id = "wt-jsonld"
    script.textContent = JSON.stringify(structuredData)
  }, [structuredData, isLoading, error, routeSlug, activeItem])

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    async function loadTitles() {
      try {
        const [moviesRaw, tvRaw] = await Promise.all([
          fetchMoviesData({ signal: controller.signal }),
          fetchTvSeasonsData({ signal: controller.signal }),
        ])
        const nextMovies = transformMovieData(moviesRaw)
        const nextTv = transformTvSeasonData(tvRaw)
        if (isMounted && !controller.signal.aborted) {
          setMovies(nextMovies)
          setTvSeasons(nextTv)
          setLastUpdated(getLatestGeneratedAt(moviesRaw?.generated_at, tvRaw?.generated_at))
          setError("")
          setIsLoading(false)
        }
      } catch {
        if (controller.signal.aborted) return
        if (isMounted) {
          setError(
            "The projector\u2019s jammed \u2014 we couldn\u2019t load tonight\u2019s picks. Check your connection and try again."
          )
          setIsLoading(false)
        }
      }
    }

    loadTitles()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [loadVersion])

  useEffect(() => {
    if (!activeItem || settingsOpen) return

    function handleKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return

      const active = document.activeElement
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable)
      ) {
        return
      }

      const list = activeTab === "tv" ? visibleTvSeasons : visibleMovies
      const currentIndex = list.indexOf(activeItem)
      if (currentIndex === -1 || list.length <= 1) return

      event.preventDefault()
      const delta = event.key === "ArrowRight" ? 1 : -1
      const nextIndex = (currentIndex + delta + list.length) % list.length
      navigate(normalizePath(list[nextIndex].path))
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeItem, settingsOpen, activeTab, visibleMovies, visibleTvSeasons, navigate])

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <div className="min-h-screen bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to tonight&apos;s picks
        </a>

        <header className="sticky top-0 z-30 border-b border-[#e4d8ab]/10 bg-[rgba(14,26,24,0.88)] backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 sm:py-2.5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-0">
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5 lg:col-start-1 lg:row-start-1">
                <h1 className="sr-only">WatchTonight.app</h1>
                <img
                  src={BRAND_MARK}
                  alt=""
                  aria-hidden="true"
                  className="h-8 w-8 shrink-0 -translate-y-0.5 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)] sm:h-10 sm:w-10"
                />
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-baseline gap-0.5 sm:gap-1 font-display text-[clamp(1.06rem,0.85rem+1.6vw,1.45rem)] font-extrabold leading-none tracking-[-0.04em] text-brand-cream sm:text-xl">
                    <span className="text-brand-cream">Watch</span>
                    <span className="text-brand-gold">Tonight</span>
                    <span className="ml-0.5 text-[0.42em] font-semibold text-brand-text-muted sm:ml-1 sm:text-[0.52em]">.app</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 justify-self-end sm:gap-2 lg:col-start-3 lg:row-start-1">
                <AboutDialog lastUpdated={lastUpdated} />
                <SettingsDialog
                  open={settingsOpen}
                  onOpenChange={setSettingsOpen}
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
                    className="min-h-[38px] min-w-[7.75rem] rounded-full px-3.5 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none data-[state=inactive]:text-brand-text-soft sm:min-h-[40px] sm:min-w-[8.5rem] sm:px-4"
                    data-umami-event="Tab: Movies"
                  >
                    Movies
                  </TabsTrigger>
                  <TabsTrigger
                    value="tv"
                    className="min-h-[38px] min-w-[7.75rem] rounded-full px-3.5 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none data-[state=inactive]:text-brand-text-soft sm:min-h-[40px] sm:min-w-[8.5rem] sm:px-4"
                    data-umami-event="Tab: Series"
                  >
                    Series
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 focus:outline-none">
          <section
            aria-label="Tonight's picks"
            className="mb-5 sm:mb-6"
          >
            <h2 className="font-display text-[clamp(1.5rem,1.05rem+2.1vw,2.35rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-brand-cream">
              Stop scrolling. Pick something <span className="text-brand-gold">good tonight.</span>
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-brand-text-soft">
              <p className="leading-snug">Critics-first movies &amp; series streaming at home</p>
              <span aria-hidden="true" className="text-brand-text-muted">·</span>
              <span className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-brand-cream-light/85">
                {formattedLastUpdated ? `Updated ${formattedLastUpdated}` : "Daily refresh"}
              </span>
            </div>
          </section>

          {showMissingRouteBanner && (
            <div
              role="status"
              className="brand-surface mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#d68e25]/30 bg-[rgba(214,142,37,0.08)] px-4 py-3 text-sm text-brand-cream"
            >
              <p>
                That title isn&rsquo;t in tonight&rsquo;s current lineup &mdash; here&rsquo;s what&rsquo;s streaming now.
              </p>
              <button
                type="button"
                onClick={() => setDismissedMissingSlug(routeSlug)}
                aria-label="Dismiss notice"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-text-soft transition-colors hover:bg-white/10 hover:text-brand-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          )}

          {isLoading && <LoadingSkeleton />}

          {error && (
            <div
              role="alert"
              className="brand-surface flex flex-col items-start justify-between gap-4 rounded-[1.5rem] border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive sm:flex-row sm:items-center"
            >
              <p>{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={handleRetry} className="shrink-0">
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Streaming-Service Filter Bar */}
              {topServices.length > 0 && (
                <div
                  role="group"
                  aria-label="Filter by streaming service"
                  className="mb-5 flex flex-wrap items-center gap-2 sm:mb-6"
                >
                  <button
                    type="button"
                    aria-pressed={selectedServiceId == null}
                    onClick={() => setSelectedServiceId(null)}
                    className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      selectedServiceId == null
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-[#e4d8ab]/14 bg-[rgba(19,34,32,0.85)] text-brand-text-soft hover:border-[#e4d8ab]/30 hover:text-brand-cream"
                    }`}
                  >
                    All services
                  </button>

                  {topServices.map((service) => {
                    const isSelected = selectedServiceId === service.id
                    return (
                      <button
                        key={service.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          setSelectedServiceId((prev) => (prev === service.id ? null : service.id))
                        }
                        className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-[#e4d8ab]/14 bg-[rgba(19,34,32,0.85)] text-brand-text-soft hover:border-[#e4d8ab]/30 hover:text-brand-cream"
                        }`}
                      >
                        {service.logoUrl && (
                          <img
                            src={service.logoUrl}
                            alt=""
                            aria-hidden="true"
                            width="16"
                            height="16"
                            className="h-4 w-4 shrink-0 rounded-sm"
                          />
                        )}
                        <span>{service.name}</span>
                        <span
                          className={`font-mono text-[0.6875rem] ${
                            isSelected ? "text-primary-foreground/80" : "text-brand-text-muted"
                          }`}
                        >
                          {service.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              <TabsContent value="movies" className="mt-0">
                <PosterGrid
                  items={visibleMovies}
                  activeTab="movies"
                  selectedServiceId={selectedServiceId}
                  selectedServiceName={selectedServiceName}
                  onClearService={() => setSelectedServiceId(null)}
                  radarrUrl={radarrUrl}
                  sonarrUrl={sonarrUrl}
                  activeItem={activeItem}
                  onCardOpenChange={handleCardOpenChange}
                  onOpenSettings={() => setSettingsOpen(true)}
                  onLuckyPick={handleLuckyPick}
                />
              </TabsContent>

              <TabsContent value="tv" className="mt-0">
                <PosterGrid
                  items={visibleTvSeasons}
                  activeTab="tv"
                  selectedServiceId={selectedServiceId}
                  selectedServiceName={selectedServiceName}
                  onClearService={() => setSelectedServiceId(null)}
                  radarrUrl={radarrUrl}
                  sonarrUrl={sonarrUrl}
                  activeItem={activeItem}
                  onCardOpenChange={handleCardOpenChange}
                  onOpenSettings={() => setSettingsOpen(true)}
                  onLuckyPick={handleLuckyPick}
                />
              </TabsContent>
            </>
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
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/watchtonight.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WatchTonight on Instagram"
                  className="text-brand-text-soft transition-colors hover:text-brand-cream"
                >
                  <IconInstagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.threads.com/@watchtonight.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WatchTonight on Threads"
                  className="text-brand-text-soft transition-colors hover:text-brand-cream"
                >
                  <IconThreads className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/WatchTonightApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WatchTonight on X"
                  className="text-brand-text-soft transition-colors hover:text-brand-cream"
                >
                  <IconTwitterX className="h-5 w-5" />
                </a>
              </div>
              <div className="text-sm text-brand-text-soft">
                Got feedback?{" "}
                <a href="mailto:contact@watchtonight.app" className="text-brand-cream transition-colors hover:text-brand-gold">
                  contact@watchtonight.app
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Tabs>
  )
}
