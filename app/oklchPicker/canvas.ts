import { SupportValue } from "./type"

export function getCleanCtx(
  canvas: HTMLCanvasElement,
  support: SupportValue
): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', {
    colorSpace: support.p3 ? 'display-p3' : 'srgb'
  })!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  return ctx
}

export function initCanvasSize(canvas: HTMLCanvasElement): [number, number] {
  const pixelRation = Math.ceil(window.devicePixelRatio);
  const { width: cssW, height: cssH } = canvas.getBoundingClientRect();
  const width = cssW * pixelRation;
  const height = cssH * pixelRation;

  canvas.style.width  = `${cssW}px`;   // lock layout size
  canvas.style.height = `${cssH}px`;

  canvas.width = width; // Set render size to match DPI
  canvas.height = height;
  return [width, height];
}