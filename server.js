const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        app.emit('db_connected');
    }
});

// Create table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        major TEXT NOT NULL
    )`);
});

// CREATE (Insert)
app.post('/api/students', (req, res) => {
    const { name, email, major } = req.body;
    if (!name || !email || !major) {
        return res.status(400).json({ error: 'Please provide name, email, and major.' });
    }
    const sql = 'INSERT INTO students (name, email, major) VALUES (?, ?, ?)';
    db.run(sql, [name, email, major], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID, name, email, major });
    });
});

// READ (Retrieve all)
app.get('/api/students', (req, res) => {
    const sql = 'SELECT * FROM students';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// UPDATE
app.put('/api/students/:id', (req, res) => {
    const { name, email, major } = req.body;
    const { id } = req.params;
    if (!name || !email || !major) {
        return res.status(400).json({ error: 'Please provide name, email, and major.' });
    }
    const sql = 'UPDATE students SET name = ?, email = ?, major = ? WHERE id = ?';
    db.run(sql, [name, email, major, id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Student not found.' });
        }
        res.json({ message: 'Student updated successfully.', id, name, email, major });
    });
});

// DELETE
app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM students WHERE id = ?';
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Student not found.' });
        }
        res.json({ message: 'Student deleted successfully.', id });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
