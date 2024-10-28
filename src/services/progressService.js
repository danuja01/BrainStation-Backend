/* eslint-disable import/order */

/* eslint-disable no-confusing-arrow */
import axios from 'axios';
import { getEnrolledModules, getUserData } from '@/controllers/algorithm';
import { calculateCumulativeAverage, getLowestTwoChapters } from '@/utils/progressUtils';
import { generatePersonalizedStudyRecommendations } from './recomendationGenerator';

export const predictExamScore = async (studentData) => {
  const cumulativeAverage = calculateCumulativeAverage(studentData);
  let performer_type = 'Low Performer';
  if (cumulativeAverage > 80) {
    performer_type = 'Excellent Performer';
  } else if (cumulativeAverage > 50) {
    performer_type = 'Medium Performer';
  }
  const lowestTwoChapters = getLowestTwoChapters(studentData);

  const lowestTwoChaptersWithDescriptions = await Promise.all(
    lowestTwoChapters.map((chapter) => {
      try {
        return {
          chapter: chapter.chapter,
          description: '',
          score: chapter.score
        };
      } catch (error) {
        return {
          chapter: chapter.chapter,
          description: 'No description available',
          score: chapter.score
        };
      }
    })
  );
  const inputData = {
    focus_level: Math.round(studentData.focusLevel),
    cumulative_average: cumulativeAverage,
    time_spent_studying: parseInt(studentData.timeSpentStudying, 10)
  };

  try {
    const response = await axios.post('http://34.30.64.175:9008/predict_exam_score/', inputData);

    const predicted_exam_score = response.data.predicted_exam_score;

    return {
      predicted_exam_score,
      lowest_two_chapters_with_descriptions: lowestTwoChaptersWithDescriptions,
      performer_type: performer_type
    };
  } catch (error) {
    throw new Error(`Failed to get prediction from Python service: ${error.message}`);
  }
};

export const predictScoresForAllModules = async (userId) => {
  try {
    // Fetch enrolled modules for the user
    const enrolledModules = await getEnrolledModules(userId);

    if (!enrolledModules || enrolledModules.length === 0) {
      throw new Error('No modules found for this user.');
    }

    let totalScore = 0;
    let lectureCount = 0;
    const completedModulePredictions = [];
    const noQuizModules = [];
    const lowestTwoChapters = [];
    const studentScore = [];

    // Go through each enrolled module
    await Promise.all(
      enrolledModules.map(async (module) => {
        const studentData = await getUserData(userId, module._id);

        if (studentData.quizzes.length === 0) {
          noQuizModules.push({
            moduleId: module._id,
            moduleName: module.name,
            predictedExamScore: 'You have not completed any lectures in this module.'
          });
        } else {
          const predictedExamScore = studentData.averageScore;
          const lowestModuleChapters = getLowestTwoChapters(studentData);

          studentData.quizzes.forEach((quiz) => {
            studentScore.push({
              lectureTitles: quiz.lectureTitles,
              quizDetails: [
                quiz.quizDetails.map((detail) => ({
                  question: detail.question,
                  answer: detail.answer,
                  isRetained: detail.status === 'new' || detail.status === 'lapsed' ? false : true
                }))
              ]
            });
          });

          completedModulePredictions.push({
            moduleId: module._id,
            moduleName: module.name,
            predictedExamScore
          });

          lowestTwoChapters.push(...lowestModuleChapters);

          totalScore += parseFloat(studentData.totalScore);
          lectureCount += studentData.quizzes.length;
        }
      })
    );

    // Sort chapters by score to get overall lowest 2 chapters
    const sortedLowestTwoChapters = lowestTwoChapters.sort((a, b) => a.score - b.score).slice(0, 2);

    const formattedLowestTwoChapters = await Promise.all(
      sortedLowestTwoChapters.map((chapter) => {
        const moduleName = enrolledModules.find((module) =>
          completedModulePredictions.some((completed) => completed.moduleId === module._id)
        )?.name;

        return {
          chapter: chapter.chapter,
          moduleName: moduleName || 'Module Not Found',
          score: chapter.score,
          chapterDescription: ' '
        };
      })
    );

    let highestScoreModule = null;
    let lowestScoreModule = null;

    if (completedModulePredictions.length > 0) {
      highestScoreModule = completedModulePredictions.reduce((prev, curr) =>
        prev.predictedExamScore > curr.predictedExamScore ? prev : curr
      );
      lowestScoreModule = completedModulePredictions.reduce((prev, curr) =>
        prev.predictedExamScore < curr.predictedExamScore ? prev : curr
      );
    }

    if (completedModulePredictions.length === 1 && noQuizModules.length > 0) {
      lowestScoreModule = {
        moduleName: 'Not done any quizzes',
        moduleId: noQuizModules[0].moduleId
      };
    }

    // Calculate average score across all lectures
    const averageScore = lectureCount > 0 ? totalScore / lectureCount : 0;

    // Determine performer type based on average score
    let performerType = 'Low Performer';
    if (averageScore >= 80) {
      performerType = 'Excellent Performer';
    } else if (averageScore >= 50) {
      performerType = 'Medium Performer';
    }

    // Adjust study recommendations based on focus-to-study ratio
    const studyRecommendations = [];

    const recommendations = await generatePersonalizedStudyRecommendations(studentScore);

    studyRecommendations.push(...recommendations);

    studyRecommendations.push('Take regular breaks to maintain focus and retention.');

    return {
      modulePredictions: [...completedModulePredictions, ...noQuizModules],
      lowestTwoChapters: formattedLowestTwoChapters,
      highestScoreModule: highestScoreModule
        ? {
            moduleName: highestScoreModule.moduleName,
            moduleId: highestScoreModule.moduleId
          }
        : { message: 'No highest score module available' },
      lowestScoreModule: lowestScoreModule
        ? {
            moduleName: lowestScoreModule.moduleName,
            moduleId: lowestScoreModule.moduleId
          }
        : { message: 'No lowest score module available' },
      studyRecommendations,
      performerType
    };
  } catch (error) {
    throw new Error(`Failed to predict scores for all modules: ${error.message}`);
  }
};
// export const recommendTask = (performerType, lowestTwoChapters) => {};
export const recommendTask = () => {};
