import { useEffect, useState } from "react"

const BREAKPOINTS = [
  { minWidth: 1280, columns: 5 },
  { minWidth: 1024, columns: 4 },
  { minWidth: 768, columns: 3 },
  { minWidth: 0, columns: 2 },
]

function getColumnCount() {
  if (typeof window === "undefined") return 2
  const width = window.innerWidth
  return BREAKPOINTS.find((bp) => width >= bp.minWidth).columns
}

export function useColumnCount() {
  const [columns, setColumns] = useState(getColumnCount)

  useEffect(() => {
    function handleResize() {
      setColumns(getColumnCount())
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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
