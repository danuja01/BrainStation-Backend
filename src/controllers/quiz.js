import { calculateUserLectureScore, getQuizPerformance, getQuizzesService } from '@/services/quiz';
import { handleQuizResponse } from '@/services/spacedRepetition';
import { makeResponse } from '@/utils/response';

export const respondToQuiz = async (req, res) => {
  const { userId, lectureId, questionId, response } = req.body;

  try {
    await handleQuizResponse(userId, lectureId, questionId, response);
    return res.status(200).json({ message: 'Quiz response processed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getQuizzesController = async (req, res) => {
  try {
    const quizzes = await getQuizzesService(req.query);
    return makeResponse({ res, data: quizzes, message: 'Quizzes retrieved successfully' });
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
