import { useEffect, useState } from "react"

const BREAKPOINT_QUERIES = [
  { query: "(min-width: 1280px)", columns: 5 },
  { query: "(min-width: 1024px)", columns: 4 },
  { query: "(min-width: 768px)", columns: 3 },
]

function getColumnCount() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return 2
  }
  const matched = BREAKPOINT_QUERIES.find(({ query }) => window.matchMedia(query).matches)
  return matched ? matched.columns : 2
}

export function useColumnCount() {
  const [columns, setColumns] = useState(getColumnCount)

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined
    }

    const mediaQueryLists = BREAKPOINT_QUERIES.map(({ query }) => window.matchMedia(query))

    function handleBreakpointChange() {
      setColumns(getColumnCount())
    }

    mediaQueryLists.forEach((mql) => {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", handleBreakpointChange)
      } else {
        mql.addListener(handleBreakpointChange)
      }
    })

    return () => {
      mediaQueryLists.forEach((mql) => {
        if (typeof mql.removeEventListener === "function") {
          mql.removeEventListener("change", handleBreakpointChange)
        } else {
          mql.removeListener(handleBreakpointChange)
        }
      })
    }
  }, [])

  return columns
}

// The first item renders as a col-span-2 row-span-2 tile (4 cells instead of 1),
// which shifts how many cells land in the final row. Trim trailing items so the
// last row is always fully populated instead of dangling with a partial row.
export function trimToFullRows(items, columns, featuredCells = 4) {
  if (!items.length || columns <= 0) return items

  const extraCells = featuredCells - 1
  const totalCells = items.length + extraCells
  const remainder = totalCells % columns
  if (remainder === 0) return items

  const visibleCount = items.length - remainder
  if (visibleCount < columns) return items

  return items.slice(0, visibleCount)
}

// A direct link to a title that would otherwise be trimmed must still render
// (and open) — extend the visible slice to include it rather than hiding it.
export function ensureItemVisible(visibleItems, fullList, requiredItem) {
  if (!requiredItem || visibleItems.includes(requiredItem)) return visibleItems

  const index = fullList.indexOf(requiredItem)
  if (index === -1) return visibleItems

  return fullList.slice(0, index + 1)
}
