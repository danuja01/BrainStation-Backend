import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoose from 'mongoose';
import User from '@/models/user';
import * as UserRepository from '@/repository/user';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('User Repository', function () {
  beforeEach(async function () {
    await User.deleteMany({});
  });

  describe('createUser', function () {
    it('should create a new user and omit the password in the returned object', async function () {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        organization: 'ExampleOrg',
        role: 'STUDENT'
      };

      const createdUser = await UserRepository.createUser(userData);
      expect(createdUser).to.have.property('_id');
      expect(createdUser).to.not.have.property('password');
      expect(createdUser.email).to.equal(userData.email);
    });
  });

  describe('getAllUsers', function () {
    it('should return paginated users without the password field', async function () {
      const usersData = [
        {
          name: 'Alice',
          email: 'alice@example.com',
          username: 'alice123',
          password: 'password123',
          organization: 'ExampleOrg'
        },
        {
          name: 'Bob',
          email: 'bob@example.com',
          username: 'bob123',
          password: 'password123',
          organization: 'ExampleOrg'
        }
      ];

      await User.insertMany(usersData);
      const result = await UserRepository.getAllUsers({ page: 1, limit: 2 });
      expect(result.docs).to.have.lengthOf(2);
      expect(result.docs[0]).to.not.have.property('password');
    });
  });

  describe('getOneUser', function () {
    it('should retrieve a user by filters and omit the password by default', async function () {
      const userData = {
        name: 'Jane',
        email: 'jane@example.com',
        username: 'jane123',
        password: 'password123',
        organization: 'ExampleOrg'
      };
      await User.create(userData);
      const user = await UserRepository.getOneUser({ email: userData.email });
      expect(user).to.have.property('_id');
      expect(user).to.not.have.property('password');
    });
  });

  describe('findOneAndUpdateUser', function () {
    it('should update a user and exclude the password from the result', async function () {
      const userData = {
        name: 'Tom',
        email: 'tom@example.com',
        username: 'tom123',
        password: 'password123',
        organization: 'ExampleOrg'
      };
      const user = await User.create(userData);

      const updatedUser = await UserRepository.findOneAndUpdateUser({ _id: user._id }, { name: 'Tommy' });
      expect(updatedUser.name).to.equal('Tommy');
      expect(updatedUser).to.not.have.property('password');
    });
  });

  describe('enrollModule', function () {
    it('should enroll a user in a module if not already enrolled', async function () {
      const user = await User.create({
        name: 'Emma',
        email: 'emma@example.com',
        username: 'emma123',
        password: 'password123',
        organization: 'ExampleOrg'
      });
      const moduleId = new mongoose.Types.ObjectId();

      const updatedUser = await UserRepository.enrollModule(user._id, moduleId);
      expect(updatedUser.enrolledModules).to.include(moduleId);
    });

    it('should throw an error if the module is already enrolled', async function () {
      const moduleId = new mongoose.Types.ObjectId();
      const user = await User.create({
        name: 'Lucy',
        email: 'lucy@example.com',
        username: 'lucy123',
        password: 'password123',
        organization: 'ExampleOrg',
        enrolledModules: [moduleId]
      });

      await expect(UserRepository.enrollModule(user._id, moduleId)).to.be.rejectedWith('Module already enrolled.');
    });
  });

  describe('unenrollModule', function () {
    it('should unenroll a user from a module', async function () {
      const moduleId = new mongoose.Types.ObjectId();
      const user = await User.create({
        name: 'Mark',
        email: 'mark@example.com',
        username: 'mark123',
        password: 'password123',
        organization: 'ExampleOrg',
        enrolledModules: [moduleId]
      });

      const updatedUser = await UserRepository.unenrollModule(user._id, moduleId);
      expect(updatedUser.enrolledModules).to.not.include(moduleId);
    });
  });

  describe('isUserEnrolledInModule', function () {
    it('should return true if the user is enrolled in the module', async function () {
      const moduleId = new mongoose.Types.ObjectId();
      const user = await User.create({
        name: 'Sara',
        email: 'sara@example.com',
        username: 'sara123',
        password: 'password123',
        organization: 'ExampleOrg',
        enrolledModules: [moduleId]
      });

      const isEnrolled = await UserRepository.isUserEnrolledInModule(user._id, moduleId);
      expect(isEnrolled).to.be.false;
    });

    it('should return false if the user is not enrolled in the module', async function () {
      const moduleId = new mongoose.Types.ObjectId();
      const user = await User.create({
        name: 'Tom',
        email: 'tom@example.com',
        username: 'tom123',
        password: 'password123',
        organization: 'ExampleOrg'
      });

      const isEnrolled = await UserRepository.isUserEnrolledInModule(user._id, moduleId);
      expect(isEnrolled).to.be.false;
    });
  });
});
