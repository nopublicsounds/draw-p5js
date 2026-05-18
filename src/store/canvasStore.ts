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
  elements: [
    {
      id: crypto.randomUUID(),
      type: 'rect',
      x: 96,
      y: 88,
      width: 220,
      height: 132,
      rotation: -6,
      style: defaultStyle,
    },
    {
      id: crypto.randomUUID(),
      type: 'ellipse',
      x: 420,
      y: 144,
      width: 178,
      height: 178,
      rotation: 12,
      style: {
        fill: '#F28C52',
        stroke: 'none',
        strokeWeight: 0,
        opacity: 0.92,
      },
    },
    {
      id: crypto.randomUUID(),
      type: 'text',
      x: 180,
      y: 346,
      width: 320,
      height: 64,
      rotation: 0,
      text: 'p5 scene',
      fontSize: 40,
      fontFamily: 'Georgia',
      style: {
        fill: '#172033',
        stroke: 'none',
        strokeWeight: 0,
        opacity: 1,
      },
    },
  ],
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
  activeTool: EditorTool
  history: CanvasState[]
  future: CanvasState[]
  setActiveTool: (tool: EditorTool) => void
  selectElement: (id: string | null) => void
  updateCanvasSize: (width: number, height: number) => void
  updateCanvasBackground: (background: string) => void
  addElement: (element: CanvasElement) => void
  updateElement: (
    id: string,
    updates: Omit<Partial<CanvasElement>, 'style'> & { style?: Partial<ElementStyle> },
    recordHistory?: boolean,
  ) => void
  deleteSelectedElement: () => void
  duplicateSelectedElement: () => void
  nudgeSelectedElement: (dx: number, dy: number) => void
  undo: () => void
  redo: () => void
  pushHistorySnapshot: (snapshot: CanvasState) => void
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  canvas: initialCanvas,
  selectedElementId: null,
  activeTool: 'select',
  history: [],
  future: [],
  setActiveTool: (tool) => set({ activeTool: tool }),
  selectElement: (id) => set({ selectedElementId: id }),
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
  undo: () => {
    set((state) => {
      const previous = state.history.at(-1)

      if (!previous) {
        return state
      }

      const nextHistory = state.history.slice(0, -1)
      const selectedExists = previous.elements.some((element) => element.id === state.selectedElementId)

      return {
        canvas: cloneCanvasState(previous),
        history: nextHistory,
        future: [cloneCanvasState(state.canvas), ...state.future],
        selectedElementId: selectedExists ? state.selectedElementId : null,
      }
    })
  },
  redo: () => {
    set((state) => {
      const [next, ...restFuture] = state.future

      if (!next) {
        return state
      }

      const selectedExists = next.elements.some((element) => element.id === state.selectedElementId)

      return {
        canvas: cloneCanvasState(next),
        history: pushHistory(state.history, state.canvas),
        future: restFuture,
        selectedElementId: selectedExists ? state.selectedElementId : null,
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