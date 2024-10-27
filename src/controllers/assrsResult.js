import {
  CalculateAssrsResult,
  addAssrResult,
  checkAssrResultExists,
  getAlternativeAssrService,
  getOneAssrsService,
  modifyAssrResult
} from '@/services/assrsResult';
import { makeResponse } from '@/utils';

// Function to create a new ASRS result
export const createAssrResultController = async (req, res) => {
  const userId = req.user._id;
  const result = await checkAssrResultExists(userId);

  if (result) {
    return makeResponse({ res, status: 500, message: 'assrs data already exists' });
  }

  const questions = {
    question1: req.body.question1,
    question2: req.body.question2,
    question3: req.body.question3,
    question4: req.body.question4,
    question5: req.body.question5,
    question6: req.body.question6
  };

  const assrsResult = CalculateAssrsResult(questions);

  const data = {
    assrsResult: assrsResult,
    userId: userId
  };

  await addAssrResult(data);

  return makeResponse({ res, status: 201, data: assrsResult, message: 'assrs added successfully' });
};

// Function to check if an ASRS result exists for a specific user
export const checkAssrResultExistsController = async (req, res) => {
  const userId = req.user._id;
  const result = await checkAssrResultExists(userId);

  return res.status(200).json({ exists: !!result });
};

// Function to check if the existing ASRS result is older than 6 months
export const checkAssrResultAgeController = async (req, res) => {
  const userId = req.user._id;
  const result = await checkAssrResultExists(userId);

  if (result) {
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 6));

    // Check if the record is older than 6 months
    const isOlderThanSixMonths = result.created_at < sixMonthsAgo;

    return res.status(200).json({ isOlderThanSixMonths });
  }

  return res.status(200).json({ isOlderThanSixMonths: true }); // If no result, treat it as older
};

// Function to update an ASRS result
export const updateAssrResultController = async (req, res) => {
  const userId = req.user._id;
  const updatedData = req.body;
  const updatedAssrResult = await modifyAssrResult(userId, updatedData);
  return res.status(200).json({ message: 'ASRS Result updated successfully', data: updatedAssrResult });
};

export const getOneAssr = async (req, res) => {
  const report = await getOneAssrsService(req.query, req.body);
  return makeResponse({ res, data: report, message: 'Assrs data retrieved successfully' });
};

export const getAlternativeAssrController = async (req, res) => {
  const questions = await getAlternativeAssrService();
  return makeResponse({ res, data: questions, message: 'Assrs data retrieved successfully' });
};
