import { generateTaskTracker, getAcademicForecast, getUserProgress } from '@/services/forecast';

// Controller to get academic forecast
export const getAcademicForecastController = async (req, res) => {
  const { userId, monthsUntilExam } = req.query;

  try {
    const forecast = await getAcademicForecast(userId, monthsUntilExam);
    return res.status(200).json({
      success: true,
      data: forecast
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generating academic forecast',
      error: error.message
    });
  }
};

// Controller to get task tracker
export const getTaskTrackerController = async (req, res) => {
  const { userId } = req.query;

  try {
    const taskTracker = await generateTaskTracker(userId);
    return res.status(200).json({
      success: true,
      data: taskTracker
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generating task tracker',
      error: error.message
    });
  }
};

// Controller to get user progress data
export const getUserProgressController = async (req, res) => {
  const { userId } = req.query;

  try {
    const progress = await getUserProgress(userId);
    return res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user progress',
      error: error.message
    });
  }
};
