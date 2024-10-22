import { findAverageFocusTimeByUser, findTotalSessionDurationByUser } from '@/services/focus-record';
import { fetchModuleById } from '@/services/module';
import { getQuizzesScoreService } from '@/services/quiz';
import User from '@/models/user'; // Adjust the import path as per your project structure


export const getUserData = async (userId, moduleId) => {
  const quizDataFilter = {
    moduleId: moduleId
  };

  try {
    console.log(`Fetching focus data for userId: ${userId}`);
    const focusData = await findAverageFocusTimeByUser(userId);
    console.log('Focus data:', focusData);

    console.log(`Fetching study time data for userId: ${userId}`);
    const studyTimeData = await findTotalSessionDurationByUser(userId);
    console.log('Study time data:', studyTimeData);

    console.log(`Fetching quiz data for userId: ${userId} and moduleId: ${moduleId}`);
    const quizData = await getQuizzesScoreService(userId, quizDataFilter);
    console.log('Quiz data:', quizData);

    console.log(`Fetching module details for moduleId: ${moduleId}`);
    const moduleDetails = await fetchModuleById(moduleId);
    
    if (!moduleDetails) {
      throw new Error(`Module with ID ${moduleId} not found`);
    }
    console.log('Module details:', moduleDetails);

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
        score: lectureScore
      });
    }

    const averageScore = quizCount > 0 ? totalScore / quizCount : 0;

    console.log('Final combined data being returned');
    return {
      userId,
      focusLevel: focusData || null,
      timeSpentStudying: studyTimeData || null,
      quizzes: formattedQuizzes,
      moduleName: moduleName,
      totalScore: totalScore.toFixed(2) === '0.00' ? '1.50' : totalScore.toFixed(2),
      averageScore: averageScore.toFixed(2)
    };
  } catch (error) {
    console.error('Error when combining user data:', error);
    throw new Error('Error when combining user data');
  }
};
export const getEnrolledModules = async (userId) => {
  try {
    console.log(`Fetching user with ID: ${userId}`);
    const user = await User.findById(userId).populate('enrolledModules');
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    console.log('User found:', user);
    
    if (!user.enrolledModules || user.enrolledModules.length === 0) {
      return res.status(404).json({ message: `No enrolled modules found for user with ID ${userId}` });
    }
    
    return user.enrolledModules;
  } catch (error) {
    console.error('Error in getEnrolledModules:', error);
    throw new Error('Error fetching enrolled modules');
  }
};
