import React, { useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { BoardState, Position, GRID_SIZE } from '../types';
import { getPossibleMoves } from '../logic';
import { Marble } from './Marble';
import { generateWoodTexture } from '../utils/textureGenerator';

interface SceneProps {
  board: BoardState;
  onMove: (from: Position, to: Position) => void;
}

const GameBoard: React.FC<SceneProps> = ({ board, onMove }) => {
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  // Generate wood texture once
  const woodTexture = useMemo(() => generateWoodTexture(), []);

  const handleMarbleClick = (r: number, c: number, e: any) => {
    e.stopPropagation();
    if (selectedPos?.r === r && selectedPos?.c === c) {
      setSelectedPos(null);
      setValidMoves([]);
      return;
    }
    setSelectedPos({ r, c });
    const moves = getPossibleMoves(board, r, c);
    setValidMoves(moves);
  };

  const handleHoleClick = (r: number, c: number, e: any) => {
    e.stopPropagation();
    const isMoveTarget = validMoves.some(m => m.r === r && m.c === c);
    if (isMoveTarget && selectedPos) {
      onMove(selectedPos, { r, c });
      setSelectedPos(null);
      setValidMoves([]);
    }
  };

  const handleBackgroundClick = () => {
    setSelectedPos(null);
    setValidMoves([]);
  };

  return (
    <group position={[-GRID_SIZE / 2 + 0.5, 0, -GRID_SIZE / 2 + 0.5]} onClick={handleBackgroundClick}>
      
      {/* Board Base - Wooden Slab */}
      <mesh 
        // No rotation needed for CylinderGeometry to lie flat (top face is XZ)
        position={[GRID_SIZE / 2 - 0.5, -0.25, GRID_SIZE / 2 - 0.5]} 
        receiveShadow
      >
        <cylinderGeometry args={[4.5, 4.8, 0.5, 64]} />
        <meshStandardMaterial 
          map={woodTexture}
          color="#8b5a2b" 
          roughness={0.7} 
          metalness={0.1}
        />
      </mesh>

      {/* Border Ring for aesthetics */}
       <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[GRID_SIZE / 2 - 0.5, -0.25, GRID_SIZE / 2 - 0.5]} 
      >
        <torusGeometry args={[4.8, 0.15, 16, 100]} />
        <meshStandardMaterial color="#3e2723" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Render Grid */}
      {board.grid.map((row, r) =>
        row.map((cell, c) => {
          if (cell === null) return null;

          const isMarble = cell !== 'empty';
          const marbleState = isMarble ? board.marbles[cell!] : null;
          const isSelected = selectedPos?.r === r && selectedPos?.c === c;
          const isValidTarget = validMoves.some(m => m.r === r && m.c === c);

          return (
            <group key={`${r}-${c}`} position={[c, 0, r]}>
              
              {/* Marble Socket / Hole Rim */}
              <mesh 
                position={[0, -0.01, 0]} 
                rotation={[-Math.PI/2, 0, 0]}
                onClick={(e) => !isMarble && handleHoleClick(r, c, e)}
                receiveShadow
              >
                <torusGeometry args={[0.3, 0.05, 16, 32]} />
                <meshStandardMaterial 
                  color="#4e342e" 
                  metalness={0.1} 
                  roughness={0.8} 
                />
              </mesh>

              {/* Inner Hole Darkening (Simulated Depth) */}
              <mesh position={[0, -0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
                 <circleGeometry args={[0.28, 32]} />
                 <meshBasicMaterial color="#261612" /> 
              </mesh>

               {/* Valid Move Highlight - Glow Ring */}
               {isValidTarget && (
                <group>
                  <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]} onClick={(e) => handleHoleClick(r, c, e)}>
                     <ringGeometry args={[0.2, 0.45, 32]} />
                     <meshBasicMaterial color="#4ade80" transparent opacity={0.6} side={THREE.DoubleSide} />
                  </mesh>
                  {/* Hitbox for easier clicking */}
                  <mesh position={[0, 0.05, 0]} onClick={(e) => handleHoleClick(r, c, e)} visible={false}>
                    <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
                    <meshBasicMaterial color="red" />
                  </mesh>
                </group>
              )}

              {/* Marble */}
              {isMarble && marbleState && !marbleState.removed && (
                <Marble 
                  id={marbleState.id}
                  position={[0, 0.35, 0]} 
                  textureSeed={marbleState.textureSeed}
                  isSelected={isSelected}
                  onClick={(e) => handleMarbleClick(r, c, e)}
                />
              )}
            </group>
          );
        })
      )}
    </group>
  );
};

export const GameScene: React.FC<SceneProps> = (props) => {
  return (
    <Canvas shadows camera={{ position: [0, 10, 10], fov: 40 }}>
      <color attach="background" args={['#1e293b']} />
      
      <ambientLight intensity={0.4} />
      
      <spotLight
        position={[10, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={1.2}
        castShadow
        shadow-bias={-0.0001}
      />
      
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#fbbf24" />
      <pointLight position={[10, 5, -10]} intensity={0.8} color="#cbd5e1" />
      
      <Environment preset="lobby" />
      
      <GameBoard {...props} />

      <ContactShadows resolution={1024} scale={30} blur={2} opacity={0.5} far={10} color="#000000" />
      <OrbitControls 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={5} 
        maxDistance={25} 
      />
    </Canvas>
  );
};