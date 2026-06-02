import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../public/icons')
mkdirSync(outDir, { recursive: true })

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const r = size * 0.225

  ctx.fillStyle = '#007AFF'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, r)
  ctx.fill()

  ctx.strokeStyle = 'white'
  ctx.lineWidth = size * 0.085
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(size * 0.31, size * 0.5)
  ctx.lineTo(size * 0.45, size * 0.66)
  ctx.lineTo(size * 0.69, size * 0.34)
  ctx.stroke()

  return canvas.toBuffer('image/png')
}

writeFileSync(path.join(outDir, 'icon-192.png'), drawIcon(192))
writeFileSync(path.join(outDir, 'icon-512.png'), drawIcon(512))
console.log('Icons generated ✓')
