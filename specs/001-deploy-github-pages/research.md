# Research Findings: Deploy on GitHub Pages

## Decision: Vite Base Path Configuration

**Chosen**: Configure Vite with dynamic base path using `process.env.NODE_ENV === 'production' ? '/algorithm-visualizer/' : '/'`

**Rationale**: Ensures assets load correctly from the repository subdirectory on GitHub Pages while maintaining local development compatibility. The repository name "algorithm-visualizer" will be the base path.

**Alternatives Considered**:
- Static base path: Would require different configs for local vs production
- Root deployment: Not suitable for project pages (requires organization/user page setup)

## Decision: SPA Routing Solution

**Chosen**: Implement the spa-github-pages redirect script with custom 404.html and index.html modifications

**Rationale**: Provides clean URLs without hash fragments while ensuring direct access and refresh work correctly on GitHub Pages static hosting.

**Alternatives Considered**:
- HashRouter: Would use # in URLs, less clean but works without custom 404
- Server-side redirects: Not possible with static hosting

## Decision: Deployment Automation

**Chosen**: GitHub Actions workflow for automated builds and deployment

**Rationale**: Ensures consistent builds, automatic deployment on main branch pushes, and leverages GitHub's native Pages integration.

**Alternatives Considered**:
- Manual deployment: Error-prone and requires local build setup
- Third-party CI/CD: Unnecessary complexity for this use case

## Decision: Jekyll Processing Prevention

**Chosen**: Include `.nojekyll` file in public directory

**Rationale**: Prevents GitHub Pages from attempting Jekyll processing on files, which can cause issues with underscore-prefixed files and certain asset types.

**Alternatives Considered**:
- Rename files: Would require changing import paths
- Use Jekyll: Not needed for a React app

## Decision: Build Configuration

**Chosen**: Standard Vite production build with GitHub Actions

**Rationale**: Vite's optimized production builds provide good performance and the Actions environment ensures consistent Node.js and dependency versions.

**Alternatives Considered**:
- Custom build scripts: Unnecessary complexity
- Different bundlers: Vite is already configured and working

## Key Findings

- GitHub Pages has a 1GB repository limit and 100GB bandwidth/month free tier
- All sites served over HTTPS only
- No custom HTTP headers or server-side logic possible
- Build process must be handled via GitHub Actions
- SPA routing requires client-side redirect handling