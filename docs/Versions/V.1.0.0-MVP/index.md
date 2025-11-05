import projectLinks, { getGitHubRepos, getDeployedServices, getDemos } from '@site/src/data/links';

# Version: V.1.0.0 - MVP - Local, VPS

## 🔗 Project Links

### Web Application

<ul>
  <li>
    <strong><a href={projectLinks.webApp.url}>{projectLinks.webApp.label}</a></strong> - {projectLinks.webApp.description}
  </li>
</ul>

### GitHub Repositories

<ul>
  {getGitHubRepos().map((repo) => (
    <li key={repo.url}>
      <strong><a href={repo.url}>{repo.label}</a></strong> - {repo.description}
    </li>
  ))}
</ul>

### Demo/Live Applications

<ul>
  {getDemos().map((demo) => (
    <li key={demo.url}>
      <strong><a href={demo.url}>{demo.label}</a></strong> - {demo.description}
    </li>
  ))}
</ul>

### Deployed Services

<ul>
  {getDeployedServices().map((service) => (
    <li key={service.url}>
      <strong><a href={service.url}>{service.label}</a></strong> - {service.description}
    </li>
  ))}
</ul>

---

This MVP architecture demonstrates located on VPS, containerized IoT data pipeline for educational and research purposes. All sensor data is simulated, and the stack is fully orchestrated with Docker Compose for easy setup and reproducibility.

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

### 🎯 Key Features
- **Dual Environment**: Local development + Production deployment
- **Separate Ports**: Direct access to each service on dedicated ports
- **No Nginx Dependency**: Simpler architecture without reverse proxy
- **Professional URLs**: Clean, direct service URLs
- **SSL Ready**: Easy HTTPS implementation per service
- **Scalable Architecture**: Easy to add new services
- **Complete IoT Pipeline**: MQTT → Node-RED → InfluxDB → Grafana
- **Device Simulation**: Realistic renewable energy device data simulation
- **Comprehensive Dashboards**: 7 specialized Grafana dashboards
- **Data Retention**: 30-day automatic data retention with cleanup

### 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MIKRUS VPS (Production)                  │
├─────────────────────────────────────────────────────────────┤
│  Port 10108: SSH Access                                     │
│  Port 40098: MQTT Broker (IoT Devices)                      │
│  Port 40099: Grafana Dashboard                              │
│  Port 40100: Node-RED Editor                                │
│  Port 40101: InfluxDB Admin                                 │
│  Port 40102: Reserved for future use                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DIRECT SERVICE ACCESS                     │
├─────────────────────────────────────────────────────────────┐
│  Grafana:     http://robert108.mikrus.xyz:40099            │
│  Node-RED:    http://robert108.mikrus.xyz:40100            │
│  InfluxDB:    http://robert108.mikrus.xyz:40101            │
│  MQTT:        robert108.mikrus.xyz:40098                   │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 Data Flow Pipeline

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IoT Devices   │───▶│   MQTT Broker   │───▶│   Node-RED      │───▶│   InfluxDB 2.x  │
│   (Simulated)   │    │   (Mosquitto)   │    │   (Processing)  │    │   (Database)    │
│                 │    │                 │    │                 │    │                 │
│ • Photovoltaic  │    │ • Topic Routing │    │ • Data Validation│    │ • Time-series   │
│ • Wind Turbine  │    │ • Authentication│    │ • Transformation│    │ • Measurements  │
│ • Biogas Plant  │    │ • QoS Management│    │ • Aggregation   │    │ • Retention     │
│ • Heat Boiler   │    │ • Message Retain│    │ • Error Handling│    │ • Flux Queries  │
│ • Energy Storage│    │                 │    │ • Device Sim.   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                                              │
                                                                              ▼
                                                                   ┌─────────────────┐
                                                                   │   Grafana       │
                                                                   │ (Visualization) │
                                                                   │                 │
                                                                   │ • 7 Dashboards  │
                                                                   │ • Alerts        │
                                                                   │ • Analytics     │
                                                                   │ • Reports       │
                                                                   └─────────────────┘
```

---

## Docker & docker-compose Organization

- All services are defined in a single `docker-compose.yml` file.
- Each service (Node-RED, MQTT Broker, InfluxDB, Grafana) runs in its own isolated container.
- Docker Compose manages service startup order, networking, and persistent volumes.
- The stack can be started or stopped with a single command (`docker-compose up -d` / `docker-compose down`).

---

This architecture enables rapid prototyping, testing, and demonstration of IoT data flows and dashboards without requiring real hardware.

