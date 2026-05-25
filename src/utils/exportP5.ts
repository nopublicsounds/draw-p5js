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

const toJsStringLiteral = (value: string) => JSON.stringify(value)

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

const getLineStrokeColor = (element: CanvasElement) => (element.style.stroke === 'none' ? '#182442' : element.style.stroke)

const getLineStrokeWeight = (element: CanvasElement) => (element.style.strokeWeight > 0 ? element.style.strokeWeight : 2)

const elementToP5 = (element: CanvasElement, index: number) => {
  const lines = [...transformStart(element)]

  if (element.type === 'line') {
    lines.push(`noFill();`)
    lines.push(colorStatement('stroke', getLineStrokeColor(element), element.style.opacity))
    lines.push(`strokeWeight(${getLineStrokeWeight(element)});`)
  } else {
    lines.push(colorStatement('fill', element.style.fill, element.style.opacity))
    lines.push(colorStatement('stroke', element.style.stroke, element.style.opacity))
    lines.push(`strokeWeight(${element.style.strokeWeight});`)
  }

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
    lines.push(`const _label${index} = ${toJsStringLiteral(element.text ?? 'Text')};`)
    lines.push(`const _font${index} = ${toJsStringLiteral(element.fontFamily ?? 'Inter')};`)
    lines.push(`textWrap(CHAR);`)
    lines.push(`textAlign(LEFT, TOP);`)
    lines.push(`textSize(${element.fontSize ?? 24});`)
    lines.push(`textFont(_font${index});`)
    lines.push(`if (${element.style.stroke !== 'none' && element.style.strokeWeight > 0}) {`)
    lines.push(`  noFill();`)
    lines.push(colorStatement('stroke', element.style.stroke, element.style.opacity))
    lines.push(`  strokeWeight(${element.style.strokeWeight});`)
    lines.push(`  rectMode(CORNER);`)
    lines.push(`  rect(${-element.width / 2}, ${-element.height / 2}, ${element.width}, ${element.height});`)
    lines.push(`}`)
    lines.push(`if (${element.style.fill === 'none'}) {`)
    lines.push(`  fill(11, 28, 48, ${Math.round(element.style.opacity * 255)});`)
    lines.push(`} else {`)
    lines.push(colorStatement('fill', element.style.fill, element.style.opacity))
    lines.push(`}`)
    lines.push(`noStroke();`)
    lines.push(`text(_label${index}, ${-element.width / 2}, ${-element.height / 2});`)
  } else if (element.type === 'image') {
    const hasSource = Boolean(element.src?.trim())
    const imageKey = `asset_${index}`
    if (hasSource) {
      lines.push(`const _img${index} = imageAssets[${toJsStringLiteral(imageKey)}];`)
      lines.push(`if (_img${index}) {`)
      lines.push(`  imageMode(CENTER);`)
      lines.push(`  image(_img${index}, 0, 0, ${element.width}, ${element.height});`)
      lines.push(`} else {`)
      lines.push(`  noStroke();`)
      lines.push(`  fill(211, 228, 254, ${Math.round(element.style.opacity * 255)});`)
      lines.push(`  rectMode(CENTER);`)
      lines.push(`  rect(0, 0, ${element.width}, ${element.height});`)
      lines.push(`}`)
    } else {
      lines.push(`noStroke();`)
      lines.push(`fill(211, 228, 254, ${Math.round(element.style.opacity * 255)});`)
      lines.push(`rectMode(CENTER);`)
      lines.push(`rect(0, 0, ${element.width}, ${element.height});`)
    }
  }

  lines.push('pop();')
  return lines.join('\n  ')
}

export const exportCanvasToP5 = (canvas: CanvasState) => {
  const { r, g, b } = hexToRgb(canvas.background)

  const imageElements = canvas.elements
    .map((element, index) => ({ element, index }))
    .filter(({ element }) => element.type === 'image' && Boolean(element.src?.trim()))

  const preloadSection =
    imageElements.length > 0
      ? `\nconst imageAssets = {};\n\nfunction preload() {\n${imageElements
          .map(({ element, index }) => `  imageAssets[${toJsStringLiteral(`asset_${index}`)}] = loadImage(${toJsStringLiteral(element.src ?? '')});`)
          .join('\n')}\n}\n`
      : `\nconst imageAssets = {};\n`

  return `${preloadSection}\nfunction setup() {
  createCanvas(${canvas.width}, ${canvas.height});
  angleMode(DEGREES);
  pixelDensity(window.devicePixelRatio || 1);
  noLoop();
}

function draw() {
  background(${r}, ${g}, ${b});

  ${canvas.elements.map((element, index) => elementToP5(element, index)).join('\n\n  ')}
}`
}