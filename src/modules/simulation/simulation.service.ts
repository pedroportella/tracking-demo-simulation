import type {
  SimulationCommandResponseDto,
  SimulationFleetSnapshotDto,
  SimulationStateDto,
} from '../../shared/contracts/simulation-contracts.js';
import type { TelemetryIngestRequestDto } from '../../shared/contracts/telemetry-contracts.js';
import type { SimulationLoopState, SimulationTruckRecord } from './simulation.types.js';

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 800;
const LOADING_ZONE = { x: 100, y: 100 };
const DUMP_ZONE = { x: 900, y: 700 };
const STEP_SIZE = 25;
const DEFAULT_TICK_INTERVAL_MS = Number(process.env.SIMULATION_INTERVAL_MS || 1000);
const DEFAULT_TRUCK_COUNT = Math.max(1, Number(process.env.SIMULATION_TRUCK_COUNT || 3));
const AUTO_START_SIMULATION = `${process.env.SIMULATION_AUTOSTART ?? 'true'}` !== 'false';
const TELEMETRY_TARGET_URL = (process.env.TELEMETRY_TARGET_URL || 'http://localhost:4000/telemetry/events').replace(/\/$/, '');

const loopState: SimulationLoopState = {
  isRunning: false,
  timer: null,
  tickIntervalMs: DEFAULT_TICK_INTERVAL_MS,
  simulationTick: 0,
  updatedAtUtc: new Date().toISOString(),
};

let trucks: SimulationTruckRecord[] = [];

function buildDefaultTruckRecords(truckCount: number): SimulationTruckRecord[] {
  return Array.from({ length: truckCount }, (_value, index) => {
    const truckNumber = index + 1;
    const xOffset = (index % 3) * 40;
    const yOffset = Math.floor(index / 3) * 40;
    const loadingX = Math.min(MAP_WIDTH, LOADING_ZONE.x + xOffset);
    const loadingY = Math.min(MAP_HEIGHT, LOADING_ZONE.y + yOffset);
    const dumpX = Math.max(0, DUMP_ZONE.x - xOffset);
    const dumpY = Math.max(0, DUMP_ZONE.y - yOffset);

    return {
      id: crypto.randomUUID(),
      truckCode: `T-${String(truckNumber).padStart(3, '0')}`,
      status: 'LOADING',
      x: loadingX,
      y: loadingY,
      isLoaded: false,
      loadingX,
      loadingY,
      dumpX,
      dumpY,
      updatedAtUtc: new Date().toISOString(),
    };
  });
}

function moveTowards(current: number, target: number, step: number): number {
  const distance = target - current;

  if (Math.abs(distance) <= step) {
    return target;
  }

  return current + Math.sign(distance) * step;
}

function buildSnapshot(): SimulationFleetSnapshotDto {
  return {
    trucks: trucks.map((truck) => ({
      id: truck.id,
      truckCode: truck.truckCode,
      status: truck.status,
      x: truck.x,
      y: truck.y,
      isLoaded: truck.isLoaded,
      updatedAtUtc: truck.updatedAtUtc,
    })),
    simulationTick: loopState.simulationTick,
    snapshotTakenAtUtc: new Date().toISOString(),
  };
}

function buildState(): SimulationStateDto {
  return {
    isRunning: loopState.isRunning,
    tickIntervalMs: loopState.tickIntervalMs,
    truckCount: trucks.length,
    simulationTick: loopState.simulationTick,
    updatedAtUtc: loopState.updatedAtUtc,
  };
}

async function publishTelemetrySnapshot(): Promise<void> {
  const payload: TelemetryIngestRequestDto = {
    source: 'tracking-demo-simulation',
    simulation: buildState(),
    snapshot: buildSnapshot(),
  };

  await fetch(TELEMETRY_TARGET_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

function buildCommandResponse(message: string): SimulationCommandResponseDto {
  return {
    message,
    simulation: buildState(),
    snapshot: buildSnapshot(),
  };
}

function tickTruck(truck: SimulationTruckRecord): void {
  switch (truck.status) {
    case 'LOADING':
      truck.isLoaded = true;
      truck.status = 'HAULING';
      break;

    case 'HAULING':
      truck.x = moveTowards(truck.x, truck.dumpX, STEP_SIZE);
      truck.y = moveTowards(truck.y, truck.dumpY, STEP_SIZE);

      if (truck.x === truck.dumpX && truck.y === truck.dumpY) {
        truck.status = 'DUMPING';
      }
      break;

    case 'DUMPING':
      truck.isLoaded = false;
      truck.status = 'PUSHING';
      break;

    case 'PUSHING':
      truck.x = moveTowards(truck.x, truck.loadingX, STEP_SIZE);
      truck.y = moveTowards(truck.y, truck.loadingY, STEP_SIZE);

      if (truck.x === truck.loadingX && truck.y === truck.loadingY) {
        truck.status = 'LOADING';
      }
      break;

    case 'IDLE':
      truck.status = 'LOADING';
      break;
  }

  truck.updatedAtUtc = new Date().toISOString();
}

function stopTimer(): void {
  if (loopState.timer) {
    clearInterval(loopState.timer);
    loopState.timer = null;
  }
}

export async function initializeSimulation(): Promise<void> {
  trucks = buildDefaultTruckRecords(DEFAULT_TRUCK_COUNT);
  loopState.updatedAtUtc = new Date().toISOString();
  await publishTelemetrySnapshot();

  if (AUTO_START_SIMULATION) {
    startSimulationLoop();
  }
}

export async function getSimulationSnapshot(): Promise<SimulationFleetSnapshotDto> {
  return buildSnapshot();
}

export async function getSimulationState(): Promise<SimulationStateDto> {
  return buildState();
}

export async function tickSimulation(): Promise<SimulationCommandResponseDto> {
  for (const truck of trucks) {
    tickTruck(truck);
  }

  loopState.simulationTick += 1;
  loopState.updatedAtUtc = new Date().toISOString();
  await publishTelemetrySnapshot();

  return buildCommandResponse('Simulation advanced by one tick.');
}

export async function resetSimulation(): Promise<SimulationCommandResponseDto> {
  trucks = buildDefaultTruckRecords(DEFAULT_TRUCK_COUNT);
  loopState.simulationTick = 0;
  loopState.updatedAtUtc = new Date().toISOString();
  await publishTelemetrySnapshot();

  return buildCommandResponse('Simulation has been reset.');
}

function startSimulationLoop(): void {
  if (loopState.isRunning) {
    return;
  }

  loopState.isRunning = true;
  loopState.updatedAtUtc = new Date().toISOString();
  loopState.timer = setInterval(() => {
    void tickSimulation();
  }, loopState.tickIntervalMs);
}

export async function startSimulation(): Promise<SimulationCommandResponseDto> {
  startSimulationLoop();
  return buildCommandResponse('Simulation started.');
}

export async function stopSimulation(): Promise<SimulationCommandResponseDto> {
  stopTimer();
  loopState.isRunning = false;
  loopState.updatedAtUtc = new Date().toISOString();
  return buildCommandResponse('Simulation stopped.');
}
