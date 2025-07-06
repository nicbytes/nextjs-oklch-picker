"use client";
import { useState } from "react";
import OklchPicker from "./oklchPicker";
import { ColorPickerRenderContextProvider } from "./oklchPicker/context/ColorPickerRenderContext";

export default function Home() {
  const defaultColors = [
    "oklch(30.63% 0.025 25.7deg)",
    "oklch(26.05% 0.104 253.6deg)",
    "oklch(58.66% 0.156 261.0deg)",
    "oklch(56.17% 0.074 167.4deg)",
    "oklch(25.50% 0.091 39.4deg)",
    "oklch(78.24% 0.045 339.5deg)",
    "oklch(95.26% 0.04 343.9deg)",
    "oklch(46.27% 0.301 270.5deg)",
    "oklch(85.29% 0.118 355.6deg)",
    "oklch(18.30% 0.389 40.1deg)",
    "oklch(62.97% 0.056 35.6deg)",
  ];

  const [pickers, setPickers] = useState([
    <OklchPicker key={0} defaultColorCode={defaultColors[0]} />,
  ]);

  const addPicker = () => {
    setPickers(prevPickers => {
      if (prevPickers.length >= defaultColors.length) {
        return prevPickers;
      }
      const nextColor = defaultColors[prevPickers.length];
      return [
        ...prevPickers,
        <OklchPicker key={prevPickers.length} defaultColorCode={nextColor} />,
      ];
    });
  };

  const removePicker = () => {
    if (pickers.length > 1) {
      setPickers(prevPickers => prevPickers.slice(0, -1));
    }
  };

  return (
    <>
      <ColorPickerRenderContextProvider>{pickers}</ColorPickerRenderContextProvider>
      <div className="fixed bottom-5 right-5 flex gap-2">
        <button
          onClick={addPicker}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={pickers.length >= defaultColors.length}
        >
          +
        </button>
        <button
          onClick={removePicker}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={pickers.length <= 1}
        >
          -
        </button>
      </div>
    </>
  );
}
