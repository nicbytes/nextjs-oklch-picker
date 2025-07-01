"use client";

import { useRef, useEffect } from "react";
import { useOklchContext } from "./context/OklchContext";
import { initCanvasSize } from "./canvas";
import { useRenderContext } from "./context/renderContext";
import { C_MAX, C_MAX_REC2020, H_MAX, L_MAX } from "@/lib/config";
import Range from "./components/Range";
import { getVisibleValue } from "@/lib/colors";
import { LchValue } from "./type";

function round2(value: number): number {
  return parseFloat(value.toFixed(2))
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-zinc-800 rounded-3xl flex flex-col justify-center items-center">
        {children}
      </div>
    </>
  );
}

function Chart({ componentType }: { componentType: 'l' | 'c' | 'h' }) {
  const { setComponents, supportValue, showCharts, showP3, showRec2020, addPaintCallbacks } = useOklchContext();
  const { startWorkForComponent } = useRenderContext();

  const chartRef = useRef<HTMLCanvasElement>(null);
  const containingDivRef = useRef<HTMLDivElement>(null);
  const xAxisDivRef = useRef<HTMLDivElement>(null);
  const yAxisDivRef = useRef<HTMLDivElement>(null);



  const xyComponents = {
    h: ['L', 'C'], // lightness
    l: ['H', 'C'], // chroma
    c: ['H', 'L'], // hue
  }[componentType] as ['L' | 'H', 'C' | 'L'];

  const [xComponent, yComponent] = xyComponents;


  useEffect(() => {
    console.log("OklchPickerComponent useEffect: before check");
    if (!chartRef.current) {
      console.log("OklchPickerComponent useEffect: not ready");
      return;
    }

    console.log("OklchPickerComponent useEffect: Initialising charts");
    console.log("OklchPickerComponent useEffect: canvases", chartRef.current);

    initCanvasSize(chartRef.current);

    // Bind the chart lines to the current values
    xAxisDivRef.current!.style.setProperty('--chart-line-position', `var(--chart-${xComponent.toLowerCase()})`);
    yAxisDivRef.current!.style.setProperty('--chart-line-position', `var(--chart-${yComponent.toLowerCase()})`);

    // TODO: Remove event listeners on unmount.
    function initEvents(chart: HTMLCanvasElement): void {
      function onSelect(e: MouseEvent): void {
        e.preventDefault()
        setComponentsFromSpace(chart, e.clientX, e.clientY, componentType, setComponents)
      }

      function onMouseUp(e: MouseEvent): void {
        document.removeEventListener('mousemove', onSelect)
        document.removeEventListener('mouseup', onMouseUp)
        setComponentsFromSpace(chart, e.clientX, e.clientY, componentType, setComponents)
      }

      chart.addEventListener('mousedown', () => {
        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mousemove', onSelect)
      })
    }

    initEvents(chartRef.current);
  }, []);

  useEffect(() => {
    addPaintCallbacks(`chart-for-${componentType}`, {
      [componentType]: (c: number, chartsToChange: number) => {
        if (!showCharts) return
        startWorkForComponent(chartRef.current!, componentType, c, chartsToChange, showP3, showRec2020, supportValue);
      },
    });

    addPaintCallbacks(`value-for-${componentType}`, {
      c(c) {
        containingDivRef.current!.style.setProperty('--chart-c', `${round2((100 * c) / getMaxC(showRec2020))}%`);
      },
      h(h) {
        containingDivRef.current!.style.setProperty('--chart-h', `${round2((100 * h) / H_MAX)}%`);
      },
      l(l) {
        containingDivRef.current!.style.setProperty('--chart-l', `${round2((100 * l) / L_MAX)}%`);
      }
    });
  }, [componentType, showCharts, showP3, showRec2020, supportValue]);

  const xPositionVariable = `--chart-${xComponent.toLowerCase()}`;
  const yPositionVariable = `--chart-${yComponent.toLowerCase()}`;

  const xLineAfterClassName = "after:top-0 after:bottom-0 after:left-[var(--chart-line-position)] after:w-[1px] after:absolute after:z-[2] after:bg-gray-900 after:mix-blend-difference after:opacity-70";
  const yLineAfterClassName = "after:right-0 after:left-0 after:bottom-[var(--chart-line-position)] after:h-[1px] after:absolute after:z-[2] after:bg-gray-900 after:mix-blend-difference after:opacity-70";

  return (
    <div className="box-border relative border-t border-b border-zinc-500/40 border-dashed inline-block m-8" ref={containingDivRef}>
      {/* X axis */}
      <div ref={xAxisDivRef} className={`absolute left-0 top-0 w-full h-[calc(100%+1px)] ${xLineAfterClassName}`} style={{ pointerEvents: 'none' }}>
        <div className={`absolute top-[100%] w-[15px] h-[15px] text-[12px] text-center uppercase select-none opacity-50`} style={{ left: `calc(var(${xPositionVariable}) - 7px)` }}>{xComponent}</div>
      </div>
      {/* Y axis */}
      <div ref={yAxisDivRef} className={`absolute left-0 top-0 w-full h-[calc(100%+1px)] ${yLineAfterClassName}`} style={{ pointerEvents: 'none' }}>
        <div
          className="absolute left-[-15px] w-[15px] h-[15px] text-[12px] text-center uppercase select-none opacity-50"
          style={{ bottom: `calc(var(${yPositionVariable}) - 7px)` }}
        >{yComponent}</div>
      </div>
      <canvas ref={chartRef} className="chart_canvas" width="340" height="150"></canvas>
    </div>
  );
}


function Sample() {
  const { value, showP3, showRec2020, supportValue } = useOklchContext();

  const visible = getVisibleValue(value, showP3, showRec2020);
  const { color, real, fallback, space } = visible;


  let unavailableMessage = null;
  if (real) {
    unavailableMessage = null;
  } else if (space === "p3" && supportValue.p3 === false) {
    unavailableMessage = "P3 is unavaliable on this monitor.";
  } else if (space === "rec2020" && supportValue.rec2020 === false) {
    unavailableMessage = "Rec2020 is unavailable on this monitor.";
  } else if (space === "out") {
    unavailableMessage = "Unavailable on any device.";
  }

  console.log("visible", visible);




  return (
    <div className="flex">
      <div className="relative w-full h-24 outline -outline-offset-1 outline-black/10 dark:outline-white/10 rounded text-center flex flex-col justify-center items-center" style={{ backgroundColor: real ? real : "" }}>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">{unavailableMessage}</span>
        {((space === "p3" && supportValue.p3) || (space === "rec2020" && supportValue.rec2020)) &&
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-white font-light bg-zinc-600 p-1 rounded-lg pr-2 pl-2 mb-1">{space.toLocaleUpperCase()}</div>
        }
      </div>
      {space !== "srgb" &&
        <div className="relative w-full h-24 outline -outline-offset-1 outline-black/10 dark:outline-white/10 rounded" style={{ backgroundColor: fallback }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-white font-light bg-zinc-600 p-1 rounded-lg pr-2 pl-2 mb-1">Fallback</div>
        </div>
      }
    </div>
  );
}




export default function OklchPickerComponent() {
  return (
    <>
      <div>
        <div>
          <Sample />
        </div>
        <Card>
          <div className="chart is-l" aria-hidden="true">
            <Chart componentType="h" />
            <Range componentType="l" />
          </div>
        </Card>
        <div className="chart is-c" aria-hidden="true">
          <Chart componentType="l" />
          <Range componentType="c" />
        </div>
        <div className="chart is-h" aria-hidden="true">
          <Chart componentType="c" />
          <Range componentType="h" />
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
  componentType: 'l' | 'c' | 'h',
  setComponents: (parts: Partial<LchValue>) => void
): void {
  let rect = space.getBoundingClientRect()
  let x = clamp(mouseX - rect.left, 0, rect.width)
  let y = clamp(rect.height - (mouseY - rect.top), 0, rect.height)
  if (componentType === 'l') {
    setComponents({
      c: (getMaxC() * y) / rect.height,
      h: (H_MAX * x) / rect.width
    })
  } else if (componentType === 'c') {
    setComponents({
      h: (H_MAX * x) / rect.width,
      l: (L_MAX * y) / rect.height
    })
  } else if (componentType === 'h') {
    setComponents({
      c: (getMaxC() * y) / rect.height,
      l: (L_MAX * x) / rect.width
    })
  }
}
