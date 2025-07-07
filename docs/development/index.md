# Development Tools

## Overview
Comprehensive guide for development environment setup, debugging tools, testing frameworks, and best practices for the renewable energy monitoring platform.

<!-- Grey text section start -->
<div class="text-grey">
## Development Environment Setup

### IDE Configuration

#### VS Code Setup
```json
{
  "settings": {
    "python.defaultInterpreter": "./venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "editor.formatOnSave": true,
    "files.autoSave": "onFocusChange"
  },
  "extensions": [
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-python.pylint",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-azuretools.vscode-docker"
  ]
}
```

#### PyCharm Configuration
- **Project Interpreter**: Set to virtual environment
- **Code Style**: Configure PEP 8 compliance
- **Debugging**: Set up remote debugging for IoT devices
- **Testing**: Configure pytest integration

### Version Control Setup
```bash
# Initialize Git repository
git init
git add .
git commit -m "Initial commit"

# Create .gitignore
cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
.env

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Docker
.dockerignore

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
logs/

# Data
*.db
*.sqlite
data/

# Secrets
secrets/
*.key
*.pem
EOF
```

## Debugging Tools

### MQTT Debugging

#### MQTT Explorer
```bash
# Install MQTT Explorer
# Download from https://mqtt-explorer.com/

# Configuration
Broker: localhost
Port: 1883
Username: admin
Password: password
```

#### Command Line MQTT Tools
```bash
# Subscribe to all topics
mosquitto_sub -h localhost -u admin -P password -t "energy-monitor/#" -v

# Subscribe to specific device
mosquitto_sub -h localhost -u admin -P password -t "energy-monitor/devices/solar_panel_001/#" -v

# Publish test message
mosquitto_pub -h localhost -u device_user -P password -t "energy-monitor/test" -m "Hello World"

# Monitor with timestamp
mosquitto_sub -h localhost -u admin -P password -t "energy-monitor/#" -v | while read line; do echo "$(date): $line"; done
```

#### Python MQTT Debug Client
```python
import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime

class MQTTDebugger:
    def __init__(self, broker_host="localhost", broker_port=1883):
        self.client = mqtt.Client()
        self.client.username_pw_set("admin", "password")
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        self.broker_host = broker_host
        self.broker_port = broker_port
        
    def on_connect(self, client, userdata, flags, rc):
        print(f"Connected to MQTT broker with result code {rc}")
        client.subscribe("energy-monitor/#")
        
    def on_message(self, client, userdata, msg):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            payload = json.loads(msg.payload.decode())
            print(f"[{timestamp}] {msg.topic}: {json.dumps(payload, indent=2)}")
        except json.JSONDecodeError:
            print(f"[{timestamp}] {msg.topic}: {msg.payload.decode()}")
            
    def on_disconnect(self, client, userdata, rc):
        print(f"Disconnected with result code {rc}")
        
    def connect(self):
        self.client.connect(self.broker_host, self.broker_port, 60)
        
    def start_monitoring(self):
        print("Starting MQTT monitoring...")
        self.client.loop_forever()
        
    def stop_monitoring(self):
        self.client.disconnect()

# Usage
debugger = MQTTDebugger()
debugger.connect()
debugger.start_monitoring()
```

### Node-RED Debugging

#### Debug Nodes
```json
{
  "id": "debug-flow",
  "type": "tab",
  "label": "Debug Flow",
  "nodes": [
    {
      "id": "debug-node",
      "type": "debug",
      "name": "Debug Output",
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto"
    },
    {
      "id": "status-node",
      "type": "status",
      "name": "Status Monitor",
      "scope": "global"
    }
  ]
}
```

#### Node-RED Logging
```javascript
// In function nodes
node.log("Debug message");
node.warn("Warning message");
node.error("Error message");

// Log with context
node.log("Processing device: " + msg.payload.device_id);
```

### InfluxDB Debugging

#### Query Debugging
```python
from influxdb_client import InfluxDBClient
import pandas as pd

class InfluxDBDebugger:
    def __init__(self, url="http://localhost:8086", token="your-token", org="energy-monitor"):
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.query_api = self.client.query_api()
        
    def query_data(self, bucket="energy-data", measurement="energy_data", time_range="-1h"):
        query = f'''
        from(bucket: "{bucket}")
          |> range(start: {time_range})
          |> filter(fn: (r) => r._measurement == "{measurement}")
          |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        '''
        
        result = self.query_api.query_data_frame(query)
        return result
        
    def check_buckets(self):
        buckets_api = self.client.buckets_api()
        buckets = buckets_api.find_buckets()
        for bucket in buckets:
            print(f"Bucket: {bucket.name}, Retention: {bucket.retention_rules}")
            
    def check_organizations(self):
        orgs_api = self.client.organizations_api()
        orgs = orgs_api.find_organizations()
        for org in orgs:
            print(f"Organization: {org.name}, ID: {org.id}")

# Usage
debugger = InfluxDBDebugger()
data = debugger.query_data()
print(data.head())
```

#### InfluxDB CLI Commands
```bash
# Connect to InfluxDB
influx config create --config-name local \
  --host-url http://localhost:8086 \
  --org energy-monitor \
  --token your-token \
  --active

# Query data
influx query 'from(bucket:"energy-data") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "energy_data")'

# Check buckets
influx bucket list

# Check organizations
influx org list
```

## Testing Frameworks

### Unit Testing

#### Python Testing with pytest
```python
import pytest
import json
from unittest.mock import Mock, patch
from energy_simulator import EnergyDeviceSimulator

class TestEnergyDeviceSimulator:
    def setup_method(self):
        self.simulator = EnergyDeviceSimulator("test_device", "solar")
        
    def test_solar_data_generation(self):
        """Test solar data generation"""
        data = self.simulator.generate_solar_data(time.localtime())
        
        assert "voltage" in data
        assert "current" in data
        assert "power" in data
        assert "temperature" in data
        
        assert 0 <= data["voltage"] <= 30
        assert 0 <= data["current"] <= 5
        assert 0 <= data["power"] <= 150
        assert 0 <= data["temperature"] <= 80
        
    def test_mqtt_connection(self):
        """Test MQTT connection"""
        with patch('paho.mqtt.client.Client') as mock_client:
            mock_client.return_value.connect.return_value = 0
            mock_client.return_value.username_pw_set.return_value = None
            
            result = self.simulator.connect()
            assert result == True
            
    def test_message_format(self):
        """Test message format validation"""
        message = self.simulator.generate_message()
        
        required_fields = ["device_id", "timestamp", "data"]
        for field in required_fields:
            assert field in message
            
        assert message["device_id"] == "test_device"
        assert isinstance(message["data"], dict)

# Run tests
# pytest test_energy_simulator.py -v
```

#### Node.js Testing with Jest
```javascript
// test/mqtt-client.test.js
const MQTTClient = require('../src/mqtt-client');

describe('MQTT Client', () => {
  let mqttClient;
  
  beforeEach(() => {
    mqttClient = new MQTTClient('localhost', 1883);
  });
  
  test('should connect to MQTT broker', async () => {
    const result = await mqttClient.connect();
    expect(result).toBe(true);
  });
  
  test('should publish message', async () => {
    await mqttClient.connect();
    const result = await mqttClient.publish('test/topic', 'test message');
    expect(result).toBe(true);
  });
  
  test('should subscribe to topic', async () => {
    await mqttClient.connect();
    const result = await mqttClient.subscribe('test/topic');
    expect(result).toBe(true);
  });
});

// Run tests
// npm test
```

### Integration Testing

#### End-to-End Test Suite
```python
import unittest
import time
import json
from energy_simulator import EnergyDeviceSimulator
from mqtt_debugger import MQTTDebugger
from influxdb_debugger import InfluxDBDebugger

class IntegrationTest(unittest.TestCase):
    def setUp(self):
        self.simulator = EnergyDeviceSimulator("integration_test", "solar")
        self.mqtt_debugger = MQTTDebugger()
        self.influx_debugger = InfluxDBDebugger()
        
    def test_complete_data_pipeline(self):
        """Test complete data flow from simulator to database"""
        
        # Start MQTT monitoring
        self.mqtt_debugger.connect()
        
        # Connect simulator
        self.simulator.connect()
        
        # Publish test data
        self.simulator.publish_data()
        
        # Wait for data processing
        time.sleep(5)
        
        # Check data in InfluxDB
        data = self.influx_debugger.query_data(time_range="-5m")
        
        # Verify data was stored
        self.assertGreater(len(data), 0)
        
        # Verify data format
        latest_data = data.iloc[-1]
        self.assertIn("voltage", latest_data)
        self.assertIn("current", latest_data)
        
    def tearDown(self):
        self.simulator.client.disconnect()
        self.mqtt_debugger.stop_monitoring()

if __name__ == '__main__':
    unittest.main()
```

### Performance Testing

#### Load Testing Script
```python
import threading
import time
import statistics
from energy_simulator import EnergyDeviceSimulator

class LoadTester:
    def __init__(self, num_devices=10, message_interval=1):
        self.num_devices = num_devices
        self.message_interval = message_interval
        self.devices = []
        self.threads = []
        self.results = []
        
    def create_devices(self):
        """Create multiple simulated devices"""
        for i in range(self.num_devices):
            device_type = ["solar", "wind", "battery"][i % 3]
            device_id = f"load_test_{device_type}_{i:03d}"
            device = EnergyDeviceSimulator(device_id, device_type)
            self.devices.append(device)
            
    def run_device(self, device):
        """Run a single device simulation"""
        device.connect()
        start_time = time.time()
        message_count = 0
        
        try:
            while time.time() - start_time < 60:  # Run for 1 minute
                device.publish_data()
                message_count += 1
                time.sleep(self.message_interval)
        except Exception as e:
            print(f"Error in device {device.device_id}: {e}")
        finally:
            device.client.disconnect()
            
        return message_count
        
    def run_load_test(self):
        """Run load test with multiple devices"""
        print(f"Starting load test with {self.num_devices} devices")
        
        # Create and start devices
        self.create_devices()
        
        start_time = time.time()
        
        # Start all devices in separate threads
        for device in self.devices:
            thread = threading.Thread(target=self.run_device, args=(device,))
            thread.start()
            self.threads.append(thread)
            
        # Wait for all threads to complete
        for thread in self.threads:
            thread.join()
            
        end_time = time.time()
        
        # Calculate statistics
        total_time = end_time - start_time
        total_messages = sum(self.results)
        messages_per_second = total_messages / total_time
        
        print(f"Load test completed:")
        print(f"  Total time: {total_time:.2f} seconds")
        print(f"  Total messages: {total_messages}")
        print(f"  Messages per second: {messages_per_second:.2f}")
        
        return {
            "total_time": total_time,
            "total_messages": total_messages,
            "messages_per_second": messages_per_second
        }

# Usage
load_tester = LoadTester(num_devices=20, message_interval=2)
results = load_tester.run_load_test()
```

## Code Quality Tools

### Python Code Quality

#### Black Code Formatter
```bash
# Install Black
pip install black

# Format code
black energy_simulator.py

# Check formatting without changes
black --check energy_simulator.py
```

#### Pylint Configuration
```ini
# .pylintrc
[MASTER]
disable=
    C0114, # missing-module-docstring
    C0115, # missing-class-docstring
    C0116  # missing-function-docstring

[MESSAGES CONTROL]
disable=C0111

[FORMAT]
max-line-length=88

[BASIC]
good-names=i,j,k,ex,Run,_

[MISCELLANEOUS]
notes=
```

#### Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 22.3.0
    hooks:
      - id: black
        language_version: python3
        
  - repo: https://github.com/pycqa/pylint
    rev: v2.15.0
    hooks:
      - id: pylint
        args: [--rcfile=.pylintrc]
        
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.2.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
```

### JavaScript Code Quality

#### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "node:recommended"
  ],
  "env": {
    "node": true,
    "es6": true
  },
  "parserOptions": {
    "ecmaVersion": 2020
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Monitoring and Logging

### Application Logging

#### Python Logging Configuration
```python
import logging
import logging.handlers
import os

def setup_logging(log_level=logging.INFO):
    """Setup application logging"""
    
    # Create logs directory
    os.makedirs("logs", exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.handlers.RotatingFileHandler(
                'logs/energy_monitor.log',
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            ),
            logging.StreamHandler()
        ]
    )
    
    # Create logger for this application
    logger = logging.getLogger('energy_monitor')
    return logger

# Usage
logger = setup_logging()
logger.info("Application started")
logger.error("An error occurred")
```

#### Node.js Logging
```javascript
const winston = require('winston');
const path = require('path');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'energy-monitor' },
  transports: [
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log') 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Application started');
logger.error('An error occurred', { error: error.message });
```

### System Monitoring

#### Docker Monitoring
```bash
# Monitor container resources
docker stats

# Monitor specific container
docker stats nodered influxdb grafana

# Check container logs
docker logs nodered --tail 100 -f

# Monitor disk usage
docker system df
```

#### System Resource Monitoring
```python
import psutil
import time

def monitor_system_resources():
    """Monitor system resource usage"""
    
    while True:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        
        # Network usage
        network = psutil.net_io_counters()
        
        print(f"CPU: {cpu_percent}% | Memory: {memory_percent}% | Disk: {disk_percent}%")
        print(f"Network: {network.bytes_sent} bytes sent, {network.bytes_recv} bytes received")
        
        time.sleep(60)  # Monitor every minute

# Run monitoring
monitor_system_resources()
```

## Best Practices

### Code Organization
```
energy-monitor/
├── src/
│   ├── hardware/
│   │   ├── sensors.py
│   │   └── microcontrollers.py
│   ├── cloud/
│   │   ├── mqtt_client.py
│   │   ├── influxdb_client.py
│   │   └── thingsboard_client.py
│   ├── simulation/
│   │   ├── device_simulator.py
│   │   └── data_generator.py
│   └── utils/
│       ├── config.py
│       ├── logging.py
│       └── validation.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── performance/
├── docs/
├── scripts/
├── config/
└── logs/
```

### Error Handling
```python
import logging
from functools import wraps

logger = logging.getLogger(__name__)

def handle_errors(func):
    """Decorator for error handling"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {e}")
            raise
    return wrapper

@handle_errors
def publish_data(data):
    """Publish data with error handling"""
    # Implementation here
    pass
```

### Configuration Management
```python
import os
import yaml
from typing import Dict, Any

class Config:
    def __init__(self, config_file: str = "config/config.yaml"):
        self.config_file = config_file
        self.config = self.load_config()
        
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from file"""
        if not os.path.exists(self.config_file):
            return self.get_default_config()
            
        with open(self.config_file, 'r') as f:
            return yaml.safe_load(f)
            
    def get_default_config(self) -> Dict[str, Any]:
        """Get default configuration"""
        return {
            "mqtt": {
                "broker": "localhost",
                "port": 1883,
                "username": "admin",
                "password": "password"
            },
            "influxdb": {
                "url": "http://localhost:8086",
                "token": "your-token",
                "org": "energy-monitor",
                "bucket": "energy-data"
            },
            "simulation": {
                "enabled": True,
                "interval": 5,
                "devices": 10
            }
        }
        
    def get(self, key: str, default=None):
        """Get configuration value"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
                
        return value

# Usage
config = Config()
mqtt_broker = config.get("mqtt.broker", "localhost")
```

## Next Steps

1. **Review** [Project Setup](../project-setup/index.md) for environment preparation
2. **Check** [Troubleshooting](../troubleshooting/index.md) for common issues
3. **Proceed to** [Phase 1: Hardware Integration](../phases/01-hardware/index.md) for implementation
4. **Use** [Simulation Guide](../simulation/index.md) for testing without hardware 
</div>