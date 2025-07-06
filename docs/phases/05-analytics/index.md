# Phase 5: Analytics

## Overview
Advanced analytics and machine learning capabilities for renewable energy monitoring, including predictive modeling, performance optimization, and intelligent insights.

## Advanced Analytics Framework

### Data Pipeline Architecture
```python
# Advanced analytics pipeline
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import logging

class EnergyAnalyticsPipeline:
    def __init__(self, config):
        self.config = config
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_importance = {}
        self.setup_logging()
        
    def setup_logging(self):
        """Setup logging for analytics pipeline"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('analytics.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def load_and_preprocess_data(self, device_id, start_date, end_date):
        """Load and preprocess energy data"""
        try:
            # Load data from InfluxDB
            analyzer = EnergyDataAnalyzer()
            data = analyzer.get_historical_data(device_id, start_date, end_date)
            
            if data.empty:
                self.logger.warning(f"No data found for device {device_id}")
                return None
                
            # Preprocess data
            processed_data = self.preprocess_features(data)
            self.logger.info(f"Loaded {len(processed_data)} data points for device {device_id}")
            
            return processed_data
            
        except Exception as e:
            self.logger.error(f"Error loading data: {e}")
            return None
            
    def preprocess_features(self, data):
        """Extract and preprocess features for analytics"""
        features = data.copy()
        
        # Convert timestamp
        features['timestamp'] = pd.to_datetime(features['_time'])
        features['hour'] = features['timestamp'].dt.hour
        features['day_of_week'] = features['timestamp'].dt.dayofweek
        features['month'] = features['timestamp'].dt.month
        features['day_of_year'] = features['timestamp'].dt.dayofyear
        
        # Add cyclical features
        features['hour_sin'] = np.sin(2 * np.pi * features['hour'] / 24)
        features['hour_cos'] = np.cos(2 * np.pi * features['hour'] / 24)
        features['day_sin'] = np.sin(2 * np.pi * features['day_of_year'] / 365)
        features['day_cos'] = np.cos(2 * np.pi * features['day_of_year'] / 365)
        
        # Add lag features
        features['power_lag_1'] = features['power'].shift(1)
        features['power_lag_6'] = features['power'].shift(6)  # 1 hour lag
        features['power_lag_24'] = features['power'].shift(24)  # 1 day lag
        
        # Add rolling statistics
        features['power_ma_1h'] = features['power'].rolling(window=6).mean()
        features['power_ma_6h'] = features['power'].rolling(window=36).mean()
        features['power_std_1h'] = features['power'].rolling(window=6).std()
        
        # Add weather features (if available)
        if 'temperature' not in features.columns:
            features['temperature'] = 25  # Default temperature
        if 'humidity' not in features.columns:
            features['humidity'] = 50  # Default humidity
        if 'wind_speed' not in features.columns:
            features['wind_speed'] = 0  # Default wind speed
            
        # Add solar position features (simplified)
        features['solar_elevation'] = self.calculate_solar_elevation(features['timestamp'])
        features['solar_azimuth'] = self.calculate_solar_azimuth(features['timestamp'])
        
        # Remove rows with NaN values
        features = features.dropna()
        
        return features
        
    def calculate_solar_elevation(self, timestamps):
        """Calculate solar elevation angle (simplified)"""
        # Simplified solar elevation calculation
        hours = timestamps.dt.hour
        elevation = np.where(
            (hours >= 6) & (hours <= 18),
            90 * np.sin(np.pi * (hours - 6) / 12),
            0
        )
        return elevation
        
    def calculate_solar_azimuth(self, timestamps):
        """Calculate solar azimuth angle (simplified)"""
        # Simplified solar azimuth calculation
        hours = timestamps.dt.hour
        azimuth = np.where(
            (hours >= 6) & (hours <= 18),
            180 + (hours - 12) * 15,
            0
        )
        return azimuth
        
    def prepare_training_data(self, features, target_column='power'):
        """Prepare data for model training"""
        # Select feature columns
        feature_columns = [
            'hour_sin', 'hour_cos', 'day_sin', 'day_cos',
            'power_lag_1', 'power_lag_6', 'power_lag_24',
            'power_ma_1h', 'power_ma_6h', 'power_std_1h',
            'temperature', 'humidity', 'wind_speed',
            'solar_elevation', 'solar_azimuth'
        ]
        
        # Ensure all columns exist
        available_columns = [col for col in feature_columns if col in features.columns]
        
        X = features[available_columns]
        y = features[target_column]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, y, available_columns
        
    def train_models(self, device_id, start_date, end_date):
        """Train multiple models for energy prediction"""
        # Load and preprocess data
        features = self.load_and_preprocess_data(device_id, start_date, end_date)
        
        if features is None:
            return None
            
        # Prepare training data
        X, y, feature_names = self.prepare_training_data(features)
        
        # Time series cross-validation
        tscv = TimeSeriesSplit(n_splits=5)
        
        # Train different models
        models = {
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'gradient_boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'linear_regression': LinearRegression(),
            'svr': SVR(kernel='rbf', C=1.0, gamma='scale')
        }
        
        results = {}
        
        for model_name, model in models.items():
            self.logger.info(f"Training {model_name} model...")
            
            # Cross-validation
            cv_scores = []
            for train_idx, val_idx in tscv.split(X):
                X_train, X_val = X[train_idx], X[val_idx]
                y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
                
                model.fit(X_train, y_train)
                y_pred = model.predict(X_val)
                
                mse = mean_squared_error(y_val, y_pred)
                mae = mean_absolute_error(y_val, y_pred)
                r2 = r2_score(y_val, y_pred)
                
                cv_scores.append({'mse': mse, 'mae': mae, 'r2': r2})
            
            # Train on full dataset
            model.fit(X, y)
            
            # Store model and results
            self.models[model_name] = model
            results[model_name] = {
                'cv_scores': cv_scores,
                'avg_mse': np.mean([s['mse'] for s in cv_scores]),
                'avg_mae': np.mean([s['mae'] for s in cv_scores]),
                'avg_r2': np.mean([s['r2'] for s in cv_scores]),
                'feature_importance': self.get_feature_importance(model, feature_names)
            }
            
        self.logger.info("Model training completed")
        return results
        
    def get_feature_importance(self, model, feature_names):
        """Extract feature importance from model"""
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importance = np.abs(model.coef_)
        else:
            importance = np.ones(len(feature_names))
            
        return dict(zip(feature_names, importance))
        
    def predict_power(self, device_id, model_name='random_forest', hours_ahead=24):
        """Predict power generation for the next N hours"""
        try:
            # Get recent data for prediction
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)
            
            features = self.load_and_preprocess_data(device_id, start_date, end_date)
            
            if features is None or model_name not in self.models:
                return None
                
            # Prepare features for prediction
            X, _, feature_names = self.prepare_training_data(features)
            
            # Make predictions
            model = self.models[model_name]
            predictions = model.predict(X[-hours_ahead:])
            
            # Create prediction timeline
            last_timestamp = features['timestamp'].iloc[-1]
            prediction_times = pd.date_range(
                start=last_timestamp + timedelta(hours=1),
                periods=hours_ahead,
                freq='H'
            )
            
            return pd.DataFrame({
                'timestamp': prediction_times,
                'predicted_power': predictions
            })
            
        except Exception as e:
            self.logger.error(f"Error making predictions: {e}")
            return None
            
    def save_models(self, filepath):
        """Save trained models"""
        model_data = {
            'models': self.models,
            'scaler': self.scaler,
            'feature_importance': self.feature_importance
        }
        joblib.dump(model_data, filepath)
        self.logger.info(f"Models saved to {filepath}")
        
    def load_models(self, filepath):
        """Load trained models"""
        model_data = joblib.load(filepath)
        self.models = model_data['models']
        self.scaler = model_data['scaler']
        self.feature_importance = model_data['feature_importance']
        self.logger.info(f"Models loaded from {filepath}")

# Usage example
config = {
    'influxdb_url': 'http://localhost:8086',
    'influxdb_token': 'your-token',
    'influxdb_org': 'energy-monitor'
}

pipeline = EnergyAnalyticsPipeline(config)

# Train models
results = pipeline.train_models(
    device_id='solar_panel_001',
    start_date='-30d',
    end_date='now'
)

# Make predictions
predictions = pipeline.predict_power('solar_panel_001', hours_ahead=24)

# Save models
pipeline.save_models('energy_models.pkl')
```

## Machine Learning Models

### Ensemble Learning
```python
# Ensemble learning for improved predictions
from sklearn.ensemble import VotingRegressor, StackingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor

class EnsembleEnergyPredictor:
    def __init__(self):
        self.base_models = {
            'rf': RandomForestRegressor(n_estimators=100, random_state=42),
            'gb': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'svr': SVR(kernel='rbf', C=1.0, gamma='scale'),
            'dt': DecisionTreeRegressor(random_state=42)
        }
        
        self.voting_regressor = VotingRegressor([
            ('rf', self.base_models['rf']),
            ('gb', self.base_models['gb']),
            ('svr', self.base_models['svr'])
        ])
        
        self.stacking_regressor = StackingRegressor([
            ('rf', self.base_models['rf']),
            ('gb', self.base_models['gb']),
            ('svr', self.base_models['svr'])
        ], final_estimator=LinearRegression())
        
    def train_ensemble(self, X, y):
        """Train ensemble models"""
        # Train individual models
        for name, model in self.base_models.items():
            model.fit(X, y)
            
        # Train voting regressor
        self.voting_regressor.fit(X, y)
        
        # Train stacking regressor
        self.stacking_regressor.fit(X, y)
        
    def predict_ensemble(self, X):
        """Make ensemble predictions"""
        predictions = {}
        
        # Individual model predictions
        for name, model in self.base_models.items():
            predictions[name] = model.predict(X)
            
        # Ensemble predictions
        predictions['voting'] = self.voting_regressor.predict(X)
        predictions['stacking'] = self.stacking_regressor.predict(X)
        
        return predictions
        
    def evaluate_ensemble(self, X, y):
        """Evaluate ensemble performance"""
        predictions = self.predict_ensemble(X)
        
        results = {}
        for name, pred in predictions.items():
            results[name] = {
                'mse': mean_squared_error(y, pred),
                'mae': mean_absolute_error(y, pred),
                'r2': r2_score(y, pred)
            }
            
        return results
```

### Deep Learning Models
```python
# Deep learning for energy prediction
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam

class DeepEnergyPredictor:
    def __init__(self, sequence_length=24, n_features=15):
        self.sequence_length = sequence_length
        self.n_features = n_features
        self.model = self.build_lstm_model()
        
    def build_lstm_model(self):
        """Build LSTM model for time series prediction"""
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(self.sequence_length, self.n_features)),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return model
        
    def prepare_sequences(self, data, target_column='power'):
        """Prepare sequences for LSTM"""
        X, y = [], []
        
        for i in range(self.sequence_length, len(data)):
            X.append(data.iloc[i-self.sequence_length:i].values)
            y.append(data.iloc[i][target_column])
            
        return np.array(X), np.array(y)
        
    def train_lstm(self, data, epochs=100, batch_size=32, validation_split=0.2):
        """Train LSTM model"""
        X, y = self.prepare_sequences(data)
        
        # Split data
        split_idx = int(len(X) * (1 - validation_split))
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=(X_val, y_val),
            verbose=1
        )
        
        return history
        
    def predict_lstm(self, data, steps_ahead=24):
        """Make LSTM predictions"""
        predictions = []
        current_sequence = data.iloc[-self.sequence_length:].values.reshape(1, self.sequence_length, self.n_features)
        
        for _ in range(steps_ahead):
            # Make prediction
            pred = self.model.predict(current_sequence)[0, 0]
            predictions.append(pred)
            
            # Update sequence for next prediction
            new_row = np.zeros((1, self.n_features))
            new_row[0, 0] = pred  # Assume power is the first feature
            current_sequence = np.roll(current_sequence, -1, axis=1)
            current_sequence[0, -1] = new_row
            
        return predictions
```

## Performance Optimization

### System Performance Analysis
```python
# Performance analysis and optimization
class PerformanceAnalyzer:
    def __init__(self):
        self.performance_metrics = {}
        
    def analyze_system_performance(self, data, device_id):
        """Analyze overall system performance"""
        analysis = {
            'device_id': device_id,
            'analysis_period': f"{len(data)} data points",
            'timestamp': datetime.now().isoformat()
        }
        
        # Energy production analysis
        analysis['energy_production'] = {
            'total_energy': data['power'].sum() / 1000,  # kWh
            'average_power': data['power'].mean(),
            'peak_power': data['power'].max(),
            'peak_time': data.loc[data['power'].idxmax(), '_time'],
            'capacity_factor': (data['power'].mean() / data['power'].max()) * 100
        }
        
        # Efficiency analysis
        if 'efficiency' in data.columns:
            analysis['efficiency'] = {
                'average_efficiency': data['efficiency'].mean(),
                'peak_efficiency': data['efficiency'].max(),
                'efficiency_std': data['efficiency'].std(),
                'efficiency_trend': self.calculate_trend(data['efficiency'])
            }
        
        # Availability analysis
        analysis['availability'] = {
            'total_hours': len(data),
            'operational_hours': len(data[data['power'] > 0]),
            'availability_rate': (len(data[data['power'] > 0]) / len(data)) * 100
        }
        
        # Performance degradation analysis
        analysis['degradation'] = self.analyze_degradation(data)
        
        return analysis
        
    def analyze_degradation(self, data):
        """Analyze system degradation over time"""
        # Calculate daily averages
        data['date'] = pd.to_datetime(data['_time']).dt.date
        daily_avg = data.groupby('date')['power'].mean().reset_index()
        
        if len(daily_avg) < 30:  # Need at least 30 days for degradation analysis
            return {'status': 'insufficient_data'}
        
        # Calculate degradation rate
        x = np.arange(len(daily_avg))
        y = daily_avg['power'].values
        
        # Linear regression for degradation trend
        slope, intercept = np.polyfit(x, y, 1)
        degradation_rate = slope / daily_avg['power'].mean() * 100  # % per day
        
        return {
            'degradation_rate_per_day': degradation_rate,
            'degradation_rate_per_year': degradation_rate * 365,
            'trend_slope': slope,
            'r_squared': np.corrcoef(x, y)[0, 1] ** 2
        }
        
    def calculate_trend(self, series):
        """Calculate trend direction and strength"""
        x = np.arange(len(series))
        y = series.values
        
        slope, intercept = np.polyfit(x, y, 1)
        correlation = np.corrcoef(x, y)[0, 1]
        
        if slope > 0:
            trend = 'increasing'
        elif slope < 0:
            trend = 'decreasing'
        else:
            trend = 'stable'
            
        return {
            'direction': trend,
            'slope': slope,
            'correlation': correlation,
            'strength': abs(correlation)
        }
        
    def generate_performance_report(self, device_id, days=30):
        """Generate comprehensive performance report"""
        # Load data
        analyzer = EnergyDataAnalyzer()
        data = analyzer.get_historical_data(device_id, f"-{days}d")
        
        if data.empty:
            return None
            
        # Perform analysis
        analysis = self.analyze_system_performance(data, device_id)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(analysis)
        
        return {
            'analysis': analysis,
            'recommendations': recommendations
        }
        
    def generate_recommendations(self, analysis):
        """Generate recommendations based on analysis"""
        recommendations = []
        
        # Efficiency recommendations
        if 'efficiency' in analysis:
            avg_efficiency = analysis['efficiency']['average_efficiency']
            if avg_efficiency < 70:
                recommendations.append({
                    'category': 'efficiency',
                    'priority': 'high',
                    'message': f"Low average efficiency ({avg_efficiency:.1f}%). Consider cleaning panels or checking for shading issues.",
                    'action': 'Inspect and clean solar panels, check for shading'
                })
        
        # Availability recommendations
        availability = analysis['availability']['availability_rate']
        if availability < 95:
            recommendations.append({
                'category': 'availability',
                'priority': 'medium',
                'message': f"System availability is {availability:.1f}%. Check for connection issues or equipment failures.",
                'action': 'Check system connections and equipment status'
            })
        
        # Degradation recommendations
        if 'degradation' in analysis and 'degradation_rate_per_year' in analysis['degradation']:
            degradation_rate = analysis['degradation']['degradation_rate_per_year']
            if degradation_rate > 2:
                recommendations.append({
                    'category': 'degradation',
                    'priority': 'high',
                    'message': f"High degradation rate detected ({degradation_rate:.2f}% per year). Consider equipment replacement.",
                    'action': 'Schedule equipment inspection and consider replacement'
                })
        
        return recommendations
```

## Predictive Maintenance

### Maintenance Prediction System
```python
# Predictive maintenance system
class PredictiveMaintenance:
    def __init__(self):
        self.maintenance_models = {}
        self.maintenance_schedule = {}
        
    def analyze_equipment_health(self, data, device_id):
        """Analyze equipment health indicators"""
        health_indicators = {
            'device_id': device_id,
            'timestamp': datetime.now().isoformat(),
            'indicators': {}
        }
        
        # Temperature analysis
        if 'temperature' in data.columns:
            temp_stats = data['temperature'].describe()
            health_indicators['indicators']['temperature'] = {
                'current': data['temperature'].iloc[-1],
                'average': temp_stats['mean'],
                'max': temp_stats['max'],
                'min': temp_stats['min'],
                'trend': self.calculate_trend(data['temperature']),
                'status': self.evaluate_temperature_health(data['temperature'])
            }
        
        # Efficiency analysis
        if 'efficiency' in data.columns:
            eff_stats = data['efficiency'].describe()
            health_indicators['indicators']['efficiency'] = {
                'current': data['efficiency'].iloc[-1],
                'average': eff_stats['mean'],
                'trend': self.calculate_trend(data['efficiency']),
                'status': self.evaluate_efficiency_health(data['efficiency'])
            }
        
        # Power output analysis
        power_stats = data['power'].describe()
        health_indicators['indicators']['power_output'] = {
            'current': data['power'].iloc[-1],
            'average': power_stats['mean'],
            'max': power_stats['max'],
            'trend': self.calculate_trend(data['power']),
            'status': self.evaluate_power_health(data['power'])
        }
        
        # Overall health score
        health_indicators['overall_health_score'] = self.calculate_overall_health(health_indicators['indicators'])
        
        return health_indicators
        
    def evaluate_temperature_health(self, temperature_series):
        """Evaluate temperature health status"""
        current_temp = temperature_series.iloc[-1]
        avg_temp = temperature_series.mean()
        
        if current_temp > 80:
            return {'status': 'critical', 'message': 'Temperature too high'}
        elif current_temp > 70:
            return {'status': 'warning', 'message': 'Temperature elevated'}
        elif current_temp < 0:
            return {'status': 'warning', 'message': 'Temperature too low'}
        else:
            return {'status': 'normal', 'message': 'Temperature within normal range'}
            
    def evaluate_efficiency_health(self, efficiency_series):
        """Evaluate efficiency health status"""
        current_eff = efficiency_series.iloc[-1]
        avg_eff = efficiency_series.mean()
        
        if current_eff < 50:
            return {'status': 'critical', 'message': 'Efficiency critically low'}
        elif current_eff < 70:
            return {'status': 'warning', 'message': 'Efficiency below optimal'}
        else:
            return {'status': 'normal', 'message': 'Efficiency within normal range'}
            
    def evaluate_power_health(self, power_series):
        """Evaluate power output health status"""
        current_power = power_series.iloc[-1]
        avg_power = power_series.mean()
        max_power = power_series.max()
        
        if current_power < avg_power * 0.5:
            return {'status': 'critical', 'message': 'Power output critically low'}
        elif current_power < avg_power * 0.8:
            return {'status': 'warning', 'message': 'Power output below average'}
        else:
            return {'status': 'normal', 'message': 'Power output normal'}
            
    def calculate_overall_health(self, indicators):
        """Calculate overall health score"""
        scores = []
        
        for indicator, data in indicators.items():
            if data['status']['status'] == 'normal':
                scores.append(100)
            elif data['status']['status'] == 'warning':
                scores.append(60)
            elif data['status']['status'] == 'critical':
                scores.append(20)
                
        return np.mean(scores) if scores else 0
        
    def predict_maintenance_needs(self, health_indicators, device_id):
        """Predict maintenance needs based on health indicators"""
        predictions = {
            'device_id': device_id,
            'timestamp': datetime.now().isoformat(),
            'maintenance_needs': []
        }
        
        overall_health = health_indicators['overall_health_score']
        
        # Immediate maintenance needs
        if overall_health < 30:
            predictions['maintenance_needs'].append({
                'type': 'immediate',
                'priority': 'critical',
                'description': 'System requires immediate attention',
                'estimated_cost': 'High',
                'recommended_actions': [
                    'Schedule emergency maintenance',
                    'Check all system components',
                    'Review recent system changes'
                ]
            })
        
        # Short-term maintenance needs
        elif overall_health < 60:
            predictions['maintenance_needs'].append({
                'type': 'short_term',
                'priority': 'high',
                'description': 'System requires maintenance within 1-2 weeks',
                'estimated_cost': 'Medium',
                'recommended_actions': [
                    'Schedule preventive maintenance',
                    'Clean solar panels',
                    'Check electrical connections'
                ]
            })
        
        # Long-term maintenance needs
        elif overall_health < 80:
            predictions['maintenance_needs'].append({
                'type': 'long_term',
                'priority': 'medium',
                'description': 'System requires maintenance within 1-2 months',
                'estimated_cost': 'Low',
                'recommended_actions': [
                    'Schedule routine maintenance',
                    'Update system software',
                    'Review performance data'
                ]
            })
        
        # Specific component recommendations
        for indicator, data in health_indicators['indicators'].items():
            if data['status']['status'] in ['warning', 'critical']:
                predictions['maintenance_needs'].append({
                    'type': 'component_specific',
                    'priority': data['status']['status'],
                    'component': indicator,
                    'description': data['status']['message'],
                    'recommended_actions': self.get_component_actions(indicator)
                })
        
        return predictions
        
    def get_component_actions(self, component):
        """Get recommended actions for specific components"""
        actions = {
            'temperature': [
                'Check cooling system',
                'Verify ventilation',
                'Inspect for overheating components'
            ],
            'efficiency': [
                'Clean solar panels',
                'Check for shading issues',
                'Verify electrical connections',
                'Inspect inverter performance'
            ],
            'power_output': [
                'Check electrical connections',
                'Verify sensor calibration',
                'Inspect power electronics',
                'Review system configuration'
            ]
        }
        
        return actions.get(component, ['Inspect component', 'Check documentation'])
        
    def schedule_maintenance(self, device_id, maintenance_type, priority):
        """Schedule maintenance activities"""
        maintenance_schedule = {
            'device_id': device_id,
            'maintenance_type': maintenance_type,
            'priority': priority,
            'scheduled_date': self.calculate_maintenance_date(priority),
            'estimated_duration': self.estimate_maintenance_duration(maintenance_type),
            'required_parts': self.get_required_parts(maintenance_type),
            'estimated_cost': self.estimate_maintenance_cost(maintenance_type, priority)
        }
        
        return maintenance_schedule
        
    def calculate_maintenance_date(self, priority):
        """Calculate maintenance date based on priority"""
        if priority == 'critical':
            return datetime.now() + timedelta(days=1)
        elif priority == 'high':
            return datetime.now() + timedelta(weeks=1)
        elif priority == 'medium':
            return datetime.now() + timedelta(weeks=4)
        else:
            return datetime.now() + timedelta(weeks=12)
            
    def estimate_maintenance_duration(self, maintenance_type):
        """Estimate maintenance duration"""
        durations = {
            'immediate': '2-4 hours',
            'short_term': '4-8 hours',
            'long_term': '1-2 days',
            'component_specific': '2-6 hours'
        }
        
        return durations.get(maintenance_type, '4-8 hours')
        
    def get_required_parts(self, maintenance_type):
        """Get required parts for maintenance"""
        parts = {
            'immediate': ['Safety equipment', 'Testing tools', 'Replacement components'],
            'short_term': ['Cleaning supplies', 'Electrical components', 'Testing equipment'],
            'long_term': ['Preventive maintenance kit', 'Software updates', 'Documentation'],
            'component_specific': ['Component-specific parts', 'Testing equipment']
        }
        
        return parts.get(maintenance_type, ['General maintenance supplies'])
        
    def estimate_maintenance_cost(self, maintenance_type, priority):
        """Estimate maintenance cost"""
        base_costs = {
            'immediate': 500,
            'short_term': 300,
            'long_term': 200,
            'component_specific': 250
        }
        
        priority_multipliers = {
            'critical': 2.0,
            'high': 1.5,
            'medium': 1.0,
            'low': 0.8
        }
        
        base_cost = base_costs.get(maintenance_type, 300)
        multiplier = priority_multipliers.get(priority, 1.0)
        
        return base_cost * multiplier
```

## Intelligent Insights

### Automated Insights Generation
```python
# Automated insights generation
class InsightGenerator:
    def __init__(self):
        self.insights = []
        
    def generate_insights(self, data, device_id):
        """Generate intelligent insights from energy data"""
        insights = {
            'device_id': device_id,
            'timestamp': datetime.now().isoformat(),
            'insights': []
        }
        
        # Performance insights
        performance_insights = self.analyze_performance_patterns(data)
        insights['insights'].extend(performance_insights)
        
        # Efficiency insights
        efficiency_insights = self.analyze_efficiency_patterns(data)
        insights['insights'].extend(efficiency_insights)
        
        # Operational insights
        operational_insights = self.analyze_operational_patterns(data)
        insights['insights'].extend(operational_insights)
        
        # Optimization insights
        optimization_insights = self.generate_optimization_recommendations(data)
        insights['insights'].extend(optimization_insights)
        
        return insights
        
    def analyze_performance_patterns(self, data):
        """Analyze performance patterns and generate insights"""
        insights = []
        
        # Peak performance analysis
        peak_power = data['power'].max()
        peak_time = data.loc[data['power'].idxmax(), '_time']
        avg_power = data['power'].mean()
        
        if peak_power > avg_power * 2:
            insights.append({
                'type': 'performance',
                'category': 'peak_performance',
                'title': 'Excellent Peak Performance',
                'description': f'System achieved peak power of {peak_power:.1f}W at {peak_time}',
                'impact': 'positive',
                'confidence': 'high'
            })
        
        # Performance consistency
        power_std = data['power'].std()
        power_cv = power_std / avg_power  # Coefficient of variation
        
        if power_cv < 0.3:
            insights.append({
                'type': 'performance',
                'category': 'consistency',
                'title': 'Consistent Performance',
                'description': f'System shows consistent performance with {power_cv:.2f} coefficient of variation',
                'impact': 'positive',
                'confidence': 'medium'
            })
        
        return insights
        
    def analyze_efficiency_patterns(self, data):
        """Analyze efficiency patterns and generate insights"""
        insights = []
        
        if 'efficiency' in data.columns:
            # Efficiency trends
            efficiency_trend = self.calculate_trend(data['efficiency'])
            
            if efficiency_trend['direction'] == 'increasing':
                insights.append({
                    'type': 'efficiency',
                    'category': 'improvement',
                    'title': 'Efficiency Improving',
                    'description': 'System efficiency is showing an improving trend',
                    'impact': 'positive',
                    'confidence': 'medium'
                })
            elif efficiency_trend['direction'] == 'decreasing':
                insights.append({
                    'type': 'efficiency',
                    'category': 'decline',
                    'title': 'Efficiency Declining',
                    'description': 'System efficiency is showing a declining trend',
                    'impact': 'negative',
                    'confidence': 'medium'
                })
        
        return insights
        
    def analyze_operational_patterns(self, data):
        """Analyze operational patterns and generate insights"""
        insights = []
        
        # Operational hours analysis
        operational_hours = len(data[data['power'] > 0])
        total_hours = len(data)
        availability = operational_hours / total_hours * 100
        
        if availability > 95:
            insights.append({
                'type': 'operational',
                'category': 'availability',
                'title': 'High System Availability',
                'description': f'System shows excellent availability of {availability:.1f}%',
                'impact': 'positive',
                'confidence': 'high'
            })
        
        # Daily patterns
        data['hour'] = pd.to_datetime(data['_time']).dt.hour
        hourly_power = data.groupby('hour')['power'].mean()
        
        peak_hour = hourly_power.idxmax()
        if peak_hour in [11, 12, 13, 14]:  # Solar noon hours
            insights.append({
                'type': 'operational',
                'category': 'timing',
                'title': 'Optimal Peak Timing',
                'description': f'System peaks at {peak_hour}:00, which is optimal for solar generation',
                'impact': 'positive',
                'confidence': 'high'
            })
        
        return insights
        
    def generate_optimization_recommendations(self, data):
        """Generate optimization recommendations"""
        insights = []
        
        # Energy storage optimization
        if data['power'].max() > data['power'].mean() * 3:
            insights.append({
                'type': 'optimization',
                'category': 'storage',
                'title': 'Energy Storage Opportunity',
                'description': 'High peak-to-average ratio suggests energy storage could improve system utilization',
                'impact': 'opportunity',
                'confidence': 'medium',
                'recommendations': [
                    'Consider adding battery storage',
                    'Implement peak shaving strategies',
                    'Optimize load timing'
                ]
            })
        
        # Maintenance optimization
        if 'efficiency' in data.columns:
            recent_efficiency = data['efficiency'].tail(24).mean()  # Last 24 hours
            historical_efficiency = data['efficiency'].mean()
            
            if recent_efficiency < historical_efficiency * 0.9:
                insights.append({
                    'type': 'optimization',
                    'category': 'maintenance',
                    'title': 'Maintenance Optimization',
                    'description': 'Recent efficiency decline suggests maintenance may be needed',
                    'impact': 'opportunity',
                    'confidence': 'medium',
                    'recommendations': [
                        'Schedule preventive maintenance',
                        'Clean solar panels',
                        'Check system connections'
                    ]
                })
        
        return insights
```

## Next Steps

1. **Review** [Development Tools](../../development/index.md) for debugging techniques
2. **Check** [Troubleshooting](../../troubleshooting/index.md) for common issues
3. **Use** [References](../../references/index.md) for additional resources
4. **Explore** [Simulation Guide](../../simulation/index.md) for testing without hardware