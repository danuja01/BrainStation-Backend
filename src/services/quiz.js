import { getQuizzes } from '@/repository/quiz';

export const getQuizzesService = async (query) => {
  return await getQuizzes(query);
};
