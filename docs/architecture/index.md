**Professional IoT monitoring system with separate ports and dual environment support**

## 📋 Overview

This project implements a comprehensive renewable energy IoT monitoring system with **dual environment support** and **separate ports** for each service. The system provides direct access to each service without nginx dependency, offering a simpler and more straightforward architecture.

### 🎯 Key Features
- **Dual Environment**: Local development + Production deployment
- **Separate Ports**: Direct access to each service on dedicated ports
- **No Nginx Dependency**: Simpler architecture without reverse proxy
- **Professional URLs**: Clean, direct service URLs
- **SSL Ready**: Easy HTTPS implementation per service
- **Scalable Architecture**: Easy to add new services
- **Complete IoT Pipeline**: MQTT → Node-RED → InfluxDB → Grafana
- **Device Simulation**: Realistic renewable energy device data simulation
- **Comprehensive Dashboards**: 7 specialized Grafana dashboards
- **Data Retention**: 30-day automatic data retention with cleanup

### 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MIKRUS VPS (Production)                  │
├─────────────────────────────────────────────────────────────┤
│  Port 10108: SSH Access                                     │
│  Port 40098: MQTT Broker (IoT Devices)                      │
│  Port 40099: Grafana Dashboard                              │
│  Port 40100: Node-RED Editor                                │
│  Port 40101: InfluxDB Admin                                 │
│  Port 40102: Reserved for future use                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DIRECT SERVICE ACCESS                     │
├─────────────────────────────────────────────────────────────┐
│  Grafana:     http://robert108.mikrus.xyz:40099            │
│  Node-RED:    http://robert108.mikrus.xyz:40100            │
│  InfluxDB:    http://robert108.mikrus.xyz:40101            │
│  MQTT:        robert108.mikrus.xyz:40098                   │
└─────────────────────────────────────────────────────────────┘
```

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