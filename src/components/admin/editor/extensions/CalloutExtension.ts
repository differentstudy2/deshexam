import { mergeAttributes, Node, ReactNodeViewRenderer } from '@tiptap/react';
import CalloutNodeView from '../components/CalloutNodeView';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (options?: { type?: string }) => ReturnType;
    }
  }
}

export const CalloutExtension = Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      type: { default: 'info' }, // 'info', 'warning', 'tip', 'important', 'example', 'definition', 'vocabulary'
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="callout"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'callout' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView)
  },

  addCommands() {
    return {
      setCallout: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options || {},
          content: [{ type: 'text', text: ' ' }],
        })
      },
    }
  },
})
