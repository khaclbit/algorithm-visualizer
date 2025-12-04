# Build Contract: GitHub Pages Deployment

## Overview

This contract defines the requirements for the application build process to ensure compatibility with GitHub Pages deployment.

## Build Output Requirements

### Directory Structure
```
dist/
├── index.html          # Main HTML file with SPA redirect script
├── 404.html           # Custom 404 page for SPA routing
├── assets/            # Compiled CSS, JS, and other assets
│   ├── index-*.css
│   ├── index-*.js
│   └── ...
├── favicon.ico        # Favicon
└── .nojekyll         # Prevents Jekyll processing
```

### File Requirements

#### index.html
- MUST include SPA redirect script in `<head>`
- MUST load main JavaScript bundle
- MUST have correct base path references
- MUST be valid HTML5

#### 404.html
- MUST contain redirect script for SPA routing
- MUST be at least 512 bytes (IE compatibility)
- MUST redirect to index.html with path preservation

#### Assets
- MUST use hashed filenames for cache busting
- MUST have correct base paths for GitHub Pages
- MUST be optimized for production (minified, compressed)

### Build Process Contract

#### Input
- Source code in `src/`
- Public assets in `public/`
- Build configuration in `vite.config.ts`

#### Output Validation
- Build MUST succeed without errors
- All assets MUST be generated with correct paths
- Bundle size MUST be reasonable (< 5MB total)
- No console errors in production build

#### Environment Variables
- `NODE_ENV=production` MUST be set during build
- Base path MUST be configured as `/algorithm-visualizer/`

## Deployment Contract

### GitHub Actions Requirements
- MUST trigger on push to main branch
- MUST use Node.js 18+
- MUST install dependencies with `npm ci`
- MUST run build with `npm run build`
- MUST deploy `dist/` directory to GitHub Pages

### GitHub Pages Configuration
- Repository MUST be public or GitHub Pages enabled
- Source MUST be set to "GitHub Actions"
- Custom domain MAY be configured (optional)

## Testing Contract

### Pre-deployment Tests
- Build MUST complete successfully
- Local preview MUST work with `npm run preview`
- SPA routing MUST work in local preview
- All assets MUST load correctly

### Post-deployment Tests
- Application MUST load at GitHub Pages URL
- All routes MUST work with direct access
- Assets MUST load from correct paths
- No 404 errors for valid routes