

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
    const { Student_id } = req.body;
    console.log("POST Student ID for task recommendation:", Student_id); 
  
    const studentData = await fetchStudentData(Student_id);
  
    if (!studentData) {
      console.log("Student not found for ID:", Student_id); 
      return makeResponse({ res, status: 404, message: 'Student not found.' });
    }
  
    const taskRecommendations = await recommendTask(studentData);
    return makeResponse({ res, status: 200, data: taskRecommendations });
  };
  