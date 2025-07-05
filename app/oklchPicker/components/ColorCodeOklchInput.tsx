import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';
import { Martian_Mono } from 'next/font/google';
import {
  formatLch,
  isHexNotation,
  parseAnything,
  valueToColor,
} from '@/lib/colors';
import { useOklchContext } from '../context/OklchContext';
import { LchValue } from '../type';

const font = Martian_Mono({
  subsets: ['latin'],
  weight: ['200', '400', '700'],
});

interface Props {
  id: string;
  value: string;
  label: string;
  onCommit: (value: string) => void;
}

function round(value: number, places: number) {
  return parseFloat(value.toFixed(places))
}

export const ColorCodeOklchInput: React.FC<Props> = ({
  id,
  value,
  label,
  onCommit,
}) => {
  const { value: ctxValue } = useOklchContext(); // { l, c, h, … }
  const inputRef = useRef<HTMLInputElement>(null);

  const [localValue, setLocalValue] = useState(value);
  const [locked, setLocked] = useState(false); // replicate “locked” map

  /* --- keep local → external in sync --- */
  useEffect(() => {
    if (!locked) setLocalValue(value);
  }, [value, locked]);

  /* --- write formatted OKLCH from store on change --- */
  const setLch = useCallback(() => {

    const val: LchValue = {
      l: round(ctxValue.l, 3),
      c: round(ctxValue.c, 3),
      h: round(ctxValue.h, 0),
      a: round(ctxValue.a, 2),
    };

    const text = formatLch(valueToColor(val));
    setLocalValue(text);
  }, [ctxValue]);

  // whenever color context changes and field isn’t being edited
  useEffect(() => {
    if (!locked) setLch();
  }, [ctxValue, locked, setLch]);

  /* --- commit / validation ------------------------------------------------ */
  const commit = useCallback(
    (v: string) => {
      // basic validity check – match original code
      if (!isHexNotation(v) && !parseAnything(v)) {
        return;
      }
      onCommit(v);
    },
    [onCommit]
  );

  /* --- DOM events --------------------------------------------------------- */
  const onBlur = () => {
    setLocked(false);
    if (localValue !== value) commit(localValue.trim());
    else setLch(); // restore formatted text if unchanged but spacing differs
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  /* --- live accent colour ------------------------------------------------- */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.setProperty(
        '--target-color',
        `oklch(${ctxValue.l} ${ctxValue.c} ${ctxValue.h})`
      );
    }
  }, [ctxValue]);

  return (
    <div className="relative group">
      <input
        ref={inputRef}
        id={id}
        type="text"
        aria-label={label}
        value={localValue}
        onChange={(e) => {
          setLocked(true);
          setLocalValue(e.target.value);
        }}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={`w-full h-10 px-3 bg-neutral-300 dark:bg-[#3D3D3D] rounded-lg transition-colors focus:outline-2 focus:outline-[var(--target-color)] ${font.className}`}
        autoComplete="off"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
};

export default ColorCodeOklchInput;
