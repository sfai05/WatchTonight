import { cn } from "@/lib/utils"

// Sun icon
export function IconSun({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "group/icon overflow-visible motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-105",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        className="origin-center motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/icon:scale-90"
        d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
      />
      <g className="transition-opacity duration-200 group-hover/icon:opacity-70">
        <path d="M12 5l0 .01" />
        <path d="M17 7l0 .01" />
        <path d="M19 12l0 .01" />
        <path d="M17 17l0 .01" />
        <path d="M12 19l0 .01" />
        <path d="M7 17l0 .01" />
        <path d="M5 12l0 .01" />
        <path d="M7 7l0 .01" />
      </g>
    </svg>
  )
}

// Moon icon
export function IconMoon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "overflow-visible motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-rotate-12 motion-safe:hover:scale-105",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
    </svg>
  )
}

// Play icon
export function IconPlay({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-110",
        className
      )}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
    </svg>
  )
}

// MonitorPlay icon
export function IconMonitorPlay({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-110",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <polygon points="10 8 16 12 10 16 10 8" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

// X icon
export function IconX({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:rotate-90 motion-safe:hover:scale-105",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

// Settings icon
export function IconSettings({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn(
        "overflow-visible motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:rotate-90",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeMiterlimit="10"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="5" />
      <path d="m30,17.5v-3l-3.388-1.355c-.25-.933-.617-1.815-1.089-2.633l1.436-3.351-2.121-2.121-3.351,1.436c-.817-.472-1.7-.838-2.633-1.089l-1.355-3.388h-3l-1.355,3.388c-.933.25-1.815.617-2.633,1.089l-3.351-1.436-2.121,2.121,1.436,3.351c-.472.817-.838,1.7-1.089,2.633l-3.388,1.355v3l3.388,1.355c.25.933.617,1.815,1.089,2.633l-1.436,3.351,2.121,2.121,3.351-1.436c.817.472,1.7.838,2.633,1.089l1.355,3.388h3l1.355-3.388c.933-.25,1.815-.617,2.633-1.089l3.351,1.436,2.121-2.121-1.436-3.351c.472-.817.838-1.7,1.089-2.633l3.388-1.355Z" />
    </svg>
  )
}

// Info icon
export function IconInfo({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-110",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
      <path d="M12 9h.01" />
      <path d="M11 12h1v4h1" />
    </svg>
  )
}

// Plus icon
export function IconPlus({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:rotate-90 motion-safe:hover:scale-110",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// Instagram icon
export function IconInstagram({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-110",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      <path d="M16.5 7.5v.01" />
    </svg>
  )
}

// Threads icon
export function IconThreads({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-110",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M19 7.5c-1.333 -3 -3.667 -4.5 -7 -4.5c-5 0 -8 2.5 -8 9s3.5 9 8 9s7 -3 7 -5s-1 -5 -7 -5c-2.5 0 -3 1.25 -3 2.5c0 1.5 1 2.5 2.5 2.5c2.5 0 3.5 -1.5 3.5 -5s-2 -4 -3 -4s-1.833 .333 -2.5 1" />
    </svg>
  )
}

// X (Twitter) icon
export function IconTwitterX({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-110",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  )
}
