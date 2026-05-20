export type ElementType = 'rect' | 'ellipse' | 'triangle' | 'diamond' | 'arc' | 'polygon' | 'line' | 'text' | 'image'

export interface ElementStyle {
  fill: string
  stroke: string
  strokeWeight: number
  opacity: number
}

export interface CanvasElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  style: ElementStyle
  text?: string
  fontSize?: number
  fontFamily?: string
  src?: string
  x2?: number
  y2?: number
  arcStart?: number
  arcStop?: number
  polygonSides?: number
}

export interface CanvasState {
  width: number
  height: number
  background: string
  elements: CanvasElement[]
}

export type EditorTool = 'select' | ElementType