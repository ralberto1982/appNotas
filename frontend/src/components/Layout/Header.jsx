import { useState } from 'react';
import { Menu, Search, Sun, Moon, X, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ onToggleSidebar, searchQuery, onSearch, onAiOpen }) {
  const { dark, toggle } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-14 flex items-center px-4 gap-3
                       bg-white/80 dark:bg-[#1a1d27]/80 backdrop-blur-md
                       border-b border-gray-200 dark:border-gray-800
                       sticky top-0 z-20 flex-shrink-0">
      {/* Hamburger */}
      <button onClick={onToggleSidebar} className="btn-icon text-gray-500 dark:text-gray-400">
        <Menu size={20} />
      </button>

      {/* Brand (compact) */}
      <span className="font-display font-semibold text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
        AppNotas
      </span>

      <div className="flex-1" />

      {/* Search */}
      <div className={`flex items-center transition-all duration-300 ${searchOpen ? 'w-full sm:w-64' : 'w-auto'}`}>
        {searchOpen ? (
          <div className="flex items-center w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-1.5 gap-2">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
            <button
              onClick={() => { setSearchOpen(false); onSearch(''); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="btn-icon text-gray-500 dark:text-gray-400"
            data-tip="Buscar"
          >
            <Search size={18} />
          </button>
        )}
      </div>

      {/* AI button */}
      <button
        onClick={onAiOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                   bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        data-tip="Asistente IA"
      >
        <Sparkles size={15} />
        <span className="hidden sm:inline">IA</span>
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="btn-icon text-gray-500 dark:text-gray-400"
        data-tip={dark ? 'Modo claro' : 'Modo oscuro'}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
