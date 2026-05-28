import type { CanvasElement, CanvasState } from '../types/canvas'

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export interface PointLike {
  x: number
  y: number
}

export interface SnapGuide {
  axis: 'x' | 'y'
  value: number
}

interface AxisSnapOption {
  value: number
  factor: number
}

interface SnapCandidates {
  xCandidates: number[]
  yCandidates: number[]
}

interface BoundsResolver<T> {
  (item: T): Bounds
}

const SNAP_THRESHOLD = 6

const pickBestAxisSnap = (options: AxisSnapOption[], candidates: number[]) => {
  let best: { pointerDelta: number; guideValue: number } | null = null

  for (const option of options) {
    for (const candidate of candidates) {
      const metricDelta = candidate - option.value
      if (Math.abs(metricDelta) > SNAP_THRESHOLD) {
        continue
      }

      const pointerDelta = metricDelta * option.factor
      if (!best || Math.abs(pointerDelta) < Math.abs(best.pointerDelta)) {
        best = { pointerDelta, guideValue: candidate }
      }
    }
  }

  return best
}

export const getCombinedBounds = <T>(items: T[], getBounds: BoundsResolver<T>): Bounds | null => {
  if (items.length === 0) {
    return null
  }

  const boundsList = items.map((item) => getBounds(item))
  const minX = Math.min(...boundsList.map((bounds) => bounds.x))
  const minY = Math.min(...boundsList.map((bounds) => bounds.y))
  const maxX = Math.max(...boundsList.map((bounds) => bounds.x + bounds.width))
  const maxY = Math.max(...boundsList.map((bounds) => bounds.y + bounds.height))

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export const getSnapCandidates = (
  canvas: CanvasState,
  elements: CanvasElement[],
  excludedIds: Set<string>,
  getBounds: BoundsResolver<CanvasElement>,
): SnapCandidates => {
  const xCandidates = [0, canvas.width / 2, canvas.width]
  const yCandidates = [0, canvas.height / 2, canvas.height]

  for (const element of elements) {
    if (excludedIds.has(element.id)) {
      continue
    }

    const bounds = getBounds(element)
    xCandidates.push(bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width)
    yCandidates.push(bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height)
  }

  return { xCandidates, yCandidates }
}

export const snapMoveBounds = (
  initialBounds: Bounds,
  dx: number,
  dy: number,
  candidates: SnapCandidates,
): { dx: number; dy: number; guides: SnapGuide[] } => {
  const movedBounds: Bounds = {
    x: initialBounds.x + dx,
    y: initialBounds.y + dy,
    width: initialBounds.width,
    height: initialBounds.height,
  }

  let snappedDx = dx
  let snappedDy = dy
  const guides: SnapGuide[] = []

  const xSnap = pickBestAxisSnap(
    [
      { value: movedBounds.x, factor: 1 },
      { value: movedBounds.x + movedBounds.width / 2, factor: 1 },
      { value: movedBounds.x + movedBounds.width, factor: 1 },
    ],
    candidates.xCandidates,
  )

  const ySnap = pickBestAxisSnap(
    [
      { value: movedBounds.y, factor: 1 },
      { value: movedBounds.y + movedBounds.height / 2, factor: 1 },
      { value: movedBounds.y + movedBounds.height, factor: 1 },
    ],
    candidates.yCandidates,
  )

  if (xSnap) {
    snappedDx += xSnap.pointerDelta
    guides.push({ axis: 'x', value: xSnap.guideValue })
  }

  if (ySnap) {
    snappedDy += ySnap.pointerDelta
    guides.push({ axis: 'y', value: ySnap.guideValue })
  }

  return { dx: snappedDx, dy: snappedDy, guides }
}

export const snapDrawPoint = (
  startPoint: PointLike,
  point: PointLike,
  candidates: SnapCandidates,
): { point: PointLike; guides: SnapGuide[] } => {
  const xSnap = pickBestAxisSnap(
    [
      { value: point.x, factor: 1 },
      { value: (startPoint.x + point.x) / 2, factor: 2 },
    ],
    candidates.xCandidates,
  )

  const ySnap = pickBestAxisSnap(
    [
      { value: point.y, factor: 1 },
      { value: (startPoint.y + point.y) / 2, factor: 2 },
    ],
    candidates.yCandidates,
  )

  const guides: SnapGuide[] = []
  if (xSnap) {
    guides.push({ axis: 'x', value: xSnap.guideValue })
  }
  if (ySnap) {
    guides.push({ axis: 'y', value: ySnap.guideValue })
  }

  return {
    point: {
      x: point.x + (xSnap?.pointerDelta ?? 0),
      y: point.y + (ySnap?.pointerDelta ?? 0),
    },
    guides,
  }
}

export const snapResizeBounds = (
  resizedBounds: Bounds,
  direction: { x: number; y: number },
  candidates: SnapCandidates,
  minSize: number,
): { bounds: Bounds; guides: SnapGuide[] } => {
  let nextBounds = { ...resizedBounds }
  const guides: SnapGuide[] = []

  const xOptions: AxisSnapOption[] =
    direction.x > 0
      ? [{ value: resizedBounds.x + resizedBounds.width, factor: 1 }]
      : direction.x < 0
        ? [{ value: resizedBounds.x, factor: 1 }]
        : []

  const yOptions: AxisSnapOption[] =
    direction.y > 0
      ? [{ value: resizedBounds.y + resizedBounds.height, factor: 1 }]
      : direction.y < 0
        ? [{ value: resizedBounds.y, factor: 1 }]
        : []

  const xSnap = xOptions.length > 0 ? pickBestAxisSnap(xOptions, candidates.xCandidates) : null
  const ySnap = yOptions.length > 0 ? pickBestAxisSnap(yOptions, candidates.yCandidates) : null

  if (xSnap) {
    const left = nextBounds.x
    const right = nextBounds.x + nextBounds.width

    if (direction.x > 0) {
      const snappedRight = Math.max(left + minSize, right + xSnap.pointerDelta)
      nextBounds = {
        ...nextBounds,
        width: snappedRight - left,
      }
    } else if (direction.x < 0) {
      const snappedLeft = Math.min(right - minSize, left + xSnap.pointerDelta)
      nextBounds = {
        ...nextBounds,
        x: snappedLeft,
        width: right - snappedLeft,
      }
    }

    guides.push({ axis: 'x', value: xSnap.guideValue })
  }

  if (ySnap) {
    const top = nextBounds.y
    const bottom = nextBounds.y + nextBounds.height

    if (direction.y > 0) {
      const snappedBottom = Math.max(top + minSize, bottom + ySnap.pointerDelta)
      nextBounds = {
        ...nextBounds,
        height: snappedBottom - top,
      }
    } else if (direction.y < 0) {
      const snappedTop = Math.min(bottom - minSize, top + ySnap.pointerDelta)
      nextBounds = {
        ...nextBounds,
        y: snappedTop,
        height: bottom - snappedTop,
      }
    }

    guides.push({ axis: 'y', value: ySnap.guideValue })
  }

  return { bounds: nextBounds, guides }
}
