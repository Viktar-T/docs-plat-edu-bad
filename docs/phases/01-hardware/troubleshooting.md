# Troubleshooting

## Overview

This comprehensive troubleshooting guide addresses common issues encountered during hardware development and deployment. Each section includes problem identification, diagnosis procedures, and step-by-step solutions.

## Power-Related Issues

### Device Won't Start

#### Symptoms
- No LED indicators
- No serial output
- Complete system unresponsive
- Immediate shutdown after power-on

#### Diagnostic Steps

**Step 1: Voltage Verification**
```bash
# Use multimeter to check voltage levels
1. Measure battery voltage (should be &gt;3.0V for Li-ion)
2. Check regulator input voltage
3. Verify 3.3V rail output
4. Test voltage under load
```

**Step 2: Current Draw Analysis**
```cpp
// Monitor current consumption
void measureCurrentDraw() {
  float current_mA = ina219.getCurrent_mA();
  float power_mW = ina219.getPower_mW();
  
  Serial.printf("Current: %.2f mA, Power: %.2f mW\n", 
                current_mA, power_mW);
  
  if (current_mA > NORMAL_CURRENT_THRESHOLD) {
    Serial.println("WARNING: High current draw detected");
    // Check for short circuits
  }
}
```

#### Common Causes and Solutions

**Cause 1: Dead Battery**
```cpp
// Battery voltage monitoring
float checkBatteryVoltage() {
  float voltage = analogRead(BATTERY_PIN) * (3.3 / 4095.0) * 2.0;
  
  if (voltage < 3.0) {
    Serial.println("ERROR: Battery voltage too low");
    return false;
  }
  
  return true;
}

// Solution: Replace or recharge battery
void handleLowBattery() {
  // Enter deep sleep to preserve remaining power
  esp_sleep_enable_timer_wakeup(3600 * 1000000); // 1 hour
  esp_deep_sleep_start();
}
```

**Cause 2: Incorrect Wiring**
- Check power supply polarity
- Verify ground connections
- Ensure proper voltage levels (3.3V vs 5V)
- Test continuity with multimeter

**Cause 3: Regulator Failure**
```cpp
// Voltage regulator testing
void testVoltageRegulator() {
  float inputVoltage = measureRegulatorInput();
  float outputVoltage = measureRegulatorOutput();
  
  Serial.printf("Regulator: In=%.2fV, Out=%.2fV\n", 
                inputVoltage, outputVoltage);
  
  if (inputVoltage > 4.0 && outputVoltage < 3.0) {
    Serial.println("ERROR: Voltage regulator failure");
    // Replace regulator or check thermal protection
  }
}
```

### Random Resets and Brownouts

#### Symptoms
- Device restarts unexpectedly
- ESP32 brownout detector messages
- Intermittent operation
- Lost network connections

#### Diagnostic Code
```cpp
#include "esp_system.h"

void setup() {
  Serial.begin(115200);
  
  // Check reset reason
  esp_reset_reason_t reset_reason = esp_reset_reason();
  switch (reset_reason) {
    case ESP_RST_POWERON:
      Serial.println("Reset: Power-on");
      break;
    case ESP_RST_BROWNOUT:
      Serial.println("Reset: Brownout detected");
      break;
    case ESP_RST_SW:
      Serial.println("Reset: Software reset");
      break;
    case ESP_RST_PANIC:
      Serial.println("Reset: Panic/Exception");
      break;
    default:
      Serial.printf("Reset: Unknown (%d)\n", reset_reason);
  }
}
```

#### Solutions

**Add Power Supply Capacitance**
```
Power Supply Filtering:

Battery → [1000µF] → Regulator → [100µF] → [10µF] → MCU
                                    |         |
                                   GND      GND

Component Selection:
- 1000µF electrolytic for battery buffering
- 100µF tantalum for regulator output
- 10µF ceramic for high-frequency filtering
```

**Reduce Power Consumption**
```cpp
// Power optimization
void optimizePowerConsumption() {
  // Reduce CPU frequency
  setCpuFrequencyMhz(80); // Down from 240MHz
  
  // Disable unused peripherals
  adc_power_release();
  
  // Use light sleep when idle
  esp_sleep_enable_timer_wakeup(1000000); // 1 second
  esp_light_sleep_start();
}
```

## Communication Problems

### WiFi Connection Issues

#### Symptoms
- Unable to connect to WiFi
- Frequent disconnections
- Poor signal strength
- Slow data transmission

#### Diagnostic Tools
```cpp
void diagnoseWiFiIssues() {
  // Signal strength analysis
  int rssi = WiFi.RSSI();
  Serial.printf("WiFi RSSI: %d dBm\n", rssi);
  
  if (rssi < -70) {
    Serial.println("WARNING: Weak WiFi signal");
  }
  
  // Network scan
  int networks = WiFi.scanNetworks();
  for (int i = 0; i < networks; i++) {
    Serial.printf("Network %d: %s (RSSI: %d)\n", 
                  i, WiFi.SSID(i).c_str(), WiFi.RSSI(i));
  }
  
  // Connection status
  wl_status_t status = WiFi.status();
  switch (status) {
    case WL_CONNECTED:
      Serial.println("WiFi: Connected");
      break;
    case WL_NO_SSID_AVAIL:
      Serial.println("WiFi: Network not found");
      break;
    case WL_CONNECT_FAILED:
      Serial.println("WiFi: Connection failed");
      break;
    default:
      Serial.printf("WiFi: Status %d\n", status);
  }
}
```

#### Solutions

**Improve Signal Strength**
```cpp
// Antenna optimization
void optimizeWiFiAntenna() {
  // Use external antenna if available
  WiFi.setTxPower(WIFI_POWER_19_5dBm); // Maximum power
  
  // Position device optimally
  // - Away from metal objects
  // - Clear line of sight to router
  // - Minimize interference sources
}
```

**Implement Robust Connection Handling**
```cpp
class WiFiManager {
private:
  unsigned long lastConnectionAttempt = 0;
  const unsigned long CONNECTION_TIMEOUT = 30000;
  
public:
  bool ensureConnection() {
    if (WiFi.status() == WL_CONNECTED) {
      return true;
    }
    
    if (millis() - lastConnectionAttempt < CONNECTION_TIMEOUT) {
      return false; // Too soon to retry
    }
    
    Serial.println("Attempting WiFi reconnection...");
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    lastConnectionAttempt = millis();
    
    // Wait for connection with timeout
    unsigned long startTime = millis();
    while (WiFi.status() != WL_CONNECTED && 
           millis() - startTime < 10000) {
      delay(500);
      Serial.print(".");
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nWiFi reconnected!");
      return true;
    } else {
      Serial.println("\nWiFi reconnection failed");
      return false;
    }
  }
};
```

### I2C Communication Failures

#### Symptoms
- "Device not found" errors
- Intermittent sensor readings
- I2C bus lockup
- Address conflicts

#### I2C Scanner Tool
```cpp
void scanI2CDevices() {
  Serial.println("Scanning I2C bus...");
  
  int deviceCount = 0;
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    byte error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.printf("I2C device found at address 0x%02X\n", address);
      deviceCount++;
    }
  }
  
  if (deviceCount == 0) {
    Serial.println("No I2C devices found");
  } else {
    Serial.printf("Found %d I2C devices\n", deviceCount);
  }
}
```

#### Common I2C Problems and Solutions

**Problem 1: Missing Pull-up Resistors**
```cpp
// Check for pull-up resistors
void checkI2CPullups() {
  // Read logic levels on I2C lines
  pinMode(SDA_PIN, INPUT);
  pinMode(SCL_PIN, INPUT);
  
  int sdaLevel = digitalRead(SDA_PIN);
  int sclLevel = digitalRead(SCL_PIN);
  
  if (sdaLevel == LOW || sclLevel == LOW) {
    Serial.println("ERROR: I2C lines not pulled up properly");
    Serial.println("Add 4.7kΩ resistors from SDA/SCL to 3.3V");
  }
}
```

**Problem 2: Bus Lockup Recovery**
```cpp
void recoverI2CBus() {
  Serial.println("Attempting I2C bus recovery...");
  
  // Manual clock generation to unlock bus
  pinMode(SCL_PIN, OUTPUT);
  pinMode(SDA_PIN, INPUT_PULLUP);
  
  // Generate 9 clock pulses
  for (int i = 0; i < 9; i++) {
    digitalWrite(SCL_PIN, HIGH);
    delayMicroseconds(5);
    digitalWrite(SCL_PIN, LOW);
    delayMicroseconds(5);
  }
  
  // Reinitialize I2C
  Wire.end();
  Wire.begin();
  
  Serial.println("I2C bus recovery completed");
}
```

**Problem 3: Address Conflicts**
```cpp
// Device address configuration
struct I2CDevice {
  const char* name;
  uint8_t address;
  bool configurable;
};

I2CDevice devices[] = {
  {"MPU6050", 0x68, true},   // AD0 pin controls address
  {"BMP280", 0x76, true},    // SDO pin controls address
  {"INA219", 0x40, true},    // A0,A1 pins control address
  {"OLED", 0x3C, false}      // Fixed address
};

void configureI2CAddresses() {
  // Configure devices to avoid conflicts
  // MPU6050: AD0 = GND (0x68)
  // BMP280: SDO = GND (0x76)  
  // INA219: A0=A1=GND (0x40)
}
```

## Sensor-Specific Issues

### Temperature Sensor Problems

#### DHT22 Issues

**Symptom**: Reading NaN values
```cpp
void troubleshootDHT22() {
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (isnan(temp) || isnan(humidity)) {
    Serial.println("DHT22 Error Diagnosis:");
    
    // Check timing
    Serial.println("1. Checking timing requirements...");
    if (millis() - lastDHTRead < 2000) {
      Serial.println("   ERROR: Reading too frequent (min 2 seconds)");
    }
    
    // Check wiring
    Serial.println("2. Check wiring:");
    Serial.println("   - VCC to 3.3V");
    Serial.println("   - DATA to GPIO4 with 10kΩ pull-up");
    Serial.println("   - GND to ground");
    
    // Check power
    Serial.println("3. Verify power supply stability");
    
    // Test with different sensor
    Serial.println("4. Try different DHT22 sensor");
  }
}
```

**Solution**: Implement Robust Reading
```cpp
class RobustDHT22 {
private:
  DHT dht;
  unsigned long lastRead = 0;
  float lastValidTemp = NAN;
  float lastValidHumidity = NAN;
  
public:
  RobustDHT22(int pin) : dht(pin, DHT22) {}
  
  bool readSensor(float& temperature, float& humidity) {
    // Respect minimum reading interval
    if (millis() - lastRead < 2000) {
      temperature = lastValidTemp;
      humidity = lastValidHumidity;
      return !isnan(temperature);
    }
    
    // Attempt reading with retries
    for (int attempt = 0; attempt < 3; attempt++) {
      float temp = dht.readTemperature();
      float hum = dht.readHumidity();
      
      if (!isnan(temp) && !isnan(hum)) {
        temperature = temp;
        humidity = hum;
        lastValidTemp = temp;
        lastValidHumidity = hum;
        lastRead = millis();
        return true;
      }
      
      delay(100); // Brief delay before retry
    }
    
    // Use last valid readings if available
    temperature = lastValidTemp;
    humidity = lastValidHumidity;
    return !isnan(temperature);
  }
};
```

### Pressure Sensor Issues

#### BMP280 Calibration Problems
```cpp
void troubleshootBMP280() {
  if (!bmp.begin()) {
    Serial.println("BMP280 Error Diagnosis:");
    
    // Check I2C address
    Serial.println("1. Checking I2C address...");
    scanI2CDevices(); // Look for device
    
    // Try alternative address
    if (!bmp.begin(0x77)) {
      Serial.println("   Trying address 0x77...");
      if (!bmp.begin(0x76)) {
        Serial.println("   ERROR: Device not found at either address");
      }
    }
    
    // Check wiring
    Serial.println("2. Verify I2C wiring:");
    Serial.println("   - VCC to 3.3V");
    Serial.println("   - SCL to GPIO22");
    Serial.println("   - SDA to GPIO21");
    Serial.println("   - Pull-up resistors present");
  }
}
```

### IMU Sensor Issues

#### MPU6050 Calibration
```cpp
void calibrateMPU6050() {
  Serial.println("Calibrating MPU6050...");
  Serial.println("Keep device completely still");
  
  long accelX_sum = 0, accelY_sum = 0, accelZ_sum = 0;
  long gyroX_sum = 0, gyroY_sum = 0, gyroZ_sum = 0;
  
  const int samples = 1000;
  
  for (int i = 0; i < samples; i++) {
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    
    accelX_sum += ax;
    accelY_sum += ay;
    accelZ_sum += az;
    gyroX_sum += gx;
    gyroY_sum += gy;
    gyroZ_sum += gz;
    
    delay(2);
  }
  
  // Calculate offsets
  accelX_offset = accelX_sum / samples;
  accelY_offset = accelY_sum / samples;
  accelZ_offset = (accelZ_sum / samples) - 16384; // Account for gravity
  gyroX_offset = gyroX_sum / samples;
  gyroY_offset = gyroY_sum / samples;
  gyroZ_offset = gyroZ_sum / samples;
  
  Serial.println("Calibration complete");
  Serial.printf("Accel offsets: %ld, %ld, %ld\n", 
                accelX_offset, accelY_offset, accelZ_offset);
  Serial.printf("Gyro offsets: %ld, %ld, %ld\n", 
                gyroX_offset, gyroY_offset, gyroZ_offset);
}
```

## Data Quality Issues

### Invalid Readings

#### Range Validation
```cpp
struct SensorLimits {
  float min_value;
  float max_value;
  const char* unit;
};

SensorLimits temperatureLimits = {-40.0, 85.0, "°C"};
SensorLimits humidityLimits = {0.0, 100.0, "%"};
SensorLimits pressureLimits = {300.0, 1100.0, "hPa"};

bool validateReading(float value, SensorLimits limits) {
  if (isnan(value)) {
    Serial.printf("ERROR: NaN reading for %s sensor\n", limits.unit);
    return false;
  }
  
  if (value < limits.min_value || value > limits.max_value) {
    Serial.printf("ERROR: Reading %.2f %s out of range [%.2f, %.2f]\n",
                  value, limits.unit, limits.min_value, limits.max_value);
    return false;
  }
  
  return true;
}
```

#### Statistical Outlier Detection
```cpp
class OutlierDetector {
private:
  float readings[10];
  int index = 0;
  int count = 0;
  
public:
  bool isOutlier(float newReading) {
    if (count < 10) {
      readings[index] = newReading;
      index = (index + 1) % 10;
      count++;
      return false; // Not enough data yet
    }
    
    // Calculate mean and standard deviation
    float sum = 0;
    for (int i = 0; i < 10; i++) {
      sum += readings[i];
    }
    float mean = sum / 10;
    
    float variance = 0;
    for (int i = 0; i < 10; i++) {
      float diff = readings[i] - mean;
      variance += diff * diff;
    }
    float stddev = sqrt(variance / 9);
    
    // Check if new reading is more than 3 standard deviations away
    float zScore = abs(newReading - mean) / stddev;
    
    if (zScore > 3.0) {
      Serial.printf("Outlier detected: %.2f (z-score: %.2f)\n", 
                    newReading, zScore);
      return true;
    }
    
    // Add to rolling window
    readings[index] = newReading;
    index = (index + 1) % 10;
    
    return false;
  }
};
```

### Data Transmission Errors

#### Network Error Handling
```cpp
class DataTransmitter {
private:
  struct DataBuffer {
    String timestamp;
    String sensorData;
    int retryCount;
  };
  
  std::vector<DataBuffer> pendingData;
  
public:
  void sendData(String data) {
    DataBuffer buffer;
    buffer.timestamp = getCurrentTimestamp();
    buffer.sensorData = data;
    buffer.retryCount = 0;
    
    if (transmitNow(buffer)) {
      Serial.println("Data transmitted successfully");
    } else {
      pendingData.push_back(buffer);
      Serial.println("Data queued for retry");
    }
  }
  
  void processRetries() {
    auto it = pendingData.begin();
    while (it != pendingData.end()) {
      if (transmitNow(*it)) {
        Serial.printf("Retry successful for data from %s\n", 
                      it->timestamp.c_str());
        it = pendingData.erase(it);
      } else {
        it->retryCount++;
        if (it->retryCount > MAX_RETRIES) {
          Serial.printf("Dropping data from %s after %d retries\n",
                        it->timestamp.c_str(), MAX_RETRIES);
          it = pendingData.erase(it);
        } else {
          ++it;
        }
      }
    }
  }
  
private:
  bool transmitNow(const DataBuffer& data) {
    if (WiFi.status() != WL_CONNECTED) {
      return false;
    }
    
    HTTPClient http;
    http.begin("https://api.example.com/data");
    http.addHeader("Content-Type", "application/json");
    
    int httpCode = http.POST(data.sensorData);
    http.end();
    
    return (httpCode >= 200 && httpCode < 300);
  }
};
```

## Performance Issues

### Memory Problems

#### Memory Monitoring
```cpp
void monitorMemory() {
  size_t freeHeap = ESP.getFreeHeap();
  size_t minFreeHeap = ESP.getMinFreeHeap();
  size_t maxAllocHeap = ESP.getMaxAllocHeap();
  
  Serial.printf("Memory - Free: %d, Min Free: %d, Max Alloc: %d\n",
                freeHeap, minFreeHeap, maxAllocHeap);
  
  if (freeHeap < 10000) {
    Serial.println("WARNING: Low memory condition");
    // Trigger garbage collection or data cleanup
  }
}
```

#### Memory Leak Detection
```cpp
class MemoryTracker {
private:
  size_t baselineMemory;
  unsigned long lastCheck;
  
public:
  void setBaseline() {
    baselineMemory = ESP.getFreeHeap();
    lastCheck = millis();
  }
  
  void checkForLeaks() {
    if (millis() - lastCheck > 60000) { // Check every minute
      size_t currentMemory = ESP.getFreeHeap();
      
      if (currentMemory < baselineMemory - 1000) {
        Serial.printf("Potential memory leak: Lost %d bytes\n",
                      baselineMemory - currentMemory);
      }
      
      lastCheck = millis();
    }
  }
};
```

### Timing Issues

#### Watchdog Timer Problems
```cpp
#include "esp_task_wdt.h"

void setupWatchdog() {
  // Configure watchdog timer
  esp_task_wdt_init(30, true); // 30 second timeout
  esp_task_wdt_add(NULL); // Add current task
}

void handleLongOperation() {
  Serial.println("Starting long operation...");
  
  for (int i = 0; i < 1000; i++) {
    // Do work
    processData();
    
    // Feed watchdog periodically
    if (i % 100 == 0) {
      esp_task_wdt_reset();
    }
  }
  
  Serial.println("Long operation completed");
}
```

## Diagnostic Tools and Utilities

### Comprehensive System Check
```cpp
void performSystemDiagnostic() {
  Serial.println("=== SYSTEM DIAGNOSTIC ===");
  
  // 1. Power system
  Serial.println("1. Power System:");
  float batteryVoltage = readBatteryVoltage();
  Serial.printf("   Battery: %.2fV\n", batteryVoltage);
  
  // 2. Communication
  Serial.println("2. Communication:");
  Serial.printf("   WiFi: %s (RSSI: %d dBm)\n", 
                WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected",
                WiFi.RSSI());
  
  // 3. Sensors
  Serial.println("3. Sensors:");
  scanI2CDevices();
  testAllSensors();
  
  // 4. Memory
  Serial.println("4. Memory:");
  monitorMemory();
  
  // 5. Storage
  Serial.println("5. Storage:");
  Serial.printf("   SPIFFS: %d/%d bytes used\n", 
                SPIFFS.usedBytes(), SPIFFS.totalBytes());
  
  Serial.println("=== DIAGNOSTIC COMPLETE ===");
}

bool testAllSensors() {
  bool allPassed = true;
  
  // Test DHT22
  float temp, humidity;
  if (dht.read()) {
    Serial.println("   DHT22: OK");
  } else {
    Serial.println("   DHT22: FAILED");
    allPassed = false;
  }
  
  // Test BMP280
  if (bmp.readTemperature() != NAN) {
    Serial.println("   BMP280: OK");
  } else {
    Serial.println("   BMP280: FAILED");
    allPassed = false;
  }
  
  // Test MPU6050
  if (mpu.testConnection()) {
    Serial.println("   MPU6050: OK");
  } else {
    Serial.println("   MPU6050: FAILED");
    allPassed = false;
  }
  
  return allPassed;
}
```

### Remote Diagnostics
```cpp
void sendDiagnosticReport() {
  String report = "{";
  report += "\"timestamp\":\"" + getCurrentTimestamp() + "\",";
  report += "\"device_id\":\"" + String(ESP.getEfuseMac()) + "\",";
  report += "\"battery_voltage\":" + String(readBatteryVoltage()) + ",";
  report += "\"wifi_rssi\":" + String(WiFi.RSSI()) + ",";
  report += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
  report += "\"uptime_ms\":" + String(millis()) + ",";
  report += "\"reset_reason\":" + String(esp_reset_reason());
  report += "}";
  
  // Send to remote diagnostic server
  HTTPClient http;
  http.begin("https://diagnostics.example.com/report");
  http.addHeader("Content-Type", "application/json");
  http.POST(report);
  http.end();
}
```

## Emergency Recovery Procedures

### Factory Reset
```cpp
void performFactoryReset() {
  Serial.println("Performing factory reset...");
  
  // Clear stored preferences
  preferences.clear();
  
  // Format SPIFFS
  SPIFFS.format();
  
  // Reset WiFi settings
  WiFi.disconnect(true, true);
  
  // Clear calibration data
  clearAllCalibration();
  
  Serial.println("Factory reset complete. Restarting...");
  ESP.restart();
}
```

### Safe Mode Boot
```cpp
void checkSafeModePin() {
  pinMode(SAFE_MODE_PIN, INPUT_PULLUP);
  
  if (digitalRead(SAFE_MODE_PIN) == LOW) {
    Serial.println("Safe mode activated");
    
    // Minimal functionality mode
    // - No WiFi connection attempts
    // - Basic sensor readings only
    // - No complex operations
    // - Extended diagnostic output
    
    while (true) {
      performBasicSensorTest();
      Serial.println("Safe mode - press reset to exit");
      delay(5000);
    }
  }
}
```

This comprehensive troubleshooting guide provides systematic approaches to identify, diagnose, and resolve hardware-related issues, ensuring reliable operation of the educational data science platform.
