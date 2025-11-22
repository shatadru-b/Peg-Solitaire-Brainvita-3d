import * as THREE from 'three';

// Helper for random range
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateMarbleTexture = (seed: number): THREE.CanvasTexture => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Seeded random simulation
  let currentSeed = seed;
  const random = () => {
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };

  // Previous Style: Vibrant Random Colors with Simple Swirls
  const hue = random() * 360;
  const saturation = 60 + random() * 40;
  const lightness = 40 + random() * 30;
  
  const baseColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const secondColor = `hsl(${hue + 20}, ${saturation}%, ${lightness - 10}%)`;
  const highlightColor = `hsl(${hue - 10}, ${saturation}%, ${lightness + 20}%)`;

  // Fill background
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Simple Random Swirls
  const numSwirls = 6 + Math.floor(random() * 6);
  ctx.lineCap = 'round';
  
  for (let i = 0; i < numSwirls; i++) {
    ctx.strokeStyle = i % 2 === 0 ? secondColor : highlightColor;
    ctx.lineWidth = 10 + random() * 30;
    ctx.globalAlpha = 0.5 + random() * 0.4;
    
    ctx.beginPath();
    const startX = random() * size;
    const startY = random() * size;
    ctx.moveTo(startX, startY);
    
    ctx.bezierCurveTo(
      random() * size, random() * size,
      random() * size, random() * size,
      random() * size, random() * size
    );
    ctx.stroke();
  }

  // Speckles / Noise for realism
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 150; i++) {
      ctx.beginPath();
      ctx.arc(random() * size, random() * size, random() * 2, 0, Math.PI * 2);
      ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

export const generateWoodTexture = (): THREE.CanvasTexture => {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Base Wood Color (Deep Warm Brown)
  ctx.fillStyle = '#5d4037'; 
  ctx.fillRect(0, 0, size, size);

  // Wood Grain Streaks
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = Math.random() * size; // Horizontal streak
    const h = 2 + Math.random() * 8;

    ctx.fillStyle = Math.random() > 0.5 ? '#3e2723' : '#8d6e63';
    ctx.globalAlpha = 0.05 + Math.random() * 0.1;
    
    ctx.fillRect(0, y, size, h); // Full width streaks for grain
  }

  // Detailed Grain Lines
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#261612';
  
  for(let i=0; i < 60; i++) {
     let y = Math.random() * size;
     ctx.beginPath();
     ctx.moveTo(0, y);
     for(let x=0; x <= size; x+=20) {
        y += (Math.random() - 0.5) * 15;
        ctx.lineTo(x, y);
     }
     ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};