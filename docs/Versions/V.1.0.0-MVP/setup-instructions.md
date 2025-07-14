# Setup Instructions

## Prerequisites

- Docker & Docker Compose installed
- Ports 1883 (MQTT), 1880 (Node-RED), 8086 (InfluxDB), 3000 (Grafana) available

## Quick Start

1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. Start all services:
   ```sh
   docker-compose up -d
   ```

3. Access services:
   - Node-RED: [http://localhost:1880](http://localhost:1880)
   - Grafana: [http://localhost:3000](http://localhost:3000)
   - InfluxDB: [http://localhost:8086](http://localhost:8086)
   - MQTT Broker: `localhost:1883`

## Stopping Services

```sh
docker-compose down
```

## Directory Structure

| Path                                 | Purpose                        |
|---------------------------------------|--------------------------------|
| `docker-compose.yml`                  | Service orchestration          |
| `nodered/`                            | Node-RED flows and config      |
| `grafana/`                            | Grafana provisioning           |
| `influxdb/`                           | InfluxDB data/config           | 