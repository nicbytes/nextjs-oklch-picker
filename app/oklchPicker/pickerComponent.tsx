"use client";

import { useRef, useEffect, useCallback } from "react";
import { LchValue, useOklchContext } from "./context/OklchContext";
import { initCanvasSize } from "./canvas";
import { useRenderContext } from "./context/renderContext";
import { C_MAX, C_MAX_REC2020, H_MAX, L_MAX } from "@/lib/config";

function Card({children}: {children: React.ReactNode}) {
  return (
    <>
      <div className="bg-gray-700 rounded-3xl flex flex-col justify-center items-center">
        {children}
      </div>
    </>
  );
}

function Chart({ componentType }: { componentType: 'l' | 'c' | 'h' }) {
  const { setComponents, supportValue, showCharts, showP3, showRec2020, addPaintCallbacks} = useOklchContext();
  const {startWorkForComponent} = useRenderContext();

  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("OklchPickerComponent useEffect: before check");
    if (!chartRef.current) {
      console.log("OklchPickerComponent useEffect: not ready");
      return;
    }

    console.log("OklchPickerComponent useEffect: Initialising charts");
    console.log("OklchPickerComponent useEffect: canvases", chartRef.current);

    initCanvasSize(chartRef.current);
    addPaintCallbacks({
      [componentType]: (c: number, chartsToChange: number) => {
        if (!showCharts) return
        startWorkForComponent(chartRef.current!, componentType, c, chartsToChange, showP3, showRec2020, supportValue)
      },
    });

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

    initEvents(chartRef.current);
  }, []);

  return <canvas ref={chartRef} className="chart_canvas" width="340" height="150"></canvas>;
}

export default function OklchPickerComponent() {
  return (
    <>
      <div>
        <Card>
          <div className="chart is-l" aria-hidden="true">
            <Chart componentType="l" />
          </div>
        </Card>
        <div className="chart is-c" aria-hidden="true">
          <Chart componentType="c" />
        </div>
        <div className="chart is-h" aria-hidden="true">
          <Chart componentType="h" />
        </div>
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