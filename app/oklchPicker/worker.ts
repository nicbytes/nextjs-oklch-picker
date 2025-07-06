import type { Rgb } from './colors'
import { paintCH, paintCL, paintLH } from './paint'
import { SupportValue } from './type';

export type PaintData = {
  borderP3: Rgb
  borderRec2020: Rgb
  from: number
  height: number
  showP3: boolean
  showRec2020: boolean
  supportValue: SupportValue
  to: number
  type: 'c' | 'h' | 'l'
  value: number
  width: number
}

export type PaintedData = {
  from: number
  pixels: ArrayBuffer
  time: number
  width: number
}

self.onmessage = (e: MessageEvent<PaintData>) => {
  const start = Date.now()

  let image: ImageData
  if (e.data.type === 'l') {
    image = paintCH(
      e.data.width,
      e.data.height,
      e.data.from,
      e.data.to,
      e.data.value,
      e.data.showP3,
      e.data.showRec2020,
      e.data.supportValue,
      e.data.borderP3,
      e.data.borderRec2020
    )
  } else if (e.data.type === 'c') {
    image = paintLH(
      e.data.width,
      e.data.height,
      e.data.from,
      e.data.to,
      e.data.value,
      e.data.showP3,
      e.data.showRec2020,
      e.data.supportValue,
      e.data.borderP3,
      e.data.borderRec2020
    )
  } else {
    image = paintCL(
      e.data.width,
      e.data.height,
      e.data.from,
      e.data.to,
      e.data.value,
      e.data.showP3,
      e.data.showRec2020,
      e.data.supportValue,
      e.data.borderP3,
      e.data.borderRec2020
    )
  }

  const message: PaintedData = {
    from: e.data.from,
    pixels: image.data.slice().buffer,
    time: Date.now() - start,
    width: image.width
  }
  self.postMessage(message, [message.pixels])
};