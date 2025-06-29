# Data Pipelines

This document outlines the data pipeline architecture for processing sensor data from hardware devices to cloud storage and analytics systems.

## Overview

The data pipeline system handles the ingestion, processing, validation, and storage of sensor data collected from the hardware phase. It ensures data quality, implements proper error handling, and provides scalable processing capabilities.

## Pipeline Architecture

### 1. Data Ingestion Layer

#### Real-time Ingestion
```python
# Apache Kafka consumer for real-time data
from kafka import KafkaConsumer
import json

class SensorDataConsumer:
    def __init__(self, topics, bootstrap_servers):
        self.consumer = KafkaConsumer(
            *topics,
            bootstrap_servers=bootstrap_servers,
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
    
    def process_messages(self):
        for message in self.consumer:
            sensor_data = message.value
            self.validate_and_process(sensor_data)
```

#### Batch Ingestion
```python
# Azure Data Factory pipeline for batch processing
{
  "name": "SensorDataBatchPipeline",
  "properties": {
    "activities": [
      {
        "name": "CopyFromBlob",
        "type": "Copy",
        "inputs": [
          {
            "referenceName": "SensorDataBlob",
            "type": "DatasetReference"
          }
        ],
        "outputs": [
          {
            "referenceName": "ProcessedDataSink",
            "type": "DatasetReference"
          }
        ]
      }
    ]
  }
}
```

### 2. Data Processing Layer

#### Stream Processing with Apache Spark
```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *

# Initialize Spark session
spark = SparkSession.builder \
    .appName("SensorDataProcessor") \
    .config("spark.streaming.kafka.maxRatePerPartition", "1000") \
    .getOrCreate()

# Define schema for sensor data
sensor_schema = StructType([
    StructField("device_id", StringType(), True),
    StructField("timestamp", TimestampType(), True),
    StructField("temperature", DoubleType(), True),
    StructField("humidity", DoubleType(), True),
    StructField("pressure", DoubleType(), True),
    StructField("location", StructType([
        StructField("latitude", DoubleType(), True),
        StructField("longitude", DoubleType(), True)
    ]), True)
])

# Read streaming data
df = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "sensor-data") \
    .load()

# Process and transform data
processed_df = df.select(
    from_json(col("value").cast("string"), sensor_schema).alias("data")
).select("data.*") \
.withColumn("processing_time", current_timestamp()) \
.filter(col("temperature").between(-50, 100)) \
.filter(col("humidity").between(0, 100))
```

### 3. Data Validation and Quality Checks

#### Validation Rules
```python
class DataValidator:
    def __init__(self):
        self.validation_rules = {
            'temperature': {'min': -50, 'max': 100},
            'humidity': {'min': 0, 'max': 100},
            'pressure': {'min': 800, 'max': 1200},
            'required_fields': ['device_id', 'timestamp']
        }
    
    def validate_record(self, record):
        errors = []
        
        # Check required fields
        for field in self.validation_rules['required_fields']:
            if field not in record or record[field] is None:
                errors.append(f"Missing required field: {field}")
        
        # Validate ranges
        for field, range_config in self.validation_rules.items():
            if isinstance(range_config, dict) and 'min' in range_config:
                value = record.get(field)
                if value is not None:
                    if value < range_config['min'] or value > range_config['max']:
                        errors.append(f"{field} out of range: {value}")
        
        return len(errors) == 0, errors
```

### 4. Error Handling and Dead Letter Queues

#### Error Processing Pipeline
```python
class ErrorHandler:
    def __init__(self, dead_letter_topic="sensor-data-errors"):
        self.dead_letter_topic = dead_letter_topic
        self.retry_attempts = 3
    
    def handle_processing_error(self, record, error, attempt=1):
        if attempt <= self.retry_attempts:
            # Retry with exponential backoff
            time.sleep(2 ** attempt)
            return self.process_with_retry(record, attempt + 1)
        else:
            # Send to dead letter queue
            self.send_to_dlq(record, error)
    
    def send_to_dlq(self, record, error):
        error_record = {
            'original_record': record,
            'error_message': str(error),
            'error_timestamp': datetime.utcnow().isoformat(),
            'processing_stage': 'validation'
        }
        # Send to Kafka dead letter topic
        self.producer.send(self.dead_letter_topic, error_record)
```

## Pipeline Stages

### Stage 1: Raw Data Ingestion
- **Input**: IoT device data via MQTT/HTTP
- **Processing**: Basic format validation
- **Output**: Raw data stored in Azure Blob Storage
- **Monitoring**: Message count, throughput metrics

### Stage 2: Data Cleansing and Validation
- **Input**: Raw sensor data
- **Processing**: 
  - Data type validation
  - Range validation
  - Duplicate detection
  - Missing value handling
- **Output**: Validated data in staging area
- **Monitoring**: Validation success rate, error types

### Stage 3: Data Enrichment
- **Input**: Validated sensor data
- **Processing**:
  - Geolocation enrichment
  - Device metadata joining
  - Calculated fields (heat index, dew point)
- **Output**: Enriched data ready for analytics
- **Monitoring**: Enrichment processing time

### Stage 4: Data Storage and Indexing
- **Input**: Enriched sensor data
- **Processing**: 
  - Partitioning by date and device
  - Index creation for fast queries
  - Data compression
- **Output**: Analytics-ready data in data warehouse
- **Monitoring**: Storage utilization, query performance

## Data Flow Configuration

### Apache Airflow DAG
```python
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-engineering',
    'depends_on_past': False,
    'start_date': datetime(2025, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'sensor_data_pipeline',
    default_args=default_args,
    description='Process sensor data from IoT devices',
    schedule_interval='@hourly',
    catchup=False
)

def extract_sensor_data(**context):
    # Extract data from source systems
    pass

def validate_data(**context):
    # Validate extracted data
    pass

def transform_data(**context):
    # Apply transformations and enrichments
    pass

def load_to_warehouse(**context):
    # Load processed data to data warehouse
    pass

# Define task dependencies
extract_task = PythonOperator(
    task_id='extract_sensor_data',
    python_callable=extract_sensor_data,
    dag=dag
)

validate_task = PythonOperator(
    task_id='validate_data',
    python_callable=validate_data,
    dag=dag
)

transform_task = PythonOperator(
    task_id='transform_data',
    python_callable=transform_data,
    dag=dag
)

load_task = PythonOperator(
    task_id='load_to_warehouse',
    python_callable=load_to_warehouse,
    dag=dag
)

extract_task >> validate_task >> transform_task >> load_task
```

## Monitoring and Alerting

### Key Performance Indicators (KPIs)
- **Throughput**: Messages processed per second
- **Latency**: End-to-end processing time
- **Error Rate**: Percentage of failed messages
- **Data Quality**: Validation success rate
- **Resource Utilization**: CPU, memory, and storage usage

### Alerting Rules
```yaml
# Prometheus alerting rules
groups:
  - name: data_pipeline_alerts
    rules:
      - alert: HighErrorRate
        expr: error_rate > 0.05
        for: 5m
        annotations:
          summary: "High error rate in data pipeline"
          description: "Error rate is {{ $value }}% for the last 5 minutes"
      
      - alert: ProcessingLatencyHigh
        expr: processing_latency_p95 > 30
        for: 10m
        annotations:
          summary: "High processing latency"
          description: "95th percentile latency is {{ $value }} seconds"
```

## Scalability Considerations

### Horizontal Scaling
- **Kafka Partitioning**: Scale message processing across multiple partitions
- **Spark Executors**: Add more executors for increased processing power
- **Container Orchestration**: Use Kubernetes for automatic scaling

### Vertical Scaling
- **Resource Allocation**: Increase CPU and memory for processing nodes
- **Storage Optimization**: Use faster storage for temporary processing

### Cost Optimization
- **Spot Instances**: Use spot instances for non-critical batch processing
- **Data Lifecycle**: Implement tiered storage for cost-effective archival
- **Auto-scaling**: Configure automatic scaling based on workload

## Security and Compliance

### Data Encryption
- **In Transit**: TLS/SSL for all data transfers
- **At Rest**: AES-256 encryption for stored data
- **Key Management**: Azure Key Vault for encryption keys

### Access Control
- **Authentication**: OAuth 2.0 for service authentication
- **Authorization**: Role-based access control (RBAC)
- **Audit Logging**: Comprehensive logging of all data access

### Compliance Requirements
- **Data Retention**: Configurable retention policies
- **Data Lineage**: Track data from source to destination
- **GDPR Compliance**: Right to erasure implementation

## Best Practices

### Development Guidelines
1. **Idempotency**: Ensure pipeline operations are idempotent
2. **Schema Evolution**: Support backward-compatible schema changes
3. **Testing**: Implement comprehensive unit and integration tests
4. **Documentation**: Maintain up-to-date pipeline documentation

### Operational Guidelines
1. **Monitoring**: Implement comprehensive monitoring and alerting
2. **Backup and Recovery**: Regular backups and disaster recovery procedures
3. **Capacity Planning**: Monitor resource usage and plan for growth
4. **Performance Tuning**: Regular performance optimization reviews

## Educational Notes

### Learning Objectives
- Understand data pipeline architecture patterns
- Learn stream vs. batch processing trade-offs
- Practice implementing data validation and quality checks
- Experience with modern data pipeline tools

### Common Pitfalls
- **Backpressure**: Not handling varying data volumes
- **Schema Changes**: Breaking downstream consumers
- **Error Handling**: Insufficient error handling and recovery
- **Resource Management**: Poor resource allocation and scaling

### Next Steps
- Implement real-time alerting dashboard
- Add machine learning model inference to pipeline
- Optimize for specific use case requirements
- Integrate with additional data sources
