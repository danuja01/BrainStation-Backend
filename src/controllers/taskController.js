import { moduleLogger } from '@sliit-foss/module-logger';
import mongoose from 'mongoose';
import CompletedTask from '@/models/completedTaskModel';
import NotCompletedTask from '@/models/notCompletedTaskModel';
import Task from '@/models/taskModel';
import { recommendTask } from '@/services/taskService';

const logger = moduleLogger('task-recommendation-controller');

export const getTaskRecommendationController = async (req, res) => {
  const { performer_type, lowest_two_chapters } = req.body;
  const userId = req.user._id; // Assuming you're using a middleware to add `user` object to the request

  try {
    // Validate required fields `userId` and `performer_type`
    if (!userId || !performer_type) {
      return res.status(400).json({ message: 'Missing or invalid required fields.' });
    }

    // Step 1: Check if an existing task set exists for the same user and data
    const existingTaskSet = await Task.findOne({
      student: userId,
      performer_type: performer_type,
      ...(lowest_two_chapters && { lowest_two_chapters: { $eq: lowest_two_chapters } })
    });

    if (existingTaskSet) {
      // If the data matches, return the existing task set
      return res.status(200).json({ data: existingTaskSet });
    }

    // Step 2: Delete any old task set for the user if no matching task set is found
    const oldTaskSet = await Task.findOne({ student: userId });
    if (oldTaskSet) {
      const notCompletedTask = new NotCompletedTask({
        task_id: oldTaskSet._id,
        student: oldTaskSet.student,
        performer_type: oldTaskSet.performer_type,
        lowest_two_chapters: oldTaskSet.lowest_two_chapters,
        createdAt: oldTaskSet.createdAt
      });
      await notCompletedTask.save();
      await Task.deleteOne({ student: userId }); // Delete old task set from Task collection
    }

    // Step 3: Conditional Task Generation Based on Data Availability
    let newTasks;
    if (lowest_two_chapters && lowest_two_chapters.length >= 2) {
      // Generate full task set including chapter-specific tasks
      newTasks = recommendTask(performer_type, lowest_two_chapters);
    } else {
      // Generate tasks based only on performer_type when chapters are missing
      newTasks = recommendTask(performer_type, []); // Pass an empty array for chapters
    }

    // Step 4: Save the new task set
    const newTask = new Task({
      performer_type,
      lowest_two_chapters: lowest_two_chapters || [], // Save as empty array if not provided
      tasks: newTasks,
      student: userId
    });

    const savedTask = await newTask.save();

    // Log the successful creation
    logger.info('New task set created:', savedTask);

    // Return the newly generated task set
    return res.status(201).json({ data: savedTask });
  } catch (error) {
    logger.error('Task generation error:', error.message);
    return res.status(500).json({ message: 'Task generation failed', error: error.message });
  }
};

export const deleteSubtaskFromTaskController = async (req, res) => {
  const { taskId, taskType, taskIndex, subTaskIndex } = req.body;

  // Validate input
  if (!taskId || typeof taskIndex === 'undefined' || typeof subTaskIndex === 'undefined' || !taskType) {
    return res.status(400).json({ message: 'Missing required fields: taskId, taskIndex, subTaskIndex, or taskType' });
  }

  try {
    // Fetch the task by its ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Ensure the taskType is either weeklyTasks or dailyTasks
    if (taskType !== 'weeklyTasks' && taskType !== 'dailyTasks') {
      return res.status(400).json({ message: 'Invalid task type. Use "weeklyTasks" or "dailyTasks".' });
    }

    // Access the appropriate task array (either weeklyTasks or dailyTasks)
    const taskTypeArray = task.tasks[taskType];

    // Validate that the task array and indices exist
    if (!taskTypeArray || !taskTypeArray[taskIndex] || !taskTypeArray[taskIndex].subTasks[subTaskIndex]) {
      return res.status(400).json({ message: 'Invalid taskIndex or subTaskIndex.' });
    }

    // Remove the subtask from the task array
    const deletedSubtask = taskTypeArray[taskIndex].subTasks.splice(subTaskIndex, 1)[0];

    // Mark the task as modified and save the updated task
    task.markModified(`tasks.${taskType}`);
    await task.save();

    // Save the deleted subtask to the CompletedTask collection
    const completedTask = new CompletedTask({
      task_id: task._id,
      student: task.student, // Store the student object ID
      performer_type: task.performer_type,
      lowest_two_chapters: task.lowest_two_chapters,
      completedSubtask: {
        task: taskTypeArray[taskIndex].task, // The main task
        subTask: deletedSubtask // The deleted subtask
      },
      completedAt: new Date()
    });

    await completedTask.save(); // Save the completed task

    // Return success response
    return res.status(200).json({
      message: 'Subtask deleted and saved to CompletedTask collection',
      updatedTask: task,
      completedTask
    });
  } catch (error) {
    logger.error('Error deleting subtask:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCompletedTasksCount = async (req, res) => {
  const userId = req.user._id;
  logger.info('Received userId:', userId);

  // Validate if the userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId format.' });
  }

  try {
    const completedTasksCount = await CompletedTask.countDocuments({ student: new mongoose.Types.ObjectId(userId) });

    if (completedTasksCount === 0) {
      return res.status(404).json({ message: 'No completed tasks found for this student.' });
    }

    return res.status(200).json({ completedTasksCount });
  } catch (error) {
    logger.error('Error fetching completed tasks count:', error.message);
    return res.status(500).json({ message: 'Failed to fetch completed tasks count.' });
  }
};

export const getCompletedTasksByUserIdController = async (req, res) => {
  const userId = req.user._id;

  try {
    const completedTasks = await CompletedTask.find({ student: userId });

    if (completedTasks.length === 0) {
      return res.status(404).json({ message: 'No completed tasks found for this user ID.' });
    }

    res.status(200).json({ completedTasks });
  } catch (error) {
    logger.error('Error fetching completed tasks by user ID:', error);
    res.status(500).json({ message: 'Failed to fetch completed tasks', error: error.message });
  }
};
