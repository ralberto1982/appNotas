const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Eres un asistente experto en redacción y edición de textos en español.
Tu tarea es ayudar al usuario a mejorar, editar o generar contenido para sus notas personales.
Responde SIEMPRE con texto plano, sin etiquetas HTML, sin markdown, sin comillas envolventes ni prefijos como "Aquí tienes:".
Solo devuelve el texto resultante.`;

const ACTIONS = {
  improve:  'Mejora la redacción y claridad del siguiente texto sin cambiar su significado:\n\n',
  summarize:'Resume el siguiente texto en 3-5 oraciones manteniendo los puntos principales:\n\n',
  expand:   'Amplía y desarrolla el siguiente texto añadiendo más detalle y profundidad:\n\n',
  fix:      'Corrige los errores ortográficos y gramaticales del siguiente texto sin cambiar su contenido:\n\n',
  formal:   'Reescribe el siguiente texto en un tono formal y profesional:\n\n',
  casual:   'Reescribe el siguiente texto en un tono cercano e informal:\n\n',
  bullets:  'Convierte el siguiente texto en una lista de puntos clave bien estructurada:\n\n',
  custom:   '',
};

router.post('/assist', auth, async (req, res) => {
  const { action, text, html, customPrompt } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'GROQ_API_KEY no configurada en el servidor.' });
  }
  if (!action || !ACTIONS.hasOwnProperty(action)) {
    return res.status(400).json({ error: 'Acción no válida.' });
  }
  if (!text?.trim()) {
    return res.status(400).json({ error: 'Texto requerido.' });
  }
  if (action === 'custom' && !customPrompt?.trim()) {
    return res.status(400).json({ error: 'Instrucción requerida.' });
  }

  const prefix = action === 'custom' ? customPrompt.trim() + '\n\n' : ACTIONS[action];
  const userContent = prefix + text.trim();

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userContent },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err?.error?.message || 'Error de Groq API' });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || '';
    res.json({ result });
  } catch (err) {
    console.error('AI assist error:', err);
    res.status(500).json({ error: `Error al conectar con la IA: ${err.message}` });
  }
});

const CHAT_SYSTEM_PROMPT = `Eres un asistente inteligente y versátil en español. Ayudas al usuario a investigar, aprender, analizar, crear y resolver problemas de cualquier tipo.
Responde de forma clara, estructurada y útil. Puedes usar listas, títulos y formato para organizar tus respuestas cuando sea útil.
Mantén el contexto de la conversación para dar respuestas coherentes y relevantes.`;

router.post('/chat', auth, async (req, res) => {
  const { messages } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'GROQ_API_KEY no configurada en el servidor.' });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Mensajes requeridos.' });
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err?.error?.message || 'Error de Groq API' });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || '';
    res.json({ result });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: `Error al conectar con la IA: ${err.message}` });
  }
});

module.exports = router;
