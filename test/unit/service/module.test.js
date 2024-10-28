import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import * as ModuleRepository from '@/repository/module';
import * as ModuleService from '@/services/module';

chai.use(chaiAsPromised);

describe('Module Service', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('createNewModule', function () {
    it('should create a new module successfully', async function () {
      const moduleData = { name: 'AI Fundamentals', moduleCode: 'AI101' };
      sinon.stub(ModuleRepository, 'createModule').resolves(moduleData);

      const result = await ModuleService.createNewModule(moduleData);

      expect(result).to.deep.equal(moduleData);
    });
  });

  describe('fetchModules', function () {
    it('should fetch modules based on query', async function () {
      const modules = [{ _id: '1', name: 'AI Fundamentals' }];
      sinon.stub(ModuleRepository, 'getModules').resolves(modules);

      const result = await ModuleService.fetchModules({});

      expect(result).to.deep.equal(modules);
    });
  });

  describe('fetchModuleById', function () {
    it('should fetch a module by ID', async function () {
      const moduleId = '123';
      const moduleData = { _id: moduleId, name: 'AI Fundamentals' };
      sinon.stub(ModuleRepository, 'getModuleById').resolves(moduleData);

      const result = await ModuleService.fetchModuleById(moduleId);

      expect(result).to.deep.equal(moduleData);
    });
  });

  describe('modifyModule', function () {
    it('should update a module successfully', async function () {
      const moduleId = '123';
      const updateData = { name: 'Advanced AI' };
      const updatedModule = { _id: moduleId, ...updateData };
      sinon.stub(ModuleRepository, 'updateModule').resolves(updatedModule);

      const result = await ModuleService.modifyModule(moduleId, updateData);

      expect(result).to.deep.equal(updatedModule);
    });
  });

  describe('appendLectureToModule', function () {
    it('should append a lecture to a module', async function () {
      const moduleId = '123';
      const lectureId = '456';
      const updatedModule = { _id: moduleId, lectures: [lectureId] };
      sinon.stub(ModuleRepository, 'addLectureToModule').resolves(updatedModule);

      const result = await ModuleService.appendLectureToModule(moduleId, lectureId);

      expect(result).to.deep.equal(updatedModule);
    });
  });
});
