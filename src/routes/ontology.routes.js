import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import {
  checkOntologyExistsController,
  generateOntologyController,
  getOntologyFileController,
  updateOntologyFileController
} from '@/controllers/ontologyGenerator';

const ontologyRouter = express.Router();

ontologyRouter.post('/generate-ontology', tracedAsyncHandler(generateOntologyController));
ontologyRouter.put('/modify-ontology', tracedAsyncHandler(updateOntologyFileController));
ontologyRouter.get('/file', tracedAsyncHandler(getOntologyFileController));
ontologyRouter.get('/exists', tracedAsyncHandler(checkOntologyExistsController));

export default ontologyRouter;
