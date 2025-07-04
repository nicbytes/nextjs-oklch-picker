"use client";

import { useOklchContext } from "./context/OklchContext";
import { H_MAX, L_MAX } from "@/lib/config";
import Range from "./components/Range";
import { Martian_Mono } from "next/font/google";
import { NumericInput } from "./components/NumericInput";
import Card from "./components/Card";
import Chart, { getMaxC } from "./components/Chart";
import ColorSample from "./components/ColorSample";
import rangeStyles from "./components/Range.module.css";
import { useEffect, useRef } from "react";
import AlphaRange from "./components/AlphaRange";


const font = Martian_Mono({
  subsets: ['latin'],
  weight: ['200', '400', '700'],
});


function round2(value: number): number {
  return parseFloat(value.toFixed(2))
}

function round4(value: number): number {
  return parseFloat(value.toFixed(4))
}


export default function OklchPickerComponent() {
  const { value, setComponents, addPaintCallbacks } = useOklchContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addPaintCallbacks('range-color-setter', {
      lch: (value) => {
        console.log({value})
        containerRef.current!.style.setProperty('--range-color', `oklch(${value.l} ${value.c} ${value.h} / ${value.a})`);
      }
    });
  }, [addPaintCallbacks]);
    
  return (
    <>
      <div ref={containerRef} className={`items-center flex flex-col ${rangeStyles.rangeColorSetter}`}>
        <div className="w-full max-w-[340px]">
          <ColorSample />
        </div>
        <Card>
          <div className="w-full max-w-[340px] flex justify-between items-center">
            <span className={`text-xl font-mono ${font.className}`}>Lightness</span>
            <NumericInput
              value={String(round4(value.l))}
              pattern={/^\d*\.?\d*$/}
              spin
              onSpin={(action, slow) => {
                const step = slow ? 0.01 : 0.1;
                const current = Number(value.l) || 0;
                const next =
                  action === 'increase'
                    ? Math.min(current + step, L_MAX)
                    : Math.max(current - step, 0);
                setComponents({ l: next });
              }}
              onChange={(val) => setComponents({ l: parseFloat(val) })}
            />
          </div>
          <Chart componentType="h" />
          <Range componentType="l" />
        </Card>
        <Card>
          <div className="w-full max-w-[340px] flex justify-between items-center">
            <span className={`text-xl font-mono ${font.className}`}>Chroma</span>
            <NumericInput
              value={String(round4(value.c))}
              pattern={/^\d*\.?\d*$/}
              spin
              onSpin={(action, slow) => {
                const step = slow ? 0.001 : 0.01;
                const current = Number(value.c) || 0;
                const next =
                  action === 'increase'
                    ? Math.min(current + step, getMaxC())
                    : Math.max(current - step, 0);
                setComponents({ c: next });
              }}
              onChange={(val) => setComponents({ c: parseFloat(val) })}
            />
          </div>
          <Chart componentType="l" />
          <Range componentType="c" />
        </Card>
        <Card>
          <div className="w-full max-w-[340px] flex justify-between items-center">
            <span className={`text-xl font-mono ${font.className}`}>Hue</span>
            <NumericInput
              value={String(round2(value.h))}
              pattern={/^\d*\.?\d*$/}
              spin
              onSpin={(action, slow) => {
                const step = slow ? 1 : 10;
                const current = value.h;
                // Smooth wrap around hue.
                const constrain = (v: number) => {
                  if (v === H_MAX) return v;
                  if (v < 0) {
                    const neg = v % H_MAX;
                    return H_MAX + neg;
                  }
                  return v % H_MAX;
                };
                const next =
                  action === 'increase'
                    ? constrain(current + step)
                    : constrain(current - step);
                setComponents({ h: next });
              }}
              onChange={(val) => setComponents({ h: parseFloat(val) })}
            />
          </div>
          <Chart componentType="c" />
          <Range componentType="h" />
        </Card>
        <Card>
          <div className="mx-8 flex flex-col gap-4">
            <div className="w-full max-w-[340px] flex justify-between items-center">
              <span className={`text-xl font-mono ${font.className}`}>Alpha</span>
              <NumericInput
                value={String(round2(value.a))}
                pattern={/^[0-9]*\.?[0-9]*$/}
                spin
                onSpin={(action, slow) => {
                  const step = slow ? 0.01 : 0.1;
                  const current = Number(value.a) || 0;
                  const next =
                    action === 'increase'
                      ? Math.min(current + step, 1)
                      : Math.max(current - step, 0);
                  setComponents({ a: next });
                }}
                onChange={(val) => setComponents({ a: parseFloat(val) })}
              />
            </div>
          <AlphaRange />
          </div>
        </Card>
      </div>
    </>
  );
}


