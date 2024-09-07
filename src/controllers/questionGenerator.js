import createError from 'http-errors';
import { generateQuestions } from '@/services/questionGenerator';

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
