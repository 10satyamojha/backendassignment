import Task from '../models/Task.js';

export const getTaskAnalytics = async (req, res) => {
  const redisClient = req.app.get('redisClient');
  const cacheKey = `taskAnalytics:${req.user._id}`;

  // Check if data is in cache
  redisClient.get(cacheKey, async (err, data) => {
    if (data) {
      // If cache exists, return cached data
      return res.json(JSON.parse(data));
    }

    try {
      // Fetch task analytics data from DB
      const totalTasks = await Task.countDocuments({});
      const completedTasks = await Task.countDocuments({ status: 'Completed' });
      const pendingTasks = await Task.countDocuments({ status: 'Pending' });
      const overdueTasks = await Task.countDocuments({
        dueDate: { $lt: new Date() },
        status: { $ne: 'Completed' },
      });

      const result = {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      };

      // Cache the result for 1 hour (3600 seconds)
      redisClient.setex(cacheKey, 3600, JSON.stringify(result));

      // Send response
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
