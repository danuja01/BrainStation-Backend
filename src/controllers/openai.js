import createError from 'http-errors';
import { generateQuestions } from '@/services/questionGenerator';
import { provideFeedback } from '@/services/quizFeedback';

export const generateQuestionsController = async (req, res) => {
  try {
    const { slides } = req.body; // Extract slides directly from the request body
    if (!slides || !Array.isArray(slides)) {
      throw new createError(400, 'Valid slides array is required');
    }

    // Pass the slides directly to the OpenAI service
    const response = await generateQuestions(slides);

    return res.status(200).json({ data: response, message: 'Questions generated successfully' });
  } catch (err) {
    throw new createError(500, `Error when processing questions: ${err.message}`);
  }
};

export const feedbackController = async (req, res) => {
  try {
    const userResponses = req.body;
    const feedback = await provideFeedback(userResponses);

    return res.status(200).json({ message: 'Feedback retrieved successfully', data: feedback });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving feedback', error: error.message });
  }
};
