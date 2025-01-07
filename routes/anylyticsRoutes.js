import express from 'express';
import { getTaskAnalytics } from '../controllers/analytices.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/tasks', authMiddleware(['admin', 'manager']), getTaskAnalytics);

export default router;
