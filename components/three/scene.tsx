import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    geometry?: THREE.SphereGeometry;
    material?: THREE.MeshBasicMaterial;
  }>({});

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Clear any existing content
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Setup scene
    sceneRef.current.scene = new THREE.Scene();
    
    // Calculate dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = window.innerHeight;
    const aspectRatio = containerWidth / containerHeight;
    
    // Setup camera with correct aspect ratio
    sceneRef.current.camera = new THREE.PerspectiveCamera(
      45,
      aspectRatio,
      0.1,
      1000
    );
    
    sceneRef.current.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    
    sceneRef.current.renderer.setSize(containerWidth, containerHeight);
    containerRef.current.appendChild(sceneRef.current.renderer.domElement);
    
    // Create sphere
    sceneRef.current.geometry = new THREE.SphereGeometry(1, 32, 32);
    sceneRef.current.material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      wireframe: true 
    });
    const sphere = new THREE.Mesh(sceneRef.current.geometry, sceneRef.current.material);
    sceneRef.current.scene.add(sphere);
    
    // Adjust camera position
    sceneRef.current.camera.position.z = 3.5;
    sceneRef.current.camera.lookAt(0, 0, 0);

    // Animation function
    let animationFrameId: number;
    
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.01;
      if (sceneRef.current.renderer && sceneRef.current.scene && sceneRef.current.camera) {
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
      }
    }

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

    // Start animation
    animate();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (sceneRef.current.geometry) sceneRef.current.geometry.dispose();
      if (sceneRef.current.material) sceneRef.current.material.dispose();
      if (sceneRef.current.renderer) sceneRef.current.renderer.dispose();
      
      // Clear references
      sceneRef.current = {};
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 right-0 h-screen w-1/2"
      style={{ 
        position: 'fixed',
        pointerEvents: 'none'  // This ensures the ThreeScene doesn't interfere with scrolling
      }} 
    />
  );
};

export default ThreeScene;