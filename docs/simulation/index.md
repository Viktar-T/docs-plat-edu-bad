# Simulation Guide

## Overview
Complete guide for simulating renewable energy devices and data without physical hardware, enabling development and testing of the monitoring platform in any environment.

## Why Use Simulation?

### Benefits
- **No Hardware Required**: Test the complete system without physical devices
- **Rapid Development**: Quick iteration and testing of data flows
- **Cost Effective**: No need to purchase sensors or energy equipment
- **Educational**: Learn system behavior before hardware deployment
- **Scalable Testing**: Simulate multiple devices simultaneously

### Use Cases
- **Development**: Test data processing and visualization
- **Education**: Teach IoT concepts without hardware investment
- **Proof of Concept**: Demonstrate system capabilities
- **Training**: Prepare for real hardware deployment

## Simulation Methods

### 1. Python MQTT Simulator

#### Basic Energy Device Simulator
```python
import paho.mqtt.client as mqtt
import json
import time
import random
import math

class EnergyDeviceSimulator:
    def __init__(self, device_id, device_type, broker_host="localhost", broker_port=1883):
        self.device_id = device_id
        self.device_type = device_type
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.client = mqtt.Client()
        self.client.username_pw_set("device_user", "device_password")
        self.time_offset = 0
        
    def connect(self):
        try:
            self.client.connect(self.broker_host, self.broker_port, 60)
            print(f"Connected to MQTT broker: {self.broker_host}:{self.broker_port}")
            return True
        except Exception as e:
            print(f"Connection failed: {e}")
            return False
    
    def generate_solar_data(self, timestamp):
        """Generate realistic solar panel data"""
        # Simulate daily solar cycle
        hour = timestamp.hour
        minute = timestamp.minute
        time_of_day = hour + minute / 60.0
        
        # Solar intensity based on time of day (6 AM to 6 PM peak)
        if 6 <= time_of_day <= 18:
            # Peak hours: 10 AM to 2 PM
            if 10 <= time_of_day <= 14:
                intensity = 0.9 + 0.1 * random.random()
            else:
                # Morning/afternoon ramp
                if time_of_day < 10:
                    intensity = (time_of_day - 6) / 4.0
                else:
                    intensity = (18 - time_of_day) / 4.0
        else:
            intensity = 0.0
        
        # Add some randomness and weather effects
        intensity *= (0.7 + 0.3 * random.random())
        
        # Calculate electrical parameters
        voltage = 20 + (intensity * 5) + random.uniform(-0.5, 0.5)
        current = intensity * 2.5 + random.uniform(-0.1, 0.1)
        power = voltage * current
        temperature = 25 + (intensity * 20) + random.uniform(-2, 2)
        efficiency = 0.75 + (intensity * 0.15) + random.uniform(-0.05, 0.05)
        
        return {
            "voltage": round(max(0, voltage), 2),
            "current": round(max(0, current), 2),
            "power": round(max(0, power), 2),
            "temperature": round(temperature, 1),
            "efficiency": round(max(0, min(1, efficiency)), 3),
            "intensity": round(intensity, 3)
        }
    
    def generate_wind_data(self, timestamp):
        """Generate realistic wind turbine data"""
        # Simulate wind patterns
        hour = timestamp.hour
        minute = timestamp.minute
        time_of_day = hour + minute / 60.0
        
        # Wind speed varies throughout the day
        base_wind_speed = 5 + 3 * math.sin(2 * math.pi * time_of_day / 24)
        wind_speed = base_wind_speed + random.uniform(-2, 2)
        wind_speed = max(0, wind_speed)
        
        # Power generation based on wind speed (simplified)
        if wind_speed < 3:
            power_factor = 0
        elif wind_speed < 12:
            power_factor = (wind_speed - 3) / 9
        else:
            power_factor = 1.0
        
        voltage = 24 + (power_factor * 6) + random.uniform(-0.5, 0.5)
        current = power_factor * 3 + random.uniform(-0.1, 0.1)
        power = voltage * current
        temperature = 20 + random.uniform(-5, 5)
        
        return {
            "voltage": round(max(0, voltage), 2),
            "current": round(max(0, current), 2),
            "power": round(max(0, power), 2),
            "wind_speed": round(wind_speed, 1),
            "temperature": round(temperature, 1),
            "power_factor": round(power_factor, 3)
        }
    
    def generate_battery_data(self, timestamp):
        """Generate realistic battery data"""
        # Simulate battery charging/discharging cycle
        hour = timestamp.hour
        minute = timestamp.minute
        time_of_day = hour + minute / 60.0
        
        # Battery state of charge (0-100%)
        # Charging during day, discharging at night
        if 6 <= time_of_day <= 18:
            # Charging period
            soc = 30 + (time_of_day - 6) * 5.8 + random.uniform(-2, 2)
        else:
            # Discharging period
            if time_of_day > 18:
                soc = 100 - (time_of_day - 18) * 4.2 + random.uniform(-2, 2)
            else:
                soc = 100 - (time_of_day + 6) * 4.2 + random.uniform(-2, 2)
        
        soc = max(0, min(100, soc))
        
        # Battery voltage based on state of charge
        voltage = 20 + (soc / 100) * 4 + random.uniform(-0.2, 0.2)
        
        # Current (positive = charging, negative = discharging)
        if 6 <= time_of_day <= 18:
            current = 2 + random.uniform(-0.5, 0.5)  # Charging
        else:
            current = -1.5 + random.uniform(-0.3, 0.3)  # Discharging
        
        power = voltage * current
        temperature = 25 + random.uniform(-3, 3)
        
        return {
            "voltage": round(voltage, 2),
            "current": round(current, 2),
            "power": round(power, 2),
            "state_of_charge": round(soc, 1),
            "temperature": round(temperature, 1),
            "health": round(85 + random.uniform(-5, 5), 1)
        }
    
    def publish_data(self):
        """Publish simulated data to MQTT"""
        timestamp = time.time() + self.time_offset
        
        if self.device_type == "solar":
            data = self.generate_solar_data(time.localtime(timestamp))
        elif self.device_type == "wind":
            data = self.generate_wind_data(time.localtime(timestamp))
        elif self.device_type == "battery":
            data = self.generate_battery_data(time.localtime(timestamp))
        else:
            data = {"status": "unknown_device_type"}
        
        message = {
            "device_id": self.device_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.localtime(timestamp)),
            "location": "simulation_lab",
            "data": data,
            "metadata": {
                "firmware_version": "1.2.0",
                "simulation": True,
                "battery_level": 95,
                "signal_strength": -45
            }
        }
        
        topic = f"energy-monitor/devices/{self.device_id}/{self.device_type}"
        self.client.publish(topic, json.dumps(message))
        print(f"Published {self.device_type} data: {data}")
    
    def run_simulation(self, interval=5, duration=None):
        """Run continuous simulation"""
        print(f"Starting {self.device_type} simulation for device {self.device_id}")
        print(f"Publishing data every {interval} seconds")
        
        start_time = time.time()
        
        try:
            while True:
                if duration and (time.time() - start_time) > duration:
                    print("Simulation duration reached, stopping...")
                    break
                
                self.publish_data()
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\nSimulation stopped by user")
        finally:
            self.client.disconnect()
            print("Disconnected from MQTT broker")

# Usage examples
if __name__ == "__main__":
    # Create and run solar panel simulator
    solar_sim = EnergyDeviceSimulator("solar_panel_001", "solar")
    if solar_sim.connect():
        solar_sim.run_simulation(interval=5)
```

#### Multi-Device Simulator
```python
import threading
import time

class MultiDeviceSimulator:
    def __init__(self, broker_host="localhost", broker_port=1883):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.devices = []
        self.threads = []
        
    def add_device(self, device_id, device_type):
        """Add a device to the simulation"""
        device = EnergyDeviceSimulator(device_id, device_type, self.broker_host, self.broker_port)
        self.devices.append(device)
        
    def start_all_devices(self, interval=5):
        """Start simulation for all devices"""
        for device in self.devices:
            thread = threading.Thread(target=device.run_simulation, args=(interval,))
            thread.daemon = True
            thread.start()
            self.threads.append(thread)
            time.sleep(1)  # Stagger device starts
        
        print(f"Started {len(self.devices)} device simulators")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping all simulators...")

# Usage
simulator = MultiDeviceSimulator()
simulator.add_device("solar_panel_001", "solar")
simulator.add_device("solar_panel_002", "solar")
simulator.add_device("wind_turbine_001", "wind")
simulator.add_device("battery_bank_001", "battery")
simulator.start_all_devices(interval=10)
```

### 2. Node-RED Simulator Flows

#### Basic Device Simulator
```json
{
  "id": "device-simulator",
  "type": "tab",
  "label": "Device Simulator",
  "nodes": [
    {
      "id": "inject-trigger",
      "type": "inject",
      "name": "Trigger",
      "props": {
        "payload": "",
        "topic": "",
        "repeat": "5"
      }
    },
    {
      "id": "generate-data",
      "type": "function",
      "name": "Generate Solar Data",
      "func": "const now = new Date();\nconst hour = now.getHours();\nconst minute = now.getMinutes();\nconst timeOfDay = hour + minute / 60.0;\n\n// Solar intensity simulation\nlet intensity = 0;\nif (6 <= timeOfDay && timeOfDay <= 18) {\n  if (10 <= timeOfDay && timeOfDay <= 14) {\n    intensity = 0.9 + 0.1 * Math.random();\n  } else {\n    if (timeOfDay < 10) {\n      intensity = (timeOfDay - 6) / 4.0;\n    } else {\n      intensity = (18 - timeOfDay) / 4.0;\n    }\n  }\n}\n\nintensity *= (0.7 + 0.3 * Math.random());\n\nconst voltage = 20 + (intensity * 5) + (Math.random() - 0.5);\nconst current = intensity * 2.5 + (Math.random() - 0.1);\nconst power = voltage * current;\nconst temperature = 25 + (intensity * 20) + (Math.random() - 2);\n\nmsg.payload = {\n  device_id: 'solar_panel_001',\n  timestamp: now.toISOString(),\n  location: 'simulation_lab',\n  data: {\n    voltage: Math.round(voltage * 100) / 100,\n    current: Math.round(current * 100) / 100,\n    power: Math.round(power * 100) / 100,\n    temperature: Math.round(temperature * 10) / 10,\n    intensity: Math.round(intensity * 1000) / 1000\n  },\n  metadata: {\n    firmware_version: '1.2.0',\n    simulation: true\n  }\n};\n\nmsg.topic = 'energy-monitor/devices/solar_panel_001/solar';\n\nreturn msg;"
    },
    {
      "id": "mqtt-publisher",
      "type": "mqtt out",
      "name": "MQTT Publisher",
      "topic": "",
      "qos": "1",
      "retain": false
    }
  ]
}
```

#### Advanced Multi-Device Simulator
```json
{
  "id": "advanced-simulator",
  "type": "tab",
  "label": "Advanced Multi-Device Simulator",
  "nodes": [
    {
      "id": "device-config",
      "type": "inject",
      "name": "Device Config",
      "props": {
        "payload": "{\n  \"devices\": [\n    {\"id\": \"solar_001\", \"type\": \"solar\"},\n    {\"id\": \"solar_002\", \"type\": \"solar\"},\n    {\"id\": \"wind_001\", \"type\": \"wind\"},\n    {\"id\": \"battery_001\", \"type\": \"battery\"}\n  ]\n}",
        "topic": "config"
      }
    },
    {
      "id": "device-generator",
      "type": "function",
      "name": "Generate Device Data",
      "func": "const config = msg.payload;\nconst devices = config.devices;\nconst outputs = [];\n\nfor (let device of devices) {\n  const now = new Date();\n  const hour = now.getHours();\n  const timeOfDay = hour + now.getMinutes() / 60.0;\n  \n  let data = {};\n  \n  if (device.type === 'solar') {\n    // Solar panel simulation\n    let intensity = 0;\n    if (6 <= timeOfDay && timeOfDay <= 18) {\n      if (10 <= timeOfDay && timeOfDay <= 14) {\n        intensity = 0.9 + 0.1 * Math.random();\n      } else {\n        intensity = timeOfDay < 10 ? (timeOfDay - 6) / 4.0 : (18 - timeOfDay) / 4.0;\n      }\n    }\n    intensity *= (0.7 + 0.3 * Math.random());\n    \n    const voltage = 20 + (intensity * 5) + (Math.random() - 0.5);\n    const current = intensity * 2.5 + (Math.random() - 0.1);\n    \n    data = {\n      voltage: Math.round(voltage * 100) / 100,\n      current: Math.round(current * 100) / 100,\n      power: Math.round(voltage * current * 100) / 100,\n      temperature: Math.round((25 + intensity * 20 + Math.random() - 2) * 10) / 10\n    };\n  } else if (device.type === 'wind') {\n    // Wind turbine simulation\n    const baseWindSpeed = 5 + 3 * Math.sin(2 * Math.PI * timeOfDay / 24);\n    const windSpeed = Math.max(0, baseWindSpeed + (Math.random() - 0.5) * 4);\n    const powerFactor = windSpeed < 3 ? 0 : windSpeed < 12 ? (windSpeed - 3) / 9 : 1.0;\n    \n    const voltage = 24 + (powerFactor * 6) + (Math.random() - 0.5);\n    const current = powerFactor * 3 + (Math.random() - 0.1);\n    \n    data = {\n      voltage: Math.round(voltage * 100) / 100,\n      current: Math.round(current * 100) / 100,\n      power: Math.round(voltage * current * 100) / 100,\n      wind_speed: Math.round(windSpeed * 10) / 10\n    };\n  } else if (device.type === 'battery') {\n    // Battery simulation\n    let soc = 0;\n    if (6 <= timeOfDay && timeOfDay <= 18) {\n      soc = 30 + (timeOfDay - 6) * 5.8 + (Math.random() - 0.5) * 4;\n    } else {\n      soc = 100 - (timeOfDay > 18 ? (timeOfDay - 18) : (timeOfDay + 6)) * 4.2 + (Math.random() - 0.5) * 4;\n    }\n    soc = Math.max(0, Math.min(100, soc));\n    \n    const voltage = 20 + (soc / 100) * 4 + (Math.random() - 0.2);\n    const current = (6 <= timeOfDay && timeOfDay <= 18) ? 2 + (Math.random() - 0.5) : -1.5 + (Math.random() - 0.3);\n    \n    data = {\n      voltage: Math.round(voltage * 100) / 100,\n      current: Math.round(current * 100) / 100,\n      power: Math.round(voltage * current * 100) / 100,\n      state_of_charge: Math.round(soc * 10) / 10\n    };\n  }\n  \n  const message = {\n    device_id: device.id,\n    timestamp: now.toISOString(),\n    location: 'simulation_lab',\n    data: data,\n    metadata: {\n      firmware_version: '1.2.0',\n      simulation: true\n    }\n  };\n  \n  outputs.push({\n    topic: `energy-monitor/devices/${device.id}/${device.type}`,\n    payload: message\n  });\n}\n\nreturn outputs;"
    },
    {
      "id": "mqtt-publisher-multi",
      "type": "mqtt out",
      "name": "MQTT Publisher",
      "topic": "",
      "qos": "1",
      "retain": false
    }
  ]
}
```

### 3. ThingsBoard Device Emulation

#### Device Profile Configuration
```json
{
  "name": "Energy Device Profile",
  "type": "DEFAULT",
  "description": "Profile for energy monitoring devices",
  "transportType": "MQTT",
  "provisionType": "DISABLED",
  "defaultRuleChainId": {
    "entityType": "RULE_CHAIN",
    "id": "main"
  },
  "defaultQueueName": "Main",
  "profileData": {
    "configuration": {
      "type": "DEFAULT"
    },
    "transportConfiguration": {
      "type": "MQTT",
      "deviceAttributesTopic": "v1/devices/me/attributes",
      "deviceTelemetryTopic": "v1/devices/me/telemetry",
      "deviceRpcRequestTopic": "v1/devices/me/rpc/request/+",
      "deviceRpcResponseTopic": "v1/devices/me/rpc/response/+",
      "deviceAttributesSubscribeTopic": "v1/devices/me/attributes/+",
      "checkAttributeUpdates": false
    }
  }
}
```

#### Device Template
```json
{
  "name": "Solar Panel Template",
  "type": "DEFAULT",
  "description": "Template for solar panel devices",
  "deviceProfileId": {
    "entityType": "DEVICE_PROFILE",
    "id": "energy-device-profile-id"
  },
  "additionalInfo": {
    "description": "Solar panel monitoring template"
  }
}
```

## Test Scenarios

### 1. Normal Operation Simulation
```python
# Simulate normal daily operation
def simulate_normal_day():
    simulator = MultiDeviceSimulator()
    simulator.add_device("solar_panel_001", "solar")
    simulator.add_device("wind_turbine_001", "wind")
    simulator.add_device("battery_bank_001", "battery")
    
    print("Starting normal day simulation...")
    simulator.start_all_devices(interval=30)  # 30-second intervals
```

### 2. Fault Condition Simulation
```python
# Simulate device faults
def simulate_fault_conditions():
    class FaultSimulator(EnergyDeviceSimulator):
        def generate_solar_data(self, timestamp):
            data = super().generate_solar_data(timestamp)
            
            # Simulate fault conditions
            if random.random() < 0.1:  # 10% chance of fault
                data["voltage"] = 0  # No voltage
                data["current"] = 0  # No current
                data["fault_code"] = "E001"
                data["fault_description"] = "Panel disconnected"
            
            return data
    
    fault_sim = FaultSimulator("faulty_solar_001", "solar")
    fault_sim.connect()
    fault_sim.run_simulation(interval=10)
```

### 3. Performance Testing
```python
# Test system performance with many devices
def performance_test():
    simulator = MultiDeviceSimulator()
    
    # Create 50 simulated devices
    for i in range(50):
        device_type = ["solar", "wind", "battery"][i % 3]
        device_id = f"{device_type}_{i:03d}"
        simulator.add_device(device_id, device_type)
    
    print(f"Starting performance test with {len(simulator.devices)} devices")
    simulator.start_all_devices(interval=5)
```

## Data Validation

### Message Format Validation
```python
def validate_message_format(message):
    """Validate MQTT message format"""
    required_fields = ["device_id", "timestamp", "data"]
    
    for field in required_fields:
        if field not in message:
            return False, f"Missing required field: {field}"
    
    # Validate timestamp format
    try:
        datetime.fromisoformat(message["timestamp"].replace("Z", "+00:00"))
    except ValueError:
        return False, "Invalid timestamp format"
    
    # Validate data structure
    if not isinstance(message["data"], dict):
        return False, "Data field must be an object"
    
    return True, "Valid message format"

# Usage in simulator
def publish_validated_data(self):
    message = self.generate_message()
    is_valid, error = validate_message_format(message)
    
    if is_valid:
        self.client.publish(self.topic, json.dumps(message))
        print(f"Published valid data: {message['data']}")
    else:
        print(f"Invalid message: {error}")
```

### Data Range Validation
```python
def validate_data_ranges(data, device_type):
    """Validate sensor data ranges"""
    if device_type == "solar":
        if not (0 <= data.get("voltage", 0) <= 30):
            return False, "Voltage out of range (0-30V)"
        if not (0 <= data.get("current", 0) <= 5):
            return False, "Current out of range (0-5A)"
        if not (0 <= data.get("temperature", 0) <= 80):
            return False, "Temperature out of range (0-80°C)"
    
    elif device_type == "wind":
        if not (0 <= data.get("wind_speed", 0) <= 25):
            return False, "Wind speed out of range (0-25 m/s)"
    
    elif device_type == "battery":
        if not (0 <= data.get("state_of_charge", 0) <= 100):
            return False, "State of charge out of range (0-100%)"
    
    return True, "Data ranges valid"
```

## Integration Testing

### End-to-End Test
```python
def test_complete_pipeline():
    """Test complete data pipeline from simulator to visualization"""
    
    # 1. Start simulator
    simulator = EnergyDeviceSimulator("test_solar_001", "solar")
    simulator.connect()
    
    # 2. Start data collection
    collector = MQTTDataCollector()
    collector.start()
    
    # 3. Run simulation for 1 minute
    start_time = time.time()
    while time.time() - start_time < 60:
        simulator.publish_data()
        time.sleep(5)
    
    # 4. Verify data in InfluxDB
    influx_client = InfluxDBClient(url="http://localhost:8086", token="your-token")
    query_api = influx_client.query_api()
    
    query = 'from(bucket:"energy-data") |> range(start: -1m) |> filter(fn: (r) => r.device_id == "test_solar_001")'
    result = query_api.query(query)
    
    # 5. Verify data in ThingsBoard
    # (Implementation depends on ThingsBoard API)
    
    print(f"Pipeline test completed. Collected {len(result)} data points")
```

## Switching to Real Hardware

### Hardware Integration Checklist
- [ ] **Update MQTT Configuration**: Change broker address to hardware network
- [ ] **Modify Device IDs**: Use actual device identifiers
- [ ] **Adjust Data Formats**: Match real sensor output formats
- [ ] **Update Timestamps**: Use real device timestamps
- [ ] **Remove Simulation Flags**: Set simulation metadata to false
- [ ] **Test Connectivity**: Verify hardware can reach MQTT broker
- [ ] **Validate Data**: Compare simulated vs real data ranges

### Gradual Migration
```python
class HybridSimulator:
    def __init__(self, real_devices, simulated_devices):
        self.real_devices = real_devices
        self.simulated_devices = simulated_devices
    
    def publish_data(self):
        # Publish real device data
        for device in self.real_devices:
            real_data = device.read_sensors()
            self.publish_to_mqtt(real_data)
        
        # Publish simulated data
        for device in self.simulated_devices:
            simulated_data = device.generate_data()
            self.publish_to_mqtt(simulated_data)
```

## Best Practices

### Simulation Best Practices
1. **Realistic Data**: Use realistic ranges and patterns
2. **Error Simulation**: Include fault conditions and errors
3. **Performance Testing**: Test with multiple devices
4. **Data Validation**: Validate message formats and ranges
5. **Documentation**: Document simulation parameters and assumptions

### Testing Best Practices
1. **Automated Testing**: Create automated test scripts
2. **Regression Testing**: Test after system changes
3. **Load Testing**: Test system performance under load
4. **Integration Testing**: Test complete data pipeline
5. **Monitoring**: Monitor system during simulation

## Troubleshooting

### Common Simulation Issues
- **MQTT Connection Fails**: Check broker address and credentials
- **Data Not Appearing**: Verify topic structure and message format
- **Performance Issues**: Reduce simulation frequency or device count
- **Memory Issues**: Implement proper cleanup and resource management

### Debug Tools
- **MQTT Explorer**: Visual MQTT client for debugging
- **InfluxDB CLI**: Command-line interface for database queries
- **Node-RED Debug Nodes**: Built-in debugging capabilities
- **Python Logging**: Comprehensive logging for simulators

## Next Steps

1. **Start with** [Project Setup](../project-setup/index.md) to prepare your environment
2. **Review** [Phase 1: Hardware Integration](../phases/01-hardware/index.md) for hardware concepts
3. **Proceed to** [Phase 2: Cloud Infrastructure](../phases/02-cloud/index.md) for backend setup
4. **Check** [Troubleshooting](../troubleshooting/index.md) for common issues 