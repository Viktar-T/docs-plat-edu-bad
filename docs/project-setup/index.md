# Project Setup

## Overview
Complete guide for setting up the development environment and preparing all necessary tools for the renewable energy monitoring platform.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: At least 10GB free space
- **Network**: Internet connection for software downloads

### Required Software
- **Docker Desktop**: For containerized deployment
- **Node.js**: Version 18+ for web development
- **Python**: Version 3.8+ for data processing
- **Git**: For version control
- **VS Code**: Recommended IDE with extensions

## Installation Steps

### 1. Docker Setup
```bash
# Download and install Docker Desktop
# Enable WSL2 on Windows if applicable
docker --version
```

### 2. Node.js Installation
```bash
# Download from nodejs.org or use package manager
node --version
npm --version
```

### 3. Python Environment
```bash
# Install Python with pip
python --version
pip --version

# Create virtual environment
python -m venv energy-monitor-env
source energy-monitor-env/bin/activate  # Linux/Mac
# or
energy-monitor-env\Scripts\activate     # Windows
```

### 4. Development Tools
```bash
# Install global packages
npm install -g nodered
npm install -g @influxdata/influx-cli
```

## Environment Configuration

### Docker Compose Setup
Create `docker-compose.yml` for local development:
```yaml
version: '3.8'
services:
  mosquitto:
    image: eclipse-mosquitto:latest
    ports:
      - "1883:1883"
      - "9001:9001"
  
  nodered:
    image: nodered/node-red:latest
    ports:
      - "1880:1880"
  
  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
```

### Environment Variables
Create `.env` file:
```env
# MQTT Configuration
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_USERNAME=admin
MQTT_PASSWORD=password

# InfluxDB Configuration
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your-token
INFLUXDB_ORG=your-org
INFLUXDB_BUCKET=energy-data

# Grafana Configuration
GRAFANA_URL=http://localhost:3000
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

## Verification

### Test Docker Services
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# Test MQTT connection
mosquitto_pub -h localhost -t test/topic -m "Hello World"
```

### Verify Installations
```bash
# Check all tools
node --version
python --version
docker --version
git --version
```

## Next Steps

1. **Review** [System Architecture](../architecture/index.md) to understand the platform design
2. **Proceed to** [Phase 1: Hardware Integration](../phases/01-hardware/index.md) for device setup
3. **Use** [Simulation Guide](../simulation/index.md) if you don't have physical hardware

## Troubleshooting

- **Docker issues**: Ensure virtualization is enabled in BIOS
- **Port conflicts**: Check if ports 1883, 1880, 8086, 3000 are available
- **Permission errors**: Run commands with appropriate privileges 