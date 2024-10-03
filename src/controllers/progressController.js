import moment from 'moment';
import CompletedTask from '@/models/completedTaskModel';
import Prediction from '@/models/predictionModel';
import Task from '@/models/taskModel';
import { fetchStudentDataFromDB } from '@/repository/studentProfile';
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
  const { performer_type, lowest_two_chapters, studentId } = req.body;

  try {
    // Check if tasks already exist for the student this week
    const existingTask = await Task.findOne({
      student: studentId,
      createdAt: {
        $gte: moment().startOf('week').toDate(), // Fetch tasks created this week
      },
    });

    if (existingTask) {
      // If tasks already exist for this week, return them
      return res.status(200).json({ data: { _id: existingTask._id, tasks: existingTask.tasks } });
    }

    // Generate new tasks because no tasks exist for this week
    const taskRecommendations = await recommendTask(performer_type, lowest_two_chapters);

    const newTask = new Task({
      student: studentId,
      performer_type,
      lowest_two_chapters,
      tasks: taskRecommendations,
    });

    const savedTask = await newTask.save();
    return res.status(201).json({ data: { _id: savedTask._id, tasks: savedTask.tasks } });
  } catch (error) {
    console.error('Error saving tasks:', error);
    return res.status(500).json({ message: 'Failed to save task recommendations.', error: error.message });
  }
};


export const deleteSubtaskFromTaskController = async (req, res) => {
  const { taskId, subtaskType, taskIndex, subTaskIndex, studentId } = req.body;

  if (!taskId || typeof taskIndex === 'undefined' || typeof subTaskIndex === 'undefined') {
    return res.status(400).json({ message: 'Missing required fields: taskId, taskIndex, or subtaskIndex' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskType = subtaskType === 'weekly' ? 'weeklyTasks' : 'dailyTasks';
    const targetTaskArray = task.tasks[taskType];

    if (!targetTaskArray || !targetTaskArray[taskIndex] || !targetTaskArray[taskIndex].subTasks[subTaskIndex]) {
      return res.status(400).json({ message: 'Invalid taskIndex or subtaskIndex.' });
    }

    const deletedSubtask = targetTaskArray[taskIndex].subTasks.splice(subTaskIndex, 1)[0];

    task.markModified(`tasks.${taskType}`);
    await task.save();

    const completedTask = new CompletedTask({
      task_id: task._id,
      performer_type: task.performer_type,
      lowest_two_chapters: task.lowest_two_chapters,
      completedSubtask: {
        task: targetTaskArray[taskIndex].task,
        subTask: deletedSubtask,
      },
      studentId, // Save the student ID for reference
      completedAt: new Date(),
    });

    await completedTask.save();

    return res.status(200).json({
      message: 'Subtask deleted and saved to CompletedTask collection',
      updatedTask: task,
      completedTask,
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

export const getPredictionController = async (req, res) => {
  const { Student_id } = req.body;

  if (!Student_id) {
    return makeResponse({ res, status: 400, message: 'Student ID is required' });
  }

  try {
    // Fetch student data using Student ID
    console.log('Fetching student data for Student ID:', Student_id);
    const studentData = await fetchStudentData(Student_id);
    if (!studentData) {
      return makeResponse({ res, status: 404, message: 'Student not found.' });
    }

    // Log student data
    console.log('Student data fetched:', studentData);

    // Call prediction service to get prediction
    const predictionResult = await predictExamScore(studentData);

    // Log the prediction result
    console.log('Prediction result:', predictionResult);

    // Update the prediction if it exists or insert a new one (upsert)
    const updatedPrediction = await Prediction.findOneAndUpdate(
      { student_id: studentData._id }, // Query based on student_id
      {
        student_id: studentData._id,
        predicted_exam_score: predictionResult.predicted_exam_score,
        performer_type: predictionResult.performer_type,
        lowest_two_chapters: predictionResult.lowest_two_chapters
      },
      { new: true, upsert: true } // Upsert: create if not found, return the updated document
    );

    // Log after saving/updating
    console.log('Prediction saved/updated:', updatedPrediction);

    // Return the prediction result
    return makeResponse({ res, status: 200, data: predictionResult });
  } catch (error) {
    console.error('Prediction Save/Update Error:', error);
    return makeResponse({ res, status: 500, message: 'Failed to get or save prediction.' });
  }
};
