import axios from 'axios';
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

export const getAlternativeAssrService = async () => {
  const questions = [
    'How often do you attend lectures?',
    'How often do you ask questions during lectures?',
    'How often do you complete your assignments on time?',
    'How often do you review lecture notes after class?',
    'How often do you participate in class discussions?',
    'How often do you use additional resources for learning?'
  ];

  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // Todo: replace the url with hosted model url
  const response = await axios.post(`${process.env.ASRS_URL}api/v1/generate-questions`, { questions }, config);

  return response.data;
};
