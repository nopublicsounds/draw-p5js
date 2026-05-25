import { create } from 'zustand'
import type { CanvasElement, CanvasState, EditorTool, ElementStyle } from '../types/canvas'

const HISTORY_LIMIT = 50

const defaultStyle = {
  fill: '#4A90D9',
  stroke: 'none',
  strokeWeight: 0,
  opacity: 1,
}

const initialCanvas: CanvasState = {
  width: 800,
  height: 600,
  background: '#f8fafc',
  elements: []
}

const cloneCanvasState = (canvas: CanvasState): CanvasState => structuredClone(canvas)

const cloneElement = (element: CanvasElement): CanvasElement => structuredClone(element)

const pushHistory = (history: CanvasState[], canvas: CanvasState) => {
  const nextHistory = [...history, cloneCanvasState(canvas)]
  return nextHistory.slice(-HISTORY_LIMIT)
}

interface CanvasStore {
  canvas: CanvasState
  selectedElementId: string | null
  selectedElementIds: string[]
  activeTool: EditorTool
  history: CanvasState[]
  future: CanvasState[]
  setActiveTool: (tool: EditorTool) => void
  selectElement: (id: string | null) => void
  selectElements: (ids: string[]) => void
  addToSelection: (id: string) => void
  removeFromSelection: (id: string) => void
  toggleSelection: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  /** Replace the entire canvas state after loading JSON or restoring from storage. */
  setCanvasState: (canvas: CanvasState) => void
  updateCanvasSize: (width: number, height: number) => void
  updateCanvasBackground: (background: string) => void
  addElement: (element: CanvasElement) => void
  updateElement: (
    id: string,
    updates: Omit<Partial<CanvasElement>, 'style'> & { style?: Partial<ElementStyle> },
    recordHistory?: boolean,
  ) => void
  deleteSelectedElement: () => void
  deleteSelectedElements: () => void
  duplicateSelectedElement: () => void
  nudgeSelectedElement: (dx: number, dy: number) => void
  nudgeSelectedElements: (dx: number, dy: number) => void
  moveForward: (id: string) => void
  moveBackward: (id: string) => void
  moveToFront: (id: string) => void
  moveToBack: (id: string) => void
  alignSelectedLeft: () => void
  alignSelectedCenterH: () => void
  alignSelectedRight: () => void
  alignSelectedTop: () => void
  alignSelectedCenterV: () => void
  alignSelectedBottom: () => void
  distributeSelectedH: () => void
  distributeSelectedV: () => void
  undo: () => void
  redo: () => void
  pushHistorySnapshot: (snapshot: CanvasState) => void
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  canvas: initialCanvas,
  selectedElementId: null,
  selectedElementIds: [],
  activeTool: 'select',
  history: [],
  future: [],
  setActiveTool: (tool) => set({ activeTool: tool }),
  selectElement: (id) => set({ selectedElementId: id, selectedElementIds: id ? [id] : [] }),
  selectElements: (ids) => set({ selectedElementIds: ids, selectedElementId: ids.length === 1 ? ids[0] : (ids.length > 1 ? ids[0] : null) }),
  addToSelection: (id) => {
    const state = get()
    if (!state.selectedElementIds.includes(id)) {
      set({ selectedElementIds: [...state.selectedElementIds, id] })
    }
  },
  removeFromSelection: (id) => {
    const state = get()
    const newIds = state.selectedElementIds.filter((_id) => _id !== id)
    set({ selectedElementIds: newIds, selectedElementId: newIds.length === 1 ? newIds[0] : null })
  },
  toggleSelection: (id) => {
    const state = get()
    if (state.selectedElementIds.includes(id)) {
      get().removeFromSelection(id)
    } else {
      get().addToSelection(id)
    }
  },
  selectAll: () => {
    const state = get()
    const allIds = state.canvas.elements.map((e) => e.id)
    set({ selectedElementIds: allIds })
  },
  clearSelection: () => set({ selectedElementId: null, selectedElementIds: [] }),
  setCanvasState: (canvas) =>
    set({
      canvas: cloneCanvasState(canvas),
      selectedElementId: null,
      selectedElementIds: [],
      activeTool: 'select',
      history: [],
      future: [],
    }),
  updateCanvasSize: (width, height) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        width,
        height,
      },
      history: pushHistory(state.history, state.canvas),
      future: [],
    }))
  },
  updateCanvasBackground: (background) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        background,
      },
      history: pushHistory(state.history, state.canvas),
      future: [],
    }))
  },
  addElement: (element) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: [...state.canvas.elements, cloneElement(element)],
      },
      selectedElementId: element.id,
      selectedElementIds: [element.id],
      activeTool: 'select',
      history: pushHistory(state.history, state.canvas),
      future: [],
    }))
  },
  updateElement: (id, updates, recordHistory = true) => {
    set((state) => {
      const elementExists = state.canvas.elements.some((element) => element.id === id)

      if (!elementExists) {
        return state
      }

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((element) =>
            element.id === id
              ? {
                  ...element,
                  ...updates,
                  style: updates.style
                    ? {
                        ...element.style,
                        ...updates.style,
                      }
                    : element.style,
                }
              : element,
          ),
        },
        history: recordHistory ? pushHistory(state.history, state.canvas) : state.history,
        future: recordHistory ? [] : state.future,
      }
    })
  },
  deleteSelectedElement: () => {
    set((state) => {
      if (!state.selectedElementId) {
        return state
      }

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.filter((element) => element.id !== state.selectedElementId),
        },
        selectedElementId: null,
        selectedElementIds: [],
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  deleteSelectedElements: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) {
        return state
      }

      const selectedSet = new Set(state.selectedElementIds)
      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.filter((element) => !selectedSet.has(element.id)),
        },
        selectedElementId: null,
        selectedElementIds: [],
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  duplicateSelectedElement: () => {
    set((state) => {
      const selectedElement = state.canvas.elements.find(
        (element) => element.id === state.selectedElementId,
      )

      if (!selectedElement) {
        return state
      }

      const duplicate: CanvasElement = {
        ...cloneElement(selectedElement),
        id: crypto.randomUUID(),
        x: selectedElement.x + 24,
        y: selectedElement.y + 24,
        x2: selectedElement.x2 !== undefined ? selectedElement.x2 + 24 : undefined,
        y2: selectedElement.y2 !== undefined ? selectedElement.y2 + 24 : undefined,
      }

      return {
        canvas: {
          ...state.canvas,
          elements: [...state.canvas.elements, duplicate],
        },
        selectedElementId: duplicate.id,
        selectedElementIds: [duplicate.id],
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  nudgeSelectedElement: (dx, dy) => {
    const { selectedElementId } = get()

    if (!selectedElementId) {
      return
    }

    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.map((element) =>
          element.id === selectedElementId
            ? {
                ...element,
                x: element.x + dx,
                y: element.y + dy,
                x2: element.x2 !== undefined ? element.x2 + dx : undefined,
                y2: element.y2 !== undefined ? element.y2 + dy : undefined,
              }
            : element,
        ),
      },
      history: pushHistory(state.history, state.canvas),
      future: [],
    }))
  },
  nudgeSelectedElements: (dx, dy) => {
    const { selectedElementIds } = get()

    if (selectedElementIds.length === 0) {
      return
    }

    const selectedSet = new Set(selectedElementIds)
    set((state) => ({
      canvas: {
        ...state.canvas,
        elements: state.canvas.elements.map((element) =>
          selectedSet.has(element.id)
            ? {
                ...element,
                x: element.x + dx,
                y: element.y + dy,
                x2: element.x2 !== undefined ? element.x2 + dx : undefined,
                y2: element.y2 !== undefined ? element.y2 + dy : undefined,
              }
            : element,
        ),
      },
      history: pushHistory(state.history, state.canvas),
      future: [],
    }))
  },
  moveForward: (id) => {
    set((state) => {
      const index = state.canvas.elements.findIndex((e) => e.id === id)
      if (index === -1 || index === state.canvas.elements.length - 1) return state

      const elements = [...state.canvas.elements]
      ;[elements[index], elements[index + 1]] = [elements[index + 1], elements[index]]

      return {
        canvas: { ...state.canvas, elements },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  moveBackward: (id) => {
    set((state) => {
      const index = state.canvas.elements.findIndex((e) => e.id === id)
      if (index === -1 || index === 0) return state

      const elements = [...state.canvas.elements]
      ;[elements[index], elements[index - 1]] = [elements[index - 1], elements[index]]

      return {
        canvas: { ...state.canvas, elements },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  moveToFront: (id) => {
    set((state) => {
      const index = state.canvas.elements.findIndex((e) => e.id === id)
      if (index === -1 || index === state.canvas.elements.length - 1) return state

      const elements = [...state.canvas.elements]
      const element = elements.splice(index, 1)[0]
      elements.push(element)

      return {
        canvas: { ...state.canvas, elements },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  moveToBack: (id) => {
    set((state) => {
      const index = state.canvas.elements.findIndex((e) => e.id === id)
      if (index === -1 || index === 0) return state

      const elements = [...state.canvas.elements]
      const element = elements.splice(index, 1)[0]
      elements.unshift(element)

      return {
        canvas: { ...state.canvas, elements },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  alignSelectedLeft: () => {
    set((state) => {
      const { selectedElementIds } = get()
      if (selectedElementIds.length < 2) return state

      const selectedElements = state.canvas.elements.filter((e) => selectedElementIds.includes(e.id))
      const minX = Math.min(...selectedElements.map((e) => e.x))

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((e) =>
            selectedElementIds.includes(e.id) ? { ...e, x: minX } : e
          ),
        },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  alignSelectedCenterH: () => {
    set((state) => {
      const { selectedElementIds } = get()
      if (selectedElementIds.length < 2) return state

      const selectedElements = state.canvas.elements.filter((e) => selectedElementIds.includes(e.id))
      const avgCenterX = selectedElements.reduce((sum, e) => sum + e.x + e.width / 2, 0) / selectedElements.length

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((e) =>
            selectedElementIds.includes(e.id) ? { ...e, x: avgCenterX - e.width / 2 } : e
          ),
        },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  alignSelectedRight: () => {
    set((state) => {
      const { selectedElementIds } = get()
      if (selectedElementIds.length < 2) return state

      const selectedElements = state.canvas.elements.filter((e) => selectedElementIds.includes(e.id))
      const maxRight = Math.max(...selectedElements.map((e) => e.x + e.width))

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((e) =>
            selectedElementIds.includes(e.id) ? { ...e, x: maxRight - e.width } : e
          ),
        },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  alignSelectedTop: () => {
    set((state) => {
      const { selectedElementIds } = get()
      if (selectedElementIds.length < 2) return state

      const selectedElements = state.canvas.elements.filter((e) => selectedElementIds.includes(e.id))
      const minY = Math.min(...selectedElements.map((e) => e.y))

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((e) =>
            selectedElementIds.includes(e.id) ? { ...e, y: minY } : e
          ),
        },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  alignSelectedCenterV: () => {
    set((state) => {
      const { selectedElementIds } = get()
      if (selectedElementIds.length < 2) return state

      const selectedElements = state.canvas.elements.filter((e) => selectedElementIds.includes(e.id))
      const avgCenterY = selectedElements.reduce((sum, e) => sum + e.y + e.height / 2, 0) / selectedElements.length

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((e) =>
            selectedElementIds.includes(e.id) ? { ...e, y: avgCenterY - e.height / 2 } : e
          ),
        },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  alignSelectedBottom: () => {
    set((state) => {
      const { selectedElementIds } = get()
      if (selectedElementIds.length < 2) return state

      const selectedElements = state.canvas.elements.filter((e) => selectedElementIds.includes(e.id))
      const maxBottom = Math.max(...selectedElements.map((e) => e.y + e.height))

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((e) =>
            selectedElementIds.includes(e.id) ? { ...e, y: maxBottom - e.height } : e
          ),
        },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  distributeSelectedH: () => {
    set((state) => {
      const { selectedElementIds } = get()
      if (selectedElementIds.length < 3) return state

      const selectedElements = state.canvas.elements.filter((e) => selectedElementIds.includes(e.id))
      const sorted = selectedElements.slice().sort((a, b) => a.x - b.x)
      const minX = sorted[0].x
      const maxX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width
      const spacing = (maxX - minX - sorted[0].width) / (sorted.length - 1)

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((e) => {
            const idx = sorted.findIndex((_e) => _e.id === e.id)
            return idx >= 0 ? { ...e, x: minX + idx * spacing } : e
          }),
        },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  distributeSelectedV: () => {
    set((state) => {
      const { selectedElementIds } = get()
      if (selectedElementIds.length < 3) return state

      const selectedElements = state.canvas.elements.filter((e) => selectedElementIds.includes(e.id))
      const sorted = selectedElements.slice().sort((a, b) => a.y - b.y)
      const minY = sorted[0].y
      const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height
      const spacing = (maxY - minY - sorted[0].height) / (sorted.length - 1)

      return {
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((e) => {
            const idx = sorted.findIndex((_e) => _e.id === e.id)
            return idx >= 0 ? { ...e, y: minY + idx * spacing } : e
          }),
        },
        history: pushHistory(state.history, state.canvas),
        future: [],
      }
    })
  },
  undo: () => {
    set((state) => {
      const previous = state.history.at(-1)

      if (!previous) {
        return state
      }

      const nextHistory = state.history.slice(0, -1)
      const selectedIds = state.selectedElementIds.filter((id) => previous.elements.some((e) => e.id === id))

      return {
        canvas: cloneCanvasState(previous),
        history: nextHistory,
        future: [cloneCanvasState(state.canvas), ...state.future],
        selectedElementId: selectedIds.length === 1 ? selectedIds[0] : null,
        selectedElementIds: selectedIds,
      }
    })
  },
  redo: () => {
    set((state) => {
      const [next, ...restFuture] = state.future

      if (!next) {
        return state
      }

      const selectedIds = state.selectedElementIds.filter((id) => next.elements.some((e) => e.id === id))

      return {
        canvas: cloneCanvasState(next),
        history: pushHistory(state.history, state.canvas),
        future: restFuture,
        selectedElementId: selectedIds.length === 1 ? selectedIds[0] : null,
        selectedElementIds: selectedIds,
      }
    })
  },
  pushHistorySnapshot: (snapshot) => {
    set((state) => ({
      history: pushHistory(state.history, snapshot),
      future: [],
    }))
  },
}))

export { cloneCanvasState, defaultStyle }