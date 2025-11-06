# 3.1 Biogaz-KIOZE-small_plan

Small-scale KIOZE biogas production system for renewable energy research.

**Type:** Biogas System  
**Configuration:** Small-Scale Biogas Production Plant

## Access

RS 485.

## Images

### Main System View

![KIOZE Biogas System](/labs/3.1.%20Biogaz-KIOZE-small_plan/3.1.%20Biogaz-KIOZE.jpg)

### System Components and Details

![System Component 1](/labs/3.1.%20Biogaz-KIOZE-small_plan/20250624_154915.jpg)

![System Component 2](/labs/3.1.%20Biogaz-KIOZE-small_plan/20250624_154918.jpg)

![System Component 3](/labs/3.1.%20Biogaz-KIOZE-small_plan/20250624_154922.jpg)

![System Component 4](/labs/3.1.%20Biogaz-KIOZE-small_plan/20250624_155010.jpg)

![System Component 5](/labs/3.1.%20Biogaz-KIOZE-small_plan/20250624_155424.jpg)

![System Component 6](/labs/3.1.%20Biogaz-KIOZE-small_plan/20250624_155433.jpg)

## Data Acquisition System

### Current Situation

An Ethernet port located externally on the equipment rack was tested. Network scanning revealed no active IP, suggesting:
- The port may not be connected internally
- The controller is using RS-485 or a different internal communication bus instead of Ethernet
- The system is statically configured with an unknown IP address

In the front is a USB port, which is apparently only used for servicing.

### Limitations

System wiring and communication architecture are unclear due to lack of documentation. The internal controller, sensors, and display unit are likely connected via RS-485 or another fieldbus standard, but this cannot be confirmed without access to the station internals.

### Recommendations

- Open the control enclosure to trace communication wiring. Identify whether sensors/displays connect via:
  - RS-485 bus
  - Ethernet / TCP
  - Proprietary serial interface
- Once identified, use either RS-485 to local data handler, or direct LAN connectivity if available.

## Features

- Small-scale biogas production
- Educational and research applications
