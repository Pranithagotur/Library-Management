const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const SECRET_KEY = 'super-secret-key'; // In production, use environment variable

app.use(cors());
app.use(express.json());

// Initialize Database
const db = new sqlite3.Database('./library.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    category TEXT,
    total INTEGER,
    available INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    bookId TEXT,
    userId TEXT,
    assignDate TEXT,
    dueDate TEXT,
    status TEXT,
    FOREIGN KEY(bookId) REFERENCES books(id),
    FOREIGN KEY(userId) REFERENCES members(id)
  )`);

  // Seed Admin User
  db.get("SELECT * FROM admins WHERE username = 'admin'", (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.run("INSERT INTO admins (username, password) VALUES ('admin', ?)", [hash]);
      console.log('Default admin seeded: admin / admin123');
    }
  });

  // Seed initial data if empty
  db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
    if (row && row.count === 0) {
      const books = [
        { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', total: 5, available: 3 },
        { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', total: 4, available: 1 },
      ];
      const stmt = db.prepare("INSERT INTO books VALUES (?, ?, ?, ?, ?, ?)");
      books.forEach(b => stmt.run([b.id, b.title, b.author, b.category, b.total, b.available]));
      stmt.finalize();
    }
  });
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM admins WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  });
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const hash = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO admins (username, password) VALUES (?, ?)", [username, hash], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Registration successful. You can now log in.' });
  });
});

// --- API ROUTES ---

// Books
app.get('/api/books', authenticateToken, (req, res) => {
  db.all("SELECT * FROM books", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/books', authenticateToken, (req, res) => {
  const { id, title, author, category, total, available } = req.body;
  db.run("INSERT INTO books (id, title, author, category, total, available) VALUES (?, ?, ?, ?, ?, ?)", 
    [id, title, author, category, total, available], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, title, author, category, total, available });
  });
});

// Members
app.get('/api/users', authenticateToken, (req, res) => {
  db.all("SELECT * FROM members", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', authenticateToken, (req, res) => {
  const { id, name, email, role } = req.body;
  db.run("INSERT INTO members (id, name, email, role) VALUES (?, ?, ?, ?)", 
    [id, name, email, role], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, email, role });
  });
});

// Assignments
app.get('/api/assignments', authenticateToken, (req, res) => {
  db.all("SELECT * FROM assignments", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/assignments', authenticateToken, (req, res) => {
  const { id, bookId, userId, assignDate, dueDate, status } = req.body;
  
  db.run("BEGIN TRANSACTION");
  
  db.run("INSERT INTO assignments (id, bookId, userId, assignDate, dueDate, status) VALUES (?, ?, ?, ?, ?, ?)", 
    [id, bookId, userId, assignDate, dueDate, status], 
    function(err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ error: err.message });
      }
      
      db.run("UPDATE books SET available = available - 1 WHERE id = ?", [bookId], function(err2) {
        if (err2) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err2.message });
        }
        db.run("COMMIT");
        res.json({ id, bookId, userId, assignDate, dueDate, status });
      });
  });
});

app.post('/api/assignments/:id/return', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT * FROM assignments WHERE id = ?", [id], (err, assignment) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    db.run("BEGIN TRANSACTION");
    
    db.run("UPDATE assignments SET status = 'returned' WHERE id = ?", [id], function(err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ error: err.message });
      }
      
      db.run("UPDATE books SET available = available + 1 WHERE id = ?", [assignment.bookId], function(err2) {
        if (err2) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err2.message });
        }
        db.run("COMMIT");
        res.json({ success: true });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
