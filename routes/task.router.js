import express from 'express';
import { 
  createTask, 
  getTasksForUser, 
  getTaskById, 
  updateTask, 
  deleteTask, 
  assignTaskToUser, 
  getAssignedTasks, 
  updateTaskAssignment 
} from '../controllers/user.controllers.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyRole } from '../middleware/Rolemiddleware.js';

const router = express.Router();

// Task Management Routes
router.post("/", verifyJWT, createTask); // Create a new task (Admin and Manager)
router.get("/", verifyJWT, getTasksForUser); // Retrieve tasks accessible to the logged-in user
router.get("/:id", verifyJWT, getTaskById); // Get task details by task ID
router.patch("/:id", verifyJWT, updateTask); // Update task details
router.delete("/:id", verifyJWT, deleteTask); // Delete task by ID

// Task Assignment Routes
router.post("/:id/assign", verifyJWT, verifyRole(['admin', 'manager']), assignTaskToUser); // Assign task to a user
router.get("/assigned", verifyJWT, getAssignedTasks); // View all tasks assigned to the logged-in user
router.patch("/:id/reassign", verifyJWT, verifyRole(['admin', 'manager']), updateTaskAssignment); // Reassign task to a different user


router.get('/tasks', authMiddleware(['admin', 'manager', 'user']), rateLimitByRole(15 * 60 * 1000, { admin: 100, manager: 50, user: 30 }), getTasks);
router.get('/filtered', authMiddleware(['admin', 'manager', 'user']), getFilteredTasks);

export default router;
