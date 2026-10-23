const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

describe('Backend Inquiry Security & Validation Rules', () => {
    let adminToken;

    beforeAll(() => {
        // Generate an ADMIN JWT token so it passes the RBAC authorization middleware
        adminToken = jwt.sign(
            { id: 'admin-user-id', email: 'admin@coffeeninja.com', role: 'ADMIN', name: 'Admin User' },
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
        const res = await request(app)
            .patch('/api/inquiries/non-existent-id/status')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'INVALID_STATUS' });

        expect(res.statusCode).toBe(400);
    });
});