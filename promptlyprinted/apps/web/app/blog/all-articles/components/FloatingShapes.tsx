'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FloatingShapes() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create floating shapes
    const shapes: Array<{ mesh: THREE.Mesh; speed: number; amplitude: number; initialY: number }> = [];

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x14B8A6,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-3, 1, -2);
    scene.add(sphere);
    shapes.push({ mesh: sphere, speed: 1.2, amplitude: 0.5, initialY: 1 });

    // Box
    const boxGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF8A26,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(3, -1, -1);
    scene.add(box);
    shapes.push({ mesh: box, speed: 0.8, amplitude: 0.6, initialY: -1 });

    // Torus
    const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 32);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(0, 2, -3);
    scene.add(torus);
    shapes.push({ mesh: torus, speed: 1.5, amplitude: 0.4, initialY: 2 });

    // Small Box
    const smallBoxGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const smallBoxMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B5CF6,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const smallBox = new THREE.Mesh(smallBoxGeometry, smallBoxMaterial);
    smallBox.position.set(-1.5, -2, -4);
    scene.add(smallBox);
    shapes.push({ mesh: smallBox, speed: 2, amplitude: 0.3, initialY: -2 });

    // Small Sphere
    const smallSphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const smallSphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
    smallSphere.position.set(2, 0.5, -5);
    scene.add(smallSphere);
    shapes.push({ mesh: smallSphere, speed: 0.9, amplitude: 0.7, initialY: 0.5 });

    // Position camera
    camera.position.z = 5;

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      // Rotate entire scene slowly
      scene.rotation.y = elapsedTime * 0.05;

      // Animate individual shapes
      shapes.forEach(({ mesh, speed, amplitude, initialY }) => {
        mesh.rotation.x += 0.01 * speed;
        mesh.rotation.y += 0.005 * speed;
        mesh.position.y = initialY + Math.sin(elapsedTime * speed) * amplitude;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      // Dispose geometries and materials
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      boxGeometry.dispose();
      boxMaterial.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
      smallBoxGeometry.dispose();
      smallBoxMaterial.dispose();
      smallSphereGeometry.dispose();
      smallSphereMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
}