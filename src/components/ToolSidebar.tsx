import type { EditorTool } from '../types/canvas'
import { useCanvasStore } from '../store/canvasStore'

const tools: { tool: EditorTool; label: string; hint: string }[] = [
  { tool: 'select', label: 'Select', hint: 'Move and inspect' },
  { tool: 'rect', label: 'Rect', hint: 'Draw soon' },
  { tool: 'ellipse', label: 'Ellipse', hint: 'Draw soon' },
  { tool: 'line', label: 'Line', hint: 'Draw soon' },
  { tool: 'text', label: 'Text', hint: 'Draw soon' },
  { tool: 'image', label: 'Image', hint: 'Draw soon' },
]

export function ToolSidebar() {
  const activeTool = useCanvasStore((state) => state.activeTool)
  const setActiveTool = useCanvasStore((state) => state.setActiveTool)

  return (
    <aside className="rounded-[28px] border border-white/60 bg-white/75 p-4 shadow-[0_24px_80px_rgba(76,48,11,0.12)] backdrop-blur">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800/70">Tools</p>
        <h2 className="mt-2 font-serif text-2xl text-slate-900">Palette</h2>
      </div>

      <div className="space-y-2">
        {tools.map(({ tool, label, hint }) => {
          const isActive = tool === activeTool

          return (
            <button
              key={tool}
              type="button"
              onClick={() => setActiveTool(tool)}
              className={[
                'w-full rounded-2xl border px-4 py-3 text-left transition',
                isActive
                  ? 'border-amber-500 bg-amber-100 text-slate-950 shadow-[inset_0_0_0_1px_rgba(217,119,6,0.2)]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50',
              ].join(' ')}
            >
              <div className="text-sm font-semibold">{label}</div>
              <div className="mt-1 text-xs text-slate-500">{hint}</div>
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Current slice implements selection, move, history, duplication, and export scaffolding.
      </p>
    </aside>
  )
}