import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import * as QuestionRepository from '@/repository/question';
import * as QuestionService from '@/services/question';

chai.use(chaiAsPromised);

describe('Question Service', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('insertQuestionService', function () {
    it('should insert a question successfully', async function () {
      const questionData = { content: 'What is AI?', answer: 'Artificial Intelligence' };
      sinon.stub(QuestionRepository, 'insertQuestion').resolves(questionData);

      const result = await QuestionService.insertQuestionService(questionData);

      expect(result).to.deep.equal(questionData);
    });

    it('should throw an error if question insertion fails', async function () {
      sinon.stub(QuestionRepository, 'insertQuestion').rejects(new Error('Insertion failed'));

      const insertQuestionPromise = QuestionService.insertQuestionService({ content: 'What is AI?' });

      await expect(insertQuestionPromise).to.be.rejectedWith(Error, 'Error when processing question');
    });
  });

  describe('updateQuestionService', function () {
    it('should update a question successfully', async function () {
      const questionId = '123';
      const updateData = { content: 'Updated Question?' };
      const updatedQuestion = { _id: questionId, ...updateData };
      sinon.stub(QuestionRepository, 'updateQuestion').resolves(updatedQuestion);

      const result = await QuestionService.updateQuestionService(questionId, updateData);

      expect(result).to.deep.equal(updatedQuestion);
    });

    it('should throw an error if question ID is invalid', async function () {
      sinon.stub(QuestionRepository, 'updateQuestion').resolves(null);

      const updatePromise = QuestionService.updateQuestionService('invalidID', { content: 'Updated Question?' });

      await expect(updatePromise).to.be.rejectedWith(Error, 'Invalid question ID');
    });
  });

  describe('viewQuestionsService', function () {
    it('should fetch all questions based on query', async function () {
      const questions = [{ _id: '1', content: 'What is AI?' }];
      sinon.stub(QuestionRepository, 'getQuestions').resolves(questions);

      const result = await QuestionService.viewQuestionsService({});

      expect(result).to.deep.equal(questions);
    });
  });

  describe('getQuestionByIdService', function () {
    it('should return a question by ID', async function () {
      const questionId = '123';
      const questionData = { _id: questionId, content: 'What is AI?' };
      sinon.stub(QuestionRepository, 'getQuestionById').resolves(questionData);

      const result = await QuestionService.getQuestionByIdService(questionId);

      expect(result).to.deep.equal(questionData);
    });

    it('should throw an error if question is not found', async function () {
      sinon.stub(QuestionRepository, 'getQuestionById').resolves(null);

      const getPromise = QuestionService.getQuestionByIdService('invalidID');

      await expect(getPromise).to.be.rejectedWith(Error, 'Invalid question ID');
    });
  });

  describe('deleteQuestionService', function () {
    it('should delete a question by ID', async function () {
      const questionId = '123';
      const questionData = { _id: questionId, content: 'What is AI?' };
      sinon.stub(QuestionRepository, 'deleteQuestion').resolves(questionData);

      const result = await QuestionService.deleteQuestionService(questionId);

      expect(result).to.deep.equal(questionData);
    });

    it('should throw an error if question ID is invalid for deletion', async function () {
      sinon.stub(QuestionRepository, 'deleteQuestion').resolves(null);

      const deletePromise = QuestionService.deleteQuestionService('invalidID');

      await expect(deletePromise).to.be.rejectedWith(Error, 'Invalid question ID');
    });
  });

  describe('flagQuestionService', function () {
    it('should flag a question by ID', async function () {
      const questionId = '123';
      const flaggedQuestion = { _id: questionId, content: 'What is AI?', isFlagged: true };
      sinon.stub(QuestionRepository, 'flagQuestion').resolves(flaggedQuestion);

      const result = await QuestionService.flagQuestionService(questionId);

      expect(result).to.deep.equal(flaggedQuestion);
    });

    it('should throw an error if question ID is invalid for flagging', async function () {
      sinon.stub(QuestionRepository, 'flagQuestion').resolves(null);

      const flagPromise = QuestionService.flagQuestionService('invalidID');

      await expect(flagPromise).to.be.rejectedWith(Error, 'Invalid question ID');
    });
  });
});
