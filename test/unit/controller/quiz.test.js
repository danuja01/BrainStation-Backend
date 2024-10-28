import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import {
  getAttemptQuizIndexController,
  getLectureQuizSummaryController,
  getQuizPerformanceController,
  getQuizzesController,
  getQuizzesScoreController,
  getUserQuizzesDueController,
  getUserQuizzesDueDetailsController,
  respondToQuiz
} from '@/controllers/quiz';
import * as quizService from '@/services/quiz';
import * as spacedRepetitionService from '@/services/spacedRepetition';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Quiz Controller', function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('respondToQuiz', function () {
    it('should handle quiz response successfully', async function () {
      const req = {
        body: { lectureId: '123', questionId: '456', moduleId: '789', response: 'correct', attempt_question: true },
        user: { _id: 'user1' }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(spacedRepetitionService, 'handleQuizResponse').resolves();

      await respondToQuiz(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ message: 'Quiz response processed successfully' })).to.be.true;
    });
  });

  describe('getQuizzesController', function () {
    it('should retrieve quizzes successfully', async function () {
      const req = { query: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const quizzes = [{ quizId: '1', title: 'Sample Quiz' }];

      sandbox.stub(quizService, 'getQuizzesService').resolves(quizzes);

      await getQuizzesController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: quizzes,
          message: 'Quizzes retrieved successfully'
        })
      ).to.be.true;
    });
  });

  describe('getQuizzesScoreController', function () {
    it('should retrieve quizzes score successfully', async function () {
      const req = { query: { filter: 'all', sort: 'asc', page: 1, limit: 10 }, user: { _id: 'user1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const scoreData = { totalScore: 80 };

      sandbox.stub(quizService, 'getQuizzesScoreService').resolves(scoreData);

      await getQuizzesScoreController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: scoreData,
          message: 'Quiz scores retrieved successfully'
        })
      ).to.be.true;
    });
  });

  describe('getUserQuizzesDueController', function () {
    it('should retrieve user quizzes due successfully', async function () {
      const req = { query: { status: 'due' }, user: { _id: 'user1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const dueQuizzes = [{ quizId: '1', title: 'Due Quiz' }];

      sandbox.stub(quizService, 'getUserQuizzesDueService').resolves(dueQuizzes);

      await getUserQuizzesDueController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: dueQuizzes,
          message: 'Quizzes due today or earlier retrieved successfully'
        })
      ).to.be.true;
    });
  });

  describe('getUserQuizzesDueDetailsController', function () {
    it('should retrieve user quizzes due details successfully', async function () {
      const req = { user: { _id: 'user1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const dueDetails = { dueCount: 3 };

      sandbox.stub(quizService, 'getUserQuizzesDueDetailsService').resolves(dueDetails);

      await getUserQuizzesDueDetailsController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: dueDetails,
          message: 'Quizzes due details retrieved successfully'
        })
      ).to.be.true;
    });
  });

  describe('getQuizPerformanceController', function () {
    it('should retrieve quiz performance successfully', async function () {
      const req = { user: { _id: 'user1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const performanceData = { totalAttempts: 20, correctAnswers: 15 };

      sandbox.stub(quizService, 'getQuizPerformance').resolves(performanceData);

      await getQuizPerformanceController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: performanceData,
          message: 'Quiz performance data retrieved successfully'
        })
      ).to.be.true;
    });
  });

  describe('getAttemptQuizIndexController', function () {
    it('should retrieve attempt quiz index successfully', async function () {
      const req = { params: { lectureId: '123' }, user: { _id: 'user1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const attemptIndex = { attemptCount: 2 };

      sandbox.stub(quizService, 'getAttemptQuizIndexService').resolves(attemptIndex);

      await getAttemptQuizIndexController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: attemptIndex,
          message: 'Attempt index retrieved successfully'
        })
      ).to.be.true;
    });
  });

  describe('getLectureQuizSummaryController', function () {
    it('should retrieve lecture quiz summary successfully', async function () {
      const req = { params: { moduleId: 'module1' }, user: { _id: 'user1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      const lectureSummary = { totalQuizzes: 10, completedQuizzes: 8 };

      sandbox.stub(quizService, 'getLectureQuizSummaryService').resolves(lectureSummary);

      await getLectureQuizSummaryController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: lectureSummary,
          message: 'Lecture quiz summary retrieved successfully'
        })
      ).to.be.true;
    });
  });
});
