import axios from 'axios';
import { fetchStudentDataFromDB } from '@/repository/studentProfile';
import { calculateCumulativeAverage, getLowestTwoChapters } from '@/utils/progressUtils';

// Fetch student data from MongoDB
export const fetchStudentData = async (Student_id) => {
  try {
    const studentData = await fetchStudentDataFromDB(Student_id);
    return studentData;
  } catch (error) {
    throw new Error('Error fetching student data');
  }
};

const getChapterDescription = async (chapterName) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:5000/get_description?chapter=${encodeURIComponent(chapterName)}`
    );

    return response.data.description;
  } catch (error) {
    throw new Error(`No description available for ${chapterName}`);
  }
};

export const predictExamScore = async (studentData) => {
  // Calculate cumulative average of quiz scores
  const cumulativeAverage = calculateCumulativeAverage(studentData);

  let performer_type = 'Low Performer';
  if (cumulativeAverage > 80) {
    performer_type = 'Excellent Performer';
  } else if (cumulativeAverage > 50) {
    performer_type = 'Medium Performer';
  }

  // Get the lowest two chapters based on quiz scores
  const lowestTwoChapters = getLowestTwoChapters(studentData);

  // Fetch descriptions for the lowest two chapters
  const lowestTwoChaptersWithDescriptions = await Promise.all(
    lowestTwoChapters.map(async (chapter) => {
      const description = await getChapterDescription(chapter.chapter); // Call Python API for each chapter

      return {
        chapter: chapter.chapter,
        description,
        score: chapter.score
      };
    })
  );

  // Prepare input data for the Python service
  const inputData = {
    focus_level: studentData.focusLevel,
    cumulative_average: cumulativeAverage,
    time_spent_studying: parseInt(studentData.timeSpentStudying, 10) // Convert to integer
  };

  try {
    const response = await axios.post('http://localhost:8000/predict_exam_score/', inputData);
    const predicted_exam_score = response.data.predicted_exam_score;

    return {
      predicted_exam_score,
      lowest_two_chapters_with_descriptions: lowestTwoChaptersWithDescriptions,
      performer_type: performer_type
    };
  } catch (error) {
    throw new Error('Failed to get prediction from Python service');
  }
};

export const recommendTask = (performerType, lowestTwoChapters) => {
  // Ensure that lowestTwoChapters is an array with at least 2 chapters
  if (!lowestTwoChapters || lowestTwoChapters.length < 2) {
    return { message: 'No weak areas found for task recommendation.' };
  }

  // Adjust handling based on whether lowestTwoChapters is an array of strings or objects
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

  // Use a case-insensitive approach for performerType
  const formattedPerformerType = performerType.trim().toLowerCase();
  const taskOrder = {
    low: [4, 3, 0, 1, 2],
    medium: [2, 0, 4, 1],
    excellent: [0, 2, 3, 4]
  };

  // Ensure performerType is valid
  if (!taskOrder[formattedPerformerType]) {
    throw new Error('Invalid performer type');
  }

  // Determine which weekly tasks to assign based on performer type
  const selectedWeeklyTasks = taskOrder[formattedPerformerType].map((index) => weeklyTasks[index]);

  // Combine weekly tasks and daily tasks
  const combinedTasks = {
    weeklyTasks: selectedWeeklyTasks,
    dailyTasks: dailyTasks
  };

  return combinedTasks;
};
