'use client';

import React, { FC, useState } from 'react';
import { ColorRepresentation, ColorRepresentationProps } from './colorRepresentation';
import { ColorEditor, ColorEditorProps } from './ColorEditor';

interface ColorChoiceProps extends ColorRepresentationProps {
    
}

export const ColorChoice: FC<ColorChoiceProps> = (props) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleEdit = () => {
    setIsEditorOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsEditorOpen(false);
  };

  return (
    <div className="w-full">
      <ColorRepresentation {...props} onEdit={handleEdit} />
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isEditorOpen ? 'max-h-96 mt-4' : 'max-h-0 mt-0'
        }`}
      >
        <ColorEditor onClose={handleClose} />
      </div>
    </div>
  );
};
