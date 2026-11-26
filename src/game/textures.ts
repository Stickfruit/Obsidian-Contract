import * as THREE from 'three';

export interface ProceduralTextureSet {
  asphaltMap: THREE.CanvasTexture;
  asphaltRoughness: THREE.CanvasTexture;
  sidewalkMap: THREE.CanvasTexture;
  interiorFloorMap: THREE.CanvasTexture;
  facadeGlassMap: THREE.CanvasTexture;
  facadeConcreteMap: THREE.CanvasTexture;
  facadeBrickMap: THREE.CanvasTexture;
  muscleMap: THREE.CanvasTexture;
  clothWeaveMap: THREE.CanvasTexture;
  tankFabricMap: THREE.CanvasTexture;
  cargoFabricMap: THREE.CanvasTexture;
  skinArmLegMap: THREE.CanvasTexture;
  faceTextureMap: THREE.CanvasTexture;
  sneakerMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  wantedPosterMap: THREE.CanvasTexture;
  dispose: () => void;
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  isColor: boolean,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.needsUpdate = true;
  return tex;
}

export function createProceduralTextures(
  renderer: THREE.WebGLRenderer,
): ProceduralTextureSet {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const created: THREE.CanvasTexture[] = [];

  // 1. Wet Nocturnal Asphalt + Roughness
  const asphaltCanvas = document.createElement('canvas');
  asphaltCanvas.width = 512;
  asphaltCanvas.height = 512;
  const actx = asphaltCanvas.getContext('2d')!;
  actx.fillStyle = '#1b2029';
  actx.fillRect(0, 0, 512, 512);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#9e9e9e';
  rctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 6500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const v = 24 + Math.floor(Math.random() * 24);
    actx.fillStyle = `rgb(${v},${v + 3},${v + 8})`;
    actx.fillRect(x, y, 2, 2);
  }

  for (let p = 0; p < 14; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    const pr = 24 + Math.random() * 56;
    const grad = actx.createRadialGradient(px, py, 2, px, py, pr);
    grad.addColorStop(0, 'rgba(9, 12, 18, 0.52)');
    grad.addColorStop(1, 'rgba(9, 12, 18, 0)');
    actx.fillStyle = grad;
    actx.beginPath();
    actx.arc(px, py, pr, 0, Math.PI * 2);
    actx.fill();

    const rgrad = rctx.createRadialGradient(px, py, 2, px, py, pr);
    rgrad.addColorStop(0, '#181818');
    rgrad.addColorStop(1, 'rgba(158,158,158,0)');
    rctx.fillStyle = rgrad;
    rctx.beginPath();
    rctx.arc(px, py, pr, 0, Math.PI * 2);
    rctx.fill();
  }

  const asphaltMap = finalizeTexture(asphaltCanvas, true, maxAniso, 32, 32);
  const asphaltRoughness = finalizeTexture(roughCanvas, false, maxAniso, 32, 32);
  created.push(asphaltMap, asphaltRoughness);

  // 2. Concrete Sidewalk Tiles
  const swCanvas = document.createElement('canvas');
  swCanvas.width = 256;
  swCanvas.height = 256;
  const swctx = swCanvas.getContext('2d')!;
  swctx.fillStyle = '#333a47';
  swctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i++) {
    const shade = 44 + Math.floor(Math.random() * 20);
    swctx.fillStyle = `rgb(${shade},${shade + 4},${shade + 10})`;
    swctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  swctx.strokeStyle = '#1e242d';
  swctx.lineWidth = 3;
  for (let g = 0; g <= 256; g += 64) {
    swctx.beginPath();
    swctx.moveTo(g, 0);
    swctx.lineTo(g, 256);
    swctx.stroke();
    swctx.beginPath();
    swctx.moveTo(0, g);
    swctx.lineTo(256, g);
    swctx.stroke();
  }
  const sidewalkMap = finalizeTexture(swCanvas, true, maxAniso, 4, 4);
  created.push(sidewalkMap);

  // 3. Polished Interior Lobby Tile Map
  const intCanvas = document.createElement('canvas');
  intCanvas.width = 256;
  intCanvas.height = 256;
  const ictx = intCanvas.getContext('2d')!;
  ictx.fillStyle = '#252c38';
  ictx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) {
    for (let x = 0; x < 256; x += 64) {
      const alt = ((x + y) / 64) % 2 === 0;
      ictx.fillStyle = alt ? '#2e3645' : '#242b37';
      ictx.fillRect(x + 2, y + 2, 60, 60);
    }
  }
  const interiorFloorMap = finalizeTexture(intCanvas, true, maxAniso, 5, 5);
  created.push(interiorFloorMap);

  // 4. Glass Office Tower Facade
  const fgCanvas = document.createElement('canvas');
  fgCanvas.width = 512;
  fgCanvas.height = 512;
  const fgctx = fgCanvas.getContext('2d')!;
  fgctx.fillStyle = '#131b28';
  fgctx.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 16; row++) {
    const floorLit = Math.random() > 0.25;
    for (let col = 0; col < 8; col++) {
      const x = col * 64 + 6;
      const y = row * 32 + 5;
      const lit = floorLit && Math.random() > 0.36;
      fgctx.fillStyle = lit
        ? Math.random() > 0.65
          ? '#f6c46d'
          : '#84c0e3'
        : '#1b2638';
      fgctx.fillRect(x, y, 52, 20);
      fgctx.fillStyle = 'rgba(255,255,255,0.09)';
      fgctx.fillRect(x, y, 52, 2);
    }
  }
  const facadeGlassMap = finalizeTexture(fgCanvas, true, maxAniso, 1, 2);
  created.push(facadeGlassMap);

  // 5. Brutalist Concrete Corporate Facade
  const fcCanvas = document.createElement('canvas');
  fcCanvas.width = 512;
  fcCanvas.height = 512;
  const fcctx = fcCanvas.getContext('2d')!;
  fcctx.fillStyle = '#282f3c';
  fcctx.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 6; col++) {
      const x = col * 85 + 10;
      const y = row * 42 + 8;
      fcctx.fillStyle = '#141922';
      fcctx.fillRect(x - 2, y - 2, 69, 28);
      const lit = Math.random() > 0.45;
      fcctx.fillStyle = lit
        ? Math.random() > 0.45
          ? '#ebb35e'
          : '#93bed6'
        : '#1d2432';
      fcctx.fillRect(x, y, 65, 24);
    }
  }
  const facadeConcreteMap = finalizeTexture(fcCanvas, true, maxAniso, 1, 2);
  created.push(facadeConcreteMap);

  // 6. Brick Apartment Facade
  const fbCanvas = document.createElement('canvas');
  fbCanvas.width = 512;
  fbCanvas.height = 512;
  const fbctx = fbCanvas.getContext('2d')!;
  fbctx.fillStyle = '#402825';
  fbctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 16) {
    fbctx.fillStyle = 'rgba(0,0,0,0.22)';
    fbctx.fillRect(0, y, 512, 2);
  }
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 6; col++) {
      const x = col * 85 + 18;
      const y = row * 64 + 14;
      fbctx.fillStyle = '#1a1518';
      fbctx.fillRect(x - 3, y - 3, 48, 42);
      const warm = Math.random() > 0.35;
      fbctx.fillStyle = warm ? '#eaa34f' : '#1e2028';
      fbctx.fillRect(x, y, 42, 36);
      fbctx.fillStyle = '#201a1c';
      fbctx.fillRect(x + 20, y, 2, 36);
      fbctx.fillRect(x, y + 17, 42, 2);
    }
  }
  const facadeBrickMap = finalizeTexture(fbCanvas, true, maxAniso, 1, 2);
  created.push(facadeBrickMap);

  // 7. Striated Crimson Muscle Fiber Texture (Regen Phase 2)
  const mCanvas = document.createElement('canvas');
  mCanvas.width = 256;
  mCanvas.height = 256;
  const mctx = mCanvas.getContext('2d')!;
  mctx.fillStyle = '#75121a';
  mctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 110; i++) {
    const x = Math.random() * 256;
    mctx.strokeStyle =
      i % 3 === 0
        ? 'rgba(230, 198, 192, 0.35)'
        : 'rgba(175, 26, 38, 0.78)';
    mctx.lineWidth = 1 + Math.random() * 2.5;
    mctx.beginPath();
    mctx.moveTo(x, 0);
    mctx.bezierCurveTo(
      x + (Math.random() - 0.5) * 20,
      85,
      x + (Math.random() - 0.5) * 20,
      170,
      x + (Math.random() - 0.5) * 10,
      256,
    );
    mctx.stroke();
  }
  const muscleMap = finalizeTexture(mCanvas, true, maxAniso, 2, 2);
  created.push(muscleMap);

  // 8. Tactical Obsidian Nanoweave Clothing Texture
  const cCanvas = document.createElement('canvas');
  cCanvas.width = 128;
  cCanvas.height = 128;
  const cctx = cCanvas.getContext('2d')!;
  cctx.fillStyle = '#181c24';
  cctx.fillRect(0, 0, 128, 128);
  cctx.strokeStyle = '#28303f';
  cctx.lineWidth = 1;
  for (let i = -128; i < 256; i += 6) {
    cctx.beginPath();
    cctx.moveTo(i, 0);
    cctx.lineTo(i + 128, 128);
    cctx.stroke();
    cctx.beginPath();
    cctx.moveTo(i + 128, 0);
    cctx.lineTo(i, 128);
    cctx.stroke();
  }
  const clothWeaveMap = finalizeTexture(cCanvas, true, maxAniso, 4, 4);
  created.push(clothWeaveMap);

  // 9. Realistic Worn White/Heather Tank Fabric Texture (matches uploaded ref)
  const tankCanvas = document.createElement('canvas');
  tankCanvas.width = 256;
  tankCanvas.height = 256;
  const tctx = tankCanvas.getContext('2d')!;
  tctx.fillStyle = '#d8d6cf';
  tctx.fillRect(0, 0, 256, 256);
  // Subtle fabric creases & weathering
  for (let i = 0; i < 36; i++) {
    const y = Math.random() * 256;
    tctx.strokeStyle = `rgba(115, 112, 105, ${0.08 + Math.random() * 0.14})`;
    tctx.lineWidth = 2 + Math.random() * 4;
    tctx.beginPath();
    tctx.moveTo(0, y);
    tctx.bezierCurveTo(85, y + (Math.random() - 0.5) * 18, 170, y + (Math.random() - 0.5) * 18, 256, y);
    tctx.stroke();
  }
  // Small chest emblem print
  tctx.fillStyle = 'rgba(45, 48, 52, 0.55)';
  tctx.beginPath();
  tctx.arc(166, 78, 10, 0, Math.PI * 2);
  tctx.fill();
  const tankFabricMap = finalizeTexture(tankCanvas, true, maxAniso, 1, 1);
  created.push(tankFabricMap);

  // 10. Olive/Charcoal Cargo Twill Texture
  const cargoCanvas = document.createElement('canvas');
  cargoCanvas.width = 128;
  cargoCanvas.height = 128;
  const cgctx = cargoCanvas.getContext('2d')!;
  cgctx.fillStyle = '#333b2e';
  cgctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 600; i++) {
    cgctx.fillStyle =
      i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)';
    cgctx.fillRect(Math.random() * 128, Math.random() * 128, 3, 1);
  }
  const cargoFabricMap = finalizeTexture(cargoCanvas, true, maxAniso, 2, 2);
  created.push(cargoFabricMap);

  // 11. Realistic Shaded Skin & Muscle Definition Map (veins, subtle hair & muscle shadow)
  const skCanvas = document.createElement('canvas');
  skCanvas.width = 256;
  skCanvas.height = 256;
  const skctx = skCanvas.getContext('2d')!;
  const skGrad = skctx.createLinearGradient(0, 0, 256, 256);
  skGrad.addColorStop(0, '#c28c6b');
  skGrad.addColorStop(0.5, '#b67d5c');
  skGrad.addColorStop(1, '#9e684b');
  skctx.fillStyle = skGrad;
  skctx.fillRect(0, 0, 256, 256);
  // Subtle muscle shading & forearm veins
  for (let i = 0; i < 24; i++) {
    skctx.strokeStyle = 'rgba(92, 54, 40, 0.14)';
    skctx.lineWidth = 2;
    const x = Math.random() * 256;
    skctx.beginPath();
    skctx.moveTo(x, 0);
    skctx.lineTo(x + (Math.random() - 0.5) * 32, 256);
    skctx.stroke();
  }
  const skinArmLegMap = finalizeTexture(skCanvas, true, maxAniso, 1, 1);
  created.push(skinArmLegMap);

  // 12. Realistic Sculpted Head/Face Texture (eyes, brows, stubble, ears/hair)
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 256;
  faceCanvas.height = 256;
  const fctx = faceCanvas.getContext('2d')!;
  fctx.fillStyle = '#bc8362';
  fctx.fillRect(0, 0, 256, 256);
  // Back/side hair region
  fctx.fillStyle = '#251e1b';
  fctx.fillRect(0, 0, 256, 72);
  fctx.fillRect(0, 72, 48, 120);
  fctx.fillRect(208, 72, 48, 120);
  // Jaw stubble shadow across lower face (front is centered around u=0.5 -> x=128)
  const stubbleGrad = fctx.createLinearGradient(0, 145, 0, 235);
  stubbleGrad.addColorStop(0, 'rgba(38, 28, 24, 0)');
  stubbleGrad.addColorStop(0.35, 'rgba(38, 28, 24, 0.42)');
  stubbleGrad.addColorStop(1, 'rgba(38, 28, 24, 0.58)');
  fctx.fillStyle = stubbleGrad;
  fctx.fillRect(60, 145, 136, 95);
  // Eyes & eyebrows (UV centered at x=128)
  fctx.fillStyle = '#241a16';
  fctx.fillRect(92, 102, 24, 5); // Left brow
  fctx.fillRect(140, 102, 24, 5); // Right brow
  fctx.fillStyle = '#e8e4dc';
  fctx.fillRect(96, 114, 16, 7); // Left sclera
  fctx.fillRect(144, 114, 16, 7); // Right sclera
  fctx.fillStyle = '#2b201a';
  fctx.fillRect(101, 114, 7, 7); // Left iris
  fctx.fillRect(149, 114, 7, 7); // Right iris
  // Nose bridge shadow & mouth
  fctx.fillStyle = 'rgba(110, 62, 44, 0.45)';
  fctx.fillRect(124, 112, 8, 30);
  fctx.fillStyle = '#7c4538';
  fctx.fillRect(114, 162, 28, 5);
  const faceTextureMap = finalizeTexture(faceCanvas, true, maxAniso, 1, 1);
  faceTextureMap.wrapS = THREE.ClampToEdgeWrapping;
  faceTextureMap.wrapT = THREE.ClampToEdgeWrapping;
  created.push(faceTextureMap);

  // 13. Detailed Sneaker Knit & Trim Map
  const snCanvas = document.createElement('canvas');
  snCanvas.width = 128;
  snCanvas.height = 128;
  const snctx = snCanvas.getContext('2d')!;
  snctx.fillStyle = '#6c727a';
  snctx.fillRect(0, 0, 128, 128);
  snctx.fillStyle = '#272b30';
  snctx.fillRect(0, 82, 128, 46);
  snctx.fillStyle = '#d4d6d8';
  for (let i = 18; i < 66; i += 12) {
    snctx.fillRect(42, i, 44, 4);
  }
  const sneakerMap = finalizeTexture(snCanvas, true, maxAniso, 1, 1);
  created.push(sneakerMap);

  // 14. Soft Radial Contact Shadow
  const csCanvas = document.createElement('canvas');
  csCanvas.width = 128;
  csCanvas.height = 128;
  const csctx = csCanvas.getContext('2d')!;
  const csGrad = csctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  csGrad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  csGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.32)');
  csGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  csctx.fillStyle = csGrad;
  csctx.fillRect(0, 0, 128, 128);
  const contactShadowMap = new THREE.CanvasTexture(csCanvas);
  contactShadowMap.colorSpace = THREE.SRGBColorSpace;
  contactShadowMap.needsUpdate = true;
  created.push(contactShadowMap);

  // 15. Gritty High-Contrast WANTED Poster featuring the Assassin's Face
  const wpCanvas = document.createElement('canvas');
  wpCanvas.width = 256;
  wpCanvas.height = 360;
  const wp = wpCanvas.getContext('2d')!;
  // Weathered parchment / flyer paper
  wp.fillStyle = '#e5dcc8';
  wp.fillRect(0, 0, 256, 360);
  for (let i = 0; i < 650; i++) {
    wp.fillStyle =
      i % 2 === 0 ? 'rgba(60, 45, 30, 0.06)' : 'rgba(255, 255, 255, 0.08)';
    wp.fillRect(Math.random() * 256, Math.random() * 360, 4, 4);
  }
  // Red/Black header bar
  wp.fillStyle = '#991b1b';
  wp.fillRect(14, 14, 228, 52);
  wp.strokeStyle = '#14171f';
  wp.lineWidth = 4;
  wp.strokeRect(8, 8, 240, 344);
  wp.fillStyle = '#fef2f2';
  wp.font = 'bold 38px "Chakra Petch", sans-serif';
  wp.textAlign = 'center';
  wp.textBaseline = 'middle';
  wp.fillText('WANTED', 128, 41);

  // Portrait Frame
  wp.fillStyle = '#181c26';
  wp.fillRect(34, 76, 188, 178);
  wp.strokeStyle = '#334155';
  wp.lineWidth = 3;
  wp.strokeRect(34, 76, 188, 178);

  // Draw Assassin Bust / Face inside Portrait Frame
  // Shoulders / Coat Collar
  wp.fillStyle = '#0f131b';
  wp.beginPath();
  wp.moveTo(46, 254);
  wp.lineTo(74, 202);
  wp.lineTo(182, 202);
  wp.lineTo(210, 254);
  wp.closePath();
  wp.fill();
  // Neck
  wp.fillStyle = '#9e684b';
  wp.fillRect(108, 180, 40, 30);
  // Head / Jawline
  wp.fillStyle = '#bc8362';
  wp.beginPath();
  wp.ellipse(128, 148, 38, 46, 0, 0, Math.PI * 2);
  wp.fill();
  // Dark Stubble & Jaw Shadow
  wp.fillStyle = 'rgba(28, 20, 18, 0.48)';
  wp.beginPath();
  wp.ellipse(128, 170, 33, 24, 0, 0, Math.PI);
  wp.fill();
  // Eyes, Brows & Nose
  wp.fillStyle = '#1d1613';
  wp.fillRect(98, 130, 22, 5);
  wp.fillRect(136, 130, 22, 5);
  wp.fillStyle = '#f1f5f9';
  wp.fillRect(101, 139, 16, 6);
  wp.fillRect(139, 139, 16, 6);
  wp.fillStyle = '#1e1612';
  wp.fillRect(106, 139, 6, 6);
  wp.fillRect(144, 139, 6, 6);
  wp.fillStyle = 'rgba(95, 50, 34, 0.55)';
  wp.fillRect(124, 138, 8, 22);
  wp.fillStyle = '#6f3b30';
  wp.fillRect(114, 173, 28, 4);
  // Dark Assassin Hood Framing Face
  wp.strokeStyle = '#0b0e14';
  wp.lineWidth = 14;
  wp.beginPath();
  wp.arc(128, 146, 48, Math.PI * 0.86, Math.PI * 2.14);
  wp.stroke();
  // Amber Tactical Visor Glint
  wp.fillStyle = '#f59e0b';
  wp.fillRect(102, 118, 52, 4);

  // Caption Lines
  wp.fillStyle = '#111827';
  wp.font = 'bold 20px sans-serif';
  wp.fillText('ARMED & DANGEROUS', 128, 278);
  wp.fillStyle = '#991b1b';
  wp.font = 'bold 24px sans-serif';
  wp.fillText('REWARD $50,000', 128, 308);
  wp.fillStyle = '#374151';
  wp.font = 'bold 13px sans-serif';
  wp.fillText('CALL POLICE ON SIGHT', 128, 334);

  const wantedPosterMap = finalizeTexture(wpCanvas, true, maxAniso, 1, 1);
  wantedPosterMap.wrapS = THREE.ClampToEdgeWrapping;
  wantedPosterMap.wrapT = THREE.ClampToEdgeWrapping;
  created.push(wantedPosterMap);

  return {
    asphaltMap,
    asphaltRoughness,
    sidewalkMap,
    interiorFloorMap,
    facadeGlassMap,
    facadeConcreteMap,
    facadeBrickMap,
    muscleMap,
    clothWeaveMap,
    tankFabricMap,
    cargoFabricMap,
    skinArmLegMap,
    faceTextureMap,
    sneakerMap,
    contactShadowMap,
    wantedPosterMap,
    dispose: () => {
      created.forEach((t) => t.dispose());
    },
  };
}

export function createNeonSignTexture(
  label: string,
  accentHex: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0c1018';
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 244, 84);
  ctx.fillStyle = accentHex;
  ctx.font = 'bold 34px "Chakra Petch", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 49);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
