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
        <Button variant="outline" size="icon" aria-label="Settings" title="Settings">
          <IconSettings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Add your Radarr and Sonarr base URLs to enable quick add buttons.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-foreground">Radarr base URL</span>
            <input
              value={radarrUrl}
              onChange={(event) => setRadarrUrl(event.target.value)}
              placeholder="https://radarr.example.com"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-foreground">Sonarr base URL</span>
            <input
              value={sonarrUrl}
              onChange={(event) => setSonarrUrl(event.target.value)}
              placeholder="https://sonarr.example.com"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={handleSave}>
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
