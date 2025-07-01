import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  type AnyLch,
  build,
  forceP3,
  getSpace,
  lch,
  oklch,
  parseAnything,
  Space,
  toRgb
} from '@/lib/colors'
import { formatHex8 } from 'culori/fn'
import { C_RANDOM, COLOR_FN, L_MAX_COLOR } from "@/lib/config";

export interface LchValue {
  a: number;
  c: number;
  h: number;
  l: number;
}

export type OutputFormats =
  | 'figmaP3'
  | 'hex'
  | 'hex/rgba'
  | 'hsl'
  | 'lab'
  | 'lch'
  | 'lrgb'
  | 'numbers'
  | 'oklab'
  | 'p3'
  | 'rgb'
  ;

export interface SupportValue {
  p3: boolean
  rec2020: boolean
}

export interface OklchContextType {
  /**
   * The color code input by the user.
   * 
   * Can be any valid CSS color value.
   */
  colorCodeInput: string;
  /**
   * Set the color code input by the user.
   * 
   * Can be any valid CSS color value.
   */
  setColorCodeInput: (code: string) => void;

  /**
   * The current resulting color value.
   */
  value: LchValue;
  /**
   * Set the current resulting color value.
   */
  setValue: (value: LchValue) => void;

  setComponents: (parts: Partial<LchValue>) => void;

  /**
   * The current output format. Represents most possible CSS color formats.
   */
  outputFormat: OutputFormats;
  /**
   * Set the current output format.
   */
  setOutputFormat: (format: OutputFormats) => void;

  showCharts: boolean;
  setShowCharts: (showCharts: boolean) => void;
  showP3: boolean;
  setShowP3: (showP3: boolean) => void;
  showRec2020: boolean;
  setShowRec2020: (showRec2020: boolean) => void;
  supportValue: SupportValue;

  addPaintCallbacks: (name: string, callbacks: LchCallbacks) => void;
}

export const OklchContext = createContext<OklchContextType | undefined>(undefined);

export interface OklchContextProviderProps {
  children: React.ReactNode;
  defaultColorCode: string;
}

export function useOklchContext(): OklchContextType {
  const context = useContext(OklchContext);
  if (!context) {
    throw new Error('useOklchContext must be used within an OklchContextProvider');
  }
  return context;
}

export const OklchContextProvider: React.FC<OklchContextProviderProps> = ({ children, defaultColorCode }) => {

  // TODO: Align the initial value with the default color.
  let [value, setStateValue] = useState<LchValue>({ a: 100, c: C_RANDOM, h: Math.round(360 * Math.random()), l: 0.7 });
  let [colorCodeInput, setStateColorCodeInput] = useState(defaultColorCode);
  let [outputFormat, setOutputFormat] = useState<OutputFormats>('lch');
  let [showCharts, setShowCharts] = useState(true);
  let [showP3, setShowP3] = useState(true);
  let [showRec2020, setShowRec2020] = useState(false);
  let [supportValue, setSupportValue] = useState<SupportValue>({ p3: false, rec2020: false });
  const paintCallbacks = useRef<Map<string, LchCallbacks>>(new Map());


  const setValue = useCallback((nextOrUpdater: LchValue | ((prev: LchValue) => LchValue)) => {
    setStateValue(prev => {
      // 1. Resolve the next state
      const next =
        typeof nextOrUpdater === 'function'
          ? (nextOrUpdater as (v: LchValue) => LchValue)(prev)
          : nextOrUpdater;

      // Store the rounded value:
      next.a = round4(next.a);
      next.c = round6(next.c);
      next.h = round4(next.h);
      next.l = round6(next.l);

      if (next === prev) {
        console.log("setValue: skipping running of listeners");
        return next;
      }

      console.log("setValue", next);
      runListeners(paintCallbacks.current, prev, next);
      const a = next.a;
      const c = next.c;
      const h = next.h;
      const l = next.l;
      let hash = `#${l},${c},${h},${a}`
      if (location.hash !== hash) {
        history.pushState(null, '', `#${l},${c},${h},${a}`)
      }

      return next;
    });
  }, [paintCallbacks]);

  const setComponents = useCallback(
    (parts: Partial<LchValue>) =>
      setValue(prev => ({
        ...prev,
        ...preciseRoundValue(parts)
      })),
    []
  );

  useEffect(() => {
    setColorCodeInput(defaultColorCode);
  }, []);


  const setColorCodeInput = useCallback((code: string) => {
    let parsed = parseAnything(code);
    if (!parsed) {
      return;
    }
    if (outputFormat === 'figmaP3' && isRgbInput(colorCodeInput)) {
      parsed = forceP3(parsed)
    }
    if (parsed.mode === COLOR_FN) {
      setValue(colorToValue(parsed as AnyLch));
      return;
    }
    if (
      parsed.mode === 'rgb' &&
      parsed.r === 1 &&
      parsed.g === 1 &&
      parsed.b === 1
    ) {
      setValue({ a: (parsed.alpha ?? 1) * 100, c: 0, h: 0, l: 1 })
      return;
    }
    let originSpace = getSpace(parsed)

    function isPreciseEnough(value: LchValue): boolean {
      let color = valueToColor(value)
      if (originSpace !== getSpace(color)) {
        return false
      } else if (formatHex8(color) !== formatHex8(parsed)) {
        return false
      } else {
        return true
      }
    }

    let accurate = oklch(parsed)
    if (originSpace === Space.sRGB && getSpace(accurate) !== Space.sRGB) {
      let rgbAccurate = toRgb(accurate)
      accurate = oklch(rgbAccurate)
    }
    let aggressive = aggressiveRoundValue(colorToValue(accurate))

    if (isPreciseEnough(aggressive)) {
      setValue(aggressive);
      return;
    }

    let precise = preciseRoundValue(colorToValue(accurate))
    if (isPreciseEnough(precise)) {
      setValue(precise);
      return;
    }

    setValue(colorToValue(accurate));

  }, [colorCodeInput, outputFormat, value, paintCallbacks]);

  const callbackSetSupportValue = useCallback(() => {
    let mediaP3 = window.matchMedia('(color-gamut:p3)');
    let media2020 = window.matchMedia('(color-gamut:rec2020)');
    setSupportValue({ p3: mediaP3.matches, rec2020: media2020.matches })
  }, []);

  useEffect(() => {
    if (CSS.supports('color', 'color(display-p3 1 1 1)')) {
      callbackSetSupportValue();
      let mediaP3 = window.matchMedia('(color-gamut:p3)');
      let media2020 = window.matchMedia('(color-gamut:rec2020)');
      mediaP3.addEventListener('change', callbackSetSupportValue);
      media2020.addEventListener('change', callbackSetSupportValue);
      return () => {
        mediaP3.removeEventListener('change', callbackSetSupportValue);
        media2020.removeEventListener('change', callbackSetSupportValue);
      }
    }
  }, []);

  const addPaintCallbacks = (name: string, callbacks: LchCallbacks) => paintCallbacks.current.set(name, callbacks);

  useEffect(() => {
    console.log("paintCallbacks", paintCallbacks);
  }, [paintCallbacks]);

  const val = {
    colorCodeInput,
    setColorCodeInput,
    value,
    setValue,
    setComponents,
    outputFormat,
    setOutputFormat,
    showCharts,
    setShowCharts,
    supportValue,
    showP3,
    setShowP3,
    showRec2020,
    setShowRec2020,

    addPaintCallbacks,
  };



  useEffect(() => {
    // For debugging.
    window.OklchContext = val;
  }, [val]);

  return (
    <OklchContext value={val}>
      {children}
    </OklchContext>
  );
}



function round2(value: number): number {
  return parseFloat(value.toFixed(2))
}

function round4(value: number): number {
  return parseFloat(value.toFixed(4))
}

function round6(value: number): number {
  return parseFloat(value.toFixed(6))
}

function aggressiveRoundValue<V extends Partial<LchValue>>(
  value: V,
): V {
  let rounded = { ...value }
  if (typeof rounded.l !== 'undefined') {
    rounded.l = round4(rounded.l)
  }
  if (typeof rounded.c !== 'undefined') {
    rounded.c = round4(rounded.c)
  }
  if (typeof rounded.h !== 'undefined') {
    rounded.h = round2(rounded.h)
  }
  if (typeof rounded.a !== 'undefined') {
    rounded.a = round2(rounded.a)
  }
  return rounded
}

function preciseRoundValue<V extends Partial<LchValue>>(
  value: V,
): V {
  let rounded = { ...value }
  if (typeof rounded.l !== 'undefined') {
    rounded.l = round6(rounded.l)
  }
  if (typeof rounded.c !== 'undefined') {
    rounded.c = round6(rounded.c)
  }
  if (typeof rounded.h !== 'undefined') {
    rounded.h = round4(rounded.h)
  }
  if (typeof rounded.a !== 'undefined') {
    rounded.a = round4(rounded.a)
  }
  return rounded
}
function isRgbInput(colorCodeInput: string): boolean {
  let parsed = parseAnything(colorCodeInput)
  return parsed?.mode === 'rgb'
}

export function valueToColor(value: LchValue): AnyLch {
  return build(value.l * L_MAX_COLOR, value.c, value.h, value.a / 100)
}

export function colorToValue(color: AnyLch): LchValue {
  return {
    a: (color.alpha ?? 1) * 100,
    c: color.c,
    h: color.h ?? 0,
    l: color.l / L_MAX_COLOR,
  }
}

type PrevCurrentValue = { [key in keyof LchValue]?: number } | LchValue;

interface ComponentCallback {
  (value: number, chartsToChange: number): void;
}

interface LchCallback {
  (value: LchValue): void;
}

interface LchCallbacks {
  alpha?: ComponentCallback;
  c?: ComponentCallback;
  ch?: LchCallback;
  h?: ComponentCallback;
  l?: ComponentCallback;
  lc?: LchCallback;
  lch?: LchCallback;
  lh?: LchCallback;
}

function runListeners(map: Map<string, LchCallbacks>, prev: PrevCurrentValue, next: LchValue): void {
  let chartsToChange = 0
  let lChanged = prev.l !== next.l
  let cChanged = prev.c !== next.c
  let hChanged = prev.h !== next.h

  if (lChanged && cChanged && hChanged) {
    chartsToChange = 3
  } else if (
    (lChanged && cChanged) ||
    (cChanged && hChanged) ||
    (hChanged && lChanged)
  ) {
    chartsToChange = 2
  } else {
    chartsToChange = 1
  }

  console.log("runListeners", map, prev, next, chartsToChange);

  for (let [_name, callbacks] of map.entries()) {
    console.log("runListeners", callbacks);
    if (callbacks.l && lChanged) {
      console.log("l", next.l, chartsToChange);
      callbacks.l(next.l, chartsToChange)
    }
    if (callbacks.c && cChanged) {
      console.log("c", next.c, chartsToChange);
      callbacks.c(next.c, chartsToChange)
    }
    if (callbacks.h && hChanged) {
      console.log("h", next.h, chartsToChange);
      callbacks.h(next.h, chartsToChange)
    }
    if (callbacks.alpha && prev.a !== next.a) {
      console.log("alpha", next.a, chartsToChange);
      callbacks.alpha(next.a, 0)
    }

    if (callbacks.lc && (lChanged || cChanged)) {
      callbacks.lc(next)
    }
    if (callbacks.ch && (cChanged || hChanged)) {
      callbacks.ch(next)
    }
    if (callbacks.lh && (lChanged || hChanged)) {
      callbacks.lh(next)
    }
    if (callbacks.lch && (lChanged || cChanged || hChanged)) {
      callbacks.lch(next)
    }
  }
}
