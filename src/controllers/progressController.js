import CompletedTask from '@/models/completedTaskModel';
import Prediction from '@/models/predictionModel';
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

    // Return prediction result
    return makeResponse({ res, status: 200, data: predictionResult });
  } catch (error) {
    console.error('Prediction Error:', error);
    return makeResponse({ res, status: 500, message: 'Failed to get prediction.' });
  }
};

export const getTaskRecommendationController = async (req, res) => {
  const { performer_type, lowest_two_chapters, Student_id } = req.body; // Get Student_id from the request body

  try {
    let studentObjectId = null;

    // If Student_id is provided, fetch the student data
    if (Student_id) {
      const studentData = await fetchStudentData(Student_id);

      if (!studentData) {
        return res.status(404).json({ message: 'Student not found with the provided ID' });
      }

      // If student data is found, retrieve the ObjectId
      studentObjectId = studentData._id;
      console.log('Student Object ID:', studentObjectId); // Log the student Object ID
    }

    // Generate task recommendations based on performer_type and lowest_two_chapters
    const taskRecommendations = await recommendTask(performer_type, lowest_two_chapters);

    // Create a new task and store studentObjectId (if available)
    const newTask = new Task({
      performer_type,
      lowest_two_chapters,
      tasks: taskRecommendations,
      student: studentObjectId || undefined // Only store the ObjectId if it exists
    });

    const savedTask = await newTask.save();

    // Return the saved task with the generated ID
    return res.status(201).json({ data: { _id: savedTask._id, tasks: savedTask.tasks, student: savedTask.student } });
  } catch (error) {
    console.error('Error generating task:', error);
    return res.status(500).json({ message: 'Failed to generate task.', error: error.message });
  }
};

export const deleteSubtaskFromTaskController = async (req, res) => {
  const { taskId, subtaskType, taskIndex, subTaskIndex } = req.body;

  if (!taskId || typeof taskIndex === 'undefined' || typeof subTaskIndex === 'undefined') {
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

    // Validate taskIndex and subTaskIndex
    if (!targetTaskArray || !targetTaskArray[taskIndex] || !targetTaskArray[taskIndex].subTasks[subTaskIndex]) {
      return res.status(400).json({ message: 'Invalid taskIndex or subtaskIndex.' });
    }

    // Remove the subtask
    const deletedSubtask = targetTaskArray[taskIndex].subTasks.splice(subTaskIndex, 1)[0];

    // Mark task as modified and save
    task.markModified(`tasks.${taskType}`);
    await task.save();

    // Save the deleted subtask to the CompletedTask collection
    const completedTask = new CompletedTask({
      task_id: task._id,
      student: task.student, // Add student object ID to the completed task
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
