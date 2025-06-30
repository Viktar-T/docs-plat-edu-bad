# Wiring Diagrams

## Overview

This section provides detailed wiring diagrams and connection schematics for all hardware components in the educational data science platform. Each diagram includes pin assignments, component values, and implementation notes.

## Basic Controller Connections

### ESP32 Development Board Pinout

```
                    ESP32 DevKit V1
                    +--------------+
                    |              |
               3V3  |1           30| GND
               EN   |2           29| GPIO23  (MOSI)
          GPIO36    |3           28| GPIO22  (I2C SCL)
          GPIO39    |4           27| GPIO1   (TX)
          GPIO34    |5           26| GPIO3   (RX)
          GPIO35    |6           25| GPIO21  (I2C SDA)
          GPIO32    |7           24| GND
          GPIO33    |8           23| GPIO19  (MISO)
          GPIO25    |9           22| GPIO18  (SCK)
          GPIO26    |10          21| GPIO5
          GPIO27    |11          20| GPIO17
          GPIO14    |12          19| GPIO16
          GPIO12    |13          18| GPIO4
               GND  |14          17| GPIO0
          GPIO13    |15          16| GPIO2
                    |              |
                    +--------------+
```

### Raspberry Pi 4 GPIO Pinout

```
                Raspberry Pi 4 GPIO Header
                   +3V3  (1) (2)  +5V
              GPIO2 SDA  (3) (4)  +5V
              GPIO3 SCL  (5) (6)  GND
                  GPIO4  (7) (8)  GPIO14 TXD
                    GND  (9) (10) GPIO15 RXD
                 GPIO17 (11) (12) GPIO18
                 GPIO27 (13) (14) GND
                 GPIO22 (15) (16) GPIO23
                   +3V3 (17) (18) GPIO24
             GPIO10 MOSI (19) (20) GND
             GPIO9  MISO (21) (22) GPIO25
             GPIO11 SCLK (23) (24) GPIO8 CE0
                    GND (25) (26) GPIO7 CE1
```

## Environmental Sensors

### DHT22 Temperature/Humidity Sensor

```
DHT22 Wiring Diagram:

     DHT22                    ESP32
   +-------+              +----------+
   |   1   |  ---- VCC ---| 3.3V     |
   |   2   |  ---- DATA --| GPIO4    |
   |   3   |  (not used)  |          |
   |   4   |  ---- GND ---| GND      |
   +-------+              +----------+
       |
    [10kΩ] Pull-up resistor between VCC and DATA
       |
      GND

Connection Details:
- Pin 1 (VCC): 3.3V (red wire)
- Pin 2 (DATA): GPIO4 with 10kΩ pull-up to 3.3V (yellow wire)
- Pin 3: Not connected
- Pin 4 (GND): Ground (black wire)

Notes:
- Always use a pull-up resistor on the data line
- Keep wire length under 20cm for reliable operation
- Allow 2 seconds between readings
```

### BMP280 Pressure Sensor (I2C)

```
BMP280 I2C Wiring:

     BMP280                   ESP32
   +--------+              +----------+
   | VCC    |  ----------- | 3.3V     |
   | GND    |  ----------- | GND      |
   | SCL    |  ----------- | GPIO22   |
   | SDA    |  ----------- | GPIO21   |
   | CSB    |  ----------- | 3.3V     | (I2C mode)
   | SDO    |  ----------- | GND/3.3V | (Address select)
   +--------+              +----------+

I2C Address Selection:
- SDO to GND: Address 0x76
- SDO to 3.3V: Address 0x77

Pull-up Resistors (if not on breakout board):
- 4.7kΩ from SDA to 3.3V
- 4.7kΩ from SCL to 3.3V

Connection Colors:
- VCC: Red wire
- GND: Black wire
- SCL: Yellow wire
- SDA: Blue wire
```

### MPU6050 IMU Sensor

```
MPU6050 I2C Connection:

     MPU6050                  ESP32
   +--------+              +----------+
   | VCC    |  ----------- | 3.3V     |
   | GND    |  ----------- | GND      |
   | SCL    |  ----------- | GPIO22   |
   | SDA    |  ----------- | GPIO21   |
   | XDA    |  (optional)  |          | (Aux I2C)
   | XCL    |  (optional)  |          | (Aux I2C)
   | AD0    |  ----------- | GND/3.3V | (Address)
   | INT    |  ----------- | GPIO19   | (Interrupt)
   +--------+              +----------+

Address Configuration:
- AD0 to GND: I2C address 0x68
- AD0 to 3.3V: I2C address 0x69

Important Notes:
- Use 3.3V logic level (not 5V)
- Interrupt pin is optional but recommended
- XDA/XCL for auxiliary sensors (optional)
```

## Communication Modules

### ESP32-CAM Module Connections

```
ESP32-CAM Programming Setup:

    FTDI Programmer          ESP32-CAM
   +---------------+       +----------+
   | 3.3V          | ----- | 3.3V     |
   | GND           | ----- | GND      |
   | TX            | ----- | RX (U0R) |
   | RX            | ----- | TX (U0T) |
   +---------------+       | GPIO0    | ---- GND (Programming)
                           | RST      | ---- Momentary switch to GND
                           +----------+

Programming Procedure:
1. Connect GPIO0 to GND
2. Press and release RST button
3. Upload code
4. Disconnect GPIO0 from GND
5. Press RST to run normally

Camera Interface (Internal - for reference):
- VSYNC: GPIO25
- HREF:  GPIO23
- PCLK:  GPIO22
- XCLK:  GPIO0
- D7:    GPIO35
- D6:    GPIO34
- D5:    GPIO39
- D4:    GPIO36
- D3:    GPIO21
- D2:    GPIO19
- D1:    GPIO18
- D0:    GPIO5
- SIOD:  GPIO26 (SDA)
- SIOC:  GPIO27 (SCL)
```

### LoRa Module (SX1276/RFM95)

```
LoRa Module SPI Connection:

     LoRa Module             ESP32
   +------------+          +----------+
   | 3.3V       | -------- | 3.3V     |
   | GND        | -------- | GND      |
   | SCK        | -------- | GPIO18   | (SPI CLK)
   | MISO       | -------- | GPIO19   | (SPI MISO)
   | MOSI       | -------- | GPIO23   | (SPI MOSI)
   | NSS/CS     | -------- | GPIO5    | (Chip Select)
   | RST        | -------- | GPIO14   | (Reset)
   | DIO0       | -------- | GPIO2    | (IRQ)
   | DIO1       | -------- | GPIO15   | (Optional)
   | ANT        | -------- | Antenna  |
   +------------+          +----------+

Antenna Connection:
- Use 868MHz (EU) or 915MHz (US) antenna
- Keep antenna traces away from other circuits
- Use proper impedance matching (50Ω)

SPI Configuration:
- SPI Mode 0 (CPOL=0, CPHA=0)
- Maximum frequency: 10MHz
- MSB first
```

## Power Management

### Battery and Solar Charging System

```
Solar Charging Circuit:

Solar Panel    Charge Controller    Battery    Load
+-------+      +---------------+   +-------+  +-------+
|  18V  | ---> | MPPT Controller| ->| 12V   |->| ESP32 |
|  5W   |      | (TP4056 based) |  | LiPo  |  | 3.3V  |
+-------+      +---------------+   +-------+  +-------+
                      |                |
                   [LED indicators] [Protection]
                      |                |
                    Status         Over/Under
                   Display         Voltage

Component Values:
- Solar Panel: 18V, 5W minimum
- Battery: 18650 Li-ion, 3000mAh
- Charge Controller: TP4056 with protection
- Voltage Regulator: AMS1117-3.3 or ESP32 onboard

Connections:
Solar Panel (+) -----> MPPT IN+
Solar Panel (-) -----> MPPT IN-
MPPT OUT+ -----------> Battery (+)
MPPT OUT- -----------> Battery (-)
Battery (+) ---------> ESP32 VIN
Battery (-) ---------> ESP32 GND

Protection Features:
- Overvoltage protection
- Undervoltage protection
- Overcurrent protection
- Temperature monitoring
```

### Power Monitoring with INA219

```
INA219 Current Sensor Wiring:

      Load Circuit           INA219            ESP32
   +-------------+      +------------+     +----------+
   | Battery (+) | ---> | VIN+       |     |          |
   +-------------+      |            |     |          |
         |              | VIN-       | --> | Load (+) |
         |              |            |     |          |
         |              | VCC        | --- | 3.3V     |
         |              | GND        | --- | GND      |
         |              | SCL        | --- | GPIO22   |
         |              | SDA        | --- | GPIO21   |
         |              +------------+     +----------+

High-Side Current Measurement:
- Measures current flowing to the load
- Voltage measurement across shunt resistor
- Bus voltage measurement (0-26V)
- I2C interface for data readout

Shunt Resistor Selection:
- 0.1Ω for currents up to 3.2A
- 0.01Ω for currents up to 32A
- Lower resistance = higher current capacity
- Higher resistance = better resolution
```

## Complete System Integration

### Full Sensor Node Schematic

```
Complete Environmental Monitoring Node:

                    +3.3V Rail
                         |
                    [Regulator]
                         |
                    +----+----+----+----+
                    |    |    |    |    |
               +----+    |    |    |    +----+
               |         |    |    |         |
           [ESP32]   [DHT22] |  [BMP280]  [LoRa]
               |         |    |    |         |
               +----+----+----+----+----+----+
                    |         |         |
                  [I2C]    [GPIO4]   [SPI]
                    |         |         |
               +----+----+----+----+----+
               |    |    |    |    |    |
           [MPU6050] |  [INA219] | [SD Card]
                     |           |
                [GPIO Pins]  [Power Mon]

Pin Assignments:
GPIO2  - LoRa DIO0 (IRQ)
GPIO4  - DHT22 Data
GPIO5  - LoRa NSS (CS)
GPIO14 - LoRa Reset
GPIO15 - LoRa DIO1 (optional)
GPIO18 - SPI CLK
GPIO19 - SPI MISO
GPIO21 - I2C SDA
GPIO22 - I2C SCL
GPIO23 - SPI MOSI

I2C Device Addresses:
0x68 - MPU6050 (AD0 = GND)
0x76 - BMP280 (SDO = GND)
0x40 - INA219 (A0=A1=GND)
```

### Enclosure and Mounting

```
Weatherproof Enclosure Layout:

Top View:
+---------------------------+
|  [Solar Panel Connector]  |
|                           |
|  +-----+    +-------+     |
|  |ESP32|    |Battery|     |
|  +-----+    +-------+     |
|                           |
|  +-----+    +-------+     |
|  |Sensor|   |Charge |     |
|  |Board |   |Ctrl   |     |
|  +-----+    +-------+     |
|                           |
|  [Antenna Port]           |
+---------------------------+

Side View:
+---------------------------+
|           [Vent]          |
|  +---------------------+  |
|  |     Components     |  |
|  +---------------------+  |
|  [Cable Glands]           |
+---------------------------+

Materials:
- ABS or Polycarbonate enclosure
- IP65 rating minimum
- Cable glands for sensor wires
- Desiccant packets for moisture
- Ventilation for pressure equalization
```

## PCB Layout Considerations

### Ground Plane Design

```
PCB Layer Stack (4-layer recommended):

Layer 1: Component/Signal traces
Layer 2: Ground plane
Layer 3: Power plane (+3.3V)
Layer 4: Signal traces

Ground Plane Rules:
- Solid ground pour on layer 2
- Multiple vias connecting ground points
- Separate analog and digital grounds
- Star grounding for sensitive circuits

Trace Width Guidelines:
- Power traces: 20 mil minimum (0.5mm)
- Signal traces: 8 mil minimum (0.2mm)
- High-frequency signals: 50Ω impedance
- I2C/SPI: Keep traces short and equal length
```

### Component Placement

```
Optimal Component Layout:

Power Section     |  Digital Section  |  Analog Section
+---------------+ | +---------------+ | +---------------+
| Battery       | | | Microcontroller| | | Sensors      |
| Connector     | | |               | | |              |
|               | | |               | | |              |
| Voltage       | | | Communication | | | Amplifiers   |
| Regulator     | | | Modules       | | |              |
+---------------+ | +---------------+ | +---------------+
                  |                   |
             Keep separate to        |
             minimize noise      Critical for
                                accuracy

Design Rules:
1. Keep switching regulators away from analog circuits
2. Use ferrite beads on power lines
3. Add decoupling capacitors near ICs
4. Route high-frequency signals on inner layers
5. Use guard rings around sensitive analog circuits
```

## Testing and Debug Connections

### JTAG/SWD Debug Interface

```
JTAG Connection (for advanced debugging):

ESP32 JTAG Pins:
GPIO12 - TDI  (Test Data In)
GPIO13 - TCK  (Test Clock)
GPIO14 - TMS  (Test Mode Select)
GPIO15 - TDO  (Test Data Out)

JTAG Adapter Connection:
+----------+     +----------+
| JTAG     |     | ESP32    |
| Adapter  |     |          |
|----------|     |----------|
| TDI      | --- | GPIO12   |
| TCK      | --- | GPIO13   |
| TMS      | --- | GPIO14   |
| TDO      | --- | GPIO15   |
| GND      | --- | GND      |
| VCC      | --- | 3.3V     |
+----------+     +----------+

Note: JTAG pins may conflict with other functions
Use only for development/debugging
```

### Serial Debug Connections

```
UART Debug Interface:

Primary UART (Programming):
ESP32 TX (GPIO1) ---- RX (FTDI/USB)
ESP32 RX (GPIO3) ---- TX (FTDI/USB)
ESP32 GND ---- GND (FTDI/USB)

Secondary UART (Debug):
ESP32 GPIO17 ---- RX (Logic Analyzer)
ESP32 GPIO16 ---- TX (External Device)

Settings:
- Baud Rate: 115200
- Data Bits: 8
- Parity: None
- Stop Bits: 1
- Flow Control: None
```

## Troubleshooting Common Wiring Issues

### Power Problems

**Symptom**: Device doesn't start or resets randomly
**Check**:
- Voltage levels with multimeter
- Current consumption under load
- Decoupling capacitor placement
- Ground connections integrity

**Solution**:
```
Proper Power Distribution:

Battery → Fuse → Switch → Regulator → MCU
   |                         |
   +-- Current Monitor ------+

Add capacitors:
- 1000µF electrolytic near battery
- 100µF tantalum near regulator
- 10µF ceramic near MCU
- 100nF ceramic at each IC
```

### Communication Issues

**Symptom**: I2C or SPI devices not responding
**Check**:
- Pull-up resistors on I2C lines
- Clock signal integrity
- Voltage levels (3.3V vs 5V)
- Wire length and interference

**Solution**:
```
I2C Bus Conditioning:

3.3V ----+
         |
       4.7kΩ    4.7kΩ
         |        |
       SDA ---- SCL
         |        |
      Device1  Device2
         |        |
       GND ---- GND

Rules:
- Maximum bus length: 1m at 100kHz
- Use 2.2kΩ resistors for short buses
- Use 10kΩ resistors for long buses
- Add series resistors for ESD protection
```

### Signal Integrity

**Symptom**: Intermittent sensor readings or communication errors
**Check**:
- Wire routing near power circuits
- Antenna placement relative to digital circuits
- Ground loop formation
- EMI sources

**Solution**:
```
Noise Reduction Techniques:

1. Twisted pair wiring for differential signals
2. Shielded cables for long runs
3. Ferrite beads on power lines
4. Star grounding topology
5. Separate analog and digital grounds

Ferrite Bead Placement:
Power In → [Ferrite] → MCU Power
                |
              [Capacitor]
                |
               GND
```

This comprehensive wiring documentation ensures reliable electrical connections and helps troubleshoot common hardware integration issues in the educational data science platform.
