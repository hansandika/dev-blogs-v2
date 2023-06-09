import { EditorContent } from '@tiptap/react';
import { FC, useEffect } from 'react';
import useEditorConfig from '../../hooks/useEditorConfig';
import ActionButton from './ActionButton';
import { getFocusedEditor } from '../editor/EditorUtils';

interface Props {
  title?: string;
  onSubmit?(content: string): void;
  busy?: boolean;
  onClose?(): void;
  initialState?: string;
  visible?: boolean;
}

const CommentForm: FC<Props> = ({ title, onSubmit, busy = false, visible = true, initialState, onClose }): JSX.Element | null => {

  const { editor } = useEditorConfig({ placeholder: 'Add your comment...' })

  const handleSubmit = () => {
    if (editor && !busy) {
      const content = editor?.getHTML()
      if (content === '<p></p>') return

      onSubmit && onSubmit(content)
    }
  }

  useEffect(() => {
    if (typeof (initialState) === 'string' && editor) {
      getFocusedEditor(editor).setContent(initialState).run()
    }
  }, [initialState, editor])

  if (!visible) return null

  return <div>
    {title && <h1 className='py-3 text-xl font-semibold text-primary-dark dark:text-primary'>{title}</h1>}
    <EditorContent className='min-h-[200px] border-2 border-secondary-dark rounded p-2' editor={editor} />
    <div className="justify-end py-3 md:flex">
      <div className="flex space-x-4">
        <ActionButton title='Submit' onClick={handleSubmit} busy={busy} />

        {onClose && <button className='text-primary-dark dark:text-primary' onClick={onClose}>Close</button>}
      </div>
    </div>
  </div>;
};

export default CommentForm;