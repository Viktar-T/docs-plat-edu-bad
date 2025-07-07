# Phase 2: Cloud Infrastructure & Data Handling

## Overview
Complete cloud infrastructure setup for processing, storing, and managing renewable energy data using Node-RED, InfluxDB, and ThingsBoard Community Edition.

<!-- Grey text section start -->
<div class="text-grey">
## Node-RED Installation & Configuration

### Docker Installation
```bash
# Pull Node-RED image
docker pull nodered/node-red:latest

# Run Node-RED container
docker run -d \
  --name nodered \
  -p 1880:1880 \
  -v node-red-data:/data \
  nodered/node-red:latest

# Access Node-RED at http://localhost:1880
```

### Manual Installation
```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Node-RED
sudo npm install -g --unsafe-perm node-red

# Start Node-RED
node-red
```

### Initial Configuration
1. **Access Node-RED**: Open http://localhost:1880
2. **Install Required Nodes**:
   - MQTT nodes (built-in)
   - InfluxDB nodes: `node-red-contrib-influxdb`
   - Dashboard nodes: `node-red-dashboard`
   - Function nodes (built-in)

```bash
# Install additional nodes
cd ~/.node-red
npm install node-red-contrib-influxdb
npm install node-red-dashboard
npm install node-red-contrib-mqtt-broker
```

## Creating Node-RED Flows

### Basic MQTT to InfluxDB Flow
```json
{
  "id": "energy-data-flow",
  "type": "tab",
  "label": "Energy Data Processing",
  "nodes": [
    {
      "id": "mqtt-in",
      "type": "mqtt in",
      "name": "Energy Data Input",
      "topic": "energy-monitor/devices/+/+/+",
      "qos": "1"
    },
    {
      "id": "json-parse",
      "type": "json",
      "name": "Parse JSON"
    },
    {
      "id": "data-extract",
      "type": "function",
      "name": "Extract Data",
      "func": "const data = msg.payload;\nconst topic = msg.topic;\nconst parts = topic.split('/');\n\nmsg.payload = {\n  measurement: 'energy_data',\n  tags: {\n    device_id: data.device_id,\n    sensor_type: parts[3],\n    parameter: parts[4]\n  },\n  fields: data.data,\n  timestamp: new Date(data.timestamp)\n};\n\nreturn msg;"
    },
    {
      "id": "influxdb-out",
      "type": "influxdb out",
      "name": "Store in InfluxDB",
      "influxdb": "influxdb-config"
    }
  ]
}
```

### Advanced Data Processing Flow
```json
{
  "id": "advanced-processing",
  "type": "tab",
  "label": "Advanced Data Processing",
  "nodes": [
    {
      "id": "mqtt-in-advanced",
      "type": "mqtt in",
      "name": "Raw Data Input",
      "topic": "energy-monitor/devices/+/solar/+"
    },
    {
      "id": "data-validation",
      "type": "function",
      "name": "Validate Data",
      "func": "const data = msg.payload;\n\n// Check for valid voltage range\nif (data.data.voltage < 0 || data.data.voltage > 30) {\n  msg.payload = null;\n  return null;\n}\n\n// Check for valid current range\nif (data.data.current < 0 || data.data.current > 5) {\n  msg.payload = null;\n  return null;\n}\n\nreturn msg;"
    },
    {
      "id": "calculate-efficiency",
      "type": "function",
      "name": "Calculate Efficiency",
      "func": "const data = msg.payload;\nconst voltage = data.data.voltage;\nconst current = data.data.current;\nconst power = voltage * current;\n\n// Calculate efficiency (simplified)\nconst maxPower = 100; // Theoretical maximum\nconst efficiency = (power / maxPower) * 100;\n\ndata.data.power = power;\ndata.data.efficiency = efficiency;\nmsg.payload = data;\n\nreturn msg;"
    },
    {
      "id": "alert-check",
      "type": "function",
      "name": "Check Alerts",
      "func": "const data = msg.payload;\nconst efficiency = data.data.efficiency;\n\nif (efficiency < 50) {\n  // Send alert\n  const alert = {\n    topic: 'energy-monitor/system/alerts',\n    payload: {\n      device_id: data.device_id,\n      alert_type: 'low_efficiency',\n      value: efficiency,\n      timestamp: new Date().toISOString()\n    }\n  };\n  \n  node.send([msg, {topic: alert.topic, payload: alert.payload}]);\n} else {\n  node.send([msg, null]);\n}"
    }
  ]
}
```

## InfluxDB Setup & Integration

### Docker Installation
```bash
# Pull InfluxDB image
docker pull influxdb:2.7

# Run InfluxDB container
docker run -d \
  --name influxdb \
  -p 8086:8086 \
  -v influxdb-data:/var/lib/influxdb2 \
  -v influxdb-config:/etc/influxdb2 \
  -e DOCKER_INFLUXDB_INIT_MODE=setup \
  -e DOCKER_INFLUXDB_INIT_USERNAME=admin \
  -e DOCKER_INFLUXDB_INIT_PASSWORD=adminpassword \
  -e DOCKER_INFLUXDB_INIT_ORG=energy-monitor \
  -e DOCKER_INFLUXDB_INIT_BUCKET=energy-data \
  influxdb:2.7

# Access InfluxDB at http://localhost:8086
```

### Manual Installation
```bash
# Ubuntu/Debian
wget https://dl.influxdata.com/influxdb/releases/influxdb2-2.7.1-amd64.deb
sudo dpkg -i influxdb2-2.7.1-amd64.deb

# Start InfluxDB
sudo systemctl start influxdb
sudo systemctl enable influxdb
```

### Initial Setup
1. **Access InfluxDB**: Open http://localhost:8086
2. **Create Organization**: `energy-monitor`
3. **Create Bucket**: `energy-data`
4. **Generate API Token**: Save for Node-RED configuration

### Node-RED InfluxDB Configuration
```json
{
  "id": "influxdb-config",
  "type": "influxdb",
  "name": "InfluxDB Connection",
  "url": "http://localhost:8086",
  "token": "your-api-token",
  "org": "energy-monitor",
  "bucket": "energy-data"
}
```

### Data Retention Policies
```sql
-- Create retention policy for 1 year
CREATE RETENTION POLICY "one_year" ON "energy-monitor" DURATION 365d REPLICATION 1 DEFAULT;

-- Create retention policy for 30 days (high-frequency data)
CREATE RETENTION POLICY "thirty_days" ON "energy-monitor" DURATION 30d REPLICATION 1;
```

## ThingsBoard Community Edition Deployment

### Docker Installation
```bash
# Create docker-compose file for ThingsBoard
cat > docker-compose-thingsboard.yml << EOF
version: '3.8'
services:
  thingsboard:
    image: thingsboard/tb-postgres
    ports:
      - "9090:9090"
      - "1883:1883"
      - "5683:5683"
    environment:
      TB_QUEUE_TYPE: in-memory
      TB_DB_HOST: postgres
      TB_DB_PORT: 5432
      TB_DB_NAME: thingsboard
      TB_DB_USERNAME: postgres
      TB_DB_PASSWORD: postgres
    volumes:
      - tb-data:/data
      - tb-logs:/var/log/thingsboard
    depends_on:
      - postgres
    restart: always

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: thingsboard
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: always

volumes:
  tb-data:
  tb-logs:
  postgres-data:
EOF

# Start ThingsBoard
docker-compose -f docker-compose-thingsboard.yml up -d
```

### Manual Installation
```bash
# Download ThingsBoard
wget https://github.com/thingsboard/thingsboard/releases/download/v3.6.2/thingsboard-3.6.2.deb
sudo dpkg -i thingsboard-3.6.2.deb

# Configure database
sudo nano /etc/thingsboard/conf/thingsboard.conf

# Start ThingsBoard
sudo systemctl start thingsboard
sudo systemctl enable thingsboard
```

### Device Registration
1. **Access ThingsBoard**: Open http://localhost:9090
2. **Login**: Default credentials (tenant@thingsboard.io / tenant)
3. **Create Device**:
   - Device Name: `solar_panel_001`
   - Device Type: `Solar Panel`
   - Device Profile: `Default`

### MQTT Integration
```bash
# Device credentials
Device ID: solar_panel_001
Username: solar_panel_001
Password: [generated by ThingsBoard]

# MQTT Topics
Telemetry: v1/devices/me/telemetry
Attributes: v1/devices/me/attributes
RPC: v1/devices/me/rpc/request/+
```

### Node-RED to ThingsBoard Integration
```json
{
  "id": "thingsboard-flow",
  "type": "tab",
  "label": "ThingsBoard Integration",
  "nodes": [
    {
      "id": "mqtt-in-tb",
      "type": "mqtt in",
      "name": "Energy Data",
      "topic": "energy-monitor/devices/+/+/+"
    },
    {
      "id": "format-tb",
      "type": "function",
      "name": "Format for ThingsBoard",
      "func": "const data = msg.payload;\nconst topic = msg.topic;\nconst parts = topic.split('/');\n\nmsg.topic = 'v1/devices/me/telemetry';\nmsg.payload = {\n  [parts[4]]: data.data[parts[4]]\n};\n\nreturn msg;"
    },
    {
      "id": "mqtt-out-tb",
      "type": "mqtt out",
      "name": "ThingsBoard MQTT",
      "topic": "",
      "qos": "1"
    }
  ]
}
```

## Data Flow Validation

### Testing Complete Pipeline
```python
import paho.mqtt.client as mqtt
import json
import time

def test_data_pipeline():
    # Connect to MQTT broker
    client = mqtt.Client()
    client.username_pw_set("device_user", "device_password")
    client.connect("localhost", 1883, 60)
    
    # Test data
    test_data = {
        "device_id": "test_solar_001",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "data": {
            "voltage": 24.5,
            "current": 2.1,
            "temperature": 45.2
        }
    }
    
    # Publish test message
    topic = "energy-monitor/devices/test_solar_001/solar/voltage"
    client.publish(topic, json.dumps(test_data))
    
    print(f"Published test data to {topic}")
    client.disconnect()

if __name__ == "__main__":
    test_data_pipeline()
```

### Verification Steps
1. **Check MQTT Messages**: Use MQTT Explorer or mosquitto_sub
2. **Verify Node-RED Flow**: Check flow execution in Node-RED
3. **Check InfluxDB Data**: Query database for stored data
4. **Verify ThingsBoard**: Check device telemetry in ThingsBoard

### InfluxDB Query Examples
```sql
-- Query recent data
SELECT * FROM energy_data 
WHERE time > now() - 1h 
ORDER BY time DESC;

-- Query by device
SELECT * FROM energy_data 
WHERE device_id = 'solar_panel_001' 
AND time > now() - 24h;

-- Aggregate data
SELECT mean(voltage), mean(current), mean(power) 
FROM energy_data 
WHERE time > now() - 7d 
GROUP BY time(1h);
```

## Performance Optimization

### Node-RED Optimization
```json
{
  "id": "optimized-flow",
  "type": "tab",
  "label": "Optimized Data Processing",
  "nodes": [
    {
      "id": "batch-processor",
      "type": "function",
      "name": "Batch Processor",
      "func": "// Process multiple messages in batch\nif (!context.batch) {\n  context.batch = [];\n}\n\ncontext.batch.push(msg.payload);\n\nif (context.batch.length >= 10) {\n  // Process batch\n  const batchData = context.batch;\n  context.batch = [];\n  \n  // Send batch to InfluxDB\n  msg.payload = batchData;\n  return msg;\n}\n\nreturn null;"
    }
  ]
}
```

### InfluxDB Optimization
```sql
-- Create continuous queries for downsampling
CREATE CONTINUOUS QUERY "cq_hourly_avg" ON "energy-monitor" 
BEGIN 
  SELECT mean(voltage), mean(current), mean(power) 
  INTO "energy_data_hourly" 
  FROM energy_data 
  GROUP BY time(1h), device_id 
END;

-- Create indexes for better query performance
CREATE INDEX ON energy_data (device_id, time);
```

## Security Configuration

### MQTT Security
```conf
# mosquitto.conf
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd
certfile /etc/mosquitto/certs/server.crt
keyfile /etc/mosquitto/certs/server.key
```

### InfluxDB Security
```bash
# Create read-only user
influx user create --name readonly --password readonlypass

# Grant permissions
influx auth create --user readonly --org energy-monitor --read-bucket energy-data
```

### ThingsBoard Security
```bash
# Configure HTTPS
# Edit thingsboard.conf
TB_QUEUE_TYPE=in-memory
TB_SSL_ENABLED=true
TB_SSL_KEY_ALIAS=thingsboard
TB_SSL_KEY_PASSWORD=thingsboard
```

## Monitoring and Logging

### Node-RED Monitoring
```json
{
  "id": "monitoring-flow",
  "type": "tab",
  "label": "System Monitoring",
  "nodes": [
    {
      "id": "system-stats",
      "type": "function",
      "name": "System Statistics",
      "func": "const stats = {\n  timestamp: new Date().toISOString(),\n  messages_processed: context.get('messages_processed') || 0,\n  errors: context.get('errors') || 0,\n  uptime: process.uptime()\n};\n\nmsg.payload = stats;\nmsg.topic = 'system/monitoring/stats';\n\nreturn msg;"
    }
  ]
}
```

### Log Aggregation
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/nodered

# Log rotation configuration
/home/pi/.node-red/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 pi pi
}
```

## Troubleshooting

### Common Issues
- **Node-RED not starting**: Check port conflicts and permissions
- **InfluxDB connection fails**: Verify API token and organization
- **ThingsBoard device not receiving data**: Check device credentials
- **High memory usage**: Optimize flows and add resource limits

### Debug Commands
```bash
# Check Node-RED logs
docker logs nodered

# Check InfluxDB status
docker exec influxdb influx ping

# Check ThingsBoard logs
docker logs thingsboard

# Monitor system resources
docker stats
```

## Next Steps

1. **Proceed to** [Phase 3: Web Platform](../03-web/index.md) for visualization setup
2. **Review** [Development Tools](../../development/index.md) for debugging
3. **Check** [Troubleshooting](../../troubleshooting/index.md) for common issues
</div>

