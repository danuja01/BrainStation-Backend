import createError from 'http-errors';
import { generateQuestions } from '@/services/questionGenerator';
import { saveQuizFeedbackService } from '@/services/quiz';
import { provideFeedback } from '@/services/quizFeedback';

export const generateQuestionsController = async (req, res) => {
  try {
    const { slides } = req.body;
    if (!slides || !Array.isArray(slides)) {
      throw new createError(400, 'Valid slides array is required');
    }

    const response = await generateQuestions(slides);

    return res.status(200).json({ data: response, message: 'Questions generated successfully' });
  } catch (err) {
    throw new createError(500, `Error when processing questions: ${err.message}`);
  }
};

export const feedbackController = async (req, res) => {
  try {
    const userResponses = req.body;
    const { lectureId } = req.params;
    const userId = req.user._id;
    const { from } = req.query;

    const feedback = await provideFeedback(userResponses);

    if (from !== 'due') {
      await saveQuizFeedbackService(userId, lectureId, {
        strength: feedback[0].strength,
        weakness: feedback[0].weakness
      });
    }

    return res.status(200).json({ data: feedback, message: 'Feedback retrieved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving feedback', error: error.message });
  }
};
