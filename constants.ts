
export const CFG = {
  count: 3000,
  atlas: 4096, // Upgraded from 2048 for much sharper images
  cols: 16,    // 16x16 = 256 slots
  pinchDist: 0.05,
};

// Vertex Shader for Glow Particles
export const GLOW_VERTEX_SHADER = `
attribute vec3 color; 
attribute float size; 
attribute float isPhoto; 
varying vec3 vColor; 
varying float vRand;
uniform float uRatio; 
void main() { 
  vColor = color; 
  vRand = fract(sin(dot(position.xy ,vec2(12.9898,78.233))) * 43758.5453);
  
  vec4 mv = modelViewMatrix * vec4(position, 1.0); 
  float finalSize = size * 0.6 * uRatio * (400.0 / -mv.z);
  
  // Strict check: if it's a photo, hide the glow dot completely
  if (isPhoto > 0.5) {
    finalSize = 0.0;
  }
  
  gl_PointSize = finalSize; 
  gl_Position = projectionMatrix * mv; 
}
`;

// Fragment Shader for Glow Particles
export const GLOW_FRAGMENT_SHADER = `
varying vec3 vColor; 
varying float vRand;
uniform float uOpacity; 
uniform float uTime;
void main() { 
  float d = distance(gl_PointCoord, vec2(0.5)); 
  if(d > 0.5) discard; 
  
  float glow = 1.0 - d*2.0; 
  glow = pow(glow, 1.5); 
  float twinkle = 0.4 + 0.6 * (0.5 + 0.5 * sin(uTime * 3.0 + vRand * 10.0));
  
  // Increased intensity from 2.0 to 4.0 to ensure bloom works with the higher threshold (0.85)
  // This keeps particles glowing while photos (capped at 0.8) remain flat.
  gl_FragColor = vec4(vColor * 4.0, uOpacity * glow * twinkle); 
}
`;

// Vertex Shader for Photo Particles
// Optimized for Cylindrical Gallery View
export const PHOTO_VERTEX_SHADER = `
attribute float imgIndex; 
attribute float isPhoto; 
varying vec2 vUv; 
varying float vIsPhoto; 
uniform float cols, uRatio; 

void main() { 
  vIsPhoto = isPhoto; 
  
  // Calculate UVs based on grid index
  float c = mod(imgIndex, cols); 
  float r = floor(imgIndex / cols); 
  // Slight UV padding in shader (0.01) to further prevent bleeding
  vUv = vec2(c/cols, 1.0 - (r+1.0)/cols); 
  
  vec4 mv = modelViewMatrix * vec4(position, 1.0); 
  
  // Adjusted size calculation
  // Base size reduced from 80.0 to 50.0 to keep photos from looking huge
  float pSize = 50.0 * uRatio * (300.0 / -mv.z);
  
  // Clamp maximum size strictly (e.g., 200px equivalent) to prevent them from taking over the screen
  gl_PointSize = min(pSize, 200.0 * uRatio); 
  
  gl_Position = projectionMatrix * mv; 
}
`;

// Fragment Shader for Photo Particles
// REWRITTEN: Natural color, no bloom, no wash-out.
export const PHOTO_FRAGMENT_SHADER = `
uniform sampler2D tex; 
uniform float uOpacity; 
uniform float cols; 
uniform float uHandOpen; 
varying vec2 vUv; 
varying float vIsPhoto; 

void main() { 
  // 1. Cull non-photo particles
  if(vIsPhoto < 0.5) discard; 
  if(uOpacity < 0.01) discard; 
  
  // 2. UV Calculation with padding
  // We use a small inset (0.05) within the tile to avoid reading neighbor pixels (Ghosting fix)
  vec2 uvCoord = gl_PointCoord;
  vec2 tiledUV = vec2(
    vUv.x + (uvCoord.x * 0.96 + 0.02) / cols, 
    vUv.y + ((1.0 - uvCoord.y) * 0.96 + 0.02) / cols
  );
  
  vec4 texColor = texture2D(tex, tiledUV);
  
  // 3. Black background Transparency
  // Assuming the texture atlas has black/transparent pixels where there is no image.
  // We fade out dark pixels slightly to create a cutout effect if the image has a black bg.
  if(texColor.a < 0.1) discard;

  // 4. Color Processing - NO BLOOM
  // Normal state: 60% brightness (looks like a photo in dim light)
  // Open Hand state: 100% brightness (looks like a lit photo)
  // IMPORTANT: Keep max below 0.85 (Bloom Threshold) to avoid Glow effects.
  
  vec3 photoColor = texColor.rgb;
  
  // Clamp max brightness to 0.8 to strictly avoid bloom (Threshold is 0.85)
  // This ensures photos look flat and clear, not glowing.
  photoColor = min(photoColor, vec3(0.8, 0.8, 0.8));

  // Dynamic Brightness
  // mix(0.8, 1.0, ...) -> Max brightness = 0.8 * 1.0 = 0.8. Safe from bloom.
  float brightness = mix(0.8, 1.0, uHandOpen);
  
  // Final Color
  gl_FragColor = vec4(photoColor * brightness, uOpacity); 
}
`;