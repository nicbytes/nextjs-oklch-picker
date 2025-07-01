import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  MouseEvent
} from 'react';

type SpinAction = 'increase' | 'decrease';

export interface FieldProps {

  /** The main label for the field, e.g., "Lightness". */
  label: string;
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

// SVG icon components for the spin buttons
const UpArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M12 8l-4 4h8l-4-4z" />
  </svg>
);

const DownArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M12 16l4-4H8l4 4z" />
  </svg>
);

export const Field: React.FC<FieldProps> = ({
  label,
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
    <div className="flex items-center justify-between w-full max-w-xs">
      <span className="text-2xl font-bold text-white font-sans select-none">
        {label}
      </span>
      <div className="flex items-center bg-[#4a4652] rounded-xl p-1 ">
        <div className="flex items-center">
          <input
            ref={inputRef}
            className={`
              w-24 bg-transparent text-white text-xl font-mono text-center
              focus:outline-none
              ${invalid ? 'text-red-400' : ''}
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
            <div className="flex flex-col items-center justify-center -space-y-1">
              <button
                type="button"
                aria-label="Increase"
                className="text-white/70 hover:text-white transition-colors"
                onMouseDown={makeSpinHandler('increase')}
              >
                <UpArrow />
              </button>
              <button
                type="button"
                aria-label="Decrease"
                className="text-white/70 hover:text-white transition-colors"
                onMouseDown={makeSpinHandler('decrease')}
              >
                <DownArrow />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};