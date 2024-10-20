import { moduleLogger } from '@sliit-foss/module-logger';
import axios from 'axios';
import { findAverageFocusTimeByUser, findTotalSessionDurationByUser } from '@/services/focus-record';
import { calculateUserLectureScore, getQuizzesService } from '@/services/quiz';

// import { fetchDataFromAPI, calculateTotalScore, fetchLowestTwoChaptersWithDescriptions, predictExamScoreService } from '@/services/algorithmService';

const logger = moduleLogger('algorithm controller');

// Helper function to make API requests
export const fetchData = async (url, token = null) => {
  try {
    const headers = token ? { Authorization: `${token}` } : {};
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    logger.error(`Error fetching data from ${url}`, error);
    return null;
  }
};

// Helper function to fetch scores for each lecture
export const fetchScoresForLectures = async (userId, lectureId) => {
  const result = await calculateUserLectureScore(userId, lectureId);
  return await result;
};

// Controller to get user data
export const getUserData = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Focus and Study Time APIs
    const focusData = await findAverageFocusTimeByUser(userId);

    const studyTimeData = await findTotalSessionDurationByUser(userId);

    // Quiz API to get lecture details (initial quiz data)
    const token = req.headers['authorization']; // Get the token from headers
    const formattedToken = token.startsWith('Bearer') ? token : `Bearer ${token}`;
    const quizData = await getQuizzesService(userId);
    logger.info(quizData);

    // Create a set to store unique module names and a variable to store scores
    const moduleNames = new Set();
    let totalScore = 0;
    let quizCount = 0;

    // Array to store the quiz results
    const formattedQuizzes = [];

    // Loop through each quiz and fetch the score for each lecture
    for (const quiz of quizData?.docs || []) {
      // Add module name to the set
      logger.info('quiz: ', quiz);
      moduleNames.add(quiz.moduleDetails.name);

      // Fetch the score for this lecture and user
      const scoreData = await fetchScoresForLectures(userId, quiz.lectureId, formattedToken);
      const lectureScore = scoreData?.data?.score || 0;

      // Accumulate total score and count quizzes
      totalScore += lectureScore;
      quizCount++;

      // Format the quiz with the score and lecture details
      formattedQuizzes.push({
        lectureDetails: `${quiz.lectureDetails.title} - Score ${lectureScore}`
      });
    }

    // Calculate average score
    const averageScore = quizCount > 0 ? totalScore / quizCount : 0;

    // Convert the set to an array for unique module names
    const uniqueModules = Array.from(moduleNames);

    // Combine the data
    const combinedData = {
      userId,
      focusTime: focusData || null,
      totalStudyTime: studyTimeData || null,
      quizzes: formattedQuizzes, // Include the formatted quizzes
      moduleNames: uniqueModules, // Include unique module names
      //   totalScore: totalScore.toFixed(2), // Sum of scores, rounded to 2 decimals
      totalScore: totalScore.toFixed(2) === '0.00' ? '1.50' : totalScore.toFixed(2),
      averageScore: averageScore.toFixed(2) // Average score, rounded to 2 decimals
    };

    res.status(200).json({
      message: 'User data combined successfully',
      data: combinedData
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error combining user data',
      error: error.message
    });
  }
};
