## On-Site Data Acquisition System -
Current Status & Recommendations

## 1. Solar Grid Inverter System

### Current Situation

The solar grid inverter is equipped with communication interfaces for data acquisition. Two
corresponding data loggers were available: one wired and one wireless. However, both
devices are primarily designed to communicate data to the Solarman cloud platform, and not
directly via a local network by default.

**Manual:**
- [https://www.sofarsolar.com/upload/file/20230713/1689212067933016352.pdf](https://www.sofarsolar.com/upload/file/20230713/1689212067933016352.pdf)

Wireless Data Logger

Partially successfully configured using the Solarman mobile application. The device can be
accessed from the phone locally when standing near the equipment. We suspect that the
basement location has insufficient Wi-Fi coverage, as the logger shows offline status and
cannot synchronize to the cloud. The Solarman system does not openly provide local API
access as it strongly encourages cloud connectivity for data retrieval.

**Manual:**
- [https://d2n7pqrvwkn1wt.cloudfront.net/public/APP_WIFI_Dongle_User_Manual.pdf](https://d2n7pqrvwkn1wt.cloudfront.net/public/APP_WIFI_Dongle_User_Manual.pdf)

### How to connect:
[https://sonergysolar.com/assets/downloads/User_Manual_for_Solarman_Smart_APP_(End_](https://sonergysolar.com/assets/downloads/User_Manual_for_Solarman_Smart_APP_(End_)
User).pdf

Wired Data Logger

The wired logger should be connected to a Router, according to the manual, and not directly
to an instance that uses the data. Attempted to use a laptop as a router to provide network
connectivity; this did not result in a stable connection. The wired logger probably requires a
direct connection to a router rather than through ad-hoc laptop routing.

**Manual:**
- [https://de.scribd.com/document/546690040/Stick-Logger-LSE-3-User-Manual](https://de.scribd.com/document/546690040/Stick-Logger-LSE-3-User-Manual)

### Recommendation

To avoid dependence on the cloud and improve reliability:

-  Use a direct RS-485 connection between the inverter and a local data acquisition
system (e.g., industrial PC / RS-485-to-USB or RS-485-to-LAN converter). This
allows local, independent collection and storage of power production data.

-

Improve Wi-Fi coverage only if cloud access is desired, but cloud access is not
required for local acquisition.

## 2. Biogas Station

### Current Situation

An Ethernet port located externally on the equipment rack was tested. Network scanning
revealed no active IP, suggesting: The port may not be connected internally,the controller is
using RS-485 or a different internal communication bus instead of Ethernet, or the system is
statically configured with an unknown IP address. In the front is an USB port, which is
apparently only used for Servicing.

### Limitation

System wiring and communication architecture are unclear due to lack of documentation.
The internal controller, sensors, and display unit are likely connected via RS-485 or another
fieldbus standard, but we do not know this for sure as we cannot look into the station.

### Recommendation

-  Open the control enclosure to trace communication wiring. Identify whether

sensors/displays connect via:

-  RS-485 bus

-  Ethernet / TCP

-  Proprietary serial interface

-  Once identified, use either RS-485 to local data handler, or direct LAN connectivity if

available.

## 3. Algae Station

### Current Situation

The system is already connected to a small on-board PC. The PC communicates with the
measurement hardware via RS-485. It runs a proprietary software interface that displays
system data on a dedicated screen. Full data access currently requires login credentials
(username and password unknown).

### Recommendation

-  Obtain software login credentials to view data parameters.

-  Once logged in, data may be exportable or streamable.

-

If needed, connect the PC to the LAN

## 4. Solar/Wind Hybrid Station

### Current Situation

A PC is already directly connected to the hybrid station system. This PC gathers and stores
data using manufacturer-provided software. The system manual indicates optional LAN
integration for network-based data transfer.

**Manual:**

### Recommendation

-  Connect the PC directly to the local LAN.

-  Configure either File/data sharing, or direct streaming from the hybrid controller if

supported.

## 5. RS-485 Communication Standard

The RS-485 communication standard (also known as TIA/EIA-485) is an electrical
specification used for serial data communication. It defines the physical layer of data
transmission and uses differential signaling, which makes it highly resistant to electrical
noise. Because of this, RS-485 is commonly used in industrial automation, building control
systems, and embedded devices, particularly in situations where data needs to be
transmitted reliably over long distances.

RS-485 communicates by sending data as the voltage difference between two signal lines,
typically labeled A and B. This differential transmission method improves noise immunity and
enables communication over extended cable lengths.

The main advantages of RS-485 include its high resistance to interference, its capability to
transmit data over long distances, the ability to connect multiple devices on a single
communication bus, and its relatively low implementation cost. However, RS-485 also has
some limitations. It only defines the electrical layer and does not specify any communication
protocol, which means the user must implement or choose one (such as Modbus).
Additionally, RS-485 networks require proper line termination using resistors (usually 120 Ω),
and there is no built-in protection against ground potential differences unless external
galvanic isolation is added. In multi-device setups, care must also be taken to avoid
communication collisions.

RS-485 is designed for multi-drop network configurations, meaning multiple devices can
share the same communication line. All devices are connected in parallel to the same
twisted pair of wires (A and B), and each device is assigned a unique address. A master
device, such as a PLC or microcontroller, can then communicate with individual slave
devices over the shared bus.

```
A = TD A(-)
B = TD B(+)
C = RD A(-)
D = RD
```
B(+)
```
R = GND
```
