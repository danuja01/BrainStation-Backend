import { moduleLogger } from '@sliit-foss/module-logger';

const logger = moduleLogger('task-recommendation-controller');

export const recommendTask = (performerType, lowestTwoChapters) => {
  if (!lowestTwoChapters || lowestTwoChapters.length < 2) {
    logger.info('No weak areas found for task recommendation.');
    return { message: 'No weak areas found for task recommendation.' };
  }

  // Ensure case-insensitive matching for performerType
  const formattedPerformerType = performerType.trim().toLowerCase().replace(' performer', '');

  // Function to clean chapter/module names and remove unwanted words like "lecture", standalone numbers
  const cleanChapterName = (chapter) => {
    const sanitizedChapter = chapter
      .replace(/\b(lecture|lec)\b\s*\d*/gi, '') // Remove words like "lecture", "lec" and any following numbers
      .replace(/\b\d+\b/g, '') // Remove any standalone numbers
      .replace(/-/g, '') // Remove hyphens
      .trim() // Trim leading and trailing spaces
      .replace(/\s+/g, ' '); // Replace multiple spaces with a single space

    return sanitizedChapter;
  };

  // Function to convert cleaned chapter names into URL-safe format (replace spaces with '+')
  const toURLFormat = (chapter) => {
    return chapter.replace(/\s+/g, '+'); // Replace spaces with '+'
  };

  // Clean and prepare chapters for task generation
  const mostLowestMarksChapter = cleanChapterName(lowestTwoChapters[0]?.chapter || lowestTwoChapters[0]);
  const secondLowestMarksChapter = cleanChapterName(lowestTwoChapters[1]?.chapter || lowestTwoChapters[1]);

  // Convert cleaned chapters to URL format for external resources
  const mostLowestMarksChapterURL = toURLFormat(mostLowestMarksChapter);
  const secondLowestMarksChapterURL = toURLFormat(secondLowestMarksChapter);

  // Log chapter names and URL formats for debugging
  logger.info(`Most Lowest Marks Chapter: ${mostLowestMarksChapter}`);
  logger.info(`Second Lowest Marks Chapter: ${secondLowestMarksChapter}`);
  logger.info(`URL for Most Lowest Marks Chapter: ${mostLowestMarksChapterURL}`);
  logger.info(`URL for Second Lowest Marks Chapter: ${secondLowestMarksChapterURL}`);

  // Define weekly task list based on weakest chapters
  const weeklyTasks = [
    {
      task: 'Start Doing Past Papers and Related Questions',
      subTasks: [
        'Focus on past papers from the last 3 years: https://mysliit-my.sharepoint.com/.../Computing',
        `Specifically, practice Questions in ${mostLowestMarksChapter}`,
        `Take this quiz on ${mostLowestMarksChapter}: https://quizlet.com/search?query=${mostLowestMarksChapterURL}`
      ]
    },
    {
      task: 'Watch Educational Videos on Key Chapters',
      subTasks: [
        `Watch a video on ${mostLowestMarksChapter}: https://www.youtube.com/results?search_query=${mostLowestMarksChapterURL}+lecture`,
        `Watch content on ${secondLowestMarksChapter}: https://www.youtube.com/results?search_query=${secondLowestMarksChapterURL}+lecture`,
        'Summarize what you’ve learned after the video.'
      ],
      timeEstimate: '120 minutes'
    },
    {
      task: 'Follow this External Course',
      subTasks: [
        `Udemy Course on ${mostLowestMarksChapter}: https://www.udemy.com/courses/search/?q=${mostLowestMarksChapterURL}`,
        `Coursera Course on ${secondLowestMarksChapter}: https://www.coursera.org/search?query=${secondLowestMarksChapterURL}`
      ],
      timeEstimate: '180 minutes'
    },
    {
      task: 'Review Lecture Notes',
      subTasks: [
        `Focus on ${mostLowestMarksChapter}, particularly the key sections.`,
        `Re-study mind maps for ${mostLowestMarksChapter}`
      ],
      timeEstimate: '90 minutes'
    },
    {
      task: 'Keep a Learning Journal',
      subTasks: [
        `Summarize the most important points from the ${mostLowestMarksChapter} lecture.`,
        `Reflect on difficult topics like ${mostLowestMarksChapter} and ${secondLowestMarksChapter}, and write down key concepts.`,
        'Join a study group or forum and participate in one discussion: https://stackoverflow.com/'
      ],
      timeEstimate: '45 minutes'
    }
  ];

  // Define common daily tasks
  const dailyTasks = [
    {
      task: 'Watch a 5-minute video in one weak area',
      subTasks: [
        `Watch this YouTube video on ${mostLowestMarksChapter}: https://www.youtube.com/results?search_query=${mostLowestMarksChapterURL}+5-minute+video`,
        'Write down one thing you didn’t know before and explain it in your own words.'
      ]
    },
    {
      task: 'Use the Pomodoro Technique',
      subTasks: [
        'Work for 25 minutes, take a 5-minute break, and repeat. Try completing a task from your weakest chapters.'
      ]
    },
    {
      task: 'Write in your learning journal and Create Mind Map',
      subTasks: [
        `Summarize what you learned today, focusing on the weak areas: ${mostLowestMarksChapter} and ${secondLowestMarksChapter}.`,
        'Create a mind map of the concepts you learned today.'
      ]
    }
  ];

  // Task order based on performer type
  const taskOrder = {
    low: [3, 4, 0],
    medium: [0, 1, 4],
    excellent: [0, 2, 3]
  };

  // Log performer type and task order for debugging
  logger.info(`Performer Type: ${formattedPerformerType}`);
  logger.info(`Task Order for Performer: ${taskOrder[formattedPerformerType]}`);

  // Ensure performerType is valid and tasks are assigned
  if (!taskOrder[formattedPerformerType]) {
    logger.error(`Invalid performer type: ${formattedPerformerType}`);
    throw new Error('Invalid performer type');
  }

  // Select tasks based on performer type
  const selectedWeeklyTasks = taskOrder[formattedPerformerType]
    .map((index) => {
      if (index >= weeklyTasks.length) {
        logger.warn(`Invalid index ${index} for weekly tasks.`);
        return null;
      }
      logger.info(`Selected task at index ${index}:`, weeklyTasks[index]);
      return weeklyTasks[index];
    })
    .filter(Boolean); // Filter out null values (if any)

  const combinedTasks = {
    weeklyTasks: selectedWeeklyTasks,
    dailyTasks: dailyTasks
  };

  // Log combined tasks for debugging
  logger.info('Combined tasks:', combinedTasks);
  return combinedTasks;
};
