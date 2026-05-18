import { useEffect, useRef, useState } from 'react'
import { cloneCanvasState, useCanvasStore } from '../store/canvasStore'
import type { CanvasElement, CanvasState } from '../types/canvas'

interface Point {
  x: number
  y: number
}

interface DragState {
  id: string
  startPoint: Point
  initialElement: CanvasElement
  beforeCanvas: CanvasState
  moved: boolean
}

const HANDLE_SIZE = 8

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

const rotatePoint = (point: Point, center: Point, degrees: number): Point => {
  const angle = toRadians(degrees)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = point.x - center.x
  const dy = point.y - center.y

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  }
}

const getElementCenter = (element: CanvasElement): Point => {
  if (element.type === 'line') {
    return {
      x: ((element.x2 ?? element.x + element.width) + element.x) / 2,
      y: ((element.y2 ?? element.y + element.height) + element.y) / 2,
    }
  }

  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2,
  }
}

const getElementBounds = (element: CanvasElement) => {
  if (element.type === 'line') {
    const x2 = element.x2 ?? element.x + element.width
    const y2 = element.y2 ?? element.y + element.height

    return {
      x: Math.min(element.x, x2),
      y: Math.min(element.y, y2),
      width: Math.abs(x2 - element.x),
      height: Math.abs(y2 - element.y),
    }
  }

  const center = getElementCenter(element)
  const corners = [
    rotatePoint({ x: element.x, y: element.y }, center, element.rotation),
    rotatePoint({ x: element.x + element.width, y: element.y }, center, element.rotation),
    rotatePoint({ x: element.x + element.width, y: element.y + element.height }, center, element.rotation),
    rotatePoint({ x: element.x, y: element.y + element.height }, center, element.rotation),
  ]

  const xs = corners.map((point) => point.x)
  const ys = corners.map((point) => point.y)

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  }
}

const pointInElement = (point: Point, element: CanvasElement) => {
  if (element.type === 'line') {
    const x1 = element.x
    const y1 = element.y
    const x2 = element.x2 ?? element.x + element.width
    const y2 = element.y2 ?? element.y + element.height
    const dx = x2 - x1
    const dy = y2 - y1
    const lengthSquared = dx * dx + dy * dy

    if (lengthSquared === 0) {
      return false
    }

    const t = Math.max(0, Math.min(1, ((point.x - x1) * dx + (point.y - y1) * dy) / lengthSquared))
    const projectionX = x1 + t * dx
    const projectionY = y1 + t * dy
    const distance = Math.hypot(point.x - projectionX, point.y - projectionY)

    return distance <= Math.max(8, element.style.strokeWeight + 4)
  }

  const center = getElementCenter(element)
  const localPoint = rotatePoint(point, center, -element.rotation)

  if (element.type === 'ellipse') {
    const radiusX = element.width / 2
    const radiusY = element.height / 2
    const ellipseCenterX = element.x + radiusX
    const ellipseCenterY = element.y + radiusY
    const normalizedX = (localPoint.x - ellipseCenterX) / radiusX
    const normalizedY = (localPoint.y - ellipseCenterY) / radiusY

    return normalizedX * normalizedX + normalizedY * normalizedY <= 1
  }

  return (
    localPoint.x >= element.x &&
    localPoint.x <= element.x + element.width &&
    localPoint.y >= element.y &&
    localPoint.y <= element.y + element.height
  )
}

const getCanvasPoint = (event: MouseEvent, canvas: HTMLCanvasElement): Point => {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  }
}

const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
  ctx.save()
  ctx.globalAlpha = element.style.opacity

  if (element.type === 'line') {
    ctx.lineWidth = element.style.strokeWeight || 2
    ctx.strokeStyle = element.style.stroke === 'none' ? '#111827' : element.style.stroke
    ctx.beginPath()
    ctx.moveTo(element.x, element.y)
    ctx.lineTo(element.x2 ?? element.x + element.width, element.y2 ?? element.y + element.height)
    ctx.stroke()
    ctx.restore()
    return
  }

  const center = getElementCenter(element)
  ctx.translate(center.x, center.y)
  ctx.rotate(toRadians(element.rotation))
  ctx.translate(-center.x, -center.y)

  if (element.type === 'rect' || element.type === 'image') {
    if (element.style.fill !== 'none') {
      ctx.fillStyle = element.type === 'image' ? '#dbeafe' : element.style.fill
      ctx.fillRect(element.x, element.y, element.width, element.height)
    }

    if (element.type === 'image') {
      ctx.fillStyle = '#3b82f6'
      ctx.font = '600 14px Avenir Next, Segoe UI, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Image', element.x + element.width / 2, element.y + element.height / 2)
    }
  } else if (element.type === 'ellipse') {
    ctx.beginPath()
    ctx.ellipse(
      element.x + element.width / 2,
      element.y + element.height / 2,
      element.width / 2,
      element.height / 2,
      0,
      0,
      Math.PI * 2,
    )

    if (element.style.fill !== 'none') {
      ctx.fillStyle = element.style.fill
      ctx.fill()
    }
  } else if (element.type === 'text') {
    ctx.fillStyle = element.style.fill === 'none' ? '#111827' : element.style.fill
    ctx.font = `${element.fontSize ?? 24}px ${element.fontFamily ?? 'Georgia'}`
    ctx.textBaseline = 'top'
    ctx.fillText(element.text ?? 'Text', element.x, element.y, element.width)
  }

  if (element.style.stroke !== 'none' && element.style.strokeWeight > 0) {
    ctx.strokeStyle = element.style.stroke
    ctx.lineWidth = element.style.strokeWeight

    if (element.type === 'ellipse') {
      ctx.beginPath()
      ctx.ellipse(
        element.x + element.width / 2,
        element.y + element.height / 2,
        element.width / 2,
        element.height / 2,
        0,
        0,
        Math.PI * 2,
      )
      ctx.stroke()
    } else {
      ctx.strokeRect(element.x, element.y, element.width, element.height)
    }
  }

  ctx.restore()
}

const drawSelection = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
  const bounds = getElementBounds(element)
  const handlePoints: Point[] = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width / 2, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height / 2 },
  ]
  const rotationHandle = { x: bounds.x + bounds.width / 2, y: bounds.y - 20 }

  ctx.save()
  ctx.strokeStyle = '#2563eb'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = 1
  ctx.setLineDash([6, 4])
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(bounds.x + bounds.width / 2, bounds.y)
  ctx.lineTo(rotationHandle.x, rotationHandle.y)
  ctx.stroke()

  for (const handlePoint of [...handlePoints, rotationHandle]) {
    ctx.fillRect(
      handlePoint.x - HANDLE_SIZE / 2,
      handlePoint.y - HANDLE_SIZE / 2,
      HANDLE_SIZE,
      HANDLE_SIZE,
    )
    ctx.strokeRect(
      handlePoint.x - HANDLE_SIZE / 2,
      handlePoint.y - HANDLE_SIZE / 2,
      HANDLE_SIZE,
      HANDLE_SIZE,
    )
  }

  ctx.restore()
}

export function CanvasStage() {
  const canvasState = useCanvasStore((state) => state.canvas)
  const elements = useCanvasStore((state) => state.canvas.elements)
  const selectedElementId = useCanvasStore((state) => state.selectedElementId)
  const activeTool = useCanvasStore((state) => state.activeTool)
  const selectElement = useCanvasStore((state) => state.selectElement)
  const updateElement = useCanvasStore((state) => state.updateElement)
  const pushHistorySnapshot = useCanvasStore((state) => state.pushHistorySnapshot)
  const setActiveTool = useCanvasStore((state) => state.setActiveTool)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const devicePixelRatio = window.devicePixelRatio || 1
    canvas.width = canvasState.width * devicePixelRatio
    canvas.height = canvasState.height * devicePixelRatio
    canvas.style.width = `${canvasState.width}px`
    canvas.style.height = `${canvasState.height}px`

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    ctx.clearRect(0, 0, canvasState.width, canvasState.height)
    ctx.fillStyle = canvasState.background
    ctx.fillRect(0, 0, canvasState.width, canvasState.height)

    for (const element of elements) {
      drawElement(ctx, element)
    }

    if (selectedElementId) {
      const selectedElement = elements.find((element) => element.id === selectedElementId)

      if (selectedElement) {
        drawSelection(ctx, selectedElement)
      }
    }
  }, [canvasState, elements, selectedElementId])

  useEffect(() => {
    if (!dragState) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      const canvas = canvasRef.current

      if (!canvas) {
        return
      }

      const point = getCanvasPoint(event, canvas)
      const dx = point.x - dragState.startPoint.x
      const dy = point.y - dragState.startPoint.y

      updateElement(
        dragState.id,
        {
          x: dragState.initialElement.x + dx,
          y: dragState.initialElement.y + dy,
          x2:
            dragState.initialElement.x2 !== undefined
              ? dragState.initialElement.x2 + dx
              : undefined,
          y2:
            dragState.initialElement.y2 !== undefined
              ? dragState.initialElement.y2 + dy
              : undefined,
        },
        false,
      )
      setDragState((currentState) => (currentState ? { ...currentState, moved: true } : currentState))
    }

    const handleMouseUp = () => {
      if (dragState.moved) {
        pushHistorySnapshot(dragState.beforeCanvas)
      }

      setDragState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, pushHistorySnapshot, updateElement])

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const point = getCanvasPoint(event.nativeEvent, canvas)
    const hitElement = [...elements].reverse().find((element) => pointInElement(point, element))

    if (!hitElement) {
      selectElement(null)
      return
    }

    selectElement(hitElement.id)

    if (activeTool !== 'select') {
      setActiveTool('select')
      return
    }

    setDragState({
      id: hitElement.id,
      startPoint: point,
      initialElement: structuredClone(hitElement),
      beforeCanvas: cloneCanvasState(useCanvasStore.getState().canvas),
      moved: false,
    })
  }

  return (
    <section className="rounded-[32px] border border-white/60 bg-white/70 p-4 shadow-[0_24px_80px_rgba(76,48,11,0.12)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800/70">Stage</p>
          <h2 className="mt-2 font-serif text-2xl text-slate-950">Canvas</h2>
        </div>
        <p className="text-sm text-slate-600">
          Drag the seeded elements. Empty click clears selection. Arrow keys nudge, Ctrl/Cmd+D duplicates.
        </p>
      </div>

      <div className="overflow-auto rounded-[28px] border border-slate-300 bg-[linear-gradient(180deg,_#faf8f4_0%,_#f0ebe2_100%)] p-6">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          className="mx-auto block rounded-xl border border-slate-300 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
        />
      </div>
    </section>
  )
}