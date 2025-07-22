const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { formidable } = require('formidable');
require('dotenv').config();


const authMiddleware = require('./controllers/authControl');
const adminOnly = require('./controllers/adminOnly');
const app = express();

const port = 8080;
const hostname = 'localhost';
const SECRET = 'your-secret-key'; // .env

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Static Files ===
app.use(express.static(path.join(__dirname, 'public')));

// === MySQL ===
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
app.get('/profile', authMiddleware, (req, res) => {res.sendFile(path.join(__dirname, 'views', 'profile.html'));});
app.get('/admin-panel', authMiddleware, adminOnly, (req, res) => {res.sendFile(path.join(__dirname,'views', 'admin.html'));});
app.get('/test', authMiddleware, (req, res) => {res.sendFile(path.join(__dirname,'views', 'test.html'));});

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

      const token = jwt.sign({email: user.email, name: user.name, is_admin: user.is_admin }, SECRET, { expiresIn: '2h' });
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
// === Admin full sql api ===
app.get('/api/admin-panel', authMiddleware, adminOnly, (req, res) => {
  db.query('SELECT * FROM Candidats', (err, results)=>{
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'Result lenght === 0'});
    res.json({ success: true, users: results});
  });
});
// === test route ===
app.get('/api', authMiddleware, (req, res) => {});
// === Single user profile (admin) ===
app.get('/api/user-profile/:id', authMiddleware, adminOnly, (req, res) => {
  const userId = req.params.id;
  db.query('SELECT * FROM Candidats WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: results[0] });
  });
});

// Only accessible by authenticated admins
app.get('/api/admin/student/:email', authMiddleware, adminOnly, (req, res) => {
  const email = decodeURIComponent(req.params.email);

  db.query('SELECT * FROM Candidats WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, student: results[0] });
  });
});


// === PDF access ===
app.get('/uploads/:folder/:filename', authMiddleware, (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', folder, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    res.sendFile(filePath);
  });
});

// === update students (admin) ===
app.post('/api/admin/update-student', authMiddleware, adminOnly, (req, res) => {
  const {
    email, name, fname, tel, birth, addr, city, postal, tags, skills, status
  } = req.body;

  db.query(
    'UPDATE Candidats SET name=?, fname=?, tel=?, birth=?, addr=?, city=?, postal=?, tags=?, skills=?, status=? WHERE email=?',
    [name, fname, tel, birth, addr, city, postal, JSON.stringify(tags), JSON.stringify(skills), status, email],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      res.json({ success: true });
    }
  );
});
// === update status from list (admin) ===
app.post('/api/admin/update-status', authMiddleware, adminOnly, (req, res) => {
  const { id, status } = req.body;

  db.query(
    'UPDATE Candidats SET status = ? WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) {
        console.error('DB error on status update:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({ success: true });
    }
  );
});

// === from profile to db ===
app.post('/api/update-tags', authMiddleware, (req, res) => {
  const userEmail = req.user.email;
  const {name,fname,tel,birth,addr,city,postal,tags,skills,status} = req.body;

  if (!Array.isArray(tags) || !Array.isArray(skills)) {
    return res.status(400).json({ success: false, message: 'Tags and skills must be arrays' });
  }

  const tagsJSON = JSON.stringify(tags);
  const skillsJSON = JSON.stringify(skills);

  db.query(
    `UPDATE Candidats 
     SET name = ?, fname = ?, tel = ?, birth = ?, addr = ?, city = ?, postal = ?, tags = ?, skills = ?, status=?
     WHERE email = ?`,
    [name, fname, tel, birth, addr, city, postal, tagsJSON, skillsJSON, status, userEmail],
    (err, result) => {
      if (err) {
        console.error('DB update error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json({ success: true, message: 'Profile updated successfully' });
    }
  );
});


// === Register route ===
app.post('/submit-form', (req, res) => {
  const form = formidable({
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
      postal, birth, id, password, agree,
    } = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v[0]]));


    // Generate a unique folder name (based on timestamp + email or UUID)
    const userFolderName = `user_${Date.now()}_${email.replace(/[@.]/g, '_')}`;
    const uploadDir = path.join(__dirname, 'uploads', userFolderName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move files into that folder
    const moveFile = (file) => {
      if (!file) return null;
      const oldPath = file[0].filepath;
      const newName = file[0].newFilename;
      const newPath = path.join(uploadDir, newName);

      // Fix for cross-device error
      fs.copyFileSync(oldPath, newPath);
      fs.unlinkSync(oldPath);

      return path.relative(__dirname, newPath);
    };


    const cvPath = moveFile(files.cv);
    const idDocPath = moveFile(files.id_doc);

    // Hash password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(String(password), saltRounds);

    // Insert into DB
    const sql = `
      INSERT INTO Candidats
        (name, fname, email, tel, addr, city, postal, birth, cv, id_doc, password, agree)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name, fname, email, tel, addr, city, postal, birth,
      cvPath, idDocPath, hashedPassword, agree ? 1 : 0
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).send('Database Error');
      }

      res.redirect('/signin');
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