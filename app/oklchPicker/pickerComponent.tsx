import { useRef, useEffect, useCallback } from "react";
import { LchValue, useOklchContext } from "./context/OklchContext";
import { initCanvasSize } from "./canvas";
import { useRenderContext } from "./context/renderContext";
import { C_MAX, C_MAX_REC2020, H_MAX, L_MAX } from "@/lib/config";

export default function OklchPickerComponent() {

  const { setComponents, supportValue, showCharts, showP3, showRec2020, addPaintCallbacks} = useOklchContext();
  const OklchContext = useOklchContext();
  const {startWorkForComponent} = useRenderContext();

  const chartLRef = useRef<HTMLCanvasElement>(null);
  const chartCRef = useRef<HTMLCanvasElement>(null);
  const chartHRef = useRef<HTMLCanvasElement>(null);

  const attachedPaintCallbacksRef = useRef<boolean>(false);

  useEffect(() => {
    if (!chartLRef.current || !chartCRef.current || !chartHRef.current) {
      return;
    }

    initCanvasSize(chartLRef.current);
    initCanvasSize(chartCRef.current);
    initCanvasSize(chartHRef.current);
    if (attachedPaintCallbacksRef.current) {
      return;
    }
    addPaintCallbacks({
      c(c, chartsToChange) {
        if (!showCharts) return
        startWorkForComponent(chartCRef.current!, 'c', c, chartsToChange, showP3, showRec2020, supportValue)
      },
      h(h, chartsToChange) {
        if (!showCharts) return
        startWorkForComponent(chartHRef.current!, 'h', h, chartsToChange, showP3, showRec2020, supportValue)
      },
      l(l, chartsToChange) {
        if (!showCharts) return
        startWorkForComponent(chartLRef.current!, 'l', l, chartsToChange, showP3, showRec2020, supportValue)
      }
    });
    attachedPaintCallbacksRef.current = true;

    // TODO: Remove event listeners on unmount.
    function initEvents(chart: HTMLCanvasElement): void {
      function onSelect(e: MouseEvent): void {
        e.preventDefault()
        setComponentsFromSpace(chart, e.clientX, e.clientY, showRec2020, setComponents)
      }
    
      function onMouseUp(e: MouseEvent): void {
        document.removeEventListener('mousemove', onSelect)
        document.removeEventListener('mouseup', onMouseUp)
        setComponentsFromSpace(chart, e.clientX, e.clientY, showRec2020, setComponents)
      }
    
      chart.addEventListener('mousedown', () => {
        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mousemove', onSelect)
      })
    }

    // initEvents(chartLRef.current);
    // initEvents(chartCRef.current);
    // initEvents(chartHRef.current);
  }, [!chartLRef.current, !chartCRef.current, !chartHRef.current]);

  return (
    <>
      <div className="chart is-l" aria-hidden="true">
        <canvas ref={chartLRef} className="chart_canvas" width="340" height="150"></canvas>
      </div>
      <div className="chart is-c" aria-hidden="true">
        <canvas ref={chartCRef} className="chart_canvas" width="340" height="150"></canvas>
      </div>
      <div className="chart is-h" aria-hidden="true">
        <canvas ref={chartHRef} className="chart_canvas" width="340" height="150"></canvas>
      </div>
    </>
  );
}

function getMaxC(showRec2020: boolean = false): number {
  return showRec2020 ? C_MAX_REC2020 : C_MAX
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(min, val), max)
}

function setComponentsFromSpace(
  space: HTMLCanvasElement,
  mouseX: number,
  mouseY: number,
  showRec2020: boolean,
  setComponents: (parts: Partial<LchValue>) => void
): void {
  let rect = space.getBoundingClientRect()
  let x = clamp(mouseX - rect.left, 0, rect.width)
  let y = clamp(rect.height - (mouseY - rect.top), 0, rect.height)
  if (space.parentElement!.classList.contains('is-l')) {
    setComponents({
      c: (getMaxC() * y) / rect.height,
      h: (H_MAX * x) / rect.width
    })
  } else if (space.parentElement!.classList.contains('is-c')) {
    setComponents({
      h: (H_MAX * x) / rect.width,
      l: (L_MAX * y) / rect.height
    })
  } else if (space.parentElement!.classList.contains('is-h')) {
    setComponents({
      c: (getMaxC() * y) / rect.height,
      l: (L_MAX * x) / rect.width
    })
  }
}