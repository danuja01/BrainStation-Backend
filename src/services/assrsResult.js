import createError from 'http-errors';
import { createAssrResult, findAssrResultByUserId, getOneAssrs, updateAssrResult } from '@/repository/assrResult';

export const addAssrResult = async (assrsData) => {
  await createAssrResult(assrsData);
};

export const checkAssrResultExists = async (userId) => {
  const result = await findAssrResultByUserId(userId);
  return result;
};

export const modifyAssrResult = async (userId, updatedData) => {
  return await updateAssrResult(userId, updatedData);
};

export const CalculateAssrsResult = (questions) => {
  const totalScore = Object.values(questions).reduce((acc, val) => acc + val, 0);

  const threshold = 14;

  const result = totalScore >= threshold ? 'Positive' : 'Negative';

  return result;
};

export const getOneAssrsService = async (query, options) => {
  const report = await getOneAssrs(query, options);
  if (!report) throw new createError(422, 'Invalid question ID');
  return report;
};
