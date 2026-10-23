const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const insert = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    const result = insert.run(name.trim(), normalizedEmail, password_hash);

    const user = { id: result.lastInsertRowid, name: name.trim(), email: normalizedEmail };
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userData = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Quick demo login (supports POST and GET)
const handleDemoLogin = async (req, res) => {
  try {
    const demoEmail = 'demo@example.com';
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(demoEmail);

    if (!user) {
      const password_hash = await bcrypt.hash('demo123', 10);
      const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      const result = insertUser.run('Demo User', demoEmail, password_hash);
      const userId = result.lastInsertRowid;

      // Seed initial sample leads for demo user
      const insertLead = db.prepare(`
        INSERT INTO leads (user_id, business_name, website, contact_name, contact_email, contact_phone, stage, notes, follow_up_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      insertLead.run(userId, 'Acme Corp', 'https://acme.example.com', 'Alice Smith', 'alice@acme.example.com', '555-0101', 'Meeting', 'Discussing enterprise tier subscription.', today);
      insertLead.run(userId, 'Nexus Tech', 'https://nexus.example.com', 'Bob Johnson', 'bob@nexus.example.com', '555-0102', 'Replied', 'Requested product demo and pricing deck.', tomorrow);
      insertLead.run(userId, 'Peak Solutions', 'https://peak.example.com', 'Carol Williams', 'carol@peak.example.com', '555-0103', 'New', 'Inbound lead from website contact form.', yesterday);
      insertLead.run(userId, 'Global Logistics', 'https://global.example.com', 'David Brown', 'david@global.example.com', '555-0104', 'Won', 'Contract signed for 12 months.', null);

      user = { id: userId, name: 'Demo User', email: demoEmail };
    }

    const userData = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Demo login successful',
      user: userData,
      token
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Server error during demo login' });
  }
};

router.post('/demo', handleDemoLogin);
router.get('/demo', handleDemoLogin);

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

module.exports = router;
