import {
  deleteQuestionService,
  flagQuestionService,
  getFlaggedQuestionsService,
  getOneQuestionService,
  getQuestionByIdService,
  getQuestionCountByModuleService,
  insertBulkQuestionsService,
  insertQuestionService,
  updateQuestionService,
  viewQuestionsService
} from '@/services/question';
import { makeResponse } from '@/utils/response';

export const createQuestion = async (req, res) => {
  const question = await insertQuestionService(req.body);

  return makeResponse({ res, data: question, status: 201, message: 'Question added successfully' });
};

export const bulkInsertQuestions = async (req, res) => {
  await insertBulkQuestionsService(req.body);
  return makeResponse({ res, status: 201, message: 'Questions added successfully' });
};

export const viewQuestions = async (req, res) => {
  const questions = await viewQuestionsService(req.query);
  return makeResponse({ res, data: questions, message: 'Questions retrieved successfully' });
};

export const getQuestionById = async (req, res) => {
  const question = await getQuestionByIdService(req.params.id);
  return makeResponse({ res, data: question, message: 'Question retrieved successfully' });
};

export const getOneQuestion = async (req, res) => {
  const question = await getOneQuestionService(req.query, req.body);
  return makeResponse({ res, data: question, message: 'Question retrieved successfully' });
};

export const updateQuestion = async (req, res) => {
  const question = await updateQuestionService(req.params.id, req.body);
  return makeResponse({ res, data: question, message: 'Question updated successfully' });
};

export const deleteQuestion = async (req, res) => {
  await deleteQuestionService(req.params.id);
  return makeResponse({ res, message: 'Question deleted successfully' });
};

export const getQuestionCountByModule = async (req, res) => {
  const questionCounts = await getQuestionCountByModuleService(req.params.moduleId);
  return makeResponse({ res, data: questionCounts, message: 'Question count by module retrieved successfully' });
};

export const getFlaggedQuestions = async (req, res) => {
  const questions = await getFlaggedQuestionsService(req.query);
  return makeResponse({ res, data: questions, message: 'Flagged questions retrieved successfully' });
};

export const flagQuestion = async (req, res) => {
  await flagQuestionService(req.params.id);
  return makeResponse({ res, message: 'Question flagged successfully' });
};
