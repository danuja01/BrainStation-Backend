import User from '@/models/user';
import {
  countDistinctSessionDaysByUserId,
  findAverageFocusTimeByUser,
  findTotalSessionDurationByUser
} from '@/services/focus-record';
import { fetchModuleById } from '@/services/module';
import { getQuizzesScoreService } from '@/services/quiz';

// export const getUserData = async (userId, moduleId) => {
//   const quizDataFilter = {
//     moduleId: moduleId
//   };
//   try {
//     const focusData = await findAverageFocusTimeByUser(userId);
//     const studyTimeData = await findTotalSessionDurationByUser(userId);
//     const quizData = await getQuizzesScoreService(userId, quizDataFilter);
//     const moduleDetails = await fetchModuleById(moduleId);
//     if (!moduleDetails) {
//       throw new Error(`Module with ID ${moduleId} not found`);
//     }
//     const moduleName = moduleDetails.name;
//     let totalScore = 0;
//     let quizCount = 0;

//     // Array to store the quiz results
//     const formattedQuizzes = [];

//     for (const quiz of quizData?.docs || []) {
//       const lectureScore = quiz.averageScore * 100 || 0;
//       totalScore += lectureScore;
//       quizCount++;

//       formattedQuizzes.push({
//         lectureTitles: quiz.lectureTitle,
//         score: lectureScore
//       });
//     }
//     const averageScore = quizCount > 0 ? totalScore / quizCount : 0;
//     return {
//       userId,
//       focusLevel: focusData || null,
//       timeSpentStudying: studyTimeData || null,
//       quizzes: formattedQuizzes,
//       moduleName: moduleName,
//       totalScore: totalScore.toFixed(2) === '0.00' ? '1.50' : totalScore.toFixed(2),
//       averageScore: averageScore.toFixed(2)
//     };
//   } catch (error) {
//     throw new Error('Error when combining user data');
//   }
// };

export const getUserData = async (userId, moduleId) => {
  const quizDataFilter = {
    moduleId: moduleId
  };
  try {
    const focusData = await findAverageFocusTimeByUser(userId);

    const totalSessionDuration = await findTotalSessionDurationByUser(userId);
    const distinctSessionDaysCount = await countDistinctSessionDaysByUserId(userId);

    const studyTimeData = distinctSessionDaysCount > 0 ? totalSessionDuration / distinctSessionDaysCount : 0;

    const quizData = await getQuizzesScoreService(userId, quizDataFilter);
    const moduleDetails = await fetchModuleById(moduleId);
    if (!moduleDetails) {
      throw new Error(`Module with ID ${moduleId} not found`);
    }
    const moduleName = moduleDetails.name;
    let totalScore = 0;
    let quizCount = 0;

    // Array to store the quiz results
    const formattedQuizzes = [];

    for (const quiz of quizData?.docs || []) {
      const lectureScore = quiz.averageScore * 100 || 0;

      totalScore += lectureScore;
      quizCount++;

      formattedQuizzes.push({
        lectureTitles: quiz.lectureTitle,
        score: lectureScore,
        quizDetails: quiz.quizDetails
      });
    }

    const averageScore = quizCount > 0 ? totalScore / quizCount : 0;
    return {
      userId,
      focusLevel: focusData || null,
      timeSpentStudying: studyTimeData || null,
      quizzes: formattedQuizzes,
      moduleName: moduleName,
      totalScore: totalScore.toFixed(2),
      averageScore: averageScore.toFixed(2)
    };
  } catch (error) {
    throw new Error('Error when combining user data');
  }
};

// Enrolled Module By User ID
export const getEnrolledModules = async (userId) => {
  try {
    const user = await User.findById(userId).populate('enrolledModules');
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    if (!user.enrolledModules || user.enrolledModules.length === 0) {
      throw new Error(`No enrolled modules found for user with ID ${userId}`);
    }
    return user.enrolledModules;
  } catch (error) {
    throw new Error('Error fetching enrolled modules');
  }
};
