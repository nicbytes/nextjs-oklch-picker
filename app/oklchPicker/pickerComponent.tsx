"use client";

import { useRef, useEffect } from "react";
import { useOklchContext } from "./context/OklchContext";
import { initCanvasSize } from "./canvas";
import { useRenderContext } from "./context/renderContext";
import { C_MAX, C_MAX_REC2020, H_MAX, L_MAX } from "@/lib/config";
import Range from "./components/Range";
import { getVisibleValue } from "@/lib/colors";
import { LchValue } from "./type";
import { Martian_Mono } from "next/font/google";
import { NumericInput } from "./components/NumericInput";
import Card from "./components/Card";
import Chart, { getMaxC } from "./components/Chart";
import ColorSample from "./components/ColorSample";






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








function ComponentValue() {

}




export default function OklchPickerComponent() {
  const { value, setComponents } = useOklchContext();
  return (
    <>
      <div className="items-center flex flex-col">
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
      </div>
    </>
  );
}


