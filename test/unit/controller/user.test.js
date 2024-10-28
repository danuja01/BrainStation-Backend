import chai from 'chai';
import sinon from 'sinon';
import * as userController from '@/controllers/user';
import * as userService from '@/services/user';
import { makeResponse } from '@/utils';

const { expect } = chai;

describe('User Controller', function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('createAdmin', function () {
    it('should create an admin user successfully', async function () {
      const req = { body: { name: 'Admin User', email: 'admin@example.com' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const user = { _id: '1', name: 'Admin User' };
      sandbox.stub(userService, 'addNewAdminUser').resolves(user);
      sandbox.stub(makeResponse);

      await userController.createAdmin(req, res);

      expect(makeResponse.calledWith({ res, data: user, message: 'User added successfully' })).to.be.true;
    });
  });

  describe('getAll', function () {
    it('should retrieve all users', async function () {
      const req = { query: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const users = [{ _id: '1', name: 'John' }];
      sandbox.stub(userService, 'getUsers').resolves(users);
      sandbox.stub(makeResponse);

      await userController.getAll(req, res);

      expect(makeResponse.calledWith({ res, data: users, message: 'Users retrieved successfully' })).to.be.true;
    });
  });

  describe('getById', function () {
    it('should retrieve a user by ID', async function () {
      const req = { params: { id: '1' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const user = { _id: '1', name: 'John' };
      sandbox.stub(userService, 'getUserByID').resolves(user);
      sandbox.stub(makeResponse);

      await userController.getById(req, res);

      expect(makeResponse.calledWith({ res, data: user, message: 'User retrieved successfully' })).to.be.true;
    });
  });

  describe('update', function () {
    it('should update a user successfully', async function () {
      const req = { params: { id: '1' }, user: { role: 'ADMIN' }, body: { name: 'Updated User' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const updatedUser = { _id: '1', name: 'Updated User' };
      sandbox.stub(userService, 'updateUserdetails').resolves(updatedUser);
      sandbox.stub(makeResponse);

      await userController.update(req, res);

      expect(makeResponse.calledWith({ res, data: updatedUser, message: 'User updated successfully' })).to.be.true;
    });
  });

  describe('changeAdminPassword', function () {
    it('should change the admin password successfully', async function () {
      const req = { user: { _id: '1' }, body: { old_password: 'oldPass', new_password: 'newPass' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(userService, 'changeAdminPasswordService').resolves();
      sandbox.stub(makeResponse);

      await userController.changeAdminPassword(req, res);

      expect(makeResponse.calledWith({ res, message: 'Password changed successfully' })).to.be.true;
    });
  });

  describe('saveFcmToken', function () {
    it('should save FCM token successfully', async function () {
      const req = { body: { userId: '1', fcmToken: 'sampleToken' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      sandbox.stub(userService, 'saveFcmTokenService').resolves();
      sandbox.stub(makeResponse);

      await userController.saveFcmToken(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: 'FCM token updated successfully' })).to.be.true;
    });
  });

  describe('enrollModuleController', function () {
    it('should enroll a user in a module successfully', async function () {
      const req = { body: { userId: '1', moduleId: '101' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const user = { _id: '1', enrolledModules: ['101'] };
      sandbox.stub(userService, 'enrollModuleService').resolves(user);
      sandbox.stub(makeResponse);

      await userController.enrollModuleController(req, res);

      expect(makeResponse.calledWith({ res, data: user, message: 'User enrolled in module successfully' })).to.be.true;
    });
  });

  describe('unenrollModuleController', function () {
    it('should unenroll a user from a module successfully', async function () {
      const req = { body: { userId: '1', moduleId: '101' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      const user = { _id: '1', enrolledModules: [] };
      sandbox.stub(userService, 'unenrollModuleService').resolves(user);
      sandbox.stub(makeResponse);

      await userController.unenrollModuleController(req, res);

      expect(makeResponse.calledWith({ res, data: user, message: 'User unenrolled from module successfully' })).to.be
        .true;
    });
  });
});
