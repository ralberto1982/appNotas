const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../database');

router.use(auth);

router.get('/', (req, res) => {
  const cats = db
    .prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name')
    .all([req.user.id]);
  res.json(cats);
});

router.post('/', (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const result = db
    .prepare('INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)')
    .run([name, color || '#00c9a7', req.user.id]);
  res.json({ id: result.lastInsertRowid, name, color: color || '#00c9a7', user_id: req.user.id });
});

router.put('/:id', (req, res) => {
  const { name, color } = req.body;
  db.prepare('UPDATE categories SET name = ?, color = ? WHERE id = ? AND user_id = ?')
    .run([name, color, req.params.id, req.user.id]);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?')
    .run([req.params.id, req.user.id]);
  res.json({ success: true });
});

module.exports = router;
