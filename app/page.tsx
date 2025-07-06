"use client";
import { useCallback, useEffect, useRef } from "react";
import OklchPicker from "./oklchPicker";
import { RenderContextProvider } from "./oklchPicker/context/renderContext";
import { ColorChoice } from './ColorChoice';
import { ColorCode } from "./ColorCode";

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
      <RenderContextProvider>
      <OklchPicker defaultColorCode="oklch(0.673 0.18 163)" />
      <OklchPicker defaultColorCode="oklch(0.533 0.10 233)" />
      <OklchPicker defaultColorCode="oklch(0.533 0.10 233)" />
        <OklchPicker />
      </RenderContextProvider>

      <ColorChoice
        color="oklch(0.7 0.15 30)"
        variableName="--primary-color"
        onEdit={() => console.log('Edit clicked!')}
      />

      <ColorCode />
    </>
  );

}
