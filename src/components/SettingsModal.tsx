import { useEffect, useState } from 'react'
import { useCanvasStore } from '../store/canvasStore'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onLoad: () => void
}

const CANVAS_MIN = 1
const CANVAS_MAX_SIDE = 32767
const CANVAS_MAX_AREA = 268435456

const clampSide = (value: number) => Math.max(CANVAS_MIN, Math.min(CANVAS_MAX_SIDE, Math.round(value)))

const parseInput = (value: string, fallback: number) => {
  const trimmed = value.trim()
  if (trimmed.length === 0) return fallback
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

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="font-tech w-8 text-[11px] font-medium uppercase text-[var(--color-text-muted)]">{label}</span>
      <input
        key={`${label}-${value}`}
        type="number"
        defaultValue={value}
        min={CANVAS_MIN}
        max={CANVAS_MAX_SIDE}
        onBlur={(e) => onChange(parseInput(e.target.value, value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onChange(parseInput((e.target as HTMLInputElement).value, value))
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        className="font-tech h-8 w-24 rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-2 text-right outline-none focus:border-[var(--color-accent)]"
      />
    </label>
  )
}

export function SettingsModal({ isOpen, onClose, onSave, onLoad }: SettingsModalProps) {
  const canvas = useCanvasStore((state) => state.canvas)
  const updateCanvasSize = useCanvasStore((state) => state.updateCanvasSize)
  const updateCanvasBackground = useCanvasStore((state) => state.updateCanvasBackground)
  const [bgColor, setBgColor] = useState(canvas.background)

  useEffect(() => {
    if (isOpen) {
      setBgColor(canvas.background)
    }
  }, [isOpen, canvas.background])

  const handleWidthChange = (w: number) => {
    const [width, height] = clampCanvasSize(w, canvas.height)
    updateCanvasSize(width, height)
  }

  const handleHeightChange = (h: number) => {
    const [width, height] = clampCanvasSize(canvas.width, h)
    updateCanvasSize(width, height)
  }

  const handleBgColorChange = (color: string) => {
    setBgColor(color)
    updateCanvasBackground(color)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose()
  }

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,28,48,0.66)] px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] overflow-hidden rounded-[12px] border border-[var(--color-outline)] bg-[var(--color-surface)] shadow-[0_24px_60px_rgba(24,36,66,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-outline)] px-4 py-3">
          <div>
            <p className="font-tech text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Settings</p>
            <h2 className="mt-0.5 text-[16px] font-semibold text-[var(--color-primary)]">Canvas Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-[4px] border border-[var(--color-outline)] px-3 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-low)]"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-[12px] font-medium uppercase text-[var(--color-text-muted)]">Canvas Size</p>
            <div className="flex gap-3">
              <NumberInput label="Width" value={canvas.width} onChange={handleWidthChange} />
              <NumberInput label="Height" value={canvas.height} onChange={handleHeightChange} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-medium uppercase text-[var(--color-text-muted)]">Background Color</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => handleBgColorChange(e.target.value)}
                className="h-8 w-12 cursor-pointer rounded-[4px] border border-[var(--color-outline)]"
              />
              <span className="font-tech text-[12px] text-[var(--color-text)]">{bgColor}</span>
            </div>
          </div>

          <div className="border-t border-[var(--color-outline)] pt-4">
            <p className="mb-3 text-[12px] font-medium uppercase text-[var(--color-text-muted)]">Data</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onSave()
                  onClose()
                }}
                className="flex-1 rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-3 py-2 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-low)]"
              >
                Save Canvas
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoad()
                  onClose()
                }}
                className="flex-1 rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-3 py-2 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-low)]"
              >
                Load Canvas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
