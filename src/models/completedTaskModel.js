// models/completedTaskModel.js
import mongoose from 'mongoose';

const completedTaskSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }, // Reference to the original task
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' }, // Store the student object ID here
  performer_type: { type: String, required: true },
  lowest_two_chapters: { type: Array, required: true },
  completedSubtask: {
    task: { type: String, required: true }, // The parent task title
    subTask: { type: String, required: true } // The deleted subtask
  },
  completedAt: { type: Date, default: Date.now }
});

const CompletedTask = mongoose.model('CompletedTask', completedTaskSchema);
export default CompletedTask;
