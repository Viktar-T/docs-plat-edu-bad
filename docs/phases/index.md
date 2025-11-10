import { getWebApps, getGitHubRepos, getDeployedServices } from '@site/src/data/links';

# Project Phases

## Project title: Real-Time Monitoring Educational and Research Platform for Integrated Renewable Energy Sources and Energy Storage Systems

## Project Overview

The initiative delivers a two-layer experience: an Astro-based official landing site (`oze.zut.edu.pl`) hosted on the university’s infrastructure and the Docker-orchestrated OZE-Platforma-EduBad stack on the VPS. The VPS environment combines Node-RED, InfluxDB, Grafana, an Express API Gateway, and a React frontend to provide simulated (and future physical) renewable energy scenarios for education and research.

### Target Audience

- **Educators**: Teaching renewable energy concepts and IoT monitoring
- **Researchers**: Conducting energy system analysis and optimization studies
- **Students**: Learning practical IoT and energy monitoring skills

## Project Structure

### 📊 [Phase 1: Hardware Integration](./01-hardware/index.md)

Hardware setup, sensor integration, simulated telemetry sources, and MQTT or future device connectivity routed into Node-RED.

### ☁️ [Phase 2: Cloud Infrastructure](./02-cloud/index.md)

Containerized data services on the VPS: Node-RED flows, InfluxDB storage, Grafana dashboards, API Gateway foundations, and shared services deployed with Docker Compose.

### 🌐 [Phase 3: Web Platform](./03-web/index.md)

React frontend development, API Gateway consumption, authentication, and integration of Grafana resources into a unified platform experience surfaced from the VPS layer.

### 📈 [Phase 4: Visualization](./04-visualization/index.md)

Grafana workspace curation, embedded dashboards, scenario-based views, and reporting pipelines exposed through the frontend and API Gateway.

### 📊 [Phase 5: Analytics](./05-analytics/index.md)

Advanced analytics, machine learning, predictive modeling, and future enhancements that extend the API surface with derived insights.

### 📚 [References](../references/index.md)

External resources, documentation links, and further reading materials.

---

## 🔗 Project Links

### Web Application

<ul>
  {getWebApps().map((app) => (
    <li key={app.url}>
      <strong><a href={app.url}>{app.label}</a></strong> - {app.description}
    </li>
  ))}
</ul>

### GitHub Repositories

<ul>
  {getGitHubRepos().map((repo) => (
    <li key={repo.url}>
      <strong><a href={repo.url}>{repo.label}</a></strong> - {repo.description}
    </li>
  ))}
</ul>

### Deployed Services

<ul>
  {getDeployedServices().map((service) => (
    <li key={service.url}>
      <strong><a href={service.url}>{service.label}</a></strong> - {service.description}
    </li>
  ))}
</ul>
