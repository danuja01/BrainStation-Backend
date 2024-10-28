import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import * as QuizRepository from '@/repository/quiz';
import * as QuizService from '@/services/quiz';

chai.use(chaiAsPromised);

describe('Quiz Service', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('getQuizzesService', function () {
    it('should fetch quizzes based on query', async function () {
      const quizzes = [{ _id: '1', question: 'What is AI?' }];
      sinon.stub(QuizRepository, 'getQuizzes').resolves(quizzes);

      const result = await QuizService.getQuizzesService({});

      expect(result).to.deep.equal(quizzes);
    });
  });

  describe('getQuizzesScoreService', function () {
    it('should fetch quiz scores with pagination', async function () {
      const userId = 'user1';
      const scores = [{ lectureId: '1', averageScore: 80 }];
      sinon.stub(QuizRepository, 'getQuizzesScore').resolves(scores);

      const result = await QuizService.getQuizzesScoreService(userId, {}, {}, 1, 10);

      expect(result).to.deep.equal(scores);
    });
  });

  describe('getQuizPerformance', function () {
    it('should return quiz performance data for a user', async function () {
      const userId = 'user1';
      const performanceData = { totalQuizzes: 10, successRate: 0.8 };
      sinon.stub(QuizRepository, 'getQuizPerformanceData').resolves(performanceData);

      const result = await QuizService.getQuizPerformance(userId);

      expect(result).to.deep.equal(performanceData);
    });
  });

  describe('getUserQuizzesDueService', function () {
    it('should fetch quizzes due by today for a user', async function () {
      const userId = 'user1';
      const quizzesDue = [{ _id: '1', question: 'What is AI?', dueDate: new Date() }];
      sinon.stub(QuizRepository, 'getUserQuizzesDueByToday').resolves(quizzesDue);

      const result = await QuizService.getUserQuizzesDueService({}, userId);

      expect(result).to.deep.equal(quizzesDue);
    });
  });

  describe('getUserQuizzesDueDetailsService', function () {
    it('should fetch quiz due details for a user', async function () {
      const userId = 'user1';
      const dueDetails = { dueTodayCount: 2, learningPhaseCount: 5 };
      sinon.stub(QuizRepository, 'getUserQuizzesDueDetails').resolves(dueDetails);

      const result = await QuizService.getUserQuizzesDueDetailsService(userId);

      expect(result).to.deep.equal(dueDetails);
    });
  });

  describe('getAttemptQuizIndexService', function () {
    it('should fetch the attempt quiz index for a lecture', async function () {
      const userId = 'user1';
      const lectureId = 'lecture1';
      const attemptIndex = [{ questionId: 'q1', attempt_question: 1 }];
      sinon.stub(QuizRepository, 'getAttemptQuizIndex').resolves(attemptIndex);

      const result = await QuizService.getAttemptQuizIndexService(userId, lectureId);

      expect(result).to.deep.equal(attemptIndex);
    });
  });

  describe('saveQuizFeedbackService', function () {
    it('should save quiz feedback', async function () {
      const userId = 'user1';
      const lectureId = 'lecture1';
      const feedbackData = { strengths: ['Great understanding'], weaknesses: ['Needs more practice'] };
      sinon.stub(QuizRepository, 'saveQuizFeedback').resolves(feedbackData);

      const result = await QuizService.saveQuizFeedbackService(userId, lectureId, feedbackData);

      expect(result).to.deep.equal(feedbackData);
    });
  });

  describe('getLectureQuizSummaryService', function () {
    it('should fetch lecture quiz summary for a module', async function () {
      const userId = 'user1';
      const moduleId = 'module1';
      const summary = [{ lectureId: '1', quizCount: 10 }];
      sinon.stub(QuizRepository, 'getLectureQuizSummary').resolves(summary);

      const result = await QuizService.getLectureQuizSummaryService(userId, moduleId);

      expect(result).to.deep.equal(summary);
    });
  });
});
