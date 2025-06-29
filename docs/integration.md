# Cross-Phase Integration

## Overview

This document outlines the integration points, data flows, and interfaces between the four phases of the educational data science platform. Proper integration is crucial for creating a cohesive system that demonstrates real-world data science implementation challenges.

## Integration Architecture

### System-Wide Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Phase 1       │    │   Phase 2       │    │   Phase 3       │    │   Phase 4       │
│   Hardware      │───▶│   Cloud         │───▶│   Web App       │───▶│   Visualization │
│   & Sensors     │    │   Infrastructure│    │   Frontend      │    │   & Analytics   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
   Device Data              Processed Data         User Interactions      Analytical Insights
   Raw Sensors              APIs & Storage        Authentication         Dashboards & Reports
   IoT Communications       Event Streaming       Real-time Updates      Machine Learning
```

## Phase-to-Phase Interfaces

### Phase 1 → Phase 2: Hardware to Cloud

#### Data Ingestion Interface

**Protocol**: HTTPS POST with JSON payload
**Endpoint**: `https://api.platform.com/v1/data/ingest`

**Data Format**:
```json
{
  "device_id": "sensor_001",
  "timestamp": "2025-06-29T10:30:00Z",
  "location": {
    "latitude": 53.4285,
    "longitude": 14.5528
  },
  "sensor_data": {
    "temperature": {
      "value": 23.5,
      "unit": "celsius",
      "quality": "good"
    },
    "humidity": {
      "value": 65.2,
      "unit": "percent",
      "quality": "good"
    },
    "pressure": {
      "value": 1013.25,
      "unit": "hpa",
      "quality": "good"
    }
  },
  "device_status": {
    "battery_level": 85,
    "signal_strength": -45,
    "firmware_version": "1.2.3"
  }
}
```

**Authentication**: API Key in header
```http
Authorization: Bearer <api_key>
Content-Type: application/json
```

#### Device Management Interface

**Configuration Endpoint**: `https://api.platform.com/v1/devices/{device_id}/config`

**Configuration Response**:
```json
{
  "sampling_interval": 60,
  "transmission_interval": 300,
  "sensor_calibration": {
    "temperature_offset": 0.2,
    "humidity_offset": -1.5,
    "pressure_offset": 0.1
  },
  "power_management": {
    "sleep_mode": "enabled",
    "wake_interval": 300
  }
}
```

#### Firmware Update Interface

**OTA Update Endpoint**: `https://api.platform.com/v1/devices/{device_id}/firmware`

**Update Process**:
1. Device polls for updates every 24 hours
2. Cloud responds with firmware metadata
3. Device downloads and verifies firmware
4. Device applies update and reports status

### Phase 2 → Phase 3: Cloud to Web Application

#### REST API Interface

**Base URL**: `https://api.platform.com/v1`

**Authentication Endpoints**:
```
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/user
```

**Data Access Endpoints**:
```
GET  /devices
GET  /devices/{device_id}
GET  /devices/{device_id}/data
GET  /devices/{device_id}/data/latest
GET  /devices/{device_id}/status
```

**Query Parameters for Data Access**:
```
?start_time=2025-06-29T00:00:00Z
&end_time=2025-06-29T23:59:59Z
&limit=1000
&offset=0
&sensor_types=temperature,humidity
&aggregation=hourly
```

#### WebSocket Interface for Real-time Data

**Connection**: `wss://api.platform.com/v1/stream`

**Subscription Message**:
```json
{
  "action": "subscribe",
  "channels": [
    "device.sensor_001.data",
    "device.sensor_001.status",
    "alerts.critical"
  ]
}
```

**Real-time Data Message**:
```json
{
  "channel": "device.sensor_001.data",
  "timestamp": "2025-06-29T10:30:00Z",
  "data": {
    "temperature": 23.5,
    "humidity": 65.2,
    "pressure": 1013.25
  }
}
```

#### GraphQL Interface for Flexible Queries

**Endpoint**: `https://api.platform.com/v1/graphql`

**Example Query**:
```graphql
query GetDeviceData($deviceId: ID!, $timeRange: TimeRange!) {
  device(id: $deviceId) {
    id
    name
    location {
      latitude
      longitude
    }
    sensorData(timeRange: $timeRange) {
      timestamp
      temperature {
        value
        unit
        quality
      }
      humidity {
        value
        unit
        quality
      }
    }
  }
}
```

### Phase 3 → Phase 4: Web Application to Visualization

#### Analytics API Interface

**Base URL**: `https://analytics.platform.com/v1`

**Aggregated Data Endpoints**:
```
GET  /analytics/summary
GET  /analytics/trends
GET  /analytics/correlations
GET  /analytics/anomalies
GET  /analytics/forecasts
```

**Dashboard Configuration API**:
```json
{
  "dashboard_id": "environmental_overview",
  "widgets": [
    {
      "type": "time_series",
      "data_source": "temperature_trends",
      "config": {
        "time_range": "24h",
        "aggregation": "hourly",
        "devices": ["sensor_001", "sensor_002"]
      }
    },
    {
      "type": "heatmap",
      "data_source": "spatial_distribution",
      "config": {
        "metric": "temperature",
        "time_range": "1h"
      }
    }
  ]
}
```

#### Machine Learning Model Interface

**Model Inference Endpoint**: `https://ml.platform.com/v1/predict`

**Prediction Request**:
```json
{
  "model": "temperature_forecasting",
  "input_data": {
    "historical_values": [23.1, 23.3, 23.2, 23.4],
    "time_features": {
      "hour_of_day": 14,
      "day_of_week": 3,
      "season": "summer"
    },
    "external_factors": {
      "weather_forecast": "sunny",
      "humidity_trend": "stable"
    }
  },
  "prediction_horizon": 24
}
```

## Data Consistency and Synchronization

### Event-Driven Architecture

**Event Bus**: Apache Kafka/AWS EventBridge

**Event Types**:
```
device.connected
device.disconnected
data.received
data.processed
alert.triggered
user.action
system.error
```

**Event Schema**:
```json
{
  "event_id": "evt_12345",
  "event_type": "data.received",
  "timestamp": "2025-06-29T10:30:00Z",
  "source": "device.sensor_001",
  "data": {
    "device_id": "sensor_001",
    "sensor_reading": {...}
  },
  "metadata": {
    "correlation_id": "req_67890",
    "trace_id": "trace_abcdef"
  }
}
```

### Data Validation Pipeline

**Stage 1: Hardware Validation**
```cpp
// ESP32 validation before transmission
bool validateSensorData(SensorReading& reading) {
  return validateRange(reading.value) && 
         validateTimestamp(reading.timestamp) &&
         validateQuality(reading.quality);
}
```

**Stage 2: Cloud Ingestion Validation**
```python
# Cloud API validation
def validate_incoming_data(payload):
    schema = {
        "device_id": {"type": "string", "required": True},
        "timestamp": {"type": "datetime", "required": True},
        "sensor_data": {"type": "dict", "required": True}
    }
    return validate(payload, schema)
```

**Stage 3: Database Constraint Validation**
```sql
-- Database level constraints
ALTER TABLE sensor_readings 
ADD CONSTRAINT temperature_range 
CHECK (temperature BETWEEN -50 AND 100);

ALTER TABLE sensor_readings 
ADD CONSTRAINT future_timestamp 
CHECK (timestamp <= NOW() + INTERVAL '1 hour');
```

## Error Handling and Recovery

### Cascading Failure Prevention

**Circuit Breaker Pattern**:
```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "HALF_OPEN"
            else:
                raise CircuitBreakerOpenException()
        
        try:
            result = func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e
```

**Graceful Degradation**:
```javascript
// Frontend fallback for API failures
async function getDeviceData(deviceId) {
  try {
    return await api.getDeviceData(deviceId);
  } catch (error) {
    console.warn('API failed, using cached data:', error);
    return await cache.getDeviceData(deviceId);
  }
}
```

### Data Recovery Mechanisms

**Automatic Retry with Exponential Backoff**:
```python
import time
import random

def retry_with_backoff(func, max_retries=3, base_delay=1):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            
            # Exponential backoff with jitter
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            time.sleep(delay)
```

**Dead Letter Queue Processing**:
```python
# Handle failed message processing
def process_dead_letter_queue():
    while True:
        message = dlq.receive_message()
        if message:
            try:
                # Attempt to reprocess
                process_sensor_data(message.body)
                dlq.delete_message(message)
            except Exception as e:
                # Log error and possibly move to manual review queue
                log_processing_error(message, e)
```

## Performance Optimization

### Caching Strategy

**Multi-Level Caching**:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   CDN           │    │   Application   │
│   Cache         │    │   Cache         │    │   Cache         │
│   (5 minutes)   │    │   (1 hour)      │    │   (15 minutes)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Time-Series   │    │   Analytics     │
│   Query Cache   │    │   Database      │    │   Results Cache │
│   (1 hour)      │    │   (Permanent)   │    │   (6 hours)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Cache Invalidation Strategy**:
```python
# Event-driven cache invalidation
def on_new_sensor_data(event):
    device_id = event.data['device_id']
    
    # Invalidate device-specific caches
    cache.delete(f"device:{device_id}:latest")
    cache.delete(f"device:{device_id}:summary")
    
    # Invalidate aggregated caches if significant change
    if is_significant_change(event.data):
        cache.delete("global:summary")
        cache.delete("trends:hourly")
```

### Data Partitioning Strategy

**Time-based Partitioning**:
```sql
-- Partition sensor data by month
CREATE TABLE sensor_readings_2025_06 PARTITION OF sensor_readings
FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

-- Automatic partition creation
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    table_name text;
BEGIN
    start_date := date_trunc('month', CURRENT_DATE + interval '1 month');
    end_date := start_date + interval '1 month';
    table_name := 'sensor_readings_' || to_char(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE %I PARTITION OF sensor_readings
                    FOR VALUES FROM (%L) TO (%L)',
                   table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

## Monitoring and Observability

### Cross-Phase Tracing

**Distributed Tracing Example**:
```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_sensor_data(data):
    with tracer.start_as_current_span("process_sensor_data") as span:
        span.set_attribute("device_id", data["device_id"])
        span.set_attribute("sensor_count", len(data["sensors"]))
        
        # Validate data
        with tracer.start_as_current_span("validate_data"):
            validation_result = validate_data(data)
            span.set_attribute("validation_passed", validation_result)
        
        # Store in database
        with tracer.start_as_current_span("store_data"):
            store_result = database.store(data)
            span.set_attribute("records_stored", store_result.count)
        
        # Trigger analytics
        with tracer.start_as_current_span("trigger_analytics"):
            analytics.process_new_data(data)
```

### Health Check Endpoints

**System Health Monitoring**:
```python
@app.route('/health')
def health_check():
    status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": app.config['VERSION'],
        "components": {}
    }
    
    # Check database connectivity
    try:
        db.execute("SELECT 1")
        status["components"]["database"] = "healthy"
    except Exception as e:
        status["components"]["database"] = "unhealthy"
        status["status"] = "degraded"
    
    # Check cache connectivity
    try:
        cache.ping()
        status["components"]["cache"] = "healthy"
    except Exception as e:
        status["components"]["cache"] = "unhealthy"
        status["status"] = "degraded"
    
    # Check message queue
    try:
        queue.health_check()
        status["components"]["message_queue"] = "healthy"
    except Exception as e:
        status["components"]["message_queue"] = "unhealthy"
        status["status"] = "degraded"
    
    return jsonify(status), 200 if status["status"] != "unhealthy" else 503
```

## Security Integration

### End-to-End Security

**Authentication Flow**:
```
Hardware → API Gateway → Auth Service → Application Service → Database
    │           │            │              │                    │
    ▼           ▼            ▼              ▼                    ▼
API Key    JWT Validation  User Session  Authorization Check  Encrypted Storage
```

**Security Headers**:
```python
# Security middleware for all phases
@app.middleware('http')
async def security_headers(request, call_next):
    response = await call_next(request)
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    
    return response
```

## Testing Integration Points

### End-to-End Testing

**Integration Test Example**:
```python
def test_complete_data_flow():
    # 1. Simulate hardware data transmission
    sensor_data = create_test_sensor_data()
    response = requests.post(
        f"{API_BASE}/v1/data/ingest",
        json=sensor_data,
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    assert response.status_code == 200
    
    # 2. Verify data storage
    time.sleep(2)  # Allow for processing
    stored_data = database.query(
        "SELECT * FROM sensor_readings WHERE device_id = %s",
        (sensor_data["device_id"],)
    )
    assert len(stored_data) > 0
    
    # 3. Check API accessibility
    api_response = requests.get(
        f"{API_BASE}/v1/devices/{sensor_data['device_id']}/data/latest"
    )
    assert api_response.status_code == 200
    
    # 4. Verify analytics processing
    analytics_response = requests.get(
        f"{ANALYTICS_BASE}/v1/analytics/summary"
    )
    assert analytics_response.status_code == 200
```

This comprehensive integration documentation ensures all phases work together seamlessly while maintaining the educational objectives of demonstrating both proper implementation techniques and common integration challenges.
