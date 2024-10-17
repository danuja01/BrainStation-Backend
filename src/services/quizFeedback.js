import OpenAI from 'openai';
import extractJsonArray from '@/helpers/extractJsonArray';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const provideFeedback = async (userResponses) => {
  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant that provides constructive feedback based on user responses to quiz questions.'
    },
    {
      role: 'user',
      content: `Here are the user responses: ${JSON.stringify(userResponses)}.`
    },
    {
      role: 'system',
      content: 'Analyze the user responses based on retention difficulty, which can be marked as normal, hard, or easy.'
    },
    {
      role: 'system',
      content:
        'Focus on retention levels: easy means well retained, normal or hard means varying levels of difficulty in retention.'
    },
    {
      role: 'system',
      content:
        'Provide concise feedback divided into strengths and weaknesses, considering both the level of difficulty and retention.'
    },
    {
      role: 'system',
      content: 'Emphasize key points with <b> when necessary.'
    },
    {
      role: 'system',
      content: 'Format the feedback in JSON as follows: [{"strength": [], "weakness": []}].'
    },
    {
      role: 'system',
      content: 'Respond only with valid JSON and no additional text or comments.'
    }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages
  });

  const responseMessage = response.choices[0].message.content;
  // console.log('responseMessage', responseMessage);

  return extractJsonArray(responseMessage);
};
