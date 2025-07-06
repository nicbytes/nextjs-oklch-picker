import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { PaintData, PaintedData } from "../worker";
import { rgb, parse } from "../colors";
import { getCleanCtx } from "../canvas";
import { SupportValue } from "../type";


interface StartWork<TaskData extends object, ResultData extends object> {
  (
    type: string,
    parallelTasks: number,
    prepare: (messages: undefined[]) => TaskData[],
    onResult: (result: ResultData) => void,
    onFinal: () => void
  ): void
}

const TOTAL_WORKERS = navigator.hardwareConcurrency;

interface ColorPickerRenderContextType {
  startWorkForComponent: (pickerId: string, canvas: HTMLCanvasElement, type: "c" | "h" | "l", value: number, chartsToChange: number, showP3: boolean, showRec2020: boolean, supportValue: SupportValue) => void;
  onWorkersReady: (callback: () => void) => void;
}

export const ColorPickerRenderContext = createContext<ColorPickerRenderContextType | undefined>(undefined);

export function ColorPickerRenderContextProvider({ children }: { children: React.ReactNode }) {
  const workStarterRef = useRef<StartWork<PaintData, PaintedData>>(null);
  const [startWorkReady, setStartWorkReady] = useState(false);
  const onReadyCallbacks = useRef<(() => void)[]>([]);

  useEffect(() => {
    console.log("worker initialisation");
    const [startWork, terminateWorkers] = prepareWorkers();
    workStarterRef.current = startWork;
    setStartWorkReady(true);
    console.log("worker initialisation done");
    return () => {
      setStartWorkReady(false);
      terminateWorkers();
    };
  }, []);

  useEffect(() => {
    if (!startWorkReady) return;
    onReadyCallbacks.current.forEach(callback => {
      console.log("run onReadyCallbacks");
      callback();
    });
    onReadyCallbacks.current.forEach(callback => {
      console.log("run onReadyCallbacks");
      callback();
    });
  }, [startWorkReady]);


  const startWorkForComponent = useCallback((
    pickerId: string,
    canvas: HTMLCanvasElement,
    type: 'c' | 'h' | 'l',
    value: number,
    chartsToChange: number,
    showP3: boolean,
    showRec2020: boolean,
    supportValue: SupportValue,
  ) => {
    console.log("startWorkForComponent", canvas, type, value, chartsToChange, showP3, showRec2020, supportValue);
    if (!workStarterRef.current) {
      return;
    }
    const startWork = workStarterRef.current;

    const workKey = `${pickerId}-${type}`;

    const [cssP3, cssRec2020] = getBorders()
    const borderP3 = rgb(parse(cssP3)!)
    const borderRec2020 = rgb(parse(cssRec2020)!)

    const parts: [ImageData, number][] = []
    console.log("hit");
    startWork(
      workKey, 
      chartsToChange,
      messages =>
        messages.map((_, i) => {
          const step = Math.floor(canvas.width / messages.length)
          const from = step * i + (i === 0 ? 0 : 1)
          let to = Math.min(step * (i + 1), canvas.width)
          if (i === messages.length - 1) to = canvas.width
          return {
            borderP3,
            borderRec2020,
            from,
            height: canvas.height,
            showP3,
            showRec2020,
            supportValue,
            to,
            type,
            value,
            width: canvas.width
          }
        }),
      result => {
        parts.push([
          new ImageData(
            new Uint8ClampedArray(result.pixels),
            result.width,
            canvas.height
          ),
          result.from
        ])
      },
      () => {
        const ctx = getCleanCtx(canvas, supportValue)
        for (const [image, from] of parts) {
          ctx.putImageData(image, from, 0)
        }
      }
    )
  }, []);

  const onWorkersReady = useCallback((callback: () => void) => {
    onReadyCallbacks.current.push(callback);
    if (startWorkReady) {
      console.log("hit4");
      callback();
    }
  }, [startWorkReady]);

  return (
    <ColorPickerRenderContext value={{ startWorkForComponent, onWorkersReady }}>
      {children}
    </ColorPickerRenderContext>
  );
}

export function useRenderContext(): ColorPickerRenderContextType {
  const context = useContext(ColorPickerRenderContext);
  if (!context) {
    throw new Error('useRenderContext must be used within a RenderContextProvider');
  }
  return context;
}


function anyValue<V>(map: Map<string, V>): undefined | V {
  return map.values().next().value
}

export function prepareWorkers(): [StartWork<PaintData, PaintedData>, () => void] {
  const available = new Array<Worker>(TOTAL_WORKERS);
  for (let i = 0; i < available.length; i++) {
    available[i] = new Worker(new URL('../worker.ts', import.meta.url));
  }

  const busy = new Set<string>();
  const lastPending = new Map<string, Parameters<StartWork<PaintData, PaintedData>>>();

  function startPending(
    args: Parameters<StartWork<PaintData, PaintedData>> | undefined
  ): void {
    if (!args) return
    const type = args[0]
    lastPending.delete(type)
    startWork(type, 1, args[2], args[3], args[4])
  }

  const startWork: StartWork<PaintData, PaintedData> = (
    type,
    parallelTasks,
    prepare,
    onResult,
    onFinal
  ) => {
    console.log("startWork", { type, parallelTasks, prepare, onResult, onFinal });
    if (busy.has(type)) {
      lastPending.set(type, [type, parallelTasks, prepare, onResult, onFinal])
      return
    }

    let started = Math.floor(TOTAL_WORKERS / parallelTasks)
    if (available.length / started > parallelTasks) started += 1
    if (started > available.length) started = available.length

    if (started === 0) {
      lastPending.set(type, [type, parallelTasks, prepare, onResult, onFinal])
      return
    }

    busy.add(type)
    let finished = 0
    const workers = available.splice(0, started)
    const messages = prepare(Array(workers.length).fill(undefined) as undefined[])

    for (const [i, worker] of workers.entries()) {
      worker.onmessage = (e: MessageEvent<PaintedData>) => {
        onResult(e.data)
        available.push(worker)

        finished += 1
        if (finished === started) {
          busy.delete(type)
          startPending(lastPending.get(type) ?? anyValue(lastPending))
          onFinal()
        }
      }
      worker.postMessage(messages[i])
    }
  }

  const terminateWorkers = () => {
    for (const worker of available) {
      worker.terminate()
    }
  };


  return [startWork, terminateWorkers]
}

export function getBorders(): [string, string] {
  const styles = window.getComputedStyle(document.body)
  return [
    styles.getPropertyValue('--border-p3') || '#fff',
    styles.getPropertyValue('--border-rec2020') || '#fff'
  ]
}
