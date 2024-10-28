import mongoose from 'mongoose';

const notCompletedTaskSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  performer_type: { type: String, required: true },
  lowest_two_chapters: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

const NotCompletedTask = mongoose.model('NotCompletedTask', notCompletedTaskSchema);
export default NotCompletedTask;
