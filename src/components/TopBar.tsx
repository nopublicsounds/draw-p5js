import { useCanvasStore } from '../store/canvasStore'

interface TopBarProps {
  canUndo: boolean
  canRedo: boolean
  elementCount: number
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onLoad: () => void
  onExport: () => void
  selectedElementType: string | null
  statusMessage: string
}

const CANVAS_MIN = 1
const CANVAS_MAX_SIDE = 32767
const CANVAS_MAX_AREA = 268435456

const clampSide = (value: number) => Math.max(CANVAS_MIN, Math.min(CANVAS_MAX_SIDE, Math.round(value)))

const parseInput = (value: string, fallback: number) => {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return fallback
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clampCanvasSize(width: number, height: number): [number, number] {
  let clampedWidth = clampSide(Number.isFinite(width) ? width : CANVAS_MIN)
  let clampedHeight = clampSide(Number.isFinite(height) ? height : CANVAS_MIN)

  if (clampedWidth * clampedHeight > CANVAS_MAX_AREA) {
    const ratio = Math.sqrt(CANVAS_MAX_AREA / (clampedWidth * clampedHeight))
    clampedWidth = clampSide(Math.floor(clampedWidth * ratio))
    clampedHeight = clampSide(Math.floor(clampedHeight * ratio))

    while (clampedWidth * clampedHeight > CANVAS_MAX_AREA) {
      if (clampedWidth >= clampedHeight && clampedWidth > CANVAS_MIN) {
        clampedWidth -= 1
      } else if (clampedHeight > CANVAS_MIN) {
        clampedHeight -= 1
      } else {
        break
      }
    }
  }

  return [clampedWidth, clampedHeight]
}

export function TopBar({
  canUndo,
  canRedo,
  elementCount,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onExport,
  selectedElementType,
  statusMessage,
}: TopBarProps) {
  const canvas = useCanvasStore((state) => state.canvas)
  const snapEnabled = useCanvasStore((state) => state.snapEnabled)
  const toggleSnapEnabled = useCanvasStore((state) => state.toggleSnapEnabled)
  const updateCanvasSize = useCanvasStore((state) => state.updateCanvasSize)

  const commitWidth = (rawValue: string) => {
    const nextWidth = parseInput(rawValue, canvas.width)
    const [width, height] = clampCanvasSize(nextWidth, canvas.height)
    updateCanvasSize(width, height)
  }

  const commitHeight = (rawValue: string) => {
    const nextHeight = parseInput(rawValue, canvas.height)
    const [width, height] = clampCanvasSize(canvas.width, nextHeight)
    updateCanvasSize(width, height)
  }

  return (
    <header className="rounded-[8px] border border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(24,36,66,0.15)]">
      <div className="flex flex-col gap-3 px-3 py-3 lg:flex-row lg:items-start lg:justify-between lg:py-2">
        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
          <div className="min-w-0">
            <p className="font-tech text-[11px] font-medium uppercase tracking-[0.08em] text-[#bac6ec]">P5Canvas Workspace</p>
            <h1 className="truncate text-base font-semibold tracking-[-0.01em] text-white">Visual Canvas Editor</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#eaf1ff]">
            <span className="rounded-[4px] border border-white/15 bg-white/8 px-2 py-1 font-tech">
              {canvas.width} x {canvas.height}
            </span>
            <span className="rounded-[4px] border border-white/15 bg-white/8 px-2 py-1 font-tech">
              {elementCount} element{elementCount === 1 ? '' : 's'}
            </span>
            <span className="rounded-[4px] border border-white/15 bg-white/8 px-2 py-1 font-tech">
              {selectedElementType ? `selected:${selectedElementType}` : 'selected:none'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            className="h-8 rounded-[4px] border border-white/18 px-3 text-[12px] font-medium text-white transition hover:bg-white/8"
          >
            Save
          </button>

          <button
            type="button"
            onClick={onLoad}
            className="h-8 rounded-[4px] border border-white/18 px-3 text-[12px] font-medium text-white transition hover:bg-white/8"
          >
            Load
          </button>

          <label className="flex h-8 items-center gap-2 rounded-[4px] border border-white/15 bg-white px-2 text-[12px] text-[var(--color-text)] shadow-[inset_0_-1px_0_rgba(198,198,206,0.4)]">
            <span className="font-tech text-[11px] text-[var(--color-text-muted)]">W</span>
            <input
              key={`canvas-width-${canvas.width}`}
              type="number"
              min={CANVAS_MIN}
              max={CANVAS_MAX_SIDE}
              defaultValue={canvas.width}
              onBlur={(event) => commitWidth(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitWidth((event.target as HTMLInputElement).value)
                  ;(event.target as HTMLInputElement).blur()
                }
              }}
              className="font-tech w-16 bg-transparent text-right outline-none"
            />
          </label>

          <label className="flex h-8 items-center gap-2 rounded-[4px] border border-white/15 bg-white px-2 text-[12px] text-[var(--color-text)] shadow-[inset_0_-1px_0_rgba(198,198,206,0.4)]">
            <span className="font-tech text-[11px] text-[var(--color-text-muted)]">H</span>
            <input
              key={`canvas-height-${canvas.height}`}
              type="number"
              min={CANVAS_MIN}
              max={CANVAS_MAX_SIDE}
              defaultValue={canvas.height}
              onBlur={(event) => commitHeight(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitHeight((event.target as HTMLInputElement).value)
                  ;(event.target as HTMLInputElement).blur()
                }
              }}
              className="font-tech w-16 bg-transparent text-right outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 rounded-[4px] border border-white/18 px-3 text-[12px] font-medium text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Undo
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 rounded-[4px] border border-white/18 px-3 text-[12px] font-medium text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Redo
          </button>

          <button
            type="button"
            onClick={toggleSnapEnabled}
            className={`h-8 rounded-[4px] border px-3 text-[12px] font-medium transition ${
              snapEnabled ? 'border-white/18 bg-white/10 text-white hover:bg-white/16' : 'border-white/25 text-[#dce7ff] hover:bg-white/8'
            }`}
          >
            Snap {snapEnabled ? 'On' : 'Off'}
          </button>

          <button
            type="button"
            onClick={onExport}
            className="h-8 rounded-[4px] bg-[var(--color-accent-strong)] px-3 text-[12px] font-semibold text-white transition hover:bg-[var(--color-accent)]"
          >
            Export p5.js
          </button>

        </div>
      </div>

      <div className="border-t border-white/10 px-3 py-2 font-tech text-[11px] text-[#bac6ec]">{statusMessage}</div>
    </header>
  )
}
