import OpenAI from 'openai';

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
      content:
        'Please analyze the responses and provide feedback on areas of improvement, focusing on incorrect and harder questions. Your feedback should be constructive and encouraging.'
    },
    {
      role: 'user',
      content: 'Make sure maximum word count is 200 words'
    }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages
  });

  const responseMessage = response.choices[0].message.content;

  return responseMessage;
};
