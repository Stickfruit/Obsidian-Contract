import * as THREE from 'three';
import type {
  CityCollider,
  CityLightAnchor,
  CityZone,
  WalkableSurface,
} from '../types/game';
import {
  type BirdPerchSpec,
  type CityBuildResult,
  type DriveableVehicleSpec,
  type ExtraMissionSpot,
  type HotelVexSpec,
  type NpcSpawnSpec,
  type PlaneWallBounds,
  createDriveableVehicle,
  createPolicePrecinct,
} from './cityBuilder';
import { createNeonSignTexture, type ProceduralTextureSet } from './textures';

function createStubHotelVex(): HotelVexSpec {
  const dummyObj = new THREE.Group();
  const dummyMesh = new THREE.Mesh();
  const dummyDoorMat = new THREE.MeshBasicMaterial();
  const stubDoor = {
    roomId: '201' as const,
    pivot: dummyObj,
    lockLedMat: dummyDoorMat,
    colliderIndex: -1,
    unlocked: false,
    doorPos: new THREE.Vector3(0, -100, 0),
  };
  return {
    deskPos: new THREE.Vector3(0, -100, 0),
    conciergePos: new THREE.Vector3(0, -100, 0),
    elevatorPos: new THREE.Vector3(0, -100, 0),
    floorY: [0, 5, 10, 15, 20, 25],
    elevatorCabinGroup: dummyObj,
    elevatorDoorL: dummyMesh,
    elevatorDoorR: dummyMesh,
    rooms: { '201': stubDoor, '202': stubDoor, '203': stubDoor },
    suite204Door: { ...stubDoor, roomId: '204' },
    ledgerMesh: dummyMesh,
    ledgerPos: new THREE.Vector3(0, -100, 0),
    ledgerStolen: false,
  };
}

export function buildCoastMap(textures: ProceduralTextureSet): CityBuildResult {
  const group = new THREE.Group();
  const colliders: CityCollider[] = [];
  const walkables: WalkableSurface[] = [];
  const lightAnchors: CityLightAnchor[] = [];
  const vehicles: DriveableVehicleSpec[] = [];
  const disposables: Array<{ dispose: () => void }> = [];
  const zones: CityZone[] = [];
  const birdPerches: BirdPerchSpec[] = [];
  const extraMissions: ExtraMissionSpot[] = [];

  // 1. Wide Coastal Boulevard Asphalt + Broad Sandy Beach + Deep Animated Ocean
  const asphaltGeo = new THREE.PlaneGeometry(360, 190);
  const asphaltMat = new THREE.MeshStandardMaterial({
    map: textures.asphaltMap,
    roughnessMap: textures.asphaltRoughness,
    roughness: 0.68,
    metalness: 0.14,
  });
  const road = new THREE.Mesh(asphaltGeo, asphaltMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, -75);
  road.receiveShadow = true;
  group.add(road);

  const sandGeo = new THREE.PlaneGeometry(380, 56);
  const sandMat = new THREE.MeshStandardMaterial({
    color: 0xd6b87c,
    roughness: 0.92,
    metalness: 0.02,
  });
  const beach = new THREE.Mesh(sandGeo, sandMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(0, -0.02, 36);
  beach.receiveShadow = true;
  group.add(beach);

  // High-segment Ocean plane for vertex wave animation in engine!
  const oceanGeo = new THREE.PlaneGeometry(460, 280, 56, 40);
  oceanGeo.rotateX(-Math.PI / 2);
  const oceanMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b4f6c,
    emissive: 0x042436,
    emissiveIntensity: 0.35,
    roughness: 0.16,
    metalness: 0.32,
    clearcoat: 0.9,
    transparent: true,
    opacity: 0.9,
  });
  const oceanWaterMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanWaterMesh.position.set(0, -0.24, 195);
  oceanWaterMesh.receiveShadow = true;
  group.add(oceanWaterMesh);

  // White surf foam strip along shoreline (z = 60.5)
  const foamGeo = new THREE.BoxGeometry(360, 0.05, 3.0);
  const foamMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0xbae6fd,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.72,
  });
  const foam = new THREE.Mesh(foamGeo, foamMat);
  foam.position.set(0, -0.1, 60.5);
  group.add(foam);

  // Boardwalk West Charter Pier (-28, z = 42..92) + East Fishing Pier & Lighthouse (56, z = 44..102)
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x6b4423,
    roughness: 0.88,
  });
  const pierGeo = new THREE.BoxGeometry(8.8, 0.32, 50);
  const westPier = new THREE.Mesh(pierGeo, woodMat);
  westPier.position.set(-28, 0.38, 67);
  westPier.castShadow = true;
  westPier.receiveShadow = true;
  group.add(westPier);
  walkables.push({
    minX: -32.4,
    maxX: -23.6,
    minZ: 42,
    maxZ: 92,
    yStart: 0.54,
    yEnd: 0.54,
    axis: 'flat',
  });

  const eastPierGeo = new THREE.BoxGeometry(7.6, 0.32, 58);
  const eastPier = new THREE.Mesh(eastPierGeo, woodMat);
  eastPier.position.set(56, 0.38, 73);
  eastPier.castShadow = true;
  eastPier.receiveShadow = true;
  group.add(eastPier);
  walkables.push({
    minX: 52.2,
    maxX: 59.8,
    minZ: 44,
    maxZ: 102,
    yStart: 0.54,
    yEnd: 0.54,
    axis: 'flat',
  });

  // Coastal Lighthouse Tower at East Pier End (56, 0, 100)
  const lhBaseGeo = new THREE.CylinderGeometry(2.2, 3.0, 16, 12);
  const lhMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
  const lhTopMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 2.6 });
  const lh = new THREE.Mesh(lhBaseGeo, lhMat);
  lh.position.set(56, 8.2, 100);
  lh.castShadow = true;
  const lhLampGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.8, 12);
  const lhLamp = new THREE.Mesh(lhLampGeo, lhTopMat);
  lhLamp.position.set(56, 17.0, 100);
  group.add(lh, lhLamp);
  colliders.push({ minX: 53.2, maxX: 58.8, minZ: 97.2, maxZ: 102.8, height: 18 });

  // Smuggler Contraband Crate Side Mission on West Pier (-28, 0.54, 56)
  const smuggleCrateGeo = new THREE.BoxGeometry(0.95, 0.72, 0.95);
  const smuggleCrateMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    emissive: 0x0284c7,
    emissiveIntensity: 1.5,
    metalness: 0.5,
  });
  const smuggleMesh = new THREE.Mesh(smuggleCrateGeo, smuggleCrateMat);
  smuggleMesh.position.set(-28, 0.92, 56);
  const smuggleRingGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.06, 16);
  const smuggleRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const smuggleRing = new THREE.Mesh(smuggleRingGeo, smuggleRingMat);
  smuggleRing.position.set(-28, 0.56, 56);
  group.add(smuggleMesh, smuggleRing);
  extraMissions.push({
    id: 'coast_smuggler',
    pos: new THREE.Vector3(-28, 0.54, 56),
    mesh: smuggleMesh,
    ringMesh: smuggleRing,
    rewardCash: 500,
    completed: false,
  });

  // Palm Trees along expanded Coastal Promenade (-138..138)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.92 });
  const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.34, 6.2, 8);
  const frondGeo = new THREE.BoxGeometry(0.45, 0.12, 3.2);
  for (let px = -138; px <= 138; px += 20) {
    if (Math.abs(px) < 12) continue;
    const palm = new THREE.Group();
    palm.position.set(px, 0, 14.5);
    const t = new THREE.Mesh(trunkGeo, trunkMat);
    t.position.y = 3.1;
    t.rotation.z = (px % 2 === 0 ? 1 : -1) * 0.08;
    t.castShadow = true;
    palm.add(t);
    for (let f = 0; f < 6; f++) {
      const frond = new THREE.Mesh(frondGeo, palmLeafMat);
      frond.position.set(0, 6.1, 0);
      frond.rotation.y = (f / 6) * Math.PI * 2;
      frond.rotation.x = 0.28;
      palm.add(frond);
    }
    group.add(palm);
    colliders.push({
      minX: px - 0.5,
      maxX: px + 0.5,
      minZ: 14.0,
      maxZ: 15.0,
      height: 6.5,
    });
    birdPerches.push({ position: new THREE.Vector3(px, 6.4, 14.5), rooftop: true });
  }

  // Resort Villas, Beach Shack Bar & Promenade Structures along z = -28
  const shackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
  const villaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.52 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  for (const sx of [-96, -54, 46, 94]) {
    const wallGeo = new THREE.BoxGeometry(16, 4.8, 13);
    const sh = new THREE.Mesh(wallGeo, sx < -70 || sx > 70 ? villaMat : shackMat);
    sh.position.set(sx, 2.4, -26);
    sh.castShadow = true;
    group.add(sh);
    disposables.push(wallGeo);
    colliders.push({
      minX: sx - 8,
      maxX: sx + 8,
      minZ: -32.5,
      maxZ: -19.5,
      height: 5.0,
    });
  }

  // Return Seaplane Charter Counter at West Pier Tip (-28, 0.54, 86)
  const boothGeo = new THREE.BoxGeometry(3.2, 1.05, 1.4);
  const booth = new THREE.Mesh(boothGeo, trimMat);
  booth.position.set(-28, 1.06, 86);
  group.add(booth);
  const charterTex = createNeonSignTexture('CHARTER FLIGHT · RETURN', '#fbbf24');
  const charterMat = new THREE.MeshStandardMaterial({
    map: charterTex,
    emissive: 0xfbbf24,
    emissiveMap: charterTex,
    emissiveIntensity: 1.8,
  });
  const charterSignGeo = new THREE.BoxGeometry(4.4, 1.0, 0.2);
  const charterSign = new THREE.Mesh(charterSignGeo, charterMat);
  charterSign.position.set(-28, 3.2, 87);
  group.add(charterSign);
  const mapReturnPos = new THREE.Vector3(-28, 0.54, 83.6);

  // Coastal Police Station (accessible on every map!) at (0, 0, -28)
  const coastPolice = createPolicePrecinct(
    0,
    0,
    -28,
    textures,
    group,
    colliders,
    walkables,
    lightAnchors,
    disposables,
    false,
  );
  zones.push(
    coastPolice.zone,
    { name: 'Solstice Sandy Beach', minX: -160, maxX: 160, minZ: 12, maxZ: 64 },
    { name: 'Coastal Boardwalk Pier', minX: -35, maxX: -20, minZ: 40, maxZ: 94 },
    { name: 'East Lighthouse Pier', minX: 50, maxX: 62, minZ: 42, maxZ: 104 },
    { name: 'Coastal Ocean Boulevard', minX: -160, maxX: 160, minZ: -140, maxZ: 12 },
  );

  // Diverse Coastal Vehicles + Moving Coastal Boulevard Traffic
  const coastCars = [
    { id: 'coast_pickup', x: -16, z: 4, rotY: Math.PI / 2, locked: false, variant: 'pickup' as const, color: 0x0f766e, isNpcTraffic: false },
    { id: 'coast_coupe', x: 24, z: 4, rotY: -Math.PI / 2, locked: true, variant: 'coupe' as const, color: 0x991b1b, isNpcTraffic: false },
    { id: 'coast_suv', x: -42, z: -6, rotY: 0, locked: false, variant: 'suv' as const, color: 0x1e3a8a, isNpcTraffic: false },
    { id: 'coast_van', x: 76, z: -8, rotY: Math.PI, locked: false, variant: 'van' as const, color: 0xe2e8f0, isNpcTraffic: false },
    { id: 'coast_police', x: 14, z: -20, rotY: Math.PI, locked: true, variant: 'police' as const, color: 0x0f172a, isPoliceCruiser: true, isNpcTraffic: false },
    {
      id: 'car_coast_traffic_1',
      x: -110,
      z: -6,
      rotY: Math.PI / 2,
      locked: true,
      variant: 'sedan' as const,
      color: 0x3b82f6,
      isNpcTraffic: true,
      waypoints: [
        new THREE.Vector3(-120, 0.08, -6),
        new THREE.Vector3(120, 0.08, -6),
        new THREE.Vector3(120, 0.08, 6),
        new THREE.Vector3(-120, 0.08, 6),
      ],
    },
    {
      id: 'car_coast_traffic_2',
      x: 110,
      z: 6,
      rotY: -Math.PI / 2,
      locked: true,
      variant: 'muscle' as const,
      color: 0xf97316,
      isNpcTraffic: true,
      waypoints: [
        new THREE.Vector3(120, 0.08, 6),
        new THREE.Vector3(-120, 0.08, 6),
        new THREE.Vector3(-120, 0.08, -6),
        new THREE.Vector3(120, 0.08, -6),
      ],
    },
  ];
  for (const spot of coastCars) {
    vehicles.push(
      createDriveableVehicle(
        spot,
        textures,
        group,
        colliders,
        disposables,
      ),
    );
  }

  lightAnchors.push(
    { x: -28, y: 4.2, z: 72, color: 0xfde68a, intensity: 28, distance: 34 },
    { x: 56, y: 17.2, z: 100, color: 0xfef08a, intensity: 40, distance: 48 },
    { x: 0, y: 4.5, z: 16, color: 0xfdba74, intensity: 28, distance: 35 },
    { x: 35, y: 4.5, z: 16, color: 0x38bdf8, intensity: 26, distance: 32 },
  );

  const npcSpawns: NpcSpawnSpec[] = [
    {
      id: 'coast_cop_desk',
      name: 'Officer Reyes (Coast PD)',
      role: 'police',
      health: 120,
      voiceName: 'Charon',
      isIndoorStore: true,
      waypoints: [coastPolice.officerSpawnPos.clone(), coastPolice.officerSpawnPos.clone().add(new THREE.Vector3(0.5, 0, 0))],
    },
    {
      id: 'coast_beach_civ_1',
      name: 'Maya (Beachcomber)',
      role: 'civilian',
      health: 55,
      voiceName: 'Zephyr',
      waypoints: [new THREE.Vector3(-12, 0, 34), new THREE.Vector3(18, 0, 36)],
    },
    {
      id: 'coast_beach_civ_2',
      name: 'Devon (Surfer)',
      role: 'civilian',
      health: 55,
      voiceName: 'Puck',
      waypoints: [new THREE.Vector3(24, 0, 44), new THREE.Vector3(-8, 0, 46)],
    },
    {
      id: 'coast_beach_civ_3',
      name: 'Lana (Resort Tourist)',
      role: 'civilian',
      health: 55,
      voiceName: 'Kore',
      waypoints: [new THREE.Vector3(-76, 0, 26), new THREE.Vector3(-42, 0, 32)],
    },
    {
      id: 'coast_guard_1',
      name: 'Cartel Beach Lookout',
      role: 'guard',
      health: 95,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(38, 0, 28), new THREE.Vector3(62, 0, 42)],
    },
    {
      id: 'coast_guard_2',
      name: 'Pier Enforcer',
      role: 'guard',
      health: 95,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(-28, 0.54, 48), new THREE.Vector3(-28, 0.54, 68)],
    },
    {
      id: 'coast_guard_3',
      name: 'Lighthouse Watchman',
      role: 'guard',
      health: 95,
      voiceName: 'Puck',
      waypoints: [new THREE.Vector3(56, 0.54, 54), new THREE.Vector3(56, 0.54, 88)],
    },
    {
      id: 'coast_brawler_1',
      name: 'Tanner (Boardwalk Drifter)',
      role: 'civilian',
      health: 60,
      voiceName: 'Puck',
      waypoints: [new THREE.Vector3(-18, 0, 18), new THREE.Vector3(12, 0, 18)],
    },
  ];

  disposables.push(
    asphaltGeo,
    asphaltMat,
    sandGeo,
    sandMat,
    oceanGeo,
    oceanMat,
    foamGeo,
    foamMat,
    woodMat,
    pierGeo,
    eastPierGeo,
    lhBaseGeo,
    lhMat,
    lhTopMat,
    lhLampGeo,
    smuggleCrateGeo,
    smuggleCrateMat,
    smuggleRingGeo,
    smuggleRingMat,
    trunkMat,
    palmLeafMat,
    trunkGeo,
    frondGeo,
    shackMat,
    villaMat,
    trimMat,
    boothGeo,
    charterTex,
    charterMat,
    charterSignGeo,
  );

  return {
    group,
    colliders,
    walkables,
    lightAnchors,
    zones,
    vehicles,
    destructibleGlass: [],
    utilityPoles: [],
    dumpsters: [],
    wantedPosters: [],
    hotelVex: createStubHotelVex(),
    houses: [],
    birdPerches,
    barWinePos: new THREE.Vector3(0, -100, 0),
    villaTablePos: new THREE.Vector3(0, -100, 0),
    npcSpawns,
    disposables,
    mapBounds: { minX: -158, maxX: 158, minZ: -135, maxZ: 120 },
    policeDeskPos: coastPolice.policeDeskPos,
    holdingCellPos: coastPolice.holdingCellPos,
    cellBailPos: coastPolice.cellBailPos,
    cellReleasePos: coastPolice.cellReleasePos,
    cellDoorMesh: coastPolice.cellDoorMesh,
    cellDoorColliderIndex: coastPolice.cellDoorColliderIndex,
    mapReturnPos,
    extraMissions,
    oceanShoreZ: 56,
    oceanWaterMesh,
  };
}

export function buildSkyCityMap(textures: ProceduralTextureSet): CityBuildResult {
  const group = new THREE.Group();
  const colliders: CityCollider[] = [];
  const walkables: WalkableSurface[] = [];
  const lightAnchors: CityLightAnchor[] = [];
  const vehicles: DriveableVehicleSpec[] = [];
  const disposables: Array<{ dispose: () => void }> = [];
  const zones: CityZone[] = [];
  const extraMissions: ExtraMissionSpot[] = [];

  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    roughness: 0.35,
    metalness: 0.2,
  });
  const glassBridgeMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.12,
    metalness: 0.25,
    transparent: true,
    opacity: 0.72,
    clearcoat: 0.95,
  });
  const neonEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 2.0,
  });
  const spireMat = new THREE.MeshStandardMaterial({
    map: textures.facadeGlassMap,
    roughness: 0.24,
    metalness: 0.65,
  });
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    emissive: 0x334155,
    emissiveIntensity: 0.25,
    roughness: 0.95,
    transparent: true,
    opacity: 0.88,
  });

  const addIsland = (x: number, z: number, w: number, d: number, topY = 0) => {
    const geo = new THREE.BoxGeometry(w, 2.6, d);
    const island = new THREE.Mesh(geo, marbleMat);
    island.position.set(x, topY - 1.3, z);
    island.receiveShadow = true;
    island.castShadow = true;
    group.add(island);

    const trimGeo = new THREE.BoxGeometry(w + 0.3, 0.22, d + 0.3);
    const trim = new THREE.Mesh(trimGeo, neonEdgeMat);
    trim.position.set(x, topY - 0.15, z);
    group.add(trim);
    disposables.push(geo, trimGeo);

    walkables.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      yStart: topY,
      yEnd: topY,
      axis: 'flat',
    });
  };

  // Expanded 8-Island Sky Archipelago (spanning -95..+95) with open sheer-drop skybridges!
  addIsland(0, 0, 48, 48, 0);        // Central Sky Plaza
  addIsland(0, -60, 34, 30, 0);      // North Police Citadel
  addIsland(60, 0, 34, 34, 0);       // East Skyport
  addIsland(-60, 0, 34, 34, 0);      // West Luxury Citadel
  addIsland(60, -60, 32, 32, 0);     // NE Observatory Island
  addIsland(60, 60, 30, 30, 0);      // SE Helipad Overlook
  addIsland(-60, 60, 30, 30, 0);     // SW Garden Pavilion
  addIsland(0, 60, 28, 28, 0);       // South High-Dive Plunge Overlook

  // Connecting Open-Air Glass Skybridges (NO side guardrails in middle -> instant vertical plunge hazard!)
  const bridges: Array<[number, number, number, number]> = [
    [0, -34.5, 6.4, 21],
    [33.5, 0, 21, 6.4],
    [-33.5, 0, 21, 6.4],
    [0, 35, 6.4, 22],
    [60, -30, 6.0, 26],
    [30, -60, 26, 6.0],
    [60, 31, 6.0, 28],
    [29, 60, 30, 6.0],
    [-29, 60, 30, 6.0],
  ];
  for (const [bx, bz, bw, bd] of bridges) {
    const bGeo = new THREE.BoxGeometry(bw, 0.35, bd);
    const bMesh = new THREE.Mesh(bGeo, glassBridgeMat);
    bMesh.position.set(bx, -0.18, bz);
    bMesh.receiveShadow = true;
    group.add(bMesh);
    disposables.push(bGeo);
    walkables.push({
      minX: bx - bw / 2,
      maxX: bx + bw / 2,
      minZ: bz - bd / 2,
      maxZ: bz + bd / 2,
      yStart: 0,
      yEnd: 0,
      axis: 'flat',
    });
  }

  // Dense Cloud Sea Deck Below (y = -22..-34) completely obscuring the street impact stage until fall cut!
  const cloudGeo = new THREE.SphereGeometry(1, 10, 8);
  for (let i = 0; i < 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    const rad = 18 + (i % 6) * 26;
    const puff = new THREE.Mesh(cloudGeo, cloudMat);
    puff.position.set(Math.cos(angle) * rad, -22 - (i % 3) * 4, Math.sin(angle) * rad);
    puff.scale.set(22 + (i % 4) * 6, 5.2, 20 + (i % 3) * 7);
    group.add(puff);
  }

  // HIDDEN DOWNTOWN STREET IMPACT STAGE (y = -115, x = 0, z = 0)
  // Rendered ONLY when 'fall_plunge_wasted' cuts camera down below the clouds!
  const stageY = -115;
  const stageRoadGeo = new THREE.PlaneGeometry(110, 110);
  const stageRoadMat = new THREE.MeshStandardMaterial({
    map: textures.asphaltMap,
    roughnessMap: textures.asphaltRoughness,
    roughness: 0.72,
    metalness: 0.12,
  });
  const stageRoad = new THREE.Mesh(stageRoadGeo, stageRoadMat);
  stageRoad.rotation.x = -Math.PI / 2;
  stageRoad.position.set(0, stageY, 0);
  stageRoad.receiveShadow = true;
  group.add(stageRoad);

  const stageStripeMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xca8a04,
    emissiveIntensity: 0.35,
  });
  const stageStripeGeo = new THREE.BoxGeometry(0.24, 0.04, 3.2);
  for (let sz = -28; sz <= 28; sz += 6.5) {
    const stripe = new THREE.Mesh(stageStripeGeo, stageStripeMat);
    stripe.position.set(0, stageY + 0.02, sz);
    group.add(stripe);
  }
  const stageCurbGeo = new THREE.BoxGeometry(8, 0.28, 86);
  const stageCurbMat = new THREE.MeshStandardMaterial({ map: textures.sidewalkMap, color: 0x64748b, roughness: 0.85 });
  const stageSideL = new THREE.Mesh(stageCurbGeo, stageCurbMat);
  stageSideL.position.set(-13, stageY + 0.14, 0);
  const stageSideR = new THREE.Mesh(stageCurbGeo, stageCurbMat);
  stageSideR.position.set(13, stageY + 0.14, 0);
  group.add(stageSideL, stageSideR);

  const stageBldgGeo = new THREE.BoxGeometry(16, 36, 20);
  const stageBldg1 = new THREE.Mesh(stageBldgGeo, spireMat);
  stageBldg1.position.set(-22, stageY + 18, -14);
  const stageBldg2 = new THREE.Mesh(stageBldgGeo, spireMat);
  stageBldg2.position.set(22, stageY + 18, -16);
  group.add(stageBldg1, stageBldg2);

  // Local street lighting for crisp high-altitude crash shot
  const stageLight = new THREE.PointLight(0xfde68a, 42, 45, 1.4);
  stageLight.position.set(2.5, stageY + 6.5, 3.0);
  group.add(stageLight);

  // Futuristic Spires & NE Observatory Structure
  for (const [tx, tz, th] of [
    [-68, -10, 30],
    [-68, 10, 24],
    [-19, 19, 20],
    [19, 19, 22],
    [-66, 66, 16],
    [68, 68, 14],
  ]) {
    const tGeo = new THREE.BoxGeometry(7, th, 7);
    const tMesh = new THREE.Mesh(tGeo, spireMat);
    tMesh.position.set(tx, th / 2, tz);
    tMesh.castShadow = true;
    group.add(tMesh);
    disposables.push(tGeo);
    colliders.push({
      minX: tx - 3.5,
      maxX: tx + 3.5,
      minZ: tz - 3.5,
      maxZ: tz + 3.5,
      height: th,
    });
  }

  // NE Observatory Dish & Relay Data Terminal Mission (`sky_relay`)
  const obsDomeGeo = new THREE.SphereGeometry(4.5, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const obsDome = new THREE.Mesh(obsDomeGeo, marbleMat);
  obsDome.position.set(62, 0, -68);
  group.add(obsDome);
  colliders.push({ minX: 57.5, maxX: 66.5, minZ: -72.5, maxZ: -63.5, height: 5 });

  const relayTermGeo = new THREE.BoxGeometry(1.1, 1.4, 0.8);
  const relayTermMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.9,
  });
  const relayMesh = new THREE.Mesh(relayTermGeo, relayTermMat);
  relayMesh.position.set(62, 0.72, -57);
  const relayRingGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.06, 16);
  const relayRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const relayRing = new THREE.Mesh(relayRingGeo, relayRingMat);
  relayRing.position.set(62, 0.06, -57);
  group.add(relayMesh, relayRing);
  extraMissions.push({
    id: 'sky_relay',
    pos: new THREE.Vector3(62, 0, -57),
    mesh: relayMesh,
    ringMesh: relayRing,
    rewardCash: 750,
    completed: false,
  });

  // Accessible Sky Police Station on North Island (0, 0, -64)
  const skyPolice = createPolicePrecinct(
    0,
    0,
    -64,
    textures,
    group,
    colliders,
    walkables,
    lightAnchors,
    disposables,
    false,
  );

  // East Island Skyport Return Gate Terminal (60, 0, 0)
  const gateGeo = new THREE.BoxGeometry(2.6, 1.1, 3.6);
  const gateMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const gateCounter = new THREE.Mesh(gateGeo, gateMat);
  gateCounter.position.set(63.5, 0.55, 0);
  group.add(gateCounter);
  const skySignTex = createNeonSignTexture('AETHER SKYPORT · RETURN', '#38bdf8');
  const skySignMat = new THREE.MeshStandardMaterial({
    map: skySignTex,
    emissive: 0x38bdf8,
    emissiveMap: skySignTex,
    emissiveIntensity: 2.0,
  });
  const skySignGeo = new THREE.BoxGeometry(0.24, 1.3, 6.4);
  const skySign = new THREE.Mesh(skySignGeo, skySignMat);
  skySign.position.set(64.5, 3.4, 0);
  group.add(skySign);
  const mapReturnPos = new THREE.Vector3(60.5, 0, 0);

  // Sky Plaza & Helipad Vehicles
  vehicles.push(
    createDriveableVehicle(
      { id: 'sky_muscle', x: 8, z: -12, rotY: 0, locked: false, isNpcTraffic: false, variant: 'muscle', color: 0xf59e0b },
      textures,
      group,
      colliders,
      disposables,
    ),
    createDriveableVehicle(
      { id: 'sky_suv', x: 56, z: 58, rotY: Math.PI, locked: false, isNpcTraffic: false, variant: 'suv', color: 0x0284c7 },
      textures,
      group,
      colliders,
      disposables,
    ),
    createDriveableVehicle(
      { id: 'sky_police', x: -12, z: -50, rotY: Math.PI / 2, locked: true, isNpcTraffic: false, isPoliceCruiser: true, color: 0x0f172a },
      textures,
      group,
      colliders,
      disposables,
    ),
  );

  zones.push(
    skyPolice.zone,
    { name: 'Aether Central Sky Plaza', minX: -25, maxX: 25, minZ: -25, maxZ: 25 },
    { name: 'East Skyport Terminal', minX: 43, maxX: 77, minZ: -17, maxZ: 17 },
    { name: 'West Cloud Citadel', minX: -77, maxX: -43, minZ: -17, maxZ: 17 },
    { name: 'Aether Observatory Deck', minX: 44, maxX: 76, minZ: -76, maxZ: -44 },
    { name: 'South High-Dive Platform', minX: -14, maxX: 14, minZ: 46, maxZ: 74 },
  );

  lightAnchors.push(
    { x: 0, y: 5.5, z: 0, color: 0xe0f2fe, intensity: 34, distance: 44 },
    { x: 60, y: 5.0, z: 0, color: 0x38bdf8, intensity: 30, distance: 34 },
    { x: 60, y: 5.0, z: -60, color: 0x38bdf8, intensity: 30, distance: 34 },
    { x: -60, y: 5.0, z: 0, color: 0xfbbf24, intensity: 30, distance: 34 },
  );

  const npcSpawns: NpcSpawnSpec[] = [
    {
      id: 'sky_cop',
      name: 'Lt. Vance (Sky Precinct)',
      role: 'police',
      health: 120,
      voiceName: 'Charon',
      isIndoorStore: true,
      waypoints: [skyPolice.officerSpawnPos.clone(), skyPolice.officerSpawnPos.clone().add(new THREE.Vector3(0.4, 0, 0))],
    },
    {
      id: 'sky_civ_1',
      name: 'Clara S. (Sky Resident)',
      role: 'civilian',
      health: 55,
      voiceName: 'Zephyr',
      waypoints: [new THREE.Vector3(-8, 0, 8), new THREE.Vector3(10, 0, -6)],
    },
    {
      id: 'sky_civ_2',
      name: 'Jonas (Sky Broker)',
      role: 'civilian',
      health: 55,
      voiceName: 'Puck',
      waypoints: [new THREE.Vector3(12, 0, 6), new THREE.Vector3(-10, 0, -10)],
    },
    {
      id: 'sky_guard_1',
      name: 'Aether Sentinel',
      role: 'guard',
      health: 95,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(-52, 0, 8), new THREE.Vector3(-52, 0, -8)],
    },
    {
      id: 'sky_guard_2',
      name: 'Observatory Tech Guard',
      role: 'guard',
      health: 95,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(52, 0, -54), new THREE.Vector3(68, 0, -54)],
    },
  ];

  disposables.push(
    marbleMat,
    glassBridgeMat,
    neonEdgeMat,
    spireMat,
    cloudMat,
    cloudGeo,
    stageRoadGeo,
    stageRoadMat,
    stageStripeMat,
    stageStripeGeo,
    stageCurbGeo,
    stageCurbMat,
    stageBldgGeo,
    obsDomeGeo,
    relayTermGeo,
    relayTermMat,
    relayRingGeo,
    relayRingMat,
    gateGeo,
    gateMat,
    skySignTex,
    skySignMat,
    skySignGeo,
  );

  return {
    group,
    colliders,
    walkables,
    lightAnchors,
    zones,
    vehicles,
    destructibleGlass: [],
    utilityPoles: [],
    dumpsters: [],
    wantedPosters: [],
    hotelVex: createStubHotelVex(),
    houses: [],
    birdPerches: [],
    barWinePos: new THREE.Vector3(0, -100, 0),
    villaTablePos: new THREE.Vector3(0, -100, 0),
    npcSpawns,
    disposables,
    mapBounds: { minX: -145, maxX: 145, minZ: -145, maxZ: 145 },
    policeDeskPos: skyPolice.policeDeskPos,
    holdingCellPos: skyPolice.holdingCellPos,
    cellBailPos: skyPolice.cellBailPos,
    cellReleasePos: skyPolice.cellReleasePos,
    cellDoorMesh: skyPolice.cellDoorMesh,
    cellDoorColliderIndex: skyPolice.cellDoorColliderIndex,
    mapReturnPos,
    extraMissions,
    fallDeathY: -6.0,
  };
}

export function buildPrisonMap(textures: ProceduralTextureSet): CityBuildResult {
  const group = new THREE.Group();
  const colliders: CityCollider[] = [];
  const walkables: WalkableSurface[] = [];
  const lightAnchors: CityLightAnchor[] = [];
  const disposables: Array<{ dispose: () => void }> = [];
  const zones: CityZone[] = [];

  // Massive Concrete Prison Complex (230m x 230m)
  const yardGeo = new THREE.PlaneGeometry(230, 230);
  const yardMat = new THREE.MeshStandardMaterial({
    map: textures.asphaltMap,
    color: 0x64748b,
    roughness: 0.85,
  });
  const yardFloor = new THREE.Mesh(yardGeo, yardMat);
  yardFloor.rotation.x = -Math.PI / 2;
  yardFloor.receiveShadow = true;
  group.add(yardFloor);

  const wallMat = new THREE.MeshStandardMaterial({
    map: textures.facadeConcreteMap,
    color: 0x475569,
    roughness: 0.85,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.65,
  });
  const floorTileMat = new THREE.MeshStandardMaterial({
    map: textures.interiorFloorMap,
    roughness: 0.5,
  });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.7 });
  const barMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.28 });

  const addBlock = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    collide = true,
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y + h / 2, z);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    disposables.push(geo);
    if (collide) {
      colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
        minY: y,
        height: y + h,
      });
    }
    return m;
  };

  // Expanded Outer Fortress Walls (±102m) + 4 Corner Searchlight Guard Towers
  addBlock(0, 0, -102, 206, 9.2, 2.4, wallMat);
  addBlock(0, 0, 102, 206, 9.2, 2.4, wallMat);
  addBlock(-102, 0, 0, 2.4, 9.2, 206, wallMat);
  addBlock(102, 0, 0, 2.4, 9.2, 206, wallMat);
  for (const [tx, tz] of [
    [-94, -94],
    [94, -94],
    [-94, 94],
    [94, 94],
  ]) {
    addBlock(tx, 0, tz, 7.5, 16, 7.5, wallMat);
    lightAnchors.push({ x: tx, y: 15.2, z: tz, color: 0xfde68a, intensity: 44, distance: 54 });
  }

  // 1. EXPANDED WEST CELLBLOCK A & B (x = -82..-32, z = -66..26)
  addBlock(-57, 0, -66, 50, 5.6, 0.8, wallMat);
  addBlock(-82, 0, -20, 0.8, 5.6, 92, wallMat);
  addBlock(-57, 0, 26, 50, 5.6, 0.8, wallMat);
  addBlock(-57, -0.05, -20, 50, 0.16, 92, floorTileMat, false);
  // Open 12m corridor entrance to Central Yard (-32, z = -26..-14 clear)
  addBlock(-32, 0, -46, 0.8, 5.6, 40, wallMat);
  addBlock(-32, 0, 6, 0.8, 5.6, 40, wallMat);
  addBlock(-57, 5.6, -20, 50, 0.5, 92, darkMetalMat, false);

  // Player's Open Cell Interior (-74.5, 0, -38): Bunk Bed (sleepPos) + Cell Sink/Toilet (restroomPos)
  addBlock(-77.5, 0, -40.5, 2.6, 0.65, 1.4, orangeMat); // Sleep Bunk
  const sleepPos = new THREE.Vector3(-74.5, 0, -40.5);
  addBlock(-78.5, 0, -34.0, 0.9, 0.85, 0.9, barMat); // Restroom Sink & Toilet
  const restroomPos = new THREE.Vector3(-76.5, 0, -34.0);

  // 2. NORTH CAFETERIA WING (x = -22..38, z = -82..-42)
  addBlock(8, 0, -82, 60, 5.6, 0.8, wallMat);
  addBlock(-22, 0, -62, 0.8, 5.6, 40, wallMat);
  addBlock(38, 0, -62, 0.8, 5.6, 40, wallMat);
  // Open 10m dining hall entrance at z = -42 (x = 3..13 clear!)
  addBlock(-9.5, 0, -42, 25, 5.6, 0.8, wallMat);
  addBlock(25.5, 0, -42, 25, 5.6, 0.8, wallMat);
  addBlock(8, -0.05, -62, 60, 0.16, 40, floorTileMat, false);
  addBlock(8, 5.6, -62, 60, 0.5, 40, darkMetalMat, false);
  // Cafeteria Food Counter + Mess Tables
  addBlock(8, 0, -75, 16, 1.08, 1.5, darkMetalMat);
  const eatPos = new THREE.Vector3(8, 0, -72.2);
  for (const tx of [-6, 10, 24]) {
    addBlock(tx, 0, -57, 4.6, 0.82, 1.8, darkMetalMat);
  }

  // 3. CENTRAL YARD GYM, BASKETBALL COURT & WORKSHOP + ESCAPE TUNNEL GRATE
  addBlock(32, 0, 10, 3.6, 0.55, 1.4, darkMetalMat);
  addBlock(32, 0, 11.4, 2.4, 1.5, 0.25, barMat);
  const trainPos = new THREE.Vector3(32, 0, 8.2);
  // East Laundry/Workshop Wing Props
  addBlock(68, 0, -24, 14, 4.8, 18, wallMat);

  // Hidden Escape Tunnel Steel Grate behind crates in SE Yard (76, 0, 72)
  addBlock(70, 0, 72, 3.2, 2.8, 3.2, wallMat);
  addBlock(76, 0, 78, 3.2, 2.8, 3.2, wallMat);
  const grateGeo = new THREE.BoxGeometry(2.8, 0.14, 2.8);
  const grateMesh = new THREE.Mesh(grateGeo, barMat);
  grateMesh.position.set(76, 0.08, 72);
  group.add(grateMesh);
  disposables.push(grateGeo);
  const escapePos = new THREE.Vector3(76, 0, 72);

  // 4. SOUTH WING SECURITY DESK
  const prisonSecurity = createPolicePrecinct(
    -28,
    0,
    70,
    textures,
    group,
    colliders,
    walkables,
    lightAnchors,
    disposables,
    true,
  );

  // Neon Wing Signs
  const cafeTex = createNeonSignTexture('PRISON CAFETERIA', '#f59e0b');
  const cafeMat = new THREE.MeshStandardMaterial({ map: cafeTex, emissive: 0xf59e0b, emissiveMap: cafeTex, emissiveIntensity: 1.6 });
  const cafeSignGeo = new THREE.BoxGeometry(6.2, 1.1, 0.2);
  const cafeSign = new THREE.Mesh(cafeSignGeo, cafeMat);
  cafeSign.position.set(8, 6.2, -41.2);
  group.add(cafeSign);

  const gymTex = createNeonSignTexture('YARD GYM & TRAINING', '#10b981');
  const gymMat = new THREE.MeshStandardMaterial({ map: gymTex, emissive: 0x10b981, emissiveMap: gymTex, emissiveIntensity: 1.6 });
  const gymSign = new THREE.Mesh(cafeSignGeo, gymMat);
  gymSign.position.set(32, 2.8, 11.7);
  group.add(gymSign);

  zones.push(
    { name: 'Blackrock Cellblock Wing', minX: -82, maxX: -32, minZ: -66, maxZ: 26 },
    { name: 'Prison Cafeteria Hall', minX: -22, maxX: 38, minZ: -82, maxZ: -42 },
    { name: 'Prison Central Yard & Gym', minX: -30, maxX: 86, minZ: -40, maxZ: 86 },
    prisonSecurity.zone,
  );

  lightAnchors.push(
    { x: -57, y: 4.8, z: -38, color: 0xfde68a, intensity: 30, distance: 34 },
    { x: 8, y: 4.8, z: -62, color: 0xffe4b5, intensity: 32, distance: 38 },
    { x: 32, y: 4.5, z: 10, color: 0x34d399, intensity: 28, distance: 30 },
    { x: 76, y: 4.5, z: 72, color: 0xf87171, intensity: 26, distance: 26 },
  );

  const npcSpawns: NpcSpawnSpec[] = [
    {
      id: 'prison_warden_guard',
      name: 'Officer Briggs (Yard Guard)',
      role: 'police',
      health: 135,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(-4, 0, -14), new THREE.Vector3(24, 0, -14), new THREE.Vector3(24, 0, 28), new THREE.Vector3(-4, 0, 28)],
    },
    {
      id: 'prison_guard_tower',
      name: 'Cellblock Guard',
      role: 'guard',
      health: 110,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(-42, 0, -40), new THREE.Vector3(-42, 0, 14)],
    },
    {
      id: 'prison_guard_east',
      name: 'East Perimeter Officer',
      role: 'guard',
      health: 110,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(48, 0, 34), new THREE.Vector3(78, 0, 48)],
    },
    {
      id: 'inmate_1',
      name: 'Brick (Heavyweight Inmate)',
      role: 'inmate',
      health: 85,
      voiceName: 'Puck',
      waypoints: [new THREE.Vector3(16, 0, 6), new THREE.Vector3(36, 0, 20)],
    },
    {
      id: 'inmate_2',
      name: 'Razor (Yard Brawler)',
      role: 'inmate',
      health: 80,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(-8, 0, 18), new THREE.Vector3(20, 0, 32)],
    },
    {
      id: 'inmate_3',
      name: 'Tiny (Cafeteria Regular)',
      role: 'inmate',
      health: 75,
      voiceName: 'Puck',
      waypoints: [new THREE.Vector3(2, 0, -52), new THREE.Vector3(20, 0, -52)],
    },
    {
      id: 'inmate_4',
      name: 'Dante (Tunnel Runner)',
      role: 'inmate',
      health: 75,
      voiceName: 'Puck',
      waypoints: [new THREE.Vector3(52, 0, 48), new THREE.Vector3(64, 0, 64)],
    },
  ];

  disposables.push(
    yardGeo,
    yardMat,
    wallMat,
    darkMetalMat,
    floorTileMat,
    orangeMat,
    barMat,
    cafeTex,
    cafeMat,
    cafeSignGeo,
    gymTex,
    gymMat,
  );

  return {
    group,
    colliders,
    walkables,
    lightAnchors,
    zones,
    vehicles: [],
    destructibleGlass: [],
    utilityPoles: [],
    dumpsters: [],
    wantedPosters: [],
    hotelVex: createStubHotelVex(),
    houses: [],
    birdPerches: [],
    barWinePos: new THREE.Vector3(0, -100, 0),
    villaTablePos: new THREE.Vector3(0, -100, 0),
    npcSpawns,
    disposables,
    mapBounds: { minX: -98, maxX: 98, minZ: -98, maxZ: 98 },
    policeDeskPos: prisonSecurity.policeDeskPos,
    prisonStations: {
      eatPos,
      trainPos,
      restroomPos,
      sleepPos,
      escapePos,
    },
  };
}

export function buildPlaneIncidentMap(textures: ProceduralTextureSet): CityBuildResult {
  const group = new THREE.Group();
  const colliders: CityCollider[] = [];
  const walkables: WalkableSurface[] = [];
  const lightAnchors: CityLightAnchor[] = [];
  const disposables: Array<{ dispose: () => void }> = [];
  const planeWalls: PlaneWallBounds[] = [];

  const cabinGroup = new THREE.Group();
  group.add(cabinGroup);

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
  });
  const fuselageWallMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.45,
    metalness: 0.25,
  });
  const windowGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x7dd3fc,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.55,
  });
  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x0f2744,
    roughness: 0.72,
  });
  const stripMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x7dd3fc,
    emissiveIntensity: 1.6,
  });

  // 34m Fuselage Cabin Floor (x = -3.1..3.1, z = -17..17)
  const floorGeo = new THREE.BoxGeometry(6.4, 0.24, 35);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.set(0, -0.12, 0);
  floor.receiveShadow = true;
  cabinGroup.add(floor);
  walkables.push({
    minX: -2.9,
    maxX: 2.9,
    minZ: -16.2,
    maxZ: 16.2,
    yStart: 0,
    yEnd: 0,
    axis: 'flat',
  });

  // Left & Right Pressurized Fuselage Walls + Breakable Windows (tagged into planeWalls for bullet breach detection!)
  const sideWallGeo = new THREE.BoxGeometry(0.28, 3.2, 34.4);
  const leftWall = new THREE.Mesh(sideWallGeo, fuselageWallMat);
  leftWall.position.set(-3.1, 1.6, 0);
  const rightWall = new THREE.Mesh(sideWallGeo, fuselageWallMat);
  rightWall.position.set(3.1, 1.6, 0);
  cabinGroup.add(leftWall, rightWall);
  planeWalls.push(
    { mesh: leftWall, minX: -3.45, maxX: -2.85, minY: 0, maxY: 3.3, minZ: -17.2, maxZ: 17.2 },
    { mesh: rightWall, minX: 2.85, maxX: 3.45, minY: 0, maxY: 3.3, minZ: -17.2, maxZ: 17.2 },
  );
  colliders.push(
    { minX: -3.4, maxX: -2.85, minZ: -17, maxZ: 17, height: 3.4 },
    { minX: 2.85, maxX: 3.4, minZ: -17, maxZ: 17, height: 3.4 },
  );

  // Cockpit Bulkhead (-Z) & Rear Galley Bulkhead (+Z)
  const endWallGeo = new THREE.BoxGeometry(6.4, 3.2, 0.4);
  const frontBulk = new THREE.Mesh(endWallGeo, fuselageWallMat);
  frontBulk.position.set(0, 1.6, -16.6);
  const rearBulk = new THREE.Mesh(endWallGeo, fuselageWallMat);
  rearBulk.position.set(0, 1.6, 16.6);
  cabinGroup.add(frontBulk, rearBulk);
  colliders.push(
    { minX: -3.2, maxX: 3.2, minZ: -17.0, maxZ: -16.4, height: 3.4 },
    { minX: -3.2, maxX: 3.2, minZ: 16.4, maxZ: 17.0, height: 3.4 },
  );

  // Fuselage Ceiling & Overhead Lighting Strip (left slightly tall so upward-looking explosion camera has epic headroom!)
  const ceilGeo = new THREE.BoxGeometry(6.4, 0.25, 34.4);
  const ceiling = new THREE.Mesh(ceilGeo, fuselageWallMat);
  ceiling.position.set(0, 3.25, 0);
  const ceilLightGeo = new THREE.BoxGeometry(0.9, 0.08, 30);
  const ceilLight = new THREE.Mesh(ceilLightGeo, stripMat);
  ceilLight.position.set(0, 3.1, 0);
  cabinGroup.add(ceiling, ceilLight);

  // Oval Aircraft Windows & Passenger Seat Rows leaving Wide Central Aisle (x = -0.9..0.9 clear!)
  const winGeo = new THREE.BoxGeometry(0.08, 0.65, 0.9);
  const seatGeo = new THREE.BoxGeometry(1.45, 1.05, 0.68);
  for (let rz = -12; rz <= 12; rz += 3.0) {
    // Windows on both fuselage walls
    const wL = new THREE.Mesh(winGeo, windowGlassMat);
    wL.position.set(-2.94, 1.55, rz);
    const wR = new THREE.Mesh(winGeo, windowGlassMat);
    wR.position.set(2.94, 1.55, rz);
    cabinGroup.add(wL, wR);

    // Dual-seat rows on port & starboard sides (skip player starting row z = 12)
    if (rz < 10) {
      const sL = new THREE.Mesh(seatGeo, seatMat);
      sL.position.set(-2.05, 0.54, rz);
      const sR = new THREE.Mesh(seatGeo, seatMat);
      sR.position.set(2.05, 0.54, rz);
      cabinGroup.add(sL, sR);
      colliders.push(
        { minX: -2.8, maxX: -1.3, minZ: rz - 0.36, maxZ: rz + 0.36, height: 1.15, vaultable: true },
        { minX: 1.3, maxX: 2.8, minZ: rz - 0.36, maxZ: rz + 0.36, height: 1.15, vaultable: true },
      );
    }
  }

  // Night Sky Clouds visible outside the windows
  const skyCloudGeo = new THREE.SphereGeometry(2.5, 8, 6);
  const skyCloudMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    emissive: 0x0f172a,
    roughness: 0.9,
  });
  for (let c = -40; c <= 40; c += 16) {
    const cL = new THREE.Mesh(skyCloudGeo, skyCloudMat);
    cL.position.set(-14, 1.5, c);
    cL.scale.set(2.2, 0.7, 3.0);
    const cR = new THREE.Mesh(skyCloudGeo, skyCloudMat);
    cR.position.set(14, 1.5, c);
    cR.scale.set(2.2, 0.7, 3.0);
    group.add(cL, cR);
  }

  lightAnchors.push(
    { x: 0, y: 2.75, z: -8, color: 0xe0f2fe, intensity: 28, distance: 20 },
    { x: 0, y: 2.75, z: 4, color: 0xe0f2fe, intensity: 28, distance: 20 },
    { x: 0, y: 2.75, z: 12, color: 0xfde68a, intensity: 24, distance: 18 },
  );

  // 3 Armed Federal Air Marshals threatening the player from forward aisle!
  const npcSpawns: NpcSpawnSpec[] = [
    {
      id: 'marshal_lead',
      name: 'Agent Cross (Air Marshal)',
      role: 'marshal',
      health: 90,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(0, 0, -4.5), new THREE.Vector3(-0.4, 0, -3.5)],
    },
    {
      id: 'marshal_port',
      name: 'Agent Hayes (Air Marshal)',
      role: 'marshal',
      health: 85,
      voiceName: 'Puck',
      waypoints: [new THREE.Vector3(-0.7, 0, -8.5), new THREE.Vector3(-0.5, 0, -7.2)],
    },
    {
      id: 'marshal_stbd',
      name: 'Agent Cole (Air Marshal)',
      role: 'marshal',
      health: 85,
      voiceName: 'Charon',
      waypoints: [new THREE.Vector3(0.7, 0, -10.5), new THREE.Vector3(0.5, 0, -9.0)],
    },
  ];

  // Texture reference so textures param stays used cleanly
  void textures;

  disposables.push(
    floorMat,
    fuselageWallMat,
    windowGlassMat,
    seatMat,
    stripMat,
    floorGeo,
    sideWallGeo,
    endWallGeo,
    ceilGeo,
    ceilLightGeo,
    winGeo,
    seatGeo,
    skyCloudGeo,
    skyCloudMat,
  );

  return {
    group,
    colliders,
    walkables,
    lightAnchors,
    zones: [{ name: 'Flight 409 · Passenger Cabin', minX: -3.2, maxX: 3.2, minZ: -17, maxZ: 17 }],
    vehicles: [],
    destructibleGlass: [],
    utilityPoles: [],
    dumpsters: [],
    wantedPosters: [],
    hotelVex: createStubHotelVex(),
    houses: [],
    birdPerches: [],
    barWinePos: new THREE.Vector3(0, -100, 0),
    villaTablePos: new THREE.Vector3(0, -100, 0),
    npcSpawns,
    disposables,
    mapBounds: { minX: -2.85, maxX: 2.85, minZ: -16.1, maxZ: 16.1 },
    planeWalls,
    planeCabinExplodeGroup: cabinGroup,
  };
}
