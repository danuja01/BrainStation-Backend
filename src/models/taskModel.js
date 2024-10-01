import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  performer_type: { type: String, required: true }, // No `unique: true`
  lowest_two_chapters: { type: Array, required: true }, // No `unique: true`
  tasks: {
    weeklyTasks: Array,
    dailyTasks: Array
  },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
