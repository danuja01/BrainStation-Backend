// services/spacedRepetition.js
import { moduleLogger } from '@sliit-foss/module-logger';
import { findQuizByUserIdAndLectureId, saveQuiz } from '@/repository/quizRepository';

const logger = moduleLogger('Spaced-Repetition-Service');

class LearningPhase {
  constructor(quiz) {
    this.quiz = quiz;
    this.learning_steps = this.quiz.status === 'lapsed' ? [5, 10, 25] : [5, 10];
    this.current_step = 0;
  }

  processStep(response) {
    if (response === 'wrong') {
      logger.info(`Quiz ${this.quiz.id} is lapsed, pressing 'Wrong Answer'.`);
      this.current_step = 0;
    } else {
      if (this.current_step < this.learning_steps.length - 1) {
        this.current_step += 1;

        logger.info(`Quiz ${this.quiz.id} is in learning phase.`);
      } else {
        this.moveToReviewPhase();
      }
    }
  }

  moveToReviewPhase() {
    logger.info(`Quiz ${this.quiz.id} has completed the learning phase. Moving to regular review cycles.`);
    this.quiz.status = 'review';
    this.quiz.interval = 1;
    this.quiz.next_review_date = new Date(Date.now() + this.quiz.interval * 24 * 60 * 60 * 1000);
  }
}

class ReviewPhase {
  constructor(quiz, max_date) {
    this.quiz = quiz;
    this.max_date = max_date;
    this.max_interval = Math.ceil((this.max_date - new Date()).getTime() / (1000 * 3600 * 24));
    logger.info(
      `Maximum allowed interval date is ${this.max_date.toISOString().split('T')[0]}, which is ${this.max_interval} days from today.`
    );
  }

  reviewCard(response) {
    const original_interval = this.quiz.interval;

    if (response === 'wrong') {
      this.quiz.interval = Math.max(Math.round(original_interval * 0.75), 1);
      this.quiz.ease_factor = Math.max(this.quiz.ease_factor - 0.25, 1.1);
    } else if (response === 'hard') {
      this.quiz.interval = Math.max(Math.round(original_interval * 0.9), 1);
      this.quiz.ease_factor = Math.max(this.quiz.ease_factor - 0.2, 1.1);
    } else if (response === 'easy') {
      this.quiz.interval = Math.min(Math.round(original_interval * 1.2), this.max_interval);
      this.quiz.ease_factor = Math.min(this.quiz.ease_factor + 0.15, 2.5);
    } else if (response === 'normal') {
      this.quiz.interval = Math.min(Math.round(original_interval * this.quiz.ease_factor), this.max_interval);
    }

    logger.info(
      `Updated quiz ${this.quiz.id} details: Interval: ${this.quiz.interval} days, Ease factor: ${this.quiz.ease_factor}`
    );
    this.quiz.next_review_date = new Date(Date.now() + this.quiz.interval * 24 * 60 * 60 * 1000);
  }
}

export const handleQuizResponse = async (userId, lectureId, response) => {
  const quiz = await findQuizByUserIdAndLectureId(userId, lectureId);
  if (!quiz) throw new Error('Quiz not found');

  const today = new Date();
  const max_date = new Date(today);
  max_date.setFullYear(today.getFullYear() + 1);

  if (quiz.status === 'new' || quiz.status === 'lapsed') {
    const learningPhase = new LearningPhase(quiz);
    learningPhase.processStep(response);
  } else if (quiz.status === 'review') {
    const reviewPhase = new ReviewPhase(quiz, max_date);
    reviewPhase.reviewCard(response);
  }

  await saveQuiz(quiz);
};
