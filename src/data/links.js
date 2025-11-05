/**
 * Centralized project links configuration
 * 
 * This file contains all project-related links that can be imported
 * and used across different parts of the documentation site.
 */

const projectLinks = {
  // Main web application
  webApp: {
    label: 'IoT Platforma Edu-Badawcza',
    url: 'https://edu.latacko.pl/',
    description: 'Main web application for the IoT Educational and Research Platform',
  },

  // GitHub repositories
  github: {
    documentation: {
      label: 'GitHub - Documentation',
      url: 'https://github.com/Viktar-T/docs-plat-edu-bad',
      description: 'Documentation repository',
    },
    dataMvp: {
      label: 'GitHub - Data MVP',
      url: 'https://github.com/Viktar-T/plat-edu-bad-data-mvp',
      description: 'Data MVP repository',
    },
  },

  // Institutions
  institutions: {
    katedra: {
      label: 'Katedra Inżynierii Odnawialnych Źródeł Energii',
      url: 'https://wksir.zut.edu.pl/struktura-wydzialu/katedra-inzynierii-odnawialnych-zrodel-energii.html',
      description: 'Department of Renewable Energy Sources Engineering',
    },
    technikum: {
      label: 'Technikum Łączności i Multimediów Cyfrowych w Szczecinie',
      url: 'https://tlimc.szczecin.pl/',
      description: 'Technical School of Communications and Digital Media in Szczecin',
    },
  },

  // Demo/Live applications
  demos: {
    frontend: {
      label: 'Deployed Frontend App',
      url: 'https://viktar-t.github.io/plat-edu-bad-front/',
      description: 'Live demo of the frontend application',
    },
  },

  // Deployed infrastructure services
  deployed: {
    nodeRed: {
      label: 'Node-RED Flow',
      url: 'http://robert108.mikrus.xyz:40100/#flow/241aa81308afbdc3',
      description: 'Node-RED flow editor and automation',
    },
    influxDB: {
      label: 'InfluxDB',
      url: 'http://robert108.mikrus.xyz:40101/signin?returnTo=/orgs/f68b3858c2bf3a86/data-explorer',
      description: 'InfluxDB time-series database',
    },
    grafana: {
      label: 'Grafana Dashboard',
      url: 'http://robert108.mikrus.xyz:40099/d/e3a5bf34-820e-4af5-bf64-37d796ecd72d/biogas-plant-metrics?orgId=1&refresh=30s',
      description: 'Grafana dashboard for monitoring',
    },
  },
};

/**
 * Helper function to get all GitHub repositories as an array
 * Useful for rendering lists of repositories
 */
export function getGitHubRepos() {
  return Object.values(projectLinks.github);
}

/**
 * Helper function to get all institutions as an array
 */
export function getInstitutions() {
  return Object.values(projectLinks.institutions);
}

/**
 * Helper function to get all demo links as an array
 */
export function getDemos() {
  return Object.values(projectLinks.demos);
}

/**
 * Helper function to get all deployed infrastructure services as an array
 */
export function getDeployedServices() {
  return Object.values(projectLinks.deployed);
}

/**
 * Helper function to get a link by category and key
 * @param {string} category - The category (e.g., 'github', 'institutions')
 * @param {string} key - The key within the category (e.g., 'documentation')
 * @returns {object|null} The link object or null if not found
 */
export function getLink(category, key) {
  return projectLinks[category]?.[key] || null;
}

// Export the main links object and helper functions
export default projectLinks;

