import { moduleLogger } from '@sliit-foss/module-logger';
import mongoose from 'mongoose';

const logger = moduleLogger('Database-Connection');

const connectDB = () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        logger.info('Database connection established successfully');
        resolve();
      })
      .catch((err) => {
        logger.error(`Error connecting to DB: ${err}`);
        reject(err);
      });

    mongoose.connection.on('error', (err) => logger.error(`Error connecting to DB: ${err}`));
  });
};

export default connectDB;
