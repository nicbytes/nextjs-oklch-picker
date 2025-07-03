import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  MouseEvent
} from 'react';
import { Martian_Mono } from "next/font/google";

const font = Martian_Mono({
  subsets: ['latin'],
  weight: ['200', '400', '700']
});

type SpinAction = 'increase' | 'decrease';

export interface NumericInputProps {

  /** Controlled value. */
  value: string;
  /** Called on text change. Receives the raw string. */
  onChange(value: string): void;
  /** RegExp-compatible pattern for validation. */
  pattern?: RegExp;
  /** Show spin-buttons and emit `onSpin` instead of `onChange` for arrows. */
  spin?: boolean;
  /** Invoked when user presses spin controls. */
  onSpin?(action: SpinAction, slow: boolean): void;
}


export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  pattern,
  spin,
  onSpin
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [invalid, setInvalid] = useState(false);

  /* ---------- Validation ---------- */
  useEffect(() => {
    if (!pattern) return;
    setInvalid(!pattern.test(value));
  }, [value, pattern]);

  /* ---------- Auto-select on focus & mouse-up hack ---------- */
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onFocus = () => {
      el.select();
      const prevent = (e: MouseEvent) => {
        e.preventDefault();
        el.removeEventListener('mouseup', prevent as any);
      };
      el.addEventListener('mouseup', prevent as any);
    };
    el.addEventListener('focus', onFocus);
    return () => el.removeEventListener('focus', onFocus);
  }, []);

  /* ---------- Blur on escape ---------- */
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && e.target === inputRef.current) {
        (e.target as HTMLInputElement).blur();
      }
    };
    window.addEventListener('keyup', listener as any);
    return () => window.removeEventListener('keyup', listener as any);
  }, []);

  /* ---------- Spin-button helpers ---------- */
  const notifySpin = useCallback(
    (action: SpinAction, slow: boolean) => {
      if (onSpin) onSpin(action, slow);
    },
    [onSpin]
  );

  const makeSpinHandler = (action: SpinAction) => (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    inputRef.current?.focus();
    let repeat = true;
    const tick = () => {
      if (!repeat) return;
      notifySpin(action, e.shiftKey);
      setTimeout(tick, 50);
    };
    notifySpin(action, e.shiftKey);
    setTimeout(tick, 400);
    const stop = () => {
      repeat = false;
      window.removeEventListener('mouseup', stop);
    };
    window.addEventListener('mouseup', stop);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (spin && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      notifySpin(e.key === 'ArrowUp' ? 'increase' : 'decrease', e.shiftKey);
    }
  };

  return (
    <div className="flex w-32 items-center content-stretch bg-[#3D3D3D] rounded-lg px-2 py-1.5 text-white/90">
      <input
        ref={inputRef}
        className={`
              w-full bg-transparent text-white text-lg font-mono text-right
              focus:outline-none
              ${invalid ? 'text-red-400' : ''}
              ${font.className}
            `}
        aria-invalid={invalid || undefined}
        role={spin ? 'spinbutton' : undefined}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        pattern={pattern?.source}
        aria-valuenow={spin ? value : undefined}
      />
      {spin && (
        <div className="flex flex-col self-stretch ml-2">
          <button
            type="button"
            aria-label="Increase"
            className="h-full flex items-end rounded-t px-1 text-white/70 hover:text-white transition-colors"
            onMouseDown={makeSpinHandler('increase')}
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 1L9 5L1 5L5 1Z" fill="#9CA3AF" /></svg>
          </button>
          <button
            type="button"
            aria-label="Decrease"
            className="h-full flex items-start rounded-b px-1 text-white/70 hover:text-white transition-colors"
            onMouseDown={makeSpinHandler('decrease')}
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5L1 1H9L5 5Z" fill="#9CA3AF" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};
