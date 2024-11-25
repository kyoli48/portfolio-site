import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Location {
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
  type: 'lived' | 'visited';
}

const LOCATIONS: Location[] = [
  { name: 'San Francisco', coordinates: [37.7749, -122.4194], type: 'lived' },
  { name: 'Singapore', coordinates: [1.3521, 103.8198], type: 'lived' },
  { name: 'Tokyo', coordinates: [35.6762, 139.6503], type: 'visited' },
  // Add more locations as needed
];

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef<THREE.Vector2>(new THREE.Vector2());
  const globeRef = useRef<THREE.Mesh>();
  const markersRef = useRef<THREE.Group>();
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
  }>({});

  // Convert lat/long to 3D coordinates
  const latLongToVector3 = (lat: number, long: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Clear existing content
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Setup scene
    sceneRef.current.scene = new THREE.Scene();
    
    // Setup camera
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = window.innerHeight;
    const aspectRatio = containerWidth / containerHeight;
    
    sceneRef.current.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    sceneRef.current.camera.position.z = 5;
    
    // Setup renderer
    sceneRef.current.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    sceneRef.current.renderer.setSize(containerWidth, containerHeight);
    containerRef.current.appendChild(sceneRef.current.renderer.domElement);

    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/textures/earth.jpg');
    const bumpTexture = textureLoader.load('/textures/earth-bump.jpg');
    const specularTexture = textureLoader.load('/textures/earth-specular.jpg');

    // Create globe
    const radius = 1.5;
    const globeGeometry = new THREE.SphereGeometry(radius, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.05,
      specularMap: specularTexture,
      specular: new THREE.Color('grey'),
      shininess: 5,
      transparent: true,
      opacity: 1
    });
    globeRef.current = new THREE.Mesh(globeGeometry, globeMaterial);
    sceneRef.current.scene.add(globeRef.current);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneRef.current.scene.add(ambientLight);

    // Add directional light for sun-like lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    sceneRef.current.scene.add(directionalLight);

    // Add subtle point light for highlights
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, -3, -5);
    sceneRef.current.scene.add(pointLight);

    // Create markers group
    markersRef.current = new THREE.Group();
    sceneRef.current.scene.add(markersRef.current);

    // Add location markers
    LOCATIONS.forEach(location => {
      const position = latLongToVector3(location.coordinates[0], location.coordinates[1], radius);
      
      // Create flag group
      const flagGroup = new THREE.Group();
      flagGroup.position.copy(position);
      
      // Make flag pole point outward from globe center
      flagGroup.lookAt(new THREE.Vector3(0, 0, 0));
      flagGroup.rotateX(Math.PI / 2);
      
      // Create flag pole
      const poleGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.15, 8);
      const poleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        shininess: 100
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = 0.075; // Half the height
      flagGroup.add(pole);

      // Create flag
      const flagWidth = 0.1;
      const flagHeight = 0.06;
      const flagGeometry = new THREE.PlaneGeometry(flagWidth, flagHeight, 8, 8);
      const flagMaterial = new THREE.MeshPhongMaterial({ 
        color: location.type === 'lived' ? 0xff3366 : 0x33ff66,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const flag = new THREE.Mesh(flagGeometry, flagMaterial);
      
      // Position flag next to pole
      flag.position.set(flagWidth / 2, 0.12, 0);
      
      // Store initial vertices for animation
      const originalVertices = flag.geometry.attributes.position.array.slice();
      flag.userData = { 
        originalVertices,
        phase: Math.random() * Math.PI * 2 // Random starting phase for each flag
      };
      
      flagGroup.add(flag);
      markersRef.current?.add(flagGroup);
    });

    // Mouse move handler
    function handleMouseMove(event: MouseEvent) {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Animation
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (globeRef.current) {
        // Rotate globe
        globeRef.current.rotation.y += 0.001;
        
        // Tilt based on mouse position
        const tiltAmount = 0.2;
        globeRef.current.rotation.x = mousePosition.current.y * tiltAmount;
        globeRef.current.rotation.z = -mousePosition.current.x * tiltAmount;
      }

      // Animate flags
      markersRef.current?.children.forEach((flagGroup) => {
        const flag = flagGroup.children[1]; // The flag is the second child
        if (flag && flag.geometry instanceof THREE.BufferGeometry) {
          const positions = flag.geometry.attributes.position.array;
          const originalVertices = flag.userData.originalVertices;
          const phase = flag.userData.phase;
          
          // Update flag wave animation
          for (let i = 0; i < positions.length; i += 3) {
            const x = originalVertices[i];
            const waveAmount = (x + flagGroup.position.length()) * 2;
            positions[i + 2] = Math.sin(waveAmount + phase + Date.now() * 0.003) * 0.02 * x;
          }
          
          flag.geometry.attributes.position.needsUpdate = true;
        }
      });

      // Update marker rotations
      if (markersRef.current) {
        markersRef.current.rotation.y = globeRef.current?.rotation.y || 0;
        markersRef.current.rotation.x = globeRef.current?.rotation.x || 0;
        markersRef.current.rotation.z = globeRef.current?.rotation.z || 0;
      }

      if (sceneRef.current.renderer && sceneRef.current.scene && sceneRef.current.camera) {
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
      }
    };

    // Handle window resize
    function handleResize() {
      if (!containerRef.current || !sceneRef.current.renderer || !sceneRef.current.camera) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = window.innerHeight;
      const newAspectRatio = newWidth / newHeight;
      
      sceneRef.current.camera.aspect = newAspectRatio;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(newWidth, newHeight);
    }

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      // Dispose geometries and materials
      globeRef.current?.geometry.dispose();
      (globeRef.current?.material as THREE.Material)?.dispose();
      
      markersRef.current?.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });

      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
      
      // Clear references
      sceneRef.current = {};
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10" />;
};

export default ThreeScene;