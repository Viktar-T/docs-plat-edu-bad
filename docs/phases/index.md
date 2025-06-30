# Project Phases

This section contains documentation for all four phases of the Educational Platform for Bad Data Science project. Each phase represents a distinct component of the system that integrates to form the complete educational platform.

## Phase Overview

The project is structured into four main phases, each building upon the previous to create a comprehensive educational platform:

### [Phase 1: Hardware](./01-hardware/)
The foundation phase focuses on IoT devices and sensor networks for data collection. 

### [Phase 2: Cloud Infrastructure](./02-cloud/)
The backend phase implements scalable cloud services for data processing and storage.

### [Phase 3: Web Application](./03-web/)
The frontend phase creates an intuitive web interface for user interaction:
- **Technology Stack**: React.

### [Phase 4: Visualization & Analytics](./04-visualization/)
The analytics phase provides advanced data analysis and visualization capabilities.


### Data Flow
1. **Hardware → Cloud**: Sensor data transmitted via MQTT/HTTP to cloud services
2. **Cloud → Web**: Real-time data streaming and API responses to web application
3. **Cloud → Visualization**: Processed data feeding analytics and visualization components
4. **Web ↔ Visualization**: Interactive integration for user-driven analytics

