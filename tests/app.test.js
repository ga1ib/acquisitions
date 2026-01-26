import request from 'supertest';
import app from '../src/app.js';

describe('API Endpoints', () => {
  it('should respond to /health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});
describe('GET /api', () => {
  it('should respond to api message', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Acquisitions API is up and running!');
  });
});
describe('GET /nonexistent', () => {
  it('should return 404 for nonexistent routes', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Route Not Found');
  });
});

