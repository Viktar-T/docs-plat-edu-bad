# Architecture Overview

## Version: V.1.0.0 - MVP - Local

This MVP architecture demonstrates a local, containerized IoT data pipeline for educational and research purposes. All sensor data is simulated, and the stack is fully orchestrated with Docker Compose for easy setup and reproducibility.

## Main Components

| Component   | Description                                                                                     | Technology                     |
| ----------- | ----------------------------------------------------------------------------------------------- | ------------------------------ |
| Node-RED    | Simulates and processes sensor data. Publishes to and subscribes from MQTT. Writes to InfluxDB. | Node-RED                       |
| MQTT Broker | Message broker for sensor data. Receives and distributes MQTT messages.                         | Eclipse Mosquitto (or similar) |
| InfluxDB    | Time-series database for storing sensor data.                                                   | InfluxDB                       |
| Grafana     | Visualization and dashboarding. Queries InfluxDB for real-time and historical data.             | Grafana                        |
| Docker      | Containerization and orchestration of all services.                                             | Docker, docker-compose         |

## Data Flow and Interactions

1. **Node-RED (Simulator):** Simulates sensor data and publishes it to specific MQTT topics (e.g., `sensors/temperature`).
2. **MQTT Broker:** Receives published messages and makes them available to subscribers.
3. **Node-RED (Subscriber/DB Writer):** Subscribes to MQTT topics, processes incoming data, and writes it to InfluxDB.
4. **InfluxDB:** Stores all incoming time-series data from Node-RED.
5. **Grafana:** Connects to InfluxDB and visualizes the data in real-time dashboards.
6. **Docker & docker-compose:** Each service runs in its own container. `docker-compose.yml` defines and manages the entire stack, ensuring all services are networked and started together.

## System Architecture Diagram

```mermaid
graph LR
    subgraph Docker Compose Stack
        A[Node-RED (Simulate Sensors)] -- MQTT Publish --> B[MQTT Broker]
        B -- MQTT Subscribe --> C[Node-RED (DB Writer)]
        C -- Write --> D[InfluxDB]
        E[Grafana] -- Query --> D
    end
    classDef docker fill:#f9f,stroke:#333,stroke-width:2;
    class Docker Compose Stack docker;
```

## Docker & docker-compose Organization

- All services are defined in a single `docker-compose.yml` file.
- Each service (Node-RED, MQTT Broker, InfluxDB, Grafana) runs in its own isolated container.
- Docker Compose manages service startup order, networking, and persistent volumes.
- The stack can be started or stopped with a single command (`docker-compose up -d` / `docker-compose down`).

---

This architecture enables rapid prototyping, testing, and demonstration of IoT data flows and dashboards without requiring real hardware.
