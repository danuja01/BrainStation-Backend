import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  performer_type: { type: String, required: true },
  lowest_two_chapters: { type: Array, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' }, // This line ensures the student ID can be stored
  tasks: {
    weeklyTasks: Array,
    dailyTasks: Array
  },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
