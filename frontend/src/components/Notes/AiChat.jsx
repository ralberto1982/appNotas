import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, RotateCcw, Copy, Check, User, Bot } from 'lucide-react';
import api from '../../api/client';

const SUGGESTIONS = [
  '¿Cómo funciona la inteligencia artificial?',
  'Explícame el método Pomodoro',
  'Dame ideas para organizar mi semana',
  'Escribe un resumen sobre el estoicismo',
  '¿Cuáles son los principios del liderazgo?',
  'Ayúdame a planificar un proyecto',
];

function Message({ msg }) {
  const [copied, setCopied] = useState(false);
  const isAi = msg.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-2.5 ${isAi ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${isAi ? 'bg-accent/15' : 'bg-gray-100 dark:bg-gray-800'}`}>
        {isAi
          ? <Sparkles size={13} className="text-accent" />
          : <User size={13} className="text-gray-500 dark:text-gray-400" />}
      </div>

      {/* Bubble */}
      <div className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
        ${isAi
          ? 'bg-gray-50 dark:bg-[#1e2030] text-gray-800 dark:text-gray-200 rounded-tl-sm'
          : 'bg-accent text-white rounded-tr-sm'}`}>
        <div className="whitespace-pre-wrap">{msg.content}</div>

        {isAi && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                       p-1 rounded-lg bg-white dark:bg-[#161820] shadow-sm border border-gray-100 dark:border-gray-700"
          >
            {copied
              ? <Check size={11} className="text-green-500" />
              : <Copy size={11} className="text-gray-400" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AiChat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        messages: next.map(({ role, content }) => ({ role, content })),
      }, { timeout: 60000 });

      setMessages((prev) => [...prev, { role: 'assistant', content: data.result }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar con la IA.');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => {
    setMessages([]);
    setInput('');
    setError('');
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1d27] border-l border-gray-200 dark:border-gray-800 w-96 flex-shrink-0 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Asistente IA</p>
          <p className="text-[10px] text-gray-400">Investiga, aprende y crea</p>
        </div>
        {messages.length > 0 && (
          <button onClick={reset} className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" data-tip="Nueva conversación">
            <RotateCcw size={14} />
          </button>
        )}
        <button onClick={onClose} className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Sparkles size={22} className="text-accent" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">¿En qué te puedo ayudar?</p>
              <p className="text-xs text-gray-400 mt-1">Pregunta lo que necesites</p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                             text-gray-600 dark:text-gray-400 hover:border-accent/50 hover:text-accent
                             transition-colors truncate"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={13} className="text-accent" />
            </div>
            <div className="bg-gray-50 dark:bg-[#1e2030] rounded-2xl rounded-tl-sm px-4 py-3">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-end gap-2 bg-gray-50 dark:bg-[#161820] rounded-2xl border border-gray-200 dark:border-gray-700 px-3 py-2 focus-within:border-accent/50 transition-colors">
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent text-sm outline-none resize-none placeholder-gray-400 dark:placeholder-gray-600
                       text-gray-900 dark:text-gray-100 max-h-32 min-h-[24px]"
            placeholder="Escribe tu pregunta... (Enter para enviar)"
            value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
            onKeyDown={handleKey}
            rows={1}
            autoFocus
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-xl bg-accent flex items-center justify-center flex-shrink-0
                       disabled:opacity-30 hover:bg-accent/80 transition-colors"
          >
            <Send size={13} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">Shift+Enter para nueva línea</p>
      </div>
    </div>
  );
}
