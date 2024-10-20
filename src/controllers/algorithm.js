import { findAverageFocusTimeByUser, findTotalSessionDurationByUser } from '@/services/focus-record';
import { fetchModuleById } from '@/services/module';
import { getQuizzesScoreService } from '@/services/quiz';

// Controller to get user data
export const getUserData = async (userId, moduleId) => {
  const quizDataFilter = {
    moduleId: moduleId
  };

  try {
    // Focus and Study Time APIs
    const focusData = await findAverageFocusTimeByUser(userId);
    const studyTimeData = await findTotalSessionDurationByUser(userId);
    const quizData = await getQuizzesScoreService(userId, quizDataFilter);

    // Create a set to store unique module names and a variable to store scores
    const moduleDetails = await fetchModuleById(moduleId);
    const moduleName = moduleDetails.name;
    let totalScore = 0;
    let quizCount = 0;

    // Array to store the quiz results
    const formattedQuizzes = [];

    // Loop through each quiz and fetch the score for each lecture
    for (const quiz of quizData?.docs || []) {
      const lectureScore = quiz.averageScore * 100 || 0;

      // Accumulate total score and count quizzes
      totalScore += lectureScore;
      quizCount++;

      // Format the quiz with the score and lecture details
      formattedQuizzes.push({
        lectureTitles: quiz.lectureTitle,
        score: lectureScore
      });
    }

    // Calculate average score
    const averageScore = quizCount > 0 ? totalScore / quizCount : 0;

    // Combine the data
    const combinedData = {
      userId,
      focusLevel: focusData || null,
      timeSpentStudying: studyTimeData || null,
      quizzes: formattedQuizzes, // Include the formatted quizzes
      moduleName: moduleName, // Include unique module names
      totalScore: totalScore.toFixed(2) === '0.00' ? '1.50' : totalScore.toFixed(2),
      averageScore: averageScore.toFixed(2) // Average score, rounded to 2 decimals
    };

    return combinedData;
  } catch (error) {
    throw new Error('Error when combining user data');
  }
};
