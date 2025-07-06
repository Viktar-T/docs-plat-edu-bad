# Phase 3: Web Platform Development

## Overview
Complete web platform setup including Grafana dashboards, ThingsBoard device management, and custom web application development for the renewable energy monitoring system.

## Custom Web Application

### React-based Energy Monitor App
A modern React application has been developed to provide an intuitive interface for the energy monitoring platform. The application is built with React 18, TypeScript, Vite, and Tailwind CSS.

**GitHub Repository**: [plat-edu-bad-front](https://github.com/Viktar-T/plat-edu-bad-front)

#### Key Features
- **Interactive Department Map**: Visual representation of laboratory equipment with real-time data dashboards
- **Real-time Data Visualization**: Live monitoring using Recharts for data visualization
- **Responsive Design**: Modern UI that works across all devices
- **Educational Interface**: User-friendly navigation for students and researchers

#### Application Structure
```
src/
  components/   # Reusable UI components
  pages/        # Page components for routing
  utils/        # Utility functions
  styles/       # Tailwind and custom styles
```

#### Main Pages
1. **Main Page**: Project description with navigation to department map and dashboards
2. **Department Map**: Interactive map showing laboratory equipment with real-time data
3. **Element Details**: Individual pages for each piece of equipment with detailed analytics

## Grafana Installation & Configuration

### Docker Installation
```bash
# Pull Grafana image
docker pull grafana/grafana:latest

# Run Grafana container
docker run -d \
  --name grafana \
  -p 3000:3000 \
  -v grafana-data:/var/lib/grafana \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  grafana/grafana:latest

# Access Grafana at http://localhost:3000
# Default credentials: admin/admin
```

### Manual Installation
```bash
# Ubuntu/Debian
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

### Initial Configuration
1. **Access Grafana**: Open http://localhost:3000
2. **Login**: admin/admin (first time)
3. **Change Password**: Set new admin password
4. **Add Data Source**: Configure InfluxDB connection

### InfluxDB Data Source Configuration
```json
{
  "name": "InfluxDB",
  "type": "influxdb",
  "url": "http://localhost:8086",
  "access": "server",
  "isDefault": true,
  "jsonData": {
    "version": "Flux",
    "organization": "energy-monitor",
    "defaultBucket": "energy-data"
  },
  "secureJsonData": {
    "token": "your-influxdb-token"
  }
}
```

## Creating Grafana Dashboards

### Basic Energy Dashboard
```json
{
  "dashboard": {
    "id": null,
    "title": "Energy Monitoring Dashboard",
    "tags": ["energy", "monitoring"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Solar Panel Voltage",
        "type": "timeseries",
        "targets": [
          {
            "query": "from(bucket: \"energy-data\")\n  |> range(start: -1h)\n  |> filter(fn: (r) => r._measurement == \"energy_data\")\n  |> filter(fn: (r) => r.device_id == \"solar_panel_001\")\n  |> filter(fn: (r) => r._field == \"voltage\")\n  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "custom": {
              "axisLabel": "",
              "axisPlacement": "auto",
              "barAlignment": 0,
              "drawStyle": "line",
              "fillOpacity": 10,
              "gradientMode": "none",
              "hideFrom": {
                "legend": false,
                "tooltip": false,
                "vis": false
              },
              "lineInterpolation": "linear",
              "lineWidth": 1,
              "pointSize": 5,
              "scaleDistribution": {
                "type": "linear"
              },
              "showPoints": "never",
              "spanNulls": false,
              "stacking": {
                "group": "A",
                "mode": "none"
              },
              "thresholds": {
                "mode": "absolute",
                "steps": [
                  {
                    "color": "green",
                    "value": null
                  },
                  {
                    "color": "red",
                    "value": 80
                  }
                ]
              }
            },
            "mappings": [],
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "red",
                  "value": 80
                }
              ]
            },
            "unit": "volt"
          },
          "overrides": []
        },
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 0
        }
      },
      {
        "id": 2,
        "title": "Solar Panel Current",
        "type": "timeseries",
        "targets": [
          {
            "query": "from(bucket: \"energy-data\")\n  |> range(start: -1h)\n  |> filter(fn: (r) => r._measurement == \"energy_data\")\n  |> filter(fn: (r) => r.device_id == \"solar_panel_001\")\n  |> filter(fn: (r) => r._field == \"current\")\n  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "amp"
          }
        },
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 0
        }
      },
      {
        "id": 3,
        "title": "Power Generation",
        "type": "stat",
        "targets": [
          {
            "query": "from(bucket: \"energy-data\")\n  |> range(start: -5m)\n  |> filter(fn: (r) => r._measurement == \"energy_data\")\n  |> filter(fn: (r) => r.device_id == \"solar_panel_001\")\n  |> filter(fn: (r) => r._field == \"power\")\n  |> last()",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "watt",
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {
                  "color": "red",
                  "value": null
                },
                {
                  "color": "yellow",
                  "value": 50
                },
                {
                  "color": "green",
                  "value": 100
                }
              ]
            }
          }
        },
        "gridPos": {
          "h": 4,
          "w": 6,
          "x": 0,
          "y": 8
        }
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "timepicker": {},
    "templating": {
      "list": []
    },
    "annotations": {
      "list": []
    },
    "refresh": "5s",
    "schemaVersion": 27,
    "version": 0,
    "links": []
  }
}
```

### Advanced Multi-Device Dashboard
```json
{
  "dashboard": {
    "title": "Multi-Device Energy Monitoring",
    "panels": [
      {
        "id": 1,
        "title": "All Devices Voltage",
        "type": "timeseries",
        "targets": [
          {
            "query": "from(bucket: \"energy-data\")\n  |> range(start: -1h)\n  |> filter(fn: (r) => r._measurement == \"energy_data\")\n  |> filter(fn: (r) => r._field == \"voltage\")\n  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)",
            "refId": "A"
          }
        ],
        "legend": {
          "showLegend": true,
          "displayMode": "table",
          "placement": "bottom"
        }
      },
      {
        "id": 2,
        "title": "Device Status",
        "type": "table",
        "targets": [
          {
            "query": "from(bucket: \"energy-data\")\n  |> range(start: -5m)\n  |> filter(fn: (r) => r._measurement == \"energy_data\")\n  |> filter(fn: (r) => r._field == \"voltage\")\n  |> last()\n  |> group(columns: [\"device_id\"])",
            "refId": "A"
          }
        ],
        "transformations": [
          {
            "id": "organize",
            "options": {
              "excludeByName": {
                "Time": true,
                "_start": true,
                "_stop": true,
                "_time": true,
                "_value": true,
                "_field": true,
                "_measurement": true
              },
              "indexByName": {},
              "renameByName": {
                "device_id": "Device ID",
                "sensor_type": "Sensor Type"
              }
            }
          }
        ]
      }
    ]
  }
}
```

### Dashboard Variables
```json
{
  "templating": {
    "list": [
      {
        "name": "device",
        "type": "query",
        "query": "from(bucket: \"energy-data\")\n  |> range(start: -1d)\n  |> filter(fn: (r) => r._measurement == \"energy_data\")\n  |> group(columns: [\"device_id\"])\n  |> distinct(column: \"device_id\")\n  |> yield(name: \"devices\"",
        "refresh": 2,
        "includeAll": true,
        "multi": true
      },
      {
        "name": "sensor_type",
        "type": "query",
        "query": "from(bucket: \"energy-data\")\n  |> range(start: -1d)\n  |> filter(fn: (r) => r._measurement == \"energy_data\")\n  |> group(columns: [\"sensor_type\"])\n  |> distinct(column: \"sensor_type\")\n  |> yield(name: \"sensor_types\"",
        "refresh": 2,
        "includeAll": true,
        "multi": true
      }
    ]
  }
}
```

## ThingsBoard Dashboard Configuration

### Device Dashboard Template
```json
{
  "configuration": {
    "widgets": {
      "solar_panel_widget": {
        "type": "timeseries",
        "title": "Solar Panel Data",
        "datasources": [
          {
            "type": "entity",
            "entityAlias": "solar_panel_001",
            "dataKeys": [
              {
                "name": "voltage",
                "type": "timeseries",
                "label": "Voltage (V)"
              },
              {
                "name": "current",
                "type": "timeseries",
                "label": "Current (A)"
              },
              {
                "name": "power",
                "type": "timeseries",
                "label": "Power (W)"
              }
            ]
          }
        ],
        "settings": {
          "showLegend": true,
          "enableAnimation": true,
          "animationDuration": 1000
        }
      },
      "status_widget": {
        "type": "cards",
        "title": "Device Status",
        "datasources": [
          {
            "type": "entity",
            "entityAlias": "solar_panel_001",
            "dataKeys": [
              {
                "name": "temperature",
                "type": "timeseries",
                "label": "Temperature"
              },
              {
                "name": "efficiency",
                "type": "timeseries",
                "label": "Efficiency"
              }
            ]
          }
        ]
      }
    }
  }
}
```

### Rule Chain for Data Processing
```json
{
  "ruleChain": {
    "name": "Energy Data Processing",
    "firstRuleNodeId": {
      "entityType": "RULE_NODE",
      "id": "message_type_switch"
    },
    "nodes": [
      {
        "id": {
          "entityType": "RULE_NODE",
          "id": "message_type_switch"
        },
        "type": "org.thingsboard.rule.engine.flow.TbRuleChainInputNode",
        "name": "Message Type Switch",
        "configuration": {
          "script": "var msgType = msg.type;\nvar deviceType = msg.deviceType;\n\nif (msgType === 'POST_TELEMETRY_REQUEST') {\n    if (deviceType === 'solar') {\n        return {msg: msg, metadata: metadata, msgType: 'SOLAR_DATA'};\n    } else if (deviceType === 'wind') {\n        return {msg: msg, metadata: metadata, msgType: 'WIND_DATA'};\n    } else if (deviceType === 'battery') {\n        return {msg: msg, metadata: metadata, msgType: 'BATTERY_DATA'};\n    }\n}\nreturn {msg: msg, metadata: metadata, msgType: 'UNKNOWN'};"
        }
      },
      {
        "id": {
          "entityType": "RULE_NODE",
          "id": "solar_processor"
        },
        "type": "org.thingsboard.rule.engine.filter.TbJsFilterNode",
        "name": "Solar Data Processor",
        "configuration": {
          "jsScript": "var data = msg.data;\nvar voltage = data.voltage;\nvar current = data.current;\nvar power = voltage * current;\nvar efficiency = (power / 100) * 100; // Simplified calculation\n\nmsg.data.power = power;\nmsg.data.efficiency = efficiency;\n\n// Check for alerts\nif (efficiency < 50) {\n    return {msg: msg, metadata: metadata, msgType: 'LOW_EFFICIENCY_ALERT'};\n}\n\nreturn {msg: msg, metadata: metadata, msgType: 'PROCESSED_SOLAR_DATA'};"
        }
      }
    ]
  }
}
```

## User Access & Permission Management

### Grafana User Management
```bash
# Create admin user via API
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "name": "energy_admin",
    "email": "admin@energy-monitor.com",
    "login": "energy_admin",
    "password": "secure_password"
  }'

# Create regular user
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "name": "energy_user",
    "email": "user@energy-monitor.com",
    "login": "energy_user",
    "password": "user_password"
  }'
```

### Grafana Role Configuration
```json
{
  "role": {
    "name": "Energy Monitor User",
    "description": "User with read access to energy monitoring dashboards",
    "permissions": [
      {
        "action": "dashboards:read",
        "scope": "dashboards:uid:*"
      },
      {
        "action": "datasources:query",
        "scope": "datasources:*"
      },
      {
        "action": "dashboards:write",
        "scope": "dashboards:uid:energy-monitor"
      }
    ]
  }
}
```

### ThingsBoard User Management
```bash
# Create tenant admin
curl -X POST http://localhost:9090/api/tenant \
  -H "Content-Type: application/json" \
  -H "X-Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Energy Monitor Tenant",
    "region": "Global"
  }'

# Create customer
curl -X POST http://localhost:9090/api/customer \
  -H "Content-Type: application/json" \
  -H "X-Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Energy Monitor Customer",
    "tenantId": {
      "entityType": "TENANT",
      "id": "TENANT_ID"
    }
  }'
```

## Real-Time Updates

### WebSocket Integration
```javascript
// WebSocket client for real-time updates
class EnergyWebSocket {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(data) {
    // Emit custom event for data updates
    const event = new CustomEvent('energyDataUpdate', { detail: data });
    window.dispatchEvent(event);
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage in React component
useEffect(() => {
  const ws = new EnergyWebSocket('ws://localhost:3001/ws');
  ws.connect();

  const handleDataUpdate = (event) => {
    setEnergyData(prevData => [...prevData, event.detail]);
  };

  window.addEventListener('energyDataUpdate', handleDataUpdate);

  return () => {
    ws.disconnect();
    window.removeEventListener('energyDataUpdate', handleDataUpdate);
  };
}, []);
```

## Mobile Responsive Design

### Responsive CSS
```css
/* Mobile-first responsive design */
@media (max-width: 768px) {
  .charts-container {
    flex-direction: column;
  }
  
  .chart {
    width: 100%;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .device-selector select {
    width: 100%;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .App {
    padding: 10px;
  }
  
  .App-header {
    padding: 15px;
  }
  
  .chart {
    padding: 15px;
  }
}
```

## Security Implementation

### Authentication Middleware
```javascript
// auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
```

### API Rate Limiting
```javascript
// rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

module.exports = apiLimiter;
```

## Next Steps

1. **Proceed to** [Phase 4: Visualization](../04-visualization/index.md) for advanced analytics
2. **Review** [Development Tools](../../development/index.md) for debugging techniques
3. **Check** [Troubleshooting](../../troubleshooting/index.md) for common issues
4. **Use** [References](../../references/index.md) for additional resources

