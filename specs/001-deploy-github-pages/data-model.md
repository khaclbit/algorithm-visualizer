# Data Model: Deploy on GitHub Pages

This feature involves deployment configuration rather than application data models. No new data entities are required.

## Existing Data Models

The application uses existing graph and algorithm models defined in `src/models/graph.ts` and related files. These remain unchanged.

## Configuration Data

- **Build Configuration**: Vite config for base path (stored in `vite.config.ts`)
- **Deployment Settings**: GitHub Actions workflow configuration (stored in `.github/workflows/deploy.yml`)
- **Static Assets**: Application assets served from GitHub Pages (no data model needed)

## Validation Rules

- Repository name must be valid for GitHub Pages URLs
- Build output must fit within GitHub Pages size limits (< 1GB)
- No server-side dependencies that can't run on static hosting