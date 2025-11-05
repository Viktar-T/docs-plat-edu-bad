import projectLinks, { getGitHubRepos, getDeployedServices } from '@site/src/data/links';

# Project Phases

## Project title: Real-Time Monitoring Educational and Research Platform for Integrated Renewable Energy Sources and Energy Storage Systems

## Project Overview

The platform will be used for educational and research purposes, enabling students, educators, and researchers to monitor, analyze, and visualize energy data from various sources present in the [Katedra Inżynierii Odnawialnych Źródeł Energii, ZUT](https://wksir.zut.edu.pl/struktura-wydzialu/katedra-inzynierii-odnawialnych-zrodel-energii.html).
The project consists of four technological phases — Hardware Integration and Data Acquisition, Cloud Infrastructure and Data Handling, Web Platform Development, and Visualization and Analytics.

### Target Audience

- **Educators**: Teaching renewable energy concepts and IoT monitoring
- **Researchers**: Conducting energy system analysis and optimization studies
- **Students**: Learning practical IoT and energy monitoring skills

## Project Structure

### 🏗️ [System Architecture](./architecture/index.md)

Detailed system design, component interactions, and data flow diagrams.

### 📊 [Phase 1: Hardware Integration](./phases/01-hardware/index.md)

Hardware setup, sensor integration, and MQTT communication configuration.

### ☁️ [Phase 2: Cloud Infrastructure](./phases/02-cloud/index.md)

Cloud platform setup including Node-RED, InfluxDB, and ThingsBoard.

### 🌐 [Phase 3: Web Platform](./phases/03-web/index.md)

Web application development, Grafana dashboards, and user management.

### 📈 [Phase 4: Visualization](./phases/04-visualization/index.md)

Real-time visualization, historical data analysis, and reporting.

### 📊 [Phase 5: Analytics](./phases/05-analytics/index.md)

Advanced analytics, machine learning, and predictive modeling.

### 📚 [References](./references/index.md)

External resources, documentation links, and further reading materials.

---

## 🔗 Project Links

### Web Application

<ul>
  <li>
    <strong><a href={projectLinks.webApp.url}>{projectLinks.webApp.label}</a></strong> - {projectLinks.webApp.description}
  </li>
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
