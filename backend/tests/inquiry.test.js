const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

describe('Backend Inquiry Security & Validation Rules', () => {
    let validToken;

    beforeAll(() => {
        // Generate a test JWT token
        validToken = jwt.sign(
            { id: 'test-user-id', email: 'agent1@coffeeninja.com', role: 'AGENT', name: 'Agent One' },
            process.env.JWT_SECRET || 'super-secret-key-change-this-in-production',
            { expiresIn: '1h' }
        );
    });

    test('POST /api/inquiries - Should reject unauthenticated requests with 401', async () => {
        const res = await request(app).post('/api/inquiries').send({
            customerName: 'Test Customer',
            contactInfo: 'test@example.com',
            subject: 'Invalid Auth',
            description: 'Testing unauthenticated block',
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('UNAUTHORIZED');
    });

    test('PATCH /api/inquiries/:id/status - Should reject invalid status transition with 400', async () => {
        // Mocking an attempt to update an inquiry with an unallowed status payload
        const res = await request(app)
            .patch('/api/inquiries/non-existent-id/status')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ status: 'INVALID_STATUS' });

        expect(res.statusCode).toBe(400);
    });
});