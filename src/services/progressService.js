

import axios from 'axios';
import { fetchStudentDataFromDB } from '@/repository/studentProfile';
import { calculateCumulativeAverage, getLowestTwoChapters } from '@/utils/progressUtils';


// Fetch student data from MongoDB
export const fetchStudentData = async (Student_id) => {
  try {
    const studentData = await fetchStudentDataFromDB(Student_id);
    return studentData;
  } catch (error) {
    console.error('Error fetching student data:', error);
    throw new Error('Error fetching student data');
  }
};




export const predictExamScore = async (studentData) => {
  // Calculate cumulative average of quiz scores
  const cumulativeAverage = calculateCumulativeAverage(studentData); 


  let performer_type = "Low Performer";
  if (cumulativeAverage > 80) {
    performer_type = "Excellent Performer";
  } else if (cumulativeAverage > 50) {
    performer_type = "Medium Performer";
  }
  

  // Get the lowest two chapters based on quiz scores
  const lowestTwoChapters = getLowestTwoChapters(studentData);

 

  // Prepare input data for the Python service
  const inputData = {
    focus_level: studentData.Focus_Level,
    emotional_state: studentData.Emotional_State,
    cumulative_average: cumulativeAverage, 
    time_spent_studying: parseInt(studentData.Time_Spent_Studying, 10), // Convert to integer
  };

  

  try {
    const response = await axios.post('http://localhost:8000/predict_exam_score/', inputData);
    const predicted_exam_score = response.data.predicted_exam_score;

    return {
      predicted_exam_score,
      lowest_two_chapters: lowestTwoChapters,
      performer_type: performer_type,
     // cumulativeAverage, 
    };
  } catch (error) {
    console.error('Error calling Python service:', error);
    throw new Error('Failed to get prediction from Python service');
  }
};


// Recommend tasks based on weak chapters

export const recommendTask = async (studentData) => {
    const lowestTwoChapters = getLowestTwoChapters(studentData); 

    
    // Check if the chapters were successfully retrieved
    if (!lowestTwoChapters || !lowestTwoChapters.length) {
      console.error("No quiz data found for task recommendation.");
      return { message: "No weak areas found for task recommendation." };
    }
  
    // Generate task recommendations
    const taskRecommendations = [
      {
        task: 'Start Doing Past Papers',
        description: `Focus on past papers for the weak chapters: ${lowestTwoChapters[0]?.chapter} and ${lowestTwoChapters[1]?.chapter}.`,
      },
      {
        task: `Watch Educational Videos for ${lowestTwoChapters[0]?.chapter}`,
        description: `Here are some recommended videos for ${lowestTwoChapters[0]?.chapter}.`,
        videos: [
          `https://www.youtube.com/results?search_query=${lowestTwoChapters[0]?.chapter}+lecture+1`,
          `https://www.youtube.com/results?search_query=${lowestTwoChapters[0]?.chapter}+lecture+2`
        ]
      },
      {
        task: `Watch Educational Videos for ${lowestTwoChapters[1]?.chapter}`,
        description: `Here are some recommended videos for ${lowestTwoChapters[1]?.chapter}.`,
        videos: [
          `https://www.youtube.com/results?search_query=${lowestTwoChapters[1]?.chapter}+lecture+1`,
          `https://www.youtube.com/results?search_query=${lowestTwoChapters[1]?.chapter}+lecture+2`
        ]
      }
    ];
  
    return taskRecommendations;
  };
  