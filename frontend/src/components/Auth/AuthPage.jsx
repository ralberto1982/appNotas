import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f1117] flex-col justify-between p-14">
        {/* Decorative orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-30"
             style={{ background: 'radial-gradient(circle,#00c9a7,transparent 70%)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle,#a18cd1,transparent 70%)' }} />
        <div className="absolute top-[40%] right-[5%] w-40 h-40 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle,#4facfe,transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-display text-xl text-white font-semibold tracking-tight">AppNotas</span>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-accent text-sm font-medium">
            <Sparkles size={15} />
            <span>Editor de texto enriquecido</span>
          </div>
          <h2 className="font-display text-4xl text-white font-bold leading-tight">
            Tus ideas,<br />
            <span className="text-accent">perfectamente</span><br />
            organizadas.
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-xs">
            Escribe, organiza y exporta tus notas con un editor potente y una interfaz elegante.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['Categorías', 'PDF & Word', 'Búsqueda', 'Modo oscuro'].map((f) => (
              <span key={f}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-300">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom note previews (decorative) */}
        <div className="relative z-10 flex gap-3">
          {[
            { g: 'linear-gradient(135deg,#f093fb,#f5576c)', t: 'Reunión lunes' },
            { g: 'linear-gradient(135deg,#4facfe,#00f2fe)', t: 'Ideas proyecto' },
            { g: 'linear-gradient(135deg,#43e97b,#38f9d7)', t: 'Lista compras' },
          ].map((n) => (
            <div key={n.t}
              className="flex-1 h-20 rounded-xl p-3 flex items-end"
              style={{ background: n.g }}>
              <span className="text-white/90 text-xs font-medium line-clamp-1">{n.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-[#0f1117]">
        <div className="w-full max-w-[400px] animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display text-lg font-semibold">AppNotas</span>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            {mode === 'login'
              ? 'Ingresa tus credenciales para continuar'
              : 'Completa los datos para empezar'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <input
                  className="input-field"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={set('name')}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="tu@email.com"
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-accent font-medium hover:underline"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
