import { moduleLogger } from '@sliit-foss/module-logger';
import { getQuizByQuestionIdAndUserId, saveQuiz } from '@/repository/quiz';

const logger = moduleLogger('Spaced-Repetition-Service');

class LearningPhase {
  constructor(quiz) {
    this.quiz = quiz;
    this.learning_steps = this.quiz.learningSteps;
    this.current_step = this.quiz.current_step || 0;
  }

  processStep(response) {
    this.quiz.attemptCount += 1;

    if (response === 'wrong') {
      logger.info(`Quiz ${this.quiz.id} is lapsed, pressing 'Wrong Answer'.`);
      this.current_step = Math.max(this.current_step - 1, 0);
    } else {
      if (this.current_step < this.learning_steps.length - 1) {
        this.current_step += 1;
        logger.info(`Quiz ${this.quiz.id} is in learning phase.`);
      } else {
        this.moveToReviewPhase();
      }
    }

    // Update next review date based on learning steps in minutes
    this.quiz.next_review_date = new Date(Date.now() + this.learning_steps[this.current_step] * 60 * 1000);
    this.quiz.current_step = this.current_step;
  }

  moveToReviewPhase() {
    logger.info(`Quiz ${this.quiz.id} has completed the learning phase. Moving to regular review cycles.`);

    // Check if the card is new or lapsed
    if (this.quiz.status === 'new') {
      this.quiz.ease_factor = 2;
      this.quiz.interval = 1;
      logger.info(`Quiz ${this.quiz.id} is a new card, setting ease factor to 2.`);
    } else {
      logger.info(`Quiz ${this.quiz.id} is a lapsed card, retaining original ease factor: ${this.quiz.ease_factor}.`);
    }

    this.quiz.status = 'review';

    // Update next review date to one day after today
    this.quiz.next_review_date = new Date(Date.now() + this.quiz.interval * 24 * 60 * 60 * 1000);
    logger.info(`Next review date for quiz ${this.quiz.id} set to: ${this.quiz.next_review_date.toISOString()}`);
  }
}

class ReviewPhase {
  constructor(quiz, max_date) {
    this.quiz = quiz;

    // Ensure max_date is a valid Date object
    if (!(max_date instanceof Date)) {
      throw new Error('max_date must be a valid Date object');
    }

    this.max_date = max_date;
    this.max_interval = Math.ceil((this.max_date.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

    logger.info(
      `Maximum allowed interval date is ${this.max_date.toISOString().split('T')[0]}, which is ${this.max_interval} days from today.`
    );
  }

  reviewCard(response) {
    const original_interval = this.quiz.interval;

    if (response === 'wrong') {
      this.quiz.interval = Math.max(Math.round(original_interval * 0.75), 1);
      this.quiz.ease_factor = Math.max(this.quiz.ease_factor - 0.25, 1.1);
      this.quiz.status = 'lapsed';
    } else if (response === 'hard') {
      this.quiz.interval = Math.max(Math.round(original_interval * 0.9), 1);
      this.quiz.ease_factor = Math.max(this.quiz.ease_factor - 0.2, 1.1);
    } else if (response === 'easy') {
      this.quiz.interval = Math.min(Math.round(original_interval * this.quiz.ease_factor * 1.3), this.max_interval);
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

export const handleQuizResponse = async (userId, lectureId, questionId, response) => {
  const quiz = await getQuizByQuestionIdAndUserId(userId, questionId);

  const today = new Date();
  const max_date = new Date(today);
  max_date.setFullYear(today.getFullYear() + 1);

  if (!quiz) {
    const newQuiz = {
      userId,
      lectureId,
      questionId,
      status: 'new',
      interval: 1,
      ease_factor: 2,
      next_review_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      learningSteps: [5, 10, 25],
      current_step: 0,
      attemptCount: 1
    };

    const learningPhase = new LearningPhase(newQuiz);
    learningPhase.processStep(response);

    await saveQuiz(newQuiz);
  } else {
    quiz.attemptCount += 1;
    if (quiz.status === 'new' || quiz.status === 'lapsed') {
      const learningPhase = new LearningPhase(quiz);
      learningPhase.processStep(response);
    } else if (quiz.status === 'review') {
      const reviewPhase = new ReviewPhase(quiz, max_date);
      reviewPhase.reviewCard(response);
    }

    await saveQuiz(quiz);
  }
};
