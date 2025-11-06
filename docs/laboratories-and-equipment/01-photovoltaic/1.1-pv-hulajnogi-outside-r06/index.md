# 1.1 PV-Hulajnogi-Outside-R06

Outdoor photovoltaic installation for solar energy generation and monitoring.

**Location:** Room  
**Type:** Photovoltaic System  
**Configuration:** Outdoor Installation

## Access

direct RS-485

## Documentation

- [Installation Manual - EN](/labs/1.1.%20PV-Hulajnogi-Outside-R06/Instrukcja_instalacji_Sofar_Stick_Logger_WIFI_LSW_3_EN.pdf) - English installation guide for Sofar Stick Logger WiFi LSW 3
- [Installation Manual - PL](/labs/1.1.%20PV-Hulajnogi-Outside-R06/Instrukcja_instalacji_Sofar_Stick_Logger_WIFI_LSW_3_PL.pdf) - Polish installation guide for Sofar Stick Logger WiFi LSW 3
- [Sofar Inverter Manual](/labs/1.1.%20PV-Hulajnogi-Outside-R06/SOFAR-1.1K_3.3KTL-G3_EN-20190820.pdf) - Technical manual for Sofar 1.1K/3.3KTL-G3 inverter

## Images

### Main Installation View

![Main View](/labs/1.1.%20PV-Hulajnogi-Outside-R06/1.1.1%20PV-Hulajnogi.jpg)

### Installation Photos

![Installation Photo 1](/labs/1.1.%20PV-Hulajnogi-Outside-R06/20250624_151535.jpg)

![Installation Photo 2](/labs/1.1.%20PV-Hulajnogi-Outside-R06/20250624_151628.jpg)

![Installation Photo 3](/labs/1.1.%20PV-Hulajnogi-Outside-R06/20250624_151637.jpg)

## Data Acquisition System

### Current Situation

The solar grid inverter is equipped with communication interfaces for data acquisition. Two corresponding data loggers were available: one wired and one wireless. However, both devices are primarily designed to communicate data to the Solarman cloud platform, and not directly via a local network by default.

**Wireless Data Logger:**
- Partially successfully configured using the Solarman mobile application
- The device can be accessed from the phone locally when standing near the equipment
- Suspected Wi-Fi coverage issues in the basement location
- Logger shows offline status and cannot synchronize to the cloud
- The Solarman system does not openly provide local API access as it strongly encourages cloud connectivity

**Wired Data Logger:**
- Should be connected to a Router according to the manual
- Attempted to use a laptop as a router did not result in a stable connection
- Requires direct connection to a router rather than through ad-hoc laptop routing

### Additional Documentation

- [Sofar Solar Manual](https://www.sofarsolar.com/upload/file/20230713/1689212067933016352.pdf)
- [Wireless Logger Manual](https://d2n7pqrvwkn1wt.cloudfront.net/public/APP_WIFI_Dongle_User_Manual.pdf)
- [Solarman Smart APP Manual](https://sonergysolar.com/assets/downloads/User_Manual_for_Solarman_Smart_APP_(End_User).pdf)
- [Wired Logger Manual (Stick Logger LSE-3)](https://de.scribd.com/document/546690040/Stick-Logger-LSE-3-User-Manual)

### Recommendations

To avoid dependence on the cloud and improve reliability:

- Use a direct RS-485 connection between the inverter and a local data acquisition system (e.g., industrial PC / RS-485-to-USB or RS-485-to-LAN converter). This allows local, independent collection and storage of power production data.
- Improve Wi-Fi coverage only if cloud access is desired, but cloud access is not required for local acquisition.

## Features

- Outdoor photovoltaic panel installation
- Sofar inverter system (1.1K/3.3KTL-G3)
- WiFi logger for remote monitoring
