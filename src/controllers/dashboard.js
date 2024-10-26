import { getEnrolledModules, getUserData } from '@/controllers/algorithm';
import { addSession } from '@/services/focus-record';
import { makeResponse } from '@/utils';

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
