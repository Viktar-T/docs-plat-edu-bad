# Sensor Data Simulation Methods

## Node-RED Flow Example

- **Inject Node:** Triggers at intervals (e.g., every 5s)
- **Function Node:** Generates random sensor values
- **MQTT Out Node:** Publishes to topic (e.g., `sensors/temperature`)

### Example Function Node Code

```javascript
msg.payload = {
  value: (20 + Math.random() * 5).toFixed(2),
  unit: "C"
};
return msg;
```

## Customization

- Add more sensors by duplicating flows and changing topics/values.
- Adjust intervals for different simulation rates. 