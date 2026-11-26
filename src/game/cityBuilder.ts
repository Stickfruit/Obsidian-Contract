import * as THREE from 'three';
import type {
  CityCollider,
  CityLightAnchor,
  CityZone,
  HotelRoomId,
  NpcRole,
  WalkableSurface,
} from '../types/game';
import { createNeonSignTexture, type ProceduralTextureSet } from './textures';

export interface HotelRoomDoorSpec {
  roomId: HotelRoomId | '204';
  pivot: THREE.Group;
  lockLedMat: THREE.MeshBasicMaterial;
  colliderIndex: number;
  unlocked: boolean;
  doorPos: THREE.Vector3;
  bedPos?: THREE.Vector3;
}

export interface HotelVexSpec {
  deskPos: THREE.Vector3;
  conciergePos: THREE.Vector3;
  rooms: Record<HotelRoomId, HotelRoomDoorSpec>;
  suite204Door: HotelRoomDoorSpec;
  ledgerMesh: THREE.Mesh;
  ledgerPos: THREE.Vector3;
  ledgerStolen: boolean;
}

export interface DriveableVehicleSpec {
  id: string;
  root: THREE.Group;
  position: THREE.Vector3;
  yaw: number;
  speed: number;
  steer: number;
  health: number;
  windshield: THREE.Mesh;
  sideWindows: THREE.Mesh;
  hood: THREE.Mesh;
  frontBumper: THREE.Mesh;
  rearBumper: THREE.Mesh;
  leftDoor: THREE.Mesh;
  rightDoor: THREE.Mesh;
  steeringWheel: THREE.Group;
  driverHands: THREE.Group;
  wheels: THREE.Mesh[];
  windshieldBroken: boolean;
  sideWindowsBroken: boolean;
  hoodDetached: boolean;
  frontBumperDetached: boolean;
  rearBumperDetached: boolean;
  leftDoorDetached: boolean;
  rightDoorDetached: boolean;
  colliderIndex: number;
  locked: boolean;
  isNpcTraffic: boolean;
  trafficWaypoints: THREE.Vector3[];
  trafficWpIndex: number;
  driverModel: THREE.Group;
  lockLed: THREE.Mesh;
  lockLedMat: THREE.MeshBasicMaterial;
  hornCooldown: number;
  isPoliceCruiser: boolean;
  lightbarRed?: THREE.Mesh;
  lightbarBlue?: THREE.Mesh;
  swerveTimer: number;
  swerveDir: 1 | -1;
  crashCooldown: number;
}

export interface DestructibleGlassSpec {
  id: string;
  mesh: THREE.Mesh;
  center: THREE.Vector3;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  shattered: boolean;
  colliderIndex: number;
}

export interface UtilityPoleSpec {
  id: string;
  pivot: THREE.Group;
  wires: THREE.Mesh[];
  x: number;
  z: number;
  fallen: boolean;
  fallAngle: number;
  fallYaw: number;
  colliderIndex: number;
}

export interface NpcSpawnSpec {
  id: string;
  name: string;
  role: NpcRole;
  health: number;
  waypoints: THREE.Vector3[];
  voiceName: 'Charon' | 'Puck' | 'Kore' | 'Zephyr';
  isIndoorStore?: boolean;
  storeClerkArchetype?: 'threaten' | 'beg';
  isBoutiqueResident?: boolean;
  isPosterWorker?: boolean;
}

export interface DumpsterSpec {
  id: string;
  position: THREE.Vector3;
  yaw: number;
  lidPivot: THREE.Group;
  colliderIndex: number;
}

export interface WantedPosterSlot {
  id: string;
  mesh: THREE.Mesh;
  wallPos: THREE.Vector3;
  hangStandPos: THREE.Vector3;
  hangYaw: number;
  posted: boolean;
}

export interface CityBuildResult {
  group: THREE.Group;
  colliders: CityCollider[];
  walkables: WalkableSurface[];
  lightAnchors: CityLightAnchor[];
  zones: CityZone[];
  vehicles: DriveableVehicleSpec[];
  destructibleGlass: DestructibleGlassSpec[];
  utilityPoles: UtilityPoleSpec[];
  dumpsters: DumpsterSpec[];
  wantedPosters: WantedPosterSlot[];
  hotelVex: HotelVexSpec;
  npcSpawns: NpcSpawnSpec[];
  disposables: Array<{ dispose: () => void }>;
}

export function buildCityDistrict(
  textures: ProceduralTextureSet,
  _isSoftwareGl: boolean,
): CityBuildResult {
  const group = new THREE.Group();
  const colliders: CityCollider[] = [];
  const walkables: WalkableSurface[] = [];
  const lightAnchors: CityLightAnchor[] = [];
  const vehicles: DriveableVehicleSpec[] = [];
  const destructibleGlass: DestructibleGlassSpec[] = [];
  const utilityPoles: UtilityPoleSpec[] = [];
  const dumpsters: DumpsterSpec[] = [];
  const wantedPosters: WantedPosterSlot[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  // 1. Vast Asphalt Open-World Ground Plane (520m x 520m into horizon fog)
  const groundGeo = new THREE.PlaneGeometry(520, 520);
  const groundMat = new THREE.MeshStandardMaterial({
    map: textures.asphaltMap,
    roughnessMap: textures.asphaltRoughness,
    roughness: 0.68,
    metalness: 0.16,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  group.add(ground);
  disposables.push(groundGeo, groundMat);

  // 2. Road Markings & Crosswalks across the GTA-scale Avenue Grid
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xc9ab58,
    roughness: 0.72,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const whitePaintMat = new THREE.MeshStandardMaterial({
    color: 0xd8e0eb,
    roughness: 0.7,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  disposables.push(stripeMat, whitePaintMat);

  const dashGeo = new THREE.PlaneGeometry(0.3, 3.6);
  const crossGeo = new THREE.PlaneGeometry(0.8, 3.6);
  disposables.push(dashGeo, crossGeo);

  const dashPositions: Array<[number, number, number]> = [];
  for (let d = -114; d <= 114; d += 8) {
    if (Math.abs(d) > 7 && Math.abs(Math.abs(d) - 52) > 7) {
      dashPositions.push([0, d, 0]);
      dashPositions.push([d, 0, Math.PI / 2]);
    }
    if (Math.abs(d) > 7) {
      dashPositions.push([-52, d, 0]);
      dashPositions.push([52, d, 0]);
      dashPositions.push([d, -52, Math.PI / 2]);
      dashPositions.push([d, 52, Math.PI / 2]);
    }
  }

  const dashInst = new THREE.InstancedMesh(
    dashGeo,
    stripeMat,
    dashPositions.length,
  );
  const dummy = new THREE.Object3D();
  dashPositions.forEach(([x, z, rotY], i) => {
    dummy.position.set(x, 0.016, z);
    dummy.rotation.set(-Math.PI / 2, 0, rotY);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    dashInst.setMatrixAt(i, dummy.matrix);
  });
  dashInst.computeBoundingSphere();
  group.add(dashInst);

  const crossMatrices: THREE.Matrix4[] = [];
  for (const ix of [-52, 0, 52]) {
    for (const iz of [-52, 0, 52]) {
      for (let s = -4.5; s <= 4.5; s += 1.5) {
        for (const off of [-8.5, 8.5]) {
          dummy.position.set(ix + s, 0.018, iz + off);
          dummy.rotation.set(-Math.PI / 2, 0, 0);
          dummy.updateMatrix();
          crossMatrices.push(dummy.matrix.clone());

          dummy.position.set(ix + off, 0.018, iz + s);
          dummy.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
          dummy.updateMatrix();
          crossMatrices.push(dummy.matrix.clone());
        }
      }
    }
  }
  const crossInst = new THREE.InstancedMesh(
    crossGeo,
    whitePaintMat,
    crossMatrices.length,
  );
  crossMatrices.forEach((m, i) => crossInst.setMatrixAt(i, m));
  crossInst.computeBoundingSphere();
  group.add(crossInst);

  // Shared materials
  const sidewalkMat = new THREE.MeshStandardMaterial({
    map: textures.sidewalkMap,
    roughness: 0.85,
    metalness: 0.05,
  });
  const interiorFloorMat = new THREE.MeshStandardMaterial({
    map: textures.interiorFloorMap,
    roughness: 0.35,
    metalness: 0.18,
  });
  const concreteTrimMat = new THREE.MeshStandardMaterial({
    color: 0x394250,
    roughness: 0.8,
    metalness: 0.08,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x2c3442,
    roughness: 0.35,
    metalness: 0.8,
  });
  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x161b24,
    roughness: 0.48,
    metalness: 0.65,
  });
  const warmCeilingMat = new THREE.MeshStandardMaterial({
    color: 0xfff1cc,
    emissive: 0xffd27a,
    emissiveIntensity: 2.0,
  });
  const cyanNeonMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.2,
  });
  const woodPoleMat = new THREE.MeshStandardMaterial({
    color: 0x4b3828,
    roughness: 0.9,
    metalness: 0.04,
  });
  const wireMat = new THREE.MeshStandardMaterial({
    color: 0x11151d,
    roughness: 0.6,
    metalness: 0.4,
  });
  const shatterGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x7dd3fc,
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.46,
    clearcoat: 1.0,
  });
  disposables.push(
    sidewalkMat,
    interiorFloorMat,
    concreteTrimMat,
    metalMat,
    darkTrimMat,
    warmCeilingMat,
    cyanNeonMat,
    woodPoleMat,
    wireMat,
    shatterGlassMat,
  );

  // 3. City Block Sidewalk Islands
  const outerCenters = [-82, -26, 26, 82];
  for (const bx of outerCenters) {
    for (const bz of outerCenters) {
      if (Math.abs(bx) === 82 && Math.abs(bz) === 82) continue;
      const w = Math.abs(bx) === 82 ? 38 : 34;
      const d = Math.abs(bz) === 82 ? 38 : 34;
      const swGeo = new THREE.BoxGeometry(w, 0.08, d);
      const sw = new THREE.Mesh(swGeo, sidewalkMat);
      sw.position.set(bx, 0.04, bz);
      sw.receiveShadow = true;
      group.add(sw);
      disposables.push(swGeo);
    }
  }

  function addWall(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    disposables.push(geo);
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      minY: y,
      height: y + h,
    });
  }

  function addDestructibleGlassPane(
    id: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, shatterGlassMat);
    mesh.position.set(x, y + h / 2, z);
    group.add(mesh);
    disposables.push(geo);

    const colliderIndex = colliders.length;
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      minY: y,
      height: y + h,
    });
    destructibleGlass.push({
      id,
      mesh,
      center: new THREE.Vector3(x, y + h / 2, z),
      minX: x - w / 2,
      maxX: x + w / 2,
      minY: y,
      maxY: y + h,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      shattered: false,
      colliderIndex,
    });
  }

  // 4. ENTERABLE AREA #1: Syndicate Corporate Tower Lobby (+26, -26) with Destructible Glass Storefront!
  {
    const lx = 26;
    const lz = -26;
    const lw = 20;
    const ld = 20;
    const wallH = 5.2;

    const floorGeo = new THREE.BoxGeometry(lw, 0.1, ld);
    const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
    floor.position.set(lx, 0.09, lz);
    floor.receiveShadow = true;
    group.add(floor);
    disposables.push(floorGeo);

    addWall(lx, 0.08, lz - ld / 2 + 0.3, lw, wallH, 0.6, concreteTrimMat);
    addWall(lx + lw / 2 - 0.3, 0.08, lz, 0.6, wallH, ld, concreteTrimMat);
    // Destructible glass walls flanking South & West 5.6m entrances
    addDestructibleGlassPane('glass_lobby_s1', lx - 6.4, 0.08, lz + ld / 2 - 0.3, 6.8, wallH - 0.4, 0.28);
    addDestructibleGlassPane('glass_lobby_s2', lx + 6.4, 0.08, lz + ld / 2 - 0.3, 6.8, wallH - 0.4, 0.28);
    addDestructibleGlassPane('glass_lobby_w1', lx - lw / 2 + 0.3, 0.08, lz - 6.4, 0.28, wallH - 0.4, 6.8);
    addDestructibleGlassPane('glass_lobby_w2', lx - lw / 2 + 0.3, 0.08, lz + 6.4, 0.28, wallH - 0.4, 6.8);

    const upperShaftGeo = new THREE.BoxGeometry(lw, 26, ld);
    const upperShaftMat = new THREE.MeshStandardMaterial({
      map: textures.facadeGlassMap,
      roughness: 0.28,
      metalness: 0.55,
    });
    const upperShaft = new THREE.Mesh(upperShaftGeo, upperShaftMat);
    upperShaft.position.set(lx, wallH + 13, lz);
    upperShaft.castShadow = true;
    group.add(upperShaft);
    disposables.push(upperShaftGeo, upperShaftMat);

    addWall(lx + 2, 0.14, lz - 3, 5.2, 1.15, 1.3, darkTrimMat);
    for (const cx of [-5.5, 5.5]) {
      for (const cz of [-5.5, 5.5]) {
        addWall(lx + cx, 0.14, lz + cz, 0.9, wallH, 0.9, concreteTrimMat);
      }
    }

    for (const ox of [-4.5, 4.5]) {
      const stripGeo = new THREE.BoxGeometry(1.2, 0.12, 10);
      const strip = new THREE.Mesh(stripGeo, warmCeilingMat);
      strip.position.set(lx + ox, wallH - 0.08, lz);
      group.add(strip);
      disposables.push(stripGeo);
    }
    lightAnchors.push(
      { x: lx, y: 4.5, z: lz, color: 0xffe4b0, intensity: 26, distance: 26 },
      { x: lx, y: 4.2, z: lz + 11, color: 0xffc875, intensity: 22, distance: 24 },
    );

    const signTex = createNeonSignTexture('SYNDICATE HQ', '#f59e0b');
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: 0xf59e0b,
      emissiveMap: signTex,
      emissiveIntensity: 1.8,
    });
    const signGeo = new THREE.BoxGeometry(5.6, 1.5, 0.25);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(lx, wallH + 1.1, lz + ld / 2 + 0.3);
    group.add(sign);
    disposables.push(signTex, signMat, signGeo);
  }

  // 5. ENTERABLE AREA #2: 24H Neon Lounge & Bar (-26, +26) with Destructible Glass & Clerk Counter
  {
    const bx = -26;
    const bz = 26;
    const bw = 18;
    const bd = 18;
    const wallH = 4.6;

    const floorGeo = new THREE.BoxGeometry(bw, 0.1, bd);
    const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
    floor.position.set(bx, 0.09, bz);
    floor.receiveShadow = true;
    group.add(floor);
    disposables.push(floorGeo);

    addWall(bx - bw / 2 + 0.3, 0.08, bz, 0.6, wallH, bd, concreteTrimMat);
    addWall(bx, 0.08, bz + bd / 2 - 0.3, bw, wallH, 0.6, concreteTrimMat);
    addDestructibleGlassPane('glass_lounge_n1', bx - 5.8, 0.08, bz - bd / 2 + 0.3, 6.0, wallH - 0.4, 0.28);
    addDestructibleGlassPane('glass_lounge_n2', bx + 5.8, 0.08, bz - bd / 2 + 0.3, 6.0, wallH - 0.4, 0.28);
    addDestructibleGlassPane('glass_lounge_e1', bx + bw / 2 - 0.3, 0.08, bz - 5.8, 0.28, wallH - 0.4, 6.0);
    addDestructibleGlassPane('glass_lounge_e2', bx + bw / 2 - 0.3, 0.08, bz + 5.8, 0.28, wallH - 0.4, 6.0);

    const upperGeo = new THREE.BoxGeometry(bw, 14, bd);
    const upperMat = new THREE.MeshStandardMaterial({
      map: textures.facadeBrickMap,
      roughness: 0.78,
    });
    const upper = new THREE.Mesh(upperGeo, upperMat);
    upper.position.set(bx, wallH + 7, bz);
    upper.castShadow = true;
    group.add(upper);
    disposables.push(upperGeo, upperMat);

    // Bar Counter & Neon Strip
    addWall(bx - 3.5, 0.14, bz + 3.5, 6.2, 1.1, 1.2, darkTrimMat);
    const barStripGeo = new THREE.BoxGeometry(6.2, 0.12, 0.16);
    const barStrip = new THREE.Mesh(barStripGeo, cyanNeonMat);
    barStrip.position.set(bx - 3.5, 1.24, bz + 2.95);
    group.add(barStrip);
    disposables.push(barStripGeo);

    addWall(bx + 4.2, 0.14, bz + 4.0, 2.4, 0.85, 1.4, metalMat);
    addWall(bx + 4.2, 0.14, bz - 3.0, 2.4, 0.85, 1.4, metalMat);

    lightAnchors.push(
      { x: bx, y: 4.0, z: bz, color: 0x38bdf8, intensity: 24, distance: 25 },
      { x: bx + 9, y: 4.2, z: bz, color: 0xf59e0b, intensity: 22, distance: 24 },
    );

    const signTex = createNeonSignTexture('NEON LOUNGE', '#38bdf8');
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: 0x38bdf8,
      emissiveMap: signTex,
      emissiveIntensity: 1.8,
    });
    const signGeo = new THREE.BoxGeometry(5.2, 1.4, 0.25);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(bx, wallH + 1.0, bz - bd / 2 - 0.3);
    sign.rotation.y = Math.PI;
    group.add(sign);
    disposables.push(signTex, signMat, signGeo);
  }

  // 5b. ENTERABLE AREA #2B: 24H Corner Store / Bodega (+24, +24) with Destructible Glass & Shopkeeper Counter!
  {
    const sx = 24;
    const sz = 24;
    const sw = 16;
    const sd = 16;
    const wallH = 4.4;

    const floorGeo = new THREE.BoxGeometry(sw, 0.1, sd);
    const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
    floor.position.set(sx, 0.09, sz);
    floor.receiveShadow = true;
    group.add(floor);
    disposables.push(floorGeo);

    // East & South solid walls
    addWall(sx + sw / 2 - 0.3, 0.08, sz, 0.6, wallH, sd, concreteTrimMat);
    addWall(sx, 0.08, sz + sd / 2 - 0.3, sw, wallH, 0.6, concreteTrimMat);
    // West wall facing player spawn street: center doorway + destructible glass windows!
    addDestructibleGlassPane('glass_store_w1', sx - sw / 2 + 0.3, 0.08, sz - 5.0, 0.28, wallH - 0.4, 5.4);
    addDestructibleGlassPane('glass_store_w2', sx - sw / 2 + 0.3, 0.08, sz + 5.0, 0.28, wallH - 0.4, 5.4);
    // North wall with glass
    addDestructibleGlassPane('glass_store_n1', sx - 5.0, 0.08, sz - sd / 2 + 0.3, 5.4, wallH - 0.4, 0.28);
    addDestructibleGlassPane('glass_store_n2', sx + 5.0, 0.08, sz - sd / 2 + 0.3, 5.4, wallH - 0.4, 0.28);

    // Upper retail/office tower above store
    const upperGeo = new THREE.BoxGeometry(sw, 18, sd);
    const upperMat = new THREE.MeshStandardMaterial({
      map: textures.facadeGlassMap,
      roughness: 0.3,
      metalness: 0.5,
    });
    const upper = new THREE.Mesh(upperGeo, upperMat);
    upper.position.set(sx, wallH + 9, sz);
    upper.castShadow = true;
    group.add(upper);
    disposables.push(upperGeo, upperMat);

    // Store Checkout Counter & Shelf Aisles
    addWall(sx + 3.2, 0.14, sz + 3.2, 5.2, 1.08, 1.2, darkTrimMat);
    addWall(sx - 2.2, 0.14, sz - 2.5, 4.2, 1.6, 0.9, metalMat);
    addWall(sx - 2.2, 0.14, sz + 1.5, 4.2, 1.6, 0.9, metalMat);

    const storeStripGeo = new THREE.BoxGeometry(8, 0.1, 0.8);
    const storeStrip = new THREE.Mesh(storeStripGeo, warmCeilingMat);
    storeStrip.position.set(sx, wallH - 0.08, sz);
    group.add(storeStrip);
    disposables.push(storeStripGeo);

    lightAnchors.push(
      { x: sx, y: 3.9, z: sz, color: 0xfff0c2, intensity: 26, distance: 24 },
      { x: sx - 9, y: 4.0, z: sz, color: 0xfde047, intensity: 22, distance: 22 },
    );

    const signTex = createNeonSignTexture('24H MART', '#22c55e');
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: 0x22c55e,
      emissiveMap: signTex,
      emissiveIntensity: 1.8,
    });
    const signGeo = new THREE.BoxGeometry(0.25, 1.4, 5.0);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(sx - sw / 2 - 0.3, wallH + 0.9, sz);
    group.add(sign);
    disposables.push(signTex, signMat, signGeo);
  }

  // 5c. ENTERABLE AREA #2C: ATELIER VEX Boutique & Tailor (-24, +72) — Enter to Greet & Change Disguise Outfits!
  {
    const ax = -24;
    const az = 72;
    const aw = 16;
    const ad = 14;
    const wallH = 4.6;

    const floorGeo = new THREE.BoxGeometry(aw, 0.1, ad);
    const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
    floor.position.set(ax, 0.09, az);
    floor.receiveShadow = true;
    group.add(floor);
    disposables.push(floorGeo);

    // Solid South & West walls
    addWall(ax, 0.08, az + ad / 2 - 0.3, aw, wallH, 0.6, concreteTrimMat);
    addWall(ax - aw / 2 + 0.3, 0.08, az, 0.6, wallH, ad, concreteTrimMat);
    // North wall facing spawn street (z = 65): center 5.4m entrance flanked by destructible glass!
    addDestructibleGlassPane('glass_boutique_n1', ax - 5.1, 0.08, az - ad / 2 + 0.3, 5.2, wallH - 0.4, 0.28);
    addDestructibleGlassPane('glass_boutique_n2', ax + 5.1, 0.08, az - ad / 2 + 0.3, 5.2, wallH - 0.4, 0.28);
    // East wall facing avenue (x = -16): center doorway flanked by glass!
    addDestructibleGlassPane('glass_boutique_e1', ax + aw / 2 - 0.3, 0.08, az - 4.4, 0.28, wallH - 0.4, 4.6);
    addDestructibleGlassPane('glass_boutique_e2', ax + aw / 2 - 0.3, 0.08, az + 4.4, 0.28, wallH - 0.4, 4.6);

    // Boutique Roof & Upper Boutique Penthouse
    const roofGeo = new THREE.BoxGeometry(aw + 0.4, 0.5, ad + 0.4);
    const roof = new THREE.Mesh(roofGeo, concreteTrimMat);
    roof.position.set(ax, wallH + 0.25, az);
    group.add(roof);
    const upperGeo = new THREE.BoxGeometry(aw - 1.2, 11, ad - 1.2);
    const upperMat = new THREE.MeshStandardMaterial({
      map: textures.facadeBrickMap,
      roughness: 0.72,
    });
    const upper = new THREE.Mesh(upperGeo, upperMat);
    upper.position.set(ax, wallH + 6.0, az);
    upper.castShadow = true;
    group.add(upper);
    disposables.push(roofGeo, upperGeo, upperMat);

    // Tailor Counter & Clothing Racks (Tactical, Streetwear, Suit, Worker displays)
    addWall(ax + 3.2, 0.14, az + 4.2, 4.8, 1.05, 1.0, darkTrimMat);
    const rackColors = [0x1a202c, 0xd8d6cf, 0x7f1d1d, 0xeab308];
    const rackFrameGeo = new THREE.BoxGeometry(2.2, 1.7, 0.16);
    const hangerClothGeo = new THREE.BoxGeometry(1.75, 1.05, 0.34);
    disposables.push(rackFrameGeo, hangerClothGeo);
    for (let r = 0; r < 3; r++) {
      const rx = ax - 4.8 + r * 3.1;
      const rz = az + 3.6;
      const frame = new THREE.Mesh(rackFrameGeo, metalMat);
      frame.position.set(rx, 0.95, rz);
      const rMat = new THREE.MeshStandardMaterial({
        color: rackColors[r],
        roughness: 0.65,
      });
      const clothes = new THREE.Mesh(hangerClothGeo, rMat);
      clothes.position.set(rx, 1.12, rz);
      group.add(frame, clothes);
      disposables.push(rMat);
    }

    // Full-Length Dressing Mirror on West wall
    const mirrorFrameGeo = new THREE.BoxGeometry(0.18, 2.4, 1.4);
    const mirrorGlassGeo = new THREE.BoxGeometry(0.06, 2.15, 1.18);
    const mirrorGlassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.08,
      metalness: 0.9,
      emissive: 0x0c4a6e,
      emissiveIntensity: 0.35,
    });
    const mFrame = new THREE.Mesh(mirrorFrameGeo, metalMat);
    mFrame.position.set(ax - aw / 2 + 0.72, 1.35, az);
    const mGlass = new THREE.Mesh(mirrorGlassGeo, mirrorGlassMat);
    mGlass.position.set(ax - aw / 2 + 0.8, 1.35, az);
    group.add(mFrame, mGlass);
    disposables.push(mirrorFrameGeo, mirrorGlassGeo, mirrorGlassMat);

    // Warm Interior Ceiling Strip & Magenta/Amber Boutique Neon Sign
    const bStripGeo = new THREE.BoxGeometry(8.5, 0.1, 0.9);
    const bStrip = new THREE.Mesh(bStripGeo, warmCeilingMat);
    bStrip.position.set(ax, wallH - 0.08, az);
    group.add(bStrip);
    disposables.push(bStripGeo);

    lightAnchors.push(
      { x: ax, y: 4.1, z: az, color: 0xffe6c7, intensity: 28, distance: 26 },
      { x: ax, y: 4.2, z: az - 9.5, color: 0xf472b6, intensity: 24, distance: 26 },
    );

    const signTex = createNeonSignTexture('ATELIER VEX', '#f472b6');
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: 0xf472b6,
      emissiveMap: signTex,
      emissiveIntensity: 2.0,
    });
    const signGeo = new THREE.BoxGeometry(5.8, 1.45, 0.25);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(ax, wallH + 0.95, az - ad / 2 - 0.3);
    sign.rotation.y = Math.PI;
    group.add(sign);
    disposables.push(signTex, signMat, signGeo);
  }

  // 6. ENTERABLE AREA #3: Open-Bay Underground Parking Garage (-26, -26)
  {
    const gx = -26;
    const gz = -26;
    const gw = 22;
    const gd = 22;
    const bayH = 4.8;

    const floorGeo = new THREE.BoxGeometry(gw, 0.1, gd);
    const floor = new THREE.Mesh(floorGeo, sidewalkMat);
    floor.position.set(gx, 0.09, gz);
    floor.receiveShadow = true;
    group.add(floor);
    disposables.push(floorGeo);

    addWall(gx, 0.08, gz - gd / 2 + 0.3, gw, bayH, 0.6, concreteTrimMat);
    addWall(gx - gw / 2 + 0.3, 0.08, gz, 0.6, bayH, gd, concreteTrimMat);
    addWall(gx - 7.5, 0.08, gz + gd / 2 - 0.3, 7.0, bayH, 0.6, concreteTrimMat);
    addWall(gx + 7.5, 0.08, gz + gd / 2 - 0.3, 7.0, bayH, 0.6, concreteTrimMat);
    addWall(gx + gw / 2 - 0.3, 0.08, gz - 7.5, 0.6, bayH, 7.0, concreteTrimMat);
    addWall(gx + gw / 2 - 0.3, 0.08, gz + 7.5, 0.6, bayH, 7.0, concreteTrimMat);

    const roofGeo = new THREE.BoxGeometry(gw, 0.6, gd);
    const roof = new THREE.Mesh(roofGeo, concreteTrimMat);
    roof.position.set(gx, bayH + 0.3, gz);
    group.add(roof);
    const topTowerGeo = new THREE.BoxGeometry(gw - 2, 16, gd - 2);
    const topTowerMat = new THREE.MeshStandardMaterial({
      map: textures.facadeConcreteMap,
      roughness: 0.7,
    });
    const topTower = new THREE.Mesh(topTowerGeo, topTowerMat);
    topTower.position.set(gx, bayH + 8.6, gz);
    topTower.castShadow = true;
    group.add(topTower);
    disposables.push(roofGeo, topTowerGeo, topTowerMat);

    for (const ox of [-5.2, 5.2]) {
      for (const oz of [-5.2, 5.2]) {
        addWall(gx + ox, 0.14, gz + oz, 0.9, bayH, 0.9, concreteTrimMat);
      }
    }
    const tubeGeo = new THREE.BoxGeometry(10, 0.1, 0.5);
    const tube = new THREE.Mesh(tubeGeo, warmCeilingMat);
    tube.position.set(gx, bayH - 0.1, gz);
    group.add(tube);
    disposables.push(tubeGeo);

    lightAnchors.push({
      x: gx,
      y: 4.2,
      z: gz,
      color: 0xdbeafe,
      intensity: 26,
      distance: 28,
    });

    const signTex = createNeonSignTexture('GARAGE BAY 04', '#eab308');
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: 0xeab308,
      emissiveMap: signTex,
      emissiveIntensity: 1.6,
    });
    const signGeo = new THREE.BoxGeometry(5.8, 1.3, 0.25);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(gx, bayH + 0.9, gz + gd / 2 + 0.3);
    group.add(sign);
    disposables.push(signTex, signMat, signGeo);
  }

  // 7. ENTERABLE AREA #4: Elevated Skyline Concrete Overpass + Walkable Ramps (x = 64)
  {
    const ox = 64;
    const deckY = 3.4;
    const deckGeo = new THREE.BoxGeometry(9, 0.4, 28);
    const deck = new THREE.Mesh(deckGeo, concreteTrimMat);
    deck.position.set(ox, deckY - 0.2, 0);
    deck.receiveShadow = true;
    deck.castShadow = true;
    group.add(deck);
    disposables.push(deckGeo);

    walkables.push({
      minX: ox - 4.5,
      maxX: ox + 4.5,
      minZ: -14,
      maxZ: 14,
      yStart: deckY,
      yEnd: deckY,
      axis: 'flat',
    });

    const railGeo = new THREE.BoxGeometry(0.25, 0.9, 28);
    const rL = new THREE.Mesh(railGeo, metalMat);
    rL.position.set(ox - 4.35, deckY + 0.45, 0);
    const rR = new THREE.Mesh(railGeo, metalMat);
    rR.position.set(ox + 4.35, deckY + 0.45, 0);
    group.add(rL, rR);
    disposables.push(railGeo);

    const rampLen = Math.hypot(14, deckY);
    const rampAngle = Math.atan2(deckY, 14);
    const rampGeo = new THREE.BoxGeometry(8.6, 0.35, rampLen);
    disposables.push(rampGeo);

    const northRamp = new THREE.Mesh(rampGeo, sidewalkMat);
    northRamp.position.set(ox, deckY / 2 - 0.15, -21);
    northRamp.rotation.x = -rampAngle;
    northRamp.receiveShadow = true;
    group.add(northRamp);
    walkables.push({
      minX: ox - 4.3,
      maxX: ox + 4.3,
      minZ: -28,
      maxZ: -14,
      yStart: 0,
      yEnd: deckY,
      axis: 'z',
    });

    const southRamp = new THREE.Mesh(rampGeo, sidewalkMat);
    southRamp.position.set(ox, deckY / 2 - 0.15, 21);
    southRamp.rotation.x = rampAngle;
    southRamp.receiveShadow = true;
    group.add(southRamp);
    walkables.push({
      minX: ox - 4.3,
      maxX: ox + 4.3,
      minZ: 14,
      maxZ: 28,
      yStart: deckY,
      yEnd: 0,
      axis: 'z',
    });

    lightAnchors.push(
      { x: ox, y: deckY + 3.5, z: 0, color: 0xfbbf24, intensity: 24, distance: 26 },
      { x: ox, y: 3.5, z: -26, color: 0x38bdf8, intensity: 20, distance: 22 },
      { x: ox, y: 3.5, z: 26, color: 0x38bdf8, intensity: 20, distance: 22 },
    );
  }

  // 8. ALL Remaining City Buildings Made Accessible + Real Enterable HOTEL VEX
  const facadeMats = [
    new THREE.MeshStandardMaterial({
      map: textures.facadeGlassMap,
      roughness: 0.28,
      metalness: 0.55,
    }),
    new THREE.MeshStandardMaterial({
      map: textures.facadeConcreteMap,
      roughness: 0.68,
      metalness: 0.15,
    }),
    new THREE.MeshStandardMaterial({
      map: textures.facadeBrickMap,
      roughness: 0.82,
      metalness: 0.06,
    }),
  ];
  disposables.push(...facadeMats);

  const extraZones: CityZone[] = [];

  // 8a. HOTEL VEX (-26, -84.5): Marble Lobby, Concierge Desk, Corridor & Furnished Suites 201-204
  let hotelVex!: HotelVexSpec;
  {
    const hx = -26;
    const hz = -84.5;
    const hw = 24;
    const hd = 31;
    const wallH = 5.2;
    const minX = hx - hw / 2; // -38
    const maxX = hx + hw / 2; // -14
    const minZ = hz - hd / 2; // -100
    const maxZ = hz + hd / 2; // -69

    const hotelFloorGeo = new THREE.BoxGeometry(hw, 0.1, hd);
    const hotelFloor = new THREE.Mesh(hotelFloorGeo, interiorFloorMat);
    hotelFloor.position.set(hx, 0.09, hz);
    hotelFloor.receiveShadow = true;
    group.add(hotelFloor);
    disposables.push(hotelFloorGeo);

    // Crimson & gold runner carpet through lobby & corridor
    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x5c1424,
      roughness: 0.88,
      metalness: 0.05,
    });
    const carpetGeo = new THREE.BoxGeometry(3.4, 0.02, hd - 2);
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.position.set(hx, 0.15, hz);
    carpet.receiveShadow = true;
    group.add(carpet);
    disposables.push(carpetMat, carpetGeo);

    // Outer solid perimeter walls (North, West, East)
    addWall(hx, 0.08, minZ + 0.3, hw, wallH, 0.6, concreteTrimMat);
    addWall(minX + 0.3, 0.08, hz, 0.6, wallH, hd, concreteTrimMat);
    addWall(maxX - 0.3, 0.08, hz, 0.6, wallH, hd, concreteTrimMat);

    // South entrance facade (z = -69): open 5.6m lobby doors flanked by pillars & destructible glass
    addWall(minX + 1.4, 0.08, maxZ - 0.3, 2.8, wallH, 0.6, concreteTrimMat);
    addWall(maxX - 1.4, 0.08, maxZ - 0.3, 2.8, wallH, 0.6, concreteTrimMat);
    addDestructibleGlassPane('glass_hotel_s1', hx - 6.0, 0.08, maxZ - 0.3, 6.4, wallH - 0.4, 0.28);
    addDestructibleGlassPane('glass_hotel_s2', hx + 6.0, 0.08, maxZ - 0.3, 6.4, wallH - 0.4, 0.28);

    // Upper hotel skyscraper shaft above y = wallH (unobstructed interior below!)
    const hRoofGeo = new THREE.BoxGeometry(hw + 0.6, 0.5, hd + 0.6);
    const hRoof = new THREE.Mesh(hRoofGeo, concreteTrimMat);
    hRoof.position.set(hx, wallH + 0.25, hz);
    group.add(hRoof);
    const hShaftGeo = new THREE.BoxGeometry(hw - 1.4, 24, hd - 1.4);
    const hShaft = new THREE.Mesh(hShaftGeo, facadeMats[0]);
    hShaft.position.set(hx, wallH + 12.5, hz);
    hShaft.castShadow = true;
    group.add(hShaft);
    disposables.push(hRoofGeo, hShaftGeo);
    colliders.push({
      minX,
      maxX,
      minZ,
      maxZ,
      minY: wallH,
      height: wallH + 25,
    });

    // Concierge Front Desk inside lobby (z = -76.8)
    addWall(hx, 0.14, -76.8, 5.4, 1.12, 1.15, darkTrimMat);
    const deskStripGeo = new THREE.BoxGeometry(5.2, 0.1, 0.12);
    const amberStripMat = new THREE.MeshStandardMaterial({
      color: 0xfcd34d,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
    });
    const deskStrip = new THREE.Mesh(deskStripGeo, amberStripMat);
    deskStrip.position.set(hx, 1.18, -76.22);
    group.add(deskStrip);
    disposables.push(deskStripGeo, amberStripMat);

    // Lobby partition wall at z = -81 separating Lobby from Guest Wing corridor (x = -28.6..-23.4 open)
    addWall(hx - 7.4, 0.08, -81, 9.2, wallH, 0.45, concreteTrimMat);
    addWall(hx + 7.4, 0.08, -81, 9.2, wallH, 0.45, concreteTrimMat);

    // Divider walls between Suites 201/202 (left) and Suites 203/204 (right) at z = -90.5
    addWall(hx - 7.4, 0.08, -90.5, 9.2, wallH, 0.45, concreteTrimMat);
    addWall(hx + 7.4, 0.08, -90.5, 9.2, wallH, 0.45, concreteTrimMat);

    // Corridor walls along x = -28.6 (left suites) and x = -23.4 (right suites) with 2.0m door openings
    const addCorridorWallWithDoor = (
      roomId: HotelRoomId | '204',
      wallX: number,
      zStart: number,
      zEnd: number,
      sideSign: 1 | -1,
      initiallyUnlocked: boolean,
      bedPos?: THREE.Vector3,
    ): HotelRoomDoorSpec => {
      const doorCenterZ = (zStart + zEnd) * 0.5;
      const segLen = (zEnd - zStart - 2.1) * 0.5;
      addWall(wallX, 0.08, zStart + segLen / 2, 0.4, wallH, segLen, concreteTrimMat);
      addWall(wallX, 0.08, zEnd - segLen / 2, 0.4, wallH, segLen, concreteTrimMat);

      // Door lintel above 2.6m doorway
      const lintelGeo = new THREE.BoxGeometry(0.4, wallH - 2.6, 2.2);
      const lintel = new THREE.Mesh(lintelGeo, concreteTrimMat);
      lintel.position.set(wallX, 2.6 + (wallH - 2.6) / 2, doorCenterZ);
      group.add(lintel);
      disposables.push(lintelGeo);

      // Hinged door panel + Lock LED + Collider
      const doorPivot = new THREE.Group();
      doorPivot.position.set(wallX, 0.14, doorCenterZ - 0.98);
      const doorMat = new THREE.MeshStandardMaterial({
        color: roomId === '204' ? 0x451a03 : 0x3b2a1e,
        roughness: 0.55,
        metalness: 0.25,
      });
      const doorGeo = new THREE.BoxGeometry(0.14, 2.45, 1.92);
      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(0, 1.225, 0.96);
      doorMesh.castShadow = true;
      doorPivot.add(doorMesh);

      const lockLedMat = new THREE.MeshBasicMaterial({
        color: initiallyUnlocked ? 0x10b981 : 0xef4444,
      });
      const lockLed = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 6),
        lockLedMat,
      );
      lockLed.position.set(sideSign * 0.12, 1.28, 1.72);
      doorPivot.add(lockLed);
      group.add(doorPivot);

      // Room number plaque in corridor
      const numLabel = roomId === '204' ? '204 VIP' : roomId;
      const numTex = createNeonSignTexture(numLabel, roomId === '204' ? '#ef4444' : '#fbbf24');
      const numMat = new THREE.MeshStandardMaterial({
        map: numTex,
        emissive: roomId === '204' ? 0xef4444 : 0xfbbf24,
        emissiveMap: numTex,
        emissiveIntensity: 1.6,
      });
      const numGeo = new THREE.BoxGeometry(0.08, 0.42, 0.95);
      const numMesh = new THREE.Mesh(numGeo, numMat);
      numMesh.position.set(wallX + sideSign * 0.25, 2.15, doorCenterZ - 1.55);
      group.add(numMesh);

      disposables.push(doorMat, doorGeo, lockLed.geometry, lockLedMat, numTex, numMat, numGeo);

      const colliderIndex = colliders.length;
      colliders.push({
        minX: wallX - 0.22,
        maxX: wallX + 0.22,
        minZ: doorCenterZ - 1.0,
        maxZ: doorCenterZ + 1.0,
        minY: 0.08,
        height: initiallyUnlocked ? -1 : 2.6,
      });

      if (initiallyUnlocked) {
        doorPivot.rotation.y = sideSign * -Math.PI * 0.48;
      }

      return {
        roomId,
        pivot: doorPivot,
        lockLedMat,
        colliderIndex,
        unlocked: initiallyUnlocked,
        doorPos: new THREE.Vector3(wallX + sideSign * 0.9, 0.14, doorCenterZ),
        bedPos,
      };
    };

    const addSuiteFurnishings = (
      bx: number,
      bz: number,
      isVip: boolean,
    ) => {
      const frameGeo = new THREE.BoxGeometry(2.3, 0.45, 2.1);
      const mattressGeo = new THREE.BoxGeometry(2.1, 0.24, 1.9);
      const mattressMat = new THREE.MeshStandardMaterial({
        color: isVip ? 0x7f1d1d : 0xdbeafe,
        roughness: 0.85,
      });
      const frame = new THREE.Mesh(frameGeo, darkTrimMat);
      frame.position.set(bx, 0.36, bz);
      const mattress = new THREE.Mesh(mattressGeo, mattressMat);
      mattress.position.set(bx, 0.7, bz);
      group.add(frame, mattress);
      disposables.push(frameGeo, mattressGeo, mattressMat);
      colliders.push({
        minX: bx - 1.15,
        maxX: bx + 1.15,
        minZ: bz - 1.05,
        maxZ: bz + 1.05,
        minY: 0.14,
        height: 1.0,
      });
    };

    const bed201 = new THREE.Vector3(-34.6, 0.14, -85.8);
    const bed202 = new THREE.Vector3(-34.6, 0.14, -95.2);
    const bed203 = new THREE.Vector3(-17.4, 0.14, -85.8);
    addSuiteFurnishings(bed201.x, bed201.z, false);
    addSuiteFurnishings(bed202.x, bed202.z, false);
    addSuiteFurnishings(bed203.x, bed203.z, false);
    addSuiteFurnishings(-16.8, -93.0, true);

    const door201 = addCorridorWallWithDoor('201', -28.6, -90.5, -81.0, 1, false, bed201);
    const door202 = addCorridorWallWithDoor('202', -28.6, -100.0, -90.5, 1, false, bed202);
    const door203 = addCorridorWallWithDoor('203', -23.4, -90.5, -81.0, -1, false, bed203);
    const door204 = addCorridorWallWithDoor('204', -23.4, -100.0, -90.5, -1, false);

    // Suite 204 VIP Vault Desk + Glowing Encrypted Obsidian Ledger
    addWall(-17.5, 0.14, -97.6, 2.8, 0.96, 1.1, darkTrimMat);
    const ledgerPos = new THREE.Vector3(-17.5, 1.24, -97.6);
    const ledgerGeo = new THREE.BoxGeometry(0.54, 0.14, 0.42);
    const ledgerMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x10b981,
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ledgerMesh = new THREE.Mesh(ledgerGeo, ledgerMat);
    ledgerMesh.position.copy(ledgerPos);
    group.add(ledgerMesh);
    disposables.push(ledgerGeo, ledgerMat);

    // Interior Hotel Lighting & Exterior Sign
    for (const lz of [-74.5, -85.5, -95.0]) {
      const stripGeo = new THREE.BoxGeometry(3.4, 0.1, 1.0);
      const strip = new THREE.Mesh(stripGeo, warmCeilingMat);
      strip.position.set(hx, wallH - 0.1, lz);
      group.add(strip);
      disposables.push(stripGeo);
    }
    lightAnchors.push(
      { x: hx, y: 4.5, z: -74.5, color: 0xffdca8, intensity: 30, distance: 26 },
      { x: hx, y: 4.5, z: -90.0, color: 0xffd28a, intensity: 26, distance: 26 },
      { x: -18.5, y: 4.2, z: -95.5, color: 0x34d399, intensity: 22, distance: 18 },
      { x: hx, y: 4.5, z: maxZ + 3.8, color: 0xf59e0b, intensity: 24, distance: 24 },
    );

    const hSignTex = createNeonSignTexture('HOTEL VEX', '#f59e0b');
    const hSignMat = new THREE.MeshStandardMaterial({
      map: hSignTex,
      emissive: 0xf59e0b,
      emissiveMap: hSignTex,
      emissiveIntensity: 1.9,
    });
    const hSignGeo = new THREE.BoxGeometry(6.2, 1.5, 0.25);
    const hSign = new THREE.Mesh(hSignGeo, hSignMat);
    hSign.position.set(hx, wallH + 1.0, maxZ + 0.35);
    group.add(hSign);
    disposables.push(hSignTex, hSignMat, hSignGeo);

    extraZones.push(
      { name: 'Hotel Vex Lobby (Interior)', minX, maxX, minZ: -81, maxZ },
      { name: 'Hotel Vex Guest Wing (Interior)', minX, maxX, minZ, maxZ: -81 },
    );

    hotelVex = {
      deskPos: new THREE.Vector3(hx, 0.14, -75.4),
      conciergePos: new THREE.Vector3(hx, 0.14, -78.4),
      rooms: { '201': door201, '202': door202, '203': door203 },
      suite204Door: door204,
      ledgerMesh,
      ledgerPos,
      ledgerStolen: false,
    };
  }

  // 8b. All Other City Buildings Made Fully Enterable on Ground Floor!
  const enterableBlocks: Array<{
    name: string;
    x: number;
    z: number;
    w: number;
    d: number;
    h: number;
    style: 0 | 1 | 2;
    doorSide: 'south' | 'north' | 'east' | 'west';
    sign?: { label: string; color: string };
  }> = [
    { name: 'Cyber Arcade (Interior)', x: 37, z: 36, w: 12, d: 12, h: 18, style: 2, doorSide: 'west', sign: { label: 'CYBER ARCADE', color: '#a855f7' } },
    { name: 'Meridian Bank (Interior)', x: 26, z: -80, w: 22, d: 16, h: 34, style: 1, doorSide: 'south', sign: { label: 'MERIDIAN BANK', color: '#38bdf8' } },
    { name: 'Pawn 24H (Interior)', x: -80, z: -26, w: 16, d: 20, h: 24, style: 2, doorSide: 'east', sign: { label: 'PAWN 24H', color: '#ef4444' } },
    { name: 'Westside Lofts Lobby (Interior)', x: -80, z: 26, w: 16, d: 20, h: 28, style: 0, doorSide: 'east', sign: { label: 'WESTSIDE LOFTS', color: '#38bdf8' } },
    { name: 'Velvet Jazz Club (Interior)', x: -26, z: 90, w: 20, d: 16, h: 22, style: 1, doorSide: 'north', sign: { label: 'VELVET CLUB', color: '#f472b6' } },
    { name: 'Metro Transit Station (Interior)', x: 26, z: 80, w: 22, d: 16, h: 30, style: 0, doorSide: 'north', sign: { label: 'METRO TRANSIT', color: '#eab308' } },
    { name: 'Harbor Logistics Depot (Interior)', x: 88, z: -78, w: 18, d: 16, h: 20, style: 1, doorSide: 'south', sign: { label: 'HARBOR DEPOT', color: '#f97316' } },
    { name: 'Eastside Imports (Interior)', x: 88, z: 78, w: 18, d: 16, h: 24, style: 2, doorSide: 'north', sign: { label: 'EASTSIDE IMPORTS', color: '#22c55e' } },
  ];

  enterableBlocks.forEach((b, bIdx) => {
    const wallH = 4.8;
    const minX = b.x - b.w / 2;
    const maxX = b.x + b.w / 2;
    const minZ = b.z - b.d / 2;
    const maxZ = b.z + b.d / 2;

    const floorGeo = new THREE.BoxGeometry(b.w, 0.1, b.d);
    const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
    floor.position.set(b.x, 0.09, b.z);
    floor.receiveShadow = true;
    group.add(floor);
    disposables.push(floorGeo);

    const doorW = Math.min(4.8, Math.min(b.w, b.d) * 0.4);
    const addSideWallOrDoor = (side: 'south' | 'north' | 'east' | 'west') => {
      const horiz = side === 'north' || side === 'south';
      const len = horiz ? b.w : b.d;
      const wx = side === 'west' ? minX + 0.3 : side === 'east' ? maxX - 0.3 : b.x;
      const wz = side === 'north' ? minZ + 0.3 : side === 'south' ? maxZ - 0.3 : b.z;
      if (side !== b.doorSide) {
        addWall(wx, 0.08, wz, horiz ? len : 0.6, wallH, horiz ? 0.6 : len, concreteTrimMat);
        return;
      }
      const paneLen = (len - doorW) * 0.5 - 0.4;
      if (horiz) {
        addDestructibleGlassPane(`glass_blk_${bIdx}_1`, b.x - doorW / 2 - paneLen / 2, 0.08, wz, paneLen, wallH - 0.4, 0.28);
        addDestructibleGlassPane(`glass_blk_${bIdx}_2`, b.x + doorW / 2 + paneLen / 2, 0.08, wz, paneLen, wallH - 0.4, 0.28);
      } else {
        addDestructibleGlassPane(`glass_blk_${bIdx}_1`, wx, 0.08, b.z - doorW / 2 - paneLen / 2, 0.28, wallH - 0.4, paneLen);
        addDestructibleGlassPane(`glass_blk_${bIdx}_2`, wx, 0.08, b.z + doorW / 2 + paneLen / 2, 0.28, wallH - 0.4, paneLen);
      }
    };

    addSideWallOrDoor('north');
    addSideWallOrDoor('south');
    addSideWallOrDoor('east');
    addSideWallOrDoor('west');

    // Interior counter / table away from doorway
    const counterX = b.doorSide === 'east' ? b.x - b.w * 0.2 : b.doorSide === 'west' ? b.x + b.w * 0.2 : b.x;
    const counterZ = b.doorSide === 'south' ? b.z - b.d * 0.2 : b.doorSide === 'north' ? b.z + b.d * 0.2 : b.z;
    addWall(counterX, 0.14, counterZ, 3.6, 1.05, 1.1, darkTrimMat);

    // Upper tower starting above y = wallH (ground floor completely open!)
    const roofGeo = new THREE.BoxGeometry(b.w + 0.5, 0.45, b.d + 0.5);
    const roof = new THREE.Mesh(roofGeo, darkTrimMat);
    roof.position.set(b.x, wallH + 0.225, b.z);
    group.add(roof);
    const shaftH = b.h - wallH;
    const shaftGeo = new THREE.BoxGeometry(b.w, shaftH, b.d);
    const shaft = new THREE.Mesh(shaftGeo, facadeMats[b.style]);
    shaft.position.set(b.x, wallH + 0.45 + shaftH / 2, b.z);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    group.add(shaft);
    disposables.push(roofGeo, shaftGeo);
    colliders.push({
      minX,
      maxX,
      minZ,
      maxZ,
      minY: wallH,
      height: b.h + 1,
    });

    const stripGeo = new THREE.BoxGeometry(Math.max(4, b.w * 0.45), 0.1, 0.8);
    const strip = new THREE.Mesh(stripGeo, warmCeilingMat);
    strip.position.set(b.x, wallH - 0.08, b.z);
    group.add(strip);
    disposables.push(stripGeo);
    lightAnchors.push({
      x: b.x,
      y: wallH - 0.6,
      z: b.z,
      color: 0xffe4b0,
      intensity: 24,
      distance: 22,
    });

    if (b.sign) {
      const signTex = createNeonSignTexture(b.sign.label, b.sign.color);
      const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        emissive: new THREE.Color(b.sign.color),
        emissiveMap: signTex,
        emissiveIntensity: 1.6,
      });
      const signGeo = new THREE.BoxGeometry(5.0, 1.35, 0.25);
      const sign = new THREE.Mesh(signGeo, signMat);
      if (b.doorSide === 'south') {
        sign.position.set(b.x, wallH + 0.85, maxZ + 0.35);
      } else if (b.doorSide === 'north') {
        sign.position.set(b.x, wallH + 0.85, minZ - 0.35);
        sign.rotation.y = Math.PI;
      } else if (b.doorSide === 'east') {
        sign.position.set(maxX + 0.35, wallH + 0.85, b.z);
        sign.rotation.y = Math.PI / 2;
      } else {
        sign.position.set(minX - 0.35, wallH + 0.85, b.z);
        sign.rotation.y = -Math.PI / 2;
      }
      group.add(sign);
      disposables.push(signTex, signMat, signGeo);
    }

    extraZones.push({ name: b.name, minX, maxX, minZ, maxZ });
  });

  // 9. East Cargo Yard Shipping Containers
  const containerColors = [0x7c2d12, 0x1e3a5f, 0x14532d, 0x713f12];
  const containerSpecs: Array<[number, number, number, number]> = [
    [84, -22, 0, 0],
    [94, -18, Math.PI / 2, 1],
    [84, 18, 0, 2],
    [96, 22, Math.PI / 2, 3],
    [88, 0, Math.PI / 2, 0],
    [100, -4, 0, 1],
  ];
  containerSpecs.forEach(([cx, cz, rot, ci]) => {
    const cMat = new THREE.MeshStandardMaterial({
      color: containerColors[ci],
      roughness: 0.68,
      metalness: 0.32,
    });
    const cGeo = new THREE.BoxGeometry(2.6, 2.7, 6.4);
    const cMesh = new THREE.Mesh(cGeo, cMat);
    cMesh.position.set(cx, 1.35, cz);
    cMesh.rotation.y = rot;
    cMesh.castShadow = true;
    cMesh.receiveShadow = true;
    group.add(cMesh);
    disposables.push(cMat, cGeo);

    const hw = Math.abs(Math.cos(rot)) * 1.3 + Math.abs(Math.sin(rot)) * 3.2;
    const hd = Math.abs(Math.sin(rot)) * 1.3 + Math.abs(Math.cos(rot)) * 3.2;
    colliders.push({
      minX: cx - hw,
      maxX: cx + hw,
      minZ: cz - hd,
      maxZ: cz + hd,
      height: 2.7,
    });
  });

  // 10. Driveable Cars (Parked + NPC Traffic) with Locked Doors, Drivers & Destructible Parts
  const carColors = [0x1c2430, 0x5b1f26, 0x1f3d33, 0x3b4454, 0x6b4e23];
  interface VehicleSpawnConfig {
    x: number;
    z: number;
    rotY: number;
    locked: boolean;
    isNpcTraffic: boolean;
    isPoliceCruiser?: boolean;
    waypoints?: THREE.Vector3[];
  }
  const carSpots: VehicleSpawnConfig[] = [
    // Parked street cars (index 0 used for intro crash; parked cars near player & hotel)
    { x: -6.5, z: 36, rotY: 0, locked: true, isNpcTraffic: false },
    { x: 7.2, z: -32, rotY: Math.PI, locked: false, isNpcTraffic: false },
    { x: -7.2, z: -16, rotY: 0, locked: true, isNpcTraffic: false },
    { x: 7.2, z: 16, rotY: Math.PI, locked: false, isNpcTraffic: false },
    { x: -32, z: -28, rotY: Math.PI / 2, locked: true, isNpcTraffic: false },
    { x: -20, z: -28, rotY: Math.PI / 2, locked: false, isNpcTraffic: false },
    { x: -46, z: 18, rotY: 0, locked: true, isNpcTraffic: false },
    { x: 46, z: -18, rotY: Math.PI, locked: false, isNpcTraffic: false },
    { x: 18, z: 58, rotY: Math.PI / 2, locked: true, isNpcTraffic: false },
    { x: -18, z: -58, rotY: -Math.PI / 2, locked: false, isNpcTraffic: false },
    // 4 Live NPC-Driven Traffic Sedans (including intersecting central lanes for swerves & road rage!)
    {
      x: 3.1,
      z: 20,
      rotY: Math.PI,
      locked: true,
      isNpcTraffic: true,
      waypoints: [
        new THREE.Vector3(3.1, 0.08, -48.9),
        new THREE.Vector3(54.9, 0.08, -48.9),
        new THREE.Vector3(54.9, 0.08, 48.9),
        new THREE.Vector3(3.1, 0.08, 48.9),
      ],
    },
    {
      x: -3.1,
      z: 10,
      rotY: 0,
      locked: true,
      isNpcTraffic: true,
      waypoints: [
        new THREE.Vector3(-3.1, 0.08, 48.9),
        new THREE.Vector3(-54.9, 0.08, 48.9),
        new THREE.Vector3(-54.9, 0.08, -48.9),
        new THREE.Vector3(-3.1, 0.08, -48.9),
      ],
    },
    {
      x: -22,
      z: 3.1,
      rotY: Math.PI / 2,
      locked: true,
      isNpcTraffic: true,
      waypoints: [
        new THREE.Vector3(48.9, 0.08, 3.1),
        new THREE.Vector3(48.9, 0.08, -54.9),
        new THREE.Vector3(-48.9, 0.08, -54.9),
        new THREE.Vector3(-48.9, 0.08, 3.1),
      ],
    },
    {
      x: 22,
      z: -3.1,
      rotY: -Math.PI / 2,
      locked: true,
      isNpcTraffic: true,
      waypoints: [
        new THREE.Vector3(-48.9, 0.08, -3.1),
        new THREE.Vector3(-48.9, 0.08, 54.9),
        new THREE.Vector3(48.9, 0.08, 54.9),
        new THREE.Vector3(48.9, 0.08, -3.1),
      ],
    },
    // LCPD Police Cruiser ready to respond to any street fights!
    {
      x: 11.5,
      z: -48,
      rotY: Math.PI,
      locked: true,
      isNpcTraffic: false,
      isPoliceCruiser: true,
    },
  ];

  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.85,
  });
  const carGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38577a,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.65,
    clearcoat: 0.95,
  });
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xffe8b0,
    emissive: 0xffd27a,
    emissiveIntensity: 1.5,
  });
  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 1.2,
  });
  const driverSkinMat = new THREE.MeshStandardMaterial({
    map: textures.skinArmLegMap,
    roughness: 0.6,
  });
  const driverJacketMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.78,
  });
  const ledGeo = new THREE.SphereGeometry(0.032, 8, 6);
  const driverHeadGeo = new THREE.SphereGeometry(0.11, 10, 8);
  const driverTorsoGeo = new THREE.BoxGeometry(0.32, 0.34, 0.2);
  disposables.push(
    wheelGeo,
    wheelMat,
    carGlassMat,
    headlightMat,
    taillightMat,
    driverSkinMat,
    driverJacketMat,
    ledGeo,
    driverHeadGeo,
    driverTorsoGeo,
  );

  carSpots.forEach((spot, idx) => {
    const {
      x: cx,
      z: cz,
      rotY,
      locked,
      isNpcTraffic,
      isPoliceCruiser = false,
      waypoints,
    } = spot;
    const car = new THREE.Group();
    car.position.set(cx, 0.08, cz);
    car.rotation.y = rotY;

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: isPoliceCruiser ? 0x0f172a : carColors[idx % carColors.length],
      roughness: 0.26,
      metalness: 0.65,
      clearcoat: 0.85,
    });

    // Core structural chassis + open detailed cabin interior (for 1st-person driver POV!)
    const chassisGeo = new THREE.BoxGeometry(1.86, 0.52, 4.0);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.56;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    car.add(chassis);

    const dashGeo = new THREE.BoxGeometry(1.56, 0.28, 0.42);
    const dash = new THREE.Mesh(dashGeo, darkTrimMat);
    dash.position.set(0, 0.94, 0.62);
    car.add(dash);

    const gaugeGeo = new THREE.BoxGeometry(0.42, 0.11, 0.04);
    const gauge = new THREE.Mesh(gaugeGeo, cyanNeonMat);
    gauge.position.set(0.35, 1.0, 0.41);
    car.add(gauge);

    const pillarGeo = new THREE.BoxGeometry(0.08, 0.56, 0.09);
    const pillarL = new THREE.Mesh(pillarGeo, darkTrimMat);
    pillarL.position.set(0.76, 1.24, 0.82);
    pillarL.rotation.x = -0.52;
    const pillarR = new THREE.Mesh(pillarGeo, darkTrimMat);
    pillarR.position.set(-0.76, 1.24, 0.82);
    pillarR.rotation.x = -0.52;
    const bPillarL = new THREE.Mesh(pillarGeo, darkTrimMat);
    bPillarL.position.set(0.76, 1.24, -0.95);
    bPillarL.rotation.x = 0.35;
    const bPillarR = new THREE.Mesh(pillarGeo, darkTrimMat);
    bPillarR.position.set(-0.76, 1.24, -0.95);
    bPillarR.rotation.x = 0.35;
    car.add(pillarL, pillarR, bPillarL, bPillarR);

    const seatGeo = new THREE.BoxGeometry(0.48, 0.52, 0.16);
    const seatL = new THREE.Mesh(seatGeo, darkTrimMat);
    seatL.position.set(0.36, 1.05, -0.35);
    seatL.rotation.x = -0.15;
    const seatR = new THREE.Mesh(seatGeo, darkTrimMat);
    seatR.position.set(-0.36, 1.05, -0.35);
    seatR.rotation.x = -0.15;
    car.add(seatL, seatR);

    // Seated NPC driver figure (visible when car is driven by an NPC in city traffic)
    const driverModel = new THREE.Group();
    driverModel.position.set(0.36, 1.0, -0.18);
    const dTorso = new THREE.Mesh(driverTorsoGeo, driverJacketMat);
    dTorso.position.y = 0.05;
    const dHead = new THREE.Mesh(driverHeadGeo, driverSkinMat);
    dHead.position.y = 0.29;
    driverModel.add(dTorso, dHead);
    driverModel.visible = isNpcTraffic;
    car.add(driverModel);

    // Door Lock LED indicator (red = locked, emerald = unlocked)
    const lockLedMat = new THREE.MeshBasicMaterial({
      color: locked ? 0xef4444 : 0x10b981,
    });
    const lockLed = new THREE.Mesh(ledGeo, lockLedMat);
    lockLed.position.set(0.95, 0.94, 0.22);
    car.add(lockLed);
    disposables.push(lockLedMat);

    // Steering Wheel & 1st-Person Gloved Hands on Left Driver Side (+X in +Z forward car space)
    const steeringWheel = new THREE.Group();
    steeringWheel.position.set(0.35, 1.03, 0.34);
    steeringWheel.rotation.x = -0.35;
    const rimGeo = new THREE.TorusGeometry(0.16, 0.022, 8, 18);
    const rim = new THREE.Mesh(rimGeo, darkTrimMat);
    const hubGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.05, 10);
    hubGeo.rotateX(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, metalMat);
    steeringWheel.add(rim, hub);

    const driverHands = new THREE.Group();
    const gloveGeo = new THREE.BoxGeometry(0.08, 0.09, 0.24);
    const handL = new THREE.Mesh(gloveGeo, darkTrimMat);
    handL.position.set(0.15, 0.03, -0.08);
    handL.rotation.y = -0.18;
    const handR = new THREE.Mesh(gloveGeo, darkTrimMat);
    handR.position.set(-0.15, 0.03, -0.08);
    handR.rotation.y = 0.18;
    driverHands.add(handL, handR);
    driverHands.visible = false;
    steeringWheel.add(driverHands);
    car.add(steeringWheel);

    const roofGeo = new THREE.BoxGeometry(1.64, 0.08, 1.98);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 1.46, -0.15);
    car.add(roof);

    // Destructible Windshield
    const windshieldGeo = new THREE.BoxGeometry(1.54, 0.48, 0.08);
    const windshield = new THREE.Mesh(windshieldGeo, carGlassMat);
    windshield.position.set(0, 1.22, 0.88);
    windshield.rotation.x = -0.52;
    car.add(windshield);

    // Destructible Side & Rear Windows
    const sideWinGeo = new THREE.BoxGeometry(1.66, 0.44, 1.68);
    const sideWindows = new THREE.Mesh(sideWinGeo, carGlassMat);
    sideWindows.position.set(0, 1.2, -0.2);
    car.add(sideWindows);

    // Destructible Hood
    const hoodGeo = new THREE.BoxGeometry(1.78, 0.14, 1.25);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.set(0, 0.86, 1.44);
    hood.castShadow = true;
    car.add(hood);

    // Destructible Front & Rear Bumpers
    const bumperGeo = new THREE.BoxGeometry(1.94, 0.24, 0.24);
    const frontBumper = new THREE.Mesh(bumperGeo, darkTrimMat);
    frontBumper.position.set(0, 0.42, 2.12);
    car.add(frontBumper);

    const rearBumper = new THREE.Mesh(bumperGeo, darkTrimMat);
    rearBumper.position.set(0, 0.42, -2.12);
    car.add(rearBumper);

    // Destructible Left & Right Doors
    const doorGeo = new THREE.BoxGeometry(0.1, 0.56, 1.38);
    const leftDoor = new THREE.Mesh(doorGeo, bodyMat);
    leftDoor.position.set(0.94, 0.66, 0.02);
    car.add(leftDoor);

    const rightDoor = new THREE.Mesh(doorGeo, bodyMat);
    rightDoor.position.set(-0.94, 0.66, 0.02);
    car.add(rightDoor);

    const wheels: THREE.Mesh[] = [];
    for (const [wx, wz] of [
      [-0.92, 1.32],
      [0.92, 1.32],
      [-0.92, -1.32],
      [0.92, -1.32],
    ]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, 0.34, wz);
      car.add(w);
      wheels.push(w);
    }

    const lampGeo = new THREE.BoxGeometry(0.32, 0.14, 0.08);
    for (const lx of [-0.62, 0.62]) {
      const hl = new THREE.Mesh(lampGeo, headlightMat);
      hl.position.set(lx, 0.66, 2.02);
      car.add(hl);
      const tl = new THREE.Mesh(lampGeo, taillightMat);
      tl.position.set(lx, 0.66, -2.02);
      car.add(tl);
    }

    group.add(car);
    disposables.push(
      bodyMat,
      chassisGeo,
      dashGeo,
      gaugeGeo,
      pillarGeo,
      seatGeo,
      rimGeo,
      hubGeo,
      gloveGeo,
      roofGeo,
      windshieldGeo,
      sideWinGeo,
      hoodGeo,
      bumperGeo,
      doorGeo,
      lampGeo,
    );

    const halfX = Math.abs(Math.cos(rotY)) * 1.05 + Math.abs(Math.sin(rotY)) * 2.2;
    const halfZ = Math.abs(Math.sin(rotY)) * 1.05 + Math.abs(Math.cos(rotY)) * 2.2;
    const colliderIndex = colliders.length;
    colliders.push({
      minX: cx - halfX,
      maxX: cx + halfX,
      minZ: cz - halfZ,
      maxZ: cz + halfZ,
      height: 1.58,
      vaultable: true,
    });

    // Optional LCPD Police Cruiser Roof Lightbar & White Police Doors
    let lightbarRed: THREE.Mesh | undefined;
    let lightbarBlue: THREE.Mesh | undefined;
    if (isPoliceCruiser) {
      const whiteMat = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        roughness: 0.26,
        metalness: 0.45,
        clearcoat: 0.85,
      });
      leftDoor.material = whiteMat;
      rightDoor.material = whiteMat;
      roof.material = whiteMat;

      const barBaseGeo = new THREE.BoxGeometry(1.18, 0.08, 0.28);
      const barBase = new THREE.Mesh(barBaseGeo, darkTrimMat);
      barBase.position.set(0, 1.54, -0.1);
      car.add(barBase);

      const podGeo = new THREE.BoxGeometry(0.46, 0.11, 0.24);
      const redBarMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.2,
      });
      const blueBarMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.2,
      });
      lightbarRed = new THREE.Mesh(podGeo, redBarMat);
      lightbarRed.position.set(0.32, 1.59, -0.1);
      lightbarBlue = new THREE.Mesh(podGeo, blueBarMat);
      lightbarBlue.position.set(-0.32, 1.59, -0.1);
      car.add(lightbarRed, lightbarBlue);
      disposables.push(whiteMat, barBaseGeo, podGeo, redBarMat, blueBarMat);
    }

    vehicles.push({
      id: isPoliceCruiser ? 'police_cruiser' : `car_${idx}`,
      root: car,
      position: new THREE.Vector3(cx, 0.08, cz),
      yaw: rotY,
      speed: 0,
      steer: 0,
      health: 140,
      windshield,
      sideWindows,
      hood,
      frontBumper,
      rearBumper,
      leftDoor,
      rightDoor,
      steeringWheel,
      driverHands,
      wheels,
      windshieldBroken: false,
      sideWindowsBroken: false,
      hoodDetached: false,
      frontBumperDetached: false,
      rearBumperDetached: false,
      leftDoorDetached: false,
      rightDoorDetached: false,
      colliderIndex,
      locked,
      isNpcTraffic,
      trafficWaypoints: waypoints ?? [],
      trafficWpIndex: 0,
      driverModel,
      lockLed,
      lockLedMat,
      hornCooldown: 0,
      isPoliceCruiser,
      lightbarRed,
      lightbarBlue,
      swerveTimer: 0,
      swerveDir: 1,
      crashCooldown: 0,
    });
  });

  // 11. Wooden Utility Poles with Crossbars, Transformers & Overhead Power Lines
  const utilityCoords: Array<[number, number]> = [
    [-11.2, -32],
    [-11.2, 0],
    [-11.2, 32],
    [11.2, -32],
    [11.2, 0],
    [11.2, 32],
    [-43.2, -32],
    [-43.2, 32],
    [43.2, -32],
    [43.2, 32],
  ];
  const uPoleGeo = new THREE.CylinderGeometry(0.11, 0.16, 7.2, 8);
  const crossArmGeo = new THREE.BoxGeometry(1.9, 0.14, 0.14);
  const transformerGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 10);
  disposables.push(uPoleGeo, crossArmGeo, transformerGeo);

  utilityCoords.forEach(([px, pz], idx) => {
    const pivot = new THREE.Group();
    pivot.position.set(px, 0, pz);

    const poleMesh = new THREE.Mesh(uPoleGeo, woodPoleMat);
    poleMesh.position.y = 3.6;
    poleMesh.castShadow = true;
    pivot.add(poleMesh);

    const arm = new THREE.Mesh(crossArmGeo, woodPoleMat);
    arm.position.set(0, 6.75, 0);
    pivot.add(arm);

    if (idx % 3 === 0) {
      const tr = new THREE.Mesh(transformerGeo, metalMat);
      tr.position.set(0.3, 5.9, 0);
      pivot.add(tr);
    }

    group.add(pivot);
    const colliderIndex = colliders.length;
    colliders.push({
      minX: px - 0.35,
      maxX: px + 0.35,
      minZ: pz - 0.35,
      maxZ: pz + 0.35,
      height: 7.2,
    });

    utilityPoles.push({
      id: `upole_${idx}`,
      pivot,
      wires: [],
      x: px,
      z: pz,
      fallen: false,
      fallAngle: 0,
      fallYaw: 0,
      colliderIndex,
    });
  });

  // Connect sagging overhead power lines between adjacent utility poles
  for (let i = 0; i < utilityPoles.length - 1; i++) {
    const a = utilityPoles[i];
    const b = utilityPoles[i + 1];
    if (Math.abs(a.x - b.x) < 0.5 && Math.abs(a.z - b.z) < 40) {
      for (const armOff of [-0.72, 0.72]) {
        const start = new THREE.Vector3(a.x + armOff, 6.75, a.z);
        const end = new THREE.Vector3(b.x + armOff, 6.75, b.z);
        const mid = start.clone().lerp(end, 0.5);
        mid.y -= 0.75;
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.022, 5, false);
        const wire = new THREE.Mesh(tubeGeo, wireMat);
        group.add(wire);
        disposables.push(tubeGeo);
        a.wires.push(wire);
        b.wires.push(wire);
      }
    }
  }

  // 12. Streetlamps & Dynamic Light Anchors
  const lampSpots: Array<[number, number, number]> = [];
  for (const ax of [-44, -10, 10, 44]) {
    for (const az of [-85, -45, -10, 10, 45, 85]) {
      lampSpots.push([ax, az, ax > 0 ? -Math.PI / 2 : Math.PI / 2]);
      lightAnchors.push({
        x: ax + (ax > 0 ? -1.4 : 1.4),
        y: 5.0,
        z: az,
        color: 0xffc66e,
        intensity: 24,
        distance: 28,
      });
    }
  }

  const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 5.4, 8);
  const armGeo = new THREE.BoxGeometry(0.1, 0.1, 1.5);
  const bulbGeo = new THREE.BoxGeometry(0.34, 0.1, 0.58);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffe2a3,
    emissive: 0xffb84d,
    emissiveIntensity: 2.5,
  });
  disposables.push(poleGeo, armGeo, bulbGeo, bulbMat);

  const poleInst = new THREE.InstancedMesh(poleGeo, metalMat, lampSpots.length);
  const armInst = new THREE.InstancedMesh(armGeo, metalMat, lampSpots.length);
  const bulbInst = new THREE.InstancedMesh(bulbGeo, bulbMat, lampSpots.length);

  lampSpots.forEach(([lx, lz, rot], i) => {
    dummy.position.set(lx, 2.7, lz);
    dummy.rotation.set(0, rot, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    poleInst.setMatrixAt(i, dummy.matrix);

    const dx = Math.sin(rot) * 0.7;
    const dz = Math.cos(rot) * 0.7;
    dummy.position.set(lx + dx, 5.35, lz + dz);
    dummy.updateMatrix();
    armInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx + dx * 1.6, 5.26, lz + dz * 1.6);
    dummy.updateMatrix();
    bulbInst.setMatrixAt(i, dummy.matrix);
  });
  poleInst.computeBoundingSphere();
  armInst.computeBoundingSphere();
  bulbInst.computeBoundingSphere();
  group.add(poleInst, armInst, bulbInst);

  // 13. Perimeter Barriers, North Avenue Concrete Wall (for high-impact intro crash!) & Distant Skyline
  addWall(0, 0, -114.5, 22, 3.8, 1.6, concreteTrimMat);
  const hazardStripeGeo = new THREE.BoxGeometry(20, 0.45, 1.72);
  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    emissive: 0xca8a04,
    emissiveIntensity: 0.45,
    roughness: 0.5,
  });
  const hazardStripe = new THREE.Mesh(hazardStripeGeo, hazardMat);
  hazardStripe.position.set(0, 1.35, -114.5);
  group.add(hazardStripe);
  disposables.push(hazardStripeGeo, hazardMat);
  lightAnchors.push({
    x: 0,
    y: 4.4,
    z: -110,
    color: 0xf59e0b,
    intensity: 26,
    distance: 26,
  });

  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x3b4250,
    roughness: 0.85,
  });
  const barrierGeo = new THREE.BoxGeometry(4.2, 1.1, 0.75);
  disposables.push(barrierMat, barrierGeo);

  const barrierTransforms: Array<[number, number, number]> = [];
  for (let p = -112; p <= 112; p += 12) {
    barrierTransforms.push([p, -118, 0]);
    barrierTransforms.push([p, 118, 0]);
    barrierTransforms.push([-118, p, Math.PI / 2]);
    barrierTransforms.push([118, p, Math.PI / 2]);
  }
  const barrierInst = new THREE.InstancedMesh(
    barrierGeo,
    barrierMat,
    barrierTransforms.length,
  );
  barrierTransforms.forEach(([bx, bz, rot], i) => {
    dummy.position.set(bx, 0.55, bz);
    dummy.rotation.set(0, rot, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    barrierInst.setMatrixAt(i, dummy.matrix);
  });
  barrierInst.computeBoundingSphere();
  group.add(barrierInst);

  const skylineGeo = new THREE.BoxGeometry(1, 1, 1);
  const skylineMat = new THREE.MeshStandardMaterial({
    map: textures.facadeGlassMap,
    color: 0x627794,
    roughness: 0.45,
    metalness: 0.35,
  });
  disposables.push(skylineGeo, skylineMat);

  const skyCount = 48;
  const skylineInst = new THREE.InstancedMesh(skylineGeo, skylineMat, skyCount);
  for (let i = 0; i < skyCount; i++) {
    const angle = (i / skyCount) * Math.PI * 2;
    const radius = 148 + (i % 4) * 18;
    const sx = Math.cos(angle) * radius;
    const sz = Math.sin(angle) * radius;
    const w = 14 + (i % 3) * 6;
    const d = 14 + ((i + 1) % 3) * 6;
    const h = 42 + ((i * 19) % 55);
    dummy.position.set(sx, h / 2, sz);
    dummy.rotation.set(0, angle, 0);
    dummy.scale.set(w, h, d);
    dummy.updateMatrix();
    skylineInst.setMatrixAt(i, dummy.matrix);
  }
  skylineInst.computeBoundingSphere();
  group.add(skylineInst);

  // 13b. Steel Body-Disposal Dumpsters tucked along alleys & storefronts
  const dumpsterBodyMat = new THREE.MeshStandardMaterial({
    color: 0x1b3a2e,
    roughness: 0.72,
    metalness: 0.35,
  });
  const dumpsterBodyGeo = new THREE.BoxGeometry(2.1, 1.15, 1.3);
  const dumpsterLidGeo = new THREE.BoxGeometry(2.14, 0.1, 1.34);
  const dumpsterRailGeo = new THREE.BoxGeometry(2.18, 0.12, 0.14);
  disposables.push(dumpsterBodyMat, dumpsterBodyGeo, dumpsterLidGeo, dumpsterRailGeo);

  const dumpsterSpots: Array<[number, number, number]> = [
    [-13.5, 75, Math.PI / 2],   // Right outside Atelier Vex east alley
    [34.5, 22, -Math.PI / 2],   // Outside 24H Mart alley
    [-37.5, 22, Math.PI / 2],   // Outside Neon Lounge alley
    [38.5, -24, -Math.PI / 2],  // Outside Syndicate Lobby alley
    [-13.5, -22, Math.PI / 2],  // Outside Parking Garage Bay 04
    [13.5, -4, -Math.PI / 2],   // Central Avenue midblock alley
  ];
  dumpsterSpots.forEach(([dx, dz, rotY], idx) => {
    const dGroup = new THREE.Group();
    dGroup.position.set(dx, 0.08, dz);
    dGroup.rotation.y = rotY;

    const body = new THREE.Mesh(dumpsterBodyGeo, dumpsterBodyMat);
    body.position.y = 0.58;
    body.castShadow = true;
    body.receiveShadow = true;
    dGroup.add(body);

    const rail = new THREE.Mesh(dumpsterRailGeo, darkTrimMat);
    rail.position.set(0, 1.02, 0.65);
    dGroup.add(rail);

    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 1.16, -0.65);
    const lid = new THREE.Mesh(dumpsterLidGeo, darkTrimMat);
    lid.position.set(0, 0.05, 0.65);
    lid.castShadow = true;
    lidPivot.add(lid);
    dGroup.add(lidPivot);

    group.add(dGroup);

    const hw = Math.abs(Math.cos(rotY)) * 1.05 + Math.abs(Math.sin(rotY)) * 0.65;
    const hd = Math.abs(Math.sin(rotY)) * 1.05 + Math.abs(Math.cos(rotY)) * 0.65;
    const colliderIndex = colliders.length;
    colliders.push({
      minX: dx - hw,
      maxX: dx + hw,
      minZ: dz - hd,
      maxZ: dz + hd,
      height: 1.32,
    });

    dumpsters.push({
      id: `dumpster_${idx}`,
      position: new THREE.Vector3(dx, 0.08, dz),
      yaw: rotY,
      lidPivot,
      colliderIndex,
    });
  });

  // 13c. WANTED Poster Wall Slots (activated & hung by NPCs once player exits Atelier Vex)
  const wantedPosterMat = new THREE.MeshStandardMaterial({
    map: textures.wantedPosterMap,
    roughness: 0.85,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const wantedPosterGeo = new THREE.PlaneGeometry(0.84, 1.18);
  disposables.push(wantedPosterMat, wantedPosterGeo);

  // [wallX, wallY, wallZ, normalRotY, standOffsetX, standOffsetZ, standYaw]
  const posterSpecs: Array<[number, number, number, number, number, number, number]> = [
    [-16.0, 1.72, 61.5, 0, -16.0, 60.4, 0],            // Boutique North entrance pillar
    [-15.5, 1.72, 68.5, Math.PI / 2, -14.4, 68.5, -Math.PI / 2], // Boutique East exterior wall
    [15.65, 1.72, 24.0, -Math.PI / 2, 14.5, 24.0, Math.PI / 2],  // 24H Corner Mart storefront wall
    [-16.65, 1.72, 26.0, Math.PI / 2, -15.5, 26.0, -Math.PI / 2], // Neon Lounge front wall
    [-14.65, 1.72, -26.0, Math.PI / 2, -13.5, -26.0, -Math.PI / 2], // Garage Bay wall
    [15.65, 1.72, -26.0, -Math.PI / 2, 14.5, -26.0, Math.PI / 2], // Syndicate Lobby wall
  ];
  posterSpecs.forEach(([wx, wy, wz, rotY, sx, sz, syaw], idx) => {
    const mesh = new THREE.Mesh(wantedPosterGeo, wantedPosterMat);
    mesh.position.set(wx, wy, wz);
    mesh.rotation.y = rotY;
    mesh.visible = false;
    group.add(mesh);
    wantedPosters.push({
      id: `wanted_${idx}`,
      mesh,
      wallPos: new THREE.Vector3(wx, wy, wz),
      hangStandPos: new THREE.Vector3(sx, 0, sz),
      hangYaw: syaw,
      posted: false,
    });
  });

  // 14. Named City Zones & Interiors (including all enterable buildings & Hotel Vex)
  const zones: CityZone[] = [
    ...extraZones,
    { name: 'Atelier Vex Boutique (Interior)', minX: -32, maxX: -16, minZ: 65, maxZ: 79 },
    { name: 'Syndicate Tower Lobby (Interior)', minX: 16, maxX: 36, minZ: -36, maxZ: -16 },
    { name: '24H Neon Lounge (Interior)', minX: -35, maxX: -17, minZ: 17, maxZ: 35 },
    { name: '24H Corner Mart (Interior)', minX: 16, maxX: 32, minZ: 16, maxZ: 32 },
    { name: 'Parking Garage Bay 04 (Interior)', minX: -37, maxX: -15, minZ: -37, maxZ: -15 },
    { name: 'Skyline Concrete Overpass', minX: 59, maxX: 69, minZ: -28, maxZ: 28 },
    { name: 'East Cargo Docks', minX: 74, maxX: 118, minZ: -45, maxZ: 45 },
    { name: 'North Hotel District', minX: -60, maxX: 60, minZ: -118, maxZ: -52 },
    { name: 'West Neon Alleyways', minX: -118, maxX: -52, minZ: -60, maxZ: 60 },
    { name: 'South Metro Plaza', minX: -60, maxX: 60, minZ: 52, maxZ: 118 },
    { name: 'Downtown Central Avenue', minX: -52, maxX: 52, minZ: -52, maxZ: 52 },
  ];

  // 15. Populated City NPCs: Boutique Stylist & Shoppers, Civilians, Poster Workers, Store Clerks, Security Guards & Targets
  const npcSpawns: NpcSpawnSpec[] = [
    // Inside Atelier Vex Boutique (Greeted during Boutique Entry Cinematic!)
    {
      id: 'boutique_stylist',
      name: 'Clara (Atelier Vex Stylist)',
      role: 'clerk',
      health: 65,
      voiceName: 'Zephyr',
      isIndoorStore: true,
      storeClerkArchetype: 'beg',
      isBoutiqueResident: true,
      waypoints: [
        new THREE.Vector3(-20.8, 0.14, 74.8),
        new THREE.Vector3(-22.2, 0.14, 74.8),
      ],
    },
    {
      id: 'boutique_shopper_1',
      name: 'Julian (Boutique Patron)',
      role: 'civilian',
      health: 55,
      voiceName: 'Puck',
      isBoutiqueResident: true,
      waypoints: [
        new THREE.Vector3(-26.5, 0.14, 71.5),
        new THREE.Vector3(-25.0, 0.14, 72.5),
      ],
    },
    {
      id: 'boutique_shopper_2',
      name: 'Nadia (Boutique Patron)',
      role: 'civilian',
      health: 55,
      voiceName: 'Kore',
      isBoutiqueResident: true,
      waypoints: [
        new THREE.Vector3(-28.0, 0.14, 69.0),
        new THREE.Vector3(-27.2, 0.14, 70.5),
      ],
    },
    // Poster-hanging street workers & nearby pedestrians
    {
      id: 'civ_poster_1',
      name: 'Victor (Street Handyman)',
      role: 'civilian',
      health: 55,
      voiceName: 'Puck',
      isPosterWorker: true,
      waypoints: [
        new THREE.Vector3(-12.5, 0, 58),
        new THREE.Vector3(-12.5, 0, 40),
        new THREE.Vector3(-14.5, 0, 40),
        new THREE.Vector3(-14.5, 0, 58),
      ],
    },
    {
      id: 'civ_poster_2',
      name: 'Rico (Night Flyer Crew)',
      role: 'civilian',
      health: 55,
      voiceName: 'Puck',
      isPosterWorker: true,
      waypoints: [
        new THREE.Vector3(12.5, 0, 46),
        new THREE.Vector3(12.5, 0, 16),
        new THREE.Vector3(14.5, 0, 16),
        new THREE.Vector3(14.5, 0, 46),
      ],
    },
    // Friendly Civilians strolling nearby sidewalks (talkable with T, flee when violence starts!)
    {
      id: 'civ_1',
      name: 'Marcus (Local Resident)',
      role: 'civilian',
      health: 55,
      voiceName: 'Puck',
      waypoints: [
        new THREE.Vector3(10, 0, 38),
        new THREE.Vector3(10, 0, 14),
        new THREE.Vector3(14, 0, 14),
        new THREE.Vector3(14, 0, 38),
      ],
    },
    {
      id: 'civ_2',
      name: 'Elena (Night Commuter)',
      role: 'civilian',
      health: 55,
      voiceName: 'Zephyr',
      waypoints: [
        new THREE.Vector3(-12, 0, 28),
        new THREE.Vector3(-12, 0, -10),
        new THREE.Vector3(-15, 0, -10),
        new THREE.Vector3(-15, 0, 28),
      ],
    },
    {
      id: 'civ_3',
      name: 'Devon (Courier)',
      role: 'civilian',
      health: 55,
      voiceName: 'Puck',
      waypoints: [
        new THREE.Vector3(-8, 0, -24),
        new THREE.Vector3(8, 0, -24),
        new THREE.Vector3(8, 0, -40),
        new THREE.Vector3(-8, 0, -40),
      ],
    },
    {
      id: 'civ_4',
      name: 'Maya (Street Photographer)',
      role: 'civilian',
      health: 55,
      voiceName: 'Zephyr',
      waypoints: [
        new THREE.Vector3(-36, 0, 12),
        new THREE.Vector3(-16, 0, 12),
        new THREE.Vector3(-16, 0, 8),
        new THREE.Vector3(-36, 0, 8),
      ],
    },
    // Store Clerks inside 24H Corner Mart & 24H Neon Lounge (one threatens with shotgun, one begs/flees!)
    {
      id: 'clerk_mart',
      name: 'Hank (24H Mart Clerk)',
      role: 'clerk',
      health: 75,
      voiceName: 'Charon',
      isIndoorStore: true,
      storeClerkArchetype: 'threaten',
      waypoints: [
        new THREE.Vector3(27.5, 0.14, 29.5),
        new THREE.Vector3(25.0, 0.14, 29.5),
      ],
    },
    {
      id: 'clerk_lounge',
      name: 'Leo (Lounge Bartender)',
      role: 'clerk',
      health: 65,
      voiceName: 'Puck',
      isIndoorStore: true,
      storeClerkArchetype: 'beg',
      waypoints: [
        new THREE.Vector3(-29.5, 0.14, 31.5),
        new THREE.Vector3(-26.5, 0.14, 31.5),
      ],
    },
    // Guards & Enforcers (Treat player as a normal citizen until player kills someone / causes mayhem!)
    {
      id: 'npc_1',
      name: 'Avenue Security',
      role: 'guard',
      health: 80,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(-4, 0, 24),
        new THREE.Vector3(-4, 0, 6),
        new THREE.Vector3(4, 0, 6),
        new THREE.Vector3(4, 0, 24),
      ],
    },
    {
      id: 'npc_2',
      name: 'Central Lookout',
      role: 'guard',
      health: 80,
      voiceName: 'Puck',
      waypoints: [
        new THREE.Vector3(-5, 0, -8),
        new THREE.Vector3(-5, 0, -34),
        new THREE.Vector3(5, 0, -34),
        new THREE.Vector3(5, 0, -8),
      ],
    },
    {
      id: 'npc_3',
      name: 'Lobby Guard',
      role: 'guard',
      health: 85,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(22, 0.14, -22),
        new THREE.Vector3(31, 0.14, -22),
        new THREE.Vector3(31, 0.14, -31),
        new THREE.Vector3(22, 0.14, -31),
      ],
    },
    {
      id: 'npc_4',
      name: 'Garage Attendant',
      role: 'guard',
      health: 85,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(-21, 0.14, -19),
        new THREE.Vector3(-32, 0.14, -19),
        new THREE.Vector3(-26, 0.14, -33),
      ],
    },
    {
      id: 'npc_5',
      name: 'Overpass Heavy',
      role: 'heavy',
      health: 135,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(64, 3.4, -10),
        new THREE.Vector3(64, 3.4, 10),
      ],
    },
    // 3 High-Value Syndicate Contract Targets
    {
      id: 'target_1',
      name: 'Director Vance',
      role: 'target',
      health: 125,
      voiceName: 'Kore',
      waypoints: [
        new THREE.Vector3(26, 0.14, -28),
        new THREE.Vector3(32, 0.14, -28),
        new THREE.Vector3(32, 0.14, -21),
        new THREE.Vector3(24, 0.14, -21),
      ],
    },
    {
      id: 'target_2',
      name: 'Broker Sera',
      role: 'target',
      health: 115,
      voiceName: 'Zephyr',
      waypoints: [
        new THREE.Vector3(-26, 0.14, 24),
        new THREE.Vector3(-20, 0.14, 24),
        new THREE.Vector3(-22, 0.14, 20),
      ],
    },
    {
      id: 'target_3',
      name: 'Captain Kade',
      role: 'target',
      health: 145,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(78, 0, -10),
        new THREE.Vector3(92, 0, -10),
        new THREE.Vector3(92, 0, 12),
        new THREE.Vector3(78, 0, 12),
      ],
    },
    // Hotel Vex Concierge & Guest Wing Guard
    {
      id: 'hotel_concierge',
      name: 'Arthur (Hotel Vex Concierge)',
      role: 'clerk',
      health: 65,
      voiceName: 'Charon',
      isIndoorStore: true,
      storeClerkArchetype: 'beg',
      waypoints: [
        new THREE.Vector3(-26, 0.14, -78.4),
        new THREE.Vector3(-25.4, 0.14, -78.4),
      ],
    },
    {
      id: 'hotel_guard',
      name: 'Suite 204 Security',
      role: 'guard',
      health: 95,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(-26, 0.14, -84.0),
        new THREE.Vector3(-26, 0.14, -96.5),
      ],
    },
  ];

  return {
    group,
    colliders,
    walkables,
    lightAnchors,
    zones,
    vehicles,
    destructibleGlass,
    utilityPoles,
    dumpsters,
    wantedPosters,
    hotelVex,
    npcSpawns,
    disposables,
  };
}
