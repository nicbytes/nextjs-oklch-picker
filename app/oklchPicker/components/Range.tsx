import { useCallback, useEffect, useMemo, useRef } from "react";
import { useOklchContext } from "../context/OklchContext";
import { useRenderContext } from "../context/renderContext";
import { ALPHA_MAX, ALPHA_STEP, C_MAX, C_MAX_REC2020, C_STEP, H_MAX, H_STEP, L_MAX_COLOR, L_STEP } from "@/lib/config";
import styles from './Range.module.css';
import { getCleanCtx, initCanvasSize } from "../canvas";
import { AnyLch, build, canvasFormat, fastFormat, generateGetSpace, Space, toRgb, valueToColor } from "@/lib/colors";
import { LchValue, SupportValue } from "../type";

export default function Range({ componentType }: { componentType: 'a' | 'l' | 'c' | 'h' }) {

  const { value, setComponents, supportValue, showCharts, showP3, showRec2020, addPaintCallbacks} = useOklchContext();

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
        max: showRec2020 ? C_MAX_REC2020 : C_MAX,
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





  useEffect(() => {
    const callback = () => {
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
    };

    if (componentType !== 'a') {
      const [type, painter] = callback!();
      addPaintCallbacks(`range-for-${componentType}`, {
        [type]: painter,
      });
    }

  }, [showRec2020, showP3, showRec2020, componentType]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (componentType === 'l') {
      setComponents({ l: parseFloat(e.target.value) });
    } else if (componentType === 'c') {
      setComponents({ c: parseFloat(e.target.value) });
    } else if (componentType === 'h') {
      setComponents({ h: parseFloat(e.target.value) });
    }
  }, []);

  return (
    <div ref={divRef} className="relative box-border h-10 border border-zinc-500/40 border-dashed block rounded-xl w-[340px]">
      <canvas ref={canvasRef} className="absolute top-[-1px] left-[-1px] w-[calc(100%+2px)] h-[calc(100%+2px)] rounded-xl overflow-clip" width="340" height="40" style={{ overflowClipMargin: 'content-box', width: 340, aspectRatio: "auto 680/80" }}></canvas>
      <input ref={inputRef} className={`absolute top-[-1px] left-[-13px] z-2 w-[calc(100%+26px)] h-[calc(100%+2px)] appearance-none cursor-pointer bg-transparent rounded-xl ${styles.rangeInput}`} type="range" min="0" max={max} step={step} aria-hidden="true" value={inputValue} tabIndex={-1} list={`range_${componentType}_values`} onChange={onChange} />
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