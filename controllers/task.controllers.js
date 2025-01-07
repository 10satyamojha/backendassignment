import Task from '../models/task.model.js';

export const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};
export const getTasksForUser = async (req, res, next) => {
    try {
      const tasks = await Task.find({ assignedTo: req.user.id });
      res.status(200).json({ success: true, tasks });
    } catch (error) {
      next(error);
    }
  };
  export const getTaskById = async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
  
      if (!task) {
        throw new ApiError(404, 'Task not found.');
      }
  
      res.status(200).json({ success: true, task });
    } catch (error) {
      next(error);
    }
  };
  export const updateTask = async (req, res, next) => {
    try {
      const { title, description, dueDate, priority, status } = req.body;
  
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, dueDate, priority, status },
        { new: true }
      );
  
      if (!task) {
        throw new ApiError(404, 'Task not found.');
      }
  
      res.status(200).json({ success: true, task });
    } catch (error) {
      next(error);
    }
  };
  export const deleteTask = async (req, res, next) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
  
      if (!task) {
        throw new ApiError(404, 'Task not found.');
      }
  
      res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    } catch (error) {
      next(error);
    }
  };
  export const assignTask = async (req, res, next) => {
    try {
      const { assignedTo } = req.body;
  
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { assignedTo },
        { new: true }
      );
  
      if (!task) {
        throw new ApiError(404, 'Task not found.');
      }
  
      res.status(200).json({ success: true, task });
    } catch (error) {
      next(error);
    }
  };
  export const getTasks = async (req, res, next) => {
    try {
      const tasks = await Task.find();
      res.status(200).json({ success: true, tasks });
    } catch (error) {
      next(error);
    }
  };
  export const updateTaskAssignment = async (req, res, next) => {
    try {
      const { assignedTo } = req.body;
  
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { assignedTo },
        { new: true }
      );
  
      if (!task) {
        throw new ApiError(404, 'Task not found.');
      }
  
      res.status(200).json({ success: true, task });
    } catch (error) {
      next(error);
    }
  };
              