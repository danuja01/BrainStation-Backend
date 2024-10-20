import { moduleLogger } from '@sliit-foss/module-logger';
import mongoose from 'mongoose';
import CompletedTask from '@/models/completedTaskModel';
import Task from '@/models/taskModel';
import { fetchStudentDataFromDB } from '@/repository/studentProfile';
import { fetchStudentData, predictExamScore, recommendTask } from '@/services/progressService';
import { makeResponse } from '@/utils';

const logger = moduleLogger('progress-controller');

// Controller to fetch student details by ID
export const getStudentDetailsController = async (req, res) => {
  const { Student_id } = req.params;
  const studentData = await fetchStudentData(Student_id);

  if (!studentData) {
    return makeResponse({ res, status: 404, message: 'Student not found.' });
  }

  return makeResponse({ res, status: 200, data: studentData });
};

export const postPredictionController = async (req, res) => {
  const { Student_id } = req.body;

  if (!Student_id) {
    return makeResponse({ res, status: 400, message: 'Student ID is required' });
  }

  try {
    // Fetch student data using Student ID
    const studentData = await fetchStudentData(Student_id);
    if (!studentData) {
      return makeResponse({ res, status: 404, message: 'Student not found.' });
    }

    // Call prediction service
    const predictionResult = await predictExamScore(studentData);

    // Log the final result for debugging
    logger.info('Final Prediction Result:', predictionResult);

    // Return prediction result
    return makeResponse({ res, status: 200, data: predictionResult });
  } catch (error) {
    logger.error('Prediction Error:', error);
    return makeResponse({ res, status: 500, message: 'Failed to get prediction.' });
  }
};

export const getTaskRecommendationController = async (req, res) => {
  const { performer_type, lowest_two_chapters, Student_id } = req.body;

  try {
    let studentObjectId = null;

    // Check if Student_id is provided
    if (Student_id) {
      const studentData = await fetchStudentData(Student_id);

      if (!studentData) {
        return res.status(404).json({ message: 'Student not found with the provided ID' });
      }

      studentObjectId = studentData._id;
    }

    // Check if the student already has an active task set
    const existingTaskSet = await Task.findOne({ student: studentObjectId });

    if (existingTaskSet) {
      // Compare performer type and lowest mark areas
      const isSamePerformerType = existingTaskSet.performer_type === performer_type;
      const isSameLowestChapters =
        JSON.stringify(existingTaskSet.lowest_two_chapters) === JSON.stringify(lowest_two_chapters);

      if (isSamePerformerType && isSameLowestChapters) {
        // If performance and lowest chapters are the same, return the current task set excluding completed tasks
        const tasksWithoutCompleted = await excludeCompletedTasks(existingTaskSet);
        return res.status(200).json({ data: tasksWithoutCompleted });
      }

      // If performance or lowest chapters are different, move the old task set to `notcompleted` collection
      await moveTaskToNotCompletedCollection(existingTaskSet);
      await Task.deleteOne({ _id: existingTaskSet._id });
    }

    // Generate new task recommendations
    const taskRecommendations = await recommendTask(performer_type, lowest_two_chapters);

    // Create a new task and store studentObjectId (if available)
    const newTask = new Task({
      performer_type,
      lowest_two_chapters,
      tasks: taskRecommendations,
      student: studentObjectId || undefined
    });

    const savedTask = await newTask.save();

    // Return the new task set
    return res.status(201).json({ data: { _id: savedTask._id, tasks: savedTask.tasks, student: savedTask.student } });
  } catch (error) {
    logger.error('Error generating task:', error);
    return res.status(500).json({ message: 'Failed to generate task.', error: error.message });
  }
};

// Function to exclude completed tasks from the task set
const excludeCompletedTasks = async (taskSet) => {
  const completedTasks = await CompletedTask.find({ task_id: taskSet._id });
  const completedSubTasks = completedTasks.map((ct) => ct.completedSubtask.subTask);

  // Filter out completed subtasks from the task set
  taskSet.tasks.weeklyTasks.forEach((weeklyTask) => {
    weeklyTask.subTasks = weeklyTask.subTasks.filter((subTask) => !completedSubTasks.includes(subTask));
  });

  taskSet.tasks.dailyTasks.forEach((dailyTask) => {
    dailyTask.subTasks = dailyTask.subTasks.filter((subTask) => !completedSubTasks.includes(subTask));
  });

  return taskSet;
};

// Function to move old task set to the 'notcompleted' collection
const moveTaskToNotCompletedCollection = async (taskSet) => {
  // Define the NotCompletedTask model using the same schema as Task
  const NotCompletedTask = mongoose.model('NotCompletedTask', taskSet.schema); // Reuse the schema

  // Convert the taskSet object to a plain object and create a new instance of NotCompletedTask
  const notCompletedTask = new NotCompletedTask(taskSet.toObject());

  // Save the moved task set into the NotCompletedTask collection
  await notCompletedTask.save();
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

// Fetch completed tasks by taskId
export const getCompletedTasksByTaskIdController = async (req, res) => {
  const { taskId } = req.params;

  try {
    // Fetch completed tasks for the given taskId
    const completedTasks = await CompletedTask.find({ task_id: taskId });

    // If no completed tasks are found, return 404
    if (completedTasks.length === 0) {
      return res.status(404).json({ message: 'No completed tasks found for this task ID.' });
    }

    // Return the completed tasks with a 200 status
    res.status(200).json({ completedTasks });
  } catch (error) {
    logger.error('Error fetching completed tasks:', error);
    res.status(500).json({ message: 'Failed to fetch completed tasks', error: error.message });
  }
};

// Controller to fetch completed tasks count based on student ID
export const getCompletedTasksCount = async (req, res) => {
  const { studentId } = req.params; // Get the student ID from the request params

  try {
    // Fetch student data from the database to get the student object ID
    const studentData = await fetchStudentDataFromDB(studentId);

    if (!studentData || !studentData._id) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const studentObjectId = studentData._id; // Extract the student object ID

    // Count the completed tasks for the student using their ObjectId
    const completedTasksCount = await CompletedTask.countDocuments({ student: studentObjectId });

    if (!completedTasksCount) {
      return res.status(404).json({ message: 'No completed tasks found for this student.' });
    }

    // Return the count of completed tasks
    res.status(200).json({ completedTasksCount });
  } catch (error) {
    logger.error('Error fetching completed tasks count:', error);
    res.status(500).json({ message: 'Failed to fetch completed tasks count.' });
  }
};
