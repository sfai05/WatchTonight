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
  return html.replace(regex, replacement)
}

function renderPage(template, page) {
  const escapedTitle = escapeHtml(page.title)
  const escapedDescription = escapeHtml(page.description)

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
    `<link rel="canonical" href="${page.url}" />`
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
    `<meta property="og:url" content="${page.url}" />`
  )
  html = replaceTag(
    html,
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:image" content="${page.image}" />`
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
    `<meta name="twitter:image" content="${page.image}" />`
  )

  const jsonLd = `<script type="application/ld+json">${JSON.stringify(page.structuredData)}</script>`
  html = html.replace("</head>", `${jsonLd}\n  </head>`)

  return html
}

function writePage(template, dirPath, page) {
  fs.mkdirSync(dirPath, { recursive: true })
  fs.writeFileSync(path.join(dirPath, "index.html"), renderPage(template, page))
}

function buildMoviePage(movie, slug) {
  const url = `${SITE_URL}/movie/${slug}/`
  const description = truncate(movie.overview || movie.description || "", 300)
  const image = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : `${SITE_URL}/og-image.png`
  const composite = movie.ratings?.composite_score

  return {
    url,
    title: `${movie.title} — Where to Stream | WatchTonight`,
    description,
    image,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: movie.title,
      description: movie.overview || movie.description || undefined,
      image: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : undefined,
      datePublished: movie.release_date || undefined,
      url,
      ...(composite != null
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: (composite / 10).toFixed(1),
              bestRating: "10",
              worstRating: "0",
            },
          }
        : {}),
    },
  }
}

function buildTvPage(season, slug) {
  const url = `${SITE_URL}/tv/${slug}/`
  const title = `${season.series_name} — Season ${season.season_number}`
  const description = truncate(season.overview || season.description || "", 300)
  const image = season.poster_path
    ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
    : `${SITE_URL}/og-image.png`
  const composite = season.ratings?.composite_score

  return {
    url,
    title: `${title} — Where to Stream | WatchTonight`,
    description,
    image,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TVSeason",
      name: title,
      description: season.overview || season.description || undefined,
      image: season.poster_path
        ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
        : undefined,
      datePublished: season.air_date || undefined,
      url,
      ...(composite != null
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: (composite / 10).toFixed(1),
              bestRating: "10",
              worstRating: "0",
            },
          }
        : {}),
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
