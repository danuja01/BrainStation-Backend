// import { moduleLogger } from '@sliit-foss/module-logger';
// import mongoose from 'mongoose';
// import CompletedTask from '@/models/completedTaskModel';
// import Task from '@/models/taskModel';
import { getEnrolledModules, getUserData } from '@/controllers/algorithm';
import { addSession } from '@/services/sessionService';
// import { predictExamScore, predictScoresForAllModules } from '@/services/progressService';
import { makeResponse } from '@/utils';

// Replace with the correct path

// import { makeResponse } from '@/utils/response';
// import {findStartAndEndTimesOfUsersModule} from '@/services/focus-record';

export const getLecturePerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all modules the student is enrolled in
    const enrolledModules = await getEnrolledModules(userId);

    const lecturePerformanceData = [];

    // Loop through each module to fetch lecture data
    for (const module of enrolledModules) {
      const moduleData = await getUserData(userId, module._id);

      // Add lecture title and score to the response
      moduleData.quizzes.forEach((lecture) => {
        lecturePerformanceData.push({
          lectureTitle: lecture.lectureTitles,
          score: lecture.score
        });
      });
    }

    return res.status(200).json({ lecturePerformance: lecturePerformanceData });
  } catch (error) {
    //  console.error('Error retrieving lecture performance:', error);
    return res.status(500).json({ message: 'Failed to retrieve lecture performance', error: error.message });
  }
};

export const addSessionController = async (req, res) => {
  const newSession = await addSession(req.body);
  return makeResponse({ res, status: 201, data: newSession, message: 'Session added successfully' });
};

export const getStudentAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const enrolledModules = await getEnrolledModules(userId);

    if (!enrolledModules || enrolledModules.length === 0) {
      return res.status(404).json({ message: 'No enrolled modules found for this student.' });
    }

    let totalFocus = 0;
    let totalStudyTime = 0;
    let totalExamScore = 0;
    let moduleCount = 0;

    for (const module of enrolledModules) {
      try {
        const moduleData = await getUserData(userId, module._id);

        if (moduleData) {
          totalFocus += moduleData.focusLevel || 0;
          totalStudyTime += moduleData.timeSpentStudying || 0;
          totalExamScore += parseFloat(moduleData.averageScore) || 0;
          moduleCount++;
        }
      } catch (error) {
        //     console.error(`Error retrieving data for module ${module._id}:`, error.message);
      }
    }

    if (moduleCount === 0) {
      return res.status(200).json({ message: 'No data available for enrolled modules.' });
    }

    // Calculate averages
    const averageFocus = totalFocus / moduleCount;
    const averageStudyTime = totalStudyTime / moduleCount;
    const averageExamScore = totalExamScore / moduleCount;

    // Determine the alert message based on the averages
    let alertMessage = '';
    if (averageFocus < 50 && averageStudyTime < 50 && averageExamScore < 50) {
      alertMessage = 'Low performance overall. Try shorter sessions.';
    } else if (averageFocus >= 50 && averageStudyTime >= 50 && averageExamScore < 50) {
      alertMessage = 'Marks need improvement. Review key topics.';
    } else if (averageFocus < 50 && averageStudyTime >= 50 && averageExamScore >= 50) {
      alertMessage = 'Boost focus during study.';
    } else if (averageFocus >= 50 && averageStudyTime < 50 && averageExamScore >= 50) {
      alertMessage = 'Increase study time.';
    } else {
      alertMessage = 'Nice work! Keep it up!';
    }

    return res.status(200).json({ alertMessage });
  } catch (error) {
    //   console.error('Error generating student alerts:', error);
    return res.status(500).json({
      message: 'Failed to generate student alerts',
      error: error.message
    });
  }
};
