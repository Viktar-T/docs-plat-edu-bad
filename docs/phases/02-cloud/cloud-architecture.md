# Cloud Architecture

## Overview

This document outlines the comprehensive cloud architecture for Phase 2 of the educational data science platform. The architecture demonstrates modern cloud-native patterns, scalability principles, and common architectural pitfalls that data science projects encounter.

## Architectural Principles

### 1. Scalability First
- **Horizontal scaling** over vertical scaling
- **Stateless services** for easy replication
- **Auto-scaling** based on demand metrics
- **Load distribution** across multiple instances

### 2. Resilience and Fault Tolerance
- **Circuit breaker** patterns for service failures
- **Graceful degradation** when components fail
- **Multi-region deployment** for disaster recovery
- **Health checks** and automatic recovery

### 3. Security by Design
- **Zero-trust** security model
- **End-to-end encryption** for data in transit
- **Role-based access control** (RBAC)
- **Network segmentation** and VPC isolation

### 4. Cost Optimization
- **Resource right-sizing** based on actual usage
- **Reserved instances** for predictable workloads
- **Spot instances** for fault-tolerant batch jobs
- **Automated cost monitoring** and alerts

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet Gateway                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                     Load Balancer                               │
│                   (AWS ALB / Azure LB)                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    API Gateway                                  │
│              (Authentication & Routing)                         │
└─────────┬───────────────────────────────────────────┬───────────┘
          │                                           │
┌─────────▼─────────┐                       ┌─────────▼─────────┐
│   Microservices   │                       │   Static Assets   │
│     Cluster       │                       │      (CDN)        │
│   (Kubernetes)    │                       │                   │
└─────────┬─────────┘                       └───────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────┐
│                    Data Layer                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │  PostgreSQL  │ │   InfluxDB   │ │    Redis     │          │
│  │  (Metadata)  │ │ (Time Series)│ │   (Cache)    │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Service Architecture

### Microservices Design

#### 1. Data Ingestion Service
**Purpose**: Receive and validate incoming sensor data

**Technologies**:
- **Language**: Python with FastAPI
- **Database**: PostgreSQL for metadata, InfluxDB for time-series
- **Message Queue**: Apache Kafka for event streaming
- **Caching**: Redis for rate limiting and session storage

**Key Features**:
```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Dict, Any

app = FastAPI(title="Data Ingestion Service")

class SensorData(BaseModel):
    device_id: str
    timestamp: datetime
    sensor_readings: Dict[str, Any]
    quality_indicators: Dict[str, str]
    
    @validator('timestamp')
    def timestamp_not_future(cls, v):
        if v > datetime.utcnow():
            raise ValueError('Timestamp cannot be in the future')
        return v

@app.post("/v1/data/ingest")
async def ingest_sensor_data(
    data: SensorData,
    authenticated_device = Depends(verify_device_token)
):
    # Validate data quality
    validation_result = await validate_sensor_data(data)
    
    if not validation_result.is_valid:
        raise HTTPException(
            status_code=400, 
            detail=validation_result.errors
        )
    
    # Store in time-series database
    await store_time_series_data(data)
    
    # Publish event for downstream processing
    await publish_data_received_event(data)
    
    return {"status": "success", "data_id": generate_data_id()}
```

#### 2. Device Management Service
**Purpose**: Manage device registration, configuration, and health monitoring

**Key Features**:
- Device registration and authentication
- Configuration management and OTA updates
- Health monitoring and alerting
- Device metadata and location tracking

```python
from fastapi import FastAPI, HTTPException
from sqlalchemy.orm import Session
from models import Device, DeviceConfig

app = FastAPI(title="Device Management Service")

@app.post("/v1/devices/register")
async def register_device(device_info: DeviceRegistration):
    # Validate device information
    if await device_exists(device_info.device_id):
        raise HTTPException(400, "Device already registered")
    
    # Create device record
    device = Device(
        device_id=device_info.device_id,
        device_type=device_info.device_type,
        firmware_version=device_info.firmware_version,
        location=device_info.location
    )
    
    # Generate API key for device
    api_key = generate_device_api_key(device.device_id)
    device.api_key_hash = hash_api_key(api_key)
    
    await save_device(device)
    
    return {
        "device_id": device.device_id,
        "api_key": api_key,
        "status": "registered"
    }

@app.get("/v1/devices/{device_id}/config")
async def get_device_config(device_id: str):
    config = await get_device_configuration(device_id)
    return {
        "sampling_interval": config.sampling_interval,
        "transmission_interval": config.transmission_interval,
        "sensor_calibration": config.calibration_settings,
        "power_management": config.power_settings
    }
```

#### 3. Analytics Service
**Purpose**: Process data and provide analytical insights

**Key Features**:
- Real-time stream processing
- Statistical analysis and anomaly detection
- Machine learning model serving
- Aggregated metrics calculation

```python
from fastapi import FastAPI
from kafka import KafkaConsumer
import pandas as pd
from sklearn.ensemble import IsolationForest
import asyncio

app = FastAPI(title="Analytics Service")

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1)
        self.is_trained = False
    
    async def detect_anomalies(self, data: pd.DataFrame):
        if not self.is_trained:
            # Train on historical data
            historical_data = await fetch_historical_data()
            self.model.fit(historical_data)
            self.is_trained = True
        
        # Predict anomalies
        anomaly_scores = self.model.decision_function(data)
        anomalies = self.model.predict(data)
        
        return {
            "anomaly_scores": anomaly_scores.tolist(),
            "anomalies": anomalies.tolist()
        }

# Stream processing for real-time analytics
async def process_sensor_stream():
    consumer = KafkaConsumer(
        'sensor-data-topic',
        bootstrap_servers=['kafka:9092'],
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )
    
    detector = AnomalyDetector()
    
    for message in consumer:
        data = pd.DataFrame([message.value])
        
        # Detect anomalies
        anomaly_result = await detector.detect_anomalies(data)
        
        # If anomaly detected, send alert
        if any(anomaly_result["anomalies"]):
            await send_anomaly_alert(message.value, anomaly_result)

@app.get("/v1/analytics/summary")
async def get_analytics_summary(device_id: str = None, hours: int = 24):
    # Calculate aggregated metrics
    data = await fetch_recent_data(device_id, hours)
    
    summary = {
        "total_readings": len(data),
        "avg_temperature": data["temperature"].mean(),
        "avg_humidity": data["humidity"].mean(),
        "min_temperature": data["temperature"].min(),
        "max_temperature": data["temperature"].max(),
        "data_quality_score": calculate_quality_score(data)
    }
    
    return summary
```

### Container Orchestration with Kubernetes

#### Deployment Configuration

```yaml
# data-ingestion-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: data-ingestion-service
  labels:
    app: data-ingestion
    phase: cloud
spec:
  replicas: 3
  selector:
    matchLabels:
      app: data-ingestion
  template:
    metadata:
      labels:
        app: data-ingestion
    spec:
      containers:
      - name: data-ingestion
        image: edu-platform/data-ingestion:v1.2.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: KAFKA_BOOTSTRAP_SERVERS
          value: "kafka:9092"
        - name: REDIS_URL
          value: "redis://redis:6379"
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: data-ingestion-service
spec:
  selector:
    app: data-ingestion
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: data-ingestion-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: data-ingestion-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Service Mesh with Istio

```yaml
# istio-virtual-service.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: edu-platform-api
spec:
  hosts:
  - api.edu-platform.com
  http:
  - match:
    - uri:
        prefix: "/v1/data"
    route:
    - destination:
        host: data-ingestion-service
        port:
          number: 80
      weight: 90
    - destination:
        host: data-ingestion-service-canary
        port:
          number: 80
      weight: 10
    fault:
      delay:
        percentage:
          value: 0.1
        fixedDelay: 2s
  - match:
    - uri:
        prefix: "/v1/devices"
    route:
    - destination:
        host: device-management-service
        port:
          number: 80
  - match:
    - uri:
        prefix: "/v1/analytics"
    route:
    - destination:
        host: analytics-service
        port:
          number: 80

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: edu-platform-circuit-breaker
spec:
  host: data-ingestion-service
  trafficPolicy:
    outlierDetection:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 10
```

## Data Architecture

### Database Design

#### PostgreSQL - Relational Data
```sql
-- Device metadata and configuration
CREATE TABLE devices (
    device_id VARCHAR(50) PRIMARY KEY,
    device_type VARCHAR(50) NOT NULL,
    firmware_version VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location POINT,
    api_key_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true
);

-- Device configuration
CREATE TABLE device_configs (
    config_id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(device_id),
    sampling_interval INTEGER DEFAULT 60,
    transmission_interval INTEGER DEFAULT 300,
    calibration_settings JSONB,
    power_settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- User management
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Device access permissions
CREATE TABLE device_permissions (
    permission_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    device_id VARCHAR(50) REFERENCES devices(device_id),
    permission_level VARCHAR(20) DEFAULT 'read',
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### InfluxDB - Time Series Data
```sql
-- Measurement for sensor readings
CREATE MEASUREMENT sensor_readings (
    time TIMESTAMP,
    device_id TAG,
    sensor_type TAG,
    location TAG,
    temperature FIELD,
    humidity FIELD,
    pressure FIELD,
    battery_level FIELD,
    signal_strength FIELD,
    quality_score FIELD
);

-- Continuous queries for downsampling
CREATE CONTINUOUS QUERY "cq_hourly_avg" ON "edu_platform"
BEGIN
  SELECT mean(*) INTO "sensor_readings_hourly" 
  FROM "sensor_readings" 
  GROUP BY time(1h), device_id, sensor_type
END;

CREATE CONTINUOUS QUERY "cq_daily_avg" ON "edu_platform"
BEGIN
  SELECT mean(*) INTO "sensor_readings_daily" 
  FROM "sensor_readings_hourly" 
  GROUP BY time(1d), device_id, sensor_type
END;
```

### Caching Strategy

#### Redis Configuration
```python
import redis
from typing import Optional, Dict, Any
import json
from datetime import timedelta

class CacheManager:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
        
    async def get_device_data(self, device_id: str) -> Optional[Dict[str, Any]]:
        """Get cached device data"""
        cached = self.redis.get(f"device:{device_id}:latest")
        if cached:
            return json.loads(cached)
        return None
    
    async def cache_device_data(
        self, 
        device_id: str, 
        data: Dict[str, Any], 
        ttl: int = 300
    ):
        """Cache device data with TTL"""
        self.redis.setex(
            f"device:{device_id}:latest",
            ttl,
            json.dumps(data)
        )
    
    async def invalidate_device_cache(self, device_id: str):
        """Invalidate device-specific cache"""
        pattern = f"device:{device_id}:*"
        keys = self.redis.keys(pattern)
        if keys:
            self.redis.delete(*keys)
    
    async def get_analytics_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached analytics results"""
        cached = self.redis.get(f"analytics:{cache_key}")
        if cached:
            return json.loads(cached)
        return None
    
    async def cache_analytics_result(
        self, 
        cache_key: str, 
        result: Dict[str, Any], 
        ttl: int = 3600
    ):
        """Cache analytics results with longer TTL"""
        self.redis.setex(
            f"analytics:{cache_key}",
            ttl,
            json.dumps(result)
        )
```

## Security Architecture

### Authentication and Authorization

#### JWT Token Management
```python
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta
from typing import Optional

security = HTTPBearer()

class JWTManager:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def create_access_token(
        self, 
        data: dict, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=1)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, 
            self.secret_key, 
            algorithm=self.algorithm
        )
        return encoded_jwt
    
    def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token has expired")
        except jwt.JWTError:
            raise HTTPException(401, "Invalid token")

# Dependency for protecting endpoints
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    jwt_manager = JWTManager(SECRET_KEY)
    payload = jwt_manager.verify_token(credentials.credentials)
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(401, "Invalid token payload")
    
    # Fetch user from database
    user = await get_user_by_id(user_id)
    if user is None:
        raise HTTPException(401, "User not found")
    
    return user
```

#### Role-Based Access Control
```python
from enum import Enum
from functools import wraps

class UserRole(Enum):
    ADMIN = "admin"
    USER = "user"
    DEVICE = "device"
    READONLY = "readonly"

class Permission(Enum):
    READ_DEVICES = "read_devices"
    WRITE_DEVICES = "write_devices"
    READ_DATA = "read_data"
    WRITE_DATA = "write_data"
    ADMIN_PANEL = "admin_panel"

ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        Permission.READ_DEVICES,
        Permission.WRITE_DEVICES,
        Permission.READ_DATA,
        Permission.WRITE_DATA,
        Permission.ADMIN_PANEL
    ],
    UserRole.USER: [
        Permission.READ_DEVICES,
        Permission.READ_DATA
    ],
    UserRole.DEVICE: [
        Permission.WRITE_DATA
    ],
    UserRole.READONLY: [
        Permission.READ_DATA
    ]
}

def require_permission(permission: Permission):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get current user from context
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(401, "Authentication required")
            
            user_role = UserRole(current_user.get('role'))
            user_permissions = ROLE_PERMISSIONS.get(user_role, [])
            
            if permission not in user_permissions:
                raise HTTPException(403, "Insufficient permissions")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Usage example
@app.get("/v1/admin/users")
@require_permission(Permission.ADMIN_PANEL)
async def get_all_users(current_user: dict = Depends(get_current_user)):
    return await fetch_all_users()
```

### Network Security

#### VPC and Security Groups Configuration
```yaml
# terraform/vpc.tf
resource "aws_vpc" "edu_platform_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "edu-platform-vpc"
    Environment = var.environment
  }
}

# Public subnets for load balancers
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.edu_platform_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "edu-platform-public-${count.index + 1}"
    Type = "public"
  }
}

# Private subnets for application services
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.edu_platform_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "edu-platform-private-${count.index + 1}"
    Type = "private"
  }
}

# Database subnets
resource "aws_subnet" "database" {
  count             = 2
  vpc_id            = aws_vpc.edu_platform_vpc.id
  cidr_block        = "10.0.${count.index + 20}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "edu-platform-db-${count.index + 1}"
    Type = "database"
  }
}

# Security groups
resource "aws_security_group" "web_tier" {
  name_prefix = "edu-platform-web-"
  vpc_id      = aws_vpc.edu_platform_vpc.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "app_tier" {
  name_prefix = "edu-platform-app-"
  vpc_id      = aws_vpc.edu_platform_vpc.id
  
  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.web_tier.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "database_tier" {
  name_prefix = "edu-platform-db-"
  vpc_id      = aws_vpc.edu_platform_vpc.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_tier.id]
  }
  
  ingress {
    from_port       = 8086
    to_port         = 8086
    protocol        = "tcp"
    security_groups = [aws_security_group.app_tier.id]
  }
}
```

## Monitoring and Observability

### Prometheus and Grafana Setup

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)

  - job_name: 'edu-platform-services'
    static_configs:
      - targets:
          - 'data-ingestion-service:8000'
          - 'device-management-service:8000'
          - 'analytics-service:8000'
    metrics_path: '/metrics'
    scrape_interval: 30s
```

#### Custom Metrics
```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time

# Define metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_DEVICES = Gauge(
    'active_devices_total',
    'Number of active devices'
)

DATA_INGESTION_RATE = Counter(
    'data_points_ingested_total',
    'Total data points ingested',
    ['device_type']
)

# Middleware for automatic metrics collection
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    # Record metrics
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_DURATION.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(time.time() - start_time)
    
    return response

# Start metrics server
start_http_server(8001)
```

### Logging Strategy

#### Structured Logging
```python
import logging
import json
from datetime import datetime
from typing import Dict, Any

class StructuredLogger:
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = logging.getLogger(service_name)
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(message)s')
        handler.setFormatter(formatter)
        
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log(
        self, 
        level: str, 
        message: str, 
        **kwargs
    ):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "level": level,
            "message": message,
            **kwargs
        }
        
        self.logger.info(json.dumps(log_entry))
    
    def info(self, message: str, **kwargs):
        self.log("INFO", message, **kwargs)
    
    def error(self, message: str, **kwargs):
        self.log("ERROR", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        self.log("WARNING", message, **kwargs)

# Usage example
logger = StructuredLogger("data-ingestion-service")

@app.post("/v1/data/ingest")
async def ingest_data(data: SensorData):
    logger.info(
        "Data ingestion started",
        device_id=data.device_id,
        sensor_count=len(data.sensor_readings),
        correlation_id=request.headers.get("X-Correlation-ID")
    )
    
    try:
        result = await process_data(data)
        
        logger.info(
            "Data ingestion completed",
            device_id=data.device_id,
            processing_time_ms=result.processing_time,
            records_stored=result.records_count
        )
        
        return result
        
    except Exception as e:
        logger.error(
            "Data ingestion failed",
            device_id=data.device_id,
            error=str(e),
            traceback=traceback.format_exc()
        )
        raise
```

This comprehensive cloud architecture provides a solid foundation for the educational data science platform, demonstrating modern cloud-native patterns while highlighting common architectural challenges and solutions.
