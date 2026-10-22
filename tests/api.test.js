const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Use an isolated test database
const testDbPath = path.join(__dirname, 'test_crm.db');
process.env.DB_PATH = testDbPath;
process.env.JWT_SECRET = 'test_secret_key_123';

const app = require('../server/app');
const db = require('../server/db');

describe('CRM Backend API Test Suite', () => {
  let authToken = '';
  let userId = null;
  let testLeadId = null;

  before(() => {
    // Clear test database tables
    db.exec('DELETE FROM leads; DELETE FROM users;');
  });

  after(() => {
    // Clean up
    try {
      db.close();
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
      if (fs.existsSync(testDbPath + '-wal')) {
        fs.unlinkSync(testDbPath + '-wal');
      }
      if (fs.existsSync(testDbPath + '-shm')) {
        fs.unlinkSync(testDbPath + '-shm');
      }
    } catch (e) {
      // ignore
    }
  });

  test('POST /api/auth/register - Successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Lead Tracker',
        email: 'alex@example.com',
        password: 'securepassword123'
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'alex@example.com');
    assert.equal(res.body.user.name, 'Alex Lead Tracker');
    authToken = res.body.token;
    userId = res.body.user.id;
  });

  test('POST /api/auth/register - Reject duplicate registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Lead Tracker',
        email: 'alex@example.com',
        password: 'securepassword123'
      });

    assert.equal(res.status, 409);
    assert.ok(res.body.error);
  });

  test('POST /api/auth/login - Successfully login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@example.com',
        password: 'securepassword123'
      });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'alex@example.com');
  });

  test('POST /api/auth/login - Reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@example.com',
        password: 'wrongpassword'
      });

    assert.equal(res.status, 401);
  });

  test('GET /api/auth/me - Retrieve authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'alex@example.com');
  });

  test('POST /api/leads - Create leads across stages and follow-up dates', async () => {
    const lead1 = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        business_name: 'Acme Corp',
        website: 'https://acme.com',
        contact_name: 'John Doe',
        contact_email: 'john@acme.com',
        contact_phone: '+1 555-0100',
        stage: 'New',
        notes: 'Interested in enterprise plan',
        follow_up_date: '2020-01-01' // Overdue
      });

    assert.equal(lead1.status, 201);
    assert.equal(lead1.body.lead.business_name, 'Acme Corp');
    assert.equal(lead1.body.lead.stage, 'New');
    testLeadId = lead1.body.lead.id;

    // Create more leads for pipeline and dashboard testing
    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        business_name: 'Globex Inc',
        website: 'https://globex.com',
        contact_name: 'Jane Smith',
        contact_email: 'jane@globex.com',
        stage: 'Contacted',
        notes: 'Sent introductory pitch deck'
      });

    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        business_name: 'Soylent Health',
        website: 'https://soylent.health',
        contact_name: 'Bob Vance',
        stage: 'Replied',
        notes: 'Requested product demo'
      });

    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        business_name: 'Initech Systems',
        website: 'https://initech.io',
        contact_name: 'Peter Gibbons',
        stage: 'Meeting',
        notes: 'Scheduled discovery call'
      });

    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        business_name: 'Stark Enterprises',
        website: 'https://stark.com',
        contact_name: 'Tony Stark',
        stage: 'Won',
        notes: 'Signed contract'
      });

    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        business_name: 'Umbrella Pharma',
        website: 'https://umbrella.com',
        stage: 'Lost',
        notes: 'Chose competitor'
      });
  });

  test('GET /api/leads - Fetch all leads and search', async () => {
    const all = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(all.status, 200);
    assert.equal(all.body.leads.length, 6);

    // Search query test
    const searchRes = await request(app)
      .get('/api/leads?q=Enterprise')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(searchRes.status, 200);
    // Acme (notes has enterprise) and Stark Enterprises
    assert.equal(searchRes.body.leads.length, 2);
  });

  test('GET /api/leads - Filter by stage', async () => {
    const res = await request(app)
      .get('/api/leads?stage=Meeting')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.leads.length, 1);
    assert.equal(res.body.leads[0].business_name, 'Initech Systems');
  });

  test('GET /api/leads/dashboard - Verify stage counts and metrics', async () => {
    const res = await request(app)
      .get('/api/leads/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.totalLeads, 6);
    assert.equal(res.body.stageCounts.New, 1);
    assert.equal(res.body.stageCounts.Contacted, 1);
    assert.equal(res.body.stageCounts.Replied, 1);
    assert.equal(res.body.stageCounts.Meeting, 1);
    assert.equal(res.body.stageCounts.Won, 1);
    assert.equal(res.body.stageCounts.Lost, 1);
    assert.equal(res.body.metrics.closedLeads, 2);
    assert.equal(res.body.metrics.winRate, 50); // 1 Won / (1 Won + 1 Lost) = 50%
    assert.equal(res.body.reminders.overdue, 1);
  });

  test('GET /api/leads/reminders - Verify overdue reminders retrieval', async () => {
    const res = await request(app)
      .get('/api/leads/reminders')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.overdue.length, 1);
    assert.equal(res.body.overdue[0].business_name, 'Acme Corp');
  });

  test('PUT /api/leads/:id - Edit lead details', async () => {
    const res = await request(app)
      .put(`/api/leads/${testLeadId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        business_name: 'Acme Corporation Updated',
        website: 'https://acme-updated.com',
        contact_name: 'Johnathan Doe',
        notes: 'Updated note regarding follow-up'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.lead.business_name, 'Acme Corporation Updated');
    assert.equal(res.body.lead.website, 'https://acme-updated.com');
  });

  test('PATCH /api/leads/:id/stage - Update pipeline stage', async () => {
    const res = await request(app)
      .patch(`/api/leads/${testLeadId}/stage`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 'Contacted' });

    assert.equal(res.status, 200);
    assert.equal(res.body.lead.stage, 'Contacted');
  });

  test('DELETE /api/leads/:id - Delete lead', async () => {
    const res = await request(app)
      .delete(`/api/leads/${testLeadId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.id, testLeadId);

    // Verify it is gone
    const fetchRes = await request(app)
      .get(`/api/leads/${testLeadId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(fetchRes.status, 404);
  });
});
