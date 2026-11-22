import fs from "fs"
import path from "path"

import { buildMovieSlug, buildTvSlug } from "../src/lib/slug.js"

const SITE_URL = "https://watchtonight.app"
const projectRoot = process.cwd()
const distDir = path.join(projectRoot, "dist")
const templatePath = path.join(distDir, "index.html")

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"))
  } catch {
    return null
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function truncate(value, max) {
  const str = String(value ?? "")
  return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str
}

function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) return html
  return html.replace(regex, () => replacement)
}

function renderPage(template, page) {
  const escapedTitle = escapeHtml(page.title)
  const escapedDescription = escapeHtml(page.description)
  const escapedUrl = escapeHtml(page.url)
  const escapedImage = escapeHtml(page.image)

  let html = template

  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`)
  html = replaceTag(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapedDescription}" />`
  )
  html = replaceTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${escapedUrl}" />`
  )
  html = replaceTag(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapedTitle}" />`
  )
  html = replaceTag(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapedDescription}" />`
  )
  html = replaceTag(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${escapedUrl}" />`
  )
  html = replaceTag(
    html,
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:image" content="${escapedImage}" />`
  )
  html = replaceTag(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapedTitle}" />`
  )
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapedDescription}" />`
  )
  html = replaceTag(
    html,
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:image" content="${escapedImage}" />`
  )

  const jsonLd = `<script id="wt-jsonld" type="application/ld+json">${JSON.stringify(page.structuredData).replace(/</g, "\\u003c")}</script>`
  html = html.replace("</head>", () => `${jsonLd}\n  </head>`)
  html = replaceTag(
    html,
    /<div\s+id=["']root["']\s*>\s*<\/div>/,
    `<div id="root">${page.fallbackHtml}</div>`
  )

  return html
}

function writePage(template, dirPath, page) {
  fs.mkdirSync(dirPath, { recursive: true })
  fs.writeFileSync(path.join(dirPath, "index.html"), renderPage(template, page))
}

function getRatingCount(item) {
  return (Number(item?.ratings?.imdb?.votes) || 0) + (Number(item?.ratings?.tmdb?.votes) || 0)
}

function buildAggregateRating(item) {
  const composite = item?.ratings?.composite_score
  const ratingCount = getRatingCount(item)
  if (composite == null || ratingCount <= 0) return undefined
  return {
    "@type": "AggregateRating",
    ratingValue: (composite / 10).toFixed(1),
    bestRating: "10",
    worstRating: "0",
    ratingCount,
  }
}

function getReleaseYear(dateStr) {
  const match = String(dateStr ?? "").match(/^(\d{4})/)
  return match ? match[1] : null
}

function getProviderNames(item) {
  const services = item?.streaming_availability?.US?.services
  if (!services) return []
  const seen = new Set()
  const names = []
  for (const list of [services.subscription, services.rent, services.buy]) {
    for (const provider of list || []) {
      const name = provider?.provider_name
      if (name && !seen.has(name)) {
        seen.add(name)
        names.push(name)
      }
    }
  }
  return names
}

function buildFallbackHtml({
  title,
  year,
  network,
  runtime,
  genres,
  overview,
  director,
  topActors,
  providers,
}) {
  const metaParts = [
    year,
    network,
    typeof runtime === "number" && runtime > 0 ? `${runtime} min` : null,
  ].filter(Boolean)

  const heading = metaParts.length
    ? `${escapeHtml(title)} (${escapeHtml(metaParts.join(" · "))})`
    : escapeHtml(title)

  const parts = [`<main><article><h1>${heading}</h1>`]

  if (genres?.length) {
    parts.push(`<p>Genres: ${escapeHtml(genres.join(", "))}</p>`)
  }
  if (overview) {
    parts.push(`<p>${escapeHtml(overview)}</p>`)
  }
  if (director) {
    parts.push(`<p>Director: ${escapeHtml(director)}</p>`)
  }
  if (topActors?.length) {
    parts.push(`<p>Cast: ${escapeHtml(topActors.join(", "))}</p>`)
  }
  if (providers?.length) {
    const items = providers.map((name) => `<li>${escapeHtml(name)}</li>`).join("")
    parts.push(`<section><h2>Where to Stream</h2><ul>${items}</ul></section>`)
  }

  parts.push(`<p><a href="/">Browse all tonight’s picks on WatchTonight</a></p>`)
  parts.push(`</article></main>`)

  return parts.join("")
}

function buildMoviePage(movie, slug) {
  const url = `${SITE_URL}/movie/${slug}/`
  const overview = movie.overview || movie.description || ""
  const description = truncate(overview, 300)
  const image = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : `${SITE_URL}/og-image.png`

  return {
    url,
    title: `${movie.title} — Where to Stream | WatchTonight`,
    description,
    image,
    fallbackHtml: buildFallbackHtml({
      title: movie.title,
      year: getReleaseYear(movie.release_date),
      network: null,
      runtime: movie.runtime,
      genres: movie.genres,
      overview,
      director: movie.director,
      topActors: movie.top_actors,
      providers: getProviderNames(movie),
    }),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: movie.title,
      description: overview || undefined,
      image: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : undefined,
      datePublished: movie.release_date || undefined,
      url,
      aggregateRating: buildAggregateRating(movie),
    },
  }
}

function buildTvPage(season, slug) {
  const url = `${SITE_URL}/tv/${slug}/`
  const title = `${season.series_name} — Season ${season.season_number}`
  const overview = season.overview || season.description || ""
  const description = truncate(overview, 300)
  const image = season.poster_path
    ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
    : `${SITE_URL}/og-image.png`

  return {
    url,
    title: `${title} — Where to Stream | WatchTonight`,
    description,
    image,
    fallbackHtml: buildFallbackHtml({
      title,
      year: getReleaseYear(season.air_date),
      network: season.network,
      runtime: season.runtime,
      genres: season.genres,
      overview,
      director: null,
      topActors: season.top_actors,
      providers: getProviderNames(season),
    }),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TVSeason",
      name: title,
      ...(season.series_name
        ? {
            partOfSeries: {
              "@type": "TVSeries",
              name: season.series_name,
            },
          }
        : {}),
      seasonNumber: season.season_number || undefined,
      numberOfEpisodes: season.episode_count || undefined,
      description: overview || undefined,
      image: season.poster_path
        ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
        : undefined,
      datePublished: season.air_date || undefined,
      url,
      aggregateRating: buildAggregateRating(season),
    },
  }
}

function main() {
  if (!fs.existsSync(templatePath)) {
    console.error("prerender: dist/index.html not found — run `vite build` first")
    process.exit(1)
  }

  const template = fs.readFileSync(templatePath, "utf-8")
  const moviesData = readJson(path.join(distDir, "content", "movies.json"))
  const tvData = readJson(path.join(distDir, "content", "tv_seasons.json"))

  let count = 0

  for (const movie of moviesData?.movies ?? []) {
    const slug = buildMovieSlug(movie.title, movie.id)
    writePage(template, path.join(distDir, "movie", slug), buildMoviePage(movie, slug))
    count += 1
  }

  for (const season of tvData?.seasons ?? []) {
    const seasonId = season.season_id || `${season.series_id}-s${season.season_number}`
    const slug = buildTvSlug(season.series_name, season.season_number, seasonId)
    writePage(template, path.join(distDir, "tv", slug), buildTvPage(season, slug))
    count += 1
  }

  console.log(`prerender: generated ${count} static title pages`)
}

main()
