import { useEffect, useRef, useState } from "react"

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
  return value.trim().replace(/\/+$/, "")
}

function isValidHttpUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return true
  return /^https?:\/\/.+/i.test(trimmed)
}

function readStoredUrl(key) {
  if (typeof window === "undefined") return ""
  try {
    return localStorage.getItem(key) || ""
  } catch {
    return ""
  }
}

export function SettingsDialog({ onSave, open: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [radarrUrl, setRadarrUrl] = useState(() => readStoredUrl(RADARR_KEY))
  const [sonarrUrl, setSonarrUrl] = useState(() => readStoredUrl(SONARR_KEY))
  const [validationError, setValidationError] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const closeTimerRef = useRef(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setRadarrUrl(readStoredUrl(RADARR_KEY))
      setSonarrUrl(readStoredUrl(SONARR_KEY))
      setValidationError("")
      setStatusMessage("")
    }
  }

  useEffect(() => {
    if (!open && closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [open])

  function setOpen(nextOpen) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (!nextOpen) {
      setValidationError("")
      setStatusMessage("")
    }
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  function handleSave(event) {
    event?.preventDefault()

    if (!isValidHttpUrl(radarrUrl) || !isValidHttpUrl(sonarrUrl)) {
      setStatusMessage("")
      setValidationError("URLs must start with http:// or https:// (or leave blank to clear).")
      return
    }

    const nextRadarr = normalizeUrl(radarrUrl)
    const nextSonarr = normalizeUrl(sonarrUrl)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(RADARR_KEY, nextRadarr)
        localStorage.setItem(SONARR_KEY, nextSonarr)
      } catch {
        // Ignore storage write errors in restricted browsing contexts
      }
    }
    setRadarrUrl(nextRadarr)
    setSonarrUrl(nextSonarr)
    setValidationError("")
    setStatusMessage("Settings saved")
    onSave?.({ radarrUrl: nextRadarr, sonarrUrl: nextSonarr })

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setOpen(false)
    }, 650)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10" aria-label="Settings">
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
          <a href="https://radarr.video" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground/70 underline underline-offset-2 hover:text-foreground">Radarr</a>{" "}
          and{" "}
          <a href="https://sonarr.tv" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground/70 underline underline-offset-2 hover:text-foreground">Sonarr</a>{" "}
          are self-hosted media collection managers. Radarr handles movies; Sonarr handles TV series.
          If you run either on your home server or NAS, entering your base URL here adds a quick
          &ldquo;Add to Radarr / Sonarr&rdquo; button on every title so you can queue it up without leaving the page.
        </p>
        <form onSubmit={handleSave} noValidate className="grid gap-4">
          <div className="grid gap-2 text-sm">
            <div className="brand-kicker text-brand-gold flex items-center justify-between gap-2">
              <label htmlFor="radarr-url-input">Radarr base URL</label>
              <a
                href="/radarr-guide.html"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans normal-case font-normal text-[0.6875rem] tracking-normal text-brand-text-soft hover:text-brand-gold transition-colors"
              >
                Import Radarr list →
              </a>
            </div>
            <input
              id="radarr-url-input"
              type="url"
              inputMode="url"
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? "settings-url-error" : undefined}
              value={radarrUrl}
              onChange={(event) => {
                setRadarrUrl(event.target.value)
                if (validationError) setValidationError("")
                if (statusMessage) setStatusMessage("")
              }}
              placeholder="https://radarr.example.com"
              className="h-11 rounded-2xl border border-[#e4d8ab]/55 bg-[rgba(10,20,18,0.55)] px-4 text-sm text-brand-cream placeholder:text-brand-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div className="grid gap-2 text-sm">
            <div className="brand-kicker text-brand-gold flex items-center justify-between gap-2">
              <label htmlFor="sonarr-url-input">Sonarr base URL</label>
              <a
                href="/sonarr-guide.html"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans normal-case font-normal text-[0.6875rem] tracking-normal text-brand-text-soft hover:text-brand-gold transition-colors"
              >
                Import Sonarr list →
              </a>
            </div>
            <input
              id="sonarr-url-input"
              type="url"
              inputMode="url"
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? "settings-url-error" : undefined}
              value={sonarrUrl}
              onChange={(event) => {
                setSonarrUrl(event.target.value)
                if (validationError) setValidationError("")
                if (statusMessage) setStatusMessage("")
              }}
              placeholder="https://sonarr.example.com"
              className="h-11 rounded-2xl border border-[#e4d8ab]/55 bg-[rgba(10,20,18,0.55)] px-4 text-sm text-brand-cream placeholder:text-brand-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>

          {validationError && (
            <p id="settings-url-error" role="alert" className="text-xs text-destructive">
              {validationError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            {statusMessage && (
              <p role="status" aria-live="polite" className="text-xs font-medium text-brand-gold">
                {statusMessage}
              </p>
            )}
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
