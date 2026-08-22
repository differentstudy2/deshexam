import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { CommandItem } from '../extensions/SlashCommand';

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  if (!props.items.length) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl overflow-hidden flex flex-col w-[300px] max-h-[330px] z-50 animate-in fade-in zoom-in-95 duration-100">
      <div className="overflow-y-auto p-1">
        {props.items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                index === selectedIndex ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              key={index}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={`p-1.5 rounded-md flex-shrink-0 ${index === selectedIndex ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-500">{item.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

CommandList.displayName = 'CommandList';
export default CommandList;
