'use client';

import React, { FC } from 'react';

export interface ColorEditorProps {
  onClose?: () => void;
}

export const ColorEditor: FC<ColorEditorProps> = ({ onClose }) => {
  return (
    <div className="relative w-full rounded-lg border border-[var(--ui-border)] bg-[var(--surface-1)] p-4 text-[var(--text-primary)]">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}
      <h2 className="text-lg font-bold">Color Editor</h2>
      <p className="mt-2 text-[var(--text-secondary)]">Edit your color here.</p>
      {/* Placeholder content */}
      <div className="bg-cyan-700 flex">

      {/* Column 1 */}
      <div className="bg-red-600"></div>

      {/* Column 2 */}
      <div className="bg-green-600"></div>

      {/* Column 3 */}
      <div className="bg-blue-600"></div>

      </div>
    </div>
  );
};
