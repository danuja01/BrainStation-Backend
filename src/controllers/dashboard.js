import { moduleLogger } from '@sliit-foss/module-logger';
import { getEnrolledModules, getUserData } from '@/controllers/algorithm';
import NotCompletedTask from '@/models/notCompletedTaskModel';
import { addSession } from '@/services/focus-record';
import { makeResponse } from '@/utils';

// Ensure the logger is imported correctly
const logger = moduleLogger('dashboard-controller');

export const getLecturePerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrolledModules = await getEnrolledModules(userId);

    const lecturePerformanceData = [];

    for (const module of enrolledModules) {
      const moduleData = await getUserData(userId, module._id);

      moduleData.quizzes.forEach((lecture) => {
        lecturePerformanceData.push({
          lectureTitle: lecture.lectureTitles,
          score: lecture.score
        });
      });
    }

    return res.status(200).json({ lecturePerformance: lecturePerformanceData });
  } catch (error) {
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
      const moduleData = await getUserData(userId, module._id);

      if (moduleData) {
        totalFocus += moduleData.focusLevel || 0;
        totalStudyTime += moduleData.timeSpentStudying || 0;
        totalExamScore += parseFloat(moduleData.averageScore) || 0;
        moduleCount++;
      }
    }

    if (moduleCount === 0) {
      return res.status(200).json({ message: 'No data available for enrolled modules.' });
    }

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
    return res.status(500).json({
      message: 'Failed to generate student alerts',
      error: error.message
    });
  }
};

// Controller to fetch performance types for a particular user from notcompleted tasks
export const getOldPerformanceTypesController = async (req, res) => {
  const userId = req.user._id; // Assuming you have middleware to set req.user (e.g., JWT auth)

  try {
    logger.info(`Fetching performance types for user ID: ${userId}`);

    // Fetch all notcompleted tasks for the particular user, sorted by createdAt
    const notCompletedTasks = await NotCompletedTask.find({ student: userId })
      .sort({ createdAt: 1 }) // Sort by oldest first
      .select('performer_type createdAt'); // Selecting performer_type and createdAt fields only

    if (!notCompletedTasks || notCompletedTasks.length === 0) {
      logger.info(`No notcompleted tasks found for user ID: ${userId}`);
      return res.status(404).json({ message: 'No notcompleted tasks found for this user.' });
    }

    // Extract performer types in the sorted order
    const performerTypes = notCompletedTasks.map((task, index) => ({
      order: index + 1,
      performerType: task.performer_type,
      createdAt: task.createdAt
    }));

    // Log the final performer types list for the specific user
    logger.info('Retrieved performer types for user:', performerTypes);

    return res.status(200).json({ performerTypes });
  } catch (error) {
    logger.error('Error fetching notcompleted performance types for user:', error.message);
    return res.status(500).json({ message: 'Failed to retrieve performance types', error: error.message });
  }
};
