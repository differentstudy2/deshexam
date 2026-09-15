import { mergeAttributes, Node, ReactNodeViewRenderer } from '@tiptap/react';
import AssessmentNodeView from '../components/AssessmentNodeView';

export interface AssessmentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    assessment: {
      setAssessment: (options?: { type?: string }) => ReturnType;
    }
  }
}

export const AssessmentExtension = Node.create<AssessmentOptions>({
  name: 'assessment',
  group: 'block',
  content: 'block+',
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      type: { default: 'mcq' }, // 'mcq', 'exercise', 'practice'
      options: { default: [] }, // Array of options if it's an MCQ
      correctAnswer: { default: null }, // Index of the correct answer
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="assessment"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'assessment' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AssessmentNodeView)
  },

  addCommands() {
    return {
      setAssessment: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options || {},
          content: [{ type: 'paragraph' }], // Require at least one paragraph inside
        })
      },
    }
  },
})
