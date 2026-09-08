import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from '../layout/StatusBadge';
import { Box, Eye, Layers, Mountain, RefreshCw, Zap } from 'lucide-react';

export const Terrain3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { state, intel } = useSimulation();
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x050b14, 0.015);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 45, 75);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x22d3ee, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(30, 50, 30);
    scene.add(dirLight);

    // 5. Terrain Mesh Generation
    const terrainGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Sinusoidal Mountain valley terrain
      const elev = 
        Math.sin(x * 0.1) * Math.cos(z * 0.1) * 8 +
        Math.sin(x * 0.2 + z * 0.15) * 4 +
        (Math.hypot(x, z) > 25 ? Math.pow(Math.hypot(x, z) - 25, 1.2) * 0.4 : 0);
      pos.setY(i, Math.max(0, elev));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x111d33,
      wireframe: true,
      roughness: 0.8,
      metalness: 0.2,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrainMesh);

    // 6. Dynamic Water Surface Level Plane
    const waterGeo = new THREE.PlaneGeometry(85, 85);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: state.riverLevel > 4 ? 0xef4444 : 0x00f0ff,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 1.2 + (intel.floodProbability / 100) * 4.5;
    scene.add(waterMesh);

    // 7. Rain Particle Field
    const rainCount = Math.round(state.rainfall * 8);
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 80;
      rainPos[i + 1] = Math.random() * 40 + 5;
      rainPos[i + 2] = (Math.random() - 0.5) * 80;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.4,
      transparent: true,
      opacity: 0.7,
    });

    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // 8. Animation Loop
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating) {
        angle += 0.003;
        camera.position.x = Math.sin(angle) * 75;
        camera.position.z = Math.cos(angle) * 75;
        camera.lookAt(0, 0, 0);
      }

      // Animate rain falling
      const p = rainGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < p.length; i += 3) {
        p[i] -= 0.6;
        if (p[i] < 0) p[i] = 40;
      }
      rainGeo.attributes.position.needsUpdate = true;

      // Animate water height smooth shift
      waterMesh.position.y = 1.2 + (intel.floodProbability / 100) * 4.5;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
      terrainGeo.dispose();
      terrainMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
    };
  }, [state, intel, isRotating]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#030712] rounded-xl overflow-hidden border border-cyan-500/20 shadow-glass">
      {/* 3D Digital Twin Header Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-dark-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="font-bold text-cyan-300 uppercase tracking-wider">
            DIGITAL TWIN — SIMULATION
          </span>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="3D HYDRO-MESH" />
      </div>

      {/* Telemetry Overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-dark-900/90 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 font-mono text-xs space-y-1 text-slate-300">
        <div className="text-cyan-400 font-bold border-b border-slate-700 pb-1 flex items-center gap-1.5">
          <Mountain className="w-3.5 h-3.5" />
          <span>VALLEY ELEVATION TELEMETRY</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] pt-1">
          <div>Peak Elevation: <span className="text-white font-bold">1,840 m</span></div>
          <div>Valley Slope: <span className="text-cyan-300 font-bold">{state.slopeDegrees}°</span></div>
          <div>Water Surface Height: <span className="text-cyan-400 font-bold">{(1.2 + (intel.floodProbability / 100) * 4.5).toFixed(2)} m</span></div>
          <div>Inundation Radius: <span className="text-amber-400 font-bold">{intel.floodExtentRadiusKm} km</span></div>
        </div>
      </div>

      {/* Control Toggle */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="px-3 py-1.5 rounded bg-dark-900/90 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300 hover:bg-dark-800 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          <span>{isRotating ? 'Orbiting 360°' : 'Camera Paused'}</span>
        </button>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full min-h-[500px]" />
    </div>
  );
};
