import { describe, expect, it } from 'vitest'
import type { CanvasElement, CanvasState } from '../src/types/canvas'
import { getCombinedBounds, getSnapCandidates, snapDrawPoint, snapMoveBounds, snapResizeBounds } from '../src/utils/canvasSnap'

const toBounds = (element: CanvasElement) => ({
  x: element.x,
  y: element.y,
  width: element.width,
  height: element.height,
})

const makeRect = (id: string, x: number, y: number, width: number, height: number): CanvasElement => ({
  id,
  type: 'rect',
  x,
  y,
  width,
  height,
  rotation: 0,
  style: {
    fill: '#4A90D9',
    stroke: 'none',
    strokeWeight: 0,
    opacity: 1,
  },
})

describe('canvasSnap', () => {
  it('combines bounds from multiple elements', () => {
    const items = [makeRect('a', 10, 20, 30, 40), makeRect('b', -5, 5, 15, 10)]

    expect(getCombinedBounds(items, toBounds)).toEqual({
      x: -5,
      y: 5,
      width: 45,
      height: 55,
    })
  })

  it('returns null for empty bounds input', () => {
    expect(getCombinedBounds([], toBounds)).toBeNull()
  })

  it('builds snap candidates with canvas guides and excludes requested ids', () => {
    const canvas: CanvasState = {
      width: 800,
      height: 600,
      background: '#fff',
      elements: [],
    }

    const kept = makeRect('keep', 100, 120, 80, 60)
    const excluded = makeRect('skip', 300, 220, 90, 70)
    const candidates = getSnapCandidates(canvas, [kept, excluded], new Set(['skip']), toBounds)

    expect(candidates.xCandidates).toEqual(expect.arrayContaining([0, 400, 800, 100, 140, 180]))
    expect(candidates.yCandidates).toEqual(expect.arrayContaining([0, 300, 600, 120, 150, 180]))
    expect(candidates.xCandidates).not.toEqual(expect.arrayContaining([300, 345, 390]))
  })

  it('snaps moving bounds and emits x/y guides', () => {
    const result = snapMoveBounds(
      { x: 10, y: 10, width: 20, height: 20 },
      33,
      44,
      {
        xCandidates: [40],
        yCandidates: [55],
      },
    )

    expect(result.dx).toBe(30)
    expect(result.dy).toBe(45)
    expect(result.guides).toEqual(
      expect.arrayContaining([
        { axis: 'x', value: 40 },
        { axis: 'y', value: 55 },
      ]),
    )
  })

  it('snaps drawing point using center alignment option', () => {
    const result = snapDrawPoint(
      { x: 0, y: 0 },
      { x: 104, y: 78 },
      {
        xCandidates: [50],
        yCandidates: [40],
      },
    )

    expect(result.point).toEqual({ x: 100, y: 80 })
    expect(result.guides).toEqual(
      expect.arrayContaining([
        { axis: 'x', value: 50 },
        { axis: 'y', value: 40 },
      ]),
    )
  })

  it('snaps resize bounds from east/south handles', () => {
    const result = snapResizeBounds(
      { x: 10, y: 20, width: 33, height: 39 },
      { x: 1, y: 1 },
      {
        xCandidates: [40],
        yCandidates: [60],
      },
      12,
    )

    expect(result.bounds).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    })
    expect(result.guides).toEqual(
      expect.arrayContaining([
        { axis: 'x', value: 40 },
        { axis: 'y', value: 60 },
      ]),
    )
  })

  it('honors minimum size while snapping resize bounds from west handle', () => {
    const result = snapResizeBounds(
      { x: 30, y: 10, width: 14, height: 20 },
      { x: -1, y: 0 },
      {
        xCandidates: [34],
        yCandidates: [],
      },
      12,
    )

    expect(result.bounds).toEqual({
      x: 32,
      y: 10,
      width: 12,
      height: 20,
    })
    expect(result.guides).toEqual([{ axis: 'x', value: 34 }])
  })
})
