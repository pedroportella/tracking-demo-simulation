import type {
  SimulationFleetSnapshotDto,
  SimulationStateDto,
} from './simulation-contracts.js';

export type TelemetryIngestRequestDto = {
  readonly source: string;
  readonly simulation: SimulationStateDto;
  readonly snapshot: SimulationFleetSnapshotDto;
};
