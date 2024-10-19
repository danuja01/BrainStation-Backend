// import { moduleLogger } from '@sliit-foss/module-logger';
// import admin from 'firebase-admin';
// import serviceAccount from '../../config/serviceAccountKey.json';

// const logger = moduleLogger('Firebase-Service');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: 'gs://brainstation-ee7bb.appspot.com'
// });

// export const sendNotification = async (token, message) => {
//   try {
//     await admin.messaging().send({
//       token,
//       notification: {
//         title: message.title,
//         body: message.body
//       }
//     });
//     logger.info('Notification sent successfully');
//   } catch (error) {
//     logger.error(`Error sending notification: ${error.message}`);
//   }
// };

// module.exports = admin;
