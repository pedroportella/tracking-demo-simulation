import type { Request, Response } from 'express';
import {
  getSimulationSnapshot,
  getSimulationState,
  resetSimulation,
  startSimulation,
  stopSimulation,
  tickSimulation,
} from './simulation.service.js';

async function respond(res: Response, action: () => Promise<unknown>) {
  try {
    res.json(await action());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected simulation error';
    res.status(500).json({ message });
  }
}

export async function getSimulationSnapshotHandler(_req: Request, res: Response) {
  await respond(res, getSimulationSnapshot);
}

export async function getSimulationStateHandler(_req: Request, res: Response) {
  await respond(res, getSimulationState);
}

export async function tickSimulationHandler(_req: Request, res: Response) {
  await respond(res, tickSimulation);
}

export async function resetSimulationHandler(_req: Request, res: Response) {
  await respond(res, resetSimulation);
}

export async function startSimulationHandler(_req: Request, res: Response) {
  await respond(res, startSimulation);
}

export async function stopSimulationHandler(_req: Request, res: Response) {
  await respond(res, stopSimulation);
}
