# Maintenance & Operations

## Starting/Stopping Services

- Start: `docker-compose up -d`
- Stop: `docker-compose down`

## Logs

- View logs for a service:
  ```sh
  docker-compose logs <service>
  ```

## Updating Services

- Pull latest images and restart:
  ```sh
  docker-compose pull
  docker-compose up -d
  ```

## Backups

- InfluxDB: Backup data directory (`./influxdb`)
- Node-RED: Backup flows (`./nodered/flows.json`)

## Common Tasks

| Task                | Command/Action                        |
|---------------------|---------------------------------------|
| Restart a service   | `docker-compose restart <service>`    |
| View container logs | `docker-compose logs <service>`       |
| Update all services | `docker-compose pull && docker-compose up -d` | 