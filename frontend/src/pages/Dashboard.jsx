import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import NotesList from '../components/Notes/NotesList';
import NoteEditor from '../components/Notes/NoteEditor';
import api from '../api/client';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      const { data } = await api.get('/notes', { params });
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const openNew = () => { setEditingNote(null); setEditorOpen(true); };
  const openEdit = (note) => { setEditingNote(note); setEditorOpen(true); };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingNote(null);
    fetchNotes();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    await api.delete(`/notes/${id}`);
    fetchNotes();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0f1117]">
      <Sidebar
        open={sidebarOpen}
        categories={categories}
        notes={notes}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onNewNote={openNew}
        onEditNote={openEdit}
        onCategoriesChange={fetchCategories}
      />

      {!editorOpen && (
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />

          <main className="flex-1 overflow-y-auto p-5 lg:p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-xl font-bold">
                  {selectedCategory
                    ? categories.find((c) => String(c.id) === selectedCategory)?.name ?? 'Notas'
                    : 'Todas las notas'}
                </h1>
                {!loading && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
                    {searchQuery && ` para "${searchQuery}"`}
                  </p>
                )}
              </div>
            </div>

            <NotesList
              notes={notes}
              loading={loading}
              onEdit={openEdit}
              onDelete={handleDelete}
              onNewNote={openNew}
            />
          </main>
        </div>
      )}

      {editorOpen && (
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <NoteEditor
            note={editingNote}
            categories={categories}
            onClose={closeEditor}
            onSave={closeEditor}
          />
        </div>
      )}
    </div>
  );
}
