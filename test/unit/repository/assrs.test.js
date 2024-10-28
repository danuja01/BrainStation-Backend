import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoose from 'mongoose';
import AssrResult from '@/models/assrs';
import * as AssrResultRepository from '@/repository/assrResult';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('AssrResult Repository', function () {
  beforeEach(async function () {
    await AssrResult.deleteMany({});
  });

  describe('createAssrResult', function () {
    it('should create a new ASSR result', async function () {
      const assrData = {
        assrsResult: 'Positive',
        userId: new mongoose.Types.ObjectId()
      };

      await AssrResultRepository.createAssrResult(assrData);
      const createdResult = await AssrResult.findOne({ userId: assrData.userId });

      expect(createdResult).to.have.property('_id');
      expect(createdResult.assrsResult).to.equal(assrData.assrsResult);
    });
  });

  describe('findAssrResultByUserId', function () {
    it('should find an ASSR result by userId', async function () {
      const userId = new mongoose.Types.ObjectId();
      const assrData = { assrsResult: 'Positive', userId };
      await AssrResult.create(assrData);

      const foundResult = await AssrResultRepository.findAssrResultByUserId(userId);
      expect(foundResult).to.have.property('_id');
      expect(foundResult.userId.toString()).to.equal(userId.toString());
      expect(foundResult.assrsResult).to.equal(assrData.assrsResult);
    });
  });

  describe('updateAssrResult', function () {
    it('should update an ASSR result by userId', async function () {
      const userId = new mongoose.Types.ObjectId();
      const initialData = { assrsResult: 'Positive', userId };
      await AssrResult.create(initialData);

      const updatedData = { assrsResult: 'Negative' };
      const updatedResult = await AssrResultRepository.updateAssrResult(userId, updatedData);

      expect(updatedResult.assrsResult).to.equal(updatedData.assrsResult);
    });

    it('should return null if no ASSR result is found for update', async function () {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const updatedResult = await AssrResultRepository.updateAssrResult(nonExistentUserId, { assrsResult: 'Negative' });
      expect(updatedResult).to.be.null;
    });
  });

  describe('getOneAssrs', function () {
    it('should retrieve an ASSR result by filters', async function () {
      const userId = new mongoose.Types.ObjectId();
      const assrData = { assrsResult: 'Positive', userId };
      await AssrResult.create(assrData);

      const foundResult = await AssrResultRepository.getOneAssrs({ userId });
      expect(foundResult).to.have.property('_id');
      expect(foundResult.assrsResult).to.equal(assrData.assrsResult);
    });

    it('should return null if no matching ASSR result is found', async function () {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const foundResult = await AssrResultRepository.getOneAssrs({ userId: nonExistentUserId });
      expect(foundResult).to.be.null;
    });
  });
});
