import { Router } from 'express';
import {
  getSimulationSnapshotHandler,
  getSimulationStateHandler,
  resetSimulationHandler,
  startSimulationHandler,
  stopSimulationHandler,
  tickSimulationHandler,
} from './simulation.controller.js';

const simulationRouter = Router();

simulationRouter.get('/snapshot', getSimulationSnapshotHandler);
simulationRouter.get('/state', getSimulationStateHandler);
simulationRouter.post('/tick', tickSimulationHandler);
simulationRouter.post('/reset', resetSimulationHandler);
simulationRouter.post('/start', startSimulationHandler);
simulationRouter.post('/stop', stopSimulationHandler);

export { simulationRouter };
