# WatchTonight

WatchTonight is a minimal, modern movie wall for **recent digital releases you can stream at home**. Click a poster to open a two‑panel dialog with the overview, trailer, and streaming availability.

Live: https://watchtonight.app/

## Features

- Poster wall with hover zoom
- Two‑panel dialog per movie (poster + details)
- Embedded YouTube trailers
- Streaming providers with logos
- Light/dark theme toggle (dark default)
- SEO: Open Graph, Twitter cards, sitemap, robots, JSON‑LD

## Tech stack

- Vite + React
- Tailwind CSS
- shadcn/ui (Button, Card, Dialog, Badge)
- Lucide icons

## Data sources

- TMDB
- OMDb
- Gemini (summaries)

## Local development

    npm install
    npm run dev

## Build

    npm run build

`npm run build` also updates the sitemap date from `public/data/movies.json`.

## Deployment (GitHub Pages)

This repo uses GitHub Actions to build and deploy to Pages. After pushing to `main`, the workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) publishes the site.

For the custom domain, the CNAME is stored in [public/CNAME](public/CNAME).

## Content updates

The app reads from [public/data/movies.json](public/data/movies.json). Update that file and deploy to refresh the site.

## License

MIT
