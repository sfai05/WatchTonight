import fs from "fs"
import path from "path"

import { buildMovieSlug, buildTvSlug } from "../src/lib/slug.js"

const SITE_URL = "https://watchtonight.app"
const projectRoot = process.cwd()
const moviesPath = path.join(projectRoot, "public", "content", "movies.json")
const tvPath = path.join(projectRoot, "public", "content", "tv_seasons.json")
const sitemapPath = path.join(projectRoot, "public", "sitemap.xml")

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"))
  } catch {
    return null
  }
}

function toDateString(value) {
  const date = value ? new Date(value) : null
  if (date && !Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

const moviesData = readJson(moviesPath)
const tvData = readJson(tvPath)

const lastmod = toDateString(moviesData?.generated_at || tvData?.generated_at)

const movieUrls = (moviesData?.movies ?? []).map((movie) => ({
  loc: `${SITE_URL}/movie/${buildMovieSlug(movie.title, movie.id)}/`,
  lastmod: toDateString(moviesData?.generated_at),
  priority: "0.7",
}))

const tvUrls = (tvData?.seasons ?? []).map((season) => {
  const seasonId = season.season_id || `${season.series_id}-s${season.season_number}`
  return {
    loc: `${SITE_URL}/tv/${buildTvSlug(season.series_name, season.season_number, seasonId)}/`,
    lastmod: toDateString(tvData?.generated_at),
    priority: "0.7",
  }
})

const urls = [
  { loc: `${SITE_URL}/`, lastmod, priority: "1.0", changefreq: "daily" },
  ...movieUrls,
  ...tvUrls,
]

const body = urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ""}
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

fs.writeFileSync(sitemapPath, sitemap)
console.log(`sitemap.xml updated: ${urls.length} URLs (${lastmod})`)
