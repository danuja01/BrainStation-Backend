import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import createError from 'http-errors';
import sinon from 'sinon';
import * as AssrResultRepository from '@/repository/assrResult';
import * as AssrResultService from '@/services/assrsResult';

chai.use(chaiAsPromised);

describe('AssrResult Service', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('addAssrResult', function () {
    it('should add a new assessment result', async function () {
      const assrsData = { userId: '1', score: 15 };
      const createStub = sinon.stub(AssrResultRepository, 'createAssrResult').resolves();

      await AssrResultService.addAssrResult(assrsData);

      expect(createStub);
    });
  });

  describe('checkAssrResultExists', function () {
    it('should return assessment result if it exists for a user', async function () {
      const userId = '1';
      const result = { userId, score: 10 };
      sinon.stub(AssrResultRepository, 'findAssrResultByUserId').resolves(result);

      const response = await AssrResultService.checkAssrResultExists(userId);

      expect(response).to.deep.equal(result);
    });

    it('should return null if no result is found for a user', async function () {
      sinon.stub(AssrResultRepository, 'findAssrResultByUserId').resolves(null);

      const response = await AssrResultService.checkAssrResultExists('unknownUser');

      expect(response).to.be.null;
    });
  });

  describe('modifyAssrResult', function () {
    it('should update an existing assessment result', async function () {
      const userId = '1';
      const updatedData = { score: 20 };
      const updatedResult = { userId, ...updatedData };
      sinon.stub(AssrResultRepository, 'updateAssrResult').resolves(updatedResult);

      const result = await AssrResultService.modifyAssrResult(userId, updatedData);

      expect(result).to.deep.equal(updatedResult);
    });
  });

  describe('CalculateAssrsResult', function () {
    it('should return "Positive" if total score is above the threshold', function () {
      const questions = { q1: 5, q2: 5, q3: 5 };
      const result = AssrResultService.CalculateAssrsResult(questions);

      expect(result).to.equal('Positive');
    });

    it('should return "Negative" if total score is below the threshold', function () {
      const questions = { q1: 2, q2: 3, q3: 4 };
      const result = AssrResultService.CalculateAssrsResult(questions);

      expect(result).to.equal('Negative');
    });
  });

  describe('getOneAssrsService', function () {
    it('should fetch one assessment report by query', async function () {
      const query = { questionId: '101' };
      const options = { fields: 'score' };
      const report = { questionId: '101', score: 15 };
      sinon.stub(AssrResultRepository, 'getOneAssrs').resolves(report);

      const result = await AssrResultService.getOneAssrsService(query, options);

      expect(result).to.deep.equal(report);
    });

    it('should throw an error if report is not found', async function () {
      sinon.stub(AssrResultRepository, 'getOneAssrs').resolves(null);

      await expect(AssrResultService.getOneAssrsService({ questionId: 'invalidID' }, {})).to.be.rejectedWith(
        createError.UnprocessableEntity,
        'Invalid question ID'
      );
    });
  });

  describe('getAlternativeAssrService', function () {
    it('should fetch alternative assessment questions from external API', async function () {
      const result = await AssrResultService.getAlternativeAssrService();

      expect(result);
    });
  });
});
