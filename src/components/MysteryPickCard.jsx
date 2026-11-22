export function MysteryPickCard({
  poolCount,
  kind = "movies",
  serviceName = "",
  onPick,
}) {
  const kindLabel = kind === "tv" ? "series" : "movies"
  const poolSummary = serviceName
    ? `${poolCount} on ${serviceName}`
    : `${poolCount} ${kindLabel} tonight`

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={poolCount === 0}
      data-umami-event="Feeling lucky"
      data-umami-event-tab={kind}
      className="brand-surface brand-surface-gold group flex h-full w-full cursor-pointer flex-col gap-3 rounded-[1.55rem] p-2 text-left transition-shadow duration-500 ease-out motion-safe:transition-[transform,box-shadow,border-color] motion-safe:hover:-translate-y-0.5 hover:shadow-[0_36px_88px_rgba(0,0,0,0.44),_0_8px_20px_rgba(0,0,0,0.2)] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="relative flex aspect-[2/3] w-full flex-col items-center justify-between overflow-hidden rounded-[1.2rem] border border-[#d68e25]/35 bg-[radial-gradient(circle_at_50%_28%,rgba(214,142,37,0.24),transparent_62%),linear-gradient(180deg,#162926_0%,#0e1a18_100%)] p-3 text-center sm:p-4">
        <span className="brand-halftone absolute inset-0 opacity-25" aria-hidden="true" />

        <span
          aria-hidden="true"
          className="relative z-10 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-brand-gold"
        >
          Wildcard
        </span>

        <span className="relative z-10 my-auto flex flex-col items-center gap-2 sm:gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d68e25]/55 bg-[rgba(214,142,37,0.16)] text-xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:rotate-12 motion-safe:group-hover:scale-110 sm:h-12 sm:w-12 sm:text-2xl"
          >
            🎲
          </span>
          <span className="flex flex-col gap-1">
            <span className="block font-display text-base font-extrabold leading-tight tracking-[-0.03em] text-brand-cream sm:text-lg">
              Can&rsquo;t decide?
            </span>
            <span className="block text-xs leading-snug text-brand-text-soft">
              {serviceName
                ? `Roll a pick on ${serviceName}`
                : "Roll a random pick from tonight\u2019s list"}
            </span>
          </span>
        </span>

        <span className="relative z-10 inline-flex w-full items-center justify-center rounded-full bg-primary px-2.5 py-1.5 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-primary-foreground transition-colors group-hover:bg-[#e19b33] sm:px-3.5 sm:py-2 sm:tracking-[0.11em]">
          Feeling lucky?
        </span>
      </span>

      <span className="block px-1 pb-1.5">
        <span className="mb-1 block text-sm font-semibold leading-tight text-brand-cream line-clamp-2">
          Surprise pick
        </span>
        <span className="mt-0.5 block text-xs text-brand-text-soft line-clamp-1">
          {poolSummary}
        </span>
      </span>
    </button>
  )
}
