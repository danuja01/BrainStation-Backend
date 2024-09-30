import mongoose from 'mongoose';

// Define the schema for task sets
const TaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true }, // Unique ID for the task set
  performerType: { type: String, required: true },
  lowestTwoChapters: [{ type: String }], // Store the lowest two chapters
  tasks: [{
    task: String,
    subTasks: [String],
    completed: { type: Boolean, default: false },
    completionDate: Date
  }],
  category: { type: String, enum: ['weekly', 'daily'], default: 'weekly' }, // Task category (weekly/daily)
  createdAt: { type: Date, default: Date.now } // Timestamp when the task was generated
});

// Create and export the model
const TaskModel = mongoose.model('Task', TaskSchema);
export default TaskModel;
