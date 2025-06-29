# Testing and Validation

## Overview

This document outlines comprehensive testing strategies and validation procedures for the educational data science platform. Testing is critical to ensure system reliability, data quality, and educational effectiveness across all four phases.

## Testing Philosophy

### Educational Testing Approach

Our testing strategy serves dual purposes:
1. **Quality Assurance**: Ensure system reliability and correctness
2. **Educational Demonstration**: Show proper testing methodologies and common testing pitfalls

### Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │ ← 10% (Expensive, Slow)
                    │   (UI, API)     │
                ┌───┴─────────────────┴───┐
                │   Integration Tests     │ ← 20% (Medium Cost)
                │   (Services, Database) │
            ┌───┴─────────────────────────┴───┐
            │      Unit Tests                 │ ← 70% (Fast, Cheap)
            │   (Functions, Components)       │
            └─────────────────────────────────┘
```

## Phase-Specific Testing Strategies

### Phase 1: Hardware Testing

#### Unit Testing for Sensor Functions

**Temperature Sensor Testing**:
```cpp
#include <ArduinoUnit.h>

test(temperature_sensor_reading) {
  // Test valid temperature reading
  float temp = dht.readTemperature();
  assertTrue(!isnan(temp));
  assertTrue(temp >= -40.0 && temp <= 80.0);
}

test(temperature_sensor_calibration) {
  // Test calibration application
  float raw_temp = 25.0;
  float offset = 2.0;
  float calibrated = applyTemperatureCalibration(raw_temp, offset);
  assertEqual(calibrated, 27.0);
}

test(temperature_validation_range) {
  // Test range validation
  assertTrue(validateTemperature(25.0));   // Valid
  assertFalse(validateTemperature(150.0)); // Too high
  assertFalse(validateTemperature(-100.0)); // Too low
  assertFalse(validateTemperature(NAN));   // Invalid
}
```

**Communication Testing**:
```cpp
test(wifi_connection_stability) {
  // Test WiFi connection stability
  assertTrue(WiFi.status() == WL_CONNECTED);
  
  // Test reconnection after disconnection
  WiFi.disconnect();
  delay(1000);
  
  bool reconnected = attemptWiFiReconnection();
  assertTrue(reconnected);
}

test(data_transmission_reliability) {
  // Test data transmission with retry mechanism
  SensorData testData = createTestData();
  
  bool transmitted = false;
  for (int attempt = 0; attempt < 3; attempt++) {
    if (transmitData(testData)) {
      transmitted = true;
      break;
    }
    delay(1000);
  }
  
  assertTrue(transmitted);
}
```

#### Hardware Integration Testing

**Sensor Array Testing**:
```cpp
void runSensorIntegrationTests() {
  Serial.println("=== Sensor Integration Tests ===");
  
  // Test I2C bus functionality
  testI2CBus();
  
  // Test each sensor individually
  testDHT22Sensor();
  testBMP280Sensor();
  testMPU6050Sensor();
  
  // Test sensor interactions
  testSimultaneousReading();
  testSensorCrossTalk();
  
  // Test power management
  testPowerOptimization();
  testBatteryMonitoring();
  
  Serial.println("=== Integration Tests Complete ===");
}

bool testI2CBus() {
  Wire.begin();
  
  int deviceCount = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      deviceCount++;
    }
  }
  
  return deviceCount >= EXPECTED_DEVICE_COUNT;
}
```

#### Environmental Testing

**Temperature Cycling Test**:
```cpp
void temperatureCyclingTest() {
  float temperatures[] = {-10, 0, 25, 40, 60, 25}; // Target temperatures
  
  for (int i = 0; i < sizeof(temperatures)/sizeof(float); i++) {
    Serial.printf("Testing at %.1f°C\n", temperatures[i]);
    
    // Wait for temperature stabilization
    waitForTemperature(temperatures[i]);
    
    // Run sensor tests
    bool passed = runSensorTests();
    
    if (!passed) {
      Serial.printf("FAIL: Tests failed at %.1f°C\n", temperatures[i]);
      return;
    }
  }
  
  Serial.println("PASS: Temperature cycling test completed");
}
```

### Phase 2: Cloud Infrastructure Testing

#### API Testing

**REST API Unit Tests**:
```python
import pytest
import requests
from unittest.mock import Mock, patch

class TestSensorDataAPI:
    def setup_method(self):
        self.base_url = "https://api.platform.com/v1"
        self.api_key = "test_api_key"
        self.headers = {"Authorization": f"Bearer {self.api_key}"}
    
    def test_data_ingestion_valid_payload(self):
        payload = {
            "device_id": "test_sensor_001",
            "timestamp": "2025-06-29T10:30:00Z",
            "sensor_data": {
                "temperature": {"value": 23.5, "unit": "celsius"},
                "humidity": {"value": 65.2, "unit": "percent"}
            }
        }
        
        response = requests.post(
            f"{self.base_url}/data/ingest",
            json=payload,
            headers=self.headers
        )
        
        assert response.status_code == 200
        assert response.json()["status"] == "success"
    
    def test_data_ingestion_invalid_payload(self):
        # Test with missing required fields
        payload = {
            "device_id": "test_sensor_001"
            # Missing timestamp and sensor_data
        }
        
        response = requests.post(
            f"{self.base_url}/data/ingest",
            json=payload,
            headers=self.headers
        )
        
        assert response.status_code == 400
        assert "validation_errors" in response.json()
    
    def test_rate_limiting(self):
        # Test API rate limiting
        responses = []
        for i in range(100):  # Exceed rate limit
            response = requests.get(
                f"{self.base_url}/devices",
                headers=self.headers
            )
            responses.append(response.status_code)
        
        # Should have some 429 (Too Many Requests) responses
        assert 429 in responses
```

**Database Integration Tests**:
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class TestDatabaseIntegration:
    @pytest.fixture
    def db_session(self):
        # Use test database
        engine = create_engine("postgresql://test:test@localhost/test_db")
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.rollback()
        session.close()
    
    def test_sensor_data_storage(self, db_session):
        # Test storing sensor data
        sensor_reading = SensorReading(
            device_id="test_001",
            timestamp=datetime.utcnow(),
            temperature=23.5,
            humidity=65.2
        )
        
        db_session.add(sensor_reading)
        db_session.commit()
        
        # Verify storage
        stored = db_session.query(SensorReading).filter_by(
            device_id="test_001"
        ).first()
        
        assert stored is not None
        assert stored.temperature == 23.5
    
    def test_data_validation_constraints(self, db_session):
        # Test database constraints
        with pytest.raises(IntegrityError):
            invalid_reading = SensorReading(
                device_id="test_001",
                timestamp=datetime.utcnow(),
                temperature=200.0  # Exceeds constraint
            )
            db_session.add(invalid_reading)
            db_session.commit()
```

#### Load Testing

**Performance Testing with Locust**:
```python
from locust import HttpUser, task, between

class SensorDataUser(HttpUser):
    wait_time = between(1, 5)
    
    def on_start(self):
        # Authenticate user
        response = self.client.post("/auth/login", json={
            "username": "test_user",
            "password": "test_password"
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(3)
    def get_device_list(self):
        self.client.get("/devices", headers=self.headers)
    
    @task(2)
    def get_device_data(self):
        self.client.get("/devices/sensor_001/data", headers=self.headers)
    
    @task(1)
    def submit_sensor_data(self):
        payload = self.generate_sensor_data()
        self.client.post("/data/ingest", json=payload, headers=self.headers)
    
    def generate_sensor_data(self):
        import random
        return {
            "device_id": f"load_test_{random.randint(1, 100)}",
            "timestamp": datetime.utcnow().isoformat(),
            "sensor_data": {
                "temperature": {"value": random.uniform(20, 30)},
                "humidity": {"value": random.uniform(40, 80)}
            }
        }
```

### Phase 3: Web Application Testing

#### Frontend Unit Testing

**React Component Testing with Jest**:
```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SensorDashboard } from '../components/SensorDashboard';
import { api } from '../services/api';

// Mock API service
jest.mock('../services/api');

describe('SensorDashboard', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('displays sensor data correctly', async () => {
    // Mock API response
    api.getDeviceData.mockResolvedValue({
      device_id: 'sensor_001',
      latest_reading: {
        temperature: 23.5,
        humidity: 65.2,
        timestamp: '2025-06-29T10:30:00Z'
      }
    });

    render(<SensorDashboard deviceId="sensor_001" />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('23.5°C')).toBeInTheDocument();
      expect(screen.getByText('65.2%')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    api.getDeviceData.mockRejectedValue(new Error('API Error'));

    render(<SensorDashboard deviceId="sensor_001" />);

    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
    });
  });

  test('refreshes data when refresh button clicked', async () => {
    api.getDeviceData.mockResolvedValue({
      device_id: 'sensor_001',
      latest_reading: { temperature: 23.5, humidity: 65.2 }
    });

    render(<SensorDashboard deviceId="sensor_001" />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(api.getDeviceData).toHaveBeenCalledTimes(2);
    });
  });
});
```

#### End-to-End Testing with Cypress

**E2E User Flow Testing**:
```javascript
describe('Sensor Monitoring Workflow', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test_user', 'test_password');
  });

  it('should display device list and allow navigation to device details', () => {
    // Visit device list page
    cy.visit('/devices');

    // Verify devices are loaded
    cy.get('[data-testid="device-list"]').should('be.visible');
    cy.get('[data-testid="device-item"]').should('have.length.at.least', 1);

    // Click on first device
    cy.get('[data-testid="device-item"]').first().click();

    // Verify navigation to device details
    cy.url().should('include', '/devices/');
    cy.get('[data-testid="device-details"]').should('be.visible');
  });

  it('should display real-time sensor data updates', () => {
    cy.visit('/devices/sensor_001');

    // Initial data should be loaded
    cy.get('[data-testid="temperature-value"]').should('exist');

    // Mock WebSocket connection for real-time updates
    cy.window().its('mockWebSocket').then((ws) => {
      ws.send(JSON.stringify({
        channel: 'device.sensor_001.data',
        data: { temperature: 25.0, humidity: 70.0 }
      }));
    });

    // Verify UI updates with new data
    cy.get('[data-testid="temperature-value"]').should('contain', '25.0');
    cy.get('[data-testid="humidity-value"]').should('contain', '70.0');
  });

  it('should handle network disconnection gracefully', () => {
    cy.visit('/devices/sensor_001');

    // Simulate network disconnection
    cy.intercept('GET', '/api/v1/devices/sensor_001/data', {
      forceNetworkError: true
    }).as('networkError');

    // Try to refresh data
    cy.get('[data-testid="refresh-button"]').click();

    // Verify error handling
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="offline-indicator"]').should('be.visible');
  });
});
```

### Phase 4: Visualization and Analytics Testing

#### Dashboard Testing

**Chart Component Testing**:
```javascript
import { render, screen } from '@testing-library/react';
import { TemperatureTrendChart } from '../components/TemperatureTrendChart';

describe('TemperatureTrendChart', () => {
  const mockData = [
    { timestamp: '2025-06-29T08:00:00Z', temperature: 20.5 },
    { timestamp: '2025-06-29T09:00:00Z', temperature: 21.2 },
    { timestamp: '2025-06-29T10:00:00Z', temperature: 22.8 }
  ];

  test('renders chart with provided data', () => {
    render(<TemperatureTrendChart data={mockData} />);
    
    // Verify chart container exists
    expect(screen.getByTestId('temperature-chart')).toBeInTheDocument();
    
    // Verify data points are rendered
    expect(screen.getByText('20.5°C')).toBeInTheDocument();
    expect(screen.getByText('22.8°C')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    render(<TemperatureTrendChart data={[]} />);
    
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  test('displays correct time range', () => {
    render(<TemperatureTrendChart data={mockData} />);
    
    // Verify time axis labels
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });
});
```

#### Machine Learning Model Testing

**Model Validation Testing**:
```python
import pytest
import numpy as np
from sklearn.metrics import mean_absolute_error, r2_score
from src.models.temperature_forecasting import TemperatureForecastModel

class TestTemperatureForecastModel:
    @pytest.fixture
    def model(self):
        return TemperatureForecastModel()
    
    @pytest.fixture
    def sample_data(self):
        # Generate synthetic time series data
        timestamps = pd.date_range('2025-01-01', periods=1000, freq='H')
        # Simulate temperature with daily and seasonal patterns
        temperature = (
            20 +  # Base temperature
            5 * np.sin(2 * np.pi * np.arange(1000) / 24) +  # Daily cycle
            10 * np.sin(2 * np.pi * np.arange(1000) / (24 * 365)) +  # Seasonal
            np.random.normal(0, 1, 1000)  # Noise
        )
        return pd.DataFrame({'timestamp': timestamps, 'temperature': temperature})
    
    def test_model_training(self, model, sample_data):
        # Test model training
        train_data = sample_data[:800]
        model.fit(train_data)
        
        assert model.is_trained
        assert hasattr(model, 'model_')
    
    def test_model_prediction_accuracy(self, model, sample_data):
        # Train model
        train_data = sample_data[:800]
        test_data = sample_data[800:]
        
        model.fit(train_data)
        predictions = model.predict(test_data[['timestamp']])
        
        # Check prediction accuracy
        mae = mean_absolute_error(test_data['temperature'], predictions)
        r2 = r2_score(test_data['temperature'], predictions)
        
        assert mae < 2.0  # Mean absolute error should be < 2°C
        assert r2 > 0.7   # R² should be > 0.7
    
    def test_model_prediction_range(self, model, sample_data):
        # Test that predictions are within reasonable range
        model.fit(sample_data[:800])
        predictions = model.predict(sample_data[800:820][['timestamp']])
        
        # Temperature predictions should be realistic
        assert np.all(predictions >= -50)  # Above absolute minimum
        assert np.all(predictions <= 60)   # Below reasonable maximum
    
    def test_model_handles_missing_data(self, model, sample_data):
        # Introduce missing values
        data_with_gaps = sample_data.copy()
        data_with_gaps.loc[100:110, 'temperature'] = np.nan
        
        # Model should handle missing data gracefully
        try:
            model.fit(data_with_gaps[:800])
            predictions = model.predict(data_with_gaps[800:820][['timestamp']])
            assert len(predictions) > 0
        except Exception as e:
            pytest.fail(f"Model failed to handle missing data: {e}")
```

## Cross-Phase Integration Testing

### End-to-End System Testing

**Complete Data Flow Test**:
```python
import pytest
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestCompleteDataFlow:
    @pytest.fixture
    def browser(self):
        driver = webdriver.Chrome()
        yield driver
        driver.quit()
    
    def test_sensor_to_dashboard_flow(self, browser):
        """Test complete flow from sensor data to dashboard visualization"""
        
        # Step 1: Simulate sensor data transmission
        sensor_data = {
            "device_id": "integration_test_001",
            "timestamp": datetime.utcnow().isoformat(),
            "sensor_data": {
                "temperature": {"value": 25.5, "unit": "celsius"},
                "humidity": {"value": 67.3, "unit": "percent"}
            }
        }
        
        response = requests.post(
            "https://api.platform.com/v1/data/ingest",
            json=sensor_data,
            headers={"Authorization": "Bearer test_api_key"}
        )
        assert response.status_code == 200
        
        # Step 2: Wait for data processing (allow for async processing)
        time.sleep(5)
        
        # Step 3: Verify data is accessible via API
        api_response = requests.get(
            f"https://api.platform.com/v1/devices/{sensor_data['device_id']}/data/latest"
        )
        assert api_response.status_code == 200
        latest_data = api_response.json()
        assert latest_data['temperature']['value'] == 25.5
        
        # Step 4: Check dashboard displays the data
        browser.get("https://dashboard.platform.com/devices/integration_test_001")
        
        # Wait for authentication (if needed)
        WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.ID, "device-dashboard"))
        )
        
        # Verify temperature display
        temp_element = WebDriverWait(browser, 10).until(
            EC.text_to_be_present_in_element(
                (By.CLASS_NAME, "temperature-value"), "25.5"
            )
        )
        
        # Verify humidity display
        humidity_element = browser.find_element(By.CLASS_NAME, "humidity-value")
        assert "67.3" in humidity_element.text
        
        # Step 5: Verify analytics processing
        analytics_response = requests.get(
            "https://analytics.platform.com/v1/analytics/summary",
            params={"device_id": sensor_data['device_id']}
        )
        assert analytics_response.status_code == 200
```

### Performance Integration Testing

**System Load Testing**:
```python
import asyncio
import aiohttp
import time
from concurrent.futures import ThreadPoolExecutor

class TestSystemPerformance:
    async def simulate_sensor_load(self, session, device_id, duration_seconds):
        """Simulate continuous sensor data from a device"""
        start_time = time.time()
        requests_sent = 0
        
        while time.time() - start_time < duration_seconds:
            sensor_data = {
                "device_id": device_id,
                "timestamp": datetime.utcnow().isoformat(),
                "sensor_data": {
                    "temperature": {"value": random.uniform(20, 30)},
                    "humidity": {"value": random.uniform(40, 80)}
                }
            }
            
            async with session.post(
                "https://api.platform.com/v1/data/ingest",
                json=sensor_data,
                headers={"Authorization": "Bearer test_api_key"}
            ) as response:
                if response.status == 200:
                    requests_sent += 1
                
            await asyncio.sleep(1)  # 1 Hz data rate
        
        return requests_sent
    
    async def test_high_load_scenario(self):
        """Test system under high load with multiple concurrent devices"""
        device_count = 100
        test_duration = 300  # 5 minutes
        
        async with aiohttp.ClientSession() as session:
            # Create tasks for simulating multiple devices
            tasks = [
                self.simulate_sensor_load(session, f"load_test_{i}", test_duration)
                for i in range(device_count)
            ]
            
            # Run all simulations concurrently
            results = await asyncio.gather(*tasks)
            
            total_requests = sum(results)
            expected_requests = device_count * test_duration  # 1 Hz per device
            
            # Verify system handled the load adequately
            success_rate = total_requests / expected_requests
            assert success_rate > 0.95  # 95% success rate minimum
            
            print(f"Load test: {total_requests}/{expected_requests} "
                  f"requests successful ({success_rate:.2%})")
```

## Continuous Integration Testing

### Automated Test Pipeline

**GitHub Actions Workflow**:
```yaml
name: Comprehensive Testing Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  hardware-simulation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Arduino CLI
        uses: arduino/setup-arduino-cli@v1
        
      - name: Install dependencies
        run: |
          arduino-cli core install esp32:esp32
          arduino-cli lib install "DHT sensor library"
          
      - name: Compile hardware code
        run: |
          arduino-cli compile --fqbn esp32:esp32:esp32 hardware/sensor_node
          
      - name: Run hardware unit tests
        run: |
          # Run Arduino unit tests in simulation
          python tests/hardware/test_runner.py

  cloud-services:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-test.txt
          
      - name: Run unit tests
        run: pytest tests/unit/ -v --cov=src/
        
      - name: Run integration tests
        run: pytest tests/integration/ -v
        env:
          DATABASE_URL: postgresql://postgres:test@localhost/test
          REDIS_URL: redis://localhost:6379
          
      - name: Run API tests
        run: pytest tests/api/ -v

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend
        
      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false
        working-directory: ./frontend
        
      - name: Run E2E tests
        run: |
          npm run build
          npm run start:test &
          npx wait-on http://localhost:3000
          npx cypress run
        working-directory: ./frontend

  performance:
    runs-on: ubuntu-latest
    needs: [cloud-services, frontend]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          
      - name: Install Locust
        run: pip install locust
        
      - name: Run load tests
        run: |
          locust -f tests/performance/locustfile.py \
                 --headless \
                 --users 100 \
                 --spawn-rate 10 \
                 --run-time 5m \
                 --host https://api-staging.platform.com

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security scan
        uses: securecodewarrior/github-action-add-sarif@v1
        with:
          sarif-file: 'security-scan-results.sarif'
          
      - name: OWASP ZAP Scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          target: 'https://staging.platform.com'
```

## Test Data Management

### Test Data Generation

**Synthetic Sensor Data Generator**:
```python
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

class SensorDataGenerator:
    def __init__(self, device_id):
        self.device_id = device_id
        
    def generate_temperature_series(self, start_time, duration_hours, frequency='H'):
        """Generate realistic temperature data with daily and seasonal patterns"""
        timestamps = pd.date_range(start_time, periods=duration_hours, freq=frequency)
        
        # Base temperature
        base_temp = 20
        
        # Daily temperature variation (sinusoidal)
        daily_cycle = 5 * np.sin(2 * np.pi * np.arange(len(timestamps)) / 24)
        
        # Seasonal variation (simplified)
        day_of_year = timestamps.dayofyear
        seasonal_cycle = 10 * np.sin(2 * np.pi * day_of_year / 365)
        
        # Random noise
        noise = np.random.normal(0, 1, len(timestamps))
        
        temperature = base_temp + daily_cycle + seasonal_cycle + noise
        
        return pd.DataFrame({
            'device_id': self.device_id,
            'timestamp': timestamps,
            'temperature': temperature,
            'quality': 'good'
        })
    
    def generate_anomalous_data(self, normal_data, anomaly_percentage=0.05):
        """Inject anomalies into normal data for testing anomaly detection"""
        anomalous_data = normal_data.copy()
        n_anomalies = int(len(normal_data) * anomaly_percentage)
        
        # Random anomaly indices
        anomaly_indices = np.random.choice(len(normal_data), n_anomalies, replace=False)
        
        for idx in anomaly_indices:
            # Create different types of anomalies
            anomaly_type = np.random.choice(['spike', 'drift', 'noise'])
            
            if anomaly_type == 'spike':
                # Temperature spike
                anomalous_data.loc[idx, 'temperature'] += np.random.uniform(10, 20)
            elif anomaly_type == 'drift':
                # Gradual drift
                drift_length = min(10, len(normal_data) - idx)
                drift_values = np.linspace(0, 15, drift_length)
                end_idx = idx + drift_length
                anomalous_data.loc[idx:end_idx, 'temperature'] += drift_values
            elif anomaly_type == 'noise':
                # High noise period
                noise_length = min(5, len(normal_data) - idx)
                end_idx = idx + noise_length
                anomalous_data.loc[idx:end_idx, 'temperature'] += np.random.normal(0, 5, noise_length)
            
            anomalous_data.loc[idx, 'quality'] = 'anomalous'
        
        return anomalous_data
```

### Test Environment Management

**Docker Test Environment**:
```yaml
version: '3.8'
services:
  test-database:
    image: postgres:13
    environment:
      POSTGRES_DB: test_platform
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
    volumes:
      - ./test_data/sql:/docker-entrypoint-initdb.d

  test-redis:
    image: redis:6
    ports:
      - "6380:6379"

  test-api:
    build: ./cloud/api
    environment:
      DATABASE_URL: postgresql://test:test@test-database:5432/test_platform
      REDIS_URL: redis://test-redis:6379
      ENV: testing
    ports:
      - "8001:8000"
    depends_on:
      - test-database
      - test-redis

  test-frontend:
    build: ./frontend
    environment:
      REACT_APP_API_URL: http://test-api:8000
      NODE_ENV: test
    ports:
      - "3001:3000"
    depends_on:
      - test-api
```

## Quality Metrics and Reporting

### Test Coverage Requirements

**Coverage Targets by Phase**:
- **Hardware (Arduino/ESP32)**: 80% function coverage
- **Cloud Services (Python/Node.js)**: 90% line coverage
- **Frontend (React/JavaScript)**: 85% statement coverage
- **Integration Tests**: 100% critical path coverage

**Coverage Reporting**:
```python
# pytest configuration for coverage reporting
[tool:pytest]
addopts = 
    --cov=src
    --cov-report=html:htmlcov
    --cov-report=xml:coverage.xml
    --cov-report=term-missing
    --cov-fail-under=90
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

### Performance Benchmarks

**Benchmark Targets**:
```python
PERFORMANCE_BENCHMARKS = {
    'api_response_time': {
        'p50': 50,   # 50ms
        'p95': 200,  # 200ms
        'p99': 500   # 500ms
    },
    'database_query_time': {
        'simple_select': 10,    # 10ms
        'complex_aggregation': 100,  # 100ms
        'bulk_insert': 1000    # 1s for 1000 records
    },
    'frontend_load_time': {
        'first_contentful_paint': 1500,  # 1.5s
        'time_to_interactive': 3000      # 3s
    },
    'memory_usage': {
        'max_heap_size': 512 * 1024 * 1024,  # 512MB
        'memory_leak_threshold': 1024 * 1024  # 1MB/hour
    }
}
```

This comprehensive testing and validation strategy ensures the educational platform maintains high quality while effectively demonstrating both proper testing methodologies and common testing challenges in data science projects.
