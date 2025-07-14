# Data Flow

| Step | Source         | Destination   | Protocol | Topic/Measurement         | Example Payload/Query         |
|------|---------------|---------------|----------|--------------------------|-------------------------------|
| 1    | Node-RED      | MQTT Broker   | MQTT     | sensors/temperature      | `{ "value": 22.5, "unit": "C" }` |
| 2    | MQTT Broker   | Node-RED      | MQTT     | sensors/temperature      | `{ "value": 22.5, "unit": "C" }` |
| 3    | Node-RED      | InfluxDB      | HTTP     | temperature (measurement)| `value=22.5,unit="C"`         |
| 4    | InfluxDB      | Grafana       | HTTP     | temperature (query)      | `SELECT * FROM temperature`   |

## Data Retention

- All data stored locally in InfluxDB for MVP. 