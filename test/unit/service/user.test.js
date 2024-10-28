import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import createError from 'http-errors';
import sinon from 'sinon';
import * as UserRepository from '@/repository/user';
import * as UserService from '@/services/user';

chai.use(chaiAsPromised);

describe('User Service', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('getUsers', function () {
    it('should fetch all users', async function () {
      const query = {};
      const users = [{ _id: '1', name: 'John' }];
      sinon.stub(UserRepository, 'getAllUsers').resolves(users);

      const result = await UserService.getUsers(query);

      expect(result).to.deep.equal(users);
    });
  });

  describe('getUserByID', function () {
    it('should fetch a user by ID', async function () {
      const userId = '1';
      const user = { _id: userId, name: 'John' };
      sinon.stub(UserRepository, 'getOneUser').resolves(user);

      const result = await UserService.getUserByID(userId);

      expect(result).to.deep.equal(user);
    });

    it('should throw an error if user ID is invalid', async function () {
      sinon.stub(UserRepository, 'getOneUser').resolves(null);

      await expect(UserService.getUserByID('invalidID')).to.be.rejectedWith(createError.NotFound, 'Invalid user ID');
    });
  });

  describe('enrollModuleService', function () {
    it('should enroll a user in a module', async function () {
      const userId = '1';
      const moduleId = '101';
      const enrolledUser = { _id: userId, enrolledModules: [moduleId] };
      sinon.stub(UserRepository, 'enrollModule').resolves(enrolledUser);

      const result = await UserService.enrollModuleService(userId, moduleId);

      expect(result).to.deep.equal(enrolledUser);
    });
  });

  describe('unenrollModuleService', function () {
    it('should unenroll a user from a module', async function () {
      const userId = '1';
      const moduleId = '101';
      const updatedUser = { _id: userId, enrolledModules: [] };
      sinon.stub(UserRepository, 'unenrollModule').resolves(updatedUser);

      const result = await UserService.unenrollModuleService(userId, moduleId);

      expect(result).to.deep.equal(updatedUser);
    });
  });

  describe('saveFcmTokenService', function () {
    it('should save the user FCM token successfully', async function () {
      const userId = '1';
      const fcmToken = 'token123';
      const updatedUser = { _id: userId, fcmToken };
      sinon.stub(UserRepository, 'updateUserFcmToken').resolves(updatedUser);

      const result = await UserService.saveFcmTokenService(userId, fcmToken);

      expect(result).to.deep.equal(updatedUser);
    });

    it('should throw an error if FCM token is missing', async function () {
      const userId = '1';
      await expect(UserService.saveFcmTokenService(userId, null)).to.be.rejectedWith(
        createError.BadRequest,
        'User ID and FCM token are required'
      );
    });
  });
});
