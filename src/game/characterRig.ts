import * as THREE from 'three';
import type { LimbId, LimbStatus, NpcRole, OutfitId, WeaponId } from '../types/game';
import type { ProceduralTextureSet } from './textures';

export interface AnatomicalLimbRig {
  pivot: THREE.Group;
  growthRoot: THREE.Group;
  boneGroup: THREE.Group;
  fleshGroup: THREE.Group;
  skinGroup: THREE.Group;
  clothGroup: THREE.Group;
  stumpGroup: THREE.Group;
  fractureRing: THREE.Mesh;
  lowerPivot: THREE.Group;
  bladeMesh?: THREE.Mesh;
  isArm: boolean;
}

export interface ClothPanelState {
  pivot: THREE.Group;
  side: -1 | 0 | 1;
  angleX: number;
  velX: number;
  angleZ: number;
  velZ: number;
}

export interface AssassinRig {
  root: THREE.Group;
  pelvis: THREE.Group;
  torsoPivot: THREE.Group;
  headPivot: THREE.Group;
  torsoBones: THREE.Group;
  torsoFlesh: THREE.Group;
  torsoSkin: THREE.Group;
  torsoCloth: THREE.Group;
  torsoFractureGlow: THREE.Mesh;
  limbs: Record<'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg', AnatomicalLimbRig>;
  coatTails: THREE.Group;
  clothPanels: ClothPanelState[];
  handWeapons: {
    kunai: THREE.Group;
    pistol: THREE.Group;
    shotgun: THREE.Group;
    lockpick: THREE.Group;
    phone: THREE.Group;
    wineBottle: THREE.Group;
  };
  outfitVisuals: {
    clothMat: THREE.MeshPhysicalMaterial;
    cargoMat: THREE.MeshStandardMaterial;
    armorMat: THREE.MeshStandardMaterial;
    chestRig: THREE.Mesh;
    suitTie: THREE.Mesh;
    hiVisVest: THREE.Mesh;
    hoodGroup: THREE.Group;
    capGroup: THREE.Group;
    shadesGroup: THREE.Group;
    fedoraGroup: THREE.Group;
    cyberVisor: THREE.Group;
    topHair: THREE.Mesh;
    textures: ProceduralTextureSet;
  };
  contactShadow: THREE.Mesh;
  disposables: Array<{ dispose: () => void }>;
}

export interface NpcRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftKnee: THREE.Group;
  rightKnee: THREE.Group;
  weaponGroup: THREE.Group;
  phoneMesh: THREE.Mesh;
  posterMesh: THREE.Mesh;
  alertRing: THREE.Mesh;
  muzzleFlash: THREE.Mesh;
  contactShadow: THREE.Mesh;
  disposables: Array<{ dispose: () => void }>;
}

// ---------- Sculpted Realistic Anatomical Geometry Builders ----------

function createBoneShaftGeometry(
  length: number,
  radius: number,
): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(radius * 1.48, length * 0.05),
    new THREE.Vector2(radius * 1.12, length * 0.14),
    new THREE.Vector2(radius * 0.68, length * 0.35),
    new THREE.Vector2(radius * 0.66, length * 0.65),
    new THREE.Vector2(radius * 1.12, length * 0.86),
    new THREE.Vector2(radius * 1.44, length * 0.95),
    new THREE.Vector2(0.001, length),
  ];
  const geo = new THREE.LatheGeometry(pts, 14);
  geo.rotateX(Math.PI);
  return geo;
}

function createMuscleGeometry(
  length: number,
  radius: number,
): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(radius * 0.95, length * 0.1),
    new THREE.Vector2(radius * 1.32, length * 0.36),
    new THREE.Vector2(radius * 1.12, length * 0.7),
    new THREE.Vector2(radius * 0.72, length * 0.94),
    new THREE.Vector2(0.001, length),
  ];
  const geo = new THREE.LatheGeometry(pts, 14);
  geo.rotateX(Math.PI);
  return geo;
}

function createContouredUpperArmGeo(len: number): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.062, len * 0.06),
    new THREE.Vector2(0.066, len * 0.22),
    new THREE.Vector2(0.056, len * 0.48),
    new THREE.Vector2(0.052, len * 0.72),
    new THREE.Vector2(0.044, len * 0.94),
    new THREE.Vector2(0.001, len),
  ];
  const geo = new THREE.LatheGeometry(pts, 16);
  geo.rotateX(Math.PI);
  return geo;
}

function createContouredForearmGeo(len: number): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.045, len * 0.05),
    new THREE.Vector2(0.051, len * 0.28),
    new THREE.Vector2(0.041, len * 0.62),
    new THREE.Vector2(0.031, len * 0.95),
    new THREE.Vector2(0.001, len),
  ];
  const geo = new THREE.LatheGeometry(pts, 16);
  geo.rotateX(Math.PI);
  return geo;
}

function createContouredThighGeo(len: number): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.088, len * 0.08),
    new THREE.Vector2(0.094, len * 0.34),
    new THREE.Vector2(0.08, len * 0.72),
    new THREE.Vector2(0.062, len * 0.96),
    new THREE.Vector2(0.001, len),
  ];
  const geo = new THREE.LatheGeometry(pts, 16);
  geo.rotateX(Math.PI);
  return geo;
}

function createContouredCalfGeo(len: number): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.06, len * 0.05),
    new THREE.Vector2(0.068, len * 0.3),
    new THREE.Vector2(0.058, len * 0.56),
    new THREE.Vector2(0.041, len * 0.85),
    new THREE.Vector2(0.038, len * 0.96),
    new THREE.Vector2(0.001, len),
  ];
  const geo = new THREE.LatheGeometry(pts, 16);
  geo.rotateX(Math.PI);
  return geo;
}

function createAthleticTorsoGeo(height: number): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.165, height * 0.04),
    new THREE.Vector2(0.155, height * 0.25),
    new THREE.Vector2(0.185, height * 0.55),
    new THREE.Vector2(0.215, height * 0.8),
    new THREE.Vector2(0.17, height * 0.95),
    new THREE.Vector2(0.075, height),
  ];
  const geo = new THREE.LatheGeometry(pts, 18);
  geo.scale(1.12, 1, 0.72);
  return geo;
}

function buildRealisticHandGroup(
  skinMat: THREE.Material,
  gloveMat: THREE.Material | null,
  side: -1 | 1,
  disposables: Array<{ dispose: () => void }>,
): THREE.Group {
  const mat = gloveMat || skinMat;
  const g = new THREE.Group();

  const palmGeo = new THREE.BoxGeometry(0.046, 0.088, 0.078);
  const palm = new THREE.Mesh(palmGeo, mat);
  palm.position.set(0, -0.042, 0.008);
  g.add(palm);

  const fingerGeo = new THREE.BoxGeometry(0.034, 0.068, 0.062);
  const fingers = new THREE.Mesh(fingerGeo, mat);
  fingers.position.set(side * -0.005, -0.105, 0.012);
  fingers.rotation.z = side * -0.12;
  g.add(fingers);

  const thumbGeo = new THREE.BoxGeometry(0.022, 0.048, 0.024);
  const thumb = new THREE.Mesh(thumbGeo, mat);
  thumb.position.set(side * -0.018, -0.065, 0.044);
  thumb.rotation.x = 0.35;
  g.add(thumb);

  disposables.push(palmGeo, fingerGeo, thumbGeo);
  return g;
}

function buildRealisticSneakerGroup(
  sneakerMat: THREE.Material,
  sockMat: THREE.Material,
  soleMat: THREE.Material,
  disposables: Array<{ dispose: () => void }>,
): THREE.Group {
  const g = new THREE.Group();

  const sockGeo = new THREE.CylinderGeometry(0.043, 0.041, 0.08, 12);
  const sock = new THREE.Mesh(sockGeo, sockMat);
  sock.position.y = 0.045;
  g.add(sock);

  const upperGeo = new THREE.BoxGeometry(0.102, 0.072, 0.21);
  const upper = new THREE.Mesh(upperGeo, sneakerMat);
  upper.position.set(0, 0.0, 0.042);
  upper.castShadow = true;
  g.add(upper);

  const toeGeo = new THREE.SphereGeometry(0.05, 10, 8);
  toeGeo.scale(1.0, 0.65, 1.25);
  const toe = new THREE.Mesh(toeGeo, sneakerMat);
  toe.position.set(0, -0.008, 0.14);
  g.add(toe);

  const tongueGeo = new THREE.BoxGeometry(0.064, 0.048, 0.05);
  const tongue = new THREE.Mesh(tongueGeo, sneakerMat);
  tongue.position.set(0, 0.036, 0.06);
  tongue.rotation.x = -0.35;
  g.add(tongue);

  const midsoleGeo = new THREE.BoxGeometry(0.11, 0.026, 0.25);
  const midsole = new THREE.Mesh(midsoleGeo, sockMat);
  midsole.position.set(0, -0.036, 0.048);
  g.add(midsole);

  const treadGeo = new THREE.BoxGeometry(0.112, 0.012, 0.252);
  const tread = new THREE.Mesh(treadGeo, soleMat);
  tread.position.set(0, -0.052, 0.048);
  g.add(tread);

  disposables.push(sockGeo, upperGeo, toeGeo, tongueGeo, midsoleGeo, treadGeo);
  return g;
}

function buildRealisticHeadGroup(
  faceMat: THREE.Material,
  skinMat: THREE.Material,
  hatMat: THREE.Material,
  isBackwardsCap: boolean,
  isHoodedAssassin: boolean,
  visorMat: THREE.Material | null,
  disposables: Array<{ dispose: () => void }>,
): THREE.Group {
  const g = new THREE.Group();

  const neckGeo = new THREE.CylinderGeometry(0.056, 0.068, 0.12, 12);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.04;
  g.add(neck);

  const craniumGeo = new THREE.SphereGeometry(0.116, 18, 16);
  craniumGeo.scale(0.9, 1.12, 0.98);
  craniumGeo.rotateY(-Math.PI / 2);
  const cranium = new THREE.Mesh(craniumGeo, faceMat);
  cranium.position.y = 0.175;
  cranium.castShadow = true;
  g.add(cranium);

  const jawGeo = new THREE.BoxGeometry(0.105, 0.075, 0.105);
  const jaw = new THREE.Mesh(jawGeo, skinMat);
  jaw.position.set(0, 0.115, 0.03);
  g.add(jaw);

  const noseGeo = new THREE.ConeGeometry(0.016, 0.044, 6);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.rotation.x = Math.PI * 0.32;
  nose.position.set(0, 0.172, 0.112);
  g.add(nose);

  const earGeo = new THREE.SphereGeometry(0.022, 8, 8);
  earGeo.scale(0.45, 1.15, 0.75);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, skinMat);
    ear.position.set(sx * 0.105, 0.17, 0.0);
    g.add(ear);
  }

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x221b18,
    roughness: 0.85,
  });
  const napeHairGeo = new THREE.BoxGeometry(0.12, 0.07, 0.06);
  const napeHair = new THREE.Mesh(napeHairGeo, hairMat);
  napeHair.position.set(0, 0.13, -0.092);
  g.add(napeHair);

  disposables.push(neckGeo, craniumGeo, jawGeo, noseGeo, earGeo, hairMat, napeHairGeo);

  if (isBackwardsCap) {
    const capGeo = new THREE.SphereGeometry(
      0.122,
      16,
      12,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.54,
    );
    capGeo.scale(0.92, 1.0, 1.02);
    const cap = new THREE.Mesh(capGeo, hatMat);
    cap.position.set(0, 0.195, -0.005);
    g.add(cap);

    const brimGeo = new THREE.CylinderGeometry(
      0.095,
      0.1,
      0.012,
      14,
      1,
      false,
      -Math.PI * 0.45,
      Math.PI * 0.9,
    );
    const brim = new THREE.Mesh(brimGeo, hatMat);
    brim.position.set(0, 0.195, -0.09);
    brim.rotation.x = 0.18;
    brim.rotation.y = Math.PI;
    g.add(brim);

    const strapGeo = new THREE.BoxGeometry(0.085, 0.022, 0.02);
    const strap = new THREE.Mesh(strapGeo, hatMat);
    strap.position.set(0, 0.21, 0.106);
    g.add(strap);

    disposables.push(capGeo, brimGeo, strapGeo);
  } else if (isHoodedAssassin) {
    const hoodGeo = new THREE.SphereGeometry(
      0.132,
      16,
      12,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.62,
    );
    hoodGeo.scale(0.96, 1.12, 1.08);
    const hood = new THREE.Mesh(hoodGeo, hatMat);
    hood.position.set(0, 0.19, -0.015);
    hood.castShadow = true;
    g.add(hood);

    const maskGeo = new THREE.BoxGeometry(0.145, 0.08, 0.12);
    const mask = new THREE.Mesh(maskGeo, hatMat);
    mask.position.set(0, 0.12, 0.052);
    g.add(mask);

    if (visorMat) {
      const browSlitGeo = new THREE.BoxGeometry(0.11, 0.018, 0.03);
      const slit = new THREE.Mesh(browSlitGeo, visorMat);
      slit.position.set(0, 0.195, 0.104);
      g.add(slit);
      disposables.push(browSlitGeo);
    }

    disposables.push(hoodGeo, maskGeo);
  } else {
    // Styled short dark hair crown for civilians / clerks / targets
    const topHairGeo = new THREE.SphereGeometry(
      0.12,
      14,
      10,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.48,
    );
    topHairGeo.scale(0.91, 1.02, 1.0);
    const topHair = new THREE.Mesh(topHairGeo, hairMat);
    topHair.position.set(0, 0.192, -0.005);
    g.add(topHair);
    disposables.push(topHairGeo);
  }

  return g;
}

// ---------- Assassin Rig (Realistic Proportions + Anti-Clipping Cloth + 4-Layer Regen) ----------

export function createAssassinRig(textures: ProceduralTextureSet): AssassinRig {
  const disposables: Array<{ dispose: () => void }> = [];
  const root = new THREE.Group();

  const shadowGeo = new THREE.PlaneGeometry(1.15, 1.15);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: textures.contactShadowMap,
    transparent: true,
    depthWrite: false,
    opacity: 0.65,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.025;
  root.add(contactShadow);
  disposables.push(shadowGeo, shadowMat);

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xece5d2,
    roughness: 0.42,
    metalness: 0.05,
    emissive: 0x3b2a14,
    emissiveIntensity: 0.18,
  });
  const fleshMat = new THREE.MeshPhysicalMaterial({
    map: textures.muscleMap,
    color: 0xb01c28,
    roughness: 0.3,
    metalness: 0.02,
    clearcoat: 0.75,
    clearcoatRoughness: 0.2,
    emissive: 0x3a070c,
    emissiveIntensity: 0.25,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    map: textures.skinArmLegMap,
    roughness: 0.56,
    metalness: 0.02,
  });
  const faceMat = new THREE.MeshStandardMaterial({
    map: textures.faceTextureMap,
    roughness: 0.58,
    metalness: 0.02,
  });
  const clothMat = new THREE.MeshPhysicalMaterial({
    map: textures.clothWeaveMap,
    color: 0x1a202c,
    roughness: 0.74,
    metalness: 0.12,
    sheen: 0.45,
    sheenColor: new THREE.Color(0x3a465c),
  });
  const cargoMat = new THREE.MeshStandardMaterial({
    map: textures.cargoFabricMap,
    color: 0x262e36,
    roughness: 0.78,
    metalness: 0.06,
  });
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0x222834,
    roughness: 0.3,
    metalness: 0.72,
  });
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xdbe6f2,
    roughness: 0.15,
    metalness: 0.94,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.5,
  });
  const sockMat = new THREE.MeshStandardMaterial({
    color: 0xd9dde3,
    roughness: 0.85,
  });
  const sneakerMat = new THREE.MeshStandardMaterial({
    map: textures.sneakerMap,
    color: 0x363d49,
    roughness: 0.72,
  });
  const fractureMat = new THREE.MeshBasicMaterial({
    color: 0xff5a1f,
    transparent: true,
    opacity: 0.9,
  });

  disposables.push(
    boneMat,
    fleshMat,
    skinMat,
    faceMat,
    clothMat,
    cargoMat,
    armorMat,
    bladeMat,
    visorMat,
    sockMat,
    sneakerMat,
    fractureMat,
  );

  const pelvis = new THREE.Group();
  pelvis.position.y = 0.94;
  root.add(pelvis);

  const pelvisMeshGeo = new THREE.CylinderGeometry(0.175, 0.185, 0.19, 14);
  pelvisMeshGeo.scale(1.12, 1, 0.74);
  const pelvisMesh = new THREE.Mesh(pelvisMeshGeo, cargoMat);
  pelvisMesh.castShadow = true;
  pelvis.add(pelvisMesh);

  const beltGeo = new THREE.CylinderGeometry(0.182, 0.182, 0.055, 14);
  beltGeo.scale(1.13, 1, 0.75);
  const belt = new THREE.Mesh(beltGeo, armorMat);
  belt.position.y = 0.065;
  pelvis.add(belt);
  disposables.push(pelvisMeshGeo, beltGeo);

  const torsoPivot = new THREE.Group();
  torsoPivot.position.y = 0.08;
  pelvis.add(torsoPivot);

  const torsoBones = new THREE.Group();
  const spineGeo = new THREE.CylinderGeometry(0.042, 0.052, 0.54, 10);
  const spine = new THREE.Mesh(spineGeo, boneMat);
  spine.position.set(0, 0.27, -0.05);
  torsoBones.add(spine);
  disposables.push(spineGeo);

  const ribGeo = new THREE.TorusGeometry(0.15, 0.02, 8, 16, Math.PI * 1.45);
  for (let r = 0; r < 4; r++) {
    const rib = new THREE.Mesh(ribGeo, boneMat);
    rib.rotation.x = Math.PI / 2;
    rib.rotation.z = -Math.PI * 0.22;
    rib.position.set(0, 0.2 + r * 0.08, 0.01);
    rib.scale.set(1.16, 0.76, 1);
    torsoBones.add(rib);
  }
  disposables.push(ribGeo);
  torsoPivot.add(torsoBones);

  const torsoFlesh = new THREE.Group();
  const chestFleshGeo = createAthleticTorsoGeo(0.55);
  chestFleshGeo.scale(0.9, 0.96, 0.9);
  const chestFlesh = new THREE.Mesh(chestFleshGeo, fleshMat);
  torsoFlesh.add(chestFlesh);
  disposables.push(chestFleshGeo);
  torsoPivot.add(torsoFlesh);

  const torsoSkin = new THREE.Group();
  const chestSkinGeo = createAthleticTorsoGeo(0.56);
  chestSkinGeo.scale(0.95, 0.98, 0.95);
  const chestSkin = new THREE.Mesh(chestSkinGeo, skinMat);
  torsoSkin.add(chestSkin);
  disposables.push(chestSkinGeo);
  torsoPivot.add(torsoSkin);

  const torsoCloth = new THREE.Group();
  const jacketGeo = createAthleticTorsoGeo(0.57);
  const jacket = new THREE.Mesh(jacketGeo, clothMat);
  jacket.castShadow = true;
  torsoCloth.add(jacket);

  const chestRigGeo = new THREE.BoxGeometry(0.32, 0.28, 0.27);
  const chestRig = new THREE.Mesh(chestRigGeo, armorMat);
  chestRig.position.set(0, 0.34, 0.01);
  torsoCloth.add(chestRig);

  const tieMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.45,
  });
  const tieGeo = new THREE.BoxGeometry(0.055, 0.28, 0.03);
  const suitTie = new THREE.Mesh(tieGeo, tieMat);
  suitTie.position.set(0, 0.36, 0.155);
  suitTie.visible = false;
  torsoCloth.add(suitTie);

  const vestMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    emissive: 0x854d0e,
    emissiveIntensity: 0.28,
    roughness: 0.65,
  });
  const vestGeo = new THREE.BoxGeometry(0.36, 0.34, 0.29);
  const hiVisVest = new THREE.Mesh(vestGeo, vestMat);
  hiVisVest.position.set(0, 0.32, 0.005);
  hiVisVest.visible = false;
  torsoCloth.add(hiVisVest);

  disposables.push(jacketGeo, chestRigGeo, tieMat, tieGeo, vestMat, vestGeo);
  torsoPivot.add(torsoCloth);

  const torsoFractureGeo = new THREE.TorusGeometry(0.18, 0.016, 8, 18);
  const torsoFractureGlow = new THREE.Mesh(torsoFractureGeo, fractureMat);
  torsoFractureGlow.rotation.x = Math.PI / 2;
  torsoFractureGlow.position.y = 0.32;
  torsoFractureGlow.visible = false;
  torsoPivot.add(torsoFractureGlow);
  disposables.push(torsoFractureGeo);

  // Articulated Anti-Clipping Coat Tails (anchored outside pelvis & legs with top/bottom hinge)
  const coatTails = new THREE.Group();
  coatTails.position.set(0, 0.04, -0.155);
  pelvis.add(coatTails);

  const clothPanels: ClothPanelState[] = [];
  const panelGeo = new THREE.BoxGeometry(0.145, 0.5, 0.024);
  disposables.push(panelGeo);
  const panelConfigs: Array<{ x: number; side: -1 | 0 | 1 }> = [
    { x: -0.13, side: -1 },
    { x: 0, side: 0 },
    { x: 0.13, side: 1 },
  ];
  for (const cfg of panelConfigs) {
    const pivot = new THREE.Group();
    pivot.position.set(cfg.x, 0, 0);
    const mesh = new THREE.Mesh(panelGeo, clothMat);
    mesh.position.set(0, -0.25, -0.015);
    mesh.castShadow = true;
    pivot.add(mesh);
    coatTails.add(pivot);
    clothPanels.push({
      pivot,
      side: cfg.side,
      angleX: 0.14,
      velX: 0,
      angleZ: cfg.side * 0.08,
      velZ: 0,
    });
  }

  // Head with switchable disguise headwear (Hood/Mask vs Cap vs Hair+Shades)
  const headPivot = buildRealisticHeadGroup(
    faceMat,
    skinMat,
    clothMat,
    false,
    false,
    null,
    disposables,
  );
  headPivot.position.y = 0.56;
  torsoPivot.add(headPivot);

  // Top hair mesh is the last child added by buildRealisticHeadGroup when neither cap nor hood is enabled
  const topHair = headPivot.children[headPivot.children.length - 1] as THREE.Mesh;

  const hoodGroup = new THREE.Group();
  const hoodGeo = new THREE.SphereGeometry(
    0.132,
    16,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.62,
  );
  hoodGeo.scale(0.96, 1.12, 1.08);
  const hood = new THREE.Mesh(hoodGeo, clothMat);
  hood.position.set(0, 0.19, -0.015);
  hood.castShadow = true;
  const maskGeo = new THREE.BoxGeometry(0.145, 0.08, 0.12);
  const mask = new THREE.Mesh(maskGeo, clothMat);
  mask.position.set(0, 0.12, 0.052);
  const browSlitGeo = new THREE.BoxGeometry(0.11, 0.018, 0.03);
  const slit = new THREE.Mesh(browSlitGeo, visorMat);
  slit.position.set(0, 0.195, 0.104);
  hoodGroup.add(hood, mask, slit);
  headPivot.add(hoodGroup);

  const capGroup = new THREE.Group();
  const capMat = new THREE.MeshStandardMaterial({ color: 0x38414f, roughness: 0.78 });
  const capGeo = new THREE.SphereGeometry(
    0.122,
    16,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.54,
  );
  capGeo.scale(0.92, 1.0, 1.02);
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.set(0, 0.195, -0.005);
  const brimGeo = new THREE.CylinderGeometry(
    0.095,
    0.1,
    0.012,
    14,
    1,
    false,
    -Math.PI * 0.45,
    Math.PI * 0.9,
  );
  const brim = new THREE.Mesh(brimGeo, capMat);
  brim.position.set(0, 0.195, -0.09);
  brim.rotation.x = 0.18;
  brim.rotation.y = Math.PI;
  capGroup.add(cap, brim);
  capGroup.visible = false;
  headPivot.add(capGroup);

  const shadesGroup = new THREE.Group();
  const shadesMat = new THREE.MeshStandardMaterial({
    color: 0x090b10,
    roughness: 0.15,
    metalness: 0.85,
  });
  const lensGeo = new THREE.BoxGeometry(0.044, 0.022, 0.024);
  const lensL = new THREE.Mesh(lensGeo, shadesMat);
  lensL.position.set(0.034, 0.184, 0.104);
  const lensR = new THREE.Mesh(lensGeo, shadesMat);
  lensR.position.set(-0.034, 0.184, 0.104);
  const bridgeGeo = new THREE.BoxGeometry(0.115, 0.008, 0.02);
  const bridge = new THREE.Mesh(bridgeGeo, shadesMat);
  bridge.position.set(0, 0.188, 0.102);
  shadesGroup.add(lensL, lensR, bridge);
  shadesGroup.visible = false;
  headPivot.add(shadesGroup);

  const fedoraGroup = new THREE.Group();
  const fedoraMat = new THREE.MeshStandardMaterial({ color: 0x3b2f26, roughness: 0.78 });
  const fedoraBandMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.55 });
  const fedBrimGeo = new THREE.CylinderGeometry(0.185, 0.19, 0.012, 20);
  const fedCrownGeo = new THREE.CylinderGeometry(0.1, 0.118, 0.1, 16);
  const fedBandGeo = new THREE.CylinderGeometry(0.116, 0.119, 0.022, 16);
  const fedBrim = new THREE.Mesh(fedBrimGeo, fedoraMat);
  fedBrim.position.set(0, 0.215, 0);
  const fedCrown = new THREE.Mesh(fedCrownGeo, fedoraMat);
  fedCrown.position.set(0, 0.265, 0);
  const fedBand = new THREE.Mesh(fedBandGeo, fedoraBandMat);
  fedBand.position.set(0, 0.228, 0);
  fedoraGroup.add(fedBrim, fedCrown, fedBand);
  fedoraGroup.visible = false;
  headPivot.add(fedoraGroup);

  const cyberVisor = new THREE.Group();
  const cyberFrameMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.8,
  });
  const cyberGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.5,
    roughness: 0.15,
  });
  const cyberBarGeo = new THREE.BoxGeometry(0.128, 0.026, 0.032);
  const cyberRimGeo = new THREE.BoxGeometry(0.136, 0.034, 0.026);
  const cyberBar = new THREE.Mesh(cyberBarGeo, cyberGlowMat);
  cyberBar.position.set(0, 0.184, 0.105);
  const cyberRim = new THREE.Mesh(cyberRimGeo, cyberFrameMat);
  cyberRim.position.set(0, 0.184, 0.098);
  cyberVisor.add(cyberRim, cyberBar);
  cyberVisor.visible = false;
  headPivot.add(cyberVisor);

  disposables.push(
    hoodGeo,
    maskGeo,
    browSlitGeo,
    capMat,
    capGeo,
    brimGeo,
    shadesMat,
    lensGeo,
    bridgeGeo,
    fedoraMat,
    fedoraBandMat,
    fedBrimGeo,
    fedCrownGeo,
    fedBandGeo,
    cyberFrameMat,
    cyberGlowMat,
    cyberBarGeo,
    cyberRimGeo,
  );

  function buildAnatomicalLimb(
    isArm: boolean,
    side: -1 | 1,
    anchorParent: THREE.Group,
    anchorPos: THREE.Vector3,
  ): AnatomicalLimbRig {
    const pivot = new THREE.Group();
    pivot.position.copy(anchorPos);
    anchorParent.add(pivot);

    const upperLen = isArm ? 0.31 : 0.44;
    const lowerLen = isArm ? 0.29 : 0.43;
    const baseRad = isArm ? 0.044 : 0.064;

    const stumpGroup = new THREE.Group();
    const stumpFleshGeo = new THREE.SphereGeometry(baseRad * 1.15, 10, 8);
    const stumpFlesh = new THREE.Mesh(stumpFleshGeo, fleshMat);
    const stumpBoneGeo = new THREE.CylinderGeometry(
      baseRad * 0.42,
      baseRad * 0.36,
      0.09,
      8,
    );
    const stumpBone = new THREE.Mesh(stumpBoneGeo, boneMat);
    stumpBone.position.y = -0.045;
    stumpGroup.add(stumpFlesh, stumpBone);
    stumpGroup.visible = false;
    pivot.add(stumpGroup);
    disposables.push(stumpFleshGeo, stumpBoneGeo);

    const growthRoot = new THREE.Group();
    pivot.add(growthRoot);

    const boneGroup = new THREE.Group();
    const upperBoneGeo = createBoneShaftGeometry(upperLen, baseRad * 0.55);
    const upperBone = new THREE.Mesh(upperBoneGeo, boneMat);
    const jointBoneGeo = new THREE.SphereGeometry(baseRad * 0.65, 10, 8);
    const jointBone = new THREE.Mesh(jointBoneGeo, boneMat);
    jointBone.position.y = -upperLen;
    const lowerBoneGeo = createBoneShaftGeometry(lowerLen, baseRad * 0.48);
    const lowerBone = new THREE.Mesh(lowerBoneGeo, boneMat);
    lowerBone.position.y = -upperLen;
    boneGroup.add(upperBone, jointBone, lowerBone);
    disposables.push(upperBoneGeo, jointBoneGeo, lowerBoneGeo);
    growthRoot.add(boneGroup);

    const fleshGroup = new THREE.Group();
    const upperFleshGeo = createMuscleGeometry(upperLen, baseRad * 0.98);
    const upperFlesh = new THREE.Mesh(upperFleshGeo, fleshMat);
    const lowerFleshGeo = createMuscleGeometry(lowerLen, baseRad * 0.88);
    const lowerFlesh = new THREE.Mesh(lowerFleshGeo, fleshMat);
    lowerFlesh.position.y = -upperLen;
    fleshGroup.add(upperFlesh, lowerFlesh);
    disposables.push(upperFleshGeo, lowerFleshGeo);
    growthRoot.add(fleshGroup);

    const skinGroup = new THREE.Group();
    const upperSkinGeo = isArm
      ? createContouredUpperArmGeo(upperLen)
      : createContouredThighGeo(upperLen);
    const upperSkin = new THREE.Mesh(upperSkinGeo, skinMat);
    const lowerSkinGeo = isArm
      ? createContouredForearmGeo(lowerLen)
      : createContouredCalfGeo(lowerLen);
    const lowerSkin = new THREE.Mesh(lowerSkinGeo, skinMat);
    lowerSkin.position.y = -upperLen;
    skinGroup.add(upperSkin, lowerSkin);
    disposables.push(upperSkinGeo, lowerSkinGeo);

    if (isArm) {
      const hand = buildRealisticHandGroup(skinMat, null, side, disposables);
      hand.position.y = -upperLen - lowerLen;
      skinGroup.add(hand);
    } else {
      const footGeo = new THREE.BoxGeometry(0.086, 0.065, 0.19);
      const foot = new THREE.Mesh(footGeo, skinMat);
      foot.position.set(0, -upperLen - lowerLen - 0.03, 0.045);
      skinGroup.add(foot);
      disposables.push(footGeo);
    }
    growthRoot.add(skinGroup);

    const clothGroup = new THREE.Group();
    let bladeMesh: THREE.Mesh | undefined;
    if (isArm) {
      const sleeveGeo = createContouredUpperArmGeo(upperLen * 0.82);
      sleeveGeo.scale(1.08, 1, 1.08);
      const sleeve = new THREE.Mesh(sleeveGeo, clothMat);
      sleeve.castShadow = true;
      clothGroup.add(sleeve);

      const bracerGeo = createContouredForearmGeo(lowerLen * 0.72);
      bracerGeo.scale(1.12, 1, 1.12);
      const bracer = new THREE.Mesh(bracerGeo, armorMat);
      bracer.position.y = -upperLen - lowerLen * 0.22;
      clothGroup.add(bracer);

      if (side === 1) {
        const watchGeo = new THREE.CylinderGeometry(0.041, 0.041, 0.032, 12);
        const watch = new THREE.Mesh(watchGeo, armorMat);
        watch.position.y = -upperLen - lowerLen * 0.88;
        clothGroup.add(watch);
        disposables.push(watchGeo);
      }

      const glovedHand = buildRealisticHandGroup(
        skinMat,
        armorMat,
        side,
        disposables,
      );
      glovedHand.position.y = -upperLen - lowerLen;
      clothGroup.add(glovedHand);

      const bladeGeo = new THREE.BoxGeometry(0.016, 0.34, 0.044);
      bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.position.set(side * 0.046, -upperLen - lowerLen - 0.16, 0.03);
      bladeMesh.castShadow = true;
      clothGroup.add(bladeMesh);

      disposables.push(sleeveGeo, bracerGeo, bladeGeo);
    } else {
      const cargoGeo = createContouredThighGeo(upperLen * 1.04);
      cargoGeo.scale(1.16, 1, 1.16);
      const cargo = new THREE.Mesh(cargoGeo, cargoMat);
      cargo.castShadow = true;
      clothGroup.add(cargo);

      const pocketGeo = new THREE.BoxGeometry(0.045, 0.15, 0.125);
      const pocket = new THREE.Mesh(pocketGeo, cargoMat);
      pocket.position.set(side * 0.088, -upperLen * 0.56, 0.0);
      clothGroup.add(pocket);

      const shinGuardGeo = createContouredCalfGeo(lowerLen * 0.65);
      shinGuardGeo.scale(1.08, 1, 1.08);
      const shinGuard = new THREE.Mesh(shinGuardGeo, armorMat);
      shinGuard.position.y = -upperLen - lowerLen * 0.12;
      clothGroup.add(shinGuard);

      const sneaker = buildRealisticSneakerGroup(
        sneakerMat,
        sockMat,
        armorMat,
        disposables,
      );
      sneaker.position.y = -upperLen - lowerLen - 0.025;
      clothGroup.add(sneaker);

      disposables.push(cargoGeo, pocketGeo, shinGuardGeo);
    }
    growthRoot.add(clothGroup);

    const fracGeo = new THREE.TorusGeometry(baseRad * 1.35, 0.014, 8, 16);
    const fractureRing = new THREE.Mesh(fracGeo, fractureMat);
    fractureRing.rotation.x = Math.PI / 2;
    fractureRing.position.y = -upperLen * 0.65;
    fractureRing.visible = false;
    pivot.add(fractureRing);
    disposables.push(fracGeo);

    const lowerPivot = new THREE.Group();
    lowerPivot.position.y = -upperLen;
    pivot.add(lowerPivot);

    return {
      pivot,
      growthRoot,
      boneGroup,
      fleshGroup,
      skinGroup,
      clothGroup,
      stumpGroup,
      fractureRing,
      lowerPivot,
      bladeMesh,
      isArm,
    };
  }

  const limbs = {
    leftArm: buildAnatomicalLimb(
      true,
      1,
      torsoPivot,
      new THREE.Vector3(0.245, 0.47, 0),
    ),
    rightArm: buildAnatomicalLimb(
      true,
      -1,
      torsoPivot,
      new THREE.Vector3(-0.245, 0.47, 0),
    ),
    leftLeg: buildAnatomicalLimb(
      false,
      1,
      pelvis,
      new THREE.Vector3(0.11, -0.04, 0),
    ),
    rightLeg: buildAnatomicalLimb(
      false,
      -1,
      pelvis,
      new THREE.Vector3(-0.11, -0.04, 0),
    ),
  };

  // Hand-held weapons attached to Right Arm wrist (switched via G radial wheel)
  const kunaiGroup = new THREE.Group();
  const kBladeGeo = new THREE.ConeGeometry(0.025, 0.24, 5);
  const kBlade = new THREE.Mesh(kBladeGeo, bladeMat);
  kBlade.rotation.x = Math.PI / 2;
  kBlade.position.set(0, -0.64, 0.14);
  kunaiGroup.add(kBlade);
  kunaiGroup.visible = false;
  limbs.rightArm.clothGroup.add(kunaiGroup);

  const pistolGroup = new THREE.Group();
  const pBodyGeo = new THREE.BoxGeometry(0.042, 0.072, 0.24);
  const pGripGeo = new THREE.BoxGeometry(0.036, 0.1, 0.055);
  const pSuppGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.16, 10);
  pSuppGeo.rotateX(Math.PI / 2);
  const pBody = new THREE.Mesh(pBodyGeo, armorMat);
  pBody.position.set(0, -0.63, 0.12);
  const pGrip = new THREE.Mesh(pGripGeo, armorMat);
  pGrip.position.set(0, -0.68, 0.04);
  pGrip.rotation.x = 0.2;
  const pSupp = new THREE.Mesh(pSuppGeo, bladeMat);
  pSupp.position.set(0, -0.625, 0.3);
  pistolGroup.add(pBody, pGrip, pSupp);
  pistolGroup.visible = false;
  limbs.rightArm.clothGroup.add(pistolGroup);

  const shotgunGroup = new THREE.Group();
  const sBodyGeo = new THREE.BoxGeometry(0.058, 0.092, 0.62);
  const sStockGeo = new THREE.BoxGeometry(0.048, 0.11, 0.22);
  const sBody = new THREE.Mesh(sBodyGeo, armorMat);
  sBody.position.set(-0.01, -0.63, 0.25);
  const sStock = new THREE.Mesh(sStockGeo, cargoMat);
  sStock.position.set(-0.01, -0.66, -0.05);
  shotgunGroup.add(sBody, sStock);
  shotgunGroup.visible = false;
  limbs.rightArm.clothGroup.add(shotgunGroup);

  const lockpickGroup = new THREE.Group();
  const lpHandleGeo = new THREE.BoxGeometry(0.032, 0.044, 0.13);
  const lpNeedleGeo = new THREE.BoxGeometry(0.01, 0.012, 0.18);
  const lpHookGeo = new THREE.BoxGeometry(0.01, 0.038, 0.016);
  const lpHandle = new THREE.Mesh(lpHandleGeo, armorMat);
  lpHandle.position.set(0, -0.635, 0.06);
  const lpNeedle = new THREE.Mesh(lpNeedleGeo, bladeMat);
  lpNeedle.position.set(0, -0.632, 0.21);
  const lpHook = new THREE.Mesh(lpHookGeo, visorMat);
  lpHook.position.set(0, -0.618, 0.29);
  lockpickGroup.add(lpHandle, lpNeedle, lpHook);
  lockpickGroup.visible = false;
  limbs.rightArm.clothGroup.add(lockpickGroup);

  const phoneGroup = new THREE.Group();
  const phBodyGeo = new THREE.BoxGeometry(0.068, 0.014, 0.132);
  const phScreenGeo = new THREE.PlaneGeometry(0.056, 0.114);
  const phBodyMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.75,
  });
  const phScreenMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });
  const phBody = new THREE.Mesh(phBodyGeo, phBodyMat);
  phBody.position.set(0, -0.635, 0.09);
  const phScreen = new THREE.Mesh(phScreenGeo, phScreenMat);
  phScreen.rotation.x = -Math.PI / 2;
  phScreen.position.set(0, -0.626, 0.09);
  phoneGroup.add(phBody, phScreen);
  phoneGroup.visible = false;
  limbs.rightArm.clothGroup.add(phoneGroup);

  const wineGroup = new THREE.Group();
  const wbBodyGeo = new THREE.CylinderGeometry(0.038, 0.04, 0.19, 10);
  const wbNeckGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.09, 8);
  const wbLabelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.065, 10);
  const wbGlassMat = new THREE.MeshStandardMaterial({
    color: 0x1a0b12,
    roughness: 0.18,
    metalness: 0.22,
  });
  const wbLabelMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.65,
  });
  const wbBody = new THREE.Mesh(wbBodyGeo, wbGlassMat);
  wbBody.position.set(0, -0.63, 0.12);
  wbBody.rotation.x = Math.PI / 2;
  const wbNeck = new THREE.Mesh(wbNeckGeo, wbGlassMat);
  wbNeck.position.set(0, -0.63, 0.245);
  wbNeck.rotation.x = Math.PI / 2;
  const wbLabel = new THREE.Mesh(wbLabelGeo, wbLabelMat);
  wbLabel.position.set(0, -0.63, 0.12);
  wbLabel.rotation.x = Math.PI / 2;
  wineGroup.add(wbBody, wbNeck, wbLabel);
  wineGroup.visible = false;
  limbs.rightArm.clothGroup.add(wineGroup);

  disposables.push(
    kBladeGeo,
    pBodyGeo,
    pGripGeo,
    pSuppGeo,
    sBodyGeo,
    sStockGeo,
    lpHandleGeo,
    lpNeedleGeo,
    lpHookGeo,
    phBodyGeo,
    phScreenGeo,
    phBodyMat,
    phScreenMat,
    wbBodyGeo,
    wbNeckGeo,
    wbLabelGeo,
    wbGlassMat,
    wbLabelMat,
  );

  return {
    root,
    pelvis,
    torsoPivot,
    headPivot,
    torsoBones,
    torsoFlesh,
    torsoSkin,
    torsoCloth,
    torsoFractureGlow,
    limbs,
    coatTails,
    clothPanels,
    handWeapons: {
      kunai: kunaiGroup,
      pistol: pistolGroup,
      shotgun: shotgunGroup,
      lockpick: lockpickGroup,
      phone: phoneGroup,
      wineBottle: wineGroup,
    },
    outfitVisuals: {
      clothMat,
      cargoMat,
      armorMat,
      chestRig,
      suitTie,
      hiVisVest,
      hoodGroup,
      capGroup,
      shadesGroup,
      fedoraGroup,
      cyberVisor,
      topHair,
      textures,
    },
    contactShadow,
    disposables,
  };
}

export function applyAssassinOutfit(rig: AssassinRig, outfit: OutfitId) {
  const v = rig.outfitVisuals;
  v.fedoraGroup.visible = false;
  v.cyberVisor.visible = false;
  if (outfit === 'tactical') {
    v.clothMat.map = v.textures.clothWeaveMap;
    v.clothMat.color.setHex(0x1a202c);
    v.cargoMat.map = v.textures.cargoFabricMap;
    v.cargoMat.color.setHex(0x262e36);
    v.chestRig.visible = true;
    v.suitTie.visible = false;
    v.hiVisVest.visible = false;
    v.hoodGroup.visible = true;
    v.capGroup.visible = false;
    v.shadesGroup.visible = false;
    v.topHair.visible = false;
    rig.coatTails.visible = true;
  } else if (outfit === 'street') {
    v.clothMat.map = v.textures.tankFabricMap;
    v.clothMat.color.setHex(0xe2e4e9);
    v.cargoMat.map = v.textures.cargoFabricMap;
    v.cargoMat.color.setHex(0x3a4035);
    v.chestRig.visible = false;
    v.suitTie.visible = false;
    v.hiVisVest.visible = false;
    v.hoodGroup.visible = false;
    v.capGroup.visible = true;
    v.shadesGroup.visible = false;
    v.topHair.visible = false;
    rig.coatTails.visible = false;
  } else if (outfit === 'suit') {
    v.clothMat.map = null;
    v.clothMat.color.setHex(0x242834);
    v.cargoMat.map = null;
    v.cargoMat.color.setHex(0x161a22);
    v.chestRig.visible = false;
    v.suitTie.visible = true;
    v.hiVisVest.visible = false;
    v.hoodGroup.visible = false;
    v.capGroup.visible = false;
    v.shadesGroup.visible = true;
    v.topHair.visible = true;
    rig.coatTails.visible = true;
  } else if (outfit === 'worker') {
    v.clothMat.map = v.textures.clothWeaveMap;
    v.clothMat.color.setHex(0x1e3a5f);
    v.cargoMat.map = v.textures.cargoFabricMap;
    v.cargoMat.color.setHex(0x524634);
    v.chestRig.visible = false;
    v.suitTie.visible = false;
    v.hiVisVest.visible = true;
    v.hoodGroup.visible = false;
    v.capGroup.visible = true;
    v.shadesGroup.visible = false;
    v.topHair.visible = false;
    rig.coatTails.visible = false;
  } else if (outfit === 'leather') {
    v.clothMat.map = v.textures.clothWeaveMap;
    v.clothMat.color.setHex(0x6b141a);
    v.cargoMat.map = v.textures.cargoFabricMap;
    v.cargoMat.color.setHex(0x181a20);
    v.chestRig.visible = false;
    v.suitTie.visible = false;
    v.hiVisVest.visible = false;
    v.hoodGroup.visible = false;
    v.capGroup.visible = false;
    v.shadesGroup.visible = true;
    v.topHair.visible = true;
    rig.coatTails.visible = false;
  } else if (outfit === 'coastal') {
    v.clothMat.map = v.textures.tankFabricMap;
    v.clothMat.color.setHex(0x0f766e);
    v.cargoMat.map = null;
    v.cargoMat.color.setHex(0xe7e5e4);
    v.chestRig.visible = false;
    v.suitTie.visible = false;
    v.hiVisVest.visible = false;
    v.hoodGroup.visible = false;
    v.capGroup.visible = false;
    v.shadesGroup.visible = true;
    v.topHair.visible = true;
    rig.coatTails.visible = false;
  } else if (outfit === 'trench') {
    v.clothMat.map = v.textures.clothWeaveMap;
    v.clothMat.color.setHex(0xa17c52);
    v.cargoMat.map = null;
    v.cargoMat.color.setHex(0x1f2937);
    v.chestRig.visible = false;
    v.suitTie.visible = true;
    v.hiVisVest.visible = false;
    v.hoodGroup.visible = false;
    v.capGroup.visible = false;
    v.shadesGroup.visible = false;
    v.topHair.visible = false;
    v.fedoraGroup.visible = true;
    rig.coatTails.visible = true;
  } else {
    // 'cyber'
    v.clothMat.map = v.textures.clothWeaveMap;
    v.clothMat.color.setHex(0xe2e8f0);
    v.cargoMat.map = v.textures.cargoFabricMap;
    v.cargoMat.color.setHex(0x0f172a);
    v.chestRig.visible = true;
    v.suitTie.visible = false;
    v.hiVisVest.visible = false;
    v.hoodGroup.visible = true;
    v.capGroup.visible = false;
    v.shadesGroup.visible = false;
    v.topHair.visible = false;
    v.cyberVisor.visible = true;
    rig.coatTails.visible = true;
  }
  v.clothMat.needsUpdate = true;
  v.cargoMat.needsUpdate = true;
}

export function setAssassinWeaponVisual(rig: AssassinRig, weapon: WeaponId) {
  const showBlades = weapon === 'blades';
  if (rig.limbs.leftArm.bladeMesh) {
    rig.limbs.leftArm.bladeMesh.visible = showBlades;
  }
  if (rig.limbs.rightArm.bladeMesh) {
    rig.limbs.rightArm.bladeMesh.visible = showBlades;
  }
  rig.handWeapons.kunai.visible = weapon === 'kunai';
  rig.handWeapons.pistol.visible = weapon === 'pistol';
  rig.handWeapons.shotgun.visible = weapon === 'shotgun';
  rig.handWeapons.lockpick.visible = weapon === 'lockpick';
  rig.handWeapons.phone.visible = weapon === 'phone';
}

/**
 * Spring-pendulum cloth simulation with strict 3D leg-capsule & ground-plane
 * collision clamping so coat tails billow smoothly and never clip into legs,
 * torso, or pavement during walking, sprinting, crouching, turning, or ragdoll.
 */
export function updateClothPhysics(
  rig: AssassinRig,
  moveSpeed: number,
  leftLegAngle: number,
  rightLegAngle: number,
  isCrouching: boolean,
  dt: number,
  yawRate = 0,
  velY = 0,
  isRagdoll = false,
) {
  const stepDt = Math.min(0.033, dt);
  const pelvisY = rig.pelvis.position.y;
  const pelvisPitch = rig.pelvis.rotation.x;
  const coatLength = 0.5;
  const coatAnchorY = 0.04;
  const coatAnchorZ = -0.155;
  const thighRadius = 0.128; // includes cargo pocket + cloth clearance margin

  const baseRest = isRagdoll
    ? 0.24
    : isCrouching
      ? 0.46
      : 0.16 + Math.min(0.46, moveSpeed * 0.046);
  const airLift = isRagdoll ? 0 : THREE.MathUtils.clamp(-velY * 0.045, -0.05, 0.32);

  for (const panel of rig.clothPanels) {
    // Center panel (side === 0) overlaps both inner thighs/glutes, so test both legs!
    const testLegs =
      panel.side === 1
        ? [leftLegAngle]
        : panel.side === -1
          ? [rightLegAngle]
          : [leftLegAngle, rightLegAngle];

    // 1. Solve minimum coat swing angle (angleX) that clears pelvis & leg capsules
    let minClearanceAngle = isCrouching ? 0.36 : 0.14;
    for (const legAngle of testLegs) {
      if (legAngle > -0.12) {
        const legRot = Math.max(0, legAngle);
        for (const s of [0.22, 0.36, 0.48]) {
          // Rearmost Z surface of the leg segment at length s
          const legZBack = -s * Math.sin(legRot) - thighRadius * Math.cos(legRot);
          const legY = -0.04 - s * Math.cos(legRot);
          const dyFromCoat = coatAnchorY - legY;
          if (dyFromCoat <= 0.02 || dyFromCoat > coatLength + 0.08) continue;

          // Coat panel at distance d = dyFromCoat has Z = coatAnchorZ - d * sin(a)
          const neededSin = THREE.MathUtils.clamp(
            (coatAnchorZ - (legZBack - 0.025)) / Math.max(0.18, dyFromCoat),
            0,
            0.96,
          );
          const reqAngle = Math.asin(neededSin);
          if (reqAngle > minClearanceAngle) minClearanceAngle = reqAngle;
        }
      }
    }

    // 2. Floor collision clearance: keep tip above y = 0.035m in world space
    // In pelvis local space, coat vector is (0, -L*cos(a), -L*sin(a)).
    // Rotated by pelvisPitch around X: worldOffsetY = -L*cos(a)*cos(pelvisPitch) + L*sin(a)*sin(pelvisPitch)
    //Wait: pelvisPitch >= 0 tilts +Z forward down and -Z backward up!
    // Check world height of coat tip when pelvis is low (crouch / ragdoll):
    if (isRagdoll) {
      minClearanceAngle = Math.max(minClearanceAngle, 0.18);
    } else {
      const availDrop = Math.max(0.08, pelvisY + coatAnchorY - 0.04);
      if (availDrop < coatLength) {
        const minCos = THREE.MathUtils.clamp(availDrop / coatLength, 0, 1);
        const floorAngle = Math.acos(minCos);
        minClearanceAngle = Math.max(minClearanceAngle, floorAngle);
      }
    }

    const targetX = Math.max(
      minClearanceAngle,
      baseRest + airLift + Math.sin(moveSpeed + panel.side) * 0.04,
    );
    const springK = 38;
    const damp = 8.8;
    panel.velX +=
      ((targetX - panel.angleX) * springK - panel.velX * damp) * stepDt;
    panel.angleX += panel.velX * stepDt;

    if (panel.angleX < minClearanceAngle) {
      panel.angleX = minClearanceAngle;
      if (panel.velX < 0) panel.velX = 0;
    }
    panel.angleX = THREE.MathUtils.clamp(
      panel.angleX,
      0.12,
      isRagdoll ? 0.65 : 1.38,
    );

    const turnFlare = THREE.MathUtils.clamp(yawRate * 0.04, -0.22, 0.22);
    const targetZ =
      panel.side * (0.1 + Math.min(0.18, moveSpeed * 0.018)) + turnFlare;
    panel.velZ += ((targetZ - panel.angleZ) * 28 - panel.velZ * 7.2) * stepDt;
    panel.angleZ += panel.velZ * stepDt;

    // Prevent left/right panels from crossing over the center panel into legs
    if (panel.side === 1) {
      panel.angleZ = Math.max(0.06, panel.angleZ);
    } else if (panel.side === -1) {
      panel.angleZ = Math.min(-0.06, panel.angleZ);
    }

    panel.pivot.rotation.x = -panel.angleX;
    panel.pivot.rotation.z = panel.angleZ;
  }
}

/**
 * Collapses the assassin character into a realistic multi-limb ragdoll pose on the pavement.
 */
export function applyRagdollPose(
  rig: AssassinRig,
  ragdollProgress: number,
  seed: number,
) {
  const t = THREE.MathUtils.clamp(ragdollProgress, 0, 1);
  rig.pelvis.position.y = THREE.MathUtils.lerp(0.94, 0.24, t);
  rig.pelvis.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 2 - 0.1, t);
  rig.pelvis.rotation.z = THREE.MathUtils.lerp(0, seed * 0.55, t);
  rig.torsoPivot.rotation.x = THREE.MathUtils.lerp(0.05, -0.25, t);
  rig.torsoPivot.rotation.z = THREE.MathUtils.lerp(0, -seed * 0.25, t);
  rig.headPivot.rotation.x = THREE.MathUtils.lerp(0, 0.42, t);
  rig.headPivot.rotation.y = THREE.MathUtils.lerp(0, seed * 0.65, t);

  rig.limbs.leftArm.pivot.rotation.set(
    THREE.MathUtils.lerp(0, -1.35, t),
    0,
    THREE.MathUtils.lerp(0, 0.85, t),
  );
  rig.limbs.rightArm.pivot.rotation.set(
    THREE.MathUtils.lerp(0, -0.95, t),
    0,
    THREE.MathUtils.lerp(0, -0.95, t),
  );
  rig.limbs.leftLeg.pivot.rotation.set(
    THREE.MathUtils.lerp(0, 0.22, t),
    0,
    THREE.MathUtils.lerp(0, 0.26, t),
  );
  rig.limbs.rightLeg.pivot.rotation.set(
    THREE.MathUtils.lerp(0, -0.18, t),
    0,
    THREE.MathUtils.lerp(0, -0.34, t),
  );
}

/**
 * Collapses any NPC into an articulated multi-limb ragdoll pose with bent elbows & knees.
 */
export function applyNpcRagdollPose(
  rig: NpcRig,
  ragdollProgress: number,
  seed: number,
  fallDir: 1 | -1,
) {
  const t = THREE.MathUtils.clamp(ragdollProgress, 0, 1);
  // Natural bounce near ground settlement
  const fallCurve =
    t < 0.78
      ? (t / 0.78) * (t / 0.78)
      : 1 - Math.sin(((t - 0.78) / 0.22) * Math.PI) * 0.08;

  rig.bodyPivot.position.y = THREE.MathUtils.lerp(0.94, 0.21, fallCurve);
  rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(
    0,
    fallDir * (Math.PI / 2 - 0.07),
    fallCurve,
  );
  rig.bodyPivot.rotation.z = THREE.MathUtils.lerp(0, seed * 0.48, t);
  rig.bodyPivot.rotation.y = THREE.MathUtils.lerp(0, -seed * 0.28, t);

  rig.head.rotation.set(
    THREE.MathUtils.lerp(0, fallDir * 0.46, t),
    THREE.MathUtils.lerp(0, seed * 0.74, t),
    THREE.MathUtils.lerp(0, seed * 0.36, t),
  );

  // Sprawled arms + bent elbows
  rig.leftArm.rotation.set(
    THREE.MathUtils.lerp(0, -1.1 * fallDir - 0.4, t),
    0,
    THREE.MathUtils.lerp(0, 0.75 + seed * 0.25, t),
  );
  rig.rightArm.rotation.set(
    THREE.MathUtils.lerp(0, -0.75 * fallDir - 0.25, t),
    0,
    THREE.MathUtils.lerp(0, -0.88 + seed * 0.2, t),
  );
  rig.leftForearm.rotation.set(
    THREE.MathUtils.lerp(0, -0.65, t),
    0,
    THREE.MathUtils.lerp(0, seed * 0.25, t),
  );
  rig.rightForearm.rotation.set(
    THREE.MathUtils.lerp(0, -0.82, t),
    0,
    THREE.MathUtils.lerp(0, -seed * 0.2, t),
  );

  // Sprawled legs + relaxed bent knees
  rig.leftLeg.rotation.set(
    THREE.MathUtils.lerp(0, 0.26 * fallDir, t),
    0,
    THREE.MathUtils.lerp(0, 0.28, t),
  );
  rig.rightLeg.rotation.set(
    THREE.MathUtils.lerp(0, -0.22 * fallDir, t),
    0,
    THREE.MathUtils.lerp(0, -0.34, t),
  );
  rig.leftKnee.rotation.x = THREE.MathUtils.lerp(0, 0.45, t);
  rig.rightKnee.rotation.x = THREE.MathUtils.lerp(0, 0.72, t);
}

export function applyAnatomicalState(
  rig: AssassinRig,
  limbId: LimbId,
  status: LimbStatus,
  elapsed: number,
) {
  if (limbId === 'torso') {
    if (status.condition === 'intact') {
      rig.torsoBones.visible = false;
      rig.torsoFlesh.visible = false;
      rig.torsoSkin.visible = false;
      rig.torsoCloth.visible = true;
      rig.torsoCloth.scale.set(1, 1, 1);
      rig.torsoFractureGlow.visible = false;
      return;
    }

    const p = status.regenProgress;
    if (p === 0) {
      rig.torsoBones.visible = true;
      rig.torsoFlesh.visible = true;
      rig.torsoFlesh.scale.set(0.88, 0.85, 0.85);
      rig.torsoSkin.visible = false;
      rig.torsoCloth.visible = true;
      rig.torsoCloth.scale.set(1.02, 0.42, 1.02);
      rig.torsoFractureGlow.visible = true;
      rig.torsoFractureGlow.scale.setScalar(1 + Math.sin(elapsed * 8) * 0.08);
      return;
    }

    rig.torsoFractureGlow.visible = p < 0.25;
    rig.torsoBones.visible = true;
    rig.torsoFlesh.visible = p >= 0.22;
    rig.torsoSkin.visible = p >= 0.5;
    rig.torsoCloth.visible = p >= 0.76;

    const fleshT = THREE.MathUtils.clamp((p - 0.22) / 0.3, 0, 1);
    const skinT = THREE.MathUtils.clamp((p - 0.5) / 0.28, 0, 1);
    const clothT = THREE.MathUtils.clamp((p - 0.76) / 0.24, 0, 1);

    rig.torsoFlesh.scale.set(0.85 + 0.15 * fleshT, 0.6 + 0.4 * fleshT, 1);
    rig.torsoSkin.scale.set(1, 0.25 + 0.75 * skinT, 1);
    rig.torsoCloth.scale.set(1, 0.35 + 0.65 * clothT, 1);
    return;
  }

  const limb = rig.limbs[limbId];
  if (!limb) return;

  if (status.condition === 'intact') {
    limb.stumpGroup.visible = false;
    limb.fractureRing.visible = false;
    limb.growthRoot.visible = true;
    limb.growthRoot.scale.set(1, 1, 1);
    limb.growthRoot.rotation.z = 0;

    limb.boneGroup.visible = false;
    limb.fleshGroup.visible = false;
    limb.skinGroup.visible = true;
    limb.skinGroup.scale.set(1, 1, 1);
    limb.clothGroup.visible = true;
    limb.clothGroup.scale.set(1, 1, 1);
    return;
  }

  const p = status.regenProgress;

  if (status.condition === 'fractured' && p === 0) {
    limb.stumpGroup.visible = false;
    limb.fractureRing.visible = true;
    limb.fractureRing.scale.setScalar(1 + Math.sin(elapsed * 9) * 0.1);
    limb.growthRoot.visible = true;
    limb.growthRoot.rotation.z = limb.isArm ? 0.24 : -0.18;
    limb.boneGroup.visible = true;
    limb.boneGroup.scale.set(1, 1, 1);
    limb.fleshGroup.visible = true;
    limb.fleshGroup.scale.set(0.95, 0.85, 0.95);
    limb.skinGroup.visible = true;
    limb.skinGroup.scale.set(0.96, 0.45, 0.96);
    limb.clothGroup.visible = true;
    limb.clothGroup.scale.set(1, 0.38, 1);
    return;
  }

  if (status.condition === 'severed' && p === 0) {
    limb.stumpGroup.visible = true;
    limb.fractureRing.visible = false;
    limb.growthRoot.visible = false;
    return;
  }

  limb.stumpGroup.visible = p < 0.18;
  limb.fractureRing.visible = p < 0.26;
  limb.growthRoot.visible = true;
  limb.growthRoot.rotation.z = THREE.MathUtils.lerp(
    status.condition === 'fractured' ? 0.22 : 0,
    0,
    Math.min(1, p * 4),
  );

  const boneT =
    status.condition === 'fractured'
      ? 1
      : THREE.MathUtils.clamp(p / 0.25, 0.06, 1);
  const fleshT = THREE.MathUtils.clamp((p - 0.24) / 0.28, 0, 1);
  const skinT = THREE.MathUtils.clamp((p - 0.52) / 0.26, 0, 1);
  const clothT = THREE.MathUtils.clamp((p - 0.78) / 0.22, 0, 1);

  limb.boneGroup.visible = true;
  limb.boneGroup.scale.set(0.75 + 0.25 * boneT, boneT, 0.75 + 0.25 * boneT);

  limb.fleshGroup.visible = fleshT > 0.01;
  limb.fleshGroup.scale.set(
    0.45 + 0.55 * fleshT,
    0.05 + 0.95 * fleshT,
    0.45 + 0.55 * fleshT,
  );

  limb.skinGroup.visible = skinT > 0.01;
  limb.skinGroup.scale.set(
    0.6 + 0.4 * skinT,
    0.04 + 0.96 * skinT,
    0.6 + 0.4 * skinT,
  );

  limb.clothGroup.visible = clothT > 0.01;
  limb.clothGroup.scale.set(
    0.7 + 0.3 * clothT,
    0.04 + 0.96 * clothT,
    0.7 + 0.3 * clothT,
  );
}

// ---------- Realistic NPC Rig (Civilians, Store Clerks, Security Guards & Targets) ----------

export function createNpcRig(
  role: NpcRole,
  textures: ProceduralTextureSet,
  variantIndex = 0,
): NpcRig {
  const disposables: Array<{ dispose: () => void }> = [];
  const root = new THREE.Group();

  const shadowGeo = new THREE.PlaneGeometry(1.1, 1.1);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: textures.contactShadowMap,
    transparent: true,
    depthWrite: false,
    opacity: 0.6,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.025;
  root.add(contactShadow);
  disposables.push(shadowGeo, shadowMat);

  const ringGeo = new THREE.RingGeometry(0.62, 0.72, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: role === 'target' ? 0xf59e0b : role === 'civilian' || role === 'clerk' ? 0x38bdf8 : 0x64748b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: role === 'target' ? 0.72 : 0.28,
    depthWrite: false,
  });
  const alertRing = new THREE.Mesh(ringGeo, ringMat);
  alertRing.rotation.x = -Math.PI / 2;
  alertRing.position.y = 0.03;
  root.add(alertRing);
  disposables.push(ringGeo, ringMat);

  const skinMat = new THREE.MeshStandardMaterial({
    map: textures.skinArmLegMap,
    roughness: 0.56,
  });
  const faceMat = new THREE.MeshStandardMaterial({
    map: textures.faceTextureMap,
    roughness: 0.58,
  });

  const civColors = [0x3b4d63, 0x6d3b32, 0x2d4f43, 0xd4d4d8];
  const torsoMat =
    role === 'police'
      ? new THREE.MeshStandardMaterial({
          color: 0x162642,
          roughness: 0.62,
          metalness: 0.14,
        })
      : role === 'marshal'
        ? new THREE.MeshStandardMaterial({
            color: 0x111827,
            roughness: 0.48,
            metalness: 0.22,
          })
        : role === 'inmate'
          ? new THREE.MeshStandardMaterial({
              color: 0xea580c,
              roughness: 0.85,
            })
          : role === 'gentleman'
            ? new THREE.MeshStandardMaterial({
                color: 0x1b202b,
                roughness: 0.48,
                metalness: 0.16,
              })
            : role === 'collector'
              ? new THREE.MeshStandardMaterial({
                  color: 0x1e3a5f,
                  roughness: 0.78,
                })
              : role === 'poor'
                ? new THREE.MeshStandardMaterial({
                    map: textures.tankFabricMap,
                    color: 0x57534e,
                    roughness: 0.94,
                  })
                : role === 'guard'
                  ? new THREE.MeshStandardMaterial({
                      map: textures.tankFabricMap,
                      roughness: 0.85,
                    })
                  : role === 'heavy'
                    ? new THREE.MeshStandardMaterial({
                        map: textures.clothWeaveMap,
                        color: 0x262f3e,
                        roughness: 0.68,
                        metalness: 0.25,
                      })
                    : role === 'target'
                      ? new THREE.MeshStandardMaterial({
                          color: 0x5c1a24,
                          roughness: 0.55,
                          metalness: 0.15,
                        })
                      : role === 'clerk'
                        ? new THREE.MeshStandardMaterial({
                            color: 0x1e3a5f,
                            roughness: 0.72,
                          })
                        : new THREE.MeshStandardMaterial({
                            map: textures.tankFabricMap,
                            color: civColors[variantIndex % civColors.length],
                            roughness: 0.84,
                          });

  const shortsMat =
    role === 'guard' || role === 'civilian'
      ? new THREE.MeshStandardMaterial({
          map: textures.cargoFabricMap,
          color: role === 'civilian' ? 0x3a4035 : 0xffffff,
          roughness: 0.84,
        })
      : new THREE.MeshStandardMaterial({
          color:
            role === 'police' || role === 'marshal'
              ? 0x111c30
              : role === 'inmate'
                ? 0xc2410c
                : role === 'poor'
                  ? 0x3b352d
                  : role === 'collector'
                    ? 0x1f2937
                    : 0x1a1f28,
          roughness: role === 'gentleman' ? 0.52 : 0.78,
        });

  const capMat = new THREE.MeshStandardMaterial({
    color:
      role === 'police' || role === 'marshal'
        ? 0x0f1a2d
        : role === 'inmate'
          ? 0xf97316
          : role === 'heavy'
            ? 0x222936
            : role === 'collector'
              ? 0xf59e0b
              : 0x525862,
    roughness: 0.8,
  });
  const sockMat = new THREE.MeshStandardMaterial({
    color: 0xe2e5ea,
    roughness: 0.86,
  });
  const sneakerMat = new THREE.MeshStandardMaterial({
    map: textures.sneakerMap,
    roughness: 0.72,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x171a21,
    roughness: 0.85,
  });
  const watchMat = new THREE.MeshStandardMaterial({
    color: role === 'gentleman' ? 0xfbbf24 : 0x1c2026,
    roughness: 0.35,
    metalness: 0.7,
  });

  disposables.push(
    skinMat,
    faceMat,
    torsoMat,
    shortsMat,
    capMat,
    sockMat,
    sneakerMat,
    soleMat,
    watchMat,
  );

  const bodyPivot = new THREE.Group();
  bodyPivot.position.y = 0.94;
  root.add(bodyPivot);
  if (role === 'heavy') bodyPivot.scale.setScalar(1.08);

  const pelvisGeo = new THREE.CylinderGeometry(0.175, 0.185, 0.19, 14);
  pelvisGeo.scale(1.12, 1, 0.74);
  const pelvis = new THREE.Mesh(pelvisGeo, shortsMat);
  pelvis.castShadow = true;
  bodyPivot.add(pelvis);
  disposables.push(pelvisGeo);

  const torsoGeo = createAthleticTorsoGeo(0.56);
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 0.08;
  torso.castShadow = true;
  bodyPivot.add(torso);
  disposables.push(torsoGeo);

  if (role === 'heavy') {
    const plateGeo = new THREE.BoxGeometry(0.32, 0.3, 0.28);
    const plate = new THREE.Mesh(plateGeo, soleMat);
    plate.position.y = 0.42;
    bodyPivot.add(plate);
    disposables.push(plateGeo);
  } else if (role === 'police' || role === 'marshal') {
    const badgeGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.014, 6);
    badgeGeo.rotateX(Math.PI / 2);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.88,
      roughness: 0.22,
    });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0.085, 0.44, 0.142);
    const beltGeo = new THREE.BoxGeometry(0.36, 0.06, 0.26);
    const belt = new THREE.Mesh(beltGeo, soleMat);
    belt.position.set(0, 0.05, 0);
    bodyPivot.add(badge, belt);
    disposables.push(badgeGeo, badgeMat, beltGeo);
  } else if (role === 'inmate') {
    const tagGeo = new THREE.BoxGeometry(0.14, 0.08, 0.02);
    const tag = new THREE.Mesh(tagGeo, sockMat);
    tag.position.set(-0.07, 0.44, 0.145);
    bodyPivot.add(tag);
    disposables.push(tagGeo);
  } else if (role === 'clerk') {
    // Store apron panel on chest
    const apronGeo = new THREE.BoxGeometry(0.28, 0.46, 0.04);
    const apron = new THREE.Mesh(apronGeo, sockMat);
    apron.position.set(0, 0.3, 0.145);
    bodyPivot.add(apron);
    disposables.push(apronGeo);
  } else if (role === 'collector') {
    // Hi-visibility safety vest for trash collectors
    const vestGeo = new THREE.BoxGeometry(0.39, 0.45, 0.28);
    const vestMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      emissive: 0x65a30d,
      emissiveIntensity: 0.25,
      roughness: 0.68,
    });
    const vest = new THREE.Mesh(vestGeo, vestMat);
    vest.position.set(0, 0.36, 0);
    const stripeGeo = new THREE.BoxGeometry(0.4, 0.06, 0.29);
    const stripe = new THREE.Mesh(stripeGeo, sockMat);
    stripe.position.set(0, 0.33, 0);
    bodyPivot.add(vest, stripe);
    disposables.push(vestGeo, vestMat, stripeGeo);
  } else if (role === 'gentleman') {
    // Tailored suit collar shirt & crimson silk tie
    const shirtGeo = new THREE.BoxGeometry(0.11, 0.3, 0.045);
    const shirt = new THREE.Mesh(shirtGeo, sockMat);
    shirt.position.set(0, 0.44, 0.135);
    const tieGeo = new THREE.BoxGeometry(0.042, 0.26, 0.055);
    const tieMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.42,
    });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 0.41, 0.148);
    bodyPivot.add(shirt, tie);
    disposables.push(shirtGeo, tieGeo, tieMat);
  }

  const head = buildRealisticHeadGroup(
    faceMat,
    skinMat,
    capMat,
    role === 'guard' ||
      role === 'police' ||
      role === 'collector' ||
      (role === 'civilian' && variantIndex % 2 === 0),
    false,
    null,
    disposables,
  );
  head.position.y = 0.64;
  if (role === 'gentleman') {
    const hairGeo = new THREE.SphereGeometry(0.118, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.55 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.09, -0.01);
    head.add(hair);
    disposables.push(hairGeo, hairMat);
  }
  bodyPivot.add(head);

  function makeNpcArm(side: -1 | 1): { arm: THREE.Group; forearmPivot: THREE.Group } {
    const arm = new THREE.Group();
    arm.position.set(side * 0.245, 0.56, 0);

    const sleeved =
      role === 'target' ||
      role === 'police' ||
      role === 'marshal' ||
      role === 'inmate' ||
      role === 'gentleman' ||
      role === 'collector';
    const upperArmGeo = createContouredUpperArmGeo(0.31);
    const upper = new THREE.Mesh(upperArmGeo, sleeved ? torsoMat : skinMat);
    upper.castShadow = true;
    arm.add(upper);

    const forearmPivot = new THREE.Group();
    forearmPivot.position.y = -0.31;
    arm.add(forearmPivot);

    const forearmGeo = createContouredForearmGeo(0.29);
    const forearm = new THREE.Mesh(
      forearmGeo,
      role === 'gentleman' ? torsoMat : skinMat,
    );
    forearm.castShadow = true;
    forearmPivot.add(forearm);

    if (side === 1 && role !== 'poor') {
      const watchGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.03, 10);
      const watch = new THREE.Mesh(watchGeo, watchMat);
      watch.position.y = -0.24;
      forearmPivot.add(watch);
      disposables.push(watchGeo);
    }

    const hand = buildRealisticHandGroup(skinMat, null, side, disposables);
    hand.position.y = -0.29;
    forearmPivot.add(hand);

    if (role === 'collector' && side === -1) {
      // Heavy black city trash bag gripped in right hand
      const bagGeo = new THREE.DodecahedronGeometry(0.22, 0);
      bagGeo.scale(0.85, 1.25, 0.85);
      const bagMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.45,
        metalness: 0.15,
      });
      const bag = new THREE.Mesh(bagGeo, bagMat);
      bag.position.set(-0.04, -0.45, 0.04);
      bag.castShadow = true;
      forearmPivot.add(bag);
      disposables.push(bagGeo, bagMat);
    }

    disposables.push(upperArmGeo, forearmGeo);
    return { arm, forearmPivot };
  }

  const leftArmRig = makeNpcArm(1);
  const rightArmRig = makeNpcArm(-1);
  const leftArm = leftArmRig.arm;
  const rightArm = rightArmRig.arm;
  bodyPivot.add(leftArm, rightArm);

  // Smartphone prop in left hand (visible when calling police!)
  const phoneGeo = new THREE.BoxGeometry(0.068, 0.135, 0.014);
  const phoneMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.4,
    roughness: 0.25,
  });
  const phoneMesh = new THREE.Mesh(phoneGeo, phoneMat);
  phoneMesh.position.set(0.01, -0.34, 0.045);
  phoneMesh.visible = false;
  leftArmRig.forearmPivot.add(phoneMesh);

  // WANTED poster flyer held by poster workers
  const posterGeo = new THREE.PlaneGeometry(0.42, 0.56);
  const posterMat = new THREE.MeshStandardMaterial({
    map: textures.wantedPosterMap,
    side: THREE.DoubleSide,
    roughness: 0.85,
  });
  const posterMesh = new THREE.Mesh(posterGeo, posterMat);
  posterMesh.position.set(0, -0.28, 0.14);
  posterMesh.visible = false;
  rightArmRig.forearmPivot.add(posterMesh);
  disposables.push(phoneGeo, phoneMat, posterGeo, posterMat);

  // Weapon group in right forearm/hand (hidden by default for civilians/clerks until threatening)
  const weaponGroup = new THREE.Group();
  const gunGeo = new THREE.BoxGeometry(
    0.052,
    0.085,
    role === 'heavy' || role === 'clerk' ? 0.54 : 0.34,
  );
  const gun = new THREE.Mesh(gunGeo, soleMat);
  gun.position.set(0.02, -0.32, 0.19);
  weaponGroup.add(gun);

  const flashGeo = new THREE.SphereGeometry(0.075, 8, 6);
  const flashMat = new THREE.MeshBasicMaterial({
    color: 0xffd166,
    transparent: true,
    opacity: 0.95,
  });
  const muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
  muzzleFlash.position.set(0.02, -0.32, role === 'heavy' || role === 'clerk' ? 0.47 : 0.38);
  muzzleFlash.visible = false;
  weaponGroup.add(muzzleFlash);
  weaponGroup.visible =
    role === 'guard' ||
    role === 'heavy' ||
    role === 'target' ||
    role === 'marshal';
  rightArmRig.forearmPivot.add(weaponGroup);
  disposables.push(gunGeo, flashGeo, flashMat);

  function makeNpcLeg(side: -1 | 1): { leg: THREE.Group; kneePivot: THREE.Group } {
    const leg = new THREE.Group();
    leg.position.set(side * 0.11, -0.02, 0);

    const shortGeo = createContouredThighGeo(0.42);
    shortGeo.scale(1.16, 1, 1.16);
    const shortMesh = new THREE.Mesh(shortGeo, shortsMat);
    shortMesh.castShadow = true;
    leg.add(shortMesh);

    if (role === 'guard' || role === 'civilian') {
      const pocketGeo = new THREE.BoxGeometry(0.042, 0.145, 0.12);
      const pocket = new THREE.Mesh(pocketGeo, shortsMat);
      pocket.position.set(side * 0.086, -0.24, 0);
      leg.add(pocket);
      disposables.push(pocketGeo);
    }

    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.42;
    leg.add(kneePivot);

    const calfGeo = createContouredCalfGeo(0.43);
    const calf = new THREE.Mesh(
      calfGeo,
      role === 'target' || role === 'clerk' ? shortsMat : skinMat,
    );
    calf.castShadow = true;
    kneePivot.add(calf);

    const sneaker = buildRealisticSneakerGroup(
      sneakerMat,
      sockMat,
      soleMat,
      disposables,
    );
    sneaker.position.y = -0.45;
    kneePivot.add(sneaker);

    disposables.push(shortGeo, calfGeo);
    return { leg, kneePivot };
  }

  const leftLegRig = makeNpcLeg(1);
  const rightLegRig = makeNpcLeg(-1);
  const leftLeg = leftLegRig.leg;
  const rightLeg = rightLegRig.leg;
  bodyPivot.add(leftLeg, rightLeg);

  return {
    root,
    bodyPivot,
    head,
    leftArm,
    rightArm,
    leftForearm: leftArmRig.forearmPivot,
    rightForearm: rightArmRig.forearmPivot,
    leftLeg,
    rightLeg,
    leftKnee: leftLegRig.kneePivot,
    rightKnee: rightLegRig.kneePivot,
    weaponGroup,
    phoneMesh,
    posterMesh,
    alertRing,
    muzzleFlash,
    contactShadow,
    disposables,
  };
}

export function createSeveredHeadWithSpineRig(textures: ProceduralTextureSet): {
  group: THREE.Group;
  disposables: Array<{ dispose: () => void }>;
} {
  const disposables: Array<{ dispose: () => void }> = [];
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    map: textures.skinArmLegMap,
    roughness: 0.56,
  });
  const faceMat = new THREE.MeshStandardMaterial({
    map: textures.faceTextureMap,
    roughness: 0.58,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x1c1f26,
    roughness: 0.85,
  });
  const hoodMat = new THREE.MeshStandardMaterial({
    color: 0x161a24,
    roughness: 0.82,
  });
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xe7dfd0,
    roughness: 0.42,
  });
  const goreMat = new THREE.MeshStandardMaterial({
    color: 0x7f1d1d,
    emissive: 0x450a0a,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });

  const head = buildRealisticHeadGroup(
    faceMat,
    skinMat,
    capMat,
    false,
    false,
    hoodMat,
    disposables,
  );
  head.position.set(0, 0.14, 0);
  root.add(head);

  // Raw severed neck stump at the base of the skull
  const stumpGeo = new THREE.CylinderGeometry(0.068, 0.078, 0.08, 10);
  const stump = new THREE.Mesh(stumpGeo, goreMat);
  stump.position.set(0, 0.02, -0.005);
  root.add(stump);

  // 5-segment attached cervical vertebrae spine trailing beneath the severed head
  const vertebraGeo = new THREE.CylinderGeometry(0.036, 0.04, 0.068, 8);
  const discGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.018, 8);
  const spinousGeo = new THREE.BoxGeometry(0.018, 0.04, 0.058);

  for (let i = 0; i < 5; i++) {
    const segY = -0.055 - i * 0.082;
    const segZ = -Math.sin(i * 0.32) * 0.03;

    const vert = new THREE.Mesh(vertebraGeo, boneMat);
    vert.position.set(0, segY, segZ);
    vert.rotation.x = 0.08 * i;
    root.add(vert);

    const disc = new THREE.Mesh(discGeo, goreMat);
    disc.position.set(0, segY + 0.038, segZ);
    root.add(disc);

    const spike = new THREE.Mesh(spinousGeo, boneMat);
    spike.position.set(0, segY, segZ - 0.036);
    spike.rotation.x = 0.35;
    root.add(spike);
  }

  disposables.push(
    skinMat,
    faceMat,
    capMat,
    hoodMat,
    boneMat,
    goreMat,
    stumpGeo,
    vertebraGeo,
    discGeo,
    spinousGeo,
  );

  return { group: root, disposables };
}
