import OpenAI from 'openai';
import extractJsonArray from '@/helpers/extractJsonArray';
import { removeHTML } from '@/helpers/removeHTML';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateQuestions = async (slides) => {
  // Sanitize the HTML content of slides
  const sanitizedSlides = slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    content: removeHTML(slide.content)
  }));

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant that generates educational questions from provided slide content. Output only JSON, no additional text.'
    },
    {
      role: 'system',
      content: `Here are the sanitized slides: ${JSON.stringify(sanitizedSlides)}.`
    },
    {
      role: 'system',
      content:
        'Please generate a questions array based on the slide content provided. Ensure that exactly 21 questions are generated.'
    },
    {
      role: 'system',
      content:
        'Ensure the questions are relevant to the content of the slides. Avoid generating questions from unrelated topics, such as methods of delivery or assessment criteria.'
    },
    {
      role: 'system',
      content:
        'Format your output as valid JSON. For example: [{"context": "...", "question": "...", "answer": "...", "distractors": ["...", "...", "..."]}]. Ensure that exactly 3 distractors are provided for each question.'
    },
    {
      role: 'system',
      content: 'Context should be a bit of content from the slide, and also it should be descriptive.'
    },
    {
      role: 'system',
      content:
        'Make sure that the distractors also have identical lengths to the actual answer; otherwise, students can easily guess the correct answer.'
    },
    {
      role: 'system',
      content: 'The questions should be of intermediate or advanced difficulty.'
    }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages
  });

  const responseMessage = response.choices[0].message.content;

  return extractJsonArray(responseMessage);
};
