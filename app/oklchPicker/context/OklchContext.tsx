import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  type AnyLch,
  colorToValue,
  getSpace,
  oklch,
  parseAnything,
  Space,
  toRgb,
  valueToColor
} from '../colors'
import { formatHex8 } from 'culori/fn'
import { COLOR_FN } from "../config";
import { LchValue, OutputFormats, SupportValue } from "../type";
import { useRenderContext } from "./ColorPickerRenderContext";

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
  pickerId: string;

  addPaintCallbacks: (name: string, callbacks: LchCallbacks) => void;

  paint: (value: LchValue) => void;
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

  const pickerId = useMemo(() => {
    return Math.random().toString(36).slice(2, 9);
  }, []);

  const processedDefaultValue = useMemo(() => {
    const colorValue = codeToLchValue(defaultColorCode);
    if (!colorValue) {
      throw new Error("Must only use valid color values as default value.");
    }
    return colorValue;
  }, [defaultColorCode]);

  // TODO: Align the initial value with the default color.
  const [value, setStateValue] = useState<LchValue>(processedDefaultValue);
  const [colorCodeInput, setStateColorCodeInput] = useState(defaultColorCode);
  const [outputFormat, setOutputFormat] = useState<OutputFormats>('lch');
  const [showCharts, setShowCharts] = useState(true);
  const [showP3, setShowP3] = useState(true);
  const [showRec2020, setShowRec2020] = useState(false);
  const [supportValue, setSupportValue] = useState<SupportValue>({ p3: false, rec2020: false });
  const paintCallbacks = useRef<Map<string, LchCallbacks>>(new Map());
  const lastValue = useRef<LchValue>(value);
  const { onWorkersReady } = useRenderContext();


  const setValue = useCallback((nextOrUpdater: LchValue | ((prev: LchValue) => LchValue)) => {
    const prev = lastValue.current;
    // 1. Resolve the next state
    const next =
      typeof nextOrUpdater === 'function'
        ? (nextOrUpdater as (v: LchValue) => LchValue)(prev)
        : nextOrUpdater;

    // "Deep bounce" by checking if the change is significant enough
    const prevRounded = aggressiveRoundValue(prev);
    const nextRounded = aggressiveRoundValue(next);

    if (
      prevRounded.l === nextRounded.l &&
      prevRounded.c === nextRounded.c &&
      prevRounded.h === nextRounded.h &&
      prevRounded.a === nextRounded.a
    ) {
      return; // Not a significant enough change, skip update.
    }

    // Store the rounded value:
    const finalNext = { ...next };
    finalNext.a = round4(finalNext.a);
    finalNext.c = round6(finalNext.c);
    finalNext.h = round4(finalNext.h);
    finalNext.l = round6(finalNext.l);

    if (finalNext.l !== prev.l || finalNext.c !== prev.c || finalNext.h !== prev.h || finalNext.a !== prev.a) {

      runListeners(paintCallbacks.current, prev, finalNext);
      lastValue.current = finalNext;

    }
    setStateValue(finalNext);
  }, [paintCallbacks]);

  // Set a single component.
  const setComponents = useCallback(
    (parts: Partial<LchValue>) => {

      setValue(prev => ({
        ...prev,
        ...preciseRoundValue(parts)
      }));
    },
    [setValue]
  );

  // Force run all listeners.
  const paint = useCallback((value: LchValue, selectedName?: string, selectedCallback?: 'l' | 'c' | 'h' | 'alpha' | 'lc' | 'ch' | 'lh' | 'lch') => {
    if (selectedName === undefined && selectedCallback === undefined) {
      // Run all listenters
      for (const callbacks of paintCallbacks.current.values()) {
        if (callbacks.l) {
          callbacks.l(value.l, 3)
        }
        if (callbacks.c) {
          callbacks.c(value.c, 3)
        }
        if (callbacks.h) {
          callbacks.h(value.h, 3)
        }
        if (callbacks.alpha) {
          callbacks.alpha(value.a, 0)
        }

        if (callbacks.lc) {
          callbacks.lc(value)
        }
        if (callbacks.ch) {
          callbacks.ch(value)
        }
        if (callbacks.lh) {
          callbacks.lh(value)
        }
        if (callbacks.lch) {
          callbacks.lch(value)
        }
      }
      return;
    }

    // make sure both are defined
    if (selectedName === undefined || selectedCallback === undefined) {
      console.error("paint: selectedName and selectedCallback must be defined when either are used");
      return;
    }

    const callbackSet = paintCallbacks.current.get(selectedName);
    if (!callbackSet) {
      console.error(`paint: selectedName must be a valid name, got ${selectedName}, available names: ${paintCallbacks.current.keys()}`);
      return;
    }
    switch (selectedCallback) {
      case 'l': {
        if (callbackSet.l) {
          callbackSet.l(value.l, 3)
        }
      } break;
      case 'c': {
        if (callbackSet.c) {
          callbackSet.c(value.c, 3)
        }
      } break;
      case 'h': {
        if (callbackSet.h) {
          callbackSet.h(value.h, 3)
        }
      } break;
      case 'alpha': {
        if (callbackSet.alpha) {
          callbackSet.alpha(value.a, 0)
        }
      } break;
      case 'lc': {
        if (callbackSet.lc) {
          callbackSet.lc(value)
        }
      } break;
      case 'ch': {
        if (callbackSet.ch) {
          callbackSet.ch(value)
        }
      } break;
      case 'lh': {
        if (callbackSet.lh) {
          callbackSet.lh(value)
        }
      } break;
      case 'lch': {
        if (callbackSet.lch) {
          callbackSet.lch(value)
        }
      } break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintCallbacks.current?.keys()]);

  // useEffect(() => {
  //   setColorCodeInput(defaultColorCode);
  // }, []);

  // // Repaint when showP3 or showRec2020 changes
  // useEffect(() => {
  //   paint();
  // }, [showP3, showRec2020]);

  const initialDraw = useRef(false);
  useEffect(() => {
    if (!paintCallbacks.current) {
      return;
    }
    if (initialDraw.current) {
      return;
    }


    if (mapHasAllKeys(paintCallbacks.current, ['chart-for-l', 'chart-for-c', 'chart-for-h'])) {
      initialDraw.current = true;
      onWorkersReady(() => {
        // paintCallbacks.current.get('chart-for-h')!.h!(value.h, 1); // Draw Lightness chart
        // paintCallbacks.current.get('chart-for-l')!.l!(value.l, 1); // Draw Chroma chart
        // paintCallbacks.current.get('chart-for-c')!.c!(value.c, 1); // Draw Hue chart
        paint(value);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintCallbacks.current?.size, value, onWorkersReady]);

  const setColorCodeInput = useCallback(
    (code: string) => {
      const maybeValue = codeToLchValue(code);
      if (maybeValue) {
        setValue(maybeValue);
        setStateColorCodeInput(code);
      }
    },
    [setValue]
  );

  const callbackSetSupportValue = useCallback(() => {
    const mediaP3 = window.matchMedia('(color-gamut:p3)');
    const media2020 = window.matchMedia('(color-gamut:rec2020)');
    setSupportValue({ p3: mediaP3.matches, rec2020: media2020.matches })
  }, []);

  useEffect(() => {
    if (CSS.supports('color', 'color(display-p3 1 1 1)')) {
      callbackSetSupportValue();
      const mediaP3 = window.matchMedia('(color-gamut:p3)');
      const media2020 = window.matchMedia('(color-gamut:rec2020)');
      mediaP3.addEventListener('change', callbackSetSupportValue);
      media2020.addEventListener('change', callbackSetSupportValue);
      return () => {
        mediaP3.removeEventListener('change', callbackSetSupportValue);
        media2020.removeEventListener('change', callbackSetSupportValue);
      }
    }
  }, [callbackSetSupportValue]);

  const addPaintCallbacks = (name: string, callbacks: LchCallbacks) => paintCallbacks.current.set(name, callbacks);

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
    pickerId,

    addPaintCallbacks,
    paint,
  };


  return (
    <OklchContext value={val}>
      {children}
    </OklchContext>
  );
}

/**
 * Returns true only if *every* key is present in the map.
 * Works with Map<string, T> or any Map<K, V>.
 */
function mapHasAllKeys<K, V>(
  map: Map<K, V>,
  keys: Iterable<K>,
): boolean {
  for (const key of keys) {
    if (!map.has(key)) return false;
  }
  return true;
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
  const rounded = { ...value }
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
  const rounded = { ...value }
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

/**
 * Convert any CSS color string into an `LchValue`.
 *
 * The conversion applies several heuristics to preserve the perceived color
 * in various edge-cases (e.g. `rgb(1 1 1)` rounds to pure white, sRGB ⇄ P3
 * handling, aggressive / precise rounding, etc.).
 *
 * Returns `undefined` when the string cannot be parsed as a valid color.
 */
export function codeToLchValue(
  code: string,
): LchValue | undefined {
  const parsed = parseAnything(code);
  if (!parsed) {
    return undefined;
  }

  // Already in OKLCH / LCH form – just translate it.
  if (parsed.mode === COLOR_FN) {
    return colorToValue(parsed as AnyLch);
  }

  // Special-case: `rgb(1 1 1)` is easier to express as Lch white.
  if (
    parsed.mode === 'rgb' &&
    parsed.r === 1 &&
    parsed.g === 1 &&
    parsed.b === 1
  ) {
    return { a: (parsed.alpha ?? 1) * 100, c: 0, h: 0, l: 1 };
  }

  const originSpace = getSpace(parsed);

  const isPreciseEnough = (value: LchValue): boolean => {
    const color = valueToColor(value);
    if (originSpace !== getSpace(color)) {
      return false;
    }
    return formatHex8(color) === formatHex8(parsed);
  };

  // Convert to OKLCH to make comparison / rounding easier.
  let accurate = oklch(parsed);
  if (originSpace === Space.sRGB && getSpace(accurate) !== Space.sRGB) {
    accurate = oklch(toRgb(accurate));
  }

  const aggressive = aggressiveRoundValue(colorToValue(accurate));
  if (isPreciseEnough(aggressive)) {
    return aggressive;
  }

  const precise = preciseRoundValue(colorToValue(accurate));
  if (isPreciseEnough(precise)) {
    return precise;
  }

  return colorToValue(accurate);
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
  const lChanged = prev.l !== next.l
  const cChanged = prev.c !== next.c
  const hChanged = prev.h !== next.h
  const aChanged = prev.a !== next.a

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


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_name, callbacks] of map.entries()) {
    if (callbacks.l && lChanged) {
      callbacks.l(next.l, chartsToChange)
    }
    if (callbacks.c && cChanged) {
      callbacks.c(next.c, chartsToChange)
    }
    if (callbacks.h && hChanged) {
      callbacks.h(next.h, chartsToChange)
    }
    if (callbacks.alpha && aChanged) {
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
    if (callbacks.lch && (lChanged || cChanged || hChanged || aChanged)) {
      callbacks.lch(next)
    }
  }
}
