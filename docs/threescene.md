# Three.js Scene Documentation

## Overview
This file implements a Three.js-based 3D scene that renders an interactive Earth globe with day/night cycles, location markers, and connection lines between visited locations.

## Implementation Structure

### Components

#### ThreeSceneWrapper (`scene-wrapper.tsx`)
- Client-side wrapper component using Next.js dynamic imports
- Handles SSR compatibility and loading states
- Responsive layout (hidden on mobile, fixed position on desktop)
- Implements loading spinner with backdrop blur

#### ThreeScene (`scene.tsx`)
Main scene component that:
- Initializes and manages the 3D scene
- Implements progressive loading with placeholder geometry
- Handles animation loop and resource management
- Controls scene cleanup and disposal

### Core Classes and Types

#### SceneState
Maintains the core Three.js components:
```typescript
interface SceneState {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  clock: THREE.Clock
  controls: OrbitControls
}
```

#### WorldObject
Interface for objects that can be added to the world:
```typescript
interface WorldObject {
  mesh: THREE.Mesh | THREE.Group
  update: (delta: number, time: number) => void
  dispose?: () => void
}
```

#### World
Manages all 3D objects in the scene:
- Objects management (add, update, dispose)
- Scene cleanup and resource management
- Handles batch updates for all objects

### Earth Implementation

#### Progressive Loading
1. Initial render with low-res placeholder sphere
2. Asynchronous texture loading
3. Smooth transition to high-quality earth model

#### Earth Features
- Day/night cycle using custom shader material
- Atmospheric effect with backside rendering
- Auto-rotation with configurable speed
- Texture mipmapping for performance

#### Shader Implementation
```glsl
// Earth surface shader
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform float mixRatio;

void main() {
  vec4 dayColor = texture2D(dayTexture, vUv);
  vec4 nightColor = texture2D(nightTexture, vUv);
  gl_FragColor = mix(nightColor, dayColor, mixRatio);
}

// Atmosphere shader
uniform vec3 dayColor;
uniform vec3 nightColor;
uniform float mixRatio;
uniform float intensity;

void main() {
  float glow = pow(1.0 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), intensity);
  vec3 blendedColor = mix(nightColor, dayColor, mixRatio);
  gl_FragColor = vec4(blendedColor * glow, glow);
}
```

### Location System

#### Location Data (`locations.ts`)
```typescript
interface Location {
  name: string
  coordinates: [number, number] // [latitude, longitude]
  description?: string
}
```

#### Markers and Connections
- Dynamic marker creation for each location
- Curved connection lines between locations
- Animated effects for both markers and lines
- Proper disposal of geometry and materials

### Performance Optimizations

1. **Resource Management**
   - Proper cleanup in dispose methods
   - Texture optimization with mipmaps
   - Geometry and material sharing

2. **Loading Strategy**
   - Progressive enhancement with placeholders
   - Parallel texture loading
   - Suspense integration for loading states

3. **Render Optimization**
   - Conditional rendering based on viewport
   - Efficient update cycle
   - Proper cleanup on unmount

### Dependencies
- Three.js (core 3D engine)
- OrbitControls (camera controls)
- Next.js (dynamic imports, SSR handling)
- React (component framework)

## Usage

The scene is automatically loaded on the right side of desktop viewports and hidden on mobile devices. It's wrapped in Suspense for smooth loading transitions and implements proper cleanup to prevent memory leaks.