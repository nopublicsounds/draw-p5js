const DEFAULT_FONT_SIZE = 24
const DEFAULT_FONT_FAMILY = 'Inter'
const MIN_TEXT_WIDTH = 24
const MIN_TEXT_HEIGHT = 24
const TEXT_LINE_HEIGHT_RATIO = 1.2
const TEXT_PADDING = 4

let measureContext: CanvasRenderingContext2D | null = null

const getMeasureContext = () => {
  if (measureContext) {
    return measureContext
  }

  if (typeof document === 'undefined') {
    return null
  }

  const canvas = document.createElement('canvas')
  measureContext = canvas.getContext('2d')
  return measureContext
}

const toPositiveNumber = (value: number | undefined, fallback: number) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return fallback
  }

  return value
}

const normalizeTextLines = (text: string | undefined) => {
  const source = text ?? ''
  const lines = source.split(/\r?\n/)
  return lines.length === 0 ? [''] : lines
}

export const measureTextBoxSize = (
  text: string | undefined,
  fontSize: number | undefined,
  fontFamily: string | undefined,
) => {
  const size = toPositiveNumber(fontSize, DEFAULT_FONT_SIZE)
  const family = fontFamily?.trim() || DEFAULT_FONT_FAMILY
  const lines = normalizeTextLines(text)
  const context = getMeasureContext()

  let maxLineWidth = 0
  let lineHeight = size * TEXT_LINE_HEIGHT_RATIO

  if (context) {
    context.font = `${size}px ${family}`
    const metrics = context.measureText('Mg')
    const metricLineHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    if (metricLineHeight > 0) {
      lineHeight = metricLineHeight
    }

    for (const line of lines) {
      const sample = line.length > 0 ? line : ' '
      const measured = context.measureText(sample).width
      if (measured > maxLineWidth) {
        maxLineWidth = measured
      }
    }
  } else {
    for (const line of lines) {
      const approxWidth = Math.max(1, line.length) * size * 0.6
      if (approxWidth > maxLineWidth) {
        maxLineWidth = approxWidth
      }
    }
  }

  return {
    width: Math.max(MIN_TEXT_WIDTH, Math.ceil(maxLineWidth + TEXT_PADDING)),
    height: Math.max(MIN_TEXT_HEIGHT, Math.ceil(lines.length * lineHeight + TEXT_PADDING)),
  }
}
