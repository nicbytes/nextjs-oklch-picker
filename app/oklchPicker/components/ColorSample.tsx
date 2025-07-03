"use client";

import { useOklchContext } from "../context/OklchContext";
import { getVisibleValue } from "@/lib/colors";
import { Martian_Mono } from "next/font/google";

const font = Martian_Mono({
  subsets: ['latin'],
  weight: ['200', '400', '700'],
});

export default function Sample() {
    const { value, showP3, showRec2020, supportValue } = useOklchContext();
  
    const visible = getVisibleValue(value, showP3, showRec2020);
    const { real, fallback, space } = visible;
  
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
  
    return (
      <div className="flex gap-4">
        <div className="relative w-full h-24 outline -outline-offset-1 outline-black/10 dark:outline-white/10 rounded text-center flex flex-col justify-center items-center" style={{ backgroundColor: real ? real : "" }}>
          <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] ${font.className}`}>{unavailableMessage}</span>
          {((space === "p3" && supportValue.p3) || (space === "rec2020" && supportValue.rec2020)) &&
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-white/80 font-light bg-zinc-600/60 p-1 rounded-lg pr-2 pl-2 mb-1 ${font.className}`}>{space.toLocaleUpperCase()}</div>
          }
        </div>
        {space !== "srgb" &&
          <div className="relative w-full h-24 outline -outline-offset-1 outline-black/10 dark:outline-white/10 rounded" style={{ backgroundColor: fallback }}>
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-white/80 font-light bg-zinc-600/60 p-1 rounded-lg pr-2 pl-2 mb-1 ${font.className}`}>Fallback</div>
          </div>
        }
      </div>
    );
  }