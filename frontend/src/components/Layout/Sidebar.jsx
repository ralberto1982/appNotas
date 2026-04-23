import { useState, useRef } from 'react';
import {
  BookOpen, Plus, FileText, FolderPlus, Trash2, Pencil, Check,
  ChevronDown, ChevronRight, LogOut, X, StickyNote,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';

export default function Sidebar({
  open, categories, notes = [], selectedCategory, onSelectCategory,
  onNewNote, onEditNote, onCategoriesChange,
}) {
  const { user, logout } = useAuth();
  const [catOpen, setCatOpen] = useState(true);
  const [expandedCats, setExpandedCats] = useState({});
  const [addingCat, setAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const editInputRef = useRef(null);

  const toggleCatNotes = (id) =>
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#00c9a7');

  const CAT_COLORS = [
    '#00c9a7','#f093fb','#4facfe','#43e97b',
    '#fa709a','#667eea','#f6d365','#a18cd1',
  ];

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await api.post('/categories', { name: newCatName.trim(), color: newCatColor });
    setNewCatName('');
    setAddingCat(false);
    onCategoriesChange();
  };

  const startEditCat = (e, cat) => {
    e.stopPropagation();
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
    setTimeout(() => editInputRef.current?.select(), 50);
  };

  const handleRenameCat = async (e, id) => {
    e?.preventDefault();
    if (!editingCatName.trim()) return;
    await api.put(`/categories/${id}`, { name: editingCatName.trim(), color: categories.find(c => c.id === id)?.color });
    setEditingCatId(null);
    onCategoriesChange();
  };

  const handleDeleteCat = async (e, id) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta categoría? Las notas no se borrarán.')) return;
    await api.delete(`/categories/${id}`);
    if (selectedCategory === String(id)) onSelectCategory(null);
    onCategoriesChange();
  };

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => {}}
        />
      )}

      <aside
        className={`
          ${open ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0'}
          flex-shrink-0 h-full flex flex-col
          bg-white dark:bg-[#1a1d27]
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 overflow-hidden z-40
          fixed lg:relative
        `}
      >
        <div className="flex flex-col h-full min-w-[256px]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-base tracking-tight">AppNotas</span>
          </div>

          {/* New note button */}
          <div className="px-4 py-4">
            <button onClick={onNewNote} className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus size={16} />
              Nueva nota
            </button>
          </div>

          {/* Nav */}
          <nav className="px-3 space-y-0.5">
            <button
              className={`sidebar-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => onSelectCategory(null)}
            >
              <FileText size={16} />
              Todas las notas
            </button>
          </nav>

          <div className="flex-1 overflow-y-auto px-3 mt-4">
            {/* Categories header */}
            <button
              className="flex items-center justify-between w-full px-2 py-1.5 mb-1"
              onClick={() => setCatOpen((v) => !v)}
            >
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Categorías
              </span>
              {catOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            </button>

            {catOpen && (
              <div className="space-y-0.5 animate-fade-in">
                {categories.map((cat) => {
                  const catNotes = notes.filter((n) => n.category_id === cat.id);
                  const isExpanded = expandedCats[cat.id] ?? true;
                  return (
                    <div key={cat.id}>
                      <div className={`sidebar-item group ${selectedCategory === String(cat.id) ? 'active' : ''}`}>
                        <button
                          onClick={() => toggleCatNotes(cat.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </button>

                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />

                        {editingCatId === cat.id ? (
                          <form
                            onSubmit={(e) => handleRenameCat(e, cat.id)}
                            className="flex items-center gap-1 flex-1 min-w-0"
                          >
                            <input
                              ref={editInputRef}
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              onBlur={(e) => handleRenameCat(e, cat.id)}
                              onKeyDown={(e) => e.key === 'Escape' && setEditingCatId(null)}
                              className="flex-1 min-w-0 bg-transparent border-b border-accent outline-none text-sm py-0.5"
                              autoFocus
                            />
                            <button type="submit" className="p-0.5 text-accent flex-shrink-0">
                              <Check size={12} />
                            </button>
                          </form>
                        ) : (
                          <button
                            className="flex items-center gap-1 flex-1 min-w-0 text-left"
                            onClick={() => onSelectCategory(String(cat.id))}
                          >
                            <span className="flex-1 truncate">{cat.name}</span>
                            {catNotes.length > 0 && (
                              <span className="text-[10px] text-gray-400 tabular-nums flex-shrink-0">
                                {catNotes.length}
                              </span>
                            )}
                          </button>
                        )}

                        {editingCatId !== cat.id && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                            <button
                              onClick={(e) => startEditCat(e, cat)}
                              className="p-0.5 hover:text-accent"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteCat(e, cat.id)}
                              className="p-0.5 hover:text-red-500"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {isExpanded && catNotes.length > 0 && (
                        <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2 space-y-0.5 mb-1">
                          {catNotes.map((note) => (
                            <button
                              key={note.id}
                              onClick={() => onEditNote(note)}
                              className="sidebar-item text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 w-full"
                            >
                              <StickyNote size={12} className="flex-shrink-0 opacity-60" />
                              <span className="truncate flex-1 text-left">{note.title || 'Sin título'}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Notes without category */}
                {(() => {
                  const uncategorized = notes.filter((n) => !n.category_id);
                  if (!uncategorized.length) return null;
                  return (
                  <div className="mt-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
                      Sin categoría
                    </p>
                    <div className="space-y-0.5">
                      {uncategorized.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => onEditNote(note)}
                          className="sidebar-item text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 w-full"
                        >
                          <StickyNote size={12} className="flex-shrink-0 opacity-60" />
                          <span className="truncate flex-1 text-left">{note.title || 'Sin título'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  );
                })()}

                {/* Add category */}
                {addingCat ? (
                  <form onSubmit={handleAddCategory} className="pt-1 pb-2 space-y-2">
                    <input
                      autoFocus
                      className="input-field text-xs py-2"
                      placeholder="Nombre de categoría"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                    />
                    <div className="flex gap-1.5 flex-wrap px-1">
                      {CAT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewCatColor(c)}
                          className="w-5 h-5 rounded-full border-2 transition-all"
                          style={{
                            backgroundColor: c,
                            borderColor: newCatColor === c ? '#fff' : 'transparent',
                            boxShadow: newCatColor === c ? `0 0 0 2px ${c}` : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary text-xs py-1.5 flex-1">
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingCat(false)}
                        className="btn-ghost text-xs py-1.5"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingCat(true)}
                    className="sidebar-item text-gray-400 dark:text-gray-500 mt-1"
                  >
                    <FolderPlus size={15} />
                    Nueva categoría
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User footer */}
          <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-500
                              flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                data-tip="Cerrar sesión"
                className="btn-icon text-gray-400 hover:text-red-500"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
