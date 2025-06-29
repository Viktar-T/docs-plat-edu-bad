# Sensor Specifications

## Environmental Sensors

### DHT22 Temperature & Humidity Sensor

#### Technical Specifications
- **Temperature Range**: -40°C to +80°C
- **Temperature Accuracy**: ±0.5°C
- **Humidity Range**: 0-100% RH
- **Humidity Accuracy**: ±2-5% RH
- **Resolution**: 0.1°C, 0.1% RH
- **Operating Voltage**: 3.3-6V DC
- **Current Consumption**: 1-1.5mA (measuring), 40-50µA (standby)
- **Sampling Rate**: 0.5Hz (once every 2 seconds)
- **Interface**: Single-wire digital

#### Pin Configuration
1. **VDD**: Power supply (3.3V recommended)
2. **DATA**: Digital signal output
3. **NULL**: Not connected
4. **GND**: Ground

#### Implementation Notes
```cpp
#include <DHT.h>

#define DHT_PIN 4
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  dht.begin();
  // Allow sensor to stabilize
  delay(2000);
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  // Check for read failures
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  Serial.printf("Temperature: %.2f°C, Humidity: %.2f%%\n", 
                temperature, humidity);
  
  delay(2000); // Minimum delay between readings
}
```

#### Common Issues and Solutions
- **Reading NaN values**: Check wiring, power supply, and timing
- **Inconsistent readings**: Add pull-up resistor (10kΩ) to data line
- **Slow response**: Allow adequate warm-up time after power-on

### BMP280 Pressure Sensor

#### Technical Specifications
- **Pressure Range**: 300-1100 hPa
- **Pressure Accuracy**: ±1 hPa
- **Temperature Range**: -40°C to +85°C
- **Temperature Accuracy**: ±1°C
- **Resolution**: 0.01 hPa, 0.01°C
- **Operating Voltage**: 1.71-3.6V
- **Current Consumption**: 2.7µA (1Hz), 633µA (max performance)
- **Interface**: I2C (address 0x76 or 0x77), SPI

#### I2C Wiring
- **VCC**: 3.3V
- **GND**: Ground
- **SCL**: I2C Clock (GPIO22 on ESP32)
- **SDA**: I2C Data (GPIO21 on ESP32)
- **CSB**: Connect to VCC for I2C mode
- **SDO**: GND for address 0x76, VCC for 0x77

#### Implementation Example
```cpp
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  if (!bmp.begin(0x76)) {
    Serial.println("Could not find BMP280 sensor!");
    while (1);
  }
  
  // Configure sensor
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,
                  Adafruit_BMP280::SAMPLING_X2,  // Temperature
                  Adafruit_BMP280::SAMPLING_X16, // Pressure
                  Adafruit_BMP280::FILTER_X16,
                  Adafruit_BMP280::STANDBY_MS_500);
}

void loop() {
  float temperature = bmp.readTemperature();
  float pressure = bmp.readPressure() / 100.0F; // Convert to hPa
  float altitude = bmp.readAltitude(1013.25);    // Sea level pressure
  
  Serial.printf("Temp: %.2f°C, Press: %.2f hPa, Alt: %.2fm\n",
                temperature, pressure, altitude);
  
  delay(500);
}
```

## Motion Sensors

### MPU6050 6-DOF IMU

#### Technical Specifications
- **Gyroscope Range**: ±250, ±500, ±1000, ±2000°/sec
- **Accelerometer Range**: ±2g, ±4g, ±8g, ±16g
- **ADC Resolution**: 16-bit
- **Operating Voltage**: 2.375V-3.46V
- **Current Consumption**: 3.9mA (all features enabled)
- **Interface**: I2C (400kHz fast mode)
- **Built-in Features**: Digital Motion Processor (DMP), FIFO

#### I2C Wiring
- **VCC**: 3.3V (use level shifter if connecting to 5V system)
- **GND**: Ground
- **SCL**: I2C Clock
- **SDA**: I2C Data
- **XDA/XCL**: Auxiliary I2C (optional)
- **AD0**: I2C address select (GND=0x68, VCC=0x69)
- **INT**: Interrupt output (optional)

#### Basic Implementation
```cpp
#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;

void setup() {
  Wire.begin();
  mpu.initialize();
  
  if (!mpu.testConnection()) {
    Serial.println("MPU6050 connection failed!");
    while(1);
  }
  
  // Configure accelerometer range
  mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_2);
  
  // Configure gyroscope range
  mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_250);
}

void loop() {
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
  
  // Convert to physical units
  float accelX = ax / 16384.0; // For ±2g range
  float accelY = ay / 16384.0;
  float accelZ = az / 16384.0;
  
  float gyroX = gx / 131.0; // For ±250°/s range
  float gyroY = gy / 131.0;
  float gyroZ = gz / 131.0;
  
  Serial.printf("Accel: %.3f,%.3f,%.3f g  Gyro: %.3f,%.3f,%.3f °/s\n",
                accelX, accelY, accelZ, gyroX, gyroY, gyroZ);
  
  delay(100);
}
```

## Image Sensors

### ESP32-CAM Module

#### Technical Specifications
- **Sensor**: OV2640 2MP CMOS
- **Resolution**: Up to 1600x1200 (UXGA)
- **Image Formats**: JPEG, BMP, GRAYSCALE
- **Frame Rate**: 60fps@96x96, 25fps@320x240, 7fps@800x600
- **Operating Voltage**: 5V via USB, 3.3V regulated
- **Storage**: MicroSD card slot
- **Connectivity**: WiFi 802.11 b/g/n

#### Pin Configuration
- **GPIO0**: Camera enable (pull low for programming mode)
- **GPIO1**: UART TX
- **GPIO3**: UART RX
- **GPIO4**: Flash LED / SD Card CS
- **GPIO12-15**: SD Card interface
- **Multiple GPIOs**: Camera interface (VSYNC, HREF, PCLK, D0-D7)

#### Implementation Example
```cpp
#include "esp_camera.h"
#include "WiFi.h"

// Camera pin definitions for ESP32-CAM
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // High quality settings
  config.frame_size = FRAMESIZE_UXGA;
  config.jpeg_quality = 10;
  config.fb_count = 2;
  
  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
}

void captureImage() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }
  
  // Process image buffer (fb->buf, fb->len)
  Serial.printf("Captured image: %d bytes\n", fb->len);
  
  // Return frame buffer
  esp_camera_fb_return(fb);
}
```

## Audio Sensors

### Electret Microphone with MAX4466

#### Technical Specifications
- **Frequency Response**: 20Hz - 20kHz
- **Supply Voltage**: 2.4V - 5.5V
- **Output**: Analog voltage (VCC/2 bias)
- **Gain**: Adjustable via potentiometer
- **Current Consumption**: 4mA typical
- **SNR**: &gt;60dB

#### Connection Diagram
- **VCC**: 3.3V or 5V
- **GND**: Ground
- **OUT**: Analog output to ADC pin

#### Implementation Example
```cpp
#define MIC_PIN A0
#define SAMPLE_RATE 8000
#define SAMPLE_DURATION 1000 // milliseconds

void setup() {
  Serial.begin(115200);
  analogReadResolution(12); // 12-bit ADC on ESP32
}

void recordAudioSample() {
  int samples[SAMPLE_RATE];
  unsigned long startTime = millis();
  int sampleCount = 0;
  
  while (millis() - startTime < SAMPLE_DURATION && 
         sampleCount < SAMPLE_RATE) {
    samples[sampleCount] = analogRead(MIC_PIN);
    sampleCount++;
    delayMicroseconds(125); // 8kHz sampling rate
  }
  
  // Calculate RMS for sound level
  long sum = 0;
  for (int i = 0; i < sampleCount; i++) {
    int centered = samples[i] - 2048; // Remove DC bias
    sum += centered * centered;
  }
  
  float rms = sqrt(sum / sampleCount);
  float db = 20 * log10(rms / 2048.0) + 94; // Convert to dB SPL (approximate)
  
  Serial.printf("Sound level: %.1f dB SPL\n", db);
}
```

## Power Sensors

### INA219 Current/Voltage Sensor

#### Technical Specifications
- **Bus Voltage Range**: 0-26V
- **Shunt Voltage Range**: ±320mV
- **Current Measurement**: Up to ±3.2A (with 0.1Ω shunt)
- **Resolution**: 0.8mA, 4mV
- **Interface**: I2C (addresses 0x40-0x4F)
- **Accuracy**: ±0.5% (typical)

#### I2C Wiring
- **VCC**: 3.3V or 5V
- **GND**: Ground
- **SCL**: I2C Clock
- **SDA**: I2C Data
- **VIN+/VIN-**: High-side voltage measurement
- **A0/A1**: I2C address configuration

#### Implementation Example
```cpp
#include <Adafruit_INA219.h>

Adafruit_INA219 ina219;

void setup() {
  if (!ina219.begin()) {
    Serial.println("Failed to find INA219 chip");
    while (1);
  }
  
  // Configure for 32V, 2A range (default)
  ina219.setCalibration_32V_2A();
}

void loop() {
  float shuntvoltage = ina219.getShuntVoltage_mV();
  float busvoltage = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  float power_mW = ina219.getPower_mW();
  float loadvoltage = busvoltage + (shuntvoltage / 1000);
  
  Serial.printf("Bus: %.3fV, Load: %.3fV, Current: %.3fmA, Power: %.3fmW\n",
                busvoltage, loadvoltage, current_mA, power_mW);
  
  delay(1000);
}
```

## Sensor Calibration Procedures

### Temperature Sensor Calibration

#### Single-Point Calibration
```cpp
struct TemperatureCalibration {
  float offset;
};

void calibrateTemperatureSensor(float referenceTemp) {
  float rawReading = sensor.readRawTemperature();
  calibration.offset = referenceTemp - rawReading;
  
  // Save calibration to EEPROM
  EEPROM.put(TEMP_CAL_ADDR, calibration);
  EEPROM.commit();
}

float getCalibratedTemperature() {
  float raw = sensor.readRawTemperature();
  return raw + calibration.offset;
}
```

#### Two-Point Calibration
```cpp
struct TwoPointCalibration {
  float slope;
  float offset;
};

void calibrateTemperatureTwoPoint(float refLow, float refHigh,
                                  float rawLow, float rawHigh) {
  calibration.slope = (refHigh - refLow) / (rawHigh - rawLow);
  calibration.offset = refLow - calibration.slope * rawLow;
  
  // Save to EEPROM
  EEPROM.put(TEMP_CAL_ADDR, calibration);
  EEPROM.commit();
}

float getCalibratedTemperature() {
  float raw = sensor.readRawTemperature();
  return calibration.slope * raw + calibration.offset;
}
```

### Pressure Sensor Calibration
```cpp
void calibratePressureSensor(float seaLevelPressure) {
  // Read current pressure
  float currentPressure = bmp.readPressure() / 100.0;
  
  // Calculate offset
  pressureOffset = seaLevelPressure - currentPressure;
  
  // Store calibration
  preferences.putFloat("press_offset", pressureOffset);
}

float getCalibratedPressure() {
  float raw = bmp.readPressure() / 100.0;
  return raw + pressureOffset;
}
```

## Sensor Selection Guidelines

### Performance Requirements Matrix

| Sensor Type | Accuracy | Range | Power | Cost | Complexity |
|-------------|----------|-------|-------|------|------------|
| DHT22 | ±0.5°C | -40 to 80°C | Low | $ | Simple |
| SHT30 | ±0.3°C | -40 to 125°C | Low | $$ | Medium |
| DS18B20 | ±0.5°C | -55 to 125°C | Very Low | $ | Simple |
| BMP280 | ±1 hPa | 300-1100 hPa | Low | $ | Medium |
| BME280 | ±1 hPa | 300-1100 hPa | Low | $$ | Medium |
| MPU6050 | ±1% | ±16g/±2000°/s | Medium | $ | Complex |
| LSM9DS1 | ±0.2% | ±16g/±2000°/s | Medium | $$$ | Complex |

### Selection Criteria

#### Environmental Considerations
- **Operating temperature range**
- **Humidity tolerance**
- **Vibration resistance**
- **Chemical compatibility**
- **IP rating requirements**

#### Application Requirements
- **Measurement accuracy needed**
- **Response time requirements**
- **Power budget constraints**
- **Physical size limitations**
- **Communication interface compatibility**

#### Development Considerations
- **Library availability**
- **Documentation quality**
- **Community support**
- **Development tools**
- **Testing capabilities**

## Testing and Validation

### Sensor Acceptance Testing
```cpp
bool validateSensorOperation(SensorType sensor) {
  bool testPassed = true;
  
  // Test 1: Communication check
  if (!sensor.isResponding()) {
    Serial.println("FAIL: Sensor not responding");
    testPassed = false;
  }
  
  // Test 2: Self-test function
  if (!sensor.selfTest()) {
    Serial.println("FAIL: Sensor self-test failed");
    testPassed = false;
  }
  
  // Test 3: Range validation
  for (int i = 0; i < 10; i++) {
    float reading = sensor.read();
    if (!isValidRange(reading)) {
      Serial.printf("FAIL: Reading %f out of range\n", reading);
      testPassed = false;
    }
  }
  
  // Test 4: Stability check
  float readings[10];
  for (int i = 0; i < 10; i++) {
    readings[i] = sensor.read();
    delay(100);
  }
  
  float variance = calculateVariance(readings, 10);
  if (variance > STABILITY_THRESHOLD) {
    Serial.printf("FAIL: High variance: %f\n", variance);
    testPassed = false;
  }
  
  return testPassed;
}
```

### Performance Benchmarking
```cpp
void benchmarkSensorPerformance() {
  unsigned long startTime = micros();
  
  for (int i = 0; i < 1000; i++) {
    sensor.read();
  }
  
  unsigned long endTime = micros();
  float avgReadTime = (endTime - startTime) / 1000.0;
  
  Serial.printf("Average read time: %.2f µs\n", avgReadTime);
  Serial.printf("Maximum sample rate: %.2f Hz\n", 1000000.0 / avgReadTime);
}
```

This comprehensive sensor specification document provides the technical foundation for implementing reliable, accurate sensor systems in the educational data science platform.
