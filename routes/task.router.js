import express from 'express';
import {
  createTask,
  getTasksForUser,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  getTasks,
  updateTaskAssignment,
} from '../controllers/task.controllers.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyRole } from '../middleware/Rolemiddleware.js';

const router = express.Router();

// Task Management Routes
router.post('/', verifyJWT, verifyRole(['admin', 'manager']), createTask); // Create a new task
router.get('/', verifyJWT, getTasksForUser); // Get tasks for the authenticated user
router.get('/:id', verifyJWT, getTaskById); // Get task details by ID
router.patch('/:id', verifyJWT, updateTask); // Update task details
router.delete('/:id', verifyJWT, deleteTask); // Delete task by ID

// Task Assignment Routes
router.post('/:id/assign', verifyJWT, verifyRole(['admin', 'manager']), assignTask); // Assign task to a user
router.get('/assigned', verifyJWT, getTasks); // Get all tasks assigned to the user
router.patch('/:id/reassign', verifyJWT, verifyRole(['admin', 'manager']), updateTaskAssignment); // Reassign task

export default router;
