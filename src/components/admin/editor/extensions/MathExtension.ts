import { mergeAttributes, Node, ReactNodeViewRenderer } from '@tiptap/react';
import MathNodeView from '../components/MathNodeView';

export interface MathOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      setMath: (options?: { latex?: string, block?: boolean }) => ReturnType;
    }
  }
}

export const MathExtension = Node.create<MathOptions>({
  name: 'math',
  group: 'block', // treat as block for simplicity, even if inline is an option internally
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      latex: { default: '' },
      block: { default: true },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="math"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'math' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView)
  },

  addCommands() {
    return {
      setMath: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options || {},
        })
      },
    }
  },
})
