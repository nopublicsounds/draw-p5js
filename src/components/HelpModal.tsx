import { useEffect } from 'react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts: { keys: string[]; description: string }[][] = [
  [
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Ctrl', 'Y'], description: 'Redo' },
    { keys: ['Ctrl', 'A'], description: 'Select all' },
    { keys: ['Ctrl', 'D'], description: 'Duplicate selected' },
    { keys: ['Ctrl', 'C'], description: 'Copy selected' },
    { keys: ['Ctrl', 'V'], description: 'Paste' },
  ],
  [
    { keys: ['Delete', 'Backspace'], description: 'Delete selected' },
    { keys: ['↑ ↓ ← →'], description: 'Nudge by 1px' },
    { keys: ['Shift', '↑ ↓ ← →'], description: 'Nudge by 10px' },
    { keys: ['Esc'], description: 'Close modal / deselect' },
  ],
]

function KeyBadge({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface-low)] px-1.5 py-0.5 font-tech text-[11px] text-[var(--color-text)]">
      {label}
    </kbd>
  )
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

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
            <p className="font-tech text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Reference</p>
            <h2 className="mt-0.5 text-[16px] font-semibold text-[var(--color-primary)]">Keyboard Shortcuts</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-[4px] border border-[var(--color-outline)] px-3 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-low)]"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-0 divide-x divide-[var(--color-outline)]">
          {shortcuts.map((group, gi) => (
            <div key={gi} className="p-4">
              <ul className="space-y-3">
                {group.map(({ keys, description }) => (
                  <li key={description} className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-[var(--color-text)]">{description}</span>
                    <span className="flex shrink-0 flex-wrap justify-end gap-1">
                      {keys.map((k) => (
                        <KeyBadge key={k} label={k} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
