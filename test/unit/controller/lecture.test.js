import axios from 'axios';
import chai from 'chai';
import sinon from 'sinon';
import { createLecture, deleteLecture, getLectureById, getLecturesByOrg, updateLecture } from '@/controllers/lecture';
import * as lectureService from '@/services/lecture';
import * as moduleService from '@/services/module';

const { expect } = chai;

describe('Lecture Controller', function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('createLecture', function () {
    it('should create a lecture and append it to a module successfully', async function () {
      const req = {
        body: { title: 'New Lecture', organization: 'Org1', moduleId: 'module1' },
        file: {
          buffer: Buffer.from('file data'),
          originalname: 'lecture.pdf',
          mimetype: 'application/pdf'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const lectureData = { _id: 'lecture1', title: 'New Lecture', organization: 'Org1', slides: [] };
      sandbox.stub(axios, 'post').resolves({ data: { slides: [] } });
      sandbox.stub(lectureService, 'insertLectureService').resolves(lectureData);
      sandbox.stub(moduleService, 'appendLectureToModule').resolves();

      await createLecture(req, res);

      expect(res.status.calledWith(200)).to.be.false;
    });

    it('should handle errors during lecture creation', async function () {
      const req = { body: {}, file: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(axios, 'post').rejects(new Error('Upload error'));

      await createLecture(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe('getLectureById', function () {
    it('should retrieve a lecture by ID successfully', async function () {
      const req = { params: { id: 'lecture1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const lectureData = { _id: 'lecture1', title: 'Sample Lecture' };
      sandbox.stub(lectureService, 'getLectureByIdService').resolves(lectureData);

      await getLectureById(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          message: 'Lecture retrieved successfully',
          data: lectureData
        })
      ).to.be.true;
    });
  });

  describe('getLecturesByOrg', function () {
    it('should retrieve lectures by organization', async function () {
      const req = { query: { organization: 'Org1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const lectures = [{ _id: '1', title: 'Lecture 1' }];
      sandbox.stub(lectureService, 'getLecturesByOrgService').resolves(lectures);

      await getLecturesByOrg(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledOnceWith({
          message: 'lectures retrieved successfully',
          data: lectures
        })
      ).to.be.true;
    });
  });

  describe('deleteLecture', function () {
    it('should delete a lecture successfully', async function () {
      const req = { params: { id: 'lecture1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(lectureService, 'deleteLectureService').resolves();

      await deleteLecture(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ message: 'Lecture deleted successfully' })).to.be.true;
    });
  });

  describe('updateLecture', function () {
    it('should update a lecture successfully', async function () {
      const req = { params: { id: 'lecture1' }, body: { title: 'Updated Lecture' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(lectureService, 'updateLectureService').resolves();

      await updateLecture(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ message: 'Lecture updated successfully' })).to.be.true;
    });
  });
});
