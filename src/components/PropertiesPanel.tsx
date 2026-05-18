import type { CanvasElement } from '../types/canvas'
import { useCanvasStore } from '../store/canvasStore'

interface PropertiesPanelProps {
  selectedElement: CanvasElement | null
}

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
}

function NumberField({ label, value, onChange, step = 1 }: NumberFieldProps) {
  return (
    <label className="space-y-2 text-sm text-slate-700">
      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-amber-400"
      />
    </label>
  )
}

export function PropertiesPanel({ selectedElement }: PropertiesPanelProps) {
  const canvas = useCanvasStore((state) => state.canvas)
  const updateCanvasBackground = useCanvasStore((state) => state.updateCanvasBackground)
  const updateElement = useCanvasStore((state) => state.updateElement)

  return (
    <aside className="rounded-[28px] border border-white/60 bg-white/75 p-4 shadow-[0_24px_80px_rgba(76,48,11,0.12)] backdrop-blur">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800/70">Inspector</p>
        <h2 className="mt-2 font-serif text-2xl text-slate-900">Properties</h2>
      </div>

      <div className="space-y-4">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Background</span>
          <input
            type="color"
            value={canvas.background}
            onChange={(event) => updateCanvasBackground(event.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-2"
          />
        </label>

        {selectedElement ? (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Selected</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{selectedElement.type}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="X"
                value={selectedElement.x}
                onChange={(value) => updateElement(selectedElement.id, { x: value })}
              />
              <NumberField
                label="Y"
                value={selectedElement.y}
                onChange={(value) => updateElement(selectedElement.id, { y: value })}
              />
              <NumberField
                label="Width"
                value={selectedElement.width}
                onChange={(value) => updateElement(selectedElement.id, { width: value })}
              />
              <NumberField
                label="Height"
                value={selectedElement.height}
                onChange={(value) => updateElement(selectedElement.id, { height: value })}
              />
              <NumberField
                label="Rotation"
                value={selectedElement.rotation}
                onChange={(value) => updateElement(selectedElement.id, { rotation: value })}
              />
              <NumberField
                label="Opacity"
                value={selectedElement.style.opacity}
                step={0.05}
                onChange={(value) =>
                  updateElement(selectedElement.id, {
                    style: {
                      opacity: Math.max(0, Math.min(1, value)),
                    },
                  })
                }
              />
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fill</span>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.style.fill === 'none' ? '#000000' : selectedElement.style.fill}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      style: {
                        fill: event.target.value,
                      },
                    })
                  }
                  className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-2"
                />
                <button
                  type="button"
                  onClick={() => updateElement(selectedElement.id, { style: { fill: 'none' } })}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  None
                </button>
              </div>
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Stroke</span>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.style.stroke === 'none' ? '#000000' : selectedElement.style.stroke}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      style: {
                        stroke: event.target.value,
                        strokeWeight: selectedElement.style.strokeWeight || 1,
                      },
                    })
                  }
                  className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-2"
                />
                <button
                  type="button"
                  onClick={() => updateElement(selectedElement.id, { style: { stroke: 'none', strokeWeight: 0 } })}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  None
                </button>
              </div>
            </label>

            <NumberField
              label="Stroke Weight"
              value={selectedElement.style.strokeWeight}
              onChange={(value) =>
                updateElement(selectedElement.id, {
                  style: {
                    strokeWeight: value,
                  },
                })
              }
            />

            {selectedElement.type === 'text' ? (
              <>
                <label className="space-y-2 text-sm text-slate-700">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Text</span>
                  <textarea
                    rows={4}
                    value={selectedElement.text ?? ''}
                    onChange={(event) => updateElement(selectedElement.id, { text: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-amber-400"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Font Size"
                    value={selectedElement.fontSize ?? 24}
                    onChange={(value) => updateElement(selectedElement.id, { fontSize: value })}
                  />
                  <label className="space-y-2 text-sm text-slate-700">
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Font Family</span>
                    <input
                      type="text"
                      value={selectedElement.fontFamily ?? 'Georgia'}
                      onChange={(event) => updateElement(selectedElement.id, { fontFamily: event.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-amber-400"
                    />
                  </label>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600">
            Select an element to edit its position, size, and style. The canvas starts with sample content so you can test move and export immediately.
          </div>
        )}
      </div>
    </aside>
  )
}