import cors from 'cors';
import express from 'express';
import { simulationRouter } from './modules/simulation/simulation.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'tracking-demo-simulation' });
});

app.use('/simulation', simulationRouter);

export { app };
