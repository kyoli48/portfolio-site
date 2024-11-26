# Three.js Scene Documentation

## Overview
This file implements a Three.js-based 3D scene that renders an interactive Earth globe with day/night cycles, location markers, and connection lines between visited locations.

## Core Components

### Interfaces

#### SceneState
Maintains the core Three.js components:
- scene: THREE.Scene
- camera: THREE.PerspectiveCamera
- renderer: THREE.WebGLRenderer
- clock: THREE.Clock
- controls: OrbitControls

#### WorldObject
Interface for objects that can be added to the world:
- mesh: THREE.Mesh | THREE.Group
- update: Function that updates the object each frame
- dispose: Optional cleanup function

### Classes

#### World
Manages all 3D objects in the scene:
- Objects management (add, update, dispose)
- Scene cleanup and resource management
- Handles batch updates for all objects

### Main Objects

#### Earth Object
Created by `createEarthObject()`:
- Implements day/night cycle using custom shaders
- Uses two textures (day and night maps)
- Includes atmospheric effect with custom shader
- Auto-rotation functionality

#### Location Markers
Created by `createLocationMarker()`:
- Represents visited locations on the globe
- Includes animation effects
- Uses custom geometry and materials

#### Connection Lines
Created by `createConnectionLines()`:
- Draws curved lines between visited locations
- Implements animation effects
- Uses custom line geometry

### Helper Functions

#### latLongToVector3
Converts latitude and longitude coordinates to 3D vectors for positioning markers and lines.

### Main Component

#### ThreeScene
React component that:
- Initializes the 3D scene
- Manages the animation loop
- Handles window resizing
- Controls scene cleanup

## Technical Details

### Shaders
The scene uses custom shaders for:
1. Earth surface (day/night transition)
2. Atmospheric effect
3. Marker animations

### Performance Considerations
- Implements proper resource disposal
- Uses geometry and material sharing where possible
- Optimized update cycles

### Dependencies
- Three.js
- React
- OrbitControls from Three.js addons