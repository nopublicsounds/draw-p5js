# draw-p5js

draw-p5js is a visual canvas editor for building p5.js-style scenes and exporting them as code.  
Just draw. Don't write.  

Built with React, TypeScript, Vite, and Zustand.

## Features

- Shape tools: Select, Rect, Ellipse, Triangle, Diamond, Arc, Polygon, Free Polygon, Line, Text, Image
- Canvas editing: drag, resize, rotate, multi-select, align/distribute
- Batch editing for multi-selected layers: X/Y/Rotate, Alpha, Fill, Stroke
- State controls: Undo/Redo, JSON save/load
- Autosave to localStorage every 30 seconds
- Export options: copy/download p5.js code, try opening in p5.js Web Editor

## Quick Start

### Requirements

- Node.js 20+
- npm

### Install and Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview built app
npm run lint     # run ESLint
npm run test     # run Vitest
```

## Keyboard Shortcuts

- Ctrl/Cmd + A: Select all
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Shift + Z: Redo
- Ctrl/Cmd + Y: Redo
- Ctrl/Cmd + D: Duplicate selected element
- Delete / Backspace: Delete selection
- Arrow keys: Move by 1px
- Shift + Arrow keys: Move by 10px
- Empty click: Clear selection

## JSON Import Validation

Runtime schema validation is applied to both JSON import and localStorage restore.

- Validation utility: src/utils/canvasValidation.ts
- On failure:
  - Import: user-visible status message
  - Restore: console warning and restore is skipped

## Canvas JSON Schema

The app expects a CanvasState-shaped JSON document.

Top-level required fields:

- width: number
- height: number
- background: string
- elements: array

Each element requires:

- id: string
- type: one of rect, ellipse, triangle, diamond, arc, polygon, freePolygon, line, text, image
- x, y, width, height, rotation: number
- style: object

style requires:

- fill: string
- stroke: string
- strokeWeight: number
- opacity: number between 0 and 1

Optional element fields:

- text: string
- fontSize: number
- fontFamily: string
- src: string
- x2, y2: number
- arcStart, arcStop: number
- polygonSides: number
- polygonPoints: array of points ({ x: number, y: number })

Notes for polygonPoints:

- Used by freePolygon elements.
- At least 3 points are required for freePolygon validation.
- Points are normalized values relative to the element bounds (0 to 1 range is recommended).

### Valid JSON Example

```json
{
  "width": 800,
  "height": 600,
  "background": "#ffffff",
  "elements": [
    {
      "id": "el-1",
      "type": "rect",
      "x": 100,
      "y": 120,
      "width": 240,
      "height": 140,
      "rotation": 0,
      "style": {
        "fill": "#4A90D9",
        "stroke": "none",
        "strokeWeight": 0,
        "opacity": 1
      }
    }
  ]
}
```

### Valid Free Polygon JSON Example

```json
{
  "width": 800,
  "height": 600,
  "background": "#ffffff",
  "elements": [
    {
      "id": "el-free-1",
      "type": "freePolygon",
      "x": 120,
      "y": 140,
      "width": 260,
      "height": 220,
      "rotation": 0,
      "polygonPoints": [
        { "x": 0.08, "y": 0.18 },
        { "x": 0.78, "y": 0.05 },
        { "x": 0.95, "y": 0.52 },
        { "x": 0.62, "y": 0.9 },
        { "x": 0.14, "y": 0.76 }
      ],
      "style": {
        "fill": "#4A90D9",
        "stroke": "#1E3A5F",
        "strokeWeight": 1,
        "opacity": 1
      }
    }
  ]
}
```

### Invalid JSON Examples

Invalid because opacity is out of range:

```json
{
  "width": 800,
  "height": 600,
  "background": "#ffffff",
  "elements": [
    {
      "id": "el-1",
      "type": "rect",
      "x": 100,
      "y": 120,
      "width": 240,
      "height": 140,
      "rotation": 0,
      "style": {
        "fill": "#4A90D9",
        "stroke": "none",
        "strokeWeight": 0,
        "opacity": 2
      }
    }
  ]
}
```

Invalid because type is not supported:

```json
{
  "width": 800,
  "height": 600,
  "background": "#ffffff",
  "elements": [
    {
      "id": "el-2",
      "type": "star",
      "x": 80,
      "y": 90,
      "width": 100,
      "height": 100,
      "rotation": 0,
      "style": {
        "fill": "#ffaa00",
        "stroke": "#000000",
        "strokeWeight": 1,
        "opacity": 1
      }
    }
  ]
}
```

## Testing

Validation tests are isolated under the test folder.

- Test file: test/canvasValidation.test.ts
- Coverage in this suite: 11 valid cases and 11 invalid cases

Run:

```bash
npm run test
```
