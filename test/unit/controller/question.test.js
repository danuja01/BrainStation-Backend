import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import {
  bulkInsertQuestions,
  createQuestion,
  deleteQuestion,
  flagQuestion,
  getFlaggedQuestions,
  getQuestionById,
  getQuestionCountByModule,
  updateQuestion,
  viewQuestions
} from '@/controllers/question';
import * as questionService from '@/services/question';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Question Controller', function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('createQuestion', function () {
    it('should create a new question', async function () {
      const questionData = { text: 'What is AI?', options: ['a', 'b', 'c'], answer: 'a' };
      const req = { body: questionData };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(questionService, 'insertQuestionService').resolves(questionData);

      await createQuestion(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: questionData,
          message: 'Question added successfully'
        })
      ).to.be.true;
    });
  });

  describe('bulkInsertQuestions', function () {
    it('should insert multiple questions', async function () {
      const questions = [
        { text: 'What is AI?', options: ['a', 'b', 'c'], answer: 'a' },
        { text: 'What is ML?', options: ['a', 'b', 'c'], answer: 'b' }
      ];
      const req = { body: questions };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(questionService, 'insertBulkQuestionsService').resolves();

      await bulkInsertQuestions(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(
        res.json.calledOnceWith({
          message: 'Questions added successfully'
        })
      ).to.be.true;
    });
  });

  describe('viewQuestions', function () {
    it('should retrieve all questions', async function () {
      const questions = [{ text: 'What is AI?' }];
      const req = { query: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(questionService, 'viewQuestionsService').resolves(questions);

      await viewQuestions(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: questions,
          message: 'Questions retrieved successfully'
        })
      ).to.be.true;
    });
  });

  describe('getQuestionById', function () {
    it('should retrieve a question by ID', async function () {
      const question = { text: 'What is AI?' };
      const req = { params: { id: '1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(questionService, 'getQuestionByIdService').resolves(question);

      await getQuestionById(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: question,
          message: 'Question retrieved successfully'
        })
      ).to.be.true;
    });
  });

  describe('updateQuestion', function () {
    it('should update a question', async function () {
      const updatedQuestion = { text: 'Updated question?' };
      const req = { params: { id: '1' }, body: updatedQuestion };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(questionService, 'updateQuestionService').resolves(updatedQuestion);

      await updateQuestion(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: updatedQuestion,
          message: 'Question updated successfully'
        })
      ).to.be.true;
    });
  });

  describe('deleteQuestion', function () {
    it('should delete a question', async function () {
      const req = { params: { id: '1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(questionService, 'deleteQuestionService').resolves();

      await deleteQuestion(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          message: 'Question deleted successfully'
        })
      ).to.be.true;
    });
  });

  describe('getQuestionCountByModule', function () {
    it('should retrieve question count by module', async function () {
      const questionCount = { moduleId: 'module1', count: 5 };
      const req = { params: { moduleId: 'module1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(questionService, 'getQuestionCountByModuleService').resolves(questionCount);

      await getQuestionCountByModule(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: questionCount,
          message: 'Question count by module retrieved successfully'
        })
      ).to.be.true;
    });
  });

  describe('flagQuestion', function () {
    it('should flag a question', async function () {
      const req = { params: { id: '1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(questionService, 'flagQuestionService').resolves();

      await flagQuestion(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          message: 'Question flagged successfully'
        })
      ).to.be.true;
    });
  });

  describe('getFlaggedQuestions', function () {
    it('should retrieve flagged questions', async function () {
      const flaggedQuestions = [{ text: 'Flagged question?' }];
      const req = { query: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(questionService, 'getFlaggedQuestionsService').resolves(flaggedQuestions);

      await getFlaggedQuestions(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          data: flaggedQuestions,
          message: 'Flagged questions retrieved successfully'
        })
      ).to.be.true;
    });
  });
});
