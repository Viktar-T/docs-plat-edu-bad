# IoT Platforma Edu-Badawcza Documentation

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## 🚀 Live Site

Visit the documentation at: https://docs-plat-edu-bad.vercel.app/

## Installation

```bash
npm install
```

## Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

### Automatic Deployment (Recommended)

This project is set up with GitHub Actions for automatic deployment. Every push to the `main` branch will automatically:
1. Build the documentation
2. Deploy to GitHub Pages

### Manual Deployment

If you need to deploy manually:

```bash
npm run deploy-gh-pages
```

Or using the built-in Docusaurus command:

```bash
GIT_USER=Viktar-T npm run deploy
```

### GitHub Pages Setup

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. The site will be available at: https://docs-plat-edu-bad.vercel.app/

## Project Structure

- `/docs` - Documentation content in Markdown
- `/src` - React components and pages
- `/static` - Static assets (images, etc.)
- `docusaurus.config.js` - Docusaurus configuration
- `sidebars.js` - Documentation sidebar configuration
