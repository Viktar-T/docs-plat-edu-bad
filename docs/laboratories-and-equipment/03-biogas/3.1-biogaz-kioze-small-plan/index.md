# 3.1 Biogaz-KIOZE-small_plan

Small-scale KIOZE biogas production system for renewable energy research.

**Type:** Biogas System  
**Configuration:** Small-Scale Biogas Production Plant

## Features

- Small-scale biogas production
- Educational and research applications
  
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

In the front is an USB port, which is only used for Servicing. The sensors are connected to a MultiCon Controller CMC141, for which the manual is found in the link below. The networking interface was configured in the settings, and can be accessed via an ethernet port on the back. Currently it is configured to the following addresses, but can be reconfigured in the settings of the controller. 

MAC address: FC:50:90:00:25:C9 

IP address: 192.168.1.50 

Subnet mask: 255.255.255.0 

Default Gateway: not configured 

- Manual: [Simex multicon cmc-141 User Manual](https://www.manualslib.com/manual/3839051/Simex-Multicon-Cmc-141.html)

The manufacturer provides the DAQ manager software to obtain data and save it to CSV 
tables. The software also supports automatic data collecting in fixed timeframes. 

- Software Information Page: [DAQ Manager](https://www.en.simex.pl/en/catalog/software/daq-manager)
- Manual: [PC software DAQ Manager](https://www.en.simex.pl/file/61566,DAQ%20Manager%20Quick%20Guide_QGUSXEN_v.1.12.000.pdf?download=1)

The manual for the software provides a detailed explanation on how to connect to a 
MultiCon controller, retrieve data for the device and display the selected measurements. There is also a possibility to configure a web view for the software. An idea to connect it to an IoT network would be to let the DAQ manager software handle the direct data pulling from the device, and export this data as csv-tables, which is the default setting. Then, for example, a python script could monitor these folders and push it to the MQTT, InfluxDB, AWS/Azure, … - which program best fits the next step of the pipeline.

![DAQ Manager 1](/labs/3.1.%20Biogaz-KIOZE-small_plan/4.1-DAQ-Manager.png)

### Sample Screenshot of the program

![DAQ Manager 2](/labs/3.1.%20Biogaz-KIOZE-small_plan/4.2-DAQ-Manager.png)

Network Settings in the program, option to download logs automatically;  
e.g.: */30 * * * * * *     code for custom plan downloading every 30 seconds.

A different option would be modbus tcp connection with templates, the multicon device 
supports a modbus slave mode, and the data can be pulled from e.g. a raspberry pi and 
published to mqtt networks. For that a modus template needs to be designed and uploaded 
to the biogas station. 

- **[Raspberry Pi Headless Setup](/labs/RaspberryPi_HeadlessSetup.pdf)**

