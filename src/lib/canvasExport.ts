/**
 * Export SVG element to PNG image file
 * Uses the current viewBox to capture exactly what's visible on the canvas
 */
export const exportCanvasToPng = (svgElement: SVGSVGElement, filename: string = 'graph.png'): void => {
  // Clone the SVG to avoid modifying the original
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Get the current viewBox from the SVG (this represents the full canvas viewport)
  const viewBoxAttr = svgElement.getAttribute('viewBox');
  const viewBox = viewBoxAttr?.split(' ').map(Number) || [0, 0, 800, 600];
  
  // Ensure the clone has the same viewBox
  svgClone.setAttribute('viewBox', `${viewBox[0]} ${viewBox[1]} ${viewBox[2]} ${viewBox[3]}`);
  
  // Get computed styles and inline them
  const computedStyle = getComputedStyle(document.documentElement);
  
  // Get CSS variables used in the SVG
  const cssVars = [
    '--node-default', '--node-current', '--node-start', '--node-queued', 
    '--node-visited', '--node-rejected', '--node-fw-source', '--node-fw-destination',
    '--node-fw-intermediary', '--edge-default', '--edge-highlight', '--edge-visited',
    '--background', '--foreground'
  ];
  
  // Create a style element with resolved CSS variables
  const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  let cssText = '';
  
  cssVars.forEach(varName => {
    const value = computedStyle.getPropertyValue(varName).trim();
    if (value) {
      cssText += `${varName}: ${value};\n`;
    }
  });
  
  // Add inline styles for graph elements
  styleElement.textContent = `
    :root { ${cssText} }
    .graph-node { fill: hsl(${computedStyle.getPropertyValue('--node-default').trim() || '210 40% 96%'}); stroke: hsl(${computedStyle.getPropertyValue('--foreground').trim() || '222 47% 11%'}); stroke-width: 2; }
    .graph-node-current { fill: hsl(${computedStyle.getPropertyValue('--node-current').trim() || '142 76% 36%'}); }
    .graph-node-start { fill: hsl(${computedStyle.getPropertyValue('--node-start').trim() || '262 83% 58%'}); }
    .graph-node-queued { fill: hsl(${computedStyle.getPropertyValue('--node-queued').trim() || '48 96% 53%'}); }
    .graph-node-visited { fill: hsl(${computedStyle.getPropertyValue('--node-visited').trim() || '199 89% 48%'}); }
    .graph-node-rejected { fill: hsl(${computedStyle.getPropertyValue('--node-rejected').trim() || '0 84% 60%'}); }
    .graph-node-fw-source { fill: hsl(${computedStyle.getPropertyValue('--node-fw-source').trim() || '142 76% 36%'}); }
    .graph-node-fw-destination { fill: hsl(${computedStyle.getPropertyValue('--node-fw-destination').trim() || '262 83% 58%'}); }
    .graph-node-fw-intermediary { fill: hsl(${computedStyle.getPropertyValue('--node-fw-intermediary').trim() || '25 95% 53%'}); }
    .graph-edge { stroke: hsl(${computedStyle.getPropertyValue('--edge-default').trim() || '215 20% 65%'}); stroke-width: 2; fill: none; }
    .graph-edge-highlight { stroke: hsl(${computedStyle.getPropertyValue('--edge-highlight').trim() || '142 76% 36%'}); stroke-width: 3; }
    .graph-edge-visited { stroke: hsl(${computedStyle.getPropertyValue('--edge-visited').trim() || '199 89% 48%'}); stroke-width: 2.5; }
    text { font-family: system-ui, sans-serif; fill: hsl(${computedStyle.getPropertyValue('--foreground').trim() || '222 47% 11%'}); }
  `;
  
  svgClone.insertBefore(styleElement, svgClone.firstChild);
  
  // Add background rect covering the entire viewBox
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('x', String(viewBox[0]));
  bgRect.setAttribute('y', String(viewBox[1]));
  bgRect.setAttribute('width', String(viewBox[2]));
  bgRect.setAttribute('height', String(viewBox[3]));
  bgRect.setAttribute('fill', '#ffffff');
  svgClone.insertBefore(bgRect, svgClone.firstChild);
  
  // Serialize SVG
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  // Create canvas and draw the SVG
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const scale = 2; // Higher resolution
    canvas.width = viewBox[2] * scale;
    canvas.height = viewBox[3] * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }
    
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    
    // Convert to PNG and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }, 'image/png');
    
    URL.revokeObjectURL(url);
  };
  
  img.src = url;
};
