import { moduleLogger } from '@sliit-foss/module-logger';
import { isCelebrateError } from 'celebrate';
import { makeResponse } from '@/utils';
// eslint-disable-next-line import/order
import { responseInterceptor } from './response';

const logger = moduleLogger('Error-handler');

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _) => {
  if (!res.errorLogged) {
    logger.error(`Error: ${err.message} | Request Path - ${req.path} | Stack: ${err.stack}`, {
      payload: req.body,
      headers: req.headers
    });
    res.errorLogged = true;
  }

  // Call the response interceptor (if applicable)
  responseInterceptor({}, res);

  // Handle Celebrate validation errors
  if (isCelebrateError(err)) {
    for (const [, value] of err.details.entries()) {
      return makeResponse({ res, status: 422, message: value.details[0].message });
    }
  }

  // Handle MongoDB duplicate key errors (e.g., unique field violations)
  else if (err.name === 'MongoServerError' && err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    return makeResponse({ res, status: 400, message: `The ${key} ${err.keyValue[key]} is already taken` });
  }

  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    const validationMessages = Object.values(err.errors)
      .map((error) => error.message)
      .join(', ');
    logger.error(`Mongoose Validation Error: ${validationMessages}`);
    return makeResponse({ res, status: 400, message: `Validation error: ${validationMessages}` });
  }

  // Handle JWT errors (expired, invalid, malformed)
  else if (err.message === 'jwt expired') {
    return makeResponse({ res, status: 401, message: 'Token expired' });
  } else if (['invalid token', 'jwt malformed'].includes(err.message)) {
    return makeResponse({ res, status: 401, message: 'Invalid token' });
  }

  // Catch-all for unhandled errors
  logger.error(`Unhandled error: ${err.message} | Stack: ${err.stack}`);
  return makeResponse({
    res,
    status: err.status ?? 500,
    message: err.message && err.expose ? err.message : "Just patching things up. This'll be over in a jiffy!"
  });
};
