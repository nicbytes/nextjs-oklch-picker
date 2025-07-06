// ColorCode.tsx
import React, { useEffect, useState } from 'react';
import {
  parseAnything,
  formatLch,
  formatRgb,
  isHexNotation,
  inP3,
  inRGB
} from './oklchPicker/colors';   // path relative to your project
import type { Color } from 'culori/fn';

// output-format enum identical to stores/formats.ts, but local
type Format = 'hex' | 'rgb' | 'hsl' | 'lch' | 'oklch';

const ALL_FORMATS: Format[] = ['hex', 'rgb', 'hsl', 'lch', 'oklch'];

export const ColorCode: React.FC = () => {
  const [color, setColor] = useState<Color | undefined>(
    parseAnything('oklch(0.65 0.15 130)')
  );
  const [format, setFormat] = useState<Format>('hex');
  const [lchText, setLchText] = useState('');
  const [outText, setOutText] = useState('');
  const [fallback, setFallback] = useState(false);

  // --- sync display values when colour or format changes
  useEffect(() => {
    if (!color) return;
    setLchText(formatLch(color as any));          // OKLCH/LCH text
    switch (format) {
      case 'hex':
        setOutText(formatRgb(color as any).replace(/^rgb/, '#')); // quick hex-ish
        break;
      case 'rgb':
        setOutText(formatRgb(color as any));
        break;
      case 'hsl':
        setOutText(`hsl(${Math.round((color as any).h)} …)`);      // stub
        break;
      default:
        setOutText(formatLch(color as any)); // lch / oklch
    }
    // gamut note
    const p3 = inP3(color);
    const srgb = inRGB(color);
    setFallback(!srgb && p3); // show note only if outside sRGB but inside P3
  }, [color, format]);

  // --- handle user edits
  const handle = (v: string, src: 'lch' | 'out') => {
    if (src === 'lch') setLchText(v);
    else setOutText(v);

    const parsed = parseAnything(v);
    if (parsed) {
      setColor(parsed);
      if (src === 'out' && isHexNotation(v)) setFormat('hex');
    }
  };

  return (
    <div className="space-y-2 w-full max-w-md bg-gray-800 p-4 rounded-lg">
      {/* LCH/OKLCH input */}
      <input
        value={lchText}
        onChange={e => handle(e.target.value, 'lch')}
        className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
      />

      {/* Output input + selector */}
      <div className="relative">
        <input
          value={outText}
          onChange={e => handle(e.target.value, 'out')}
          className="w-full bg-gray-700 text-white px-3 py-2 pr-20 rounded-lg"
        />
        <select
          value={format}
          onChange={e => setFormat(e.target.value as Format)}
          className="absolute top-1 right-1 bg-gray-600 text-white px-2 py-1 rounded"
        >
          {ALL_FORMATS.map(f => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Note */}
      {fallback && (
        <p className="text-xs text-gray-400">
          Closest fallback in sRGB (P3 original).
        </p>
      )}
    </div>
  );
};