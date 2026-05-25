import type { CanvasElement, CanvasState } from '../types/canvas'

const hexToRgb = (value: string) => {
  const sanitized = value.replace('#', '')

  if (sanitized.length !== 6) {
    return { r: 0, g: 0, b: 0 }
  }

  return {
    r: Number.parseInt(sanitized.slice(0, 2), 16),
    g: Number.parseInt(sanitized.slice(2, 4), 16),
    b: Number.parseInt(sanitized.slice(4, 6), 16),
  }
}

const colorStatement = (type: 'fill' | 'stroke', color: string, opacity: number) => {
  if (color === 'none') {
    return `${type === 'fill' ? 'noFill' : 'noStroke'}();`
  }

  const { r, g, b } = hexToRgb(color)
  const alpha = Math.round(opacity * 255)
  return `${type}(${r}, ${g}, ${b}, ${alpha});`
}

const transformStart = (element: CanvasElement) => {
  const centerX = element.type === 'line' ? ((element.x2 ?? element.x + element.width) + element.x) / 2 : element.x + element.width / 2
  const centerY = element.type === 'line' ? ((element.y2 ?? element.y + element.height) + element.y) / 2 : element.y + element.height / 2

  return [
    `push();`,
    `translate(${centerX}, ${centerY});`,
    `rotate(${element.rotation});`,
  ]
}

const elementToP5 = (element: CanvasElement, index: number) => {
  const lines = [...transformStart(element)]

  lines.push(colorStatement('fill', element.style.fill, element.style.opacity))
  lines.push(colorStatement('stroke', element.style.stroke, element.style.opacity))
  lines.push(`strokeWeight(${element.style.strokeWeight});`)

  if (element.type === 'rect') {
    lines.push(`rectMode(CENTER);`)
    lines.push(`rect(0, 0, ${element.width}, ${element.height});`)
  } else if (element.type === 'ellipse') {
    lines.push(`ellipseMode(CENTER);`)
    lines.push(`ellipse(0, 0, ${element.width}, ${element.height});`)
  } else if (element.type === 'triangle') {
    lines.push(`triangle(0, ${-element.height / 2}, ${element.width / 2}, ${element.height / 2}, ${-element.width / 2}, ${element.height / 2});`)
  } else if (element.type === 'diamond') {
    lines.push(`quad(0, ${-element.height / 2}, ${element.width / 2}, 0, 0, ${element.height / 2}, ${-element.width / 2}, 0);`)
  } else if (element.type === 'arc') {
    lines.push(`arc(0, 0, ${element.width}, ${element.height}, ${element.arcStart ?? 0}, ${element.arcStop ?? 180}, PIE);`)
  } else if (element.type === 'polygon') {
    const sides = Math.max(3, Math.round(element.polygonSides ?? 6))
    lines.push(`beginShape();`)
    for (let i = 0; i < sides; i += 1) {
      const angle = ((-90 + (360 / sides) * i) * Math.PI) / 180
      const x = (Math.cos(angle) * element.width) / 2
      const y = (Math.sin(angle) * element.height) / 2
      lines.push(`vertex(${x.toFixed(3)}, ${y.toFixed(3)});`)
    }
    lines.push(`endShape(CLOSE);`)
  } else if (element.type === 'freePolygon') {
    const points = element.polygonPoints ?? []
    if (points.length >= 3) {
      lines.push(`beginShape();`)
      for (const point of points) {
        const x = (point.x - 0.5) * element.width
        const y = (point.y - 0.5) * element.height
        lines.push(`vertex(${x.toFixed(3)}, ${y.toFixed(3)});`)
      }
      lines.push(`endShape(CLOSE);`)
    }
  } else if (element.type === 'line') {
    const x2 = element.x2 ?? element.x + element.width
    const y2 = element.y2 ?? element.y + element.height
    lines.push(`line(${element.x - (element.x + x2) / 2}, ${element.y - (element.y + y2) / 2}, ${x2 - (element.x + x2) / 2}, ${y2 - (element.y + y2) / 2});`)
  } else if (element.type === 'text') {
    lines.push(`textAlign(LEFT, TOP);`)
    lines.push(`textSize(${element.fontSize ?? 24});`)
    lines.push(`textFont('${(element.fontFamily ?? 'Georgia').replace(/'/g, "\\'")}');`)
    lines.push(`text(${JSON.stringify(element.text ?? 'Text')}, ${-element.width / 2}, ${-element.height / 2}, ${element.width});`)
  } else if (element.type === 'image') {
    lines.push(`// Replace asset${index} with a preload image when image drawing is wired in.`)
    lines.push(`rectMode(CENTER);`)
    lines.push(`rect(0, 0, ${element.width}, ${element.height});`)
  }

  lines.push('pop();')
  return lines.join('\n  ')
}

export const exportCanvasToP5 = (canvas: CanvasState) => {
  const { r, g, b } = hexToRgb(canvas.background)

  return `function setup() {
  createCanvas(${canvas.width}, ${canvas.height});
  angleMode(DEGREES);
  noLoop();
}

function draw() {
  background(${r}, ${g}, ${b});

  ${canvas.elements.map((element, index) => elementToP5(element, index)).join('\n\n  ')}
}`
}