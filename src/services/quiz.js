import { getQuizPerformanceData, getQuizzes, getQuizzesScore, getUserQuizzesDueByToday } from '@/repository/quiz';

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
