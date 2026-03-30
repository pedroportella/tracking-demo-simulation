import 'dotenv/config';
import { app } from './app.js';
import { initializeSimulation } from './modules/simulation/simulation.service.js';

const port = Number(process.env.PORT || 4100);

async function start() {
  await initializeSimulation();

  app.listen(port, () => {
    console.log(`Tracking Demo simulation running on http://localhost:${port}`);
  });
}

void start();
