import { getQuizPerformanceData, getQuizzes, getUserLectureQuizzes } from '@/repository/quiz';

export const getQuizzesService = async (query) => {
  return await getQuizzes(query);
};

export const calculateUserLectureScore = async (userId, lectureId) => {
  const quizData = await getUserLectureQuizzes(userId, lectureId);

  return quizData;
};

export const getQuizPerformance = async (userId) => {
  const performanceData = await getQuizPerformanceData(userId);
  return performanceData;
};
