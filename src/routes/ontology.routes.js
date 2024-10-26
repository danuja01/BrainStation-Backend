import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  checkOntologyExistsController,
  generateOntologyController,
  getOntologyFileController,
  updateOntologyFileController
} from '@/controllers/ontologyGenerator';
import { authorizer } from '@/middleware';

const ontologyRouter = express.Router();

ontologyRouter.post(
  '/generate-ontology',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(generateOntologyController)
);
ontologyRouter.put(
  '/modify-ontology',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(updateOntologyFileController)
);
ontologyRouter.get(
  '/file',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(getOntologyFileController)
);
ontologyRouter.get(
  '/exists',
  authorizer(['STUDENT', 'LECTURER', 'ADMIN']),
  tracedAsyncHandler(checkOntologyExistsController)
);

export default ontologyRouter;
