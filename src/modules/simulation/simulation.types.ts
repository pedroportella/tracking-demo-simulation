import type { SimulationTruckStatus } from '../../shared/contracts/simulation-contracts.js';

export type SimulationTruckRecord = {
  readonly id: string;
  readonly truckCode: string;
  status: SimulationTruckStatus;
  x: number;
  y: number;
  isLoaded: boolean;
  readonly loadingX: number;
  readonly loadingY: number;
  readonly dumpX: number;
  readonly dumpY: number;
  updatedAtUtc: string;
};

export type SimulationLoopState = {
  isRunning: boolean;
  timer: NodeJS.Timeout | null;
  tickIntervalMs: number;
  simulationTick: number;
  updatedAtUtc: string;
};
