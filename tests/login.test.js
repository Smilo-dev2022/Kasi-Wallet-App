const request = require('supertest');
const app = require('../server');
const assert = require('assert');

describe('POST /api/login', function() {
  it('rejects invalid credentials', async function() {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'invalid@example.com', password: 'wrongpass' });
    assert.strictEqual(res.statusCode, 401);
  });
});
