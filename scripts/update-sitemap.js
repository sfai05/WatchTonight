import fs from "fs"
import path from "path"

const projectRoot = process.cwd()
const dataPath = path.join(projectRoot, "public", "content", "movies.json")
const sitemapPath = path.join(projectRoot, "public", "sitemap.xml")

function getLastModifiedDate() {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8")
    const parsed = JSON.parse(raw)
    const generatedAt = parsed?.generated_at
    if (generatedAt) {
      const date = new Date(generatedAt)
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10)
      }
    }
  } catch {
    // fallback handled below
  }
  return new Date().toISOString().slice(0, 10)
}

const lastmod = getLastModifiedDate()

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://watchtonight.app/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`

fs.writeFileSync(sitemapPath, sitemap)
console.log(`sitemap.xml updated: ${lastmod}`)
