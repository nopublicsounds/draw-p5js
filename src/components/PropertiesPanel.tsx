import type { PropsWithChildren } from 'react'
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
    <label className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2 text-[12px] text-[var(--color-text)]">
      <span className="font-tech text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)]">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="font-tech h-8 w-full rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-2 text-right outline-none transition focus:border-[var(--color-accent)]"
      />
    </label>
  )
}

function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <section className="border-t border-[var(--color-outline)] pt-3 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[var(--color-primary)]">{title}</h3>
        <span className="font-tech text-[11px] text-[var(--color-text-muted)]">edit</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

export function PropertiesPanel({ selectedElement }: PropertiesPanelProps) {
  const canvas = useCanvasStore((state) => state.canvas)
  const updateCanvasBackground = useCanvasStore((state) => state.updateCanvasBackground)
  const updateElement = useCanvasStore((state) => state.updateElement)

  return (
    <aside className="rounded-[8px] border border-[var(--color-outline)] bg-[var(--color-surface)] p-3 shadow-[0_4px_12px_rgba(24,36,66,0.08)]">
      <div className="mb-3 border-b border-[var(--color-outline)] pb-3">
        <p className="font-tech text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Inspector</p>
        <h2 className="mt-1 text-[16px] font-semibold text-[var(--color-primary)]">Properties</h2>
      </div>

      <div className="space-y-3">
        <Section title="Canvas">
          <label className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2 text-[12px] text-[var(--color-text)]">
            <span className="font-tech text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Background</span>
            <div className="flex items-center gap-2 rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-2 py-1">
              <input
                type="color"
                value={canvas.background}
                onChange={(event) => updateCanvasBackground(event.target.value)}
                className="h-6 w-8 border-0 bg-transparent p-0"
              />
              <span className="font-tech text-[12px] text-[var(--color-text)]">{canvas.background}</span>
            </div>
          </label>
        </Section>

        {selectedElement ? (
          <>
            <div className="flex items-center justify-between rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface-low)] px-2 py-2">
              <div className="flex items-center gap-2">
                <span className="h-7 w-1 rounded-full bg-[var(--color-accent-strong)]" />
                <div>
                  <p className="font-tech text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Selected layer</p>
                  <p className="text-[13px] font-semibold capitalize text-[var(--color-primary)]">{selectedElement.type}</p>
                </div>
              </div>
              <span className="font-tech text-[11px] text-[var(--color-text-muted)]">#{selectedElement.id.slice(0, 6)}</span>
            </div>

            <Section title="Transform">
              <NumberField label="X" value={selectedElement.x} onChange={(value) => updateElement(selectedElement.id, { x: value })} />
              <NumberField label="Y" value={selectedElement.y} onChange={(value) => updateElement(selectedElement.id, { y: value })} />
              <NumberField label="Width" value={selectedElement.width} onChange={(value) => updateElement(selectedElement.id, { width: value })} />
              <NumberField label="Height" value={selectedElement.height} onChange={(value) => updateElement(selectedElement.id, { height: value })} />
              <NumberField label="Rotate" value={selectedElement.rotation} onChange={(value) => updateElement(selectedElement.id, { rotation: value })} />
              <NumberField
                label="Alpha"
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
            </Section>

            <Section title="Fill">
              <label className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 text-[12px] text-[var(--color-text)]">
                <span className="font-tech text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Fill</span>
                <div className="flex items-center gap-2 rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-2 py-1">
                  <input
                    type="color"
                    value={selectedElement.style.fill === 'none' ? '#000000' : selectedElement.style.fill}
                    onChange={(event) => updateElement(selectedElement.id, { style: { fill: event.target.value } })}
                    className="h-6 w-8 border-0 bg-transparent p-0"
                  />
                  <span className="font-tech text-[12px]">{selectedElement.style.fill}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateElement(selectedElement.id, { style: { fill: 'none' } })}
                  className="h-8 rounded-[4px] border border-[var(--color-outline)] px-2 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-low)]"
                >
                  None
                </button>
              </label>
            </Section>

            <Section title="Stroke">
              <label className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-2 text-[12px] text-[var(--color-text)]">
                <span className="font-tech text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Stroke</span>
                <div className="flex items-center gap-2 rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-2 py-1">
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
                    className="h-6 w-8 border-0 bg-transparent p-0"
                  />
                  <span className="font-tech text-[12px]">{selectedElement.style.stroke}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateElement(selectedElement.id, { style: { stroke: 'none', strokeWeight: 0 } })}
                  className="h-8 rounded-[4px] border border-[var(--color-outline)] px-2 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-low)]"
                >
                  None
                </button>
              </label>

              <NumberField
                label="Weight"
                value={selectedElement.style.strokeWeight}
                onChange={(value) => updateElement(selectedElement.id, { style: { strokeWeight: value } })}
              />
            </Section>

            {selectedElement.type === 'text' ? (
              <Section title="Typography">
                <label className="grid gap-2 text-[12px] text-[var(--color-text)]">
                  <span className="font-tech text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Text</span>
                  <textarea
                    rows={4}
                    value={selectedElement.text ?? ''}
                    onChange={(event) => updateElement(selectedElement.id, { text: event.target.value })}
                    className="min-h-24 w-full rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-2 py-2 text-[13px] outline-none transition focus:border-[var(--color-accent)]"
                  />
                </label>

                <div className="space-y-2">
                  <NumberField label="Size" value={selectedElement.fontSize ?? 24} onChange={(value) => updateElement(selectedElement.id, { fontSize: value })} />
                  <label className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2 text-[12px] text-[var(--color-text)]">
                    <span className="font-tech text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Font</span>
                    <input
                      type="text"
                      value={selectedElement.fontFamily ?? 'Georgia'}
                      onChange={(event) => updateElement(selectedElement.id, { fontFamily: event.target.value })}
                      className="h-8 w-full rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-2 outline-none transition focus:border-[var(--color-accent)]"
                    />
                  </label>
                </div>
              </Section>
            ) : null}
          </>
        ) : (
          <div className="rounded-[4px] border border-dashed border-[var(--color-outline)] bg-[var(--color-surface-low)] px-3 py-4 text-[13px] leading-5 text-[var(--color-text-muted)]">
            Choose a layer on the stage to edit transform, fill, stroke, and typography. The inspector is intentionally dense and keyboard friendly.
          </div>
        )}
      </div>
    </aside>
  )
}
