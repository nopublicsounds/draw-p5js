import { useEffect, useMemo, useState } from 'react'
import { CanvasStage } from './components/CanvasStage'
import { PropertiesPanel } from './components/PropertiesPanel'
import { ToolSidebar } from './components/ToolSidebar'
import { TopBar } from './components/TopBar'
import { useCanvasStore } from './store/canvasStore'
import { exportCanvasToP5 } from './utils/exportP5'

function App() {
  const canvas = useCanvasStore((state) => state.canvas)
  const elements = useCanvasStore((state) => state.canvas.elements)
  const selectedElementId = useCanvasStore((state) => state.selectedElementId)
  const nudgeSelectedElement = useCanvasStore((state) => state.nudgeSelectedElement)
  const deleteSelectedElement = useCanvasStore((state) => state.deleteSelectedElement)
  const duplicateSelectedElement = useCanvasStore((state) => state.duplicateSelectedElement)
  const undo = useCanvasStore((state) => state.undo)
  const redo = useCanvasStore((state) => state.redo)
  const historyLength = useCanvasStore((state) => state.history.length)
  const futureLength = useCanvasStore((state) => state.future.length)
  const [statusMessage, setStatusMessage] = useState('Select and drag elements on the canvas.')

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedElementId) ?? null,
    [elements, selectedElementId],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTextInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

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

      if (!selectedElementId || isTextInput) {
        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        deleteSelectedElement()
        return
      }

      const distance = event.shiftKey ? 10 : 1

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        nudgeSelectedElement(0, -distance)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        nudgeSelectedElement(0, distance)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        nudgeSelectedElement(-distance, 0)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        nudgeSelectedElement(distance, 0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [deleteSelectedElement, duplicateSelectedElement, nudgeSelectedElement, redo, selectedElementId, undo])

  const handleExport = async () => {
    const code = exportCanvasToP5(canvas)

    try {
      await navigator.clipboard.writeText(code)
      setStatusMessage('p5.js code copied to clipboard.')
    } catch {
      setStatusMessage('Clipboard is unavailable. Open devtools and copy from exportCanvasToP5().')
      console.info(code)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(200,90,0,0.12),_transparent_32%),linear-gradient(180deg,_#f6f1e8_0%,_#efe6d7_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 lg:px-6">
        <TopBar
          canRedo={futureLength > 0}
          canUndo={historyLength > 0}
          onExport={handleExport}
          onRedo={redo}
          onUndo={undo}
          statusMessage={statusMessage}
        />

        <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
          <ToolSidebar />
          <CanvasStage />
          <PropertiesPanel selectedElement={selectedElement} />
        </div>
      </div>
    </div>
  )
}

export default App
