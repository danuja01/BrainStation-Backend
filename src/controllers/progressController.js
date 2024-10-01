import CompletedTask from '@/models/completedTaskModel';
import Task from '@/models/taskModel';
import { fetchStudentData, predictExamScore, recommendTask } from '@/services/progressService';
import { makeResponse } from '@/utils';

// Controller to fetch student details by ID
export const getStudentDetailsController = async (req, res) => {
  const { Student_id } = req.params;
  const studentData = await fetchStudentData(Student_id);

  if (!studentData) {
    return makeResponse({ res, status: 404, message: 'Student not found.' });
  }

  return makeResponse({ res, status: 200, data: studentData });
};

// Controller to predict exam score by Student ID

// export const getPredictionController = async (req, res) => {
//     const { Student_id } = req.body;
//     console.log("POST Student ID:", Student_id);

//     const studentData = await fetchStudentData(Student_id);

//     if (!studentData) {
//       console.log("Student not found for ID:", Student_id);
//       return makeResponse({ res, status: 404, message: 'Student not found.' });
//     }

//     const predictionResult = await predictExamScore(studentData);
//     return makeResponse({ res, status: 200, data: predictionResult });
//   };

export const getPredictionController = async (req, res) => {
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

    // Return prediction result
    return makeResponse({ res, status: 200, data: predictionResult });
  } catch (error) {
    console.error('Prediction Error:', error);
    return makeResponse({ res, status: 500, message: 'Failed to get prediction.' });
  }
};

export const getTaskRecommendationController = async (req, res) => {
  const { performer_type, lowest_two_chapters } = req.body;

  try {
    // Get task recommendations based on performer_type and chapters
    const taskRecommendations = await recommendTask(performer_type, lowest_two_chapters);

    // Create a new task document and save it to the MongoDB collection
    const newTask = new Task({
      performer_type,
      lowest_two_chapters,
      tasks: taskRecommendations
    });

    // Save the task in the database
    const savedTask = await newTask.save();

    // Log the saved task to verify it includes _id
    console.log('Saved task:', savedTask);

    // Return the saved task, including _id
    return res.status(201).json({ data: { _id: savedTask._id, tasks: savedTask.tasks } });
  } catch (error) {
    console.error('Error saving tasks:', error);
    return res.status(500).json({ message: 'Failed to save task recommendations.', error: error.message });
  }
};

export const deleteSubtaskFromTaskController = async (req, res) => {
  // Log the request body for debugging
  console.log('Received delete request with data:', req.body);

  const { taskId, subtaskType, taskIndex, subTaskIndex } = req.body;

  // Check if the required fields are missing
  if (!taskId || typeof taskIndex === 'undefined' || typeof subTaskIndex === 'undefined') {
    console.log('Missing fields:', { taskId, taskIndex, subTaskIndex }); // Log missing fields for better debugging
    return res.status(400).json({ message: 'Missing required fields: taskId, taskIndex, or subtaskIndex' });
  }

  try {
    // Find the task by its ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Determine if it's a weekly or daily task
    const taskType = subtaskType === 'weekly' ? 'weeklyTasks' : 'dailyTasks';
    const targetTaskArray = task.tasks[taskType];

    // Validate that taskIndex and subTaskIndex point to valid items
    if (!targetTaskArray || !targetTaskArray[taskIndex] || !targetTaskArray[taskIndex].subTasks[subTaskIndex]) {
      return res.status(400).json({ message: 'Invalid taskIndex or subtaskIndex.' });
    }

    // Remove the subtask
    const deletedSubtask = targetTaskArray[taskIndex].subTasks.splice(subTaskIndex, 1)[0];

    // Mark the task as modified and save
    task.markModified(`tasks.${taskType}`);
    await task.save();

    // Save the deleted subtask to the CompletedTask collection
    const completedTask = new CompletedTask({
      task_id: task._id,
      performer_type: task.performer_type,
      lowest_two_chapters: task.lowest_two_chapters,
      completedSubtask: {
        task: targetTaskArray[taskIndex].task,
        subTask: deletedSubtask
      },
      completedAt: new Date()
    });

    await completedTask.save();

    return res.status(200).json({
      message: 'Subtask deleted and saved to CompletedTask collection',
      updatedTask: task,
      completedTask
    });
  } catch (error) {
    console.error('Error deleting subtask:', error);
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
    console.error('Error fetching completed tasks:', error);
    res.status(500).json({ message: 'Failed to fetch completed tasks', error: error.message });
  }
};
