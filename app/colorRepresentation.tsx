'use client';

import { useState, type FC } from 'react';

export interface ColorRepresentationProps {
  color?: string;
  variableName?: string;
  onEdit?: () => void;
}

export const ColorRepresentation: FC<ColorRepresentationProps> = ({ color, variableName, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isVarCopied, setIsVarCopied] = useState(false);

  const handleCopy = (text: string | undefined, type: 'code' | 'var') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2000);
    } else {
      setIsVarCopied(true);
      setTimeout(() => setIsVarCopied(false), 2000);
    }
  };

  const swatchStyle = {
    backgroundColor: color || 'var(--surface-0)',
  };

  return (
    <div
      className="group relative flex w-full items-center gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color Swatch and Edit Button */}
      <div className="relative flex-shrink-0">
        <div className="h-10 w-10 rounded-md border border-white/20" style={swatchStyle} />
        {isHovered && onEdit && (
          <button
            onClick={onEdit}
            className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-1 text-white shadow-md transition-transform hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
        )}
      </div>

      {/* Color & Var Codes */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {color && (
          <div
            onClick={() => handleCopy(color, 'code')}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-[var(--surface-box)] px-2 py-1"
          >
            <code className="font-mono text-sm text-[var(--text-secondary)]">{color}</code>
            <div className="relative h-4 w-4">
              <div className={`absolute inset-0 transition-all duration-200 ${isCodeCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div className={`absolute inset-0 opacity-0 transition-all duration-200 group-hover:opacity-100 ${isCodeCopied ? 'scale-50' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </div>
            </div>
          </div>
        )}

        {variableName && (
          <div
            onClick={() => handleCopy(variableName, 'var')}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-[var(--surface-box)] px-2 py-1"
          >
            <code className="font-mono text-sm text-[var(--text-primary)]">{variableName}</code>
            <div className="relative h-4 w-4">
              <div className={`absolute inset-0 transition-all duration-200 ${isVarCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div className={`absolute inset-0 opacity-0 transition-all duration-200 group-hover:opacity-100 ${isVarCopied ? 'scale-50' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
