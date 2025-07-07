# Phase 1: Hardware Integration & Data Acquisition

## Overview
Complete hardware setup for renewable energy monitoring, including sensor integration, microcontroller programming, and MQTT communication configuration.

## Hardware Architecture

### Required Components
- **Microcontrollers**: ESP32, Arduino, or Raspberry Pi
- **Sensors**: Voltage, current, temperature, humidity sensors
- **Energy Sources**: Solar panels, wind turbines, batteries
- **Communication**: WiFi modules, Ethernet shields
- **Power Supply**: Voltage regulators, power management

### System Block Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Energy        │    │   Sensors       │    │   Microcontroller│
│   Sources       │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Solar Panel   │    │ • Voltage       │    │ • ESP32         │
│ • Wind Turbine  │    │ • Current       │    │ • Arduino       │
│ • Battery Bank  │    │ • Temperature   │    │ • Raspberry Pi  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MQTT          │
                    │   Communication │
                    └─────────────────┘
```

<!-- Grey text section start -->
<div class="text-grey">
## Device Communication Setup

### ESP32 Configuration
```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// WiFi Configuration
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// MQTT Configuration
const char* mqtt_server = "192.168.1.100";
const int mqtt_port = 1883;
const char* mqtt_username = "device_user";
const char* mqtt_password = "device_password";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  setupWiFi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensor data
  float voltage = readVoltage();
  float current = readCurrent();
  float temperature = readTemperature();
  
  // Publish data
  publishData(voltage, current, temperature);
  
  delay(5000); // 5 second interval
}
```

### Arduino Configuration
```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// Similar setup as ESP32 but with WiFi library
// Use Ethernet shield for wired connection
```

## MQTT Broker Configuration

### Mosquitto Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mosquitto mosquitto-clients

# Windows
# Download from https://mosquitto.org/download/

# macOS
brew install mosquitto
```

### Mosquitto Configuration
```conf
# /etc/mosquitto/mosquitto.conf
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd
persistence true
persistence_location /var/lib/mosquitto/
log_type all
log_dest file /var/log/mosquitto/mosquitto.log
```

### User Management
```bash
# Create password file
sudo mosquitto_passwd -c /etc/mosquitto/passwd admin
sudo mosquitto_passwd /etc/mosquitto/passwd device_user

# Set permissions
sudo chown mosquitto:mosquitto /etc/mosquitto/passwd
sudo chmod 600 /etc/mosquitto/passwd
```

## Topic Structure and Naming

### MQTT Topic Hierarchy
```
energy-monitor/
├── devices/
│   ├── {device-id}/
│   │   ├── solar/
│   │   │   ├── voltage
│   │   │   ├── current
│   │   │   ├── power
│   │   │   └── efficiency
│   │   ├── wind/
│   │   │   ├── voltage
│   │   │   ├── current
│   │   │   ├── power
│   │   │   └── wind_speed
│   │   ├── battery/
│   │   │   ├── voltage
│   │   │   ├── current
│   │   │   ├── state_of_charge
│   │   │   └── temperature
│   │   └── environment/
│   │       ├── temperature
│   │       ├── humidity
│   │       └── light_intensity
│   └── status/
│       ├── online
│       ├── health
│       └── errors
└── system/
    ├── alerts
    ├── maintenance
    └── configuration
```

### Message Format
```json
{
  "device_id": "solar_panel_001",
  "timestamp": "2024-01-15T10:30:00Z",
  "location": "building_roof",
  "data": {
    "voltage": 24.5,
    "current": 2.1,
    "power": 51.45,
    "temperature": 45.2,
    "efficiency": 0.85
  },
  "metadata": {
    "firmware_version": "1.2.0",
    "battery_level": 95,
    "signal_strength": -45
  }
}
```

## Data Transmission Validation

### Testing MQTT Communication
```bash
# Subscribe to all topics
mosquitto_sub -h localhost -u admin -P password -t "energy-monitor/#" -v

# Publish test message
mosquitto_pub -h localhost -u device_user -P password -t "energy-monitor/devices/test/status" -m "online"

# Monitor specific device
mosquitto_sub -h localhost -u admin -P password -t "energy-monitor/devices/solar_panel_001/#" -v
```

### Python MQTT Test Script
```python
import paho.mqtt.client as mqtt
import json
import time

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("energy-monitor/#")

def on_message(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")

client = mqtt.Client()
client.username_pw_set("admin", "password")
client.on_connect = on_connect
client.on_message = on_message

client.connect("localhost", 1883, 60)
client.loop_forever()
```

## Device Simulation (Without Real Hardware)

### Python MQTT Simulator
```python
import paho.mqtt.client as mqtt
import json
import time
import random

class EnergyDeviceSimulator:
    def __init__(self, device_id, device_type):
        self.device_id = device_id
        self.device_type = device_type
        self.client = mqtt.Client()
        self.client.username_pw_set("device_user", "device_password")
        
    def connect(self):
        self.client.connect("localhost", 1883, 60)
        
    def generate_solar_data(self):
        # Simulate solar panel data
        voltage = 20 + random.uniform(-2, 5)  # 18-25V
        current = 1 + random.uniform(-0.3, 0.5)  # 0.7-1.5A
        power = voltage * current
        temperature = 25 + random.uniform(-5, 20)  # 20-45°C
        
        return {
            "voltage": round(voltage, 2),
            "current": round(current, 2),
            "power": round(power, 2),
            "temperature": round(temperature, 1)
        }
        
    def publish_data(self):
        if self.device_type == "solar":
            data = self.generate_solar_data()
        else:
            data = {"status": "unknown_device_type"}
            
        message = {
            "device_id": self.device_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "data": data
        }
        
        topic = f"energy-monitor/devices/{self.device_id}/{self.device_type}"
        self.client.publish(topic, json.dumps(message))
        print(f"Published: {topic}")

# Usage
simulator = EnergyDeviceSimulator("solar_panel_001", "solar")
simulator.connect()

while True:
    simulator.publish_data()
    time.sleep(5)
```

### Node-RED Simulator Flow
```json
{
  "id": "energy-simulator",
  "type": "tab",
  "label": "Energy Device Simulator",
  "nodes": [
    {
      "id": "inject",
      "type": "inject",
      "name": "Trigger",
      "props": {
        "payload": "",
        "topic": "",
        "repeat": "5"
      }
    },
    {
      "id": "function",
      "type": "function",
      "name": "Generate Data",
      "func": "msg.payload = {\n  device_id: 'solar_panel_001',\n  timestamp: new Date().toISOString(),\n  data: {\n    voltage: 20 + Math.random() * 5,\n    current: 1 + Math.random() * 0.5,\n    temperature: 25 + Math.random() * 20\n  }\n};\nmsg.topic = 'energy-monitor/devices/solar_panel_001/solar';\nreturn msg;"
    },
    {
      "id": "mqtt-out",
      "type": "mqtt out",
      "name": "MQTT Publisher",
      "topic": "",
      "qos": "1",
      "retain": false
    }
  ]
}
```

## Sensor Specifications

### Voltage Sensors
- **Range**: 0-30V DC
- **Accuracy**: ±1%
- **Interface**: Analog or I2C
- **Recommended**: INA219, ACS712

### Current Sensors
- **Range**: 0-5A DC
- **Accuracy**: ±2%
- **Interface**: Analog or I2C
- **Recommended**: ACS712, INA219

### Temperature Sensors
- **Range**: -40°C to +125°C
- **Accuracy**: ±0.5°C
- **Interface**: Digital (OneWire) or I2C
- **Recommended**: DS18B20, BME280

### Humidity Sensors
- **Range**: 0-100% RH
- **Accuracy**: ±3%
- **Interface**: Digital or I2C
- **Recommended**: DHT22, BME280

## Hardware Assembly Guide

### Step 1: Power Supply Setup
1. Connect voltage regulator to power source
2. Add capacitors for stability
3. Test output voltage with multimeter

### Step 2: Sensor Connections
1. Connect sensors to microcontroller
2. Add pull-up resistors where needed
3. Verify connections with continuity test

### Step 3: Communication Setup
1. Connect WiFi module or Ethernet shield
2. Configure network settings
3. Test connectivity

### Step 4: Enclosure and Protection
1. Mount components in weatherproof enclosure
2. Add surge protection for power lines
3. Seal cable entries

## Testing and Validation

### Unit Testing
```cpp
void testVoltageSensor() {
  float voltage = readVoltage();
  Serial.print("Voltage: ");
  Serial.println(voltage);
  assert(voltage >= 0 && voltage <= 30);
}

void testCurrentSensor() {
  float current = readCurrent();
  Serial.print("Current: ");
  Serial.println(current);
  assert(current >= 0 && current <= 5);
}
```

### Integration Testing
1. **Power-up test**: Verify all components start correctly
2. **Sensor accuracy test**: Compare with calibrated instruments
3. **Communication test**: Verify MQTT message delivery
4. **Long-term stability test**: Monitor for 24+ hours

## Troubleshooting

### Common Issues
- **WiFi connection fails**: Check SSID, password, and signal strength
- **MQTT connection fails**: Verify broker address, port, and credentials
- **Sensor readings incorrect**: Check wiring and calibration
- **Power supply issues**: Verify voltage levels and current capacity

### Debug Tools
- **Serial Monitor**: For Arduino/ESP32 debugging
- **MQTT Explorer**: GUI tool for MQTT testing
- **Multimeter**: For voltage and current measurements
- **Oscilloscope**: For signal analysis (advanced)

## Next Steps

1. **Proceed to** [Phase 2: Cloud Infrastructure](../02-cloud/index.md) for backend setup
2. **Review** [Simulation Guide](../../simulation/index.md) for hardware-free testing
3. **Check** [Troubleshooting](../../troubleshooting/index.md) for common issues
</div>

