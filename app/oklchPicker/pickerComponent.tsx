"use client";

import { useOklchContext } from "./context/OklchContext";
import { H_MAX, L_MAX } from "@/app/oklchPicker/config";
import Range from "./components/Range";
import { Martian_Mono } from "next/font/google";
import { NumericInput } from "./components/NumericInput";
import Card from "./components/Card";
import Chart, { getMaxC } from "./components/Chart";
import ColorSample from "./components/ColorSample";
import rangeStyles from "./components/Range.module.css";
import { useEffect, useRef } from "react";
import AlphaRange from "./components/AlphaRange";
import Model from "./components/Model";
import ToggleSwitch from "./components/ToggleSwitch";
import ColorCodeOklchInput from "./components/ColorCodeOklchInput";
import ColorCodeFormattedInput from "./components/ColorCodeFormattedInput";


const font = Martian_Mono({
  subsets: ['latin'],
  weight: ['200', '400', '700'],
});


function round2(value: number): number {
  return parseFloat(value.toFixed(2))
}

function round3(value: number): number {
  return parseFloat(value.toFixed(3))
}

export default function OklchPickerComponent() {
  const { value, setComponents, addPaintCallbacks, colorCodeInput, setColorCodeInput, showP3, showRec2020, setShowP3, setShowRec2020 } = useOklchContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addPaintCallbacks('range-color-setter', {
      lch: (value) => {
        containerRef.current!.style.setProperty('--range-color', `oklch(${value.l} ${value.c} ${value.h} / ${value.a})`);
      }
    });
  }, [addPaintCallbacks]);

  return (
    <>
      <div ref={containerRef} className={`items-center flex flex-col max-h-[800px] flex-wrap content-center ${rangeStyles.rangeColorSetter}`}>
        <Card>
          <div className="mb-6"></div>
          <div className="px-8">
            <div className="w-[340px] flex flex-col gap-4">
              <ColorSample />
              <ColorCodeOklchInput id="color-code-input" value={colorCodeInput} label="Color Code" onCommit={setColorCodeInput} />
              <ColorCodeFormattedInput id="alt-color-code-input" value={colorCodeInput} label="Color Code" onCommit={() => { }} />
              <ToggleSwitch label="Show P3" checked={showP3} onChange={setShowP3} />
              <ToggleSwitch label="Show Rec2020" checked={showRec2020} onChange={setShowRec2020} />
            </div>
          </div>
          <div className="mb-6"></div>
        </Card>
        <Card>
          <div className="mx-8 flex flex-col gap-4 my-6">
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
        <Card>
          <div className="mb-6"></div>
          <div className="w-full max-w-[340px] flex justify-between items-center">
            <span className={`text-xl font-mono ${font.className}`}>Lightness</span>
            <NumericInput
              value={String(round3(value.l))}
              pattern={/^\d*\.?\d*$/}
              spin
              onSpin={(action, slow) => {
                const step = slow ? 0.001 : 0.05;
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
          <div className="mb-6"></div>
        </Card>
        <Card>
          <Model className="w-[404px] h-[344px]" />
          <div className="absolute top-8 left-8">
            <span className={`text-xl font-mono pointer-events-none ${font.className}`}>3D</span>
          </div>
        </Card>
        <Card>
          <div className="mb-6"></div>
          <div className="w-full max-w-[340px] flex justify-between items-center">
            <span className={`text-xl font-mono ${font.className}`}>Chroma</span>
            <NumericInput
              value={String(round3(value.c))}
              pattern={/^\d*\.?\d*$/}
              spin
              onSpin={(action, slow) => {
                const step = slow ? 0.001 : 0.01;
                const current = Number(value.c) || 0;
                const next =
                  action === 'increase'
                    ? Math.min(current + step, getMaxC(showRec2020))
                    : Math.max(current - step, 0);
                setComponents({ c: next });
              }}
              onChange={(val) => setComponents({ c: parseFloat(val) })}
            />
          </div>
          <Chart componentType="l" />
          <Range componentType="c" />
          <div className="mb-6"></div>
        </Card>
        <Card>
          <div className="mb-6"></div>
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
          <div className="mb-6"></div>
        </Card>
      </div>
    </>
  );
}
