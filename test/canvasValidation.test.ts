import { describe, expect, it } from 'vitest'
import { parseCanvasState } from '../src/utils/canvasValidation'

describe('parseCanvasState', () => {
  const baseCanvas = {
    width: 800,
    height: 600,
    background: '#ffffff',
    elements: [
      {
        id: 'el-1',
        type: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 120,
        rotation: 0,
        style: {
          fill: '#111111',
          stroke: 'none',
          strokeWeight: 0,
          opacity: 1,
        },
      },
    ],
  }

  const cloneBaseCanvas = () => structuredClone(baseCanvas) as typeof baseCanvas

  const validCases: Array<{ name: string; data: unknown }> = [
    {
      name: 'accepts empty element list',
      data: {
        width: 800,
        height: 600,
        background: '#ffffff',
        elements: [],
      },
    },
    {
      name: 'accepts minimal rectangle element',
      data: cloneBaseCanvas(),
    },
    {
      name: 'accepts ellipse with stroke',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            id: 'el-2',
            type: 'ellipse',
            x: 50,
            y: 60,
            width: 140,
            height: 90,
            rotation: 15,
            style: {
              fill: '#22aa88',
              stroke: '#003344',
              strokeWeight: 2,
              opacity: 0.8,
            },
          },
        ],
      },
    },
    {
      name: 'accepts text with optional fields',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            id: 'el-3',
            type: 'text',
            x: 20,
            y: 24,
            width: 260,
            height: 80,
            rotation: 0,
            text: 'hello',
            fontSize: 32,
            fontFamily: 'Inter',
            style: {
              fill: '#111111',
              stroke: 'none',
              strokeWeight: 0,
              opacity: 1,
            },
          },
        ],
      },
    },
    {
      name: 'accepts line with x2 and y2',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            id: 'el-4',
            type: 'line',
            x: 10,
            y: 10,
            x2: 220,
            y2: 130,
            width: 0,
            height: 0,
            rotation: 0,
            style: {
              fill: 'none',
              stroke: '#111111',
              strokeWeight: 3,
              opacity: 1,
            },
          },
        ],
      },
    },
    {
      name: 'accepts arc with optional arc angles',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            id: 'el-5',
            type: 'arc',
            x: 30,
            y: 40,
            width: 200,
            height: 160,
            rotation: 10,
            arcStart: 0,
            arcStop: 180,
            style: {
              fill: '#ffaa00',
              stroke: '#330000',
              strokeWeight: 1,
              opacity: 0.5,
            },
          },
        ],
      },
    },
    {
      name: 'accepts polygon with optional sides',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            id: 'el-6',
            type: 'polygon',
            x: 60,
            y: 60,
            width: 100,
            height: 100,
            rotation: 25,
            polygonSides: 8,
            style: {
              fill: '#5599dd',
              stroke: '#223355',
              strokeWeight: 1,
              opacity: 0.9,
            },
          },
        ],
      },
    },
    {
      name: 'accepts image with src',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            id: 'el-7',
            type: 'image',
            x: 12,
            y: 18,
            width: 240,
            height: 180,
            rotation: 0,
            src: 'data:image/png;base64,AAAA',
            style: {
              fill: 'none',
              stroke: 'none',
              strokeWeight: 0,
              opacity: 1,
            },
          },
        ],
      },
    },
    {
      name: 'accepts free polygon with vertex array',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            id: 'el-11',
            type: 'freePolygon',
            x: 100,
            y: 120,
            width: 200,
            height: 180,
            rotation: 0,
            polygonPoints: [
              { x: 0.1, y: 0.2 },
              { x: 0.85, y: 0.1 },
              { x: 0.7, y: 0.8 },
              { x: 0.2, y: 0.9 },
            ],
            style: {
              fill: '#4A90D9',
              stroke: '#223355',
              strokeWeight: 1,
              opacity: 1,
            },
          },
        ],
      },
    },
    {
      name: 'accepts mixed element collection',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          ...cloneBaseCanvas().elements,
          {
            id: 'el-8',
            type: 'triangle',
            x: 240,
            y: 180,
            width: 120,
            height: 90,
            rotation: -10,
            style: {
              fill: '#cc4455',
              stroke: '#220000',
              strokeWeight: 1,
              opacity: 0.7,
            },
          },
        ],
      },
    },
    {
      name: 'accepts opacity boundary values',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            id: 'el-9',
            type: 'rect',
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            rotation: 0,
            style: {
              fill: '#ffffff',
              stroke: '#000000',
              strokeWeight: 1,
              opacity: 0,
            },
          },
          {
            id: 'el-10',
            type: 'diamond',
            x: 60,
            y: 0,
            width: 50,
            height: 50,
            rotation: 0,
            style: {
              fill: '#000000',
              stroke: 'none',
              strokeWeight: 0,
              opacity: 1,
            },
          },
        ],
      },
    },
  ]

  const invalidCases: Array<{ name: string; data: unknown }> = [
    {
      name: 'rejects non-object root',
      data: null,
    },
    {
      name: 'rejects missing width',
      data: {
        height: 600,
        background: '#ffffff',
        elements: [],
      },
    },
    {
      name: 'rejects non-numeric width',
      data: {
        ...cloneBaseCanvas(),
        width: '800',
      },
    },
    {
      name: 'rejects non-string background',
      data: {
        ...cloneBaseCanvas(),
        background: 123,
      },
    },
    {
      name: 'rejects non-array elements',
      data: {
        ...cloneBaseCanvas(),
        elements: {},
      },
    },
    {
      name: 'rejects element with missing id',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            ...cloneBaseCanvas().elements[0],
            id: undefined,
          },
        ],
      },
    },
    {
      name: 'rejects unknown element type',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            ...cloneBaseCanvas().elements[0],
            type: 'star',
          },
        ],
      },
    },
    {
      name: 'rejects element with missing style',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            ...cloneBaseCanvas().elements[0],
            style: undefined,
          },
        ],
      },
    },
    {
      name: 'rejects opacity out of range',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            ...cloneBaseCanvas().elements[0],
            style: {
              ...cloneBaseCanvas().elements[0].style,
              opacity: 2,
            },
          },
        ],
      },
    },
    {
      name: 'rejects wrong type optional property',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            ...cloneBaseCanvas().elements[0],
            polygonSides: '6',
          },
        ],
      },
    },
    {
      name: 'rejects free polygon with invalid or missing points',
      data: {
        ...cloneBaseCanvas(),
        elements: [
          {
            id: 'el-12',
            type: 'freePolygon',
            x: 20,
            y: 30,
            width: 80,
            height: 60,
            rotation: 0,
            polygonPoints: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
            style: {
              fill: '#000000',
              stroke: 'none',
              strokeWeight: 0,
              opacity: 1,
            },
          },
        ],
      },
    },
  ]

  for (const testCase of validCases) {
    it(testCase.name, () => {
      const result = parseCanvasState(testCase.data)
      expect(result.ok).toBe(true)
    })
  }

  for (const testCase of invalidCases) {
    it(testCase.name, () => {
      const result = parseCanvasState(testCase.data)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('Invalid canvas JSON schema.')
      }
    })
  }
})
