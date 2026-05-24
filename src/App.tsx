import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { AlignmentToolbar } from './components/AlignmentToolbar'
import { CanvasStage } from './components/CanvasStage'
import { ExportModal } from './components/ExportModal'
import { PropertiesPanel } from './components/PropertiesPanel'
import { ToolSidebar } from './components/ToolSidebar'
import { TopBar } from './components/TopBar'
import { useCanvasStore } from './store/canvasStore'
import { exportCanvasToP5 } from './utils/exportP5'

const CANVAS_STATE_STORAGE_KEY = 'draw-p5js.canvas-state'

function App() {
  const canvas = useCanvasStore((state) => state.canvas)
  const elements = useCanvasStore((state) => state.canvas.elements)
  const selectedElementId = useCanvasStore((state) => state.selectedElementId)
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds)
  const nudgeSelectedElement = useCanvasStore((state) => state.nudgeSelectedElement)
  const nudgeSelectedElements = useCanvasStore((state) => state.nudgeSelectedElements)
  const deleteSelectedElement = useCanvasStore((state) => state.deleteSelectedElement)
  const deleteSelectedElements = useCanvasStore((state) => state.deleteSelectedElements)
  const duplicateSelectedElement = useCanvasStore((state) => state.duplicateSelectedElement)
  const selectAll = useCanvasStore((state) => state.selectAll)
  const setCanvasState = useCanvasStore((state) => state.setCanvasState)
  const undo = useCanvasStore((state) => state.undo)
  const redo = useCanvasStore((state) => state.redo)
  const historyLength = useCanvasStore((state) => state.history.length)
  const futureLength = useCanvasStore((state) => state.future.length)
  const [statusMessage, setStatusMessage] = useState('Select and drag elements. Export, save, or load canvas data.')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const latestCanvasRef = useRef(canvas)

  const restoredRef = useRef(false)

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedElementId) ?? null,
    [elements, selectedElementId],
  )

  const p5Code = useMemo(() => exportCanvasToP5(canvas), [canvas])

  useEffect(() => {
    latestCanvasRef.current = canvas
  }, [canvas])

  useEffect(() => {
    if (restoredRef.current) {
      return
    }

    restoredRef.current = true

    const savedCanvasState = window.localStorage.getItem(CANVAS_STATE_STORAGE_KEY)

    if (!savedCanvasState) {
      return
    }

    try {
      const parsedCanvas = JSON.parse(savedCanvasState) as typeof canvas
      setCanvasState(parsedCanvas)
    } catch (error) {
      console.warn('Saved canvas data could not be restored.', error)
    }
  }, [canvas, setCanvasState])

  useEffect(() => {
    const saveTimer = window.setInterval(() => {
      if (!restoredRef.current) {
        return
      }

      window.localStorage.setItem(CANVAS_STATE_STORAGE_KEY, JSON.stringify(latestCanvasRef.current))
    }, 30000)

    return () => window.clearInterval(saveTimer)
  }, [])


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTextInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        selectAll()
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          redo()
          return
        }

        undo()
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && selectedElementId) {
        event.preventDefault()
        duplicateSelectedElement()
        return
      }

      if ((!selectedElementId && selectedElementIds.length === 0) || isTextInput) {
        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        if (selectedElementIds.length > 1) {
          deleteSelectedElements()
        } else {
          deleteSelectedElement()
        }
        return
      }

      const distance = event.shiftKey ? 10 : 1

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (selectedElementIds.length > 1) {
          nudgeSelectedElements(0, -distance)
        } else {
          nudgeSelectedElement(0, -distance)
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (selectedElementIds.length > 1) {
          nudgeSelectedElements(0, distance)
        } else {
          nudgeSelectedElement(0, distance)
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        if (selectedElementIds.length > 1) {
          nudgeSelectedElements(-distance, 0)
        } else {
          nudgeSelectedElement(-distance, 0)
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (selectedElementIds.length > 1) {
          nudgeSelectedElements(distance, 0)
        } else {
          nudgeSelectedElement(distance, 0)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [deleteSelectedElement, deleteSelectedElements, duplicateSelectedElement, nudgeSelectedElement, nudgeSelectedElements, redo, selectedElementId, selectedElementIds, selectAll, undo])

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(canvas, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'canvas-state.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setStatusMessage('Canvas state downloaded as canvas-state.json.')
  }

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  const handleLoadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const parsedCanvas = JSON.parse(text) as typeof canvas
      setCanvasState(parsedCanvas)
      setStatusMessage('Canvas state loaded from JSON.')
    } catch {
      setStatusMessage('Could not load the selected JSON file.')
    } finally {
      event.target.value = ''
    }
  }

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true)
  }

  const handleCopyExport = async () => {
    await navigator.clipboard.writeText(p5Code)
    setStatusMessage('p5.js code copied to clipboard.')
  }

  const handleDownloadExport = () => {
    const blob = new Blob([p5Code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sketch.js'
    anchor.click()
    URL.revokeObjectURL(url)
    setStatusMessage('sketch.js downloaded.')
  }

  const handleOpenInEditor = async () => {
    try {
      const response = await fetch('https://editor.p5js.org/editor/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Canvas Editor Sketch',
          code: p5Code,
        }),
      })

      if (!response.ok) {
        throw new Error('p5 editor request failed')
      }

      setStatusMessage('p5.js Web Editor request sent.')
    } catch {
      await navigator.clipboard.writeText(p5Code)
      setStatusMessage('Could not open p5.js Web Editor due to CORS. Code copied instead.')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-ui">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-3 py-3 lg:px-4">
        <TopBar
          canRedo={futureLength > 0}
          canUndo={historyLength > 0}
          elementCount={elements.length}
          onExport={handleOpenExportModal}
          onLoad={handleLoadClick}
          onRedo={redo}
          onSave={handleSave}
          onUndo={undo}
          selectedElementType={selectedElement?.type ?? null}
          statusMessage={statusMessage}
        />

        <input ref={fileInputRef} accept="application/json" className="hidden" type="file" onChange={handleLoadFile} />

        <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-[56px_minmax(0,1fr)_280px] xl:grid-cols-[56px_minmax(0,1fr)_280px]">
          <ToolSidebar />
          <div className="flex flex-col gap-4">
            <CanvasStage />
            <AlignmentToolbar />
          </div>
          <PropertiesPanel selectedElement={selectedElement} />
        </div>

        <ExportModal
          code={p5Code}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onCopy={handleCopyExport}
          onDownload={handleDownloadExport}
          onOpenInEditor={handleOpenInEditor}
        />
      </div>
    </div>
  )
}

export default App
