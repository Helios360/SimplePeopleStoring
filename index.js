const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');

const authMiddleware = require('./controllers/authControl');
const app = express();

const port = 8080;
const hostname = 'localhost';
const SECRET = 'your-secret-key'; // .env

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Static Files ===
app.use('/styles', express.static(path.join(__dirname, 'public', 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts')));
app.use('/sources', express.static(path.join(__dirname, 'public', 'sources')));

// === MySQL ===
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123',
  database: 'Main',
});
db.connect(err => {
  if (err) {
    console.error('DB Error:', err.stack);
    return;
  }
  console.log(':3 Connected to DB');
});

// === HTML Routes ===
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/register', (_, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.get('/signin', (_, res) => res.sendFile(path.join(__dirname, 'public/signin.html')));
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
// === /login Route ===
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM Candidats WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send('DB error');
    if (results.length === 0) return res.status(401).json({ success: false, message: 'Email not found' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).send('Password error');
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid password' });

      const token = jwt.sign({email: user.email, name: user.name }, SECRET, { expiresIn: '2h' });
      res.json({ success: true, token, user: {email: user.email, name: user.name} });
    });
  });
});

// === /api/profile (Protected Route) ===
app.get('/api/profile', authMiddleware, (req, res) => {
  const userId = req.user.email;

  db.query('SELECT * FROM Candidats WHERE email = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user: results[0] });
  });
});

// === PDF access ===
app.get('/uploads/:filename', authMiddleware, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    res.sendFile(filePath);
  });
});

// === Register route ===
app.post('/submit-form', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    multiples: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).send('Form parsing error');
    }

    const {
      name, fname, email, tel, addr, city,
      postal, birth, id, password, agree
    } = fields;

    const getFileName = (file) => {
      if (!file) return null;
      return path.basename(file[0]?.filepath || '');
    };

    const cv = getFileName(files.cv);
    const id_doc = getFileName(files.id_doc);

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(String(password), saltRounds);

    const sql = `
      INSERT INTO Candidats
        (name, fname, email, tel, addr, city, postal, birth, cv, id_doc, user_id, password, agree)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name, fname, email, tel, addr, city, postal, birth,
      cv, id_doc, id, hashedPassword, agree ? 1 : 0
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).send('Database Error');
      }

      res.redirect('/');
    });
  });
});

// === Fallback route ===
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// === Start Server ===
app.listen(port, hostname, () => {
  console.log(`:D Server running at http://${hostname}:${port}`);
});
