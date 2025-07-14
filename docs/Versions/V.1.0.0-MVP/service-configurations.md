# Service Configurations

## Node-RED

- **Flows:** Simulate sensors, publish to MQTT, subscribe and write to InfluxDB.
- **Example MQTT Publish Node:**
  - Topic: `sensors/temperature`
  - Payload: `{ "value": 22.5, "unit": "C" }`

## MQTT Broker

- **Default Port:** 1883
- **No authentication** (for local MVP; secure in production)

## InfluxDB

- **Database:** `iot_data`
- **Retention Policy:** Default
- **Example Measurement:** `temperature`

## Grafana

- **Datasource:** InfluxDB
- **Dashboards:** Real-time and historical sensor data

## Docker Compose

- **File:** `docker-compose.yml`
- **Services:** nodered, mqtt, influxdb, grafana
- **Example Service Block:**
  ```yaml
  nodered:
    image: nodered/node-red
    ports:
      - "1880:1880"
    volumes:
      - ./nodered:/data
  ``` 