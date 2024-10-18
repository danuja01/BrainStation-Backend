import { calculateUserLectureScore, getQuizPerformance, getQuizzesService } from '@/services/quiz';
import { handleQuizResponse } from '@/services/spacedRepetition';
import { makeResponse } from '@/utils/response';

export const respondToQuiz = async (req, res) => {
  const { lectureId, questionId, moduleId, response } = req.body;
  const userId = req.user._id;

  try {
    await handleQuizResponse(userId, lectureId, questionId, moduleId, response);
    return res.status(200).json({ message: 'Quiz response processed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getQuizzesController = async (req, res) => {
  try {
    // Fetch the quizzes using the service
    const quizzes = await getQuizzesService(req.query);

    // Map over the quizzes and fetch the score for each lecture
    const quizzesWithScores = await Promise.all(
      quizzes.docs.map(async (quiz) => {
        // Fetch score for this quiz based on userId and lectureId
        const scoreData = await calculateUserLectureScore(quiz.userId, quiz.lectureId);

        // Add the score to the quiz object
        return {
          ...quiz,
          score: scoreData.averageScore // Add the average score from the score data
        };
      })
    );

    // Return the modified quizzes with the scores included
    return makeResponse({
      res,
      data: { ...quizzes, docs: quizzesWithScores },
      message: 'Quizzes retrieved successfully with scores'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserLectureScore = async (req, res) => {
  const { userId, lectureId } = req.params;

  try {
    const scoreData = await calculateUserLectureScore(userId, lectureId);
    return res.status(200).json({ data: scoreData, message: 'Score data retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getQuizPerformanceController = async (req, res) => {
  try {
    const userId = req.user._id;

    const performanceData = await getQuizPerformance(userId);

    return makeResponse({
      res,
      data: performanceData,
      message: 'Quiz performance data retrieved successfully'
    });
  } catch (error) {
    makeResponse({ res, message: 'Internal Server Error', status: 500 });
  }
};
