import { moduleLogger } from '@sliit-foss/module-logger';

const logger = moduleLogger('task-recommendation-controller');

export const recommendTask = (performerType, lowestTwoChapters) => {
  if (!lowestTwoChapters || lowestTwoChapters.length < 2) {
    logger.info('No weak areas found for task recommendation.');
    return { message: 'No weak areas found for task recommendation.' };
  }

  // Ensure case-insensitive matching for performerType
  const formattedPerformerType = performerType.trim().toLowerCase().replace(' performer', '');

  const mostLowestMarksChapter = lowestTwoChapters[0]?.chapter || lowestTwoChapters[0];
  const secondLowestMarksChapter = lowestTwoChapters[1]?.chapter || lowestTwoChapters[1];

  // Define weekly task list based on weakest chapters
  const weeklyTasks = [
    {
      task: 'Start Doing Past Papers and Related Questions',
      subTasks: [
        `Focus on past papers from the last 3 years: https://mysligit-my.sharsepoint.com/.../Computing`,
        `Specifically, practice the lowest scoring chapter: ${mostLowestMarksChapter}`,
        `50 MCQ Questions for ${mostLowestMarksChapter}: https://mcqmate.com/search?term=${mostLowestMarksChapter} or Google search: https://google.com/search?q=${mostLowestMarksChapter}+MCQ`
      ]
    },
    {
      task: 'Watch Educational Videos on Chapters 5 and 4',
      subTasks: [
        `Video 1: Watch content on ${mostLowestMarksChapter}: https://www.youtube.com/results?search_query=${mostLowestMarksChapter}+lecture`,
        `Video 2: Watch content on ${secondLowestMarksChapter}: https://www.youtube.com/results?search_query=${secondLowestMarksChapter}+lecture`,
        `Video 3: Additional videos for ${mostLowestMarksChapter}: https://www.youtube.com/results?search_query=${mostLowestMarksChapter}+tutorial`
      ],
      timeEstimate: '120 minutes'
    },
    {
      task: 'Follow this External Course',
      subTasks: [
        `Udemy Course on ${mostLowestMarksChapter}: https://www.udemy.com/courses/search/?q=${mostLowestMarksChapter}`,
        `Udemy Course on ${secondLowestMarksChapter}: https://www.udemy.com/courses/search/?q=${secondLowestMarksChapter}`,
        `Coursera Course on ${mostLowestMarksChapter}: https://www.coursera.org/search?query=${mostLowestMarksChapter}`,
        `Coursera Course on ${secondLowestMarksChapter}: https://www.coursera.org/search?query=${secondLowestMarksChapter}`
      ],
      timeEstimate: '180 minutes'
    },
    {
      task: 'Review Lecture Notes',
      subTasks: [
        `Focus on ${mostLowestMarksChapter}, particularly the key sections.`,
        `Re-study mind maps for ${mostLowestMarksChapter}: (Link to the ontology diagram)`
      ],
      timeEstimate: '90 minutes'
    },
    {
      task: 'Keep a Learning Journal',
      subTasks: [
        `Summarize the most important points from the ${mostLowestMarksChapter} lecture.`,
        `Reflect on difficult topics like ${mostLowestMarksChapter} and ${secondLowestMarksChapter}, and write down key concepts.`
      ],
      timeEstimate: '45 minutes'
    }
  ];

  // Define common daily tasks
  const dailyTasks = [
    {
      task: 'Watch a 5-minute video in one weak area',
      subTasks: [
        `Watch this YouTube video on ${mostLowestMarksChapter}: https://www.youtube.com/results?search_query=${mostLowestMarksChapter}+5-minute+video`
      ]
    },
    {
      task: 'Use the Pomodoro Technique',
      subTasks: [
        'Work for 25 minutes, take a 5-minute break, and repeat. Try completing a task from your weakest chapters.'
      ]
    },
    {
      task: 'Write in your learning journal',
      subTasks: [
        `Summarize what you learned today, focusing on the weak areas identified: ${mostLowestMarksChapter} and ${
          secondLowestMarksChapter
        }`
      ]
    }
  ];
  // Task order based on performer type
  const taskOrder = {
    low: [0, 1, 2],
    medium: [1, 0, 2],
    excellent: [0, 2, 1]
  };

  // Log performer type and task order
  logger.info(`Performer Type: ${formattedPerformerType}`);
  logger.info(`Task Order for Performer: ${taskOrder[formattedPerformerType]}`);

  // Ensure performerType is valid and tasks are assigned
  if (!taskOrder[formattedPerformerType]) {
    logger.error(`Invalid performer type: ${formattedPerformerType}`);
    throw new Error('Invalid performer type');
  }

  // Select tasks based on performer type
  const selectedWeeklyTasks = taskOrder[formattedPerformerType].map((index) => {
    if (index >= weeklyTasks.length) {
      logger.warn(`Invalid index ${index} for weekly tasks.`);
      return null;
    }
    logger.info(`Selected task at index ${index}:`, weeklyTasks[index]);
    return weeklyTasks[index];
  });

  const combinedTasks = {
    weeklyTasks: selectedWeeklyTasks,
    dailyTasks: dailyTasks
  };

  logger.info('Combined tasks:', combinedTasks);
  return combinedTasks;
};
