import { useEffect, useMemo, useRef, useState, ClipboardEvent } from "react";
import { Martian_Mono } from "next/font/google";
import { useOklchContext } from "../context/OklchContext";
import { AnyLch, AnyRgb, clean, hsl, inRGB, lab, lch, lrgb, oklab, p3, toRgb, valueToColor, parseAnything, isHexNotation } from "../colors";
import { Color, formatCss, formatHex, formatHex8, formatRgb, Oklab, serializeHex8 } from "culori/fn";
import { OutputFormats } from "../type";


const font = Martian_Mono({
  subsets: ['latin'],
  weight: ['200', '400', '700'],
});

function formatOklab(color: Oklab): string {
  const { a, alpha, b, l } = color
  let postfix = ''
  if (typeof alpha !== 'undefined' && alpha < 1) {
    postfix = ` / ${clean(alpha)}`
  }
  return `oklab(${clean(l)} ${clean(a)} ${clean(b)}${postfix})`
}

function formatVec(color: AnyRgb): string {
  const { alpha, b, g, r } = color
  const a = alpha ?? 1
  return `vec(${clean(r, 5)}, ${clean(g, 5)}, ${clean(b, 5)}, ${clean(a, 5)})`
}

function toNumbers(color: AnyLch): string {
  const { alpha, c, h, l } = color
  const prefix = `${clean(l)}, ${clean(c)}, ${clean(h ?? 0)}`
  if (typeof alpha !== 'undefined' && alpha < 1) {
    return `${prefix}, ${clean(alpha)}`
  } else {
    return prefix
  }
}

function cleanComponents<Obj extends object>(
  color: Obj,
  precision?: number
): Obj {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {}
  for (const key in color) {
    const value = color[key]
    if (typeof value === 'number' && key !== 'alpha') {
       
      result[key] = clean(value, precision)
    } else {
       
      result[key] = color[key]
    }
  }
   
  return result
}

const ColorCodeFormattedInput: React.FC<{
  id: string;
  value: string;
  label: string;
  onCommit: (value: string) => void;
}> = ({ id, value, label, onCommit }) => {
  const [localValue, setLocalValue] = useState(value);
  const colorCodeInputRef = useRef<HTMLInputElement>(null);
  const { value: colorValue, outputFormat, setOutputFormat } = useOklchContext();
  const containingDivRef = useRef<HTMLDivElement>(null);

  const formats = useMemo(() => {
    const color: AnyLch = valueToColor(colorValue);
    const rgbColor: Color = inRGB(color) ? color : toRgb(color);
    const hex = formatHex(rgbColor);
    const rgba = formatRgb(rgbColor);
    const hasAlpha = typeof color.alpha !== 'undefined' && color.alpha < 1;
    return {
      figmaP3: 'Figma P3 ' + serializeHex8(p3(color)),
      hex: hasAlpha ? formatHex8(rgbColor) : hex,
      'hex/rgba': hasAlpha ? rgba : hex,
      hsl: formatCss(cleanComponents(hsl(rgbColor))),
      lab: formatCss(cleanComponents(lab(color))),
      lch: formatCss(cleanComponents(lch(color))),
      lrgb: 'Linear RGB ' + formatVec(lrgb(color)),
      numbers: toNumbers(color),
      oklab: formatOklab(oklab(color)),
      p3: formatCss(cleanComponents(p3(color), 4)),
      rgb: rgba,
    } as Record<OutputFormats, string>;
  }, [colorValue]);

  // Keep local value in sync with selected output format or external value changes
  useEffect(() => {
    // Prefer a computed representation when available
    setLocalValue(formats[outputFormat] ?? value);
  }, [value, outputFormat, formats]);

  const commit = (v: string) => {
    // Only commit if the value appears to be a valid colour string
    const trimmed = v.trim();
    if (!trimmed) return;
    if (!isHexNotation(trimmed) && !parseAnything(trimmed)) {
      // invalid – do nothing
      return;
    }
    onCommit(trimmed);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      commit(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  useEffect(() => {
    if (!colorCodeInputRef.current) return;
    colorCodeInputRef.current.style.setProperty('--target-color', `oklch(${colorValue.l} ${colorValue.c} ${colorValue.h})`);
    if (!containingDivRef.current) return;
    containingDivRef.current.style.setProperty('--target-color-accent', `oklch(0.76 0.1 ${colorValue.h} / 42%)`);
    containingDivRef.current.style.setProperty('--target-color-accent-hover', `oklch(0.66 0.1 ${colorValue.h})`);
  }, [colorValue]);

  return (
    <div ref={containingDivRef} className="relative group flex gap-1">
      <input
        ref={colorCodeInputRef}
        id={id}
        type="text"
        aria-label={label}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onPaste={(e: ClipboardEvent<HTMLInputElement>) => {
          // Wait for paste to populate the value then attempt commit
          requestAnimationFrame(() => {
            const val = (e.target as HTMLInputElement).value;
            commit(val);
          });
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full h-10 px-3 bg-neutral-300 dark:bg-[#3D3D3D] rounded-l-lg focus:outline-lg focus:outline-2 focus:outline-[var(--target-color)] transition-colors ${font.className}`}
        autoComplete="off"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />
      <div className="relative h-10">
        <select
          aria-label="Change format"
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value as OutputFormats)}
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
        >
          {Object.keys(formats).map(f => (
            <option key={f} value={f}>{f.toUpperCase()}</option>
          ))}
        </select>
        <div className="w-12 h-10 flex items-center justify-center bg-[var(--target-color-accent)] text-[var(--target-color-accent-hover)] pointer-events-none rounded-r-lg">
          <svg className="w-4 h-4 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
            <path fill="currentColor" fillRule="evenodd" d="M8 11.56 3.47 7.03a.75.75 0 0 1 1.06-1.061L8 9.439l3.47-3.47a.75.75 0 1 1 1.06 1.06L8 11.56Z" clipRule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ColorCodeFormattedInput;
