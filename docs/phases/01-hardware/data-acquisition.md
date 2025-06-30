# Data Acquisition

## Overview

Data acquisition is the foundation of any data science project. This section demonstrates proper methodologies for collecting, validating, and preprocessing sensor data, while highlighting common pitfalls that can compromise data quality.

## Data Acquisition Architecture

### System Components

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Sensors   │───▶│  Acquisition│───▶│    Local    │───▶│ Transmission│
│             │    │   System    │    │   Storage   │    │   System    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
  Physical         Analog/Digital     Data Buffer      Cloud/Remote
  Phenomena        Conversion &       & Validation     Storage
                   Processing
```

### Data Flow Pipeline

1. **Signal Acquisition**: Raw sensor readings
2. **Signal Conditioning**: Filtering and amplification
3. **Analog-to-Digital Conversion**: Digitization
4. **Data Validation**: Quality checks and error detection
5. **Local Processing**: Edge computing and preprocessing
6. **Data Storage**: Local buffering and archiving
7. **Data Transmission**: Upload to cloud systems

## Sampling Strategies

### Temporal Sampling

#### Fixed Interval Sampling
```cpp
// Example: Sample every 5 seconds
const unsigned long SAMPLE_INTERVAL = 5000; // milliseconds
unsigned long lastSample = 0;

void loop() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastSample >= SAMPLE_INTERVAL) {
    collectSensorData();
    lastSample = currentTime;
  }
}
```

**Advantages:**
- Predictable data volume
- Simple implementation
- Consistent timing

**Disadvantages:**
- May miss rapid changes
- Fixed resource usage
- Potentially inefficient

#### Event-Driven Sampling
```cpp
// Example: Sample on significant change
float lastTemperature = 0;
const float THRESHOLD = 0.5; // degrees

void loop() {
  float currentTemp = readTemperature();
  
  if (abs(currentTemp - lastTemperature) > THRESHOLD) {
    logData(currentTemp);
    lastTemperature = currentTemp;
  }
}
```

**Advantages:**
- Captures important events
- Efficient resource usage
- Adaptive to conditions

**Disadvantages:**
- Variable data volume
- Complex implementation
- May miss gradual changes

#### Adaptive Sampling
```cpp
// Dynamic sampling based on conditions
unsigned long getSamplingInterval() {
  float variance = calculateVariance();
  
  if (variance > HIGH_VARIANCE_THRESHOLD) {
    return FAST_SAMPLING_RATE;
  } else if (variance < LOW_VARIANCE_THRESHOLD) {
    return SLOW_SAMPLING_RATE;
  } else {
    return NORMAL_SAMPLING_RATE;
  }
}
```

### Spatial Sampling

#### Multi-Sensor Arrays
- Synchronized sampling across sensors
- Spatial correlation analysis
- Redundancy for reliability
- Cross-validation between sensors

#### Sensor Placement Strategies
- Environmental coverage optimization
- Interference minimization
- Maintenance accessibility
- Power and communication constraints

## Data Quality Assurance

### Validation Techniques

#### Range Checking
```cpp
bool validateTemperature(float temp) {
  const float MIN_TEMP = -40.0;
  const float MAX_TEMP = 85.0;
  
  return (temp >= MIN_TEMP && temp <= MAX_TEMP);
}
```

#### Rate of Change Validation
```cpp
bool validateRateOfChange(float current, float previous, float maxRate) {
  float changeRate = abs(current - previous);
  return (changeRate <= maxRate);
}
```

#### Statistical Validation
```cpp
bool validateStatistically(float value, float mean, float stdDev) {
  float zScore = abs(value - mean) / stdDev;
  return (zScore <= 3.0); // 99.7% within 3 standard deviations
}
```

### Error Detection and Handling

#### Sensor Failure Detection
```cpp
enum SensorStatus {
  SENSOR_OK,
  SENSOR_WARNING,
  SENSOR_ERROR,
  SENSOR_OFFLINE
};

SensorStatus checkSensorHealth(int sensorId) {
  // Check communication
  if (!sensor.isResponding()) {
    return SENSOR_OFFLINE;
  }
  
  // Check self-test
  if (!sensor.selfTest()) {
    return SENSOR_ERROR;
  }
  
  // Check data validity
  if (sensor.getErrorCount() > ERROR_THRESHOLD) {
    return SENSOR_WARNING;
  }
  
  return SENSOR_OK;
}
```

#### Data Recovery Strategies
```cpp
float getReliableReading(Sensor* sensors[], int count) {
  vector<float> validReadings;
  
  for (int i = 0; i < count; i++) {
    if (sensors[i]->isHealthy()) {
      float reading = sensors[i]->read();
      if (validateReading(reading)) {
        validReadings.push_back(reading);
      }
    }
  }
  
  if (validReadings.size() >= MINIMUM_SENSORS) {
    return calculateMedian(validReadings);
  } else {
    return USE_FALLBACK_VALUE;
  }
}
```

## Data Preprocessing

### Filtering Techniques

#### Moving Average Filter
```cpp
class MovingAverageFilter {
private:
  float buffer[WINDOW_SIZE];
  int index;
  int count;
  float sum;

public:
  float filter(float input) {
    // Remove old value
    sum -= buffer[index];
    
    // Add new value
    buffer[index] = input;
    sum += input;
    
    // Update counters
    index = (index + 1) % WINDOW_SIZE;
    if (count < WINDOW_SIZE) count++;
    
    return sum / count;
  }
};
```

#### Exponential Moving Average
```cpp
class ExponentialFilter {
private:
  float alpha;
  float filteredValue;
  bool initialized;

public:
  ExponentialFilter(float smoothingFactor) : alpha(smoothingFactor) {
    initialized = false;
  }
  
  float filter(float input) {
    if (!initialized) {
      filteredValue = input;
      initialized = true;
    } else {
      filteredValue = alpha * input + (1 - alpha) * filteredValue;
    }
    return filteredValue;
  }
};
```

### Calibration Procedures

#### Single-Point Calibration
```cpp
float calibrateOffset(float rawValue, float referenceValue) {
  return referenceValue - rawValue;
}

float applyCalibrateOffset(float rawValue, float offset) {
  return rawValue + offset;
}
```

#### Two-Point Calibration
```cpp
struct CalibrationData {
  float rawLow, rawHigh;
  float refLow, refHigh;
  float slope, offset;
};

void calculateCalibration(CalibrationData& cal) {
  cal.slope = (cal.refHigh - cal.refLow) / (cal.rawHigh - cal.rawLow);
  cal.offset = cal.refLow - cal.slope * cal.rawLow;
}

float applyCalibration(float rawValue, const CalibrationData& cal) {
  return cal.slope * rawValue + cal.offset;
}
```

## Data Formats and Standards

### JSON Data Format
```json
{
  "timestamp": "2025-06-29T10:30:00Z",
  "device_id": "sensor_001",
  "location": {
    "latitude": 53.4285,
    "longitude": 14.5528
  },
  "sensors": {
    "temperature": {
      "value": 23.5,
      "unit": "celsius",
      "quality": "good"
    },
    "humidity": {
      "value": 65.2,
      "unit": "percent",
      "quality": "good"
    }
  },
  "metadata": {
    "battery_level": 85,
    "signal_strength": -45,
    "firmware_version": "1.2.3"
  }
}
```

### CSV Data Format
```csv
timestamp,device_id,temperature,humidity,pressure,battery_level,quality_flags
2025-06-29T10:30:00Z,sensor_001,23.5,65.2,1013.25,85,0
2025-06-29T10:31:00Z,sensor_001,23.6,65.1,1013.28,85,0
```

### Binary Data Format
```cpp
struct SensorData {
  uint32_t timestamp;      // Unix timestamp
  uint16_t device_id;      // Device identifier
  int16_t temperature;     // Temperature * 100 (for 0.01°C precision)
  uint16_t humidity;       // Humidity * 100 (for 0.01% precision)
  uint32_t pressure;       // Pressure * 100 (for 0.01 hPa precision)
  uint8_t battery_level;   // Battery percentage
  uint8_t quality_flags;   // Data quality indicators
};
```

## Storage Strategies

### Local Storage Implementation

#### Ring Buffer for Continuous Data
```cpp
class RingBuffer {
private:
  SensorData* buffer;
  int capacity;
  int head, tail, count;

public:
  bool push(const SensorData& data) {
    if (count >= capacity) {
      // Overwrite oldest data
      tail = (tail + 1) % capacity;
      count--;
    }
    
    buffer[head] = data;
    head = (head + 1) % capacity;
    count++;
    return true;
  }
  
  bool pop(SensorData& data) {
    if (count == 0) return false;
    
    data = buffer[tail];
    tail = (tail + 1) % capacity;
    count--;
    return true;
  }
};
```

#### File-Based Storage
```cpp
void saveToFile(const SensorData& data) {
  File file = SPIFFS.open("/sensor_data.bin", "a");
  if (file) {
    file.write((uint8_t*)&data, sizeof(SensorData));
    file.close();
  }
}

bool loadFromFile(SensorData& data, int index) {
  File file = SPIFFS.open("/sensor_data.bin", "r");
  if (file) {
    file.seek(index * sizeof(SensorData));
    size_t bytesRead = file.read((uint8_t*)&data, sizeof(SensorData));
    file.close();
    return (bytesRead == sizeof(SensorData));
  }
  return false;
}
```

## Common Pitfalls and Solutions

### Pitfall 1: Inadequate Sampling Rate
**Problem**: Missing important events due to low sampling frequency

**Example of Bad Practice**:
```cpp
// Sampling temperature every 10 minutes
delay(600000); // 10 minutes
float temp = readTemperature();
```

**Good Practice**:
```cpp
// Adaptive sampling based on rate of change
if (abs(currentTemp - lastTemp) > CHANGE_THRESHOLD) {
  sampleInterval = FAST_INTERVAL;
} else {
  sampleInterval = NORMAL_INTERVAL;
}
```

### Pitfall 2: No Data Validation
**Problem**: Storing invalid or corrupted data

**Example of Bad Practice**:
```cpp
// No validation
float temp = sensor.readTemperature();
storeData(temp); // Could be NaN, out of range, etc.
```

**Good Practice**:
```cpp
float temp = sensor.readTemperature();
if (validateTemperature(temp) && rateOfChangeOk(temp)) {
  storeData(temp);
} else {
  logError("Invalid temperature reading");
  useBackupSensor();
}
```

### Pitfall 3: Ignoring Sensor Warm-up Time
**Problem**: Using readings before sensor stabilization

**Good Practice**:
```cpp
void initializeSensor() {
  sensor.powerOn();
  delay(sensor.getWarmupTime()); // Wait for stabilization
  
  // Discard first few readings
  for (int i = 0; i < 5; i++) {
    sensor.read();
    delay(100);
  }
}
```

### Pitfall 4: Poor Error Handling
**Problem**: System crashes on sensor failures

**Good Practice**:
```cpp
enum DataQuality {
  QUALITY_GOOD,
  QUALITY_QUESTIONABLE,
  QUALITY_BAD,
  QUALITY_MISSING
};

DataPoint readSensorSafely(int sensorId) {
  DataPoint result;
  result.timestamp = getCurrentTime();
  result.sensorId = sensorId;
  
  try {
    if (sensor.isHealthy()) {
      result.value = sensor.read();
      result.quality = validateReading(result.value) ? 
                      QUALITY_GOOD : QUALITY_QUESTIONABLE;
    } else {
      result.value = NAN;
      result.quality = QUALITY_BAD;
    }
  } catch (Exception& e) {
    result.value = NAN;
    result.quality = QUALITY_MISSING;
    logError("Sensor read failed: " + e.getMessage());
  }
  
  return result;
}
```

## Performance Optimization

### Memory Management
```cpp
// Use fixed-size buffers to avoid memory fragmentation
#define MAX_BUFFER_SIZE 1000
SensorData dataBuffer[MAX_BUFFER_SIZE];

// Implement memory pooling for dynamic allocations
class MemoryPool {
  // Implementation details...
};
```

### Power Optimization
```cpp
void optimizedDataCollection() {
  // Power on only necessary sensors
  environmentalSensor.powerOn();
  delay(WARMUP_TIME);
  
  // Collect data quickly
  SensorData data = collectAllSensors();
  
  // Power down sensors
  environmentalSensor.powerOff();
  
  // Process and store data
  processData(data);
  storeData(data);
}
```

### Communication Optimization
```cpp
void batchDataTransmission() {
  vector<SensorData> batch;
  
  // Collect data until batch is full or timeout
  while (batch.size() < BATCH_SIZE && !timeoutReached()) {
    if (dataAvailable()) {
      batch.push_back(readDataFromBuffer());
    }
  }
  
  // Transmit batch
  if (!batch.empty()) {
    transmitDataBatch(batch);
  }
}
```

## Testing and Validation Procedures

### Unit Testing
```cpp
// Test data validation functions
void testTemperatureValidation() {
  assert(validateTemperature(25.0) == true);   // Normal value
  assert(validateTemperature(-50.0) == false); // Below range
  assert(validateTemperature(100.0) == false); // Above range
  assert(validateTemperature(NAN) == false);   // Invalid value
}
```

### Integration Testing
```cpp
void testDataAcquisitionPipeline() {
  // Test complete data flow
  SensorData testData = generateTestData();
  
  // Verify acquisition
  bool acquired = acquireData(testData);
  assert(acquired == true);
  
  // Verify validation
  bool valid = validateData(testData);
  assert(valid == true);
  
  // Verify storage
  bool stored = storeData(testData);
  assert(stored == true);
  
  // Verify retrieval
  SensorData retrieved;
  bool retrieved_ok = retrieveData(retrieved, testData.id);
  assert(retrieved_ok == true);
  assert(dataEquals(testData, retrieved));
}
```

### Performance Testing
```cpp
void benchmarkAcquisitionRate() {
  unsigned long startTime = millis();
  int sampleCount = 0;
  
  while (millis() - startTime < 60000) { // 1 minute test
    collectSensorData();
    sampleCount++;
  }
  
  float samplesPerSecond = sampleCount / 60.0;
  Serial.printf("Acquisition rate: %.2f samples/second\n", samplesPerSecond);
}
```

## Monitoring and Diagnostics

### Real-time Monitoring
```cpp
void displaySystemStatus() {
  Serial.println("=== System Status ===");
  Serial.printf("Uptime: %lu minutes\n", millis() / 60000);
  Serial.printf("Free memory: %d bytes\n", ESP.getFreeHeap());
  Serial.printf("WiFi signal: %d dBm\n", WiFi.RSSI());
  Serial.printf("Battery level: %d%%\n", getBatteryLevel());
  Serial.printf("Samples collected: %d\n", getTotalSamples());
  Serial.printf("Transmission errors: %d\n", getTransmissionErrors());
}
```

### Data Quality Metrics
```cpp
struct QualityMetrics {
  float validDataPercentage;
  float averageLatency;
  int communicationErrors;
  int sensorErrors;
  float batteryEfficiency;
};

QualityMetrics calculateQualityMetrics() {
  QualityMetrics metrics;
  
  metrics.validDataPercentage = 
    (float)validSamples / totalSamples * 100.0;
  
  metrics.averageLatency = 
    totalLatency / transmissionCount;
  
  // ... calculate other metrics
  
  return metrics;
}
```

This comprehensive data acquisition system provides the foundation for reliable, high-quality data collection that supports the educational objectives of demonstrating both proper techniques and common pitfalls in data science implementations.
