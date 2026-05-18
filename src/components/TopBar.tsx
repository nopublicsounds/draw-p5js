import { useCanvasStore } from '../store/canvasStore'

interface TopBarProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onExport: () => void
  statusMessage: string
}

export function TopBar({ canUndo, canRedo, onUndo, onRedo, onExport, statusMessage }: TopBarProps) {
  const canvas = useCanvasStore((state) => state.canvas)
  const updateCanvasSize = useCanvasStore((state) => state.updateCanvasSize)

  return (
    <header className="rounded-[28px] border border-white/60 bg-white/80 px-5 py-4 shadow-[0_24px_80px_rgba(76,48,11,0.12)] backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800/70">Canvas Editor</p>
          <h1 className="mt-2 font-serif text-3xl text-slate-950">Visual to p5.js</h1>
          <p className="mt-1 text-sm text-slate-600">{statusMessage}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <span>W</span>
            <input
              type="number"
              min={100}
              value={canvas.width}
              onChange={(event) => updateCanvasSize(Number(event.target.value), canvas.height)}
              className="w-20 bg-transparent outline-none"
            />
          </label>

          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <span>H</span>
            <input
              type="number"
              min={100}
              value={canvas.height}
              onChange={(event) => updateCanvasSize(canvas.width, Number(event.target.value))}
              className="w-20 bg-transparent outline-none"
            />
          </label>

          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition enabled:hover:border-amber-400 enabled:hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Undo
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition enabled:hover:border-amber-400 enabled:hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Redo
          </button>

          <button
            type="button"
            onClick={onExport}
            className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Export p5.js
          </button>
        </div>
      </div>
    </header>
  )
}