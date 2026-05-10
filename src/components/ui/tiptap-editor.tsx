"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useCallback } from "react";
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon, AlignLeft, AlignCenter,
  AlignRight, Undo, Redo, RemoveFormatting,
} from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const btnCls = (active?: boolean) =>
  `p-1.5 rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`;

export function TiptapEditor({ value, onChange, placeholder = "Write your blog post…" }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: "bg-muted text-primary font-mono text-sm p-4 rounded-xl overflow-x-auto" } } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline underline-offset-4" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[400px] outline-none prose prose-sm prose-neutral dark:prose-invert max-w-none px-4 py-3 prose-headings:font-extrabold prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground prose-code:text-primary prose-code:bg-primary/8 prose-code:px-1 prose-code:rounded",
      },
    },
  });

  // Sync external value changes (e.g. when loading a post to edit)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const words = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/40">

        {/* History */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-border mr-1">
          <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btnCls()} title="Undo"><Undo className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btnCls()} title="Redo"><Redo className="h-4 w-4" /></button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-border mr-1">
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnCls(editor.isActive("heading", { level: 1 }))} title="Heading 1"><Heading1 className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnCls(editor.isActive("heading", { level: 2 }))} title="Heading 2"><Heading2 className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnCls(editor.isActive("heading", { level: 3 }))} title="Heading 3"><Heading3 className="h-4 w-4" /></button>
        </div>

        {/* Inline formatting */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-border mr-1">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnCls(editor.isActive("bold"))} title="Bold"><Bold className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnCls(editor.isActive("italic"))} title="Italic"><Italic className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnCls(editor.isActive("underline"))} title="Underline"><UnderlineIcon className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnCls(editor.isActive("strike"))} title="Strikethrough"><Strikethrough className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={btnCls(editor.isActive("code"))} title="Inline code"><Code className="h-4 w-4" /></button>
        </div>

        {/* Lists + quote */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-border mr-1">
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnCls(editor.isActive("bulletList"))} title="Bullet list"><List className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnCls(editor.isActive("orderedList"))} title="Numbered list"><ListOrdered className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnCls(editor.isActive("blockquote"))} title="Blockquote"><Quote className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnCls()} title="Divider"><Minus className="h-4 w-4" /></button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-border mr-1">
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btnCls(editor.isActive({ textAlign: "left" }))} title="Align left"><AlignLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btnCls(editor.isActive({ textAlign: "center" }))} title="Align center"><AlignCenter className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btnCls(editor.isActive({ textAlign: "right" }))} title="Align right"><AlignRight className="h-4 w-4" /></button>
        </div>

        {/* Link + clear */}
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={setLink} className={btnCls(editor.isActive("link"))} title="Insert link"><LinkIcon className="h-4 w-4" /></button>
          <button type="button" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} className={btnCls()} title="Clear formatting"><RemoveFormatting className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-muted/20 flex justify-end">
        <span className="text-xs text-muted-foreground">{words} words</span>
      </div>
    </div>
  );
}
