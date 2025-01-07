import mongoose from 'mongoose';

// Define Task Schema
const TaskSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Task title is required'], 
      trim: true 
    },
    description: { 
      type: String, 
      trim: true 
    },
    dueDate: { 
      type: Date, 
      validate: {
        validator: function(value) {
          return value >= new Date();
        },
        message: 'Due date must be in the future.',
      },
    },
    priority: { 
      type: String, 
      enum: ['Low', 'Medium', 'High'], 
      default: 'Medium' 
    },
    status: { 
      type: String, 
      enum: ['Pending', 'In Progress', 'Completed'], 
      default: 'Pending' 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      default: null 
    },
  },
  { 
    timestamps: true 
  }
);

// Index for better query performance
TaskSchema.index({ createdBy: 1, assignedTo: 1, priority: 1 });

// Virtual field for task duration
TaskSchema.virtual('isOverdue').get(function () {
  return this.dueDate && this.dueDate < new Date();
});

// Pre-save hook for data integrity
TaskSchema.pre('save', function (next) {
  if (!this.createdBy) {
    return next(new Error('Task must have a creator (createdBy field)'));
  }
  next();
});

// Method to change task status
TaskSchema.methods.updateStatus = async function (newStatus) {
  if (!['Pending', 'In Progress', 'Completed'].includes(newStatus)) {
    throw new Error('Invalid status');
  }
  this.status = newStatus;
  return await this.save();
};

// Static method to get all tasks assigned to a user
TaskSchema.statics.getTasksForUser = async function (userId) {
  return await this.find({ assignedTo: userId });
};

// Static method to filter tasks by priority
TaskSchema.statics.filterByPriority = async function (priority) {
  return await this.find({ priority });
};

// Export the Task model
export default mongoose.model('Task', TaskSchema);
