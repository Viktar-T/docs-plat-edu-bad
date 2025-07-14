# Testing Procedures

## 1. Service Availability

- Check all containers are running:
  ```sh
  docker ps
  ```

## 2. Data Simulation

- Open Node-RED, deploy flows, and verify MQTT messages are published.

## 3. Data Ingestion

- Use InfluxDB UI or CLI to check if data is written:
  ```sh
  docker exec -it <influxdb-container> influx
  > USE iot_data
  > SELECT * FROM temperature
  ```

## 4. Dashboard Verification

- Open Grafana, check if dashboards update in real-time.

## 5. End-to-End Test

- Change simulation parameters in Node-RED and verify changes propagate to Grafana.

## 6. Troubleshooting

| Issue                | Possible Cause         | Solution                        |
|----------------------|-----------------------|----------------------------------|
| No data in Grafana   | Node-RED flow error   | Check Node-RED logs and flows    |
| MQTT connection fail | Broker not running    | Restart MQTT container           | 