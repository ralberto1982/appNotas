import { Plus, StickyNote } from 'lucide-react';
import NoteCard from './NoteCard';

export default function NotesList({ notes, loading, onEdit, onDelete, onNewNote }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
            <div className="h-28 bg-gray-200 dark:bg-gray-800" />
            <div className="bg-white dark:bg-[#1a1d27] border border-t-0 border-gray-200 dark:border-gray-800 rounded-b-2xl p-4 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
          <StickyNote size={36} className="text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="font-display text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Sin notas aquí
        </h3>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">
          Crea tu primera nota y empieza a organizar tus ideas.
        </p>
        <button onClick={onNewNote} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nueva nota
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Create new card */}
      <button
        onClick={onNewNote}
        className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700
                   hover:border-accent dark:hover:border-accent
                   flex flex-col items-center justify-center gap-2 py-12
                   text-gray-400 dark:text-gray-500 hover:text-accent
                   transition-all duration-200 group min-h-[168px]"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-accent/10
                        flex items-center justify-center transition-colors">
          <Plus size={20} />
        </div>
        <span className="text-sm font-medium">Nueva nota</span>
      </button>

      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
