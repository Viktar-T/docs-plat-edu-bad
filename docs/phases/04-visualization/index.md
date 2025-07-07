# Phase 4: Visualization & Analytics

## Overview
Advanced visualization and analytics capabilities for real-time monitoring, historical data analysis, and comprehensive reporting of renewable energy systems.

<!-- Grey text section start -->
<div class="text-grey">
## Real-Time Visualization

### Live Dashboard Components
```javascript
// Real-time energy monitoring dashboard
class RealTimeDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.charts = {};
    this.dataStreams = {};
    this.initializeDashboard();
  }

  initializeDashboard() {
    this.createLayout();
    this.initializeCharts();
    this.startDataStreams();
  }

  createLayout() {
    this.container.innerHTML = `
      <div class="dashboard-header">
        <h1>Real-Time Energy Monitoring</h1>
        <div class="status-indicators">
          <span class="status online">System Online</span>
          <span class="last-update">Last Update: <span id="lastUpdate">-</span></span>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="chart-container" id="powerChart">
          <h3>Power Generation (Real-time)</h3>
          <div class="chart" id="powerChartCanvas"></div>
        </div>
        
        <div class="chart-container" id="voltageChart">
          <h3>Voltage Levels</h3>
          <div class="chart" id="voltageChartCanvas"></div>
        </div>
        
        <div class="chart-container" id="efficiencyChart">
          <h3>System Efficiency</h3>
          <div class="chart" id="efficiencyChartCanvas"></div>
        </div>
        
        <div class="metrics-panel">
          <h3>Current Metrics</h3>
          <div class="metric" id="totalPower">
            <span class="label">Total Power:</span>
            <span class="value">0 W</span>
          </div>
          <div class="metric" id="totalEnergy">
            <span class="label">Daily Energy:</span>
            <span class="value">0 kWh</span>
          </div>
          <div class="metric" id="efficiency">
            <span class="label">Efficiency:</span>
            <span class="value">0%</span>
          </div>
        </div>
      </div>
    `;
  }

  initializeCharts() {
    // Power Chart
    this.charts.power = new Chart(
      document.getElementById('powerChartCanvas').getContext('2d'),
      {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Solar Power',
            data: [],
            borderColor: '#ff6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.4
          }, {
            label: 'Wind Power',
            data: [],
            borderColor: '#36a2eb',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 0
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Power (W)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top'
            }
          }
        }
      }
    );

    // Voltage Chart
    this.charts.voltage = new Chart(
      document.getElementById('voltageChartCanvas').getContext('2d'),
      {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Voltage',
            data: [],
            borderColor: '#4bc0c0',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 0
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Voltage (V)'
              }
            }
          }
        }
      }
    );

    // Efficiency Gauge
    this.charts.efficiency = new Chart(
      document.getElementById('efficiencyChartCanvas').getContext('2d'),
      {
        type: 'doughnut',
        data: {
          labels: ['Efficiency', 'Loss'],
          datasets: [{
            data: [0, 100],
            backgroundColor: ['#4bc0c0', '#f0f0f0'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          cutout: '70%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.label + ': ' + context.parsed + '%';
                }
              }
            }
          }
        }
      }
    );
  }

  startDataStreams() {
    // WebSocket connection for real-time data
    this.ws = new WebSocket('ws://localhost:3001/ws');
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.updateCharts(data);
      this.updateMetrics(data);
      this.updateTimestamp();
    };

    // Fallback to polling if WebSocket fails
    this.ws.onerror = () => {
      console.log('WebSocket failed, falling back to polling');
      this.startPolling();
    };
  }

  updateCharts(data) {
    const timestamp = new Date().toLocaleTimeString();
    
    // Update power chart
    this.charts.power.data.labels.push(timestamp);
    this.charts.power.data.datasets[0].data.push(data.solar?.power || 0);
    this.charts.power.data.datasets[1].data.push(data.wind?.power || 0);
    
    // Keep only last 20 data points
    if (this.charts.power.data.labels.length > 20) {
      this.charts.power.data.labels.shift();
      this.charts.power.data.datasets[0].data.shift();
      this.charts.power.data.datasets[1].data.shift();
    }
    
    // Update voltage chart
    this.charts.voltage.data.labels.push(timestamp);
    this.charts.voltage.data.datasets[0].data.push(data.solar?.voltage || 0);
    
    if (this.charts.voltage.data.labels.length > 20) {
      this.charts.voltage.data.labels.shift();
      this.charts.voltage.data.datasets[0].data.shift();
    }
    
    // Update efficiency gauge
    const efficiency = data.solar?.efficiency || 0;
    this.charts.efficiency.data.datasets[0].data = [efficiency, 100 - efficiency];
    
    // Update all charts
    this.charts.power.update('none');
    this.charts.voltage.update('none');
    this.charts.efficiency.update('none');
  }

  updateMetrics(data) {
    const totalPower = (data.solar?.power || 0) + (data.wind?.power || 0);
    const efficiency = data.solar?.efficiency || 0;
    
    document.getElementById('totalPower').querySelector('.value').textContent = 
      `${totalPower.toFixed(1)} W`;
    document.getElementById('efficiency').querySelector('.value').textContent = 
      `${efficiency.toFixed(1)}%`;
  }

  updateTimestamp() {
    document.getElementById('lastUpdate').textContent = 
      new Date().toLocaleTimeString();
  }

  startPolling() {
    setInterval(async () => {
      try {
        const response = await fetch('/api/energy-data/latest');
        const data = await response.json();
        this.updateCharts(data);
        this.updateMetrics(data);
        this.updateTimestamp();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);
  }
}

// Initialize dashboard
const dashboard = new RealTimeDashboard('dashboard-container');
```

### Advanced Real-Time Features
```javascript
// Real-time alerts and notifications
class EnergyAlerts {
  constructor() {
    this.alertThresholds = {
      lowEfficiency: 50,
      highTemperature: 70,
      lowVoltage: 18,
      highVoltage: 30
    };
    this.alertHistory = [];
  }

  checkAlerts(data) {
    const alerts = [];
    
    if (data.solar?.efficiency < this.alertThresholds.lowEfficiency) {
      alerts.push({
        type: 'warning',
        message: `Low efficiency detected: ${data.solar.efficiency.toFixed(1)}%`,
        timestamp: new Date(),
        device: 'solar_panel_001'
      });
    }
    
    if (data.solar?.temperature > this.alertThresholds.highTemperature) {
      alerts.push({
        type: 'critical',
        message: `High temperature detected: ${data.solar.temperature.toFixed(1)}°C`,
        timestamp: new Date(),
        device: 'solar_panel_001'
      });
    }
    
    if (data.solar?.voltage < this.alertThresholds.lowVoltage) {
      alerts.push({
        type: 'warning',
        message: `Low voltage detected: ${data.solar.voltage.toFixed(1)}V`,
        timestamp: new Date(),
        device: 'solar_panel_001'
      });
    }
    
    this.processAlerts(alerts);
  }

  processAlerts(alerts) {
    alerts.forEach(alert => {
      this.alertHistory.push(alert);
      this.showNotification(alert);
      this.updateAlertPanel(alert);
    });
    
    // Keep only last 100 alerts
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }
  }

  showNotification(alert) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Energy Monitor Alert', {
        body: alert.message,
        icon: '/icon.png',
        tag: alert.type
      });
    }
  }

  updateAlertPanel(alert) {
    const alertPanel = document.getElementById('alertPanel');
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${alert.type}`;
    alertElement.innerHTML = `
      <span class="alert-time">${alert.timestamp.toLocaleTimeString()}</span>
      <span class="alert-message">${alert.message}</span>
      <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    alertPanel.insertBefore(alertElement, alertPanel.firstChild);
    
    // Remove old alerts
    const alerts = alertPanel.querySelectorAll('.alert');
    if (alerts.length > 10) {
      alerts[alerts.length - 1].remove();
    }
  }
}

// Initialize alerts
const alerts = new EnergyAlerts();
```

## Historical Data Analysis

### Data Analysis Tools
```python
# Historical data analysis with Python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
from influxdb_client import InfluxDBClient

class EnergyDataAnalyzer:
    def __init__(self, url="http://localhost:8086", token="your-token", org="energy-monitor"):
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.query_api = self.client.query_api()
        
    def get_historical_data(self, device_id, start_time="-7d", end_time="now"):
        """Retrieve historical data from InfluxDB"""
        query = f'''
        from(bucket: "energy-data")
          |> range(start: {start_time}, stop: {end_time})
          |> filter(fn: (r) => r._measurement == "energy_data")
          |> filter(fn: (r) => r.device_id == "{device_id}")
          |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        '''
        
        result = self.query_api.query_data_frame(query)
        return result
    
    def analyze_daily_patterns(self, device_id, days=7):
        """Analyze daily energy generation patterns"""
        data = self.get_historical_data(device_id, f"-{days}d")
        
        if data.empty:
            return None
            
        # Convert timestamp to datetime
        data['_time'] = pd.to_datetime(data['_time'])
        data['hour'] = data['_time'].dt.hour
        data['day_of_week'] = data['_time'].dt.day_name()
        
        # Group by hour and calculate statistics
        hourly_stats = data.groupby('hour').agg({
            'power': ['mean', 'std', 'min', 'max'],
            'voltage': ['mean', 'std'],
            'current': ['mean', 'std']
        }).round(2)
        
        return hourly_stats
    
    def calculate_efficiency_trends(self, device_id, days=30):
        """Calculate efficiency trends over time"""
        data = self.get_historical_data(device_id, f"-{days}d")
        
        if data.empty:
            return None
            
        data['_time'] = pd.to_datetime(data['_time'])
        data['date'] = data['_time'].dt.date
        
        # Calculate daily efficiency
        daily_efficiency = data.groupby('date').agg({
            'power': 'mean',
            'voltage': 'mean',
            'current': 'mean'
        })
        
        # Calculate theoretical maximum power (simplified)
        daily_efficiency['theoretical_max'] = 100  # W
        daily_efficiency['efficiency'] = (daily_efficiency['power'] / daily_efficiency['theoretical_max']) * 100
        
        return daily_efficiency
    
    def detect_anomalies(self, device_id, days=7):
        """Detect anomalies in energy data"""
        data = self.get_historical_data(device_id, f"-{days}d")
        
        if data.empty:
            return None
            
        # Calculate rolling statistics
        data['power_ma'] = data['power'].rolling(window=12).mean()  # 1-hour moving average
        data['power_std'] = data['power'].rolling(window=12).std()
        
        # Define anomaly threshold (3 standard deviations)
        data['power_upper'] = data['power_ma'] + (3 * data['power_std'])
        data['power_lower'] = data['power_ma'] - (3 * data['power_std'])
        
        # Detect anomalies
        anomalies = data[
            (data['power'] > data['power_upper']) | 
            (data['power'] < data['power_lower'])
        ]
        
        return anomalies
    
    def generate_performance_report(self, device_id, days=30):
        """Generate comprehensive performance report"""
        report = {
            'device_id': device_id,
            'analysis_period': f"{days} days",
            'generated_at': datetime.now().isoformat()
        }
        
        # Get data
        data = self.get_historical_data(device_id, f"-{days}d")
        
        if not data.empty:
            # Basic statistics
            report['total_energy'] = data['power'].sum() / 1000  # kWh
            report['average_power'] = data['power'].mean()
            report['peak_power'] = data['power'].max()
            report['average_efficiency'] = data.get('efficiency', pd.Series([0])).mean()
            
            # Daily patterns
            daily_patterns = self.analyze_daily_patterns(device_id, days)
            if daily_patterns is not None:
                report['peak_hours'] = daily_patterns['power']['mean'].idxmax()
                report['average_daily_energy'] = daily_patterns['power']['mean'].sum() / 1000
            
            # Efficiency trends
            efficiency_trends = self.calculate_efficiency_trends(device_id, days)
            if efficiency_trends is not None:
                report['efficiency_trend'] = efficiency_trends['efficiency'].tolist()
                report['average_efficiency'] = efficiency_trends['efficiency'].mean()
            
            # Anomalies
            anomalies = self.detect_anomalies(device_id, days)
            if anomalies is not None:
                report['anomaly_count'] = len(anomalies)
                report['anomaly_percentage'] = (len(anomalies) / len(data)) * 100
        
        return report

# Usage example
analyzer = EnergyDataAnalyzer()

# Generate performance report
report = analyzer.generate_performance_report('solar_panel_001', 30)
print(json.dumps(report, indent=2))

# Analyze daily patterns
patterns = analyzer.analyze_daily_patterns('solar_panel_001', 7)
print(patterns)
```

### Visualization Components
```javascript
// Historical data visualization
class HistoricalVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.charts = {};
    this.initializeCharts();
  }

  initializeCharts() {
    this.createLayout();
    this.createTimeSeriesChart();
    this.createHeatmapChart();
    this.createDistributionChart();
  }

  createLayout() {
    this.container.innerHTML = `
      <div class="historical-header">
        <h2>Historical Data Analysis</h2>
        <div class="date-range-selector">
          <input type="date" id="startDate" />
          <input type="date" id="endDate" />
          <button onclick="historicalViz.loadData()">Load Data</button>
        </div>
      </div>
      
      <div class="historical-grid">
        <div class="chart-container">
          <h3>Power Generation Over Time</h3>
          <canvas id="timeSeriesChart"></canvas>
        </div>
        
        <div class="chart-container">
          <h3>Daily Energy Heatmap</h3>
          <canvas id="heatmapChart"></canvas>
        </div>
        
        <div class="chart-container">
          <h3>Power Distribution</h3>
          <canvas id="distributionChart"></canvas>
        </div>
        
        <div class="stats-panel">
          <h3>Statistics</h3>
          <div id="statsContent"></div>
        </div>
      </div>
    `;
  }

  async loadData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    try {
      const response = await fetch(`/api/historical-data?s=${startDate}&e=${endDate}`);
      const data = await response.json();
      
      this.updateCharts(data);
      this.updateStats(data);
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  }

  updateCharts(data) {
    // Update time series chart
    this.charts.timeSeries.data.labels = data.map(d => d.timestamp);
    this.charts.timeSeries.data.datasets[0].data = data.map(d => d.power);
    this.charts.timeSeries.update();
    
    // Update heatmap
    this.updateHeatmap(data);
    
    // Update distribution
    this.updateDistribution(data);
  }

  updateStats(data) {
    const stats = this.calculateStats(data);
    
    document.getElementById('statsContent').innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Total Energy:</span>
        <span class="stat-value">${stats.totalEnergy.toFixed(2)} kWh</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Average Power:</span>
        <span class="stat-value">${stats.avgPower.toFixed(1)} W</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Peak Power:</span>
        <span class="stat-value">${stats.peakPower.toFixed(1)} W</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Efficiency:</span>
        <span class="stat-value">${stats.efficiency.toFixed(1)}%</span>
      </div>
    `;
  }

  calculateStats(data) {
    const powers = data.map(d => d.power);
    const efficiencies = data.map(d => d.efficiency || 0);
    
    return {
      totalEnergy: powers.reduce((sum, p) => sum + p, 0) / 1000, // Convert to kWh
      avgPower: powers.reduce((sum, p) => sum + p, 0) / powers.length,
      peakPower: Math.max(...powers),
      efficiency: efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length
    };
  }
}

// Initialize historical visualizer
const historicalViz = new HistoricalVisualizer('historical-container');
```

## Advanced Analytics

### Machine Learning Integration
```python
# Machine learning for energy prediction
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib

class EnergyPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.feature_columns = ['hour', 'day_of_week', 'temperature', 'humidity', 'wind_speed']
        self.target_column = 'power'
        
    def prepare_features(self, data):
        """Prepare features for machine learning"""
        features = data.copy()
        
        # Extract time features
        features['hour'] = pd.to_datetime(features['_time']).dt.hour
        features['day_of_week'] = pd.to_datetime(features['_time']).dt.dayofweek
        features['month'] = pd.to_datetime(features['_time']).dt.month
        
        # Add weather features (if available)
        if 'temperature' not in features.columns:
            features['temperature'] = 25  # Default temperature
        if 'humidity' not in features.columns:
            features['humidity'] = 50  # Default humidity
        if 'wind_speed' not in features.columns:
            features['wind_speed'] = 0  # Default wind speed
            
        return features
        
    def train_model(self, data):
        """Train the prediction model"""
        features = self.prepare_features(data)
        
        # Prepare training data
        X = features[self.feature_columns].fillna(0)
        y = features[self.target_column].fillna(0)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        return {
            'mse': mse,
            'r2': r2,
            'rmse': np.sqrt(mse)
        }
        
    def predict_power(self, features):
        """Predict power generation"""
        return self.model.predict([features])[0]
        
    def save_model(self, filename):
        """Save trained model"""
        joblib.dump(self.model, filename)
        
    def load_model(self, filename):
        """Load trained model"""
        self.model = joblib.load(filename)

# Usage example
predictor = EnergyPredictor()

# Train model with historical data
analyzer = EnergyDataAnalyzer()
data = analyzer.get_historical_data('solar_panel_001', '-30d')
performance = predictor.train_model(data)

print(f"Model Performance:")
print(f"R² Score: {performance['r2']:.3f}")
print(f"RMSE: {performance['rmse']:.2f} W")

# Save model
predictor.save_model('energy_predictor.pkl')
```

### Anomaly Detection
```python
# Advanced anomaly detection
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_fitted = False
        
    def detect_anomalies(self, data):
        """Detect anomalies in energy data"""
        # Prepare features
        features = data[['power', 'voltage', 'current', 'temperature']].fillna(0)
        
        # Scale features
        features_scaled = self.scaler.fit_transform(features)
        
        # Fit model and predict
        if not self.is_fitted:
            self.model.fit(features_scaled)
            self.is_fitted = True
            
        predictions = self.model.predict(features_scaled)
        
        # -1 indicates anomaly, 1 indicates normal
        anomalies = predictions == -1
        
        return anomalies
        
    def get_anomaly_details(self, data, anomalies):
        """Get detailed information about anomalies"""
        anomaly_data = data[anomalies].copy()
        
        details = []
        for idx, row in anomaly_data.iterrows():
            details.append({
                'timestamp': row['_time'],
                'power': row['power'],
                'voltage': row['voltage'],
                'current': row['current'],
                'temperature': row['temperature'],
                'anomaly_score': self.model.score_samples(
                    self.scaler.transform([[
                        row['power'], row['voltage'], 
                        row['current'], row['temperature']
                    ]])
                )[0]
            })
            
        return details

# Usage
detector = AnomalyDetector()
data = analyzer.get_historical_data('solar_panel_001', '-7d')
anomalies = detector.detect_anomalies(data)
anomaly_details = detector.get_anomaly_details(data, anomalies)

print(f"Detected {len(anomaly_details)} anomalies")
for detail in anomaly_details[:5]:  # Show first 5 anomalies
    print(f"Anomaly at {detail['timestamp']}: Power={detail['power']}W, Score={detail['anomaly_score']:.3f}")
```

## Reporting & Alerts

### Automated Report Generation
```python
# Automated reporting system
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import pdfkit

class ReportGenerator:
    def __init__(self):
        self.template_path = "templates/report_template.html"
        
    def generate_daily_report(self, device_id, date=None):
        """Generate daily energy report"""
        if date is None:
            date = datetime.now().date()
            
        # Get data for the specified date
        start_time = f"{date}T00:00:00Z"
        end_time = f"{date + timedelta(days=1)}T00:00:00Z"
        
        analyzer = EnergyDataAnalyzer()
        data = analyzer.get_historical_data(device_id, start_time, end_time)
        
        if data.empty:
            return None
            
        # Generate charts
        charts = self.generate_charts(data, date)
        
        # Calculate statistics
        stats = self.calculate_daily_stats(data)
        
        # Generate HTML report
        html_content = self.create_html_report(stats, charts, date)
        
        # Convert to PDF
        pdf_filename = f"daily_report_{device_id}_{date}.pdf"
        pdfkit.from_string(html_content, pdf_filename)
        
        return pdf_filename
        
    def generate_charts(self, data, date):
        """Generate charts for the report"""
        charts = {}
        
        # Power generation chart
        plt.figure(figsize=(12, 6))
        plt.plot(data['_time'], data['power'])
        plt.title(f'Power Generation - {date}')
        plt.xlabel('Time')
        plt.ylabel('Power (W)')
        plt.xticks(rotation=45)
        plt.tight_layout()
        charts['power'] = 'power_chart.png'
        plt.savefig(charts['power'])
        plt.close()
        
        # Efficiency chart
        if 'efficiency' in data.columns:
            plt.figure(figsize=(12, 6))
            plt.plot(data['_time'], data['efficiency'])
            plt.title(f'System Efficiency - {date}')
            plt.xlabel('Time')
            plt.ylabel('Efficiency (%)')
            plt.xticks(rotation=45)
            plt.tight_layout()
            charts['efficiency'] = 'efficiency_chart.png'
            plt.savefig(charts['efficiency'])
            plt.close()
            
        return charts
        
    def calculate_daily_stats(self, data):
        """Calculate daily statistics"""
        return {
            'total_energy': data['power'].sum() / 1000,  # kWh
            'average_power': data['power'].mean(),
            'peak_power': data['power'].max(),
            'peak_time': data.loc[data['power'].idxmax(), '_time'],
            'average_voltage': data['voltage'].mean(),
            'average_current': data['current'].mean(),
            'average_efficiency': data.get('efficiency', pd.Series([0])).mean(),
            'data_points': len(data)
        }
        
    def create_html_report(self, stats, charts, date):
        """Create HTML report content"""
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Daily Energy Report - {date}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .stats {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }}
                .stat-item {{ background: #f5f5f5; padding: 15px; border-radius: 5px; }}
                .stat-label {{ font-weight: bold; color: #333; }}
                .stat-value {{ font-size: 1.2em; color: #007bff; }}
                .charts {{ display: grid; grid-template-columns: 1fr; gap: 20px; }}
                .chart {{ text-align: center; }}
                .chart img {{ max-width: 100%; height: auto; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Daily Energy Report</h1>
                <h2>{date}</h2>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-label">Total Energy Generated</div>
                    <div class="stat-value">{stats['total_energy']:.2f} kWh</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Average Power</div>
                    <div class="stat-value">{stats['average_power']:.1f} W</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Peak Power</div>
                    <div class="stat-value">{stats['peak_power']:.1f} W</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Average Efficiency</div>
                    <div class="stat-value">{stats['average_efficiency']:.1f}%</div>
                </div>
            </div>
            
            <div class="charts">
                <div class="chart">
                    <h3>Power Generation</h3>
                    <img src="{charts['power']}" alt="Power Generation Chart">
                </div>
                {f'<div class="chart"><h3>System Efficiency</h3><img src="{charts["efficiency"]}" alt="Efficiency Chart"></div>' if 'efficiency' in charts else ''}
            </div>
        </body>
        </html>
        """
        
        return html_template

# Usage
report_gen = ReportGenerator()
pdf_file = report_gen.generate_daily_report('solar_panel_001')
print(f"Report generated: {pdf_file}")
```

### Alert System
```python
# Comprehensive alert system
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests

class AlertSystem:
    def __init__(self, config):
        self.config = config
        self.alert_history = []
        
    def check_alerts(self, data):
        """Check for various alert conditions"""
        alerts = []
        
        # Efficiency alerts
        if data.get('efficiency', 100) < self.config['low_efficiency_threshold']:
            alerts.append({
                'type': 'warning',
                'message': f"Low efficiency detected: {data['efficiency']:.1f}%",
                'severity': 'medium'
            })
            
        # Temperature alerts
        if data.get('temperature', 0) > self.config['high_temperature_threshold']:
            alerts.append({
                'type': 'critical',
                'message': f"High temperature detected: {data['temperature']:.1f}°C",
                'severity': 'high'
            })
            
        # Power alerts
        if data.get('power', 0) < self.config['low_power_threshold']:
            alerts.append({
                'type': 'warning',
                'message': f"Low power generation: {data['power']:.1f}W",
                'severity': 'medium'
            })
            
        # Voltage alerts
        if data.get('voltage', 0) < self.config['low_voltage_threshold']:
            alerts.append({
                'type': 'critical',
                'message': f"Low voltage detected: {data['voltage']:.1f}V",
                'severity': 'high'
            })
            
        return alerts
        
    def send_email_alert(self, alert, recipients):
        """Send email alert"""
        msg = MIMEMultipart()
        msg['From'] = self.config['email']['from']
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = f"Energy Monitor Alert: {alert['type'].upper()}"
        
        body = f"""
        Alert Type: {alert['type']}
        Severity: {alert['severity']}
        Message: {alert['message']}
        Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        Please check your energy monitoring system.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP(self.config['email']['smtp_server'], self.config['email']['smtp_port'])
            server.starttls()
            server.login(self.config['email']['username'], self.config['email']['password'])
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"Email alert failed: {e}")
            return False
            
    def send_slack_alert(self, alert, webhook_url):
        """Send Slack alert"""
        payload = {
            "text": f"🚨 *Energy Monitor Alert*\n"
                   f"*Type:* {alert['type']}\n"
                   f"*Severity:* {alert['severity']}\n"
                   f"*Message:* {alert['message']}\n"
                   f"*Time:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        }
        
        try:
            response = requests.post(webhook_url, json=payload)
            return response.status_code == 200
        except Exception as e:
            print(f"Slack alert failed: {e}")
            return False
            
    def process_alerts(self, alerts, data):
        """Process and send alerts"""
        for alert in alerts:
            # Store alert in history
            alert['timestamp'] = datetime.now()
            alert['data'] = data
            self.alert_history.append(alert)
            
            # Send notifications based on severity
            if alert['severity'] == 'high':
                # Send immediate notifications
                if self.config.get('email'):
                    self.send_email_alert(alert, self.config['email']['recipients'])
                if self.config.get('slack'):
                    self.send_slack_alert(alert, self.config['slack']['webhook_url'])
                    
            elif alert['severity'] == 'medium':
                # Send notifications with delay or batch
                pass
                
        # Keep only recent alerts
        if len(self.alert_history) > 1000:
            self.alert_history = self.alert_history[-1000:]

# Configuration
alert_config = {
    'low_efficiency_threshold': 50,
    'high_temperature_threshold': 70,
    'low_power_threshold': 10,
    'low_voltage_threshold': 18,
    'email': {
        'from': 'alerts@energy-monitor.com',
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': 587,
        'username': 'your-email@gmail.com',
        'password': 'your-password',
        'recipients': ['admin@energy-monitor.com']
    },
    'slack': {
        'webhook_url': 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
    }
}

# Initialize alert system
alert_system = AlertSystem(alert_config)

# Check for alerts
data = {'efficiency': 45, 'temperature': 75, 'power': 5, 'voltage': 16}
alerts = alert_system.check_alerts(data)
alert_system.process_alerts(alerts, data)
```

## Next Steps

1. **Proceed to** [Phase 5: Analytics](../05-analytics/index.md) for advanced analytics
2. **Review** [Development Tools](../../development/index.md) for debugging techniques
3. **Check** [Troubleshooting](../../troubleshooting/index.md) for common issues
4. **Use** [References](../../references/index.md) for additional resources
</div>
