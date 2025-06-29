# Cloud Deployment

This document provides comprehensive guidance for deploying the Educational Platform for Bad Data Science to cloud infrastructure, covering containerization, orchestration, CI/CD, and operational best practices.

## Deployment Architecture Overview

The platform uses a microservices architecture deployed on Kubernetes with the following components:

```mermaid
graph TB
    subgraph "Internet"
        U[Users]
        D[IoT Devices]
    end
    
    subgraph "Load Balancer / CDN"
        LB[Azure Load Balancer]
        CDN[Azure CDN]
    end
    
    subgraph "Kubernetes Cluster"
        subgraph "Ingress"
            ING[NGINX Ingress Controller]
        end
        
        subgraph "Application Pods"
            API[API Service]
            WEB[Web Frontend]
            MQTT[MQTT Broker]
            PROC[Data Processor]
        end
        
        subgraph "Data Services"
            PG[(PostgreSQL)]
            INFLUX[(InfluxDB)]
            REDIS[(Redis)]
        end
        
        subgraph "Storage"
            PVC[Persistent Volume Claims]
            BLOB[Azure Blob Storage]
        end
    end
    
    U --> CDN
    D --> LB
    CDN --> ING
    LB --> ING
    ING --> API
    ING --> WEB
    ING --> MQTT
    API --> PG
    API --> INFLUX
    API --> REDIS
    PROC --> INFLUX
    PVC --> PG
    PVC --> INFLUX
    BLOB --> API
```

## Containerization Strategy

### Docker Configuration

#### Multi-stage Dockerfile for API Service

```dockerfile
# Multi-stage build for Python API service
FROM python:3.11-slim as builder

# Set build arguments
ARG BUILD_ENV=production
ARG VERSION=latest

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create application user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim as production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create application user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy Python dependencies from builder stage
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appuser . .

# Set environment variables
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Security: run as non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "--timeout", "120", "app:create_app()"]
```

#### Dockerfile for Web Frontend

```dockerfile
# Multi-stage build for React frontend
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
ARG REACT_APP_API_URL
ARG REACT_APP_VERSION
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_VERSION=$REACT_APP_VERSION

RUN npm run build

# Production stage with nginx
FROM nginx:alpine as production

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Security: run as non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Change ownership of nginx directories
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Container Image Management

```yaml
# Container registry configuration
container_registry:
  registry: "platformedu.azurecr.io"
  repositories:
    api: "platformedu/api"
    web: "platformedu/web"
    data-processor: "platformedu/data-processor"
    mqtt-broker: "platformedu/mqtt-broker"
  
  tagging_strategy:
    - "latest"
    - "v${VERSION}"
    - "${GIT_COMMIT_SHA}"
    - "${BRANCH_NAME}-${BUILD_NUMBER}"
  
  security:
    vulnerability_scanning: true
    content_trust: true
    image_signing: true
    
  cleanup_policy:
    keep_latest: 10
    keep_tagged: true
    retention_days: 30
```

## Kubernetes Deployment

### Namespace and Resource Quotas

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: platform-edu
  labels:
    name: platform-edu
    environment: production

---
# Resource quota
apiVersion: v1
kind: ResourceQuota
metadata:
  name: platform-edu-quota
  namespace: platform-edu
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    limits.cpu: "40"
    limits.memory: 80Gi
    persistentvolumeclaims: "10"
    services: "20"
    secrets: "20"
    configmaps: "20"

---
# Limit range
apiVersion: v1
kind: LimitRange
metadata:
  name: platform-edu-limits
  namespace: platform-edu
spec:
  limits:
  - default:
      cpu: "500m"
      memory: "1Gi"
    defaultRequest:
      cpu: "100m"
      memory: "256Mi"
    type: Container
```

### ConfigMaps and Secrets

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: platform-config
  namespace: platform-edu
data:
  DATABASE_HOST: "postgresql-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "platform_db"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  INFLUXDB_HOST: "influxdb-service"
  INFLUXDB_PORT: "8086"
  MQTT_HOST: "mqtt-service"
  MQTT_PORT: "1883"
  LOG_LEVEL: "INFO"
  ENVIRONMENT: "production"

---
# Secret for sensitive data
apiVersion: v1
kind: Secret
metadata:
  name: platform-secrets
  namespace: platform-edu
type: Opaque
data:
  DATABASE_PASSWORD: `<base64-encoded-password>`
  JWT_SECRET_KEY: `<base64-encoded-jwt-secret>`
  ENCRYPTION_KEY: `<base64-encoded-encryption-key>`
  AZURE_STORAGE_KEY: `<base64-encoded-storage-key>`
```

### API Service Deployment

```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
  namespace: platform-edu
  labels:
    app: api-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
        version: v1
    spec:
      serviceAccountName: platform-service-account
      containers:
      - name: api
        image: platformedu.azurecr.io/platformedu/api:v1.0.0
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: platform-secrets
              key: DATABASE_PASSWORD
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: platform-secrets
              key: JWT_SECRET_KEY
        envFrom:
        - configMapRef:
            name: platform-config
        resources:
          requests:
            cpu: 200m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 2Gi
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        volumeMounts:
        - name: tmp-volume
          mountPath: /tmp
        - name: logs-volume
          mountPath: /app/logs
      volumes:
      - name: tmp-volume
        emptyDir: {}
      - name: logs-volume
        emptyDir: {}
      nodeSelector:
        kubernetes.io/arch: amd64
      tolerations:
      - key: "node-type"
        operator: "Equal"
        value: "application"
        effect: "NoSchedule"

---
# Service for API
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: platform-edu
  labels:
    app: api-service
spec:
  selector:
    app: api-service
  ports:
  - name: http
    port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
```

### Database Deployment with StatefulSet

```yaml
# postgresql-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: platform-edu
spec:
  serviceName: postgresql-headless
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:14-alpine
        ports:
        - containerPort: 5432
          name: postgresql
        env:
        - name: POSTGRES_DB
          value: "platform_db"
        - name: POSTGRES_USER
          value: "platform_user"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: platform-secrets
              key: DATABASE_PASSWORD
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 4Gi
        volumeMounts:
        - name: postgresql-data
          mountPath: /var/lib/postgresql/data
        readinessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U platform_user -d platform_db
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U platform_user -d platform_db
          initialDelaySeconds: 60
          periodSeconds: 30
  volumeClaimTemplates:
  - metadata:
      name: postgresql-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "managed-premium"
      resources:
        requests:
          storage: 100Gi

---
# PostgreSQL Service
apiVersion: v1
kind: Service
metadata:
  name: postgresql-service
  namespace: platform-edu
spec:
  selector:
    app: postgresql
  ports:
  - name: postgresql
    port: 5432
    targetPort: 5432
  type: ClusterIP
```

### Ingress Configuration

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: platform-ingress
  namespace: platform-edu
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.platform.edu
    - app.platform.edu
    secretName: platform-tls
  rules:
  - host: api.platform.edu
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
  - host: app.platform.edu
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: platformedu.azurecr.io
  IMAGE_NAME: platformedu/api

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.9, 3.10, 3.11]
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Cache pip dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run linting
      run: |
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
        black --check .
        isort --check-only .
    
    - name: Run security scan
      run: |
        bandit -r . -f json -o bandit-report.json
        safety check
    
    - name: Run tests
      run: |
        pytest --cov=app --cov-report=xml --cov-report=html
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379/0
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Azure Container Registry
      uses: azure/docker-login@v1
      with:
        login-server: ${{ env.REGISTRY }}
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./Dockerfile
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Set up Kubernetes context
      uses: azure/aks-set-context@v3
      with:
        resource-group: 'platform-edu-rg'
        cluster-name: 'platform-edu-aks'
    
    - name: Deploy to Kubernetes
      run: |
        # Update deployment with new image
        kubectl set image deployment/api-service \
          api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
          -n platform-edu
        
        # Wait for rollout to complete
        kubectl rollout status deployment/api-service -n platform-edu --timeout=300s
        
        # Verify deployment
        kubectl get pods -n platform-edu -l app=api-service
    
    - name: Run post-deployment tests
      run: |
        # Wait for service to be ready
        kubectl wait --for=condition=ready pod -l app=api-service -n platform-edu --timeout=300s
        
        # Run smoke tests
        python scripts/smoke_tests.py --endpoint https://api.platform.edu
```

### Helm Charts for Complex Deployments

```yaml
# helm/platform-edu/Chart.yaml
apiVersion: v2
name: platform-edu
description: Educational Platform for Bad Data Science
type: application
version: 1.0.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: 12.1.9
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.4.3
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
  - name: influxdb
    version: 4.12.0
    repository: https://helm.influxdata.com/
    condition: influxdb.enabled
```

```yaml
# helm/platform-edu/values.yaml
global:
  imageRegistry: platformedu.azurecr.io
  storageClass: managed-premium

api:
  image:
    repository: platformedu/api
    tag: "1.0.0"
    pullPolicy: IfNotPresent
  
  replicaCount: 3
  
  resources:
    requests:
      cpu: 200m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 2Gi
  
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80

web:
  image:
    repository: platformedu/web
    tag: "1.0.0"
    pullPolicy: IfNotPresent
  
  replicaCount: 2
  
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 1Gi

postgresql:
  enabled: true
  auth:
    existingSecret: platform-secrets
    secretKeys:
      adminPasswordKey: DATABASE_PASSWORD
  primary:
    persistence:
      enabled: true
      size: 100Gi
      storageClass: managed-premium

redis:
  enabled: true
  auth:
    enabled: false
  master:
    persistence:
      enabled: true
      size: 20Gi

influxdb:
  enabled: true
  persistence:
    enabled: true
    size: 500Gi
    storageClass: managed-premium

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: api.platform.edu
      paths:
        - path: /
          pathType: Prefix
          service: api-service
    - host: app.platform.edu
      paths:
        - path: /
          pathType: Prefix
          service: web-service
  tls:
    - secretName: platform-tls
      hosts:
        - api.platform.edu
        - app.platform.edu
```

## Infrastructure as Code (IaC)

### Terraform Configuration

```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
  
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "terraformstate"
    container_name       = "tfstate"
    key                  = "platform-edu.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  
  tags = var.common_tags
}

# Azure Kubernetes Service
resource "azurerm_kubernetes_cluster" "main" {
  name                = var.cluster_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = var.cluster_name
  
  default_node_pool {
    name                = "system"
    node_count          = var.system_node_count
    vm_size             = var.system_node_size
    type                = "VirtualMachineScaleSets"
    availability_zones  = ["1", "2", "3"]
    enable_auto_scaling = true
    min_count          = 1
    max_count          = 5
    
    # Only system workloads on this node pool
    only_critical_addons_enabled = true
  }
  
  # Application node pool
  additional_node_pools {
    name                = "apps"
    node_count          = var.app_node_count
    vm_size             = var.app_node_size
    availability_zones  = ["1", "2", "3"]
    enable_auto_scaling = true
    min_count          = 2
    max_count          = 20
    
    node_taints = ["node-type=application:NoSchedule"]
  }
  
  identity {
    type = "SystemAssigned"
  }
  
  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
    network_policy    = "azure"
  }
  
  addon_profile {
    azure_policy {
      enabled = true
    }
    
    oms_agent {
      enabled                    = true
      log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
    }
  }
  
  tags = var.common_tags
}

# Container Registry
resource "azurerm_container_registry" "main" {
  name                = var.registry_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Premium"
  admin_enabled       = false
  
  georeplications {
    location = "East US 2"
    tags     = var.common_tags
  }
  
  tags = var.common_tags
}

# Grant AKS access to ACR
resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.cluster_name}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  
  tags = var.common_tags
}

# Application Gateway for Ingress
resource "azurerm_application_gateway" "main" {
  name                = "${var.cluster_name}-agw"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  
  sku {
    name     = "WAF_v2"
    tier     = "WAF_v2"
    capacity = 2
  }
  
  gateway_ip_configuration {
    name      = "appGatewayIpConfig"
    subnet_id = azurerm_subnet.agw.id
  }
  
  frontend_port {
    name = "httpsPort"
    port = 443
  }
  
  frontend_port {
    name = "httpPort"
    port = 80
  }
  
  frontend_ip_configuration {
    name                 = "appGatewayFrontendIP"
    public_ip_address_id = azurerm_public_ip.agw.id
  }
  
  backend_address_pool {
    name = "appGatewayBackendPool"
  }
  
  backend_http_settings {
    name                  = "appGatewayBackendHttpSettings"
    cookie_based_affinity = "Disabled"
    port                  = 80
    protocol              = "Http"
    request_timeout       = 20
  }
  
  http_listener {
    name                           = "appGatewayHttpListener"
    frontend_ip_configuration_name = "appGatewayFrontendIP"
    frontend_port_name             = "httpPort"
    protocol                       = "Http"
  }
  
  request_routing_rule {
    name                       = "rule1"
    rule_type                  = "Basic"
    http_listener_name         = "appGatewayHttpListener"
    backend_address_pool_name  = "appGatewayBackendPool"
    backend_http_settings_name = "appGatewayBackendHttpSettings"
  }
  
  tags = var.common_tags
}

# Output values
output "kube_config" {
  value     = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive = true
}

output "registry_login_server" {
  value = azurerm_container_registry.main.login_server
}
```

## Monitoring and Observability

### Prometheus and Grafana Setup

```yaml
# monitoring/prometheus-values.yaml
prometheus:
  prometheusSpec:
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: managed-premium
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 100Gi
    
    additionalScrapeConfigs:
      - job_name: 'platform-api'
        static_configs:
          - targets: ['api-service:80']
        metrics_path: '/metrics'
        scrape_interval: 30s
      
      - job_name: 'platform-devices'
        static_configs:
          - targets: ['mqtt-service:9090']
        metrics_path: '/metrics'
        scrape_interval: 60s

grafana:
  adminPassword: ${GRAFANA_ADMIN_PASSWORD}
  persistence:
    enabled: true
    storageClassName: managed-premium
    size: 10Gi
  
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
      - name: 'platform-dashboards'
        orgId: 1
        folder: 'Platform'
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /var/lib/grafana/dashboards/platform
  
  dashboards:
    platform:
      api-metrics:
        gnetId: 893
        revision: 1
        datasource: Prometheus
      
      kubernetes-overview:
        gnetId: 7249
        revision: 1
        datasource: Prometheus
```

### Application Performance Monitoring

```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import functools

# Metrics definitions
REQUEST_COUNT = Counter(
    'http_requests_total', 
    'Total HTTP requests', 
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

DATABASE_CONNECTIONS = Gauge(
    'database_connections_active',
    'Active database connections'
)

def monitor_endpoint(func):
    """Decorator to monitor API endpoint performance"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        method = request.method
        endpoint = request.endpoint or 'unknown'
        
        try:
            response = func(*args, **kwargs)
            status = response.status_code if hasattr(response, 'status_code') else 200
            
            # Record metrics
            REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
            REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(
                time.time() - start_time
            )
            
            return response
        except Exception as e:
            REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=500).inc()
            REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(
                time.time() - start_time
            )
            raise
    
    return wrapper

# Start metrics server
start_http_server(9090)
```

## Disaster Recovery and Backup

### Backup Strategy

```yaml
# velero-values.yaml
configuration:
  provider: azure
  backupStorageLocation:
    bucket: platform-edu-backups
    config:
      resourceGroup: platform-edu-rg
      storageAccount: platformedubackups
  
  volumeSnapshotLocation:
    config:
      resourceGroup: platform-edu-rg

# Backup schedules
schedules:
  daily-backup:
    schedule: "0 2 * * *"  # Daily at 2 AM
    template:
      ttl: "720h"  # 30 days
      includedNamespaces:
        - platform-edu
      excludedResources:
        - secrets
        - configmaps
  
  weekly-full-backup:
    schedule: "0 3 * * 0"  # Weekly on Sunday at 3 AM
    template:
      ttl: "2160h"  # 90 days
      includedNamespaces:
        - platform-edu
      includeClusterResources: true
```

### Database Backup Automation

```bash
#!/bin/bash
# database-backup.sh

set -euo pipefail

# Configuration
BACKUP_RETENTION_DAYS=30
AZURE_STORAGE_ACCOUNT="platformedubackups"
AZURE_CONTAINER="database-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# PostgreSQL backup
echo "Starting PostgreSQL backup..."
PGPASSWORD=$DATABASE_PASSWORD pg_dump \
  -h $DATABASE_HOST \
  -U $DATABASE_USER \
  -d $DATABASE_NAME \
  --verbose \
  --no-owner \
  --no-privileges \
  | gzip > postgresql_backup_$TIMESTAMP.sql.gz

# InfluxDB backup
echo "Starting InfluxDB backup..."
influxd backup \
  -host $INFLUXDB_HOST:8088 \
  -database sensor_data \
  influxdb_backup_$TIMESTAMP/

tar -czf influxdb_backup_$TIMESTAMP.tar.gz influxdb_backup_$TIMESTAMP/
rm -rf influxdb_backup_$TIMESTAMP/

# Upload to Azure Blob Storage
echo "Uploading backups to Azure Storage..."
az storage blob upload \
  --account-name $AZURE_STORAGE_ACCOUNT \
  --container-name $AZURE_CONTAINER \
  --name "postgresql/postgresql_backup_$TIMESTAMP.sql.gz" \
  --file postgresql_backup_$TIMESTAMP.sql.gz

az storage blob upload \
  --account-name $AZURE_STORAGE_ACCOUNT \
  --container-name $AZURE_CONTAINER \
  --name "influxdb/influxdb_backup_$TIMESTAMP.tar.gz" \
  --file influxdb_backup_$TIMESTAMP.tar.gz

# Cleanup local files
rm -f postgresql_backup_$TIMESTAMP.sql.gz
rm -f influxdb_backup_$TIMESTAMP.tar.gz

# Cleanup old backups
echo "Cleaning up old backups..."
CUTOFF_DATE=$(date -d "$BACKUP_RETENTION_DAYS days ago" +%Y-%m-%d)

az storage blob list \
  --account-name $AZURE_STORAGE_ACCOUNT \
  --container-name $AZURE_CONTAINER \
  --query "[?properties.lastModified<=\`$CUTOFF_DATE\`].name" \
  --output tsv | \
while read blob_name; do
  az storage blob delete \
    --account-name $AZURE_STORAGE_ACCOUNT \
    --container-name $AZURE_CONTAINER \
    --name "$blob_name"
  echo "Deleted old backup: $blob_name"
done

echo "Backup completed successfully!"
```

## Educational Notes

### Learning Objectives
- Understand modern cloud deployment practices
- Learn containerization and orchestration concepts
- Practice Infrastructure as Code (IaC) principles
- Experience CI/CD pipeline implementation
- Learn monitoring and observability best practices

### Key Deployment Concepts
1. **Containerization**: Packaging applications with dependencies
2. **Orchestration**: Managing containerized applications at scale
3. **Infrastructure as Code**: Version-controlled infrastructure
4. **GitOps**: Git-driven deployment workflows
5. **Observability**: Monitoring, logging, and tracing

### Best Practices Demonstrated
- **Multi-stage Docker builds** for optimized images
- **Security by default** with non-root containers
- **Resource management** with requests and limits
- **High availability** with multiple replicas and zones
- **Automated testing** in CI/CD pipelines

### Common Deployment Pitfalls
- **Resource misallocation**: Not setting proper limits
- **Security vulnerabilities**: Running as root, outdated images
- **Poor monitoring**: Insufficient observability
- **Inadequate backup**: No disaster recovery plan
- **Manual processes**: Lack of automation

### Next Steps
- Implement blue-green deployments for zero-downtime updates
- Add chaos engineering practices for resilience testing
- Enhance security with admission controllers and policies
- Implement multi-region disaster recovery
- Add cost optimization and resource right-sizing
