import { useState } from 'react';
import { Pencil, Trash2, FileDown, FileText } from 'lucide-react';
import { GRADIENTS, stripHtml } from '../../utils/gradients';
import { exportToPDF, exportToWord } from '../../utils/exportUtils';

export default function NoteCard({ note, onEdit, onDelete }) {
  const [exporting, setExporting] = useState(false);

  const gradient = GRADIENTS[note.gradient_index % GRADIENTS.length];

  const preview = stripHtml(note.content).slice(0, 120);
  const date = new Date(note.updated_at).toLocaleDateString('es', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const handlePDF = async (e) => {
    e.stopPropagation();
    setExporting(true);
    try { await exportToPDF(note.title, note.content, note.canvas_color); }
    finally { setExporting(false); }
  };

  const handleWord = (e) => {
    e.stopPropagation();
    exportToWord(note.title, note.content);
  };

  return (
    <article
      onClick={() => onEdit(note)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer
                 shadow-sm hover:shadow-xl transition-all duration-300
                 hover:-translate-y-1 animate-scale-in"
    >
      {/* Gradient header */}
      <div
        className="h-28 p-4 flex flex-col justify-between"
        style={{ background: gradient }}
      >
        {/* Category badge */}
        {note.category_name && (
          <span className="self-start text-xs font-medium px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm">
            {note.category_name}
          </span>
        )}
        {/* Title */}
        <h3 className="font-display text-white font-semibold text-base leading-tight line-clamp-2 mt-auto drop-shadow">
          {note.title || 'Sin título'}
        </h3>
      </div>

      {/* Content preview */}
      <div className="bg-white dark:bg-[#1a1d27] p-4 border border-t-0 border-gray-200 dark:border-gray-800 rounded-b-2xl">
        {preview ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
            {preview}
          </p>
        ) : (
          <p className="text-sm text-gray-300 dark:text-gray-600 italic">Sin contenido</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">{date}</span>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePDF}
              disabled={exporting}
              data-tip="Exportar PDF"
              className="btn-icon text-gray-400 hover:text-accent"
            >
              {exporting
                ? <span className="w-3.5 h-3.5 border-2 border-accent/40 border-t-accent rounded-full animate-spin inline-block" />
                : <FileDown size={14} />}
            </button>
            <button
              onClick={handleWord}
              data-tip="Exportar Word"
              className="btn-icon text-gray-400 hover:text-blue-500"
            >
              <FileText size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(note); }}
              data-tip="Editar"
              className="btn-icon text-gray-400 hover:text-accent"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              data-tip="Eliminar"
              className="btn-icon text-gray-400 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
