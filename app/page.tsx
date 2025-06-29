"use client";
import { useCallback, useEffect, useRef } from "react";
import { initCharts } from "./chart";

export default function Home() {

  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    // workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));
    // workerRef.current.onmessage = (event: MessageEvent<number>) =>
    //   alert(`WebWorker Response => ${event.data}`);

    // return () => {
    //   workerRef.current?.terminate();
    // };
    initCharts();
  }, []);

  const handleWork = useCallback(async () => {
    workerRef.current?.postMessage(100000);
  }, []);


  return (
    <>
      <button onClick={handleWork}>Work</button>
      <div className="chart is-l" aria-hidden="true">
        <canvas className="chart_canvas" width="680" height="300"></canvas>
      </div>
      <div className="chart is-c" aria-hidden="true">
        <canvas className="chart_canvas" width="680" height="300"></canvas>
      </div>
      <div className="chart is-h" aria-hidden="true">
        <canvas className="chart_canvas" width="680" height="300"></canvas>
      </div>
    </>
  );


  // const bodyStyles = {
  //   '--accent': 'oklch(0.57 0.18 154.06)',
  //   '--surface-ui-accent': 'oklch(0.7 0.17 154.06 / 20%)',
  //   '--range-color': 'rgb(165.35, 186.76, 171.23)',
  //   '--chart-l': '77.05%',
  //   '--chart-c': '8.675675675675674%',
  //   '--chart-h': '42.794444444444444%',
  // };

  // return (
  //   <>
  //   <div style={bodyStyles}>
  //     <div className="layout" aria-hidden="false">
  //       <div className="layout_title">
  //         <h1 className="title">OKLCH Color Picker & Converter</h1>
  //       </div>
  //       <main className="main layout_main" id="main-panel">
  //         <button
  //           className="main_expand"
  //           aria-label="Toggle panel"
  //           type="button"
  //           aria-expanded="true"
  //           aria-controls="main-panel"
  //         ></button>
  //         <div className="main_row main_row--sample">
  //           <div
  //             className="sample is-supported is-srgb"
  //             style={{
  //               '--sample-real': 'rgb(165.35, 186.76, 171.23)',
  //               '--sample-fallback': 'rgb(165.35, 186.76, 171.23)',
  //             }}
  //           >
  //             <div className="sample_reader" aria-live="polite">
  //               srgb space
  //             </div>
  //             <div className="sample_normal"></div>
  //             <div className="sample_compare" aria-hidden="false">
  //               <div className="sample_unavailable"></div>
  //               <div className="sample_real">
  //                 <div className="sample_note">P3</div>
  //               </div>
  //               <div className="sample_fallback">
  //                 <button className="sample_note" title="Go fallback color">
  //                   fallback
  //                 </button>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //         <div className="main_row">
  //           <div className="code is-lch">
  //             <div className="field">
  //               <kbd className="field_hotkey" aria-hidden="true">o</kbd>
  //               <input
  //                 className="field_input"
  //                 aria-label="OKLCH CSS code"
  //                 aria-keyshortcuts="o"
  //                 type="text"
  //               />
  //             </div>
  //           </div>
  //           <div className="code is-rgb">
  //             <div className="field is-options">
  //               <kbd className="field_hotkey" aria-hidden="true">r</kbd>
  //               <input
  //                 className="field_input"
  //                 aria-label="oklab CSS code"
  //                 aria-keyshortcuts="r"
  //                 type="text"
  //                 options='{"hex/rgba":"Auto hex/rgba","hex":"","rgb":"","hsl":"","p3":"","lch":"","lab":"","oklab":"","lrgb":"","numbers":"","figmaP3":""}'
  //                 optionslabel="Change format"
  //               />
  //               <div className="field_options">
  //                 <select className="field_select" aria-label="Change format">
  //                   <option value="hex/rgba">Auto hex/rgba</option>
  //                   <option value="hex">#a5bbab</option>
  //                   <option value="rgb">rgb(165, 187, 171)</option>
  //                   <option value="hsl">hsl(136.46 14.000000000000002% 69%)</option>
  //                   <option value="p3">color(display-p3 0.6644 0.7298 0.6757)</option>
  //                   <option value="lch">lch(73.81 11.2 151.84)</option>
  //                   <option value="lab">lab(73.81 -9.88 5.29)</option>
  //                   <option value="oklab">oklab(0.77 -0.03 0.01)</option>
  //                   <option value="lrgb">Linear RGB vec(0.37805, 0.4955, 0.40844, 1)</option>
  //                   <option value="numbers">0.77, 0.03, 154.06</option>
  //                   <option value="figmaP3">Figma P3 #a9baacff</option>
  //                 </select>
  //                 <div className="field_button">
  //                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
  //                     <path
  //                       fill="currentColor"
  //                       fillRule="evenodd"
  //                       d="M8 11.56 3.47 7.03a.75.75 0 0 1 1.06-1.061L8 9.439l3.47-3.47a.75.75 0 1 1 1.06 1.06L8 11.56Z"
  //                       clipRule="evenodd"
  //                     ></path>
  //                   </svg>
  //                 </div>
  //               </div>
  //             </div>
  //             <div className="code_note is-paste" aria-hidden="false">
  //               Paste HEX/RGB/HSL to convert to OKLCH
  //             </div>
  //             <div className="code_note is-fallback is-hidden" aria-hidden="true">
  //               Closest fallback (by chroma) in sRGB
  //             </div>
  //             <div className="code_note is-figma is-hidden" aria-hidden="true">
  //               Use it in Figma with{' '}
  //               <a
  //                 className="code_link"
  //                 href="https://help.figma.com/hc/en-us/articles/360039825114-Manage-color-profiles-in-design-files#h_01H6Q1C5DK2JMQ8QFQBKEQ6AM0"
  //               >
  //                 P3 color profile
  //               </a>
  //             </div>
  //             <div className="code_format"></div>
  //           </div>
  //         </div>
  //         <div className="main_row">
  //           <nav className="mode" aria-label="Mode">
  //             <a className="mode_link is-current" aria-current="page" href="https://oklch.com/">
  //               OKLCH
  //             </a>
  //             <a className="mode_link" href="https://lch.oklch.com/#0.7381,11.2,151.84,100">
  //               LCH
  //             </a>
  //           </nav>
  //         </div>
  //         <footer className="main_footer">
  //           Made at{' '}
  //           <a className="main_link is-em" href="https://evilmartians.com/devtools" target="_blank" rel="noopener noreferrer">
  //             Evil Martians
  //           </a>
  //           , devtools building consultancy. By 
  //           <a className="main_link" href="https://sitnik.ru" target="_blank" rel="noopener noreferrer">
  //             Andrey Sitnik
  //           </a>{' '}
  //           &{' '}
  //           <a className="main_link" href="https://twitter.com/romanshamin_en" target="_blank" rel="noopener noreferrer">
  //             Roman Shamin
  //           </a>
  //         </footer>
  //         <a
  //           className="main_logo"
  //           href="https://evilmartians.com/devtools"
  //           aria-label="Evil Martians"
  //           tabIndex={-1}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           <svg
  //             xmlns="http://www.w3.org/2000/svg"
  //             fill="currentcolor"
  //             className="main_logo-icon"
  //             viewBox="0 0 192 76"
  //           >
  //             <path d="M88 76V32c0-6.75-1.72-12.22-5-16.22l5.29-5.29A10.6 10.6 0 0 0 94 12a2 2 0 0 0 0-4c-3.81 0-6-2.19-6-6a2 2 0 1 0-4 0 10.6 10.6 0 0 0 1.51 5.66L80.22 13c-4-3.28-9.47-5-16.22-5H40c-6.75 0-12.22 1.72-16.22 5l-5.29-5.34A10.6 10.6 0 0 0 20 2a2 2 0 1 0-4 0c0 3.81-2.19 6-6 6a2 2 0 1 0 0 4 10.6 10.6 0 0 0 5.66-1.51L21 15.78c-3.28 4-5 9.47-5 16.22v44zM64 40a10 10 0 1 1 0 20 10 10 0 0 1 0-20m-24 0a10 10 0 1 1 0 20 10 10 0 0 1 0-20"></path>
  //             <path d="M40 56a6 6 0 1 0 0-12 6 6 0 0 0 0 12m0-10a4 4 0 1 1 0 8 4 4 0 0 1 0-8m24 10a6 6 0 1 0 0-12 6 6 0 0 0 0 12m0-10a4 4 0 1 1 0 8 4 4 0 0 1 0-8m88 10a6 6 0 0 0 5.543-3.704 6.005 6.005 0 0 0-1.3-6.539 6.002 6.002 0 0 0-9.232.91A6.002 6.002 0 0 0 152 56m0-10a4 4 0 1 1 0 8 4 4 0 0 1 0-8m-24 10a6 6 0 0 0 5.543-3.704 6.005 6.005 0 0 0-1.3-6.539 6.002 6.002 0 0 0-9.232.91A6.002 6.002 0 0 0 128 56m0-10a4 4 0 1 1 0 8 4 4 0 0 1 0-8"></path>
  //             <path d="M176 76V63.8a10 10 0 0 0 0-19.6V32c0-15.25-8.75-24-24-24h-24c-15.25 0-24 8.75-24 24v12.2a10 10 0 0 0-5.753 16.128A10 10 0 0 0 104 63.8V76zm0-27.66a6 6 0 0 1 0 11.32zm-72 11.32a6 6 0 0 1 0-11.32zm24 .34a10.002 10.002 0 0 1-9.808-11.95 9.998 9.998 0 0 1 13.635-7.289A10 10 0 0 1 138 50a10 10 0 0 1-10 10m24 0a10.002 10.002 0 0 1-9.808-11.95 9.998 9.998 0 0 1 13.635-7.289A10 10 0 0 1 162 50a10 10 0 0 1-10 10m-42-30v-2.41l5.93 6 6.07-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6v2.82l-5.93 6-6.07-6-6 6-6-6-6 6-6-6-6 6-6-6.05-6 5.9-6-6.21z"></path>
  //           </svg>
  //         </a>
  //       </main>
  //       <div className="layout_links">
  //         <a className="link is-help" target="_blank" href="https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl" rel="noopener noreferrer">
  //           <svg className="link_icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none">
  //             <circle cx="24" cy="24" r="24" fill="url(#a)"></circle>
  //             <path
  //               fill="#fff"
  //               d="M24.63 27.825V27.6c0-3.758 5.242-2.948 5.242-8.01 0-2.767-2.362-4.95-5.647-4.95-3.42 0-5.783 1.935-6.233 5.4h2.52c.405-1.89 1.71-2.97 3.668-2.97 1.755 0 3.127 1.102 3.127 2.52 0 3.532-5.107 3.195-5.107 7.875v.36h2.43Zm-1.17 5.31c1.282 0 2.025-.607 2.025-1.687 0-1.103-.743-1.71-2.025-1.71-1.283 0-2.025.607-2.025 1.71 0 1.08.742 1.687 2.025 1.687Z"
  //             ></path>
  //             <defs>
  //               <linearGradient id="a" x1="7.5" x2="39.75" y1="40.5" y2="6.75" gradientUnits="userSpaceOnUse">
  //                 <stop stopColor="#B378FC"></stop>
  //                 <stop offset=".51" stopColor="#EC6498"></stop>
  //                 <stop offset="1" stopColor="#EE740B"></stop>
  //               </linearGradient>
  //             </defs>
  //           </svg>
  //           Why OKLCH is better than RGB and HSL
  //         </a>
  //         <a className="link is-github" target="_blank" href="https://github.com/evilmartians/oklch-picker" rel="noopener noreferrer">
  //           <svg className="link_icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none">
  //             <circle cx="24" cy="24" r="24" fill="#fff"></circle>
  //             <path
  //               fill="#000"
  //               fillRule="evenodd"
  //               d="M24.042 11.25A12.775 12.775 0 0 0 11.25 24.042c0 5.629 3.667 10.404 8.784 12.11.682.085.853-.256.853-.597v-2.217c-3.582.767-4.35-1.706-4.35-1.706-.596-1.45-1.45-1.876-1.45-1.876-1.193-.768.086-.768.086-.768 1.28.086 1.961 1.28 1.961 1.28 1.11 1.961 2.985 1.364 3.753 1.023.085-.853.426-1.364.853-1.706-2.815-.34-5.8-1.45-5.8-6.31 0-1.365.512-2.559 1.28-3.412-.17-.34-.597-1.62.085-3.41 0 0 1.109-.342 3.497 1.278 1.023-.256 2.131-.426 3.24-.426 1.109 0 2.217.17 3.24.426 2.474-1.62 3.497-1.279 3.497-1.279.683 1.791.256 3.07.086 3.411.853.853 1.279 2.047 1.279 3.412 0 4.946-2.985 5.97-5.8 6.31.427.427.854 1.194.854 2.388v3.497c0 .341.255.767.852.597a12.706 12.706 0 0 0 8.7-12.11c.084-6.993-5.63-12.707-12.708-12.707Z"
  //               clipRule="evenodd"
  //             ></path>
  //           </svg>
  //           evilmartians / oklch-picker
  //         </a>
  //       </div>
  //       <div className="layout_l">
  //         <section className="card is-l">
  //           <h2 className="card_title">Lightness</h2>
  //           <div className="card_number">
  //             <div className="field">
  //               <kbd className="field_hotkey" aria-hidden="true">l</kbd>
  //               <input
  //                 className="field_input"
  //                 aria-label="L"
  //                 aria-keyshortcuts="l"
  //                 type="text"
  //                 role="spinbutton"
  //                 aria-valuemin="0"
  //                 aria-valuemax="1"
  //                 pattern="^[0-9+\/*.\-]+$"
  //                 inputMode="decimal"
  //                 step="0.01"
  //                 aria-valuenow="0.66"
  //                 defaultValue="0.66"
  //               />
  //               <button className="field_control is-increase" tabIndex={-1} aria-hidden="true"></button>
  //               <button className="field_control is-decrease" tabIndex={-1} aria-hidden="true"></button>
  //             </div>
  //           </div>
  //           <div className="card_chart">
  //             <div className="card_size">
  //               <div className="chart is-h" aria-hidden="true">
  //                 <div className="chart_line is-x is-c">
  //                   <div className="chart_label">c</div>
  //                 </div>
  //                 <div className="chart_line is-y is-l">
  //                   <div className="chart_label">l</div>
  //                 </div>
  //                 <canvas className="chart_canvas" width="680" height="300"></canvas>
  //               </div>
  //             </div>
  //           </div>
  //           <div className="range is-l">
  //             <canvas className="range_space" width="680" height="80"></canvas>
  //             <input
  //               className="range_input"
  //               type="range"
  //               min="0"
  //               max="1"
  //               step="0.0001"
  //               aria-hidden="true"
  //               defaultValue="70"
  //               tabIndex={-1}
  //               list="range_l_values"
  //             />
  //             <datalist id="range_l_values">
  //               <option value="0.0102"></option>
  //               <option value="0.0927"></option>
  //               <option value="0.128"></option>
  //               <option value="0.9779"></option>
  //               <option value="0.9808"></option>
  //             </datalist>
  //           </div>
  //         </section>
  //       </div>
  //       <div className="layout_c">
  //         <section className="card is-c">
  //           <h2 className="card_title">Chroma</h2>
  //           <div className="card_number">
  //             <div className="field">
  //               <kbd className="field_hotkey" aria-hidden="true">c</kbd>
  //               <input
  //                 className="field_input"
  //                 aria-label="C"
  //                 aria-keyshortcuts="c"
  //                 type="text"
  //                 role="spinbutton"
  //                 pattern="^[0-9+\/*.\-]+$"
  //                 aria-valuemin="0"
  //                 inputMode="decimal"
  //                 step="0.01"
  //                 aria-valuemax="0.37"
  //                 aria-valuenow="0.29"
  //                 defaultValue="0.29"
  //               />
  //               <button className="field_control is-increase" tabIndex={-1} aria-hidden="true"></button>
  //               <button className="field_control is-decrease" tabIndex={-1} aria-hidden="true"></button>
  //             </div>
  //           </div>
  //           <div className="card_chart">
  //             <div className="card_size">
  //               <div className="chart is-l" aria-hidden="true">
  //                 <div className="chart_line is-x is-c">
  //                   <div className="chart_label">c</div>
  //                 </div>
  //                 <div className="chart_line is-y is-h">
  //                   <div className="chart_label">h</div>
  //                 </div>
  //                 <canvas className="chart_canvas" width="680" height="300"></canvas>
  //               </div>
  //             </div>
  //           </div>
  //           <div className="range is-c">
  //             <canvas className="range_space" width="680" height="80"></canvas>
  //             <input
  //               className="range_input"
  //               type="range"
  //               min="0"
  //               max="0.37"
  //               step="0.0001"
  //               aria-hidden="true"
  //               defaultValue="0.1"
  //               tabIndex={-1}
  //               list="range_c_values"
  //             />
  //             <datalist id="range_c_values">
  //               <option value="0.1937"></option>
  //               <option value="0.2687"></option>
  //             </datalist>
  //           </div>
  //         </section>
  //       </div>
  //       <div className="layout_h">
  //         <section className="card is-h">
  //           <h2 className="card_title">Hue</h2>
  //           <div className="card_number">
  //             <div className="field">
  //               <kbd className="field_hotkey" aria-hidden="true">h</kbd>
  //               <input
  //                 className="field_input"
  //                 aria-label="H"
  //                 aria-keyshortcuts="h"
  //                 type="text"
  //                 role="spinbutton"
  //                 pattern="^[0-9+\/*.\-]+$"
  //                 aria-valuemin="0"
  //                 aria-valuemax="360"
  //                 inputMode="decimal"
  //                 step="1"
  //               />
  //               <button className="field_control is-increase" tabIndex={-1} aria-hidden="true"></button>
  //               <button className="field_control is-decrease" tabIndex={-1} aria-hidden="true"></button>
  //             </div>
  //           </div>
  //           <div className="card_chart">
  //             <div className="card_size">
  //               <div className="chart is-c" aria-hidden="true">
  //                 <div className="chart_line is-x is-l">
  //                   <div className="chart_label">l</div>
  //                 </div>
  //                 <div className="chart_line is-y is-h">
  //                   <div className="chart_label">h</div>
  //                 </div>
  //                 <canvas className="chart_canvas" width="680" height="300"></canvas>
  //               </div>
  //             </div>
  //           </div>
  //           <div className="range is-h">
  //             <canvas className="range_space" width="680" height="80"></canvas>
  //             <input
  //               className="range_input"
  //               type="range"
  //               min="0"
  //               max="360"
  //               step="0.01"
  //               aria-hidden="true"
  //               defaultValue="286"
  //               tabIndex={-1}
  //               list="range_h_values"
  //             />
  //             <datalist id="range_h_values"></datalist>
  //           </div>
  //         </section>
  //       </div>
  //       <div className="layout_extra">
  //         <div className="layout_3d is-shown">
  //           <section className="card is-3d">
  //             <h2 className="card_title">3D</h2>
  //             <div className="minimodel">
  //               <canvas
  //                 className="minimodel_canvas"
  //                 data-engine="three.js r177"
  //                 width="808"
  //                 height="636"
  //                 style={{ width: '404px', height: '318px', touchAction: 'none' }}
  //               ></canvas>
  //               <div className="minimodel_status" style={{ display: 'none' }}>
  //                 Loading
  //               </div>
  //               <div className="minimodel_button">
  //                 <button className="button is-3d" title="Open 3D in fullscreen">
  //                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
  //                     <path
  //                       stroke="currentColor"
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       strokeWidth="1.5"
  //                       d="m1.5 14.5 13-13m-13 13V9m0 5.5H7m7.5-13H9m5.5 0V7"
  //                     ></path>
  //                   </svg>
  //                 </button>
  //               </div>
  //             </div>
  //           </section>
  //         </div>
  //         <section className="card is-a">
  //           <h2 className="card_title">Alpha</h2>
  //           <div className="card_number">
  //             <div className="field">
  //               <kbd className="field_hotkey" aria-hidden="true">a</kbd>
  //               <input
  //                 className="field_input"
  //                 aria-label="Alpha"
  //                 aria-keyshortcuts="a"
  //                 type="text"
  //                 role="spinbutton"
  //                 pattern="^[0-9+\/*.\-]+$"
  //                 aria-valuemin="0"
  //                 aria-valuemax="100"
  //                 defaultValue="100"
  //                 step="1"
  //                 inputMode="decimal"
  //               />
  //               <button className="field_control is-increase" tabIndex={-1} aria-hidden="true"></button>
  //               <button className="field_control is-decrease" tabIndex={-1} aria-hidden="true"></button>
  //             </div>
  //           </div>
  //           <div
  //             className="range is-a"
  //             style={{
  //               '--range-a-from': 'oklch(0.7705 0.0321 154.06 / 0%)',
  //               '--range-a-to': 'oklch(0.7705 0.0321 154.06)',
  //             }}
  //           >
  //             <input
  //               className="range_input"
  //               type="range"
  //               min="0"
  //               max="100"
  //               step="0.01"
  //               aria-hidden="true"
  //               defaultValue="100"
  //               tabIndex={-1}
  //               list="range_a_values"
  //             />
  //             <datalist id="range_a_values"></datalist>
  //           </div>
  //         </section>
  //       </div>
  //       <div className="layout_prefs">
  //         <section className="settings" aria-label="Settings">
  //           <label className="checkbox">
  //             <input className="checkbox_input" name="mode3d" type="checkbox" />
  //             <span className="checkbox_control">
  //               <span className="checkbox_icon"></span>Show 3D
  //             </span>
  //           </label>
  //           <label className="checkbox">
  //             <input className="checkbox_input" name="charts" type="checkbox" defaultChecked />
  //             <span className="checkbox_control">
  //               <span className="checkbox_icon"></span>Show graphs
  //             </span>
  //           </label>
  //           <label className="checkbox">
  //             <input className="checkbox_input" name="p3" type="checkbox" defaultChecked />
  //             <span className="checkbox_control">
  //               <span className="checkbox_icon"></span>Show P3
  //             </span>
  //           </label>
  //           <label className="checkbox">
  //             <input className="checkbox_input" name="rec2020" type="checkbox" />
  //             <span className="checkbox_control">
  //               <span className="checkbox_icon"></span>Show Rec2020
  //             </span>
  //           </label>
  //         </section>
  //       </div>
  //     </div>
  //     <article className="fullmodel is-hidden" aria-hidden="true">
  //       <h2 className="title">OKLCH 3D model</h2>
  //       <div className="fullmodel_status"></div>
  //       <div className="fullmodel_button">
  //         <button className="button is-close3d" title="Back to color picker">
  //           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
  //             <path
  //               stroke="currentColor"
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               strokeWidth="2"
  //               d="m1.5 14.5 13-13m-13 0 13 13"
  //             ></path>
  //           </svg>
  //         </button>
  //       </div>
  //       <canvas className="fullmodel_canvas"></canvas>
  //       <div className="fullmodel_note">
  //         Drag to rotate • Scroll to zoom • Right button to move
  //       </div>
  //     </article>
  //     <div className="benchmark" aria-live="polite" aria-label="Benchmark" aria-hidden="true">
  //       <div className="benchmark_row">
  //         Freeze max <strong className="benchmark_value is-freeze-max"></strong>
  //       </div>
  //       <div className="benchmark_row">
  //         Freeze sum <strong className="benchmark_value is-freeze-sum"></strong>
  //       </div>
  //       <div className="benchmark_row">
  //         Worker max <strong className="benchmark_value is-worker-max"></strong>
  //       </div>
  //       <div className="benchmark_row">
  //         Worker sum <strong className="benchmark_value is-worker-sum"></strong>
  //       </div>
  //       <div className="benchmark_row">
  //         Paint      <strong className="benchmark_value is-paint"></strong>
  //       </div>
  //     </div>
  //   </div>
  //   </>
  // );
}
