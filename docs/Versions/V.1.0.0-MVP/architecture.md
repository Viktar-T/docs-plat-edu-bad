# Architecture Overview

## Version: V.1.0.0 - MVP - Local

### System Components

| Component   | Description                                      | Technology      |
|-------------|--------------------------------------------------|-----------------|
| Node-RED    | Simulates and processes sensor data              | Node-RED        |
| MQTT Broker | Message broker for sensor data                   | Eclipse Mosquitto (or similar) |
| InfluxDB    | Time-series database for storing sensor data     | InfluxDB        |
| Grafana     | Visualization and dashboarding                   | Grafana         |
| Docker      | Containerization and orchestration               | Docker, docker-compose |

### High-Level Workflow

1. **Node-RED** simulates sensor data and publishes to MQTT topics.
2. **MQTT Broker** receives and distributes messages.
3. **Node-RED** (subscriber flow) writes incoming MQTT data to **InfluxDB**.
4. **Grafana** queries **InfluxDB** and displays dashboards.

### Architecture Diagram

```mermaid
flowchart LR
    A[Node-RED (Simulate Sensors)] -- MQTT Publish --> B[MQTT Broker]
    B -- MQTT Subscribe --> C[Node-RED (DB Writer)]
    C -- Write --> D[InfluxDB]
    E[Grafana] -- Query --> D
``` 

 