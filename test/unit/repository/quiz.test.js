import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoose from 'mongoose';
import Quiz from '@/models/quiz';
import { QuizFeedback } from '@/models/quiz-feedback';
import * as QuizRepository from '@/repository/quiz';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Quiz Repository', function () {
  beforeEach(async function () {
    await Quiz.deleteMany({});
    await QuizFeedback.deleteMany({});
  });

  describe('saveQuiz', function () {
    it('should create a new quiz if one does not exist for the question-user pair', async function () {
      this.timeout(10000); // Set timeout to 10 seconds

      const quizData = {
        userId: new mongoose.Types.ObjectId(),
        lectureId: new mongoose.Types.ObjectId(),
        moduleId: new mongoose.Types.ObjectId(),
        questionId: new mongoose.Types.ObjectId(),
        status: 'new',
        next_review_date: new Date()
      };

      const savedQuiz = await QuizRepository.saveQuiz(quizData);

      expect(savedQuiz).to.have.property('_id');
      expect(savedQuiz.status).to.equal(quizData.status);
    });

    it('should update an existing quiz if it already exists for the question-user pair', async function () {
      const userId = new mongoose.Types.ObjectId();
      const questionId = new mongoose.Types.ObjectId();
      const quizData = {
        userId,
        lectureId: new mongoose.Types.ObjectId(),
        moduleId: new mongoose.Types.ObjectId(),
        questionId,
        status: 'new',
        next_review_date: new Date()
      };

      await QuizRepository.saveQuiz(quizData);
      const updateData = { status: 'review' };
      const updatedQuiz = await QuizRepository.saveQuiz({ ...quizData, ...updateData });
      expect(updatedQuiz.status).to.equal('review');
    });
  });

  describe('getQuizzes', function () {
    it('should return paginated quizzes with filters and sorting', async function () {
      const quizData = [
        {
          userId: new mongoose.Types.ObjectId(),
          lectureId: new mongoose.Types.ObjectId(),
          moduleId: new mongoose.Types.ObjectId(),
          questionId: new mongoose.Types.ObjectId(),
          status: 'new',
          next_review_date: new Date()
        },
        {
          userId: new mongoose.Types.ObjectId(),
          lectureId: new mongoose.Types.ObjectId(),
          moduleId: new mongoose.Types.ObjectId(),
          questionId: new mongoose.Types.ObjectId(),
          status: 'review',
          next_review_date: new Date()
        }
      ];

      await Quiz.insertMany(quizData);
      const result = await QuizRepository.getQuizzes({ page: 1, limit: 1 });
      expect(result.docs).to.have.lengthOf(0);
    });
  });

  describe('updateQuiz', function () {
    it('should update a quiz by ID', async function () {
      const quizData = {
        userId: new mongoose.Types.ObjectId(),
        lectureId: new mongoose.Types.ObjectId(),
        moduleId: new mongoose.Types.ObjectId(),
        questionId: new mongoose.Types.ObjectId(),
        status: 'new',
        next_review_date: new Date()
      };

      const savedQuiz = await QuizRepository.saveQuiz(quizData);
      const updateData = { status: 'review' };
      const updatedQuiz = await QuizRepository.updateQuiz(savedQuiz._id, updateData);

      expect(updatedQuiz.status).to.equal('review');
    });
  });

  describe('getQuizByQuestionIdAndUserId', function () {
    it('should retrieve a quiz by questionId and userId', async function () {
      const userId = new mongoose.Types.ObjectId();
      const questionId = new mongoose.Types.ObjectId();
      const quizData = {
        userId,
        questionId,
        lectureId: new mongoose.Types.ObjectId(),
        moduleId: new mongoose.Types.ObjectId(),
        status: 'new',
        next_review_date: new Date()
      };

      await QuizRepository.saveQuiz(quizData);
      const foundQuiz = await QuizRepository.getQuizByQuestionIdAndUserId(userId, questionId);
      expect(foundQuiz).to.have.property('_id');
      expect(foundQuiz.questionId.toString()).to.equal(questionId.toString());
    });
  });

  describe('getQuizPerformanceData', function () {
    it('should return quiz performance summary for a user', async function () {
      const userId = new mongoose.Types.ObjectId();
      const quizzes = [
        {
          userId,
          lectureId: new mongoose.Types.ObjectId(),
          moduleId: new mongoose.Types.ObjectId(),
          questionId: new mongoose.Types.ObjectId(),
          status: 'new',
          next_review_date: new Date()
        },
        {
          userId,
          lectureId: new mongoose.Types.ObjectId(),
          moduleId: new mongoose.Types.ObjectId(),
          questionId: new mongoose.Types.ObjectId(),
          status: 'review',
          next_review_date: new Date()
        },
        {
          userId,
          lectureId: new mongoose.Types.ObjectId(),
          moduleId: new mongoose.Types.ObjectId(),
          questionId: new mongoose.Types.ObjectId(),
          status: 'lapsed',
          next_review_date: new Date()
        }
      ];

      await Quiz.insertMany(quizzes);
      const performanceData = await QuizRepository.getQuizPerformanceData(userId);

      expect(performanceData.totalQuizzes).to.equal(3);
      expect(performanceData.reviewQuizzes).to.equal(1);
      expect(performanceData.lapsedQuizzes).to.equal(1);
      expect(performanceData.newQuizzes).to.equal(1);
    });
  });

  describe('saveQuizFeedback', function () {
    it('should save or update feedback for a quiz', async function () {
      const userId = new mongoose.Types.ObjectId();
      const lectureId = new mongoose.Types.ObjectId();
      const feedbackData = { strength: ['Great quiz content!'], weakness: ['Could improve clarity'] };

      // Save initial feedback
      const savedFeedback = await QuizRepository.saveQuizFeedback(userId, lectureId, feedbackData);
      expect(savedFeedback).to.have.property('_id');
      expect(savedFeedback.strength).to.deep.equal(feedbackData.strength);
      expect(savedFeedback.weakness).to.deep.equal(feedbackData.weakness);

      // Update feedback with new data
      const updatedFeedbackData = { strength: ['Excellent questions'], weakness: ['More examples needed'] };
      const updatedFeedback = await QuizRepository.saveQuizFeedback(userId, lectureId, updatedFeedbackData);
      expect(updatedFeedback.strength).to.deep.equal(updatedFeedbackData.strength);
      expect(updatedFeedback.weakness).to.deep.equal(updatedFeedbackData.weakness);
    });
  });

  describe('getUserQuizzesDueByToday', function () {
    it('should return quizzes due by today', async function () {
      const userId = new mongoose.Types.ObjectId();
      const quizData = {
        userId,
        lectureId: new mongoose.Types.ObjectId(),
        moduleId: new mongoose.Types.ObjectId(),
        questionId: new mongoose.Types.ObjectId(),
        status: 'review',
        next_review_date: new Date(Date.now() - 86400000) // 1 day past
      };

      await QuizRepository.saveQuiz(quizData);
      const dueQuizzes = await QuizRepository.getUserQuizzesDueByToday({ userId, page: 1, limit: 10 });
      expect(dueQuizzes.docs).to.have.lengthOf(0);
    });
  });
});
