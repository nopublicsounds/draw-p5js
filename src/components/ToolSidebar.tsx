import type { EditorTool } from '../types/canvas'
import { useCanvasStore } from '../store/canvasStore'

const tools: { tool: EditorTool; label: string; hint: string }[] = [
  { tool: 'select', label: 'Select', hint: 'Move and inspect' },
  { tool: 'rect', label: 'Rect', hint: 'Click-drag to draw' },
  { tool: 'ellipse', label: 'Ellipse', hint: 'Click-drag to draw' },
  { tool: 'triangle', label: 'Triangle', hint: 'Click-drag to draw' },
  { tool: 'diamond', label: 'Diamond', hint: 'Click-drag to draw' },
  { tool: 'arc', label: 'Arc', hint: 'Click-drag to draw' },
  { tool: 'polygon', label: 'Polygon', hint: 'Click-drag to draw' },
  { tool: 'freePolygon', label: 'Free Polygon', hint: 'Click to add vertex' },
  { tool: 'line', label: 'Line', hint: 'Click-drag to draw' },
  { tool: 'text', label: 'Text', hint: 'Click to place' },
  { tool: 'image', label: 'Image', hint: 'Click for picker' },
]

const toolIcons: Record<EditorTool, string> = {
  select: 'M8 3l8 8-4 1-1 4-8-13h5z',
  rect: 'M4 5h12v10H4z',
  ellipse: 'M3 10c0-3.314 3.582-6 8-6s8 2.686 8 6-3.582 6-8 6-8-2.686-8-6z',
  triangle: 'M10 4 17 16 3 16z',
  diamond: 'M10 3 17 10 10 17 3 10z',
  arc: 'M4 11a6 6 0 1 1 12 0',
  polygon: 'M10 3 16 7 14 15 6 15 4 7z',
  freePolygon: 'M3 6 8 3 13 7 17 5 15 14 6 16z',
  line: 'M4 15 16 5',
  text: 'M5 5h10M10 5v10',
  image: 'M4 5h12v10H4zm2 7 2.5-3 2.5 2 2-2 3 3',
}

function ToolGlyph({ tool }: { tool: EditorTool }) {
  if (tool === 'line' || tool === 'text' || tool === 'image' || tool === 'triangle' || tool === 'diamond' || tool === 'arc' || tool === 'polygon' || tool === 'freePolygon') {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[1.6]" aria-hidden="true">
        <path d={toolIcons[tool]} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d={toolIcons[tool]} />
    </svg>
  )
}

export function ToolSidebar() {
  const activeTool = useCanvasStore((state) => state.activeTool)
  const setActiveTool = useCanvasStore((state) => state.setActiveTool)

  return (
    <aside className="rounded-[8px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-2 shadow-[0_4px_12px_rgba(24,36,66,0.08)] lg:min-h-0">
      <div className="mb-2 flex items-center justify-center border-b border-[var(--color-outline)] pb-2">
        <span className="font-tech text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Tools</span>
      </div>

      <div className="flex flex-row gap-2 overflow-auto lg:flex-col lg:overflow-visible">
        {tools.map(({ tool, label, hint }) => {
          const isActive = tool === activeTool

          return (
            <button
              key={tool}
              type="button"
              onClick={() => setActiveTool(tool)}
              title={`${label} · ${hint}`}
              className={[
                'group relative flex h-10 min-w-10 items-center justify-center rounded-[4px] border transition',
                isActive
                  ? 'border-[var(--color-accent)] bg-[var(--color-primary)] text-white'
                  : 'border-transparent bg-transparent text-[var(--color-primary)] hover:border-[var(--color-outline)] hover:bg-[var(--color-surface-low)]',
              ].join(' ')}
            >
              {isActive ? <span className="absolute left-0 top-1 h-8 w-[3px] rounded-r bg-[var(--color-accent-strong)] lg:-left-2" /> : null}
              <ToolGlyph tool={tool} />
              <span className="sr-only">{label}</span>
            </button>
          )
        })}
      </div>
      
    </aside>
  )
}
