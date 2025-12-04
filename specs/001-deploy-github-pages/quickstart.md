# Quickstart: Deploy to GitHub Pages

## Prerequisites

- GitHub repository named `algorithm-visualizer`
- Repository is public or GitHub Pages is enabled for private repos
- Node.js 18+ installed locally
- GitHub account with repository access

## Local Setup

1. **Clone and setup the project**:
   ```bash
   git clone https://github.com/yourusername/algorithm-visualizer.git
   cd algorithm-visualizer
   npm install
   ```

2. **Test locally**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173` to verify the app works.

3. **Test production build**:
   ```bash
   npm run build
   npm run preview
   ```
   Visit `http://localhost:4173` to test the production build.

## GitHub Pages Setup

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Configure repository**:
   - Ensure repository name is `algorithm-visualizer`
   - The build will use `/algorithm-visualizer/` as the base path

3. **Deploy automatically**:
   - Push changes to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Visit `https://yourusername.github.io/algorithm-visualizer` to see the deployed app

## Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to gh-pages branch**:
   ```bash
   npx gh-pages -d dist
   ```

3. **Configure GitHub Pages**:
   - In repository Settings → Pages
   - Set source to "Deploy from a branch"
   - Select `gh-pages` branch and `/ (root)` folder

## Troubleshooting

### Assets not loading
- Check that `vite.config.ts` has correct base path: `base: '/algorithm-visualizer/'`
- Verify `.nojekyll` file exists in `public/`

### Routing issues
- Ensure `404.html` and redirect script are in `public/`
- Check that React Router uses `BrowserRouter`

### Build failures
- Ensure all dependencies are installed: `npm ci`
- Check Node.js version is 18+
- Verify build scripts in `package.json`

## Development Workflow

1. Make changes to code
2. Test locally with `npm run dev`
3. Test production build with `npm run build && npm run preview`
4. Commit and push to `main` branch
5. GitHub Actions handles deployment automatically
6. Check deployment at `https://yourusername.github.io/algorithm-visualizer`