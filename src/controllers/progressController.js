
import Task from '@/models/taskModel'; 
import { fetchStudentData, predictExamScore, recommendTask } from '@/services/progressService';
import CompletedTask from '@/models/completedTaskModel';
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

  console.log('Received body:', req.body);

  if (!performer_type || !lowest_two_chapters || lowest_two_chapters.length < 2) {
    return res.status(400).json({ message: 'Performer type and two lowest chapters are required.' });
  }

  try {
    // Get task recommendations based on performer_type and chapters
    const taskRecommendations = await recommendTask(performer_type, lowest_two_chapters);

    // Create a new task document and save it to the MongoDB collection
    const newTask = new Task({
      performer_type,
      lowest_two_chapters,
      tasks: taskRecommendations,
    });

    // Save the task in the database and include the _id
    const savedTask = await newTask.save();

    // Return the saved task (including the MongoDB-generated _id)
    return res.status(201).json({ data: savedTask });  // Ensure _id is included in the response
  } catch (error) {
    console.error('Error saving tasks:', error);
    return res.status(500).json({ message: 'Failed to save task recommendations.', error: error.message });
  }
};
export const deleteSubtaskFromTaskController = async (req, res) => {
  
  const { taskId, subtaskType, taskIndex, subtaskIndex } = req.body;

  console.log("Received delete request with data:", req.body); // Log incoming request

  if (!taskId || typeof taskIndex === 'undefined' || typeof subtaskIndex === 'undefined') {
    return res.status(400).json({ message: 'Missing required fields: taskId, taskIndex, or subtaskIndex' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const taskType = subtaskType === 'weekly' ? 'weeklyTasks' : 'dailyTasks';
    const targetTaskArray = task.tasks[taskType];

    if (!targetTaskArray || !targetTaskArray[taskIndex] || !targetTaskArray[taskIndex].subTasks[subtaskIndex]) {
      return res.status(400).json({ message: 'Invalid taskIndex or subtaskIndex.' });
    }

    const deletedSubtask = targetTaskArray[taskIndex].subTasks.splice(subtaskIndex, 1)[0];

    task.markModified(`tasks.${taskType}`);
    await task.save();

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
      message: "Subtask deleted and saved to CompletedTask collection",
      updatedTask: task,
      completedTask
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
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
    console.error("Error fetching completed tasks:", error);
    res.status(500).json({ message: "Failed to fetch completed tasks", error: error.message });
  }
};
