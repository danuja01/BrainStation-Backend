import Quiz from '@/models/quiz';

export const findQuizByUserIdAndLectureId = (userId, lectureId) => {
  return Quiz.findOne({ userId, lectureId });
};

export const saveQuiz = (quiz) => {
  return quiz.save();
};
