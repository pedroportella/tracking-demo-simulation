export const simulationTruckStatuses = [
  'LOADING',
  'HAULING',
  'DUMPING',
  'PUSHING',
  'IDLE',
] as const;

export type SimulationTruckStatus = (typeof simulationTruckStatuses)[number];

export type SimulationTruckSnapshotDto = {
  readonly id: string;
  readonly truckCode: string;
  readonly status: SimulationTruckStatus;
  readonly x: number;
  readonly y: number;
  readonly isLoaded: boolean;
  readonly updatedAtUtc: string;
};

export type SimulationFleetSnapshotDto = {
  readonly trucks: readonly SimulationTruckSnapshotDto[];
  readonly simulationTick: number;
  readonly snapshotTakenAtUtc: string;
};

export type SimulationStateDto = {
  readonly isRunning: boolean;
  readonly tickIntervalMs: number;
  readonly truckCount: number;
  readonly simulationTick: number;
  readonly updatedAtUtc: string;
};

export type SimulationCommandResponseDto = {
  readonly message: string;
  readonly simulation: SimulationStateDto;
  readonly snapshot: SimulationFleetSnapshotDto;
};
