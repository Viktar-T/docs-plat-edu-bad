# API Design and Documentation

This document outlines the comprehensive API design for the Educational Platform for Bad Data Science, including RESTful endpoints, authentication, and integration patterns.

## API Overview

The platform provides a comprehensive RESTful API that enables:
- Device management and configuration
- Real-time sensor data access
- Project and user management
- Data quality monitoring
- Educational content delivery
- Analytics and reporting

## API Architecture

### Base URL Structure
```
Production: https://api.platform.edu/v1
Staging: https://staging-api.platform.edu/v1
Development: https://dev-api.platform.edu/v1
```

### API Design Principles
- **RESTful Design**: Standard HTTP methods and status codes
- **Resource-Oriented**: URLs represent resources, not actions
- **Stateless**: Each request contains all necessary information
- **Versioned**: API versions in URL path for backward compatibility
- **Consistent**: Uniform naming conventions and response formats

## Authentication and Authorization

### Authentication Methods

#### JWT Bearer Token Authentication
```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "teacher",
    "institution": "Sample University"
  }
}
```

#### API Key Authentication (for IoT devices)
```http
GET /v1/devices/123/data
Authorization: API-Key your-api-key-here
```

### Authorization Scopes
```javascript
const SCOPES = {
  'read:devices': 'Read device information and data',
  'write:devices': 'Create and modify devices',
  'read:projects': 'Access project information',
  'write:projects': 'Create and manage projects',
  'read:users': 'Access user information',
  'admin:users': 'Manage user accounts',
  'analytics:read': 'Access analytics data',
  'analytics:export': 'Export analytics data'
};
```

## Core API Endpoints

### Authentication Endpoints

```yaml
# Authentication and User Management
POST   /v1/auth/login           # User login
POST   /v1/auth/logout          # User logout
POST   /v1/auth/refresh         # Refresh access token
POST   /v1/auth/register        # User registration
POST   /v1/auth/password/reset  # Password reset request
PUT    /v1/auth/password/update # Password update
GET    /v1/auth/me             # Get current user info
```

### User Management

```yaml
# User CRUD operations
GET    /v1/users               # List users (admin only)
POST   /v1/users               # Create user (admin only)
GET    /v1/users/{id}          # Get user details
PUT    /v1/users/{id}          # Update user
DELETE /v1/users/{id}          # Delete user (admin only)
GET    /v1/users/{id}/projects # Get user's projects
POST   /v1/users/{id}/roles    # Assign role to user
```

#### Example User Endpoints

```http
GET /v1/users?role=student&institution=university&page=1&limit=20
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "student@university.edu",
      "first_name": "John",
      "last_name": "Doe",
      "role": "student",
      "institution": "Sample University",
      "created_at": "2025-01-01T00:00:00Z",
      "last_login": "2025-01-08T10:30:00Z",
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Device Management

```yaml
# Device operations
GET    /v1/devices             # List all devices
POST   /v1/devices             # Register new device
GET    /v1/devices/{id}        # Get device details
PUT    /v1/devices/{id}        # Update device configuration
DELETE /v1/devices/{id}        # Remove device
GET    /v1/devices/{id}/status # Get device status
POST   /v1/devices/{id}/commands # Send command to device
GET    /v1/devices/{id}/sensors # List device sensors
POST   /v1/devices/{id}/calibrate # Calibrate device sensors
```

#### Device Registration Example

```http
POST /v1/devices
Authorization: Bearer {token}
Content-Type: application/json

{
  "device_name": "Classroom A Sensor Hub",
  "device_type": "ESP32_MULTI_SENSOR",
  "manufacturer": "Educational IoT Inc.",
  "model": "EDU-SENSOR-V2",
  "serial_number": "EDU123456789",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "location": {
    "building": "Science Building",
    "room": "Room 101",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 University Ave"
  },
  "sensors": [
    {
      "sensor_type": "temperature",
      "unit": "celsius",
      "range_min": -40,
      "range_max": 80,
      "accuracy": 0.5
    },
    {
      "sensor_type": "humidity", 
      "unit": "percent",
      "range_min": 0,
      "range_max": 100,
      "accuracy": 2
    }
  ]
}

Response:
{
  "id": "device_123e4567-e89b-12d3-a456-426614174000",
  "device_name": "Classroom A Sensor Hub",
  "status": "registered",
  "api_key": "dev_ak_1234567890abcdef",
  "mqtt_topic": "devices/device_123e4567/data",
  "configuration_url": "/v1/devices/device_123e4567/config",
  "created_at": "2025-01-08T10:30:00Z"
}
```

### Sensor Data

```yaml
# Sensor data operations
GET    /v1/devices/{id}/data         # Get sensor readings
POST   /v1/devices/{id}/data         # Submit sensor data (device endpoint)
GET    /v1/devices/{id}/data/latest  # Get latest sensor readings
GET    /v1/devices/{id}/data/export  # Export historical data
GET    /v1/sensors/{id}/data         # Get specific sensor data
POST   /v1/data/bulk                 # Bulk data submission
```

#### Sensor Data Submission

```http
POST /v1/devices/device_123/data
Authorization: API-Key dev_ak_1234567890abcdef
Content-Type: application/json

{
  "timestamp": "2025-01-08T10:30:00Z",
  "readings": [
    {
      "sensor_id": "temp_001",
      "sensor_type": "temperature",
      "value": 23.5,
      "unit": "celsius",
      "quality": 0.95
    },
    {
      "sensor_id": "humid_001", 
      "sensor_type": "humidity",
      "value": 65.2,
      "unit": "percent",
      "quality": 0.98
    }
  ],
  "device_status": {
    "battery_level": 87,
    "signal_strength": -45,
    "memory_usage": 67
  }
}

Response:
{
  "status": "accepted",
  "message": "Data received successfully",
  "received_count": 2,
  "rejected_count": 0,
  "next_submission": "2025-01-08T10:35:00Z"
}
```

#### Sensor Data Retrieval

```http
GET /v1/devices/device_123/data?start_time=2025-01-08T00:00:00Z&end_time=2025-01-08T23:59:59Z&sensors=temperature,humidity&aggregation=hourly
Authorization: Bearer {token}

Response:
{
  "device_id": "device_123",
  "time_range": {
    "start": "2025-01-08T00:00:00Z",
    "end": "2025-01-08T23:59:59Z"
  },
  "aggregation": "hourly",
  "data": [
    {
      "timestamp": "2025-01-08T10:00:00Z",
      "sensors": {
        "temperature": {
          "min": 22.1,
          "max": 24.3,
          "avg": 23.2,
          "count": 60
        },
        "humidity": {
          "min": 62.5,
          "max": 68.1,
          "avg": 65.3,
          "count": 60
        }
      }
    }
  ],
  "quality_metrics": {
    "completeness": 0.98,
    "accuracy_score": 0.95,
    "anomaly_count": 2
  }
}
```

### Project Management

```yaml
# Project operations
GET    /v1/projects            # List projects
POST   /v1/projects            # Create project
GET    /v1/projects/{id}       # Get project details
PUT    /v1/projects/{id}       # Update project
DELETE /v1/projects/{id}       # Delete project
GET    /v1/projects/{id}/participants # List project participants
POST   /v1/projects/{id}/participants # Add participant
GET    /v1/projects/{id}/devices      # List project devices
POST   /v1/projects/{id}/devices      # Assign device to project
GET    /v1/projects/{id}/data         # Get project sensor data
GET    /v1/projects/{id}/analytics    # Get project analytics
```

#### Project Creation Example

```http
POST /v1/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "project_name": "Climate Monitoring Study",
  "description": "Study temperature and humidity variations in different campus locations",
  "project_type": "classroom",
  "start_date": "2025-01-15",
  "end_date": "2025-05-15",
  "institution": "Sample University",
  "grade_level": "undergraduate",
  "subject_area": "Environmental Science",
  "learning_objectives": [
    "Understand data collection methodologies",
    "Analyze environmental patterns",
    "Identify data quality issues",
    "Create data visualizations"
  ],
  "max_participants": 30
}

Response:
{
  "id": "proj_123e4567-e89b-12d3-a456-426614174000",
  "project_name": "Climate Monitoring Study",
  "status": "active",
  "join_code": "CLIMATE2025",
  "dashboard_url": "/projects/proj_123e4567/dashboard",
  "data_export_url": "/projects/proj_123e4567/export",
  "created_at": "2025-01-08T10:30:00Z"
}
```

### Data Quality Monitoring

```yaml
# Data quality operations
GET    /v1/data-quality/issues        # List data quality issues
POST   /v1/data-quality/issues        # Report data quality issue
GET    /v1/data-quality/issues/{id}   # Get issue details
PUT    /v1/data-quality/issues/{id}   # Update issue status
GET    /v1/data-quality/metrics       # Get quality metrics
GET    /v1/devices/{id}/quality       # Device-specific quality metrics
GET    /v1/projects/{id}/quality      # Project quality metrics
POST   /v1/data-quality/annotations  # Add data annotation
```

#### Data Quality Issue Reporting

```http
POST /v1/data-quality/issues
Authorization: Bearer {token}
Content-Type: application/json

{
  "device_id": "device_123",
  "sensor_id": "temp_001",
  "project_id": "proj_123",
  "issue_type": "outlier",
  "severity": "medium",
  "description": "Temperature reading of 45°C seems unusually high for indoor environment",
  "time_range_start": "2025-01-08T14:30:00Z",
  "time_range_end": "2025-01-08T14:35:00Z",
  "evidence": {
    "readings": [45.2, 45.8, 44.9],
    "context": "Other sensors showing normal 23°C range"
  }
}

Response:
{
  "issue_id": "issue_123e4567-e89b-12d3-a456-426614174000",
  "status": "open",
  "priority": "medium",
  "assigned_to": null,
  "auto_flagged": false,
  "created_at": "2025-01-08T15:00:00Z",
  "estimated_resolution": "2025-01-09T15:00:00Z"
}
```

### Analytics and Reporting

```yaml
# Analytics operations
GET    /v1/analytics/dashboard/{project_id}  # Dashboard data
GET    /v1/analytics/summary/{project_id}    # Project summary
GET    /v1/analytics/trends/{device_id}      # Device trend analysis
GET    /v1/analytics/correlations            # Cross-sensor correlations
GET    /v1/analytics/anomalies               # Anomaly detection results
POST   /v1/analytics/custom-query            # Custom analytics query
GET    /v1/exports/{export_id}               # Download exported data
POST   /v1/exports                           # Create data export job
```

## Real-time Communication

### WebSocket API

```javascript
// WebSocket connection for real-time data
const ws = new WebSocket('wss://api.platform.edu/v1/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your_jwt_token'
}));

// Subscribe to device data
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'device_data',
  device_id: 'device_123'
}));

// Receive real-time data
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'sensor_data') {
    console.log('New sensor reading:', data.payload);
  }
};
```

### Server-Sent Events (SSE)

```http
GET /v1/stream/devices/device_123/data
Authorization: Bearer {token}
Accept: text/event-stream

Response:
data: {"sensor_type": "temperature", "value": 23.5, "timestamp": "2025-01-08T10:30:00Z"}

data: {"sensor_type": "humidity", "value": 65.2, "timestamp": "2025-01-08T10:30:05Z"}
```

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data provided",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ],
    "request_id": "req_123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2025-01-08T10:30:00Z"
  }
}
```

### HTTP Status Codes

```yaml
# Success codes
200: OK - Request successful
201: Created - Resource created successfully
202: Accepted - Request accepted for processing
204: No Content - Request successful, no content to return

# Client error codes
400: Bad Request - Invalid request format or data
401: Unauthorized - Authentication required or failed
403: Forbidden - Insufficient permissions
404: Not Found - Resource not found
409: Conflict - Resource conflict (e.g., duplicate email)
422: Unprocessable Entity - Validation errors
429: Too Many Requests - Rate limit exceeded

# Server error codes
500: Internal Server Error - Unexpected server error
502: Bad Gateway - Upstream service error
503: Service Unavailable - Service temporarily unavailable
504: Gateway Timeout - Upstream service timeout
```

## Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
X-RateLimit-Window: 3600
```

### Rate Limit Tiers

```yaml
Free Tier:
  - 1,000 requests per hour
  - 10 devices maximum
  - Basic analytics only

Educational Tier:
  - 10,000 requests per hour  
  - 100 devices maximum
  - Full analytics access

Institution Tier:
  - 100,000 requests per hour
  - Unlimited devices
  - Priority support
  - Custom integrations
```

## API Versioning

### Version Strategy
- **URL Path Versioning**: `/v1/`, `/v2/`, etc.
- **Backward Compatibility**: Maintain previous versions for 12 months
- **Deprecation Notice**: 6-month advance notice for breaking changes

### Version Headers
```http
API-Version: 1.2
Deprecated-Version: 1.0
Sunset-Date: 2025-12-31
```

## SDK and Client Libraries

### Python SDK Example

```python
from platform_edu_sdk import PlatformClient

# Initialize client
client = PlatformClient(
    base_url="https://api.platform.edu/v1",
    api_key="your_api_key"
)

# Authenticate
user = client.auth.login("user@example.com", "password")

# Get device data
device_data = client.devices.get_data(
    device_id="device_123",
    start_time="2025-01-08T00:00:00Z",
    end_time="2025-01-08T23:59:59Z",
    sensors=["temperature", "humidity"]
)

# Create project
project = client.projects.create({
    "project_name": "My Study",
    "description": "Research project",
    "project_type": "research"
})
```

### JavaScript SDK Example

```javascript
import { PlatformClient } from '@platform-edu/sdk';

const client = new PlatformClient({
  baseURL: 'https://api.platform.edu/v1',
  apiKey: 'your_api_key'
});

// Real-time data subscription
const subscription = client.devices.subscribeToData('device_123', {
  onData: (data) => console.log('New data:', data),
  onError: (error) => console.error('Error:', error)
});

// Async data retrieval
const deviceData = await client.devices.getData({
  deviceId: 'device_123',
  timeRange: {
    start: '2025-01-08T00:00:00Z',
    end: '2025-01-08T23:59:59Z'
  },
  sensors: ['temperature', 'humidity']
});
```

## Testing and Documentation

### API Testing Examples

```python
import pytest
import requests

class TestDeviceAPI:
    base_url = "https://api.platform.edu/v1"
    
    def test_device_registration(self, auth_token):
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "device_name": "Test Device",
            "device_type": "ESP32",
            "manufacturer": "Test Corp"
        }
        
        response = requests.post(
            f"{self.base_url}/devices",
            json=payload,
            headers=headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["device_name"] == "Test Device"
    
    def test_sensor_data_submission(self, device_api_key):
        headers = {"Authorization": f"API-Key {device_api_key}"}
        payload = {
            "timestamp": "2025-01-08T10:30:00Z",
            "readings": [
                {
                    "sensor_type": "temperature",
                    "value": 23.5,
                    "unit": "celsius"
                }
            ]
        }
        
        response = requests.post(
            f"{self.base_url}/devices/test_device/data",
            json=payload,
            headers=headers
        )
        
        assert response.status_code == 202
```

### OpenAPI Specification

The complete API is documented using OpenAPI 3.0 specification, available at:
- **Interactive Documentation**: `https://api.platform.edu/docs`
- **OpenAPI JSON**: `https://api.platform.edu/v1/openapi.json`
- **Redoc Documentation**: `https://api.platform.edu/redoc`

## Security Considerations

### API Security Best Practices
1. **HTTPS Only**: All API communication over TLS 1.3
2. **Input Validation**: Comprehensive validation on all endpoints
3. **SQL Injection Prevention**: Parameterized queries and ORM usage
4. **XSS Protection**: Input sanitization and output encoding
5. **CSRF Protection**: CSRF tokens for state-changing operations
6. **Rate Limiting**: Prevent abuse and DDoS attacks

### Data Privacy
- **GDPR Compliance**: Right to erasure and data portability
- **Data Minimization**: Collect only necessary data
- **Anonymization**: Remove PII from analytics datasets
- **Audit Logging**: Log all data access and modifications

## Educational Notes

### Learning Objectives
- Understand RESTful API design principles
- Learn authentication and authorization patterns
- Practice API documentation and testing
- Experience real-time communication protocols

### Common API Design Patterns
1. **Resource-Based URLs**: `/users/{id}` instead of `/getUser?id=123`
2. **HTTP Method Semantics**: GET (read), POST (create), PUT (update), DELETE (remove)
3. **Stateless Design**: Each request independent of others
4. **Pagination**: Limit result sets for performance
5. **Filtering and Sorting**: Query parameters for data refinement

### API Development Best Practices
- **Consistent Naming**: Use consistent naming conventions
- **Comprehensive Testing**: Unit, integration, and load testing
- **Documentation**: Keep documentation updated with code changes
- **Monitoring**: Track API usage, performance, and errors
- **Versioning Strategy**: Plan for API evolution

### Next Steps
- Implement API client SDKs for multiple languages
- Add GraphQL endpoint for flexible data queries
- Enhance real-time capabilities with improved WebSocket features
- Develop API analytics and usage dashboards
