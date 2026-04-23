const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get([email]);
  if (existing) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run([name, email, hashed]);

  const uid = result.lastInsertRowid;
  const defaultCategories = [
    { name: 'Personal', color: '#f093fb' },
    { name: 'Trabajo', color: '#4facfe' },
    { name: 'Ideas', color: '#43e97b' },
  ];
  const insertCat = db.prepare('INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)');
  defaultCategories.forEach((cat) => insertCat.run([cat.name, cat.color, uid]));

  const token = jwt.sign({ id: uid, email, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: uid, name, email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get([email]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
