import express from 'express';
import { tracedAsyncHandler } from '@sliit-foss/functions';
import { generateOntologyController, getOntologyFileController } from '@/controllers/ontologyGenerator';

const ontologyRouter = express.Router();

ontologyRouter.post('/generate-ontology', tracedAsyncHandler(generateOntologyController));
ontologyRouter.get('/:id', tracedAsyncHandler(getOntologyFileController));

export default ontologyRouter;
