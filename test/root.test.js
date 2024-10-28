import { setupTestEnvironment, teardownTestEnvironment } from './test-setup';

before(async function () {
  this.timeout(0);
  await setupTestEnvironment();
});

after(async function () {
  await teardownTestEnvironment();
  console.log('Test environment teardown complete.');
});
