const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Allowed status transition rules
const ALLOWED_TRANSITIONS = {
    NEW: ['IN_PROGRESS', 'RESOLVED'],
    IN_PROGRESS: ['RESOLVED', 'NEW'],
    RESOLVED: ['IN_PROGRESS'] // Reopening allowed
};

// Zod schema for input validation
const createInquirySchema = z.object({
    customerName: z.string().min(2, 'Customer name is required'),
    contactInfo: z.string().min(3, 'Contact information is required'),
    subject: z.string().min(3, 'Subject must be at least 3 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters')
});

// 1. POST /api/inquiries - Create new inquiry
router.post('/', authenticateToken, async (req, res) => {
    const result = createInquirySchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: 'VALIDATION_ERROR',
            details: result.error.errors.map(e => e.message)
        });
    }

    try {
        const inquiry = await prisma.inquiry.create({
            data: {
                ...result.data,
                createdById: req.user.id
            }
        });
        return res.status(201).json(inquiry);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to create inquiry' });
    }
});

// 2. GET /api/inquiries - List and filter inquiries
router.get('/', authenticateToken, async (req, res) => {
    const { status, search } = req.query;

    const where = {};
    if (status) {
        where.status = status;
    }
    if (search) {
        where.OR = [
            { subject: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } }
        ];
    }

    try {
        const inquiries = await prisma.inquiry.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } }
            }
        });
        return res.json(inquiries);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to fetch inquiries' });
    }
});

// 3. GET /api/inquiries/:id - Get detail
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const inquiry = await prisma.inquiry.findUnique({
            where: { id: req.params.id },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } }
            }
        });

        if (!inquiry) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Inquiry not found' });
        }

        return res.json(inquiry);
    } catch (err) {
        return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid inquiry ID format' });
    }
});

// 4. PATCH /api/inquiries/:id/status - Status Transition Logic
router.patch('/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'BAD_REQUEST', message: 'Status is required' });
    }

    try {
        const inquiry = await prisma.inquiry.findUnique({
            where: { id: req.params.id }
        });

        if (!inquiry) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Inquiry not found' });
        }

        // Check transition rules
        const allowed = ALLOWED_TRANSITIONS[inquiry.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                error: 'INVALID_STATUS_TRANSITION',
                message: `Cannot transition status from ${inquiry.status} to ${status}`
            });
        }

        const updated = await prisma.inquiry.update({
            where: { id: req.params.id },
            data: { status }
        });

        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to update status' });
    }
});

module.exports = router;