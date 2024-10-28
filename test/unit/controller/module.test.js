import chai from 'chai';
import sinon from 'sinon';
import {
  addLectureController,
  createModuleController,
  getModuleController,
  getModulesController,
  updateModuleController
} from '@/controllers/module';
import * as moduleService from '@/services/module';

const { expect } = chai;

describe('Module Controller', function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('createModuleController', function () {
    it('should create a module successfully', async function () {
      const req = { body: { name: 'Module 1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const newModule = { _id: '1', name: 'Module 1' };
      sandbox.stub(moduleService, 'createNewModule').resolves(newModule);

      await createModuleController(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnceWith({ message: 'Module created successfully', data: newModule })).to.be.true;
    });
  });

  describe('getModulesController', function () {
    it('should retrieve a list of modules successfully', async function () {
      const req = { query: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const modules = [
        { _id: '1', name: 'Module 1' },
        { _id: '2', name: 'Module 2' }
      ];
      sandbox.stub(moduleService, 'fetchModules').resolves(modules);

      await getModulesController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ message: 'Modules retrieved successfully', data: modules })).to.be.true;
    });
  });

  describe('getModuleController', function () {
    it('should retrieve a module by ID successfully', async function () {
      const req = { params: { id: '1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const module = { _id: '1', name: 'Module 1' };
      sandbox.stub(moduleService, 'fetchModuleById').resolves(module);

      await getModuleController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ message: 'Module retrieved successfully', data: module })).to.be.true;
    });
  });

  describe('updateModuleController', function () {
    it('should update a module successfully', async function () {
      const req = { params: { id: '1' }, body: { name: 'Updated Module 1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const updatedModule = { _id: '1', name: 'Updated Module 1' };
      sandbox.stub(moduleService, 'modifyModule').resolves(updatedModule);

      await updateModuleController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ message: 'Module updated successfully', data: updatedModule })).to.be.true;
    });
  });

  describe('addLectureController', function () {
    it('should add a lecture to a module successfully', async function () {
      const req = { body: { moduleId: '1', lectureId: '101' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const updatedModule = { _id: '1', lectures: ['101'] };
      sandbox.stub(moduleService, 'appendLectureToModule').resolves(updatedModule);

      await addLectureController(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ message: 'Lecture added to module successfully', data: updatedModule })).to.be
        .true;
    });
  });
});
