import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathNodeView(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;
  const [latex, setLatex] = useState(node.attrs.latex || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(latex || '\\text{Click to edit equation}', containerRef.current, {
          displayMode: node.attrs.block,
          throwOnError: false,
        });
      } catch (e) {
        containerRef.current.innerText = String(e);
      }
    }
  }, [latex, node.attrs.block]);

  return (
    <NodeViewWrapper className={`math-node relative my-2 rounded-lg transition-all ${selected ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
      <div 
        ref={containerRef} 
        className={`px-4 py-3 min-h-[40px] flex ${node.attrs.block ? 'justify-center' : 'justify-start items-center inline-flex'} cursor-pointer select-none`}
      />
      {selected && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full md:w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg p-3 z-50">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">LaTeX Equation</label>
          <textarea
            className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono resize-none"
            placeholder="Type LaTeX here (e.g. x^2 + y^2 = z^2)"
            value={latex}
            onChange={(e) => {
              setLatex(e.target.value);
              updateAttributes({ latex: e.target.value });
            }}
            rows={3}
            autoFocus
          />
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Supports standard LaTeX notation.</span>
            <button 
              className="text-emerald-600 hover:text-emerald-700 font-medium"
              onClick={() => updateAttributes({ block: !node.attrs.block })}
            >
              Toggle {node.attrs.block ? 'Inline' : 'Block'}
            </button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}
