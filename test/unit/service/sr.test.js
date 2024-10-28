import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { getQuizByQuestionIdAndUserId, saveQuiz } from '@/repository/quiz';
import { LearningPhase, ReviewPhase, handleQuizResponse } from '@/services/spacedRepetition';

chai.use(chaiAsPromised);

describe('Spaced-Repetition Service', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('LearningPhase', function () {
    it('should process a correct step in learning phase', function () {
      const quiz = { id: '1', current_step: 0, learningSteps: [5, 10, 25], attemptCount: 0 };
      const learningPhase = new LearningPhase(quiz);

      learningPhase.processStep('correct');

      expect(quiz.current_step).to.equal(1);
      expect(quiz.attemptCount).to.equal(1);
      expect(quiz.next_review_date).to.be.a('date');
    });

    it('should move to review phase on completing learning steps', function () {
      const quiz = { id: '1', current_step: 2, learningSteps: [5, 10, 25], status: 'new' };
      const learningPhase = new LearningPhase(quiz);

      const moveToReviewPhaseSpy = sinon.spy(learningPhase, 'moveToReviewPhase');

      learningPhase.processStep('correct');

      expect(moveToReviewPhaseSpy.calledOnce).to.be.true;
      expect(quiz.status).to.equal('review');
    });

    it('should handle a wrong answer by decreasing the learning step', function () {
      const quiz = { id: '1', current_step: 2, learningSteps: [5, 10, 25], attemptCount: 0 };
      const learningPhase = new LearningPhase(quiz);

      learningPhase.processStep('wrong');

      expect(quiz.current_step).to.equal(1);
      expect(quiz.attemptCount).to.equal(1);
    });
  });

  describe('ReviewPhase', function () {
    it('should set the next review date based on interval and ease factor', function () {
      const quiz = { id: '1', interval: 1, ease_factor: 2.0, status: 'review' };
      const max_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const reviewPhase = new ReviewPhase(quiz, max_date);

      reviewPhase.reviewCard('normal');

      expect(quiz.next_review_date).to.be.a('date');
    });

    it('should handle a hard answer by decreasing ease factor and setting interval', function () {
      const quiz = { id: '1', interval: 2, ease_factor: 2.0, status: 'review' };
      const max_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const reviewPhase = new ReviewPhase(quiz, max_date);

      reviewPhase.reviewCard('hard');

      expect(quiz.ease_factor).to.be.lessThan(2.0);
      expect(quiz.interval).to.equal(1);
    });

    it('should reset quiz to lapsed status on wrong answer', function () {
      const quiz = { id: '1', interval: 2, ease_factor: 2.0, status: 'review' };
      const max_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const reviewPhase = new ReviewPhase(quiz, max_date);

      reviewPhase.reviewCard('wrong');

      expect(quiz.status).to.equal('lapsed');
      expect(quiz.next_review_date).to.be.a('date');
    });
  });

  describe('handleQuizResponse', function () {
    it('should create a new quiz if none exists', async function () {
      sinon.stub(getQuizByQuestionIdAndUserId).resolves(null);
      const saveQuizStub = sinon.stub(saveQuiz).resolves();

      await handleQuizResponse('user1', 'lecture1', 'question1', 'module1', 1, 'correct');

      expect(saveQuizStub.calledOnce).to.be.true;
      const savedQuiz = saveQuizStub.getCall(0).args[0];
      expect(savedQuiz.status).to.equal('new');
      expect(savedQuiz.learningSteps).to.deep.equal([5, 10, 25]);
    });

    it('should update an existing quiz in learning phase', async function () {
      const quiz = { id: '1', status: 'new', learningSteps: [5, 10, 25], current_step: 0, attemptCount: 0 };
      sinon.stub(getQuizByQuestionIdAndUserId).resolves(quiz);
      const saveQuizStub = sinon.stub(saveQuiz).resolves();

      await handleQuizResponse('user1', 'lecture1', 'question1', 'module1', 1, 'correct');

      expect(quiz.current_step).to.equal(1);
      expect(saveQuizStub.calledOnce).to.be.true;
    });

    it('should update an existing quiz in review phase', async function () {
      const quiz = { id: '1', status: 'review', interval: 1, ease_factor: 2.0 };
      sinon.stub(getQuizByQuestionIdAndUserId).resolves(quiz);
      const saveQuizStub = sinon.stub(saveQuiz).resolves();

      await handleQuizResponse('user1', 'lecture1', 'question1', 'module1', 1, 'normal');

      expect(quiz.interval).to.equal(2);
      expect(saveQuizStub.calledOnce).to.be.true;
    });
  });
});
