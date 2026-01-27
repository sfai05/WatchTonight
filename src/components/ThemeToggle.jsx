import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

const STORAGE_KEY = "watchtonight-theme"

function getPreferredTheme() {
  if (typeof window === "undefined") return "dark"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  return "dark"
}

function applyTheme(nextTheme) {
  const root = document.documentElement
  if (nextTheme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const nextTheme = getPreferredTheme()
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }, [])

  const isDark = theme === "dark"

  function handleToggle() {
    const nextTheme = isDark ? "light" : "dark"
    setTheme(nextTheme)
    localStorage.setItem(STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
