import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface SceneState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
  controls: OrbitControls;
}

interface WorldObject {
  mesh: THREE.Mesh | THREE.Group;
  update: (delta: number, time: number) => void;
  dispose?: () => void;
}

class World {
  private objects: WorldObject[] = [];
  private state: SceneState;

  constructor(state: SceneState) {
    this.state = state;
  }

  addObject(object: WorldObject) {
    this.objects.push(object);
    this.state.scene.add(object.mesh);
  }

  update(delta: number, time: number) {
    this.objects.forEach(object => object.update(delta, time));
  }

  dispose() {
    this.objects.forEach(object => {
      // Call object-specific dispose method if exists
      if (object.dispose) {
        object.dispose();
      }

      // Dispose of mesh resources
      if (object.mesh instanceof THREE.Mesh) {
        // Dispose geometry
        if (object.mesh.geometry) {
          object.mesh.geometry.dispose();
        }

        // Dispose materials
        if (Array.isArray(object.mesh.material)) {
          object.mesh.material.forEach(m => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          const material = object.mesh.material as THREE.Material;
          if (material.map) material.map.dispose();
          material.dispose();
        }

        // Remove from scene
        this.state.scene.remove(object.mesh);
      }
    });

    // Clear the objects array
    this.objects.length = 0;
  }
}

const createEarthObject = async (): Promise<WorldObject> => {
  // Preload textures before scene initialization
  const textureLoader = new THREE.TextureLoader();
  textureLoader.crossOrigin = '';  // Enable CORS
  
  // Create a low-res placeholder sphere while loading
  const tempGeometry = new THREE.SphereGeometry(1, 16, 16);
  const tempMaterial = new THREE.MeshBasicMaterial({ color: 0x1a237e });
  const tempSphere = new THREE.Mesh(tempGeometry, tempMaterial);
  
  const group = new THREE.Group();
  group.add(tempSphere);
  
  try {
    // Load textures in parallel with reduced initial quality
    const [dayTexture, nightTexture] = await Promise.all([
      textureLoader.loadAsync('textures/earth-day.jpg'),
      textureLoader.loadAsync('textures/earth-night.jpg')
    ]);
    
    // Apply texture settings for better performance
    dayTexture.generateMipmaps = true;
    nightTexture.generateMipmaps = true;
    dayTexture.minFilter = THREE.LinearMipmapLinearFilter;
    nightTexture.minFilter = THREE.LinearMipmapLinearFilter;
    
    // Create the high-quality earth once textures are loaded
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        mixRatio: { value: 0.5 },
        bumpScale: { value: 0.05 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform float mixRatio;
        varying vec2 vUv;
        
        void main() {
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          gl_FragColor = mix(nightColor, dayColor, mixRatio);
        }
      `
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    
    // Replace the placeholder with the high-quality earth
    group.remove(tempSphere);
    tempGeometry.dispose();
    tempMaterial.dispose();
    group.add(earth);

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.0015, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayColor: { value: new THREE.Color(0.5, 0.7, 1.0) },
        nightColor: { value: new THREE.Color(0.1, 0.2, 0.4) },
        mixRatio: { value: 0.5 },
        intensity: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vertexNormal;
        void main() {
          vertexNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 dayColor;
        uniform vec3 nightColor;
        uniform float mixRatio;
        uniform float intensity;
        varying vec3 vertexNormal;
        
        void main() {
          float glow = pow(1.0 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), intensity);
          vec3 blendedColor = mix(nightColor, dayColor, mixRatio);
          gl_FragColor = vec4(blendedColor * glow, glow);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.05, 1.05, 1.05);
    group.add(atmosphere);

    const markers: WorldObject[] = [];

    // Create markers for each location
    visitedLocations.forEach(location => {
      const marker = createLocationMarker(location);
      markers.push(marker);
      group.add(marker.mesh);
    });

    // Add connection lines
    const connectionLines = createConnectionLines(visitedLocations);
    group.add(connectionLines.mesh);

    const earthObject: WorldObject = {
      mesh: group,
      update: (delta: number, time: number) => {
        // Rotate the earth
        group.rotation.y += delta * 0.05;

        // Day/night cycle 
        const cyclePosition = (Math.sin(time * 0.2) + 1) / 2;

        // Update day/night mix in materials
        (earthMaterial.uniforms.mixRatio.value as number) = cyclePosition;
        (atmosphereMaterial.uniforms.mixRatio.value as number) = cyclePosition;

        // Update all markers and connection lines
        markers.forEach(marker => marker.update(delta, time));
        connectionLines.update(delta, time);
      },
      dispose: () => {
        // Specific disposal for this object
        dayTexture.dispose();
        nightTexture.dispose();
        earthGeometry.dispose();
        atmosphereGeometry.dispose();
        earthMaterial.dispose();
        atmosphereMaterial.dispose();

        markers.forEach(marker => marker.dispose());
        connectionLines.dispose();
      }
    };

    return earthObject;
  } catch (error) {
    console.error('Texture loading failed', error);
    throw error;
  }
};

import { visitedLocations, Location } from './locations';

const createLocationMarker = (location: Location): WorldObject => {
  const group = new THREE.Group();
  
  // Create pin geometry with larger dimensions
  const pinHeight = 0.12;
  const pinHeadRadius = 0.028;
  const pinStemRadius = 0.008;
  
  // Create pin head (sphere)
  const headGeometry = new THREE.SphereGeometry(pinHeadRadius, 16, 16);
  const pinMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xff3333,
    shininess: 100,
    emissive: 0x331111
  });
  const pinHead = new THREE.Mesh(headGeometry, pinMaterial);
  pinHead.position.y = pinHeight; // Head at the tip

  // Create pin stem (cylinder)
  const stemGeometry = new THREE.CylinderGeometry(pinStemRadius, 0, pinHeight, 8);
  const stem = new THREE.Mesh(stemGeometry, pinMaterial);
  stem.position.y = pinHeight / 2;

  const pin = new THREE.Group();
  pin.add(pinHead);
  pin.add(stem);
  
  // Convert lat/long to 3D position
  const [lat, lon] = location.coordinates;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const radius = 1.02;
  
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  group.position.set(x, y, z);
  
  // Orient pin to point outward from globe center
  pin.lookAt(0, 0, 0);
  // No need to rotate X anymore since pin is already in correct orientation
  group.add(pin);
  
  // Create text label
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  if (context) {
    context.font = 'bold 28px GeistSans';
    
    // Measure text width to size the background
    const textMetrics = context.measureText(location.name);
    const padding = 16;
    const rectWidth = textMetrics.width + padding * 2;
    const rectHeight = 40;
    const cornerRadius = 8;
    
    // Draw rounded rectangle background
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    context.beginPath();
    context.roundRect(
      (canvas.width - rectWidth) / 2,
      (canvas.height - rectHeight) / 2,
      rectWidth,
      rectHeight,
      cornerRadius
    );
    context.fill();
    
    // Draw text
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(location.name, canvas.width / 2, canvas.height / 2);
  }
  
  const labelTexture = new THREE.CanvasTexture(canvas);
  const labelMaterial = new THREE.SpriteMaterial({
    map: labelTexture,
    sizeAttenuation: false,
  });
  
  const label = new THREE.Sprite(labelMaterial);
  label.scale.set(0.15, 0.04, 1);
  label.position.y = pinHeight + 0.05;
  group.add(label);
  
  return {
    mesh: group,
    update: (_delta: number, _time: number) => {
      // Keep text facing camera
      label.quaternion.copy(group.parent!.quaternion);
    },
    dispose: () => {
      headGeometry.dispose();
      stemGeometry.dispose();
      pinMaterial.dispose();
      labelMaterial.dispose();
      labelTexture.dispose();
    }
  };
};

const createConnectionLines = (locations: Location[]): WorldObject => {
  const group = new THREE.Group();
  
  // Custom shader material for glowing effect
  const lineMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x00e5ff) },
      glowIntensity: { value: 5.0 },
      opacity: { value: 1.0 },
      coreIntensity: { value: 5.0 },    // Control core brightness
      glowPower: { value: 5.0 }         // Control glow falloff
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec2 vUv;
      void main() {
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float glowIntensity;
      uniform float opacity;
      uniform float coreIntensity;
      uniform float glowPower;
      varying vec2 vUv;
      
      void main() {
        float radius = length(vUv - vec2(0.5));
        
        // Brighter core with adjustable intensity
        float core = smoothstep(0.5, 0.0, radius) * coreIntensity;
        
        // Adjustable glow falloff
        float glow = pow(1.0 - radius, glowPower);
        
        vec3 finalColor = color * (core + glow) * glowIntensity;
        
        vec3 hotBlue = vec3(0.0, 0.5, 1.0);
        finalColor += hotBlue * (1.0 - radius) * 0.7;
        
        float alpha = (core + glow) * opacity;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    depthWrite: false
  });

  // Create curved lines between consecutive points
  for (let i = 0; i < locations.length; i++) {
    const startLoc = locations[i];
    const endLoc = locations[(i + 1) % locations.length];
    
    // Convert lat/long to 3D positions
    const startPos = latLongToVector3(startLoc.coordinates[0], startLoc.coordinates[1], 1.02);
    const endPos = latLongToVector3(endLoc.coordinates[0], endLoc.coordinates[1], 1.02);
    
    // Calculate midpoint and raise it above the surface for curve
    const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
    midPoint.normalize().multiplyScalar(2.0);
    
    // Create curved path
    const curve = new THREE.QuadraticBezierCurve3(
      startPos,
      midPoint,
      endPos
    );
    
    // Create tube geometry around the curve
    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      64,  // tubularSegments - number of segments along the tube
      0.008,  // radius - thickness of the tube
      8,    // radialSegments - number of segments around the tube
      false  // closed
    );
    
    // Create tube mesh with custom material
    const tube = new THREE.Mesh(tubeGeometry, lineMaterial);
    group.add(tube);
  }
  
  return {
    mesh: group,
    update: (delta: number, time: number) => {
      // Animate glow intensity
      const intensity = 1.5 + Math.sin(time * 2) * 0.5;
      lineMaterial.uniforms.glowIntensity.value = intensity;
    },
    dispose: () => {
      group.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
      lineMaterial.dispose();
    }
  };
};

// Helper function to convert lat/long to 3D vector
const latLongToVector3 = (lat: number, long: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (long + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    world: World;
    sceneState: SceneState;
    animationFrameId: number;
    handleResize?: () => void;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const initScene = async () => {
      if (typeof window === 'undefined' || !containerRef.current) return;

      try {
        // Clear any existing error
        setError(null);

        const sceneState: SceneState = {
          scene: new THREE.Scene(),
          clock: new THREE.Clock(),
          camera: new THREE.PerspectiveCamera(),
          renderer: new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
          }),
          controls: {} as OrbitControls
        };

        // Setup camera
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = window.innerHeight;
        
        sceneState.camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
        sceneState.camera.position.z = 4;

        // Setup renderer
        sceneState.renderer.setSize(containerWidth, containerHeight);
        sceneState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Clean up any existing canvas
        while (containerRef.current?.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        
        containerRef.current.appendChild(sceneState.renderer.domElement);

        // Setup controls
        sceneState.controls = new OrbitControls(sceneState.camera, sceneState.renderer.domElement);
        sceneState.controls.enableDamping = true;
        sceneState.controls.dampingFactor = 0.05;

        // Create world
        const world = new World(sceneState);

        // Setup resize handler
        const handleResize = () => {
          if (!containerRef.current) return;
          
          const newWidth = containerRef.current.clientWidth;
          const newHeight = window.innerHeight;
          
          sceneState.camera.aspect = newWidth / newHeight;
          sceneState.camera.updateProjectionMatrix();
          sceneState.renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        // Animation loop
        let totalTime = 0;
        let animationFrameId: number;

        const animate = () => {
          if (!mounted) return;
          
          animationFrameId = requestAnimationFrame(animate);
          
          const delta = sceneState.clock.getDelta();
          totalTime += delta;
          
          world.update(delta, totalTime);
          sceneState.controls.update();
          sceneState.renderer.render(sceneState.scene, sceneState.camera);
        };

        // Create earth object
        const earth = await createEarthObject();
        world.addObject(earth);

        // Store cleanup function
        cleanup = () => {
          mounted = false;
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationFrameId);
          
          world.dispose();
          sceneState.renderer.dispose();
          sceneState.scene.clear();
          
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        };

        // Store references and start animation
        sceneRef.current = {
          world,
          sceneState,
          animationFrameId,
          handleResize
        };

        // Start animation loop
        animate();

      } catch (err) {
        console.error('Error initializing scene:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize scene');
        if (cleanup) cleanup();
      }
    };

    // Initialize scene
    initScene();

    // Cleanup on unmount
    return () => {
      if (cleanup) cleanup();
      sceneRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
};

export default ThreeScene;