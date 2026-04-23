const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../database');

router.use(auth);

router.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = `
    SELECT n.*, c.name as category_name, c.color as category_color
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    WHERE n.user_id = ?
  `;
  const params = [req.user.id];

  if (search) {
    query += ' AND (n.title LIKE ? OR n.content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    query += ' AND n.category_id = ?';
    params.push(category);
  }
  query += ' ORDER BY n.updated_at DESC';

  const notes = db.prepare(query).all(params);
  res.json(notes);
});

router.get('/:id', (req, res) => {
  const note = db
    .prepare(
      `SELECT n.*, c.name as category_name, c.color as category_color
       FROM notes n LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.id = ? AND n.user_id = ?`
    )
    .get([req.params.id, req.user.id]);
  if (!note) return res.status(404).json({ error: 'Nota no encontrada' });
  res.json(note);
});

router.post('/', (req, res) => {
  const { title, content, category_id, gradient_index, canvas_color } = req.body;
  const result = db
    .prepare(
      `INSERT INTO notes (title, content, category_id, user_id, gradient_index, canvas_color)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run([
      title || 'Sin título',
      content || '',
      category_id || null,
      req.user.id,
      gradient_index ?? Math.floor(Math.random() * 12),
      canvas_color || '#ffffff',
    ]);
  const note = db
    .prepare(
      `SELECT n.*, c.name as category_name, c.color as category_color
       FROM notes n LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.id = ?`
    )
    .get([result.lastInsertRowid]);
  res.json(note);
});

router.put('/:id', (req, res) => {
  const { title, content, category_id, gradient_index, canvas_color } = req.body;
  db.prepare(
    `UPDATE notes SET title = ?, content = ?, category_id = ?, gradient_index = ?,
     canvas_color = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`
  ).run([title, content, category_id || null, gradient_index, canvas_color, req.params.id, req.user.id]);

  const note = db
    .prepare(
      `SELECT n.*, c.name as category_name, c.color as category_color
       FROM notes n LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.id = ?`
    )
    .get([req.params.id]);
  res.json(note);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run([req.params.id, req.user.id]);
  res.json({ success: true });
});

module.exports = router;
