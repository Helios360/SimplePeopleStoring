const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const publiChat = "test";
// Define the hostname and port
const hostname = 'localhost';
const port = 8080;

const db = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'123',
	database:'test',
});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as id ' + db.threadId);
});

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Handle requests for the root URL
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.url === '/') {
    // Serve index.html
    fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }
	res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });
  } else if (req.url === '/register') {
    // Serve register.html
    fs.readFile(path.join(__dirname, 'register.html'), 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });
  } else if (req.url === '/signin') {
    // Serve register.html
    fs.readFile(path.join(__dirname, 'signin.html'), 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });
  } else if (req.url === '/api/data') {
    db.query("SELECT * FROM test", (error, result) => {
      if (error){
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end(JSON.stringify({error: "DB query failed"}));
        return;
      }
      res.writeHead(200,{
        "Content-Type":"application/json",
        "Access-Control-Allow-Origin":"*"
      });
      res.end(JSON.stringify(result));
		});
	} else if (req.url.startsWith('/styles/') && path.extname(req.url) === '.css') {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/css');
      res.end(data);
    });
  } else if (req.url.startsWith('/scripts/') && path.extname(req.url) === '.js') {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/javascript');
      res.end(data);
    });
  } else if (req.url.startsWith('/sources/') && path.extname(req.url) === '.png') {
    const filePath = path.join(__dirname, req.url);
    if (!filePath.startsWith(path.join(__dirname, 'sources'))) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'image/png');
      res.end(data);
    });
  } else if (req.url.startsWith('/sources/') && path.extname(req.url) === '.svg') {
    const filePath = path.join(__dirname, req.url);
    if (!filePath.startsWith(path.join(__dirname, 'sources'))) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'image/svg');
      res.end(data);
    });
  } else if (req.url === '/submit-message' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const messageData = JSON.parse(body);
            const message = messageData.message; // Ensure this key matches the client request

            const query = 'INSERT INTO test (msg) VALUES (?)'; // Use the correct column name 'msg'
            db.query(query, [message], (err, result) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                    return;
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, messageId: result.insertId }));
            });
        } catch (error) {
            res.statusCode = 400;
            res.end('Bad Request');
        }
    });
  } else if (req.url === '/submit-form' && req.method === 'POST') {
    const formidable = require('formidable');
    const uploadDir = path.join(__dirname, 'uploads');

    // Make sure uploads folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.keepExtensions = true;
    form.maxFileSize = 10 * 1024 * 1024; // 10 MB

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.statusCode = 500;
        res.end('Form parsing error');
        return;
      }

      const {
        name, fname, email, tel, addr, city,
        postal, birth, id, password, agree
      } = fields;
      
      const cv = Array.isArray(files.cv) && files.cv[0]?.filepath
        ? path.basename(files.cv[0].filepath)
        : null;

      const id_doc = Array.isArray(files.id_doc) && files.id_doc[0]?.filepath
        ? path.basename(files.id_doc[0].filepath)
        : null;

      const saltRounds = 10;
      const pwd = bcrypt.hashSync(String(password), saltRounds);

      const sql = `INSERT INTO Candidats
        (name, fname, email, tel, addr, city, postal, birth, cv, id_doc, user_id, password, agree)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        name, fname, email, tel, addr, city, postal, birth,
        cv, id_doc, id, pwd, agree ? 1 : 0
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          res.statusCode = 500;
          res.end('Database Error'+err);
          return;
        }
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
      });
    });
  } else if (req.url === '/login' && req.method === 'POST') {
    const formidable = require('formidable');
    const uploadDir = path.join(__dirname, 'uploads');

    // Make sure uploads folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.keepExtensions = true;
    form.maxFileSize = 10 * 1024 * 1024; // 10 MB

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.statusCode = 500;
        res.end('Form parsing error');
        return;
      }

      const {
        name, fname, email, tel, addr, city,
        postal, birth, agree
      } = fields;

      const cvFile = files.cv?.filepath;
      const idDocFile = files.id_doc?.filepath;

      const sql = `SELECT `;

      const values = [
        name, fname, email, tel, addr, city, postal, birth,
        cvFile, idDocFile, agree ? 1 : 0
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          res.statusCode = 500;
          res.end('Database Error'+err);
          return;
        }
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
      });
    });
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not Found' }));  }
  });

// Make the server listen on the defined port and hostname
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});