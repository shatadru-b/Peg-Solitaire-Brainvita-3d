import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateMarbleTexture } from '../utils/textureGenerator';

interface MarbleProps {
  id: string;
  position: [number, number, number];
  textureSeed: number;
  isSelected: boolean;
  onClick: (e: any) => void;
}

export const Marble: React.FC<MarbleProps> = ({ id, position, textureSeed, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate texture once per marble
  const texture = useMemo(() => generateMarbleTexture(textureSeed), [textureSeed]);
  
  // Random initial rotation so marbles don't look identical in orientation
  const initialRotation = useMemo(() => new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0), []);

  // Target position handling
  // When selected, we lift it up slightly. When idle, it sits in the board (y position passed in props).
  
  useFrame((state) => {
    if (meshRef.current) {
      const targetY = isSelected ? position[1] + 0.5 : position[1];
      const hoverOffset = isSelected ? Math.sin(state.clock.elapsedTime * 8) * 0.05 : 0;
      
      // Smooth position lerp
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY + hoverOffset, 0.15);
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0], 0.15);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, position[2], 0.15);

      if (isSelected) {
        meshRef.current.rotation.y += 0.02;
        meshRef.current.rotation.x += 0.01;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position} // Initial position
      rotation={initialRotation}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[0.42, 64, 64]} />
      {/* 
         Realistic Glass Shader 
         - transmission: high for glass
         - roughness: low for polish
         - metalness: slight for reflection boosting
         - thickness: for volume refraction
      */}
      <meshPhysicalMaterial
        map={texture}
        color="#ffffff"
        emissive={new THREE.Color(0x222222)} // Slight inner glow
        emissiveIntensity={0.2}
        metalness={0.1}
        roughness={0.05}
        transmission={0.6} 
        thickness={2.5}
        ior={1.5}
        clearcoat={1.0}
        clearcoatRoughness={0.02}
        attenuationColor="#ffffff"
        attenuationDistance={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};