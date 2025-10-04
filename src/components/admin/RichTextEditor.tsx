'use client'

import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  Undo,
  Heading,
  Link,
  List,
  BlockQuote,
  Table,
  TableToolbar,
  Code,
  Strikethrough,
  Underline,
  RemoveFormat,
  Alignment,
  Indent,
  IndentBlock,
  HorizontalLine,
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'

interface RichTextEditorProps {
  value: string
  onChange: (data: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="rich-text-editor border border-input rounded-md overflow-hidden">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData()
          onChange(data)
        }}
        config={{
          licenseKey: 'GPL',
          toolbar: {
            items: [
              'undo', 'redo',
              '|',
              'heading',
              '|',
              'bold', 'italic', 'underline', 'strikethrough',
              '|',
              'alignment',
              '|',
              'numberedList', 'bulletedList',
              '|',
              'outdent', 'indent',
              '|',
              'link', 'blockQuote', 'insertTable',
              '|',
              'code',
              '|',
              'horizontalLine',
              '|',
              'removeFormat'
            ],
            shouldNotGroupWhenFull: true
          },
          plugins: [
            Bold,
            Essentials,
            Italic,
            Paragraph,
            Undo,
            Heading,
            Link,
            List,
            BlockQuote,
            Table,
            TableToolbar,
            Code,
            Strikethrough,
            Underline,
            RemoveFormat,
            Alignment,
            Indent,
            IndentBlock,
            HorizontalLine,
          ],
          heading: {
            options: [
              { model: 'paragraph', title: 'فقرة', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'عنوان 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'عنوان 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'عنوان 3', class: 'ck-heading_heading3' },
            ]
          },
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCells'
            ]
          },
          link: {
            decorators: {
              openInNewTab: {
                mode: 'manual',
                label: 'فتح في تبويب جديد',
                attributes: {
                  target: '_blank',
                  rel: 'noopener noreferrer'
                }
              }
            }
          },
          placeholder: placeholder || 'اكتب محتوى الصفحة هنا...',
          language: 'ar',
        }}
      />
    </div>
  )
}
