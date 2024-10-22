import { moduleLogger } from '@sliit-foss/module-logger';
import mongoose from 'mongoose';
import { getUserData } from '@/controllers/algorithm';
import CompletedTask from '@/models/completedTaskModel';
import Task from '@/models/taskModel';
import {
  predictExamScore,
  predictScoresForAllModules,
  recommendTask
} from '@/services/progressService';
import { makeResponse } from '@/utils';

const logger = moduleLogger('progress-controller');

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
      console.log("User ID received:", userId); // Add this log
  
      const predictions = await predictScoresForAllModules(userId);
      if (!predictions) {
        console.log("No predictions found"); // Log if predictions are missing
        return res.status(404).json({ message: 'No predictions found for this user.' });
      }
  
      return res.status(200).json(predictions);
    } catch (error) {
      console.error("Error predicting scores:", error.message); // Log error details
      return res.status(500).json({ message: `Failed to predict scores: ${error.message}` });
    }
  };
  





export const getCompletedTasksCount = async (req, res) => {
 
};


export const getTaskRecommendationController = async (req, res) => {
};


export const deleteSubtaskFromTaskController = async (req, res) => {
  
};


export const getCompletedTasksByTaskIdController = async (req, res) => {
 
};


