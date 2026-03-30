# Tracking Demo Simulation

## Purpose

`tracking-demo-simulation` is the standalone telemetry producer for the tracking demo platform.

It owns:

- truck movement rules
- simulation loop lifecycle
- in-memory fleet state
- telemetry publishing to `tracking-demo-services`
- simulation control endpoints

## Current architecture

- simulation runs independently from the services API
- telemetry is pushed to `tracking-demo-services` over HTTP
- services persists telemetry and exposes live/reporting APIs to the UI

## Future architecture intention

The next architecture step is pub/sub or broker-based delivery, such as RabbitMQ, Azure Service Bus, or Kafka. The simulation repo would publish telemetry events, while services would subscribe and persist them.

## Endpoints

- `GET /health`
- `GET /simulation/snapshot`
- `GET /simulation/state`
- `POST /simulation/start`
- `POST /simulation/stop`
- `POST /simulation/reset`
- `POST /simulation/tick`

## Environment variables

- `PORT=4100`
- `SIMULATION_INTERVAL_MS=1000`
- `SIMULATION_TRUCK_COUNT=3`
- `SIMULATION_AUTOSTART=true`
- `TELEMETRY_TARGET_URL=http://localhost:4000/telemetry/events`

## Local development

```bash
pnpm install
pnpm dev
```

## Notes

- this repo does not own persistence
- this repo is intentionally lightweight and easy to replace with a broker publisher later
- replay is a future concern handled by services persistence, not by this repo
