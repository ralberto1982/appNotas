import { useState, useRef } from 'react';
import { useEditorState } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Minus,
  Link, Undo2, Redo2, Highlighter, Palette, Type, AlignVerticalJustifyStart, Sparkles,
} from 'lucide-react';

const FONTS = [
  { label: 'DM Sans', value: 'DM Sans, sans-serif' },
  { label: 'Lora', value: 'Lora, Georgia, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
];

const SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const LINE_HEIGHTS = [
  { label: 'Compacto', value: '1.2' },
  { label: 'Normal',   value: '1.5' },
  { label: 'Relajado', value: '1.8' },
  { label: 'Amplio',   value: '2.2' },
  { label: 'Doble',    value: '2.5' },
];

const COLORS = [
  '#000000','#374151','#6b7280','#9ca3af',
  '#dc2626','#ef4444','#f97316','#f59e0b',
  '#eab308','#84cc16','#22c55e','#10b981',
  '#14b8a6','#06b6d4','#3b82f6','#6366f1',
  '#8b5cf6','#a855f7','#ec4899','#f43f5e',
  '#00c9a7','#ffffff',
];

const HIGHLIGHTS = [
  '#fef08a','#bbf7d0','#bfdbfe','#fde68a',
  '#fca5a5','#e9d5ff','#fbcfe8','#a5f3fc',
];

function Divider() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />;
}

function ToolBtn({ onClick, active, disabled, tip, children }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
      disabled={disabled}
      data-tip={tip}
      className={`toolbar-btn ${active ? 'is-active' : ''}`}
    >
      {children}
    </button>
  );
}

function ColorPicker({ colors, onPick, onReset, label, Icon, activeColor }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  const handleOpen = (e) => {
    e.preventDefault();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((v) => !v);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onMouseDown={handleOpen}
        data-tip={label}
        className="toolbar-btn flex flex-col items-center gap-0.5 px-2"
      >
        <Icon size={14} />
        <span
          className="h-[3px] w-4 rounded-full transition-colors duration-150"
          style={{ backgroundColor: activeColor || '#1a1a2e' }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onMouseDown={() => setOpen(false)} />
          <div
            className="fixed p-3 rounded-xl shadow-xl
                       bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-700
                       z-50 w-52"
            style={{ top: pos.top, left: pos.left }}
          >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {label}
          </p>

          {/* Full color picker */}
          <div className="flex items-center gap-3 mb-3">
            <input
              type="color"
              value={activeColor || '#000000'}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-600 p-0.5"
              onChange={(e) => onPick(e.target.value)}
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Elige cualquier color</p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{activeColor || '#000000'}</p>
            </div>
          </div>

          {/* Quick preset palette */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            {colors.map((c) => (
              <button
                key={c}
                onMouseDown={(e) => { e.preventDefault(); onPick(c); setOpen(false); }}
                title={c}
                className={`w-5 h-5 rounded-md border hover:scale-110 transition-transform
                            ${activeColor === c
                              ? 'border-accent shadow-[0_0_0_2px] shadow-accent/40'
                              : 'border-gray-200 dark:border-gray-600'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {onReset && (
            <button
              onMouseDown={(e) => { e.preventDefault(); onReset(); setOpen(false); }}
              className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors pt-2 border-t border-gray-100 dark:border-gray-700 text-center"
            >
              Quitar color
            </button>
          )}
          </div>
        </>
      )}
    </div>
  );
}

export default function EditorToolbar({ editor, onAiOpen }) {
  // Re-renderiza el toolbar en cada cambio de selección o formato
  useEditorState({
    editor,
    selector: (ctx) => ({
      isBold:      ctx.editor.isActive('bold'),
      isItalic:    ctx.editor.isActive('italic'),
      isUnderline: ctx.editor.isActive('underline'),
      isStrike:    ctx.editor.isActive('strike'),
      isCode:      ctx.editor.isActive('code'),
      isBullet:    ctx.editor.isActive('bulletList'),
      isOrdered:   ctx.editor.isActive('orderedList'),
      isBlockquote:ctx.editor.isActive('blockquote'),
      isLink:      ctx.editor.isActive('link'),
      canUndo:     ctx.editor.can().undo(),
      canRedo:     ctx.editor.can().redo(),
      textColor:   ctx.editor.getAttributes('textStyle').color,
      hlColor:     ctx.editor.getAttributes('highlight').color,
      h1:          ctx.editor.isActive('heading', { level: 1 }),
      h2:          ctx.editor.isActive('heading', { level: 2 }),
      h3:          ctx.editor.isActive('heading', { level: 3 }),
    }),
  });

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = prompt('URL del enlace:', prev || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex items-center gap-0.5 px-3 py-2
                    overflow-x-auto overflow-y-visible scrollbar-hide
                    border-b border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-[#161820]">

      {/* Undo / Redo */}
      <ToolBtn tip="Deshacer" onClick={() => editor.chain().focus().undo().run()}
               disabled={!editor.can().undo()}>
        <Undo2 size={15} />
      </ToolBtn>
      <ToolBtn tip="Rehacer" onClick={() => editor.chain().focus().redo().run()}
               disabled={!editor.can().redo()}>
        <Redo2 size={15} />
      </ToolBtn>

      <Divider />

      {/* Headings */}
      {[1, 2, 3].map((level) => (
        <ToolBtn
          key={level}
          tip={`Título ${level}`}
          active={editor.isActive('heading', { level })}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        >
          <span className="font-bold text-xs">H{level}</span>
        </ToolBtn>
      ))}

      <Divider />

      {/* Inline format */}
      <ToolBtn tip="Negrita" active={editor.isActive('bold')}
               onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={15} />
      </ToolBtn>
      <ToolBtn tip="Cursiva" active={editor.isActive('italic')}
               onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={15} />
      </ToolBtn>
      <ToolBtn tip="Subrayado" active={editor.isActive('underline')}
               onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline size={15} />
      </ToolBtn>
      <ToolBtn tip="Tachado" active={editor.isActive('strike')}
               onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={15} />
      </ToolBtn>

      <Divider />

      {/* Text color */}
      <ColorPicker
        colors={COLORS}
        label="Color de texto"
        Icon={Type}
        activeColor={editor.getAttributes('textStyle').color || '#1a1a2e'}
        onPick={(c) => editor.chain().focus().setColor(c).run()}
        onReset={() => editor.chain().focus().unsetColor().run()}
      />

      {/* Highlight */}
      <ColorPicker
        colors={HIGHLIGHTS}
        label="Resaltado"
        Icon={Highlighter}
        activeColor={editor.getAttributes('highlight').color || null}
        onPick={(c) => editor.chain().focus().setHighlight({ color: c }).run()}
        onReset={() => editor.chain().focus().unsetHighlight().run()}
      />

      <Divider />

      {/* Font family */}
      <select
        className="text-xs rounded-lg border border-gray-200 dark:border-gray-700
                   bg-white dark:bg-[#1a1d27] text-gray-700 dark:text-gray-300
                   px-2 py-1 outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
        onChange={(e) =>
          editor.chain().focus().setFontFamily(e.target.value).run()
        }
        defaultValue=""
      >
        <option value="" disabled>Fuente</option>
        {FONTS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* Font size */}
      <select
        className="text-xs rounded-lg border border-gray-200 dark:border-gray-700
                   bg-white dark:bg-[#1a1d27] text-gray-700 dark:text-gray-300
                   px-2 py-1 outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer w-16"
        onChange={(e) =>
          editor.chain().focus().setFontSize(e.target.value).run()
        }
        defaultValue=""
      >
        <option value="" disabled>pt</option>
        {SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Line height */}
      <div className="relative flex items-center" data-tip="Interlineado">
        <AlignVerticalJustifyStart size={14} className="text-gray-500 dark:text-gray-400 pointer-events-none absolute left-2" />
        <select
          className="text-xs rounded-lg border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-[#1a1d27] text-gray-700 dark:text-gray-300
                     pl-7 pr-2 py-1 outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer w-28"
          defaultValue="1.8"
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'reset') editor.chain().focus().unsetLineHeight().run();
            else editor.chain().focus().setLineHeight(val).run();
          }}
        >
          {LINE_HEIGHTS.map((lh) => (
            <option key={lh.value} value={lh.value}>{lh.label}</option>
          ))}
          <option value="reset">— Por defecto</option>
        </select>
      </div>

      <Divider />

      {/* Alignment */}
      <ToolBtn tip="Izquierda" active={editor.isActive({ textAlign: 'left' })}
               onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft size={15} />
      </ToolBtn>
      <ToolBtn tip="Centro" active={editor.isActive({ textAlign: 'center' })}
               onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter size={15} />
      </ToolBtn>
      <ToolBtn tip="Derecha" active={editor.isActive({ textAlign: 'right' })}
               onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight size={15} />
      </ToolBtn>
      <ToolBtn tip="Justificado" active={editor.isActive({ textAlign: 'justify' })}
               onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
        <AlignJustify size={15} />
      </ToolBtn>

      <Divider />

      {/* Lists */}
      <ToolBtn tip="Lista" active={editor.isActive('bulletList')}
               onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={15} />
      </ToolBtn>
      <ToolBtn tip="Lista numerada" active={editor.isActive('orderedList')}
               onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={15} />
      </ToolBtn>
      <ToolBtn tip="Cita" active={editor.isActive('blockquote')}
               onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={15} />
      </ToolBtn>
      <ToolBtn tip="Código" active={editor.isActive('code')}
               onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={15} />
      </ToolBtn>
      <ToolBtn tip="Línea horizontal"
               onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={15} />
      </ToolBtn>
      <ToolBtn tip="Enlace" active={editor.isActive('link')} onClick={setLink}>
        <Link size={15} />
      </ToolBtn>

    </div>
  );
}
