import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import * as LectureRepository from '@/repository/lecture';
import * as LectureService from '@/services/lecture';

chai.use(chaiAsPromised);

describe('Lecture Service', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('insertLectureService', function () {
    it('should insert a lecture successfully', async function () {
      const lectureData = { title: 'Introduction to AI' };
      sinon.stub(LectureRepository, 'insertLecture').resolves(lectureData);

      const result = await LectureService.insertLectureService(lectureData);

      expect(result).to.deep.equal(lectureData);
    });

    it('should throw an error if lecture insertion fails', async function () {
      sinon.stub(LectureRepository, 'insertLecture').rejects(new Error('Insertion failed'));

      const insertLecturePromise = LectureService.insertLectureService({ title: 'Introduction to AI' });

      await expect(insertLecturePromise).to.be.rejectedWith(Error, 'Error when processing lecture');
    });
  });

  describe('getLectureByIdService', function () {
    it('should return a lecture by ID', async function () {
      const lectureId = '123';
      const lectureData = { _id: lectureId, title: 'Introduction to AI' };
      sinon.stub(LectureRepository, 'getLectureById').resolves(lectureData);

      const result = await LectureService.getLectureByIdService(lectureId);

      expect(result).to.deep.equal(lectureData);
    });

    it('should throw an error if lecture ID is invalid', async function () {
      sinon.stub(LectureRepository, 'getLectureById').resolves(null);

      const getLecturePromise = LectureService.getLectureByIdService('invalidID');

      await expect(getLecturePromise).to.be.rejectedWith(Error, 'Invalid lecture Id');
    });
  });

  describe('getLecturesByOrgService', function () {
    it('should fetch lectures by organization query', async function () {
      const lectures = [{ _id: '1', title: 'Introduction to AI' }];
      sinon.stub(LectureRepository, 'getLecturesByOrg').resolves(lectures);

      const result = await LectureService.getLecturesByOrgService({ organization: 'AI University' });

      expect(result).to.deep.equal(lectures);
    });
  });

  describe('deleteLectureService', function () {
    it('should delete a lecture by ID', async function () {
      const lectureId = '123';
      const lectureData = { _id: lectureId, title: 'Introduction to AI' };
      sinon.stub(LectureRepository, 'deleteLecture').resolves(lectureData);

      const result = await LectureService.deleteLectureService(lectureId);

      expect(result).to.deep.equal(lectureData);
    });

    it('should throw an error if lecture ID is invalid for deletion', async function () {
      sinon.stub(LectureRepository, 'deleteLecture').resolves(null);

      const deletePromise = LectureService.deleteLectureService('invalidID');

      await expect(deletePromise).to.be.rejectedWith(Error, 'Invalid Lecture ID');
    });
  });

  describe('updateLectureService', function () {
    it('should update a lecture successfully', async function () {
      const lectureId = '123';
      const updateData = { title: 'Advanced AI Concepts' };
      const updatedLecture = { _id: lectureId, ...updateData };
      sinon.stub(LectureRepository, 'updateLecture').resolves(updatedLecture);

      const result = await LectureService.updateLectureService(lectureId, updateData);

      expect(result).to.deep.equal(updatedLecture);
    });

    it('should throw an error if lecture ID is invalid for update', async function () {
      sinon.stub(LectureRepository, 'updateLecture').resolves(null);

      const updatePromise = LectureService.updateLectureService('invalidID', { title: 'Advanced AI Concepts' });

      await expect(updatePromise).to.be.rejectedWith(Error, 'Invalid Lecture ID');
    });
  });
});
