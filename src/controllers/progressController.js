// import { moduleLogger } from '@sliit-foss/module-logger';
// import mongoose from 'mongoose';
import { getUserData } from '@/controllers/algorithm';
// import CompletedTask from '@/models/completedTaskModel';
// import Task from '@/models/taskModel';
import { predictExamScore, predictScoresForAllModules } from '@/services/progressService';
import { makeResponse } from '@/utils';

// Controller to fetch student Prediction by student ID and Module ID
export const postPredictionController = async (req, res) => {
  const { userId, moduleId } = req.body;

  if (!userId || !moduleId) {
    return makeResponse({ res, status: 400, message: 'User ID and Module ID are required' });
  }

  const studentData = await getUserData(userId, moduleId);
  if (!studentData) {
    return makeResponse({ res, status: 404, message: 'Student not found.' });
  }

  const predictionResult = await predictExamScore(studentData);
  const moduleName = studentData.moduleName || 'Module Name Not Found';

  return makeResponse({ res, status: 200, data: { ...predictionResult, moduleName } });
};

export const predictScoresForModules = async (req, res) => {
  try {
    const userId = req.user._id;
    const predictions = await predictScoresForAllModules(userId);
    if (!predictions) {
      // Log if predictions are missing
      return res.status(404).json({ message: 'No predictions found for this user.' });
    }
    return res.status(200).json(predictions);
  } catch (error) {
    // Log error details
    return res.status(500).json({ message: `Failed to predict scores: ${error.message}` });
  }
};

export const getCompletedTasksCount = async () => {};

export const getTaskRecommendationController = async () => {};

export const deleteSubtaskFromTaskController = async () => {};

export const getCompletedTasksByTaskIdController = async () => {};
