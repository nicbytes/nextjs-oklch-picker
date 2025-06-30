import { useCallback, useEffect, useMemo, useRef } from "react";
import { LchValue, SupportValue, useOklchContext, valueToColor } from "../context/OklchContext";
import { useRenderContext } from "../context/renderContext";
import { ALPHA_MAX, ALPHA_STEP, C_MAX, C_MAX_REC2020, C_STEP, H_MAX, H_STEP, L_MAX_COLOR, L_STEP } from "@/lib/config";
import styles from './Range.module.css';
import { getCleanCtx, initCanvasSize } from "../canvas";
import { AnyLch, build, canvasFormat, fastFormat, generateGetSpace, Space, toRgb } from "@/lib/colors";

export default function Range({ componentType }: { componentType: 'a' | 'l' | 'c' | 'h' }) {

  const { value, setComponents, supportValue, showCharts, showP3, showRec2020, addPaintCallbacks} = useOklchContext();
  const {startWorkForComponent} = useRenderContext();

  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataListRef = useRef<HTMLDataListElement>(null);

  const setList = (values: number[]) => {
    if (!dataListRef.current) return;
    const list = dataListRef.current;
    list.replaceChildren(
      ...values.map(value => {
        let option = document.createElement('option')
        option.value = String(value)
          .replace(/(0{5,}\d|9{5,}\d)/, '')
          .replace(/\.$/, '')
        return option
      })
    );
  };

  const inputValue = value[componentType];
  const {max, step, defaultValue} = useMemo(() => {
    return {
      a: {
        max: ALPHA_MAX,
        step: ALPHA_STEP / 100,
        defaultValue: 100,
      },
      l: {
        max: 1,
        step: L_STEP,
        defaultValue: 70,
      },
      c: {
        max: C_MAX,
        step: C_STEP / 100,
        defaultValue: 0.1,
      },
      h: {
        max: H_MAX,
        step: H_STEP / 100,
        defaultValue: 286,
      }
    }[componentType];
  }, [componentType]);

  const callback = useCallback(() => {
    if (!canvasRef.current) return ["ch", (v: LchValue) => {}];
    if (!inputRef.current) return ["ch", (v: LchValue) => {}];
    let painters = {
      ch(value: LchValue) {
        let color = valueToColor(value);
        let c = color.c
        let h = color.h ?? 0
        let [width, height] = initCanvasSize(canvasRef.current!)
        let factor = L_MAX_COLOR / width
        setList(
          paint(
            canvasRef.current!,
            'l',
            width,
            height,
            parseFloat(String(step)),
            x => {
              return build(x * factor, c, h)
            },
            supportValue,
            showP3,
            showRec2020,
          )
        )
      },
      lc(value: LchValue) {
        let { c, l } = valueToColor(value)
        let [width, height] = initCanvasSize(canvasRef.current!)
        let factor = H_MAX / width
        setList(
          paint(
            canvasRef.current!,
            'h',
            width,
            height,
            parseFloat(String(step)),
            x => {
              return build(l, c, x * factor)
            },
            supportValue,
            showP3,
            showRec2020,
          )
        )
      },
      lh(value: LchValue) {
        let color = valueToColor(value)
        let l = color.l
        let h = color.h ?? 0
        let [width, height] = initCanvasSize(canvasRef.current!)
        let factor = (showRec2020 ? C_MAX_REC2020 : C_MAX) / width
        setList(
          paint(
            canvasRef.current!,
            'c',
            width,
            height,
            parseFloat(String(step)),
            x => {
              return build(l, x * factor, h)
            },
            supportValue,
            showP3,
            showRec2020,
          )
        )
      }
    }
    const type = componentType as 'l' | 'c' | 'h';
    return {
      l: ["ch", painters.ch],
      c: ["lh", painters.lh],
      h: ["lc", painters.lc],
    }[type];
  }, [canvasRef.current, supportValue, showP3, showRec2020, step, componentType]);



  useEffect(() => {

    if (componentType !== 'a') {
      const [type, painter] = callback!();
      addPaintCallbacks({
        [type]: painter,
      });
    }

  }, []);

  return (
    <div ref={divRef} className={styles.range}>
      <canvas ref={canvasRef} className={styles.rangeSpace} width="680" height="80"></canvas>
      <input ref={inputRef} className={styles.rangeInput} type="range" min="0" max={max} step={step} aria-hidden="true" value={inputValue} tabIndex={-1} list={`range_${componentType}_values`} />
      <datalist ref={dataListRef} id={`range_${componentType}_values`}>
        <option value="0.1188"></option>
        <option value="0.1589"></option>
        <option value="0.2612"></option>
      </datalist>
    </div>
  )
}

export function getBorders(): [string, string] {
  let styles = window.getComputedStyle(document.body)
  return [
    styles.getPropertyValue('--border-p3') || '#fff',
    styles.getPropertyValue('--border-rec2020') || '#fff'
  ]
}

function paint(
  canvas: HTMLCanvasElement,
  type: 'c' | 'h' | 'l',
  width: number,
  height: number,
  sliderStep: number,
  getColor: (x: number) => AnyLch,
  supportValue: SupportValue,
  showP3: boolean,
  showRec2020: boolean,
): number[] {
  let ctx = getCleanCtx(canvas, supportValue)
  let halfHeight = Math.floor(height / 2)
  let [borderP3, borderRec2020] = getBorders()
  let getSpace = generateGetSpace(showP3, showRec2020)

  let stops: number[] = []
  function addStop(x: number, round: (num: number) => number): void {
    let origin = getColor(x)
    let value = origin[type] ?? 0
    stops.push(round(value / sliderStep) * sliderStep)
  }

  let prevSpace = getSpace(getColor(0))
  for (let x = 0; x <= width; x++) {
    let color = getColor(x)
    let space = getSpace(color)
    if (space !== Space.Out) {
      ctx.fillStyle = canvasFormat(color)
      if (space === Space.sRGB) {
        ctx.fillRect(x, 0, 1, height)
      } else {
        ctx.fillRect(x, 0, 1, halfHeight)
        let fallback = toRgb(color)
        ctx.fillStyle = fastFormat(fallback)
        ctx.fillRect(x, halfHeight, 1, halfHeight + 1)
      }
      if (prevSpace !== space) {
        if (
          prevSpace === Space.Out ||
          (prevSpace === Space.Rec2020 && space === Space.P3) ||
          (prevSpace === Space.P3 && space === Space.sRGB)
        ) {
          addStop(x, Math.ceil)
        } else {
          addStop(x - 1, Math.floor)
        }
        if (space === Space.P3 && prevSpace !== Space.Rec2020) {
          ctx.fillStyle = borderP3
          ctx.fillRect(x, 0, 1, height)
        } else if (space === Space.sRGB && prevSpace === Space.P3) {
          ctx.fillStyle = borderP3
          ctx.fillRect(x - 1, 0, 1, height)
        } else if (space === Space.Rec2020) {
          ctx.fillStyle = borderRec2020
          ctx.fillRect(x, 0, 1, height)
        } else if (prevSpace === Space.Rec2020) {
          ctx.fillStyle = borderRec2020
          ctx.fillRect(x - 1, 0, 1, height)
        }
      }
    } else {
      if (prevSpace !== Space.Out) {
        addStop(x - 1, Math.floor)
      }
      if (type === 'c') {
        return stops
      }
    }
    prevSpace = space
  }
  return stops
}