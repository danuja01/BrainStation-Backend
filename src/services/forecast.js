import mongoose from 'mongoose';
import OpenAI from 'openai';
import { extractArrayFromResponse } from '@/helpers/extractArray';
import { getQuizPerformanceData } from '@/repository/quiz';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateWithGPT = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that provides educational forecasts and task management.'
      },
      { role: 'system', content: prompt }
    ]
  });
  return response.choices[0].message.content;
};

export const getUserProgress = async (userId) => {
  const id = new mongoose.Types.ObjectId(userId);
  const quizzesData = await getQuizPerformanceData(id);

  const completionRate = quizzesData.successRate || 0;
  let grade = 'LOW';
  if (completionRate > 0.8) {
    grade = 'A';
  } else if (completionRate > 0.6) {
    grade = 'B';
  } else if (completionRate > 0.4) {
    grade = 'C';
  }

  return {
    completionRate,
    grade
  };
};

export const getAcademicForecast = async (userId, monthsUntilExam) => {
  const progressData = await getUserProgress(userId);

  const gptPrompt = `
    Based on the current progress data:
    - Total quizzes: ${progressData.totalQuizzes}
    - Completion rate: ${progressData.completionRate}
    - Lapsed quizzes: ${progressData.lapsedQuizzes}
    - Grade: ${progressData.grade}
    Please provide a forecast of exam readiness in ${monthsUntilExam} months in an array format like ["point 1", "point 2", "point 3"].
    example output: ["predict point 1", "predict point 2", "predict point 3", ...]
    give 10 forcecast points inside the array.
  `;

  const gptResponse = await generateWithGPT(gptPrompt);

  const forecastArray = extractArrayFromResponse(gptResponse);

  return {
    readinessPercentage: Math.min(100, Math.round(progressData.completionRate * 100)),
    forecast: forecastArray
  };
};

export const generateTaskTracker = async (userId) => {
  const progressData = await getUserProgress(userId);

  const gptPrompt = `
    Given the following student progress data:
    - Total quizzes: ${progressData.totalQuizzes}
    - Completion rate: ${progressData.completionRate}
    - Lapsed quizzes: ${progressData.lapsedQuizzes}
    Please provide a prioritized list of tasks the student should focus on to improve their exam readiness.
    Format the output as an array of task points like ["task 1", "task 2", "task 3"].
    example output: ["task point 1", "task point 2", "task point 3", ...]
    give 5 task points inside the array.
  `;

  const gptResponse = await generateWithGPT(gptPrompt);

  const taskTrackerArray = extractArrayFromResponse(gptResponse);

  return {
    taskTracker: taskTrackerArray
  };
};
