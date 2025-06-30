"use client";
import { useCallback, useEffect, useRef } from "react";
import OklchPicker from "./oklchPicker";
import { RenderContextProvider } from "./oklchPicker/context/renderContext";

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
        <OklchPicker />
      </RenderContextProvider>
    </>
  );

}
