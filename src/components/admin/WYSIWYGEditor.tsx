import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Undo, Redo,
  Heading1, Heading2, Heading3, Quote, Code,
  AlignLeft, AlignCenter, AlignRight, Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WYSIWYGEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
}

const WYSIWYGEditor = ({ content, onChange, className, placeholder }: WYSIWYGEditorProps) => {
  const [fontColor, setFontColor] = useState('#1f2937');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[260px] p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>', { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('URL du lien:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('URL de l\'image:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setImageWidth = (width: string) => {
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { style: `width:${width};height:auto;` }).run();
    }
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn('h-8 w-8 p-0', isActive && 'bg-muted text-primary')}
    >
      {children}
    </Button>
  );

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b border-border">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Gras"><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italique"><Italic className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Barré"><Strikethrough className="h-4 w-4" /></ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Aligner à gauche"><AlignLeft className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Centrer"><AlignCenter className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Aligner à droite"><AlignRight className="h-4 w-4" /></ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Titre 1"><Heading1 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Titre 2"><Heading2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Titre 3"><Heading3 className="h-4 w-4" /></ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Liste à puces"><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Liste numérotée"><ListOrdered className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Citation"><Quote className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code"><Code className="h-4 w-4" /></ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1 px-1">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <input
            type="color"
            value={fontColor}
            onChange={(e) => {
              const nextColor = e.target.value;
              setFontColor(nextColor);
              editor.chain().focus().setColor(nextColor).run();
            }}
            className="h-7 w-8 cursor-pointer border border-border rounded bg-background"
            title="Couleur du texte"
          />
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => editor.chain().focus().unsetColor().run()}>
            Reset
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Ajouter un lien"><LinkIcon className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={addImage} title="Ajouter une image"><ImageIcon className="h-4 w-4" /></ToolbarButton>

        {editor.isActive('image') && (
          <>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setImageWidth('25%')}>25%</Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setImageWidth('50%')}>50%</Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setImageWidth('75%')}>75%</Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setImageWidth('100%')}>100%</Button>
          </>
        )}

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler"><Undo className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir"><Redo className="h-4 w-4" /></ToolbarButton>
      </div>

      <EditorContent editor={editor} />
      {placeholder && !editor.getText().trim() && (
        <div className="px-4 pb-3 text-xs text-muted-foreground">{placeholder}</div>
      )}
    </div>
  );
};

export default WYSIWYGEditor;

