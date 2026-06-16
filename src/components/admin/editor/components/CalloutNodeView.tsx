import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import React from 'react';
import { Info, AlertTriangle, Lightbulb, AlertCircle, BookOpen, PenTool, LayoutTemplate } from 'lucide-react';

const typeConfig = {
  info: { icon: Info, color: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900', text: 'text-blue-700 dark:text-blue-300' },
  warning: { icon: AlertTriangle, color: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
  tip: { icon: Lightbulb, color: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-900', text: 'text-green-700 dark:text-green-300' },
  important: { icon: AlertCircle, color: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900', text: 'text-red-700 dark:text-red-300' },
  example: { icon: LayoutTemplate, color: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-900', text: 'text-purple-700 dark:text-purple-300' },
  definition: { icon: BookOpen, color: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-300' },
  vocabulary: { icon: PenTool, color: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-900', text: 'text-orange-700 dark:text-orange-300' },
};

export default function CalloutNodeView(props: NodeViewProps) {
  const { node, updateAttributes } = props;
  const type = node.attrs.type as keyof typeof typeConfig || 'info';
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <NodeViewWrapper className={`callout-node relative my-4 rounded-xl border p-4 flex gap-3 ${config.color} ${config.border}`}>
      <div 
        className="mt-0.5 cursor-pointer flex-shrink-0 relative group"
        onClick={() => {
          // Cycle through types on icon click
          const types = Object.keys(typeConfig);
          const currentIndex = types.indexOf(type);
          const nextIndex = (currentIndex + 1) % types.length;
          updateAttributes({ type: types[nextIndex] });
        }}
        title="Click to change callout type"
      >
        <Icon className={`w-5 h-5 ${config.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${config.text}`}>
          {type}
        </div>
        <NodeViewContent className={`text-sm ${config.text} [&>p]:m-0`} />
      </div>
    </NodeViewWrapper>
  );
}
