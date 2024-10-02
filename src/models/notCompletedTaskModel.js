import mongoose from 'mongoose';

const notCompletedTaskSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' }, // Reference the student
  performer_type: { type: String, required: true },
  lowest_two_chapters: { type: Array, required: true },
  notCompletedTasks: {
    weeklyTasks: Array,
    dailyTasks: Array
  },
  savedAt: { type: Date, default: Date.now }
});

const NotCompletedTask = mongoose.model('NotCompletedTask', notCompletedTaskSchema);
export default NotCompletedTask;
