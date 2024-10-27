import createError from 'http-errors';
import {
  deleteQuestion,
  fetchFlaggedQuestions,
  flagQuestion,
  getOneQuestion,
  getQuestionById,
  getQuestionCountByModule,
  getQuestions,
  insertBulkQuestions,
  insertQuestion,
  updateQuestion
} from '@/repository/question';

export const insertQuestionService = async (data) => {
  try {
    return await insertQuestion(data);
  } catch (err) {
    throw new createError(500, 'Error when processing question');
  }
};

export const insertBulkQuestionsService = async (dataArray) => {
  try {
    await insertBulkQuestions(dataArray);
  } catch (err) {
    throw new createError(500, 'Error when processing bulk question insertion');
  }
};

export const updateQuestionService = async (id, data) => {
  const question = await updateQuestion(id, data);
  if (!question) throw new createError(422, 'Invalid question ID');
  return question;
};

export const viewQuestionsService = (query) => {
  return getQuestions(query);
};

export const getQuestionByIdService = async (id) => {
  const question = await getQuestionById(id);
  if (!question) throw new createError(422, 'Invalid question ID');
  return question;
};

export const getOneQuestionService = async (query, options) => {
  const question = await getOneQuestion(query, options);
  if (!question) throw new createError(422, 'Invalid question ID');
  return question;
};

export const deleteQuestionService = async (id) => {
  const question = await deleteQuestion(id);
  if (!question) throw new createError(422, 'Invalid question ID');
  return question;
};

export const getQuestionCountByModuleService = (moduleId) => {
  return getQuestionCountByModule(moduleId);
};

export const getFlaggedQuestionsService = (query) => {
  return fetchFlaggedQuestions(query);
};

export const flagQuestionService = async (id) => {
  const question = await flagQuestion(id);
  if (!question) throw new createError(422, 'Invalid question ID');
  return question;
};
