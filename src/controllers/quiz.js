import {
  getAttemptQuizIndexService,
  getLectureQuizSummaryService,
  getQuizPerformance,
  getQuizzesScoreService,
  getQuizzesService,
  getUserQuizzesDueDetailsService,
  getUserQuizzesDueService
} from '@/services/quiz';
import { handleQuizResponse } from '@/services/spacedRepetition';
import { makeResponse } from '@/utils/response';

export const respondToQuiz = async (req, res) => {
  const { lectureId, questionId, moduleId, response, attempt_question } = req.body;
  const userId = req.user._id;

  try {
    await handleQuizResponse(userId, lectureId, questionId, moduleId, attempt_question, response);
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

export const getQuizzesScoreController = async (req, res) => {
  const { filter, sort, page, limit } = req.query;
  const userId = req.user._id;

  try {
    const scoreData = await getQuizzesScoreService(userId, filter, sort, page, limit);
    return makeResponse({ res, data: scoreData, message: 'Quiz scores retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserQuizzesDueController = async (req, res) => {
  const userId = req.user._id;
  const query = req.query;

  try {
    const quizzes = await getUserQuizzesDueService(query, userId);
    return makeResponse({
      res,
      data: quizzes,
      message: 'Quizzes due today or earlier retrieved successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserQuizzesDueDetailsController = async (req, res) => {
  const userId = req.user._id;

  try {
    const dueDetails = await getUserQuizzesDueDetailsService(userId);
    return makeResponse({ res, data: dueDetails, message: 'Quizzes due details retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
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

export const getAttemptQuizIndexController = async (req, res) => {
  const userId = req.user._id;
  const { lectureId } = req.params;

  try {
    const attemptQuizzes = await getAttemptQuizIndexService(userId, lectureId);
    return makeResponse({ res, data: attemptQuizzes, message: 'Attempt index retrieved successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};

export const getLectureQuizSummaryController = async (req, res) => {
  const userId = req.user._id;
  const { moduleId } = req.params;

  try {
    const lectureSummary = await getLectureQuizSummaryService(userId, moduleId);
    return makeResponse({ res, data: lectureSummary, message: 'Lecture quiz summary retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
