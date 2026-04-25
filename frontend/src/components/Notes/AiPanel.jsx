import { useState } from 'react';
import { Sparkles, X, Copy, Check, RefreshCw, ChevronDown } from 'lucide-react';
import api from '../../api/client';

const ACTIONS = [
  { id: 'improve',  label: 'Mejorar redacción',     emoji: '✨' },
  { id: 'fix',      label: 'Corregir gramática',     emoji: '🔍' },
  { id: 'summarize',label: 'Resumir',                emoji: '📝' },
  { id: 'expand',   label: 'Expandir idea',          emoji: '🔭' },
  { id: 'formal',   label: 'Tono formal',            emoji: '👔' },
  { id: 'casual',   label: 'Tono informal',          emoji: '😊' },
  { id: 'bullets',  label: 'Convertir a puntos',     emoji: '•' },
  { id: 'custom',   label: 'Instrucción libre',      emoji: '💬' },
];

export default function AiPanel({ editor, onClose, onInsert }) {
  const [action, setAction] = useState('improve');
  const [customPrompt, setCustomPrompt] = useState('');
  const [standaloneText, setStandaloneText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const standalone = !editor;
  const hasSelection = !standalone && !editor?.state.selection.empty;

  const selectedText = hasSelection
    ? editor?.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      )
    : '';

  const noteHtml = editor?.getHTML() || '';
  const noteText = editor?.getText() || '';
  const textToSend = standalone ? standaloneText : hasSelection ? selectedText : noteText;

  const handleRun = async () => {
    if (!textToSend.trim()) {
      setError(standalone ? 'Escribe o pega texto antes de generar.' : 'Escribe algo en la nota primero.');
      return;
    }
    if (action === 'custom' && !customPrompt.trim()) {
      setError('Escribe una instrucción.');
      return;
    }
    setError('');
    setResult('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/assist', {
        action,
        text: textToSend,
        customPrompt: action === 'custom' ? customPrompt : undefined,
      }, { timeout: 60000 });
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar con la IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplace = () => {
    if (!result || !editor) return;
    if (hasSelection) {
      editor.chain().focus().deleteSelection().insertContent(result).run();
    } else {
      editor.commands.setContent(result, false);
    }
    onClose();
  };

  const handleInsertBelow = () => {
    if (!result || !editor) return;
    editor.chain().focus().command(({ tr, dispatch }) => {
      const end = tr.doc.content.size - 1;
      tr.insertText('\n' + result, end);
      if (dispatch) dispatch(tr);
      return true;
    }).run();
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1d27] border-l border-gray-200 dark:border-gray-800 w-80 flex-shrink-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-accent" />
        </div>
        <span className="font-semibold text-sm flex-1">Asistente IA</span>
        <button onClick={onClose} className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context hint / standalone input */}
        {standalone ? (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Texto</p>
            <textarea
              className="input-field text-xs resize-none h-28"
              placeholder="Pega o escribe el texto que quieres procesar..."
              value={standaloneText}
              onChange={(e) => setStandaloneText(e.target.value)}
            />
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            {selectedText
              ? `Texto seleccionado: "${selectedText.slice(0, 60)}${selectedText.length > 60 ? '…' : ''}"`
              : 'Usando el contenido completo de la nota.'}
          </p>
        )}

        {/* Action selector */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Acción</p>
          <div className="grid grid-cols-2 gap-1.5">
            {ACTIONS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAction(a.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all
                  ${action === a.id
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-accent/50'}`}
              >
                <span>{a.emoji}</span>
                <span className="truncate">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom prompt input */}
        {action === 'custom' && (
          <div>
            <textarea
              className="input-field text-xs resize-none h-20"
              placeholder="Ej: Traduce al inglés, escribe en verso, etc."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>
        )}

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Procesando...</>
            : <><Sparkles size={15} />Generar</>}
        </button>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Resultado</p>
            <div className="bg-gray-50 dark:bg-[#161820] rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {result}
            </div>
            <div className="flex gap-2">
              {!standalone && (
                <button
                  onClick={handleReplace}
                  className="btn-primary text-xs py-1.5 flex-1"
                >
                  {editor?.state.selection.empty ? 'Insertar al final' : 'Reemplazar selección'}
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`btn-ghost text-xs py-1.5 flex items-center gap-1 ${standalone ? 'flex-1' : ''}`}
              >
                {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <button
              onClick={handleRun}
              disabled={loading}
              className="btn-ghost text-xs py-1.5 w-full flex items-center justify-center gap-1 text-gray-400"
            >
              <RefreshCw size={12} />
              Regenerar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
