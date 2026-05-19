import { useCanvasStore } from '../store/canvasStore'

const alignmentTools = [
  { id: 'align-left', label: 'Align Left', icon: 'M4 4h2v12H4z M8 4h8v1H8z M8 9h8v1H8z M8 14h8v1H8z' },
  { id: 'align-center-h', label: 'Align Center H', icon: 'M7 4h1v12H7z M4 4h3v1H4z M4 9h3v1H4z M4 14h3v1H4z M12 4h4v1h-4z M12 9h4v1h-4z M12 14h4v1h-4z' },
  { id: 'align-right', label: 'Align Right', icon: 'M14 4h2v12h-2z M4 4h8v1H4z M4 9h8v1H4z M4 14h8v1H4z' },
  { id: 'align-top', label: 'Align Top', icon: 'M4 4v2h12V4z M4 8h1v8H4z M9 8h1v8H9z M14 8h1v8h-1z' },
  { id: 'align-center-v', label: 'Align Center V', icon: 'M4 7v1h12V7z M4 4h1v3H4z M4 12h1v4H4z M9 4h1v3H9z M9 12h1v4H9z M14 4h1v3h-1z M14 12h1v4h-1z' },
  { id: 'align-bottom', label: 'Align Bottom', icon: 'M4 14v2h12v-2z M4 4h1v8H4z M9 4h1v8H9z M14 4h1v8h-1z' },
  { id: 'distribute-h', label: 'Distribute H', icon: 'M2 6h2v8H2z M8 6h2v8H8z M14 6h2v8h-2z M5 10h6v1H5z' },
  { id: 'distribute-v', label: 'Distribute V', icon: 'M6 2v2h8V2z M6 8v2h8V8z M6 14v2h8v-2z M10 5v6h1V5z' },
]

function AlignmentButton({
  id,
  label,
  icon,
  onClick,
}: {
  id: string
  label: string
  icon: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="group relative flex h-9 w-9 items-center justify-center rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] text-[var(--color-primary)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-low)]"
    >
      <svg viewBox="0 0 18 18" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d={icon} />
      </svg>
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[var(--color-primary)] px-2 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
        {label}
      </span>
    </button>
  )
}

export function AlignmentToolbar() {
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds)
  const alignSelectedLeft = useCanvasStore((state) => state.alignSelectedLeft)
  const alignSelectedCenterH = useCanvasStore((state) => state.alignSelectedCenterH)
  const alignSelectedRight = useCanvasStore((state) => state.alignSelectedRight)
  const alignSelectedTop = useCanvasStore((state) => state.alignSelectedTop)
  const alignSelectedCenterV = useCanvasStore((state) => state.alignSelectedCenterV)
  const alignSelectedBottom = useCanvasStore((state) => state.alignSelectedBottom)
  const distributeSelectedH = useCanvasStore((state) => state.distributeSelectedH)
  const distributeSelectedV = useCanvasStore((state) => state.distributeSelectedV)

  if (selectedElementIds.length < 2) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-[8px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-2 shadow-[0_4px_12px_rgba(24,36,66,0.08)]">
      <div className="flex items-center gap-1">
        <span className="px-1 text-[11px] font-medium uppercase text-[var(--color-text-muted)]">Align:</span>
        <AlignmentButton id="align-left" label="Align Left" icon={alignmentTools[0].icon} onClick={alignSelectedLeft} />
        <AlignmentButton id="align-center-h" label="Align Center H" icon={alignmentTools[1].icon} onClick={alignSelectedCenterH} />
        <AlignmentButton id="align-right" label="Align Right" icon={alignmentTools[2].icon} onClick={alignSelectedRight} />
      </div>

      <div className="h-8 border-l border-[var(--color-outline)]" />

      <div className="flex items-center gap-1">
        <AlignmentButton id="align-top" label="Align Top" icon={alignmentTools[3].icon} onClick={alignSelectedTop} />
        <AlignmentButton id="align-center-v" label="Align Center V" icon={alignmentTools[4].icon} onClick={alignSelectedCenterV} />
        <AlignmentButton id="align-bottom" label="Align Bottom" icon={alignmentTools[5].icon} onClick={alignSelectedBottom} />
      </div>

      {selectedElementIds.length >= 3 && (
        <>
          <div className="h-8 border-l border-[var(--color-outline)]" />

          <div className="flex items-center gap-1">
            <span className="px-1 text-[11px] font-medium uppercase text-[var(--color-text-muted)]">Distribute:</span>
            <AlignmentButton id="distribute-h" label="Distribute H" icon={alignmentTools[6].icon} onClick={distributeSelectedH} />
            <AlignmentButton id="distribute-v" label="Distribute V" icon={alignmentTools[7].icon} onClick={distributeSelectedV} />
          </div>
        </>
      )}
    </div>
  )
}
