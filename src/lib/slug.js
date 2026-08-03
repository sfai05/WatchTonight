const COMBINING_MARKS = new RegExp(
  "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
  "g"
)

export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "")
}

export function buildMovieSlug(title, id) {
  const base = slugify(title)
  return base ? `${base}-${id}` : String(id)
}

export function buildTvSlug(seriesName, seasonNumber, seasonId) {
  const base = slugify(`${seriesName} season ${seasonNumber}`)
  return base ? `${base}-${seasonId}` : String(seasonId)
}
