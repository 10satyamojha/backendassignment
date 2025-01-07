import express from 'express';
import userRouter from './user.routes.js';
import taskRouter from './task.router.js';

const router = express.Router();

// Combine all routes
router.use('/users', userRouter); // Routes for user management
router.use('/tasks', taskRouter); // Routes for task management

export default router;
