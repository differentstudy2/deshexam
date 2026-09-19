import { mergeAttributes, Node, ReactNodeViewRenderer } from '@tiptap/react';
import MediaNodeView from '../components/MediaNodeView';

export interface MediaOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    media: {
      setMedia: (options: { src: string, type: 'image' | 'video' | 'audio' | 'youtube' | 'pdf', caption?: string, width?: string }) => ReturnType;
    }
  }
}

export const MediaExtension = Node.create<MediaOptions>({
  name: 'media',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: { default: null },
      type: { default: 'image' },
      caption: { default: '' },
      width: { default: '100%' },
      align: { default: 'center' }, // 'left', 'center', 'right'
    }
  },

  parseHTML() {
    return [
      { tag: 'img[src]:not([data-type])', getAttrs: el => ({ src: el.getAttribute('src'), type: 'image', width: el.getAttribute('width') || '100%' }) },
      { tag: 'video[src]', getAttrs: el => ({ src: el.getAttribute('src'), type: 'video', width: el.getAttribute('width') || '100%' }) },
      { tag: 'audio[src]', getAttrs: el => ({ src: el.getAttribute('src'), type: 'audio' }) },
      { tag: 'iframe[src*="youtube"]', getAttrs: el => ({ src: el.getAttribute('src'), type: 'youtube', width: el.getAttribute('width') || '100%' }) },
      { tag: 'div[data-type="media"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'media' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaNodeView)
  },

  addCommands() {
    return {
      setMedia: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})
