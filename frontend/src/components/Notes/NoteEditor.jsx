import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { X, Save, FileDown, FileText, Palette, Check, Menu, Sparkles } from 'lucide-react';
import EditorToolbar from './EditorToolbar';
import AiPanel from './AiPanel';
import FontSize from '../../extensions/FontSize';
import { SlashCommands } from '../../extensions/SlashCommands';
import LineHeight from '../../extensions/LineHeight';
import { slashSuggestion } from '../../extensions/slashSuggestion';
import { exportToPDF, exportToWord } from '../../utils/exportUtils';
import { GRADIENTS } from '../../utils/gradients';
import api from '../../api/client';

const CANVAS_COLORS = [
  '#ffffff','#faf9f7','#f5f3ff',
  '#ede9fe','#ddd6fe','#c4b5fd','#a78bfa',
  '#e0e7ff','#c7d2fe','#bfdbfe',
  '#fce7f3','#fbcfe8','#f5d0fe','#e9d5ff',
  '#d1fae5','#a7f3d0',
  '#1a1d27','#0f1117','#1e1b4b',
];

export default function NoteEditor({ note, categories, onClose, onSave, onToggleSidebar }) {
  const [title, setTitle] = useState(note?.title || '');
  const [categoryId, setCategoryId] = useState(note?.category_id || '');
  const [gradientIdx, setGradientIdx] = useState(note?.gradient_index ?? Math.floor(Math.random() * 12));
  const [canvasColor, setCanvasColor] = useState(note?.canvas_color || '#ffffff');
  const [showCanvasPicker, setShowCanvasPicker] = useState(false);
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const autoSaveTimer = useRef(null);
  const savedTimer = useRef(null);
  const noteIdRef = useRef(note?.id || null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: "Escribe tu nota o usa '/' para comandos..." }),
      Link.configure({ openOnClick: false }),
      LineHeight,
      SlashCommands.configure({ suggestion: slashSuggestion }),
    ],
    content: note?.content || '',
    autofocus: !note,
    editorProps: {
      attributes: {
        spellcheck: 'true',
        lang: 'es',
      },
    },
  });

  // Refs para acceder a los valores actuales sin recrear handleSave
  const titleRef = useRef(title);
  const categoryIdRef = useRef(categoryId);
  const gradientIdxRef = useRef(gradientIdx);
  const canvasColorRef = useRef(canvasColor);
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { categoryIdRef.current = categoryId; }, [categoryId]);
  useEffect(() => { gradientIdxRef.current = gradientIdx; }, [gradientIdx]);
  useEffect(() => { canvasColorRef.current = canvasColor; }, [canvasColor]);

  const saveRef = useRef(null);
  saveRef.current = async (showIndicator = false) => {
    if (!editor) return;
    if (showIndicator) setSaving(true);
    const payload = {
      title: titleRef.current || 'Sin título',
      content: editor.getHTML(),
      category_id: categoryIdRef.current || null,
      gradient_index: gradientIdxRef.current,
      canvas_color: canvasColorRef.current,
    };
    try {
      if (noteIdRef.current) {
        await api.put(`/notes/${noteIdRef.current}`, payload);
      } else {
        const { data } = await api.post('/notes', payload);
        noteIdRef.current = data.id;
      }
      setSaved(true);
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2000);
    } finally {
      if (showIndicator) setSaving(false);
    }
  };

  const handleSave = useCallback(() => saveRef.current(true), []);

  /* Auto-save: escucha cambios del editor sin recrear el listener */
  useEffect(() => {
    if (!editor) return;
    const triggerSave = () => {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => saveRef.current(false), 2000);
    };
    editor.on('update', triggerSave);
    return () => {
      editor.off('update', triggerSave);
      clearTimeout(autoSaveTimer.current);
    };
  }, [editor]);

  /* Auto-save al cambiar metadatos (solo si la nota ya existe) */
  useEffect(() => {
    if (!noteIdRef.current) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveRef.current(false), 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [title, categoryId, gradientIdx, canvasColor]);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  /* Ctrl+S shortcut */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const handleSaveAndClose = async () => {
    await handleSave();
    onSave();
  };

  const handlePDF = async () => {
    if (!editor) return;
    setExporting(true);
    try { await exportToPDF(title || 'Sin título', editor.getHTML(), canvasColor); }
    finally { setExporting(false); }
  };

  const wordCount = editor
    ? editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in"
         style={{ backgroundColor: canvasColor }}>

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3
                      bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md
                      border-b border-gray-200 dark:border-gray-800 flex-shrink-0">

        <button onClick={onToggleSidebar} className="btn-icon text-gray-500" data-tip="Menú">
          <Menu size={18} />
        </button>

        <button onClick={onClose} className="btn-icon text-gray-500" data-tip="Cerrar">
          <X size={18} />
        </button>

        <input
          className="flex-1 bg-transparent text-base font-display font-semibold
                     outline-none placeholder-gray-300 dark:placeholder-gray-600
                     text-gray-900 dark:text-gray-100 min-w-0"
          placeholder="Título de la nota..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="text-xs rounded-lg border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-[#1a1d27] text-gray-600 dark:text-gray-300
                     px-2 py-1.5 outline-none focus:ring-2 focus:ring-accent/30
                     hidden sm:block"
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Gradient picker */}
        <div className="relative">
          <button
            onClick={() => { setShowGradientPicker((v) => !v); setShowCanvasPicker(false); }}
            data-tip="Color de tarjeta"
            className="btn-icon"
          >
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"
                 style={{ background: GRADIENTS[gradientIdx] }} />
          </button>
          {showGradientPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowGradientPicker(false)} />
              <div className="fixed z-50 mt-2 p-2 rounded-xl shadow-xl
                              bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-700
                              grid grid-cols-6 gap-1.5 w-44"
                   style={{ top: 56, right: 16 }}>
                {GRADIENTS.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => { setGradientIdx(i); setShowGradientPicker(false); }}
                    className={`w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform ${i === gradientIdx ? 'border-accent' : 'border-transparent'}`}
                    style={{ background: g }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Canvas color picker */}
        <div className="relative">
          <button
            onClick={() => { setShowCanvasPicker((v) => !v); setShowGradientPicker(false); }}
            data-tip="Color del lienzo"
            className="btn-icon"
          >
            <Palette size={17} className="text-gray-500" />
          </button>
          {showCanvasPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCanvasPicker(false)} />
              <div className="fixed z-50 mt-2 p-2 rounded-xl shadow-xl
                              bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-700
                              grid grid-cols-6 gap-1.5 w-44"
                   style={{ top: 56, right: 60 }}>
                {CANVAS_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCanvasColor(c); setShowCanvasPicker(false); }}
                    className={`w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform ${canvasColor === c ? 'border-accent' : 'border-gray-300 dark:border-gray-600'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <label className="col-span-2 flex items-center gap-1 text-xs text-gray-400 cursor-pointer px-1">
                  <input
                    type="color"
                    value={canvasColor}
                    className="w-5 h-5 rounded cursor-pointer border-0"
                    onChange={(e) => setCanvasColor(e.target.value)}
                  />
                  <span>otro</span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Export */}
        <button onClick={handlePDF} disabled={exporting} data-tip="Exportar PDF"
                className="hidden sm:flex btn-icon text-gray-500 hover:text-accent">
          {exporting
            ? <span className="w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin inline-block" />
            : <FileDown size={17} />}
        </button>
        <button onClick={() => exportToWord(title || 'Sin título', editor?.getHTML() || '')}
                data-tip="Exportar Word" className="hidden sm:flex btn-icon text-gray-500 hover:text-blue-500">
          <FileText size={17} />
        </button>

        {/* Save */}
        <button onClick={handleSaveAndClose} disabled={saving}
                className="btn-primary flex items-center gap-1.5 text-sm">
          {saving
            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
            : saved
            ? <><Check size={15} /> Guardado</>
            : <><Save size={15} /> Guardar</>}
        </button>
      </div>

      {/* Toolbar */}
      <EditorToolbar editor={editor} onAiOpen={() => setAiOpen((v) => !v)} />

      {/* Canvas + AI panel */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Floating AI button */}
        <button
          onClick={() => setAiOpen((v) => !v)}
          data-tip="Asistente IA"
          className={`absolute top-4 left-4 z-30 w-fit h-fit flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg
                      transition-all duration-200 hover:scale-105 active:scale-95
                      ${aiOpen
                        ? 'bg-accent text-white shadow-accent/30'
                        : 'bg-white dark:bg-[#1a1d27] text-accent border border-accent/30 shadow-black/10 hover:shadow-accent/20'}`}
        >
          <Sparkles size={17} />
          <span className="text-sm font-semibold">IA</span>
        </button>

        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: canvasColor }}>
          <div className="max-w-3xl mx-auto min-h-full canvas-content-area">
            <EditorContent editor={editor} className="prose-custom min-h-[calc(100vh-180px)]" />
          </div>
        </div>

        {aiOpen && (
          <AiPanel
            editor={editor}
            onClose={() => setAiOpen(false)}
            onInsert={(text) => editor?.chain().focus().insertContentAt(editor.state.doc.content.size, '\n' + text).run()}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 py-2 text-xs text-gray-400
                      bg-white/60 dark:bg-[#1a1d27]/60 backdrop-blur-sm
                      border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        <span>{wordCount} palabras</span>
        <span className="hidden sm:flex items-center gap-1.5">
          {saving
            ? <><span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />Guardando...</>
            : saved
            ? <span className="text-green-500">✓ Guardado</span>
            : <span>Ctrl + S para guardar</span>}
        </span>
        {note?.updated_at && (
          <span>
            Guardado:{' '}
            {new Date(note.updated_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
