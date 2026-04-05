import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconSettings } from "@/components/icons"

const RADARR_KEY = "watchtonight-radarr-url"
const SONARR_KEY = "watchtonight-sonarr-url"

function normalizeUrl(value) {
  if (!value) return ""
  return value.replace(/\/+$/, "")
}

export function SettingsDialog({ onSave }) {
  const [open, setOpen] = useState(false)
  const [radarrUrl, setRadarrUrl] = useState("")
  const [sonarrUrl, setSonarrUrl] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedRadarr = localStorage.getItem(RADARR_KEY) || ""
    const storedSonarr = localStorage.getItem(SONARR_KEY) || ""
    setRadarrUrl(storedRadarr)
    setSonarrUrl(storedSonarr)
  }, [])

  function handleSave() {
    const nextRadarr = normalizeUrl(radarrUrl)
    const nextSonarr = normalizeUrl(sonarrUrl)
    if (typeof window !== "undefined") {
      localStorage.setItem(RADARR_KEY, nextRadarr)
      localStorage.setItem(SONARR_KEY, nextSonarr)
    }
    onSave?.({ radarrUrl: nextRadarr, sonarrUrl: nextSonarr })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" aria-label="Settings" title="Settings">
          <IconSettings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg brand-surface">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Add your Radarr and Sonarr base URLs to enable quick add buttons.
          </DialogDescription>
        </DialogHeader>
        <p className="text-xs leading-relaxed text-brand-text-soft">
          <a href="https://radarr.video" target="_blank" rel="noreferrer" className="font-medium text-foreground/70 underline underline-offset-2 hover:text-foreground">Radarr</a>{" "}
          and{" "}
          <a href="https://sonarr.tv" target="_blank" rel="noreferrer" className="font-medium text-foreground/70 underline underline-offset-2 hover:text-foreground">Sonarr</a>{" "}
          are self-hosted media collection managers. Radarr handles movies; Sonarr handles TV series.
          If you run either on your home server or NAS, entering your base URL here adds a quick
          &ldquo;Add to Radarr / Sonarr&rdquo; button on every title so you can queue it up without leaving the page.
        </p>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="brand-kicker text-brand-gold/80 flex items-center justify-between">
              <span>Radarr base URL</span>
              <a
                href="/radarr-guide.html"
                target="_blank"
                rel="noreferrer"
                className="font-sans normal-case font-normal text-[11px] tracking-normal text-brand-text-muted hover:text-brand-gold/80 transition-colors"
              >
                Import our list →
              </a>
            </span>
            <input
              value={radarrUrl}
              onChange={(event) => setRadarrUrl(event.target.value)}
              placeholder="https://radarr.example.com"
              className="h-11 rounded-2xl border border-[#e4d8ab]/10 bg-[rgba(10,20,18,0.55)] px-4 text-sm text-brand-cream outline-none placeholder:text-brand-text-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="brand-kicker text-brand-gold/80 flex items-center justify-between">
              <span>Sonarr base URL</span>
              <a
                href="/sonarr-guide.html"
                target="_blank"
                rel="noreferrer"
                className="font-sans normal-case font-normal text-[11px] tracking-normal text-brand-text-muted hover:text-brand-gold/80 transition-colors"
              >
                Import our list →
              </a>
            </span>
            <input
              value={sonarrUrl}
              onChange={(event) => setSonarrUrl(event.target.value)}
              placeholder="https://sonarr.example.com"
              className="h-11 rounded-2xl border border-[#e4d8ab]/10 bg-[rgba(10,20,18,0.55)] px-4 text-sm text-brand-cream outline-none placeholder:text-brand-text-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const storageKeys = {
  radarr: RADARR_KEY,
  sonarr: SONARR_KEY,
}
