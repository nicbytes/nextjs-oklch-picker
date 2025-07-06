"use client";
import { useCallback, useEffect, useRef } from "react";
import OklchPicker from "./oklchPicker";
import { ColorPickerRenderContextProvider } from "./oklchPicker/context/ColorPickerRenderContext";

export default function Home() {

  const workerRef = useRef<Worker>(null);


  useEffect(() => {
    // workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));
    // workerRef.current.onmessage = (event: MessageEvent<number>) =>
    //   alert(`WebWorker Response => ${event.data}`);

    // return () => {
    //   workerRef.current?.terminate();
    // };
  }, []);

  const handleWork = useCallback(async () => {
    workerRef.current?.postMessage(100000);
  }, []);


  return (
    <>
      <button onClick={handleWork}>Work</button>
      <ColorPickerRenderContextProvider>
      <OklchPicker defaultColorCode="oklch(0.673 0.18 163)" />
      <OklchPicker defaultColorCode="oklch(0.533 0.10 233)" />
      <OklchPicker defaultColorCode="oklch(0.533 0.10 233)" />
        <OklchPicker />
      </ColorPickerRenderContextProvider>
    </>
  );

}
