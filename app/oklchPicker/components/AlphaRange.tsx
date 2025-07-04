import { useCallback, useEffect, useMemo, useRef } from "react";
import { useOklchContext } from "../context/OklchContext";
import { useRenderContext } from "../context/renderContext";
import { ALPHA_MAX, ALPHA_STEP, C_MAX, C_MAX_REC2020, C_STEP, H_MAX, H_STEP, L_MAX_COLOR, L_STEP } from "@/lib/config";
import styles from './Range.module.css';
import { getCleanCtx, initCanvasSize } from "../canvas";
import { AnyLch, build, canvasFormat, fastFormat, generateGetSpace, Space, toRgb, valueToColor } from "@/lib/colors";
import { LchValue, SupportValue } from "../type";

export default function AlphaRange() {

  const colorDivRef = useRef<HTMLDivElement>(null);
  const { value, setComponents, supportValue, showCharts, showP3, showRec2020, addPaintCallbacks} = useOklchContext();
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
    setComponents({ a: parseFloat(e.target.value) });
  }, []);

  useEffect(() => {
    if (!colorDivRef.current) return;
    colorDivRef.current.style.setProperty('--target-color', `oklch(${value.l} ${value.c} ${value.h})`);
  }, [value]);

  return (
    <div className="relative box-border h-10 block rounded-xl w-[340px] bg-[repeating-conic-gradient(theme(colors.neutral.700)_0%_25%,theme(colors.neutral.800)_0%_50%)] [background-position:50%] [background-size:8px_8px]">
        <div ref={colorDivRef} className="w-full h-full bg-gradient-to-r from-transparent to-[var(--target-color)] rounded-xl"></div>
      <input
        className={`absolute top-[-1px] left-[-13px] z-2 w-[calc(100%+26px)] h-[calc(100%+2px)] appearance-none cursor-pointer bg-transparent rounded-xl ${styles.rangeInput}`}
        type="range"
        min="0"
        max={ALPHA_MAX}
        step={ALPHA_STEP / 100}
        aria-hidden="true"
        value={value.a}
        tabIndex={-1}
        list={`range_a_values`}
        onChange={onChange}
      />
      <datalist id={`range_a_values`}>
        <option value="0"></option>
        <option value="0.1"></option>
        <option value="0.2"></option>
        <option value="0.3"></option>
        <option value="0.4"></option>
        <option value="0.5"></option>
        <option value="0.6"></option>
        <option value="0.7"></option>
        <option value="0.8"></option>
        <option value="0.9"></option>
        <option value="1"></option>
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
