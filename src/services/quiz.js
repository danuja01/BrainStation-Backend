import {
  getAttemptQuizIndex,
  getLectureQuizSummary,
  getQuizPerformanceData,
  getQuizzes,
  getQuizzesScore,
  getUserQuizzesDueByToday,
  getUserQuizzesDueDetails,
  saveQuizFeedback
} from '@/repository/quiz';

export const getQuizzesService = async (query) => {
  return await getQuizzes(query);
};

export const getQuizzesScoreService = async (userId, filter, sort, page, limit) => {
  return await getQuizzesScore({ userId, filter, sort, page, limit });
};

export const getQuizPerformance = async (userId) => {
  const performanceData = await getQuizPerformanceData(userId);
  return performanceData;
};

export const getUserQuizzesDueService = async (query, userId) => {
  return await getUserQuizzesDueByToday({ ...query, userId });
};

export const getUserQuizzesDueDetailsService = async (userId) => {
  return await getUserQuizzesDueDetails(userId);
};

export const getAttemptQuizIndexService = async (userId, lectureId) => {
  return await getAttemptQuizIndex(userId, lectureId);
};

export const saveQuizFeedbackService = async (userId, lectureId, data) => {
  return await saveQuizFeedback(userId, lectureId, data);
};

export const getLectureQuizSummaryService = async (userId, moduleId) => {
  return await getLectureQuizSummary(userId, moduleId);
};
