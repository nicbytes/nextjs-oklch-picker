import {
  type Color,
  formatRgb as formatRgbFast,
  inGamut,
  type Lch,
  type Lrgb,
  modeHsl,
  modeLab,
  modeLch,
  modeLrgb,
  modeOklab,
  modeOklch,
  modeP3,
  modeRec2020,
  modeRgb,
  modeXyz65,
  type Oklch,
  parse as originParse,
  type P3,
  type Rec2020,
  type Rgb,
  toGamut,
  useMode
} from 'culori/fn'

import { L_MAX, COLOR_FN, L_MAX_COLOR } from './config';
import { LchValue } from './type';

export type { Rgb } from 'culori/fn'

export type AnyLch = Lch | Oklch
export type AnyRgb = Lrgb | P3 | Rec2020 | Rgb

/* eslint-disable react-hooks/rules-of-hooks */
export const rec2020 = useMode(modeRec2020)
export const oklch = useMode(modeOklch)
export const oklab = useMode(modeOklab)
export const xyz65 = useMode(modeXyz65)
export const rgb = useMode(modeRgb)
export const lch = useMode(modeLch)
export const hsl = useMode(modeHsl)
export const lab = useMode(modeLab)
export const lrgb = useMode(modeLrgb)
export const p3 = useMode(modeP3)
/* eslint-enable react-hooks/rules-of-hooks */

const COLOR_SPACE_GAP = 0.0001

// Dirty fix of https://github.com/Evercoder/culori/issues/249
export function inRGB(color: Color): boolean {
  const check = rgb(color)
  return (
    check.r >= -COLOR_SPACE_GAP &&
    check.r <= 1 + COLOR_SPACE_GAP &&
    check.g >= -COLOR_SPACE_GAP &&
    check.g <= 1 + COLOR_SPACE_GAP &&
    check.b >= -COLOR_SPACE_GAP &&
    check.b <= 1 + COLOR_SPACE_GAP
  )
}
export const inP3 = inGamut('p3')
export const inRec2020 = inGamut('rec2020')

export function build(l: number, c: number, h: number, alpha = 1): AnyLch {
  return { alpha, c, h, l, mode: COLOR_FN }
}

export const canvasFormat: (c: AnyLch) => string = formatRgbFast

export function fastFormat(color: Color): string {
  if (color.mode === COLOR_FN) {
    return formatLch(color)
  } else {
    return formatRgbFast(color)
  }
}

export function parse(value: string): Color | undefined {
  return originParse(value.trim())
}

export function parseAnything(value: string): Color | undefined {
  value = value.replace(/\s*;\s*$/, '')
  if (/^[\w-]+:\s*(#\w+|\w+\([^)]+\))$/.test(value)) {
    value = value.replace(/^[\w-]+:\s*/, '')
  }
  if (/^\s*[\d.]+%?\s+[\d.]+\s+[\d.]+\s*$/.test(value)) {
    value = `${COLOR_FN}(${value})`
  }
  return parse(value)
}

export function forceP3(color: Color): P3 {
  return { ...rgb(color), mode: 'p3' }
}

export const toRgb = toGamut('rgb', COLOR_FN)

export function formatRgb(color: Rgb): string {
  const r = Math.round(25500 * color.r) / 100
  const g = Math.round(25500 * color.g) / 100
  const b = Math.round(25500 * color.b) / 100
  if (typeof color.alpha !== 'undefined' && color.alpha < 1) {
    return `rgba(${r}, ${g}, ${b}, ${color.alpha})`
  } else {
    return `rgb(${r}, ${g}, ${b})`
  }
}

export function formatLch(color: AnyLch): string {
  const { alpha, c, h, l } = color
  let postfix = ''
  if (typeof alpha !== 'undefined' && alpha < 1) {
    postfix = ` / ${clean(100 * alpha)}%`
  }
  return `${COLOR_FN}(${clean(l / L_MAX, 4)} ${c} ${h}${postfix})`
}

// Hack to avoid ,999999 because of float bug implementation
export function clean(value: number, precision = 2): number {
  return (
    Math.round(parseFloat((value * 10 ** precision).toFixed(precision))) /
    10 ** precision
  )
}

export function isHexNotation(value: string): boolean {
  return /^#?([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)
}

export type Space = number

// Hack for enum without enum
 
export const Space = {
  Out: 3,
  P3: 1,
  Rec2020: 2,
  sRGB: 0
}

const getProxyColor: (color: Color) => Color = rgb;

export function getSpace(color: Color): Space {
  const proxyColor = getProxyColor(color)
  if (inRGB(proxyColor)) {
    return Space.sRGB
  } else if (inP3(proxyColor)) {
    return Space.P3
  } else if (inRec2020(proxyColor)) {
    return Space.Rec2020
  } else {
    return Space.Out
  }
}

export type GetSpace = typeof getSpace

export function generateGetSpace(
  showP3: boolean,
  showRec2020: boolean
): GetSpace {
  if (showP3 && showRec2020) {
    return color => {
      const proxyColor = getProxyColor(color)
      if (inRGB(proxyColor)) {
        return Space.sRGB
      } else if (inP3(proxyColor)) {
        return Space.P3
      } else if (inRec2020(proxyColor)) {
        return Space.Rec2020
      } else {
        return Space.Out
      }
    }
  } else if (showP3 && !showRec2020) {
    return color => {
      const proxyColor = getProxyColor(color)
      if (inRGB(proxyColor)) {
        return Space.sRGB
      } else if (inP3(proxyColor)) {
        return Space.P3
      } else {
        return Space.Out
      }
    }
  } else if (!showP3 && showRec2020) {
    return color => {
      const proxyColor = getProxyColor(color)
      if (inRGB(proxyColor)) {
        return Space.sRGB
      } else if (inRec2020(proxyColor)) {
        return Space.P3
      } else {
        return Space.Out
      }
    }
  } else {
    return color => (inRGB(color) ? Space.sRGB : Space.Out)
  }
}

export type Pixel = [Space, number, number, number]

export interface GetPixel {
  (x: number, y: number): Pixel
}

export interface GetColor {
  (x: number, y: number): AnyLch
}

export function generateGetPixel(
  getColor: GetColor,
  showP3: boolean,
  showRec2020: boolean,
  p3Support: boolean
): GetPixel {
  if (showP3 && showRec2020) {
    if (p3Support) {
      return (x, y) => {
        const color = getColor(x, y)
        const proxyColor = getProxyColor(color)
        const colorP3 = p3(proxyColor)
        const pixel: Pixel = [
          Space.Out,
          Math.floor(255 * colorP3.r),
          Math.floor(255 * colorP3.g),
          Math.floor(255 * colorP3.b)
        ]
        if (inRGB(proxyColor)) {
          pixel[0] = Space.sRGB
        } else if (inP3(colorP3)) {
          pixel[0] = Space.P3
        } else if (inRec2020(proxyColor)) {
          pixel[0] = Space.Rec2020
        }
        return pixel
      }
    } else {
      return (x, y) => {
        const color = getColor(x, y)
        const proxyColor = getProxyColor(color)
        const colorSRGB = rgb(proxyColor)
        const pixel: Pixel = [
          Space.Out,
          Math.floor(255 * colorSRGB.r),
          Math.floor(255 * colorSRGB.g),
          Math.floor(255 * colorSRGB.b)
        ]
        if (inRGB(colorSRGB)) {
          pixel[0] = Space.sRGB
        } else if (inP3(proxyColor)) {
          pixel[0] = Space.P3
        } else if (inRec2020(proxyColor)) {
          pixel[0] = Space.Rec2020
        }
        return pixel
      }
    }
  } else if (showP3 && !showRec2020) {
    if (p3Support) {
      return (x, y) => {
        const color = getColor(x, y)
        const proxyColor = getProxyColor(color)
        const colorP3 = p3(proxyColor)
        const pixel: Pixel = [
          Space.Out,
          Math.floor(255 * colorP3.r),
          Math.floor(255 * colorP3.g),
          Math.floor(255 * colorP3.b)
        ]
        if (inRGB(proxyColor)) {
          pixel[0] = Space.sRGB
        } else if (inP3(colorP3)) {
          pixel[0] = Space.P3
        }
        return pixel
      }
    } else {
      return (x, y) => {
        const color = getColor(x, y)
        const proxyColor = getProxyColor(color)
        const colorSRGB = rgb(proxyColor)
        const pixel: Pixel = [
          Space.Out,
          Math.floor(255 * colorSRGB.r),
          Math.floor(255 * colorSRGB.g),
          Math.floor(255 * colorSRGB.b)
        ]
        if (inRGB(colorSRGB)) {
          pixel[0] = Space.sRGB
        } else if (inP3(proxyColor)) {
          pixel[0] = Space.P3
        }
        return pixel
      }
    }
  } else if (!showP3 && showRec2020) {
    if (p3Support) {
      return (x, y) => {
        const color = getColor(x, y)
        const proxyColor = getProxyColor(color)
        const colorP3 = p3(proxyColor)
        const pixel: Pixel = [
          Space.Out,
          Math.floor(255 * colorP3.r),
          Math.floor(255 * colorP3.g),
          Math.floor(255 * colorP3.b)
        ]
        if (inRGB(proxyColor)) {
          pixel[0] = Space.sRGB
        } else if (inRec2020(proxyColor)) {
          pixel[0] = Space.Rec2020
        }
        return pixel
      }
    } else {
      return (x, y) => {
        const color = getColor(x, y)
        const proxyColor = getProxyColor(color)
        const colorSRGB = rgb(proxyColor)
        const pixel: Pixel = [
          Space.Out,
          Math.floor(255 * colorSRGB.r),
          Math.floor(255 * colorSRGB.g),
          Math.floor(255 * colorSRGB.b)
        ]
        if (inRGB(colorSRGB)) {
          pixel[0] = Space.sRGB
        } else if (inRec2020(proxyColor)) {
          pixel[0] = Space.Rec2020
        }
        return pixel
      }
    }
  } else if (p3Support) {
    return (x, y) => {
      const color = getColor(x, y)
      const proxyColor = getProxyColor(color)
      const colorP3 = p3(proxyColor)
      const pixel: Pixel = [
        Space.Out,
        Math.floor(255 * colorP3.r),
        Math.floor(255 * colorP3.g),
        Math.floor(255 * colorP3.b)
      ]
      if (inRGB(proxyColor)) {
        pixel[0] = Space.sRGB
      }
      return pixel
    }
  } else {
    return (x, y) => {
      const color = getColor(x, y)
      const colorSRGB = rgb(color)
      const pixel: Pixel = [
        Space.Out,
        Math.floor(255 * colorSRGB.r),
        Math.floor(255 * colorSRGB.g),
        Math.floor(255 * colorSRGB.b)
      ]
      if (inRGB(colorSRGB)) {
        pixel[0] = Space.sRGB
      }
      return pixel
    }
  }
}



export interface VisibleValue {
  color: Color
  fallback: string
  real: false | string
  space: 'out' | 'p3' | 'rec2020' | 'srgb'
}

export function getVisibleValue(value: LchValue, p3: boolean, rec2020: boolean): VisibleValue {
  const color = valueToColor(value)
  const space = getSpace(color)
  if (space === Space.sRGB) {
    const rgbCss = formatRgb(rgb(color))
    return {
      color,
      fallback: rgbCss,
      real: rgbCss,
      space: 'srgb'
    }
  } else {
    const rgbColor = toRgb(color)
    const fallback = formatRgb(rgbColor)
    if (space === Space.P3) {
      return {
        color: p3 ? color : rgbColor,
        fallback,
        real: p3 ? fastFormat(color) : false,
        space: 'p3'
      }
    } else if (space === Space.Rec2020) {
      return {
        color: rec2020 ? color : rgbColor,
        fallback,
        real: rec2020 ? fastFormat(color) : false,
        space: 'rec2020'
      }
    } else {
      return {
        color: rgbColor,
        fallback,
        real: false,
        space: 'out'
      }
    }
  }
}

export function colorToValue(color: AnyLch): LchValue {
  return {
    a: (color.alpha ?? 1),
    c: color.c,
    h: color.h ?? 0,
    l: color.l / L_MAX_COLOR,
  }
}

export function valueToColor(value: LchValue): AnyLch {
  return build(value.l * L_MAX_COLOR, value.c, value.h, value.a)
}