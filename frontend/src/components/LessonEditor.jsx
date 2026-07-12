import { useRef, useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Code2, Quote, ImageIcon, Film, Paperclip, Youtube as YoutubeIcon,
  Undo2, Redo2, Loader2, AlignLeft, AlignCenter, AlignRight, X
} from 'lucide-react'
import api from '../api/client'

function humanFileSize(bytes) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++ }
  return `${size.toFixed(1)} ${units[i]}`
}

const SizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 'large',
        parseHTML: (el) => el.getAttribute('data-width') || 'large',
        renderHTML: (attrs) => ({
          'data-width': attrs.width,
          'data-align': attrs.align,
          class: `editor-img editor-img-${attrs.width} editor-img-${attrs.align || 'center'}`
        })
      },
      align: {
        default: 'center',
        parseHTML: (el) => el.getAttribute('data-align') || 'center',
        renderHTML: () => ({})
      }
    }
  }
})

export default function LessonEditor({ content, onChange }) {
  const imageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [, forceRerender] = useState(0)
  const editorRef = useRef(null)
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const uploadFile = useCallback(async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    try {
      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    } finally {
      setUploading(false)
    }
  }, [])

  const insertUploadedFile = useCallback(async (file, pos) => {
    const editor = editorRef.current
    if (!editor || !file) return
    try {
      const data = await uploadFile(file)
      const chain = () => editor.chain().focus()

      if (data.kind === 'image') {
        if (pos != null) {
          editor.chain().focus().insertContentAt(pos, { type: 'image', attrs: { src: data.url } }).run()
        } else {
          chain().setImage({ src: data.url }).run()
        }
        return
      }
      if (data.kind === 'video') {
        const html = `<video src="${data.url}" controls class="rounded-lg my-4 max-w-full"></video>`
        if (pos != null) editor.chain().focus().insertContentAt(pos, html).run()
        else chain().insertContent(html).run()
        return
      }
      const label = data.original_name || 'Download file'
      const sizeLabel = humanFileSize(data.size)
      const text = `📎 ${label}${sizeLabel ? `  ·  ${sizeLabel}` : ''}`
      const html = `<a href="${data.url}" target="_blank" rel="noopener noreferrer" class="attachment-card" download>${text}</a>`
      if (pos != null) editor.chain().focus().insertContentAt(pos, html).run()
      else chain().insertContent(html).run()
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message))
    }
  }, [uploadFile])

  const editor = useEditor({
    extensions: [
      StarterKit,
      SizableImage.configure({ HTMLAttributes: {} }),
      Link.configure({ openOnClick: false }),
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'rounded-xl my-4 max-w-full mx-auto block' } }),
      Placeholder.configure({
        placeholder: 'Paste your lecture/article here (from Word, Google Docs, etc.), or start typing. You can also drag & drop images/videos anywhere, or paste a screenshot directly.'
      })
    ],
    content: content || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: () => forceRerender((n) => n + 1),
    onTransaction: () => forceRerender((n) => n + 1),
    editorProps: {
      attributes: {
        class: 'lesson-content prose max-w-none min-h-[380px] px-6 py-5 focus:outline-none text-[15px] leading-relaxed',
        spellcheck: 'false',
        autocorrect: 'off',
        autocapitalize: 'off'
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false
        const files = event.dataTransfer?.files
        if (!files || !files.length) return false
        event.preventDefault()
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
        const pos = coords ? coords.pos : view.state.selection.from
        Array.from(files).forEach((file) => insertUploadedFile(file, pos))
        return true
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        const imageItem = Array.from(items).find((i) => i.type.startsWith('image/'))
        if (!imageItem) return false
        event.preventDefault()
        const file = imageItem.getAsFile()
        insertUploadedFile(file, view.state.selection.from)
        return true
      }
    }
  })

  useEffect(() => { editorRef.current = editor }, [editor])

  async function handleImageOrVideo(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    insertUploadedFile(file, null)
  }

  async function handleAnyFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    insertUploadedFile(file, null)
  }

  function openYoutubeModal() {
    setYoutubeUrl('')
    setYoutubeModalOpen(true)
  }

  function confirmYoutubeEmbed(e) {
    e?.preventDefault()
    const url = youtubeUrl.trim()
    setYoutubeModalOpen(false)
    if (!url || !editor) return
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  if (!editor) return null

  const Btn = ({ onClick, active, children, title, disabled }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
        active
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-brand-400 transition relative">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-3 py-2">
        <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </Btn>
        <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </Btn>
        <Btn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </Btn>
        <Btn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </Btn>
        <Btn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </Btn>
        <Btn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </Btn>
        <Btn title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 size={16} />
        </Btn>
        <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </Btn>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={16} />
        </Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={16} />
        </Btn>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        <Btn title="Insert image" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
          <ImageIcon size={16} />
        </Btn>
        <Btn title="Insert video file" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
          <Film size={16} />
        </Btn>
        <Btn title="Embed YouTube video" onClick={openYoutubeModal} disabled={uploading}>
          <YoutubeIcon size={16} />
        </Btn>
        <Btn title="Attach any file (PDF, slides, audio, zip...)" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Paperclip size={16} />
        </Btn>

        {uploading && (
          <span className="flex items-center gap-1 text-xs text-brand-600 ml-1">
            <Loader2 size={14} className="animate-spin" /> Uploading...
          </span>
        )}

        <span className="text-xs text-gray-400 ml-auto hidden sm:inline">
          Tip: drag & drop files, or paste a screenshot directly
        </span>

        <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageOrVideo} />
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleAnyFile} />
      </div>

      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor }) => editor.isActive('image')}
          tippyOptions={{ duration: 100 }}
        >
          <div className="flex items-center gap-1 bg-gray-900 text-white rounded-lg shadow-xl px-1.5 py-1">
            {['small', 'medium', 'large', 'full'].map((size) => (
              <button
                key={size}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().updateAttributes('image', { width: size }).run()}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  editor.getAttributes('image').width === size ? 'bg-brand-600' : 'hover:bg-white/10'
                }`}
              >
                {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'Full'}
              </button>
            ))}
            <span className="w-px h-4 bg-white/20 mx-0.5" />
            <button type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().updateAttributes('image', { align: 'left' }).run()}
              className={`p-1.5 rounded ${editor.getAttributes('image').align === 'left' ? 'bg-brand-600' : 'hover:bg-white/10'}`}>
              <AlignLeft size={13} />
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().updateAttributes('image', { align: 'center' }).run()}
              className={`p-1.5 rounded ${editor.getAttributes('image').align === 'center' ? 'bg-brand-600' : 'hover:bg-white/10'}`}>
              <AlignCenter size={13} />
            </button>
            <button type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().updateAttributes('image', { align: 'right' }).run()}
              className={`p-1.5 rounded ${editor.getAttributes('image').align === 'right' ? 'bg-brand-600' : 'hover:bg-white/10'}`}>
              <AlignRight size={13} />
            </button>
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      {youtubeModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setYoutubeModalOpen(false)}
        >
          <form
            onSubmit={confirmYoutubeEmbed}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <YoutubeIcon size={18} className="text-red-600" /> Embed a YouTube video
              </h3>
              <button type="button" onClick={() => setYoutubeModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <input
              autoFocus
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 mb-3"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setYoutubeModalOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white">
                Insert video
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
