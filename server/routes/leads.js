const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const VALID_STAGES = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

// All lead routes require authentication
router.use(authenticateToken);

// GET leads with optional search, filtering and sorting
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { q, stage, reminder, sort } = req.query;
    const today = new Date().toISOString().split('T')[0];

    let query = 'SELECT * FROM leads WHERE user_id = ?';
    const params = [userId];

    // Filter by stage
    if (stage && VALID_STAGES.includes(stage)) {
      query += ' AND stage = ?';
      params.push(stage);
    }

    // Search keyword
    if (q && q.trim()) {
      const keyword = `%${q.trim()}%`;
      query += ` AND (
        business_name LIKE ? OR 
        website LIKE ? OR 
        contact_name LIKE ? OR 
        contact_email LIKE ? OR 
        contact_phone LIKE ? OR 
        notes LIKE ?
      )`;
      params.push(keyword, keyword, keyword, keyword, keyword, keyword);
    }

    // Filter by reminder status
    if (reminder === 'overdue') {
      query += ' AND follow_up_date IS NOT NULL AND follow_up_date != "" AND follow_up_date < ? AND stage NOT IN ("Won", "Lost")';
      params.push(today);
    } else if (reminder === 'today') {
      query += ' AND follow_up_date = ? AND stage NOT IN ("Won", "Lost")';
      params.push(today);
    } else if (reminder === 'upcoming') {
      query += ' AND follow_up_date > ? AND stage NOT IN ("Won", "Lost")';
      params.push(today);
    } else if (reminder === 'none') {
      query += ' AND (follow_up_date IS NULL OR follow_up_date = "")';
    }

    // Sorting
    let orderBy = ' ORDER BY created_at DESC';
    if (sort === 'created_asc') orderBy = ' ORDER BY created_at ASC';
    else if (sort === 'name_asc') orderBy = ' ORDER BY business_name COLLATE NOCASE ASC';
    else if (sort === 'name_desc') orderBy = ' ORDER BY business_name COLLATE NOCASE DESC';
    else if (sort === 'followup_asc') orderBy = ' ORDER BY CASE WHEN follow_up_date IS NULL OR follow_up_date = "" THEN 1 ELSE 0 END, follow_up_date ASC';
    else if (sort === 'followup_desc') orderBy = ' ORDER BY CASE WHEN follow_up_date IS NULL OR follow_up_date = "" THEN 1 ELSE 0 END, follow_up_date DESC';

    query += orderBy;

    const leads = db.prepare(query).all(...params);
    res.json({ leads, total: leads.length });
  } catch (err) {
    console.error('Fetch leads error:', err);
    res.status(500).json({ error: 'Server error fetching leads' });
  }
});

// CREATE lead
router.post('/', (req, res) => {
  try {
    const userId = req.user.id;
    const {
      business_name,
      website = '',
      contact_name = '',
      contact_email = '',
      contact_phone = '',
      stage = 'New',
      notes = '',
      follow_up_date = null
    } = req.body;

    if (!business_name || !business_name.trim()) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const assignedStage = VALID_STAGES.includes(stage) ? stage : 'New';

    const insert = db.prepare(`
      INSERT INTO leads (
        user_id, business_name, website, contact_name, contact_email, contact_phone, stage, notes, follow_up_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      userId,
      business_name.trim(),
      (website || '').trim(),
      (contact_name || '').trim(),
      (contact_email || '').trim(),
      (contact_phone || '').trim(),
      assignedStage,
      (notes || '').trim(),
      follow_up_date ? follow_up_date.trim() : null
    );

    const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Lead created successfully', lead: newLead });
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ error: 'Server error creating lead' });
  }
});

// UPDATE lead
router.put('/:id', (req, res) => {
  try {
    const userId = req.user.id;
    const leadId = req.params.id;

    const existing = db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(leadId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const {
      business_name,
      website,
      contact_name,
      contact_email,
      contact_phone,
      stage,
      notes,
      follow_up_date
    } = req.body;

    if (business_name !== undefined && !business_name.trim()) {
      return res.status(400).json({ error: 'Business name cannot be empty' });
    }

    const updatedBusinessName = business_name !== undefined ? business_name.trim() : existing.business_name;
    const updatedWebsite = website !== undefined ? website.trim() : existing.website;
    const updatedContactName = contact_name !== undefined ? contact_name.trim() : existing.contact_name;
    const updatedContactEmail = contact_email !== undefined ? contact_email.trim() : existing.contact_email;
    const updatedContactPhone = contact_phone !== undefined ? contact_phone.trim() : existing.contact_phone;
    const updatedStage = (stage && VALID_STAGES.includes(stage)) ? stage : existing.stage;
    const updatedNotes = notes !== undefined ? notes.trim() : existing.notes;
    const updatedFollowUp = follow_up_date !== undefined ? (follow_up_date ? follow_up_date.trim() : null) : existing.follow_up_date;

    db.prepare(`
      UPDATE leads SET 
        business_name = ?,
        website = ?,
        contact_name = ?,
        contact_email = ?,
        contact_phone = ?,
        stage = ?,
        notes = ?,
        follow_up_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      updatedBusinessName,
      updatedWebsite,
      updatedContactName,
      updatedContactEmail,
      updatedContactPhone,
      updatedStage,
      updatedNotes,
      updatedFollowUp,
      leadId,
      userId
    );

    const updatedLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
    res.json({ message: 'Lead updated successfully', lead: updatedLead });
  } catch (err) {
    console.error('Update lead error:', err);
    res.status(500).json({ error: 'Server error updating lead' });
  }
});

// QUICK STAGE UPDATE
router.patch('/:id/stage', (req, res) => {
  try {
    const userId = req.user.id;
    const leadId = req.params.id;
    const { stage } = req.body;

    if (!stage || !VALID_STAGES.includes(stage)) {
      return res.status(400).json({ error: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}` });
    }

    const existing = db.prepare('SELECT id FROM leads WHERE id = ? AND user_id = ?').get(leadId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    db.prepare(`
      UPDATE leads SET 
        stage = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(stage, leadId, userId);

    const updatedLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
    res.json({ message: 'Stage updated successfully', lead: updatedLead });
  } catch (err) {
    console.error('Update stage error:', err);
    res.status(500).json({ error: 'Server error updating stage' });
  }
});

// DELETE lead
router.delete('/:id', (req, res) => {
  try {
    const userId = req.user.id;
    const leadId = req.params.id;

    const existing = db.prepare('SELECT id FROM leads WHERE id = ? AND user_id = ?').get(leadId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    db.prepare('DELETE FROM leads WHERE id = ? AND user_id = ?').run(leadId, userId);
    res.json({ message: 'Lead deleted successfully', id: Number(leadId) });
  } catch (err) {
    console.error('Delete lead error:', err);
    res.status(500).json({ error: 'Server error deleting lead' });
  }
});

module.exports = router;
