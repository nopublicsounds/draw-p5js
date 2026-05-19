import { useEffect, useMemo, useState } from 'react'
import { CanvasStage } from './components/CanvasStage'
import { AlignmentToolbar } from './components/AlignmentToolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { ToolSidebar } from './components/ToolSidebar'
import { TopBar } from './components/TopBar'
import { useCanvasStore } from './store/canvasStore'
import { exportCanvasToP5 } from './utils/exportP5'

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
  const undo = useCanvasStore((state) => state.undo)
  const redo = useCanvasStore((state) => state.redo)
  const historyLength = useCanvasStore((state) => state.history.length)
  const futureLength = useCanvasStore((state) => state.future.length)
  const [statusMessage, setStatusMessage] = useState('Select and drag elements. Export copies p5.js to the clipboard.')

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
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-ui">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-3 py-3 lg:px-4">
        <TopBar
          canRedo={futureLength > 0}
          canUndo={historyLength > 0}
          elementCount={elements.length}
          onExport={handleExport}
          onRedo={redo}
          onUndo={undo}
          selectedElementType={selectedElement?.type ?? null}
          statusMessage={statusMessage}
        />

        <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-[56px_minmax(0,1fr)_280px] xl:grid-cols-[56px_minmax(0,1fr)_280px]">
          <ToolSidebar />
          <div className="flex flex-col gap-4">
            <CanvasStage />
            <AlignmentToolbar />
          </div>
          <PropertiesPanel selectedElement={selectedElement} />
        </div>
      </div>
    </div>
  )
}

export default App
