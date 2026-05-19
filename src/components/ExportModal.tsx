import { useEffect, useMemo } from 'react'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/github.css'

hljs.registerLanguage('javascript', javascript)

interface ExportModalProps {
  isOpen: boolean
  code: string
  onClose: () => void
  onCopy: () => void
  onDownload: () => void
  onOpenInEditor: () => void
}

export function ExportModal({ isOpen, code, onClose, onCopy, onDownload, onOpenInEditor }: ExportModalProps) {
  const highlightedCode = useMemo(() => hljs.highlight(code, { language: 'javascript' }).value, [code])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,28,48,0.66)] px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-[1120px] flex-col overflow-hidden rounded-[12px] border border-[var(--color-outline)] bg-[var(--color-surface)] shadow-[0_24px_60px_rgba(24,36,66,0.28)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-outline)] px-4 py-3">
          <div>
            <p className="font-tech text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Export</p>
            <h2 className="mt-1 text-[16px] font-semibold text-[var(--color-primary)]">p5.js Sketch</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="h-9 rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-3 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-low)]"
            >
              Copy to clipboard
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="h-9 rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-3 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-low)]"
            >
              Download as sketch.js
            </button>
            <button
              type="button"
              onClick={onOpenInEditor}
              className="h-9 rounded-[4px] bg-[var(--color-accent-strong)] px-3 text-[12px] font-semibold text-white transition hover:bg-[var(--color-accent)]"
            >
              Open in p5.js Web Editor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-[4px] border border-[var(--color-outline)] bg-[var(--color-surface)] px-3 text-[12px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-low)]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-h-0 overflow-auto bg-[#f8fbff] p-4">
            <pre className="overflow-x-auto rounded-[8px] border border-[var(--color-outline)] bg-white p-4 text-[12px] leading-5 text-[#1f2a44]">
              <code className="hljs language-javascript" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            </pre>
          </div>

          <div className="border-t border-[var(--color-outline)] bg-[var(--color-surface-low)] p-4 lg:border-l lg:border-t-0">
            <div className="space-y-3">
              <div>
                <p className="font-tech text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Note</p>
                <p className="mt-2 text-[13px] leading-5 text-[var(--color-text)]">
                  If the p5.js editor request is blocked by CORS, the code is copied to the clipboard instead.
                </p>
              </div>

              <div className="rounded-[8px] border border-[var(--color-outline)] bg-white p-3">
                <p className="font-tech text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Quick Actions</p>
                <p className="mt-2 text-[13px] leading-5 text-[var(--color-text)]">
                  Use the copy button, or download the sketch.js file for local editing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
