
'use client';

import React from 'react';
import { Plate, PlateProvider } from '@udecode/plate-common';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  // Plate expects an array of objects, not a string. 
  // We need to handle the initial value conversion.
  // For simplicity, we'll start with a basic setup.
  // A proper implementation would parse the stored HTML/string into a Plate-compatible format.
  
  const initialValue = value ? JSON.parse(value) : [{ type: 'p', children: [{ text: '' }] }];

  const handleValueChange = (newValue: any) => {
    const stringValue = JSON.stringify(newValue);
    onChange(stringValue);
  };
  
  return (
    <div className="rounded-md border">
      <PlateProvider 
        initialValue={initialValue}
        onChange={handleValueChange}
      >
        <Plate />
      </PlateProvider>
    </div>
  );
};

export default RichTextEditor;
