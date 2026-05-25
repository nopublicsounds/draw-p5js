import type { CanvasElement, CanvasState, ElementType } from '../types/canvas'

interface ValidationSuccess<T> {
  ok: true
  value: T
}

interface ValidationFailure {
  ok: false
  error: string
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

const elementTypes: ElementType[] = ['rect', 'ellipse', 'triangle', 'diamond', 'arc', 'polygon', 'freePolygon', 'line', 'text', 'image']

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isString = (value: unknown): value is string =>
  typeof value === 'string'

const isPolygonPoint = (value: unknown): value is { x: number; y: number } =>
  isObject(value) && isNumber(value.x) && isNumber(value.y)

const isElementType = (value: unknown): value is ElementType =>
  typeof value === 'string' && elementTypes.includes(value as ElementType)

const validateElementStyle = (value: unknown): value is CanvasElement['style'] => {
  if (!isObject(value)) {
    return false
  }

  return (
    isString(value.fill) &&
    isString(value.stroke) &&
    isNumber(value.strokeWeight) &&
    isNumber(value.opacity) &&
    value.opacity >= 0 &&
    value.opacity <= 1
  )
}

const validateElement = (value: unknown): value is CanvasElement => {
  if (!isObject(value)) {
    return false
  }

  if (
    !isString(value.id) ||
    !isElementType(value.type) ||
    !isNumber(value.x) ||
    !isNumber(value.y) ||
    !isNumber(value.width) ||
    !isNumber(value.height) ||
    !isNumber(value.rotation) ||
    !validateElementStyle(value.style)
  ) {
    return false
  }

  if (value.text !== undefined && !isString(value.text)) {
    return false
  }

  if (value.fontSize !== undefined && !isNumber(value.fontSize)) {
    return false
  }

  if (value.fontFamily !== undefined && !isString(value.fontFamily)) {
    return false
  }

  if (value.src !== undefined && !isString(value.src)) {
    return false
  }

  if (value.x2 !== undefined && !isNumber(value.x2)) {
    return false
  }

  if (value.y2 !== undefined && !isNumber(value.y2)) {
    return false
  }

  if (value.arcStart !== undefined && !isNumber(value.arcStart)) {
    return false
  }

  if (value.arcStop !== undefined && !isNumber(value.arcStop)) {
    return false
  }

  if (value.polygonSides !== undefined && !isNumber(value.polygonSides)) {
    return false
  }

  if (value.polygonPoints !== undefined) {
    if (!Array.isArray(value.polygonPoints) || !value.polygonPoints.every((point) => isPolygonPoint(point))) {
      return false
    }
  }

  if (value.type === 'freePolygon') {
    return Array.isArray(value.polygonPoints) && value.polygonPoints.length >= 3
  }

  return true
}

export const validateCanvasState = (value: unknown): value is CanvasState => {
  if (!isObject(value)) {
    return false
  }

  if (
    !isNumber(value.width) ||
    !isNumber(value.height) ||
    !isString(value.background) ||
    !Array.isArray(value.elements)
  ) {
    return false
  }

  return value.elements.every((element) => validateElement(element))
}

export const parseCanvasState = (value: unknown): ValidationResult<CanvasState> => {
  if (!validateCanvasState(value)) {
    return {
      ok: false,
      error: 'Invalid canvas JSON schema.',
    }
  }

  return {
    ok: true,
    value,
  }
}
