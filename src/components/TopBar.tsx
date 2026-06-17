import { useCanvasStore } from '../store/canvasStore'

interface TopBarProps {
  canUndo: boolean
  canRedo: boolean
  elementCount: number
  onUndo: () => void
  onRedo: () => void
  onExport: () => void
  onHelp: () => void
  onSettings: () => void
  selectedElementType: string | null
  statusMessage: string
}

export function TopBar({
  canUndo,
  canRedo,
  elementCount,
  onUndo,
  onRedo,
  onExport,
  onHelp,
  onSettings,
  selectedElementType,
  statusMessage,
}: TopBarProps) {
  const canvas = useCanvasStore((state) => state.canvas)

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
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="h-8 rounded-[4px] border border-white/18 px-3 text-[12px] font-medium text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-35"
          >
            ↶
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="h-8 rounded-[4px] border border-white/18 px-3 text-[12px] font-medium text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-35"
          >
            ↷
          </button>

          <div className="h-6 border-l border-white/20" />

          <button
            type="button"
            onClick={onSettings}
            title="Settings"
            className="h-8 rounded-[4px] border border-white/18 px-3 text-[12px] font-medium text-white transition hover:bg-white/8"
          >
            ☰
          </button>

          <button
            type="button"
            onClick={onHelp}
            title="Keyboard shortcuts"
            className="h-8 rounded-[4px] border border-white/18 px-3 text-[12px] font-medium text-white transition hover:bg-white/8"
          >
            ?
          </button>

          <button
            type="button"
            onClick={onExport}
            className="h-8 rounded-[4px] bg-[var(--color-accent-strong)] px-3 text-[12px] font-semibold text-white transition hover:bg-[var(--color-accent)]"
          >
            Export
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 px-3 py-2 font-tech text-[11px] text-[#bac6ec]">{statusMessage}</div>
    </header>
  )
}
