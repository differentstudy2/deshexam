import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import React, { useState } from 'react';
import { HelpCircle, Target, Activity, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AssessmentNodeView(props: NodeViewProps) {
  const { node, updateAttributes, selected, editor } = props;
  const type = node.attrs.type || 'mcq';
  
  const [options, setOptions] = useState<string[]>(node.attrs.options || ['Option A', 'Option B', 'Option C', 'Option D']);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(node.attrs.correctAnswer);

  const getHeader = () => {
    switch (type) {
      case 'mcq': return { icon: HelpCircle, title: 'Multiple Choice Question', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' };
      case 'exercise': return { icon: Activity, title: 'Exercise Block', color: 'bg-teal-50 border-teal-200 text-teal-700' };
      case 'practice': return { icon: Target, title: 'Practice Block', color: 'bg-rose-50 border-rose-200 text-rose-700' };
      default: return { icon: HelpCircle, title: 'Assessment', color: 'bg-slate-50 border-slate-200 text-slate-700' };
    }
  };

  const config = getHeader();
  const Icon = config.icon;

  const handleUpdateOptions = (newOptions: string[]) => {
    setOptions(newOptions);
    updateAttributes({ options: newOptions });
  };

  return (
    <NodeViewWrapper className={`assessment-node relative my-6 rounded-xl border-2 ${config.color} overflow-hidden transition-all ${selected ? 'ring-2 ring-indigo-500 shadow-md' : ''}`}>
      
      {/* Header */}
      <div className={`px-4 py-2 flex items-center gap-2 border-b ${config.color} bg-white/50 backdrop-blur-sm`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{config.title}</span>
        {selected && (
          <div className="ml-auto flex gap-2">
            <button onClick={() => updateAttributes({ type: 'mcq' })} className={`text-[10px] px-2 py-1 rounded ${type === 'mcq' ? 'bg-indigo-200' : 'bg-white/50'}`}>MCQ</button>
            <button onClick={() => updateAttributes({ type: 'exercise' })} className={`text-[10px] px-2 py-1 rounded ${type === 'exercise' ? 'bg-indigo-200' : 'bg-white/50'}`}>Exercise</button>
            <button onClick={() => updateAttributes({ type: 'practice' })} className={`text-[10px] px-2 py-1 rounded ${type === 'practice' ? 'bg-indigo-200' : 'bg-white/50'}`}>Practice</button>
          </div>
        )}
      </div>

      {/* Body: Where the user types the question/content */}
      <div className="p-4 bg-white dark:bg-slate-950">
        <div className="min-h-[60px]">
          <NodeViewContent className="prose-sm max-w-none focus:outline-none" />
        </div>
        
        {/* MCQ specific options */}
        {type === 'mcq' && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800" contentEditable={false}>
            <div className="text-xs font-semibold text-slate-500 mb-3">Answer Options</div>
            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button 
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${correctAnswer === i ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 hover:border-indigo-400'}`}
                    onClick={() => {
                      setCorrectAnswer(i);
                      updateAttributes({ correctAnswer: i });
                    }}
                    title="Mark as correct answer"
                  >
                    {correctAnswer === i && <div className="w-2 h-2 bg-white rounded-full" />}
                  </button>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      handleUpdateOptions(newOpts);
                    }}
                    className={`flex-1 text-sm p-1.5 px-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-900 ${correctAnswer === i ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800'}`}
                  />
                  <button 
                    onClick={() => {
                      if (options.length <= 2) return;
                      const newOpts = options.filter((_, idx) => idx !== i);
                      if (correctAnswer === i) setCorrectAnswer(null);
                      else if (correctAnswer !== null && correctAnswer > i) setCorrectAnswer(correctAnswer - 1);
                      handleUpdateOptions(newOpts);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30"
                    disabled={options.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                onClick={() => handleUpdateOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`])}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Option
              </Button>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
