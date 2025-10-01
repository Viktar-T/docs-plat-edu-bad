# Data Flow

| Step | Source      | Destination | Protocol | Topic/Measurement         | Example Payload/Query              |
| ---- | ----------- | ----------- | -------- | ------------------------- | ---------------------------------- |
| 1    | Node-RED    | MQTT Broker | MQTT     | sensors/temperature       | `{ "value": 22.5, "unit": "C" }` |
| 2    | MQTT Broker | Node-RED    | MQTT     | sensors/temperature       | `{ "value": 22.5, "unit": "C" }` |
| 3    | Node-RED    | InfluxDB    | HTTP     | temperature (measurement) | `value=22.5,unit="C"`            |
| 4    | InfluxDB    | Grafana     | HTTP     | temperature (query)       | `SELECT * FROM temperature`      |

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
