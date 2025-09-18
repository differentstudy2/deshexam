
'use client';

import React from 'react';
import { Plate } from '@udecode/plate-common';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  // Plate expects an array of objects, not a string. 
  const initialValue = value ? JSON.parse(value) : [{ type: 'p', children: [{ text: '' }] }];

  const handleValueChange = (newValue: any) => {
    const stringValue = JSON.stringify(newValue);
    onChange(stringValue);
  };
  
  return (
    <div className="rounded-md border">
      <Plate
        initialValue={initialValue}
        onChange={handleValueChange}
      />
    </div>
  );
};

export default RichTextEditor;
