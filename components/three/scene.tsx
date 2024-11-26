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
  const textureLoader = new THREE.TextureLoader();
  
  try {
    // Load both day and night textures
    const [dayTexture, nightTexture] = await Promise.all([
      textureLoader.loadAsync('textures/earth-day.jpg'),
      textureLoader.loadAsync('textures/earth-night.jpg')
    ]);

    const group = new THREE.Group();

    // Earth geometry (reused)
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Custom shader material with day/night cycle
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
    group.add(earth);

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
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
    atmosphere.scale.set(1.1, 1.1, 1.1);
    group.add(atmosphere);

    return {
      mesh: group,
      update: (delta: number, time: number) => {
        // Rotate the earth
        earth.rotation.y += delta * 0.1;

        // Day/night cycle 
        const cyclePosition = (Math.sin(time * 0.5) + 1) / 2;

        // Update day/night mix in materials
        (earthMaterial.uniforms.mixRatio.value as number) = cyclePosition;
        (atmosphereMaterial.uniforms.mixRatio.value as number) = cyclePosition;
      },
      dispose: () => {
        // Specific disposal for this object
        dayTexture.dispose();
        nightTexture.dispose();
        earthGeometry.dispose();
        atmosphereGeometry.dispose();
        earthMaterial.dispose();
        atmosphereMaterial.dispose();
      }
    };
  } catch (error) {
    console.error('Texture loading failed', error);
    throw error;
  }
};

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    world: World;
    sceneState: SceneState;
    animationFrameId: number;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const sceneState: SceneState = {
      scene: new THREE.Scene(),
      clock: new THREE.Clock(),
      camera: new THREE.PerspectiveCamera(),
      renderer: new THREE.WebGLRenderer(),
      controls: {} as OrbitControls
    };

    const initScene = async () => {
      // Cleanup any existing content
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      // Setup camera
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = window.innerHeight;
      
      sceneState.camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
      sceneState.camera.position.z = 4;
      
      // Renderer setup
      sceneState.renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      sceneState.renderer.setSize(containerWidth, containerHeight);
      sceneState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      containerRef.current.appendChild(sceneState.renderer.domElement);

      // Orbit controls
      sceneState.controls = new OrbitControls(sceneState.camera, sceneState.renderer.domElement);
      sceneState.controls.enableDamping = true;
      sceneState.controls.dampingFactor = 0.05;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 3, 5);
      
      sceneState.scene.add(ambientLight, pointLight);

      // Create world and add earth
      const world = new World(sceneState);
      const earth = await createEarthObject();
      world.addObject(earth);

      // Resize handler
      const handleResize = () => {
        if (!containerRef.current) return;

        const newWidth = containerRef.current.clientWidth;
        const newHeight = window.innerHeight;
        
        sceneState.camera.aspect = newWidth / newHeight;
        sceneState.camera.updateProjectionMatrix();
        sceneState.renderer.setSize(newWidth, newHeight);
      };

      // Animation loop
      let totalTime = 0;
      const animate = () => {
        const animationFrameId = requestAnimationFrame(animate);
        
        const delta = sceneState.clock.getDelta();
        totalTime += delta;
        
        world.update(delta, totalTime);
        sceneState.controls.update();
        sceneState.renderer.render(sceneState.scene, sceneState.camera);

        // Store references for cleanup
        sceneRef.current = { 
          world, 
          sceneState, 
          animationFrameId 
        };
      };

      // Add resize listener
      window.addEventListener('resize', handleResize);

      // Start animation
      animate();
      setIsLoaded(true);

      return { world, sceneState, handleResize };
    };

    // Initialize scene
    const scenePromise = initScene();

    // Cleanup function
    return () => {
      // Stop resize listener
      window.removeEventListener('resize', sceneRef.current?.handleResize);

      // Cancel animation frame
      if (sceneRef.current?.animationFrameId) {
        cancelAnimationFrame(sceneRef.current.animationFrameId);
      }

      // Dispose of Three.js resources
      if (sceneRef.current) {
        // Dispose of world objects
        sceneRef.current.world.dispose();

        // Dispose of renderer
        const renderer = sceneRef.current.sceneState.renderer;
        renderer.dispose();

        // Clear scene
        const scene = sceneRef.current.sceneState.scene;
        scene.clear();
      }

      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      // Reset references
      sceneRef.current = null;
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`fixed top-0 right-0 h-screen w-1/2 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ transition: 'opacity 0.5s ease-in-out' }}
    />
  );
};

export default ThreeScene;