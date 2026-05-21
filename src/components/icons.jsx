import { motion, useAnimate } from "motion/react"
import { useCallback } from "react"

// Sun icon — brightness-down-icon style from itshover
export function IconSun({ className }) {
  const [scope, animate] = useAnimate()

  const start = () => {
    animate(".sun-center", { scale: [1, 0.8, 1] }, { duration: 0.4, ease: "easeInOut" })
    animate(".sun-rays", { opacity: [1, 0.4, 1] }, { duration: 0.5, ease: "easeInOut" })
  }
  const stop = () => {
    animate(".sun-center", { scale: 1 }, { duration: 0.2, ease: "easeOut" })
    animate(".sun-rays", { opacity: 1 }, { duration: 0.2, ease: "easeOut" })
  }

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      onHoverStart={start}
      onHoverEnd={stop}
      style={{ overflow: "visible" }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.path
        className="sun-center"
        d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
        style={{ transformOrigin: "center" }}
      />
      <motion.g className="sun-rays">
        <path d="M12 5l0 .01" />
        <path d="M17 7l0 .01" />
        <path d="M19 12l0 .01" />
        <path d="M17 17l0 .01" />
        <path d="M12 19l0 .01" />
        <path d="M7 17l0 .01" />
        <path d="M5 12l0 .01" />
        <path d="M7 7l0 .01" />
      </motion.g>
    </motion.svg>
  )
}

// Moon icon — moon-icon from itshover
export function IconMoon({ className }) {
  const [scope, animate] = useAnimate()

  const start = async () => {
    await animate(".moon", { rotate: [0, -15, 0], scale: [1, 1.1, 1] }, { duration: 0.5, ease: "easeInOut" })
  }
  const stop = () => {
    animate(".moon", { rotate: 0, scale: 1 }, { duration: 0.2, ease: "easeOut" })
  }

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      onHoverStart={start}
      onHoverEnd={stop}
      style={{ overflow: "visible" }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.path
        className="moon"
        d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"
        style={{ transformOrigin: "center" }}
      />
    </motion.svg>
  )
}

// Play icon — player-icon from itshover
export function IconPlay({ className }) {
  const [scope, animate] = useAnimate()

  const start = useCallback(async () => {
    await animate(".play-icon", { scale: [1, 0.8] }, { duration: 0.4, ease: "easeOut" })
  }, [animate])
  const stop = useCallback(async () => {
    await animate(".play-icon", { scale: [0.8, 1] }, { duration: 0.4, ease: "easeOut" })
  }, [animate])

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      onHoverStart={start}
      onHoverEnd={stop}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.path
        className="play-icon"
        d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"
        style={{ transformOrigin: "50% 50%" }}
      />
    </motion.svg>
  )
}

// MonitorPlay icon — custom with motion animation
export function IconMonitorPlay({ className }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <polygon points="10 8 16 12 10 16 10 8" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </motion.svg>
  )
}

// X icon — x-icon from itshover
export function IconX({ className }) {
  const [scope, animate] = useAnimate()

  const start = useCallback(async () => {
    animate(".x-line-1", { rotate: 15, scale: 1.1 }, { duration: 0.2, ease: "easeOut" })
    animate(".x-line-2", { rotate: -15, scale: 1.1 }, { duration: 0.2, ease: "easeOut" })
  }, [animate])
  const stop = useCallback(async () => {
    animate(".x-line-1", { rotate: 0, scale: 1 }, { duration: 0.2, ease: "easeInOut" })
    animate(".x-line-2", { rotate: 0, scale: 1 }, { duration: 0.2, ease: "easeInOut" })
  }, [animate])

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      onHoverStart={start}
      onHoverEnd={stop}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.path d="M18 6l-12 12" className="x-line-1" style={{ transformOrigin: "50% 50%" }} />
      <motion.path d="M6 6l12 12" className="x-line-2" style={{ transformOrigin: "50% 50%" }} />
    </motion.svg>
  )
}

// Settings icon — gear-icon from itshover
export function IconSettings({ className }) {
  const [scope, animate] = useAnimate()

  const start = () => {
    animate(".gear-body", { scale: [1, 1.02, 1] }, { duration: 0.6 })
    animate(".gear-center", { scale: [1, 1.1, 1] }, { duration: 0.3, ease: "easeOut" })
    animate(".gear-rotator", { rotate: 360 }, { duration: 0.9, ease: "easeInOut" })
  }
  const stop = () => {
    animate(".gear-rotator", { rotate: 0 }, { duration: 0.2 })
    animate(".gear-center", { scale: 1 }, { duration: 0.2 })
    animate(".gear-body", { scale: 1 }, { duration: 0.2 })
  }

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeMiterlimit="10"
      aria-hidden="true"
      onHoverStart={start}
      onHoverEnd={stop}
      style={{ overflow: "visible" }}
    >
      <motion.g
        className="gear-rotator"
        style={{ transformOrigin: "50% 50%", transformBox: "fill-box" }}
      >
        <motion.circle className="gear-center" cx="16" cy="16" r="5" />
        <motion.path
          className="gear-body"
          d="m30,17.5v-3l-3.388-1.355c-.25-.933-.617-1.815-1.089-2.633l1.436-3.351-2.121-2.121-3.351,1.436c-.817-.472-1.7-.838-2.633-1.089l-1.355-3.388h-3l-1.355,3.388c-.933.25-1.815.617-2.633,1.089l-3.351-1.436-2.121,2.121,1.436,3.351c-.472.817-.838,1.7-1.089,2.633l-3.388,1.355v3l3.388,1.355c.25.933.617,1.815,1.089,2.633l-1.436,3.351,2.121,2.121,3.351-1.436c.817.472,1.7.838,2.633,1.089l1.355,3.388h3l1.355-3.388c.933-.25,1.815-.617,2.633-1.089l3.351,1.436,2.121-2.121-1.436-3.351c.472-.817.838-1.7,1.089-2.633l3.388-1.355Z"
        />
      </motion.g>
    </motion.svg>
  )
}

// Info icon — info-circle-icon from itshover
export function IconInfo({ className }) {
  const [scope, animate] = useAnimate()

  const start = useCallback(async () => {
    await animate(".info-circle-i", { pathLength: [0, 1] }, { duration: 0.3, ease: "easeOut" })
    animate(".info-line-i", { pathLength: [0, 1] }, { duration: 0.4, ease: "easeOut" })
  }, [animate])
  const stop = useCallback(() => {
    animate(".info-circle-i, .info-line-i", { pathLength: 1 }, { duration: 0.2, ease: "easeInOut" })
  }, [animate])

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      onHoverStart={start}
      onHoverEnd={stop}
    >
      <motion.path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" className="info-circle" />
      <motion.path d="M12 9h.01" className="info-circle-i" />
      <motion.path d="M11 12h1v4h1" className="info-line-i" />
    </motion.svg>
  )
}

// Plus icon — custom with motion animation
export function IconPlus({ className }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      whileHover={{ scale: 1.15 }}
      transition={{ duration: 0.2 }}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </motion.svg>
  )
}

// Instagram icon — instagram-icon from itshover
export function IconInstagram({ className }) {
  const [scope, animate] = useAnimate()

  const start = useCallback(async () => {
    animate(".ig-body", { scale: [1, 1.05, 1] }, { duration: 0.3, ease: "easeOut" })
    await animate(".ig-lens", { scale: [1, 1.2, 1] }, { duration: 0.25, ease: "easeOut" })
    animate(".ig-dot", { opacity: [1, 0, 1] }, { duration: 0.2, ease: "easeInOut" })
  }, [animate])
  const stop = useCallback(() => {
    animate(".ig-body, .ig-lens, .ig-dot", { scale: 1, opacity: 1 }, { duration: 0.2, ease: "easeInOut" })
  }, [animate])

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      onHoverStart={start}
      onHoverEnd={stop}
    >
      <motion.path className="ig-body" style={{ transformOrigin: "50% 50%" }} d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
      <motion.path className="ig-lens" style={{ transformOrigin: "50% 50%" }} d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      <motion.path className="ig-dot" d="M16.5 7.5v.01" />
    </motion.svg>
  )
}

// Threads icon — brand-threads-icon from itshover
export function IconThreads({ className }) {
  const [scope, animate] = useAnimate()

  const start = async () => {
    animate(scope.current, { scale: 1, rotate: 0 })
    animate(".threads-path", { pathLength: 1, opacity: 1 })
    animate(".threads-path", { pathLength: [0, 1], opacity: [0, 1] }, { duration: 1, ease: "easeInOut" })
    await animate(scope.current, { scale: [0.5, 1.1, 1], rotate: [180, -10, 0] }, { duration: 1, ease: [0.34, 1.56, 0.64, 1] })
  }
  const stop = () => {
    animate(scope.current, { scale: 1, rotate: 0 })
    animate(".threads-path", { pathLength: 1, opacity: 1 })
  }

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      onHoverStart={start}
      onHoverEnd={stop}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.path
        className="threads-path"
        d="M19 7.5c-1.333 -3 -3.667 -4.5 -7 -4.5c-5 0 -8 2.5 -8 9s3.5 9 8 9s7 -3 7 -5s-1 -5 -7 -5c-2.5 0 -3 1.25 -3 2.5c0 1.5 1 2.5 2.5 2.5c2.5 0 3.5 -1.5 3.5 -5s-2 -4 -3 -4s-1.833 .333 -2.5 1"
      />
    </motion.svg>
  )
}

// X (Twitter) icon — twitter-x-icon from itshover
export function IconTwitterX({ className }) {
  const [scope, animate] = useAnimate()

  const start = useCallback(async () => {
    await animate(".x-brand", { scale: [1, 1.1, 1], rotate: [0, -10, 10, 0] }, { duration: 0.5, ease: "easeInOut" })
  }, [animate])
  const stop = useCallback(() => {
    animate(".x-brand", { scale: 1, rotate: 0 }, { duration: 0.2, ease: "easeOut" })
  }, [animate])

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      onHoverStart={start}
      onHoverEnd={stop}
    >
      <motion.g className="x-brand" style={{ transformOrigin: "center" }}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </motion.g>
    </motion.svg>
  )
}

// PanelToggle icon — down-chevron from itshover, rotated when collapsed
export function IconPanelToggle({ className, collapsed = false }) {
  const [scope, animate] = useAnimate()

  const start = useCallback(async () => {
    await animate(".chevron-down", { y: [0, 6, 0] }, { duration: 0.8, ease: "easeInOut" })
  }, [animate])
  const stop = useCallback(() => {
    animate(".chevron-down", { y: 0 }, { duration: 0.2, ease: "easeInOut" })
  }, [animate])

  return (
    <motion.svg
      ref={scope}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      animate={{ rotate: collapsed ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      onHoverStart={start}
      onHoverEnd={stop}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 9l6 6l6 -6" className="chevron-down" />
    </motion.svg>
  )
}
