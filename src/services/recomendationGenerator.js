import OpenAI from 'openai';
import extractJsonArray from '@/helpers/extractJsonArray';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generatePersonalizedStudyRecommendations = async (studentScoreDetails) => {
  const messages = [
    {
      role: 'system',
      content:
        'You are a study assistant generating constructive and direct study recommendations based on multiple lectures and quizzes with user feedback.'
    },
    {
      role: 'user',
      content: `Here are the lecture titles and related quiz details with retention feedback: ${JSON.stringify(studentScoreDetails)}.`
    },
    {
      role: 'system',
      content:
        'Analyze each lecture and quiz response, paying special attention to areas where the user is struggling (indicated by "isRetained" as false).'
    },
    {
      role: 'system',
      content:
        'Provide study recommendations that directly address these areas of weakness. Use phrasing such as "You are lacking in understanding of..." or "Focus more on..." when discussing these areas.'
    },
    {
      role: 'system',
      content:
        'Give actionable steps for improvement, including study techniques like mnemonics, active recall, or group study, tailored to these areas. '
    },
    {
      role: 'system',
      content:
        'Return the recommendations as a JSON array in plain text format like this: ["Recommendation 1", "Recommendation 2", "Recommendation 3"]. Respond with only the JSON array.'
    }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages
  });

  const responseMessage = response.choices[0].message.content;
  return extractJsonArray(responseMessage);
};
