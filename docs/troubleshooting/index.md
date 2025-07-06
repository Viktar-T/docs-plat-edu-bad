# Troubleshooting

## Overview
Comprehensive troubleshooting guide for common issues encountered during setup, development, and operation of the renewable energy monitoring platform.

## Quick Diagnosis

### System Health Check
```bash
# Check all services status
docker ps

# Check service logs
docker logs nodered
docker logs influxdb
docker logs grafana

# Check network connectivity
ping localhost
telnet localhost 1883  # MQTT
telnet localhost 1880  # Node-RED
telnet localhost 8086  # InfluxDB
telnet localhost 3000  # Grafana

# Check disk space
df -h

# Check memory usage
free -h
```

## Common Issues by Component

### MQTT Issues

#### Connection Problems
**Symptoms**: Cannot connect to MQTT broker
```bash
# Error: Connection refused
# Error: Connection timeout
```

**Solutions**:
1. **Check if Mosquitto is running**:
   ```bash
   sudo systemctl status mosquitto
   # or
   docker ps | grep mosquitto
   ```

2. **Start Mosquitto service**:
   ```bash
   sudo systemctl start mosquitto
   sudo systemctl enable mosquitto
   ```

3. **Check port availability**:
   ```bash
   netstat -tlnp | grep 1883
   # or
   lsof -i :1883
   ```

4. **Verify configuration**:
   ```bash
   sudo nano /etc/mosquitto/mosquitto.conf
   # Check listener port and authentication settings
   ```

5. **Test connection manually**:
   ```bash
   mosquitto_pub -h localhost -t test/topic -m "test message"
   mosquitto_sub -h localhost -t test/topic -v
   ```

#### Authentication Issues
**Symptoms**: Connection denied, authentication failed
```bash
# Error: Connection refused: not authorised
# Error: Bad username or password
```

**Solutions**:
1. **Check password file**:
   ```bash
   sudo cat /etc/mosquitto/passwd
   ```

2. **Recreate user**:
   ```bash
   sudo mosquitto_passwd -c /etc/mosquitto/passwd admin
   sudo mosquitto_passwd /etc/mosquitto/passwd device_user
   ```

3. **Set correct permissions**:
   ```bash
   sudo chown mosquitto:mosquitto /etc/mosquitto/passwd
   sudo chmod 600 /etc/mosquitto/passwd
   ```

4. **Restart Mosquitto**:
   ```bash
   sudo systemctl restart mosquitto
   ```

#### Message Delivery Issues
**Symptoms**: Messages not being received
```bash
# Messages published but not received
# Inconsistent message delivery
```

**Solutions**:
1. **Check topic subscriptions**:
   ```bash
   # Verify topic structure
   mosquitto_sub -h localhost -u admin -P password -t "energy-monitor/#" -v
   ```

2. **Check QoS settings**:
   ```python
   # Ensure consistent QoS levels
   client.publish(topic, message, qos=1)
   ```

3. **Verify retained messages**:
   ```bash
   # Check for retained messages
   mosquitto_sub -h localhost -t "energy-monitor/#" -v --retained-only
   ```

### Node-RED Issues

#### Node-RED Not Starting
**Symptoms**: Cannot access Node-RED web interface
```bash
# Error: Port 1880 already in use
# Error: Permission denied
```

**Solutions**:
1. **Check if Node-RED is running**:
   ```bash
   docker ps | grep nodered
   # or
   ps aux | grep node-red
   ```

2. **Check port conflicts**:
   ```bash
   netstat -tlnp | grep 1880
   lsof -i :1880
   ```

3. **Kill conflicting processes**:
   ```bash
   sudo kill -9 <PID>
   ```

4. **Start Node-RED**:
   ```bash
   # Docker
   docker run -d --name nodered -p 1880:1880 nodered/node-red:latest
   
   # Manual
   node-red
   ```

#### Flow Deployment Issues
**Symptoms**: Flows not working, nodes showing errors
```bash
# Error: Node not found
# Error: Invalid flow configuration
```

**Solutions**:
1. **Check node installation**:
   ```bash
   cd ~/.node-red
   npm list
   ```

2. **Install missing nodes**:
   ```bash
   npm install node-red-contrib-influxdb
   npm install node-red-dashboard
   ```

3. **Restart Node-RED**:
   ```bash
   # Docker
   docker restart nodered
   
   # Manual
   # Stop with Ctrl+C, then restart
   ```

4. **Check flow configuration**:
   - Verify MQTT broker settings
   - Check InfluxDB connection
   - Validate function node code

#### Memory Issues
**Symptoms**: Node-RED crashes, high memory usage
```bash
# Error: JavaScript heap out of memory
# High CPU/memory usage
```

**Solutions**:
1. **Increase Node.js memory limit**:
   ```bash
   # Docker
   docker run -d --name nodered -p 1880:1880 \
     -e NODE_OPTIONS="--max-old-space-size=2048" \
     nodered/node-red:latest
   
   # Manual
   NODE_OPTIONS="--max-old-space-size=2048" node-red
   ```

2. **Optimize flows**:
   - Reduce message frequency
   - Use batch processing
   - Remove unused nodes

3. **Monitor resource usage**:
   ```bash
   docker stats nodered
   ```

### InfluxDB Issues

#### Connection Problems
**Symptoms**: Cannot connect to InfluxDB
```bash
# Error: Connection refused
# Error: 401 Unauthorized
```

**Solutions**:
1. **Check if InfluxDB is running**:
   ```bash
   docker ps | grep influxdb
   # or
   sudo systemctl status influxdb
   ```

2. **Verify port and URL**:
   ```bash
   curl http://localhost:8086/health
   ```

3. **Check authentication**:
   ```bash
   # Verify token
   influx auth list
   ```

4. **Reset InfluxDB**:
   ```bash
   # Docker
   docker stop influxdb
   docker rm influxdb
   docker run -d --name influxdb -p 8086:8086 influxdb:2.7
   ```

#### Data Storage Issues
**Symptoms**: Data not being stored, queries returning empty
```bash
# Error: Bucket not found
# Error: Organization not found
```

**Solutions**:
1. **Check bucket existence**:
   ```bash
   influx bucket list
   ```

2. **Create missing bucket**:
   ```bash
   influx bucket create --name energy-data --org energy-monitor
   ```

3. **Check organization**:
   ```bash
   influx org list
   ```

4. **Verify data format**:
   ```python
   # Check data structure
   print(json.dumps(data, indent=2))
   ```

#### Performance Issues
**Symptoms**: Slow queries, high disk usage
```bash
# Queries taking too long
# Disk space running out
```

**Solutions**:
1. **Optimize queries**:
   ```sql
   -- Use time range filters
   from(bucket:"energy-data") 
     |> range(start: -1h)
     |> filter(fn: (r) => r.device_id == "solar_panel_001")
   ```

2. **Set up retention policies**:
   ```sql
   -- Create retention policy
   CREATE RETENTION POLICY "one_month" ON "energy-monitor" DURATION 30d REPLICATION 1;
   ```

3. **Monitor disk usage**:
   ```bash
   du -sh /var/lib/influxdb2/
   ```

### ThingsBoard Issues

#### Device Registration Problems
**Symptoms**: Cannot register devices, authentication fails
```bash
# Error: Device not found
# Error: Invalid credentials
```

**Solutions**:
1. **Check device credentials**:
   - Verify device ID
   - Check username/password
   - Ensure device is registered

2. **Register device manually**:
   ```bash
   # Use ThingsBoard web interface
   # Or use REST API
   curl -X POST http://localhost:9090/api/device \
     -H "Content-Type: application/json" \
     -H "X-Authorization: Bearer YOUR_TOKEN" \
     -d '{"name":"solar_panel_001","type":"Solar Panel"}'
   ```

3. **Check device profile**:
   - Verify device profile exists
   - Check transport configuration

#### Data Visualization Issues
**Symptoms**: Dashboards not showing data, widgets not updating
```bash
# Error: No data available
# Error: Widget configuration error
```

**Solutions**:
1. **Check data source**:
   - Verify device is sending data
   - Check telemetry keys
   - Validate data format

2. **Refresh dashboard**:
   - Clear browser cache
   - Reload dashboard
   - Check time range

3. **Verify widget configuration**:
   - Check data source settings
   - Validate time window
   - Test data keys

### Grafana Issues

#### Connection Problems
**Symptoms**: Cannot connect to Grafana
```bash
# Error: Connection refused
# Error: 404 Not Found
```

**Solutions**:
1. **Check if Grafana is running**:
   ```bash
   docker ps | grep grafana
   # or
   sudo systemctl status grafana-server
   ```

2. **Verify port and URL**:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Check default credentials**:
   - Username: admin
   - Password: admin

4. **Reset Grafana**:
   ```bash
   # Docker
   docker stop grafana
   docker rm grafana
   docker run -d --name grafana -p 3000:3000 grafana/grafana:latest
   ```

#### Data Source Issues
**Symptoms**: Cannot connect to InfluxDB, queries failing
```bash
# Error: Data source not found
# Error: Query failed
```

**Solutions**:
1. **Add InfluxDB data source**:
   - URL: http://localhost:8086
   - Access: Server (default)
   - Auth: Basic auth or token

2. **Verify InfluxDB connection**:
   ```bash
   curl -H "Authorization: Token YOUR_TOKEN" \
     "http://localhost:8086/api/v2/buckets?org=energy-monitor"
   ```

3. **Check query syntax**:
   ```sql
   -- Use Flux query language
   from(bucket: "energy-data")
     |> range(start: -1h)
     |> filter(fn: (r) => r._measurement == "energy_data")
   ```

#### Dashboard Issues
**Symptoms**: Dashboards not loading, panels showing errors
```bash
# Error: Panel not found
# Error: Query timeout
```

**Solutions**:
1. **Check panel configuration**:
   - Verify data source
   - Check query syntax
   - Validate time range

2. **Refresh dashboard**:
   - Clear browser cache
   - Reload page
   - Check network connectivity

3. **Import dashboard**:
   ```bash
   # Use dashboard JSON
   # Import via Grafana web interface
   ```

## Hardware Issues

### Sensor Problems
**Symptoms**: Incorrect readings, no data from sensors
```bash
# Error: Sensor not responding
# Error: Invalid readings
```

**Solutions**:
1. **Check wiring**:
   - Verify connections
   - Check for loose wires
   - Test with multimeter

2. **Test sensor individually**:
   ```cpp
   // Arduino test code
   void testSensor() {
     float reading = analogRead(sensorPin);
     Serial.print("Sensor reading: ");
     Serial.println(reading);
   }
   ```

3. **Check power supply**:
   - Verify voltage levels
   - Check current capacity
   - Test with different power source

4. **Calibrate sensor**:
   ```cpp
   // Calibration code
   float calibrateSensor() {
     // Take multiple readings
     float sum = 0;
     for(int i = 0; i < 10; i++) {
       sum += analogRead(sensorPin);
       delay(100);
     }
     return sum / 10;
   }
   ```

### Microcontroller Issues
**Symptoms**: Device not connecting, firmware not working
```bash
# Error: WiFi connection failed
# Error: MQTT connection failed
```

**Solutions**:
1. **Check WiFi configuration**:
   ```cpp
   // Verify WiFi settings
   const char* ssid = "your_wifi_ssid";
   const char* password = "your_wifi_password";
   ```

2. **Test network connectivity**:
   ```cpp
   // Ping test
   if (WiFi.status() == WL_CONNECTED) {
     Serial.println("WiFi connected");
   } else {
     Serial.println("WiFi connection failed");
   }
   ```

3. **Check MQTT configuration**:
   ```cpp
   // Verify MQTT settings
   const char* mqtt_server = "192.168.1.100";
   const int mqtt_port = 1883;
   ```

4. **Update firmware**:
   - Check for firmware updates
   - Reflash if necessary
   - Verify bootloader

## Network Issues

### Connectivity Problems
**Symptoms**: Devices cannot reach cloud services
```bash
# Error: Network unreachable
# Error: DNS resolution failed
```

**Solutions**:
1. **Check network configuration**:
   ```bash
   # Check IP address
   ip addr show
   
   # Check routing
   ip route show
   
   # Check DNS
   nslookup google.com
   ```

2. **Test connectivity**:
   ```bash
   # Ping test
   ping 8.8.8.8
   
   # Port test
   telnet localhost 1883
   ```

3. **Check firewall**:
   ```bash
   # Check firewall status
   sudo ufw status
   
   # Allow required ports
   sudo ufw allow 1883
   sudo ufw allow 1880
   sudo ufw allow 8086
   sudo ufw allow 3000
   ```

### DNS Issues
**Symptoms**: Cannot resolve hostnames
```bash
# Error: Name or service not known
# Error: DNS resolution failed
```

**Solutions**:
1. **Check DNS configuration**:
   ```bash
   cat /etc/resolv.conf
   ```

2. **Test DNS resolution**:
   ```bash
   nslookup localhost
   dig localhost
   ```

3. **Use IP addresses directly**:
   ```python
   # Instead of hostnames, use IP addresses
   mqtt_broker = "192.168.1.100"  # Instead of "localhost"
   ```

## Performance Issues

### High CPU Usage
**Symptoms**: System slow, high CPU utilization
```bash
# CPU usage > 80%
# System unresponsive
```

**Solutions**:
1. **Identify high-CPU processes**:
   ```bash
   top
   htop
   ps aux --sort=-%cpu | head -10
   ```

2. **Optimize Node-RED flows**:
   - Reduce message frequency
   - Use batch processing
   - Remove unnecessary nodes

3. **Check for infinite loops**:
   ```python
   # Add loop protection
   max_iterations = 1000
   iteration = 0
   while condition and iteration < max_iterations:
       # Process data
       iteration += 1
   ```

### High Memory Usage
**Symptoms**: Out of memory errors, system crashes
```bash
# Error: Out of memory
# High memory usage
```

**Solutions**:
1. **Check memory usage**:
   ```bash
   free -h
   cat /proc/meminfo
   ```

2. **Identify memory-hungry processes**:
   ```bash
   ps aux --sort=-%mem | head -10
   ```

3. **Optimize data storage**:
   - Use data compression
   - Implement data retention
   - Reduce data resolution

4. **Increase system memory**:
   - Add swap space
   - Upgrade RAM
   - Use SSD storage

### Slow Query Performance
**Symptoms**: Database queries taking too long
```bash
# Queries > 10 seconds
# Timeout errors
```

**Solutions**:
1. **Optimize InfluxDB queries**:
   ```sql
   -- Use time range filters
   from(bucket:"energy-data") 
     |> range(start: -1h)  -- Limit time range
     |> filter(fn: (r) => r.device_id == "specific_device")  -- Filter by device
   ```

2. **Create indexes**:
   ```sql
   -- Create indexes for frequently queried fields
   CREATE INDEX ON energy_data (device_id, time);
   ```

3. **Use continuous queries**:
   ```sql
   -- Downsample data for better performance
   CREATE CONTINUOUS QUERY "cq_hourly_avg" ON "energy-monitor" 
   BEGIN 
     SELECT mean(voltage), mean(current) 
     INTO "energy_data_hourly" 
     FROM energy_data 
     GROUP BY time(1h), device_id 
   END;
   ```

## Security Issues

### Authentication Problems
**Symptoms**: Unauthorized access, login failures
```bash
# Error: Invalid credentials
# Error: Access denied
```

**Solutions**:
1. **Check user credentials**:
   ```bash
   # MQTT
   sudo cat /etc/mosquitto/passwd
   
   # InfluxDB
   influx auth list
   ```

2. **Reset passwords**:
   ```bash
   # MQTT
   sudo mosquitto_passwd -c /etc/mosquitto/passwd admin
   
   # InfluxDB
   influx user password -n admin
   ```

3. **Verify permissions**:
   ```bash
   # Check file permissions
   ls -la /etc/mosquitto/
   ls -la /var/lib/influxdb2/
   ```

### SSL/TLS Issues
**Symptoms**: SSL connection failures, certificate errors
```bash
# Error: SSL handshake failed
# Error: Certificate not trusted
```

**Solutions**:
1. **Check SSL configuration**:
   ```conf
   # mosquitto.conf
   listener 8883
   certfile /etc/mosquitto/certs/server.crt
   keyfile /etc/mosquitto/certs/server.key
   ```

2. **Generate certificates**:
   ```bash
   # Generate self-signed certificate
   openssl req -new -x509 -days 365 -nodes -out server.crt -keyout server.key
   ```

3. **Test SSL connection**:
   ```bash
   mosquitto_pub -h localhost -p 8883 --cafile server.crt -t test/topic -m "test"
   ```

## Recovery Procedures

### System Recovery
```bash
# Stop all services
docker stop $(docker ps -q)

# Backup data
docker run --rm -v influxdb-data:/data -v $(pwd):/backup alpine tar czf /backup/influxdb-backup.tar.gz -C /data .

# Restart services
docker-compose up -d

# Restore data if needed
docker run --rm -v influxdb-data:/data -v $(pwd):/backup alpine tar xzf /backup/influxdb-backup.tar.gz -C /data
```

### Data Recovery
```bash
# Export InfluxDB data
influx query 'from(bucket:"energy-data") |> range(start: -30d)' --raw > backup.csv

# Import data
influx write --bucket energy-data --file backup.csv
```

### Configuration Recovery
```bash
# Backup configurations
cp /etc/mosquitto/mosquitto.conf mosquitto.conf.backup
cp ~/.node-red/settings.js settings.js.backup

# Restore configurations
cp mosquitto.conf.backup /etc/mosquitto/mosquitto.conf
cp settings.js.backup ~/.node-red/settings.js
```

## Getting Help

### Log Analysis
```bash
# Collect system logs
journalctl -u mosquitto --since "1 hour ago" > mosquitto.log
journalctl -u influxdb --since "1 hour ago" > influxdb.log
docker logs nodered > nodered.log

# Analyze logs
grep -i error *.log
grep -i warning *.log
```

### Debug Information
```bash
# System information
uname -a
cat /etc/os-release
docker version
node --version
python --version

# Service status
systemctl status mosquitto influxdb grafana-server
docker ps -a
```

### Community Resources
- **MQTT**: https://mosquitto.org/documentation/
- **Node-RED**: https://nodered.org/docs/
- **InfluxDB**: https://docs.influxdata.com/
- **ThingsBoard**: https://thingsboard.io/docs/
- **Grafana**: https://grafana.com/docs/

## Next Steps

1. **Review** [Project Setup](../project-setup/index.md) for proper environment setup
2. **Check** [Development Tools](../development/index.md) for debugging techniques
3. **Use** [Simulation Guide](../simulation/index.md) for testing without hardware
4. **Refer to** [References](../references/index.md) for additional resources 