import * as THREE from 'three';
import type {
  CityCollider,
  CityLightAnchor,
  CityZone,
  ExtraMissionId,
  HotelRoomId,
  NpcRole,
  VehicleVariant,
  WalkableSurface,
} from '../types/game';
import { createNeonSignTexture, type ProceduralTextureSet } from './textures';

export interface ExtraMissionSpot {
  id: ExtraMissionId;
  pos: THREE.Vector3;
  mesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  rewardCash: number;
  completed: boolean;
}

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
  elevatorPos: THREE.Vector3;
  floorY: [number, number, number, number, number, number];
  elevatorCabinGroup: THREE.Group;
  elevatorDoorL: THREE.Mesh;
  elevatorDoorR: THREE.Mesh;
  rooms: Record<HotelRoomId, HotelRoomDoorSpec>;
  suite204Door: HotelRoomDoorSpec;
  ledgerMesh: THREE.Mesh;
  ledgerPos: THREE.Vector3;
  ledgerStolen: boolean;
}

export interface HouseSpec {
  id: string;
  name: string;
  doorPivot: THREE.Group;
  lockLedMat: THREE.MeshBasicMaterial;
  colliderIndex: number;
  doorPos: THREE.Vector3;
  unlocked: boolean;
  doorSideSign: 1 | -1;
  safeMesh: THREE.Mesh;
  safePos: THREE.Vector3;
  lootCash: number;
  robbed: boolean;
  sideItemMesh?: THREE.Mesh;
  sideItemPos?: THREE.Vector3;
  sideItemDone?: boolean;
}

export interface BirdPerchSpec {
  position: THREE.Vector3;
  rooftop: boolean;
}

export interface DriveableVehicleSpec {
  id: string;
  variant: VehicleVariant;
  maxSpeed: number;
  accel: number;
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

export interface PrisonStationsSpec {
  eatPos: THREE.Vector3;
  trainPos: THREE.Vector3;
  restroomPos: THREE.Vector3;
  sleepPos: THREE.Vector3;
  escapePos: THREE.Vector3;
}

export interface PlaneWallBounds {
  mesh: THREE.Mesh;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
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
  houses: HouseSpec[];
  birdPerches: BirdPerchSpec[];
  barWinePos: THREE.Vector3;
  villaTablePos: THREE.Vector3;
  npcSpawns: NpcSpawnSpec[];
  disposables: Array<{ dispose: () => void }>;
  mapBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  policeDeskPos?: THREE.Vector3;
  holdingCellPos?: THREE.Vector3;
  cellBailPos?: THREE.Vector3;
  cellReleasePos?: THREE.Vector3;
  cellDoorMesh?: THREE.Group;
  cellDoorColliderIndex?: number;
  airportDeskPos?: THREE.Vector3;
  planeBoardPos?: THREE.Vector3;
  supermarketCheckoutPos?: THREE.Vector3;
  extraMissions?: ExtraMissionSpot[];
  mapReturnPos?: THREE.Vector3;
  oceanShoreZ?: number;
  oceanWaterMesh?: THREE.Mesh;
  fallDeathY?: number;
  prisonStations?: PrisonStationsSpec;
  planeWalls?: PlaneWallBounds[];
  planeCabinExplodeGroup?: THREE.Group;
}

export interface VehicleBuildInput {
  id: string;
  x: number;
  y?: number;
  z: number;
  rotY: number;
  locked: boolean;
  isNpcTraffic: boolean;
  isPoliceCruiser?: boolean;
  variant?: VehicleVariant;
  color: number;
  waypoints?: THREE.Vector3[];
}

export function createDriveableVehicle(
  input: VehicleBuildInput,
  textures: ProceduralTextureSet,
  group: THREE.Group,
  colliders: CityCollider[],
  disposables: Array<{ dispose: () => void }>,
): DriveableVehicleSpec {
  const {
    id,
    x: cx,
    y: cy = 0.08,
    z: cz,
    rotY,
    locked,
    isNpcTraffic,
    isPoliceCruiser = false,
    waypoints,
  } = input;
  const variant: VehicleVariant = isPoliceCruiser
    ? 'police'
    : (input.variant ?? 'sedan');

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x161b24,
    roughness: 0.48,
    metalness: 0.65,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x3b4454,
    roughness: 0.35,
    metalness: 0.8,
  });
  const cyanNeonMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.0,
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
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.85,
  });
  const driverSkinMat = new THREE.MeshStandardMaterial({
    map: textures.skinArmLegMap,
    roughness: 0.6,
  });
  const driverJacketMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.78,
  });

  const isTall = variant === 'suv' || variant === 'pickup' || variant === 'van';
  const roofH = variant === 'van' ? 1.88 : variant === 'suv' ? 1.72 : variant === 'coupe' ? 1.38 : 1.46;
  const wheelRadius = isTall ? 0.39 : 0.34;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.25, 14);
  wheelGeo.rotateZ(Math.PI / 2);

  const car = new THREE.Group();
  car.position.set(cx, cy, cz);
  car.rotation.y = rotY;

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: isPoliceCruiser ? 0x0f172a : input.color,
    roughness: variant === 'van' ? 0.42 : 0.24,
    metalness: variant === 'van' ? 0.35 : 0.68,
    clearcoat: 0.85,
  });

  const chassisLen = variant === 'van' || variant === 'pickup' ? 4.35 : variant === 'coupe' ? 3.85 : 4.05;
  const chassisH = isTall ? 0.64 : 0.52;
  const chassisY = isTall ? 0.64 : 0.56;
  const chassisGeo = new THREE.BoxGeometry(1.88, chassisH, chassisLen);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  chassis.position.y = chassisY;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  car.add(chassis);

  const dashGeo = new THREE.BoxGeometry(1.56, 0.28, 0.42);
  const dash = new THREE.Mesh(dashGeo, darkTrimMat);
  dash.position.set(0, chassisY + 0.38, 0.62);
  car.add(dash);

  const gaugeGeo = new THREE.BoxGeometry(0.42, 0.11, 0.04);
  const gauge = new THREE.Mesh(gaugeGeo, cyanNeonMat);
  gauge.position.set(0.35, chassisY + 0.44, 0.41);
  car.add(gauge);

  const pillarH = roofH - (chassisY + 0.3);
  const pillarGeo = new THREE.BoxGeometry(0.08, Math.max(0.45, pillarH), 0.09);
  const pillarL = new THREE.Mesh(pillarGeo, darkTrimMat);
  pillarL.position.set(0.76, roofH - 0.22, 0.82);
  pillarL.rotation.x = -0.45;
  const pillarR = new THREE.Mesh(pillarGeo, darkTrimMat);
  pillarR.position.set(-0.76, roofH - 0.22, 0.82);
  pillarR.rotation.x = -0.45;
  const bPillarL = new THREE.Mesh(pillarGeo, darkTrimMat);
  bPillarL.position.set(0.76, roofH - 0.22, variant === 'van' || variant === 'suv' ? -1.8 : -0.95);
  const bPillarR = new THREE.Mesh(pillarGeo, darkTrimMat);
  bPillarR.position.set(-0.76, roofH - 0.22, variant === 'van' || variant === 'suv' ? -1.8 : -0.95);
  car.add(pillarL, pillarR, bPillarL, bPillarR);

  const seatGeo = new THREE.BoxGeometry(0.48, 0.52, 0.16);
  const seatL = new THREE.Mesh(seatGeo, darkTrimMat);
  seatL.position.set(0.36, chassisY + 0.48, -0.35);
  seatL.rotation.x = -0.15;
  const seatR = new THREE.Mesh(seatGeo, darkTrimMat);
  seatR.position.set(-0.36, chassisY + 0.48, -0.35);
  seatR.rotation.x = -0.15;
  car.add(seatL, seatR);

  const driverHeadGeo = new THREE.SphereGeometry(0.11, 10, 8);
  const driverTorsoGeo = new THREE.BoxGeometry(0.32, 0.34, 0.2);
  const driverModel = new THREE.Group();
  driverModel.position.set(0.36, chassisY + 0.45, -0.18);
  const dTorso = new THREE.Mesh(driverTorsoGeo, driverJacketMat);
  dTorso.position.y = 0.05;
  const dHead = new THREE.Mesh(driverHeadGeo, driverSkinMat);
  dHead.position.y = 0.29;
  driverModel.add(dTorso, dHead);
  driverModel.visible = isNpcTraffic;
  car.add(driverModel);

  const ledGeo = new THREE.SphereGeometry(0.032, 8, 6);
  const lockLedMat = new THREE.MeshBasicMaterial({
    color: locked ? 0xef4444 : 0x10b981,
  });
  const lockLed = new THREE.Mesh(ledGeo, lockLedMat);
  lockLed.position.set(0.95, chassisY + 0.38, 0.22);
  car.add(lockLed);

  const steeringWheel = new THREE.Group();
  steeringWheel.position.set(0.35, chassisY + 0.47, 0.34);
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

  const roofLen =
    variant === 'suv'
      ? 2.85
      : variant === 'van'
        ? 3.15
        : variant === 'pickup'
          ? 1.15
          : variant === 'coupe'
            ? 1.55
            : 1.98;
  const roofZ =
    variant === 'suv' || variant === 'van'
      ? -0.52
      : variant === 'pickup'
        ? 0.28
        : -0.15;
  const roofGeo = new THREE.BoxGeometry(1.66, 0.08, roofLen);
  const roof = new THREE.Mesh(roofGeo, bodyMat);
  roof.position.set(0, roofH, roofZ);
  car.add(roof);

  // Variant-specific bodywork silhouettes!
  if (variant === 'coupe' || variant === 'muscle') {
    const spoilerGeo = new THREE.BoxGeometry(1.68, 0.06, 0.24);
    const spoiler = new THREE.Mesh(spoilerGeo, darkTrimMat);
    spoiler.position.set(0, 1.06, -1.78);
    car.add(spoiler);
    disposables.push(spoilerGeo);
  }
  if (variant === 'muscle') {
    const scoopGeo = new THREE.BoxGeometry(0.58, 0.16, 0.72);
    const scoop = new THREE.Mesh(scoopGeo, metalMat);
    scoop.position.set(0, 1.0, 1.45);
    car.add(scoop);
    disposables.push(scoopGeo);
  }
  if (variant === 'suv') {
    const rackGeo = new THREE.BoxGeometry(0.08, 0.08, 2.5);
    for (const rx of [-0.66, 0.66]) {
      const rail = new THREE.Mesh(rackGeo, metalMat);
      rail.position.set(rx, roofH + 0.07, -0.5);
      car.add(rail);
    }
    disposables.push(rackGeo);
  }
  if (variant === 'van') {
    const boxBodyGeo = new THREE.BoxGeometry(1.86, 0.76, 2.65);
    const boxBody = new THREE.Mesh(boxBodyGeo, bodyMat);
    boxBody.position.set(0, 1.34, -0.82);
    boxBody.castShadow = true;
    car.add(boxBody);
    disposables.push(boxBodyGeo);
  }
  if (variant === 'pickup') {
    const bedWallGeo = new THREE.BoxGeometry(0.12, 0.42, 1.72);
    const bedL = new THREE.Mesh(bedWallGeo, bodyMat);
    bedL.position.set(0.86, 1.12, -1.26);
    const bedR = new THREE.Mesh(bedWallGeo, bodyMat);
    bedR.position.set(-0.86, 1.12, -1.26);
    const tailGeo = new THREE.BoxGeometry(1.84, 0.42, 0.12);
    const tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(0, 1.12, -2.08);
    car.add(bedL, bedR, tail);
    disposables.push(bedWallGeo, tailGeo);
  }

  const windshieldGeo = new THREE.BoxGeometry(1.54, 0.48, 0.08);
  const windshield = new THREE.Mesh(windshieldGeo, carGlassMat);
  windshield.position.set(0, chassisY + 0.66, 0.88);
  windshield.rotation.x = -0.52;
  car.add(windshield);

  const sideWinGeo = new THREE.BoxGeometry(1.66, 0.44, variant === 'pickup' ? 0.95 : 1.68);
  const sideWindows = new THREE.Mesh(sideWinGeo, carGlassMat);
  sideWindows.position.set(0, chassisY + 0.64, variant === 'pickup' ? 0.28 : -0.2);
  car.add(sideWindows);

  const hoodGeo = new THREE.BoxGeometry(1.78, 0.14, 1.25);
  const hood = new THREE.Mesh(hoodGeo, bodyMat);
  hood.position.set(0, chassisY + 0.3, 1.44);
  hood.castShadow = true;
  car.add(hood);

  const bumperGeo = new THREE.BoxGeometry(1.94, 0.24, 0.24);
  const frontBumper = new THREE.Mesh(bumperGeo, darkTrimMat);
  frontBumper.position.set(0, 0.44, chassisLen * 0.5 + 0.12);
  car.add(frontBumper);

  const rearBumper = new THREE.Mesh(bumperGeo, darkTrimMat);
  rearBumper.position.set(0, 0.44, -chassisLen * 0.5 - 0.12);
  car.add(rearBumper);

  const doorGeo = new THREE.BoxGeometry(0.1, 0.56, 1.38);
  const leftDoor = new THREE.Mesh(doorGeo, bodyMat);
  leftDoor.position.set(0.94, chassisY + 0.1, 0.02);
  car.add(leftDoor);

  const rightDoor = new THREE.Mesh(doorGeo, bodyMat);
  rightDoor.position.set(-0.94, chassisY + 0.1, 0.02);
  car.add(rightDoor);

  const wheels: THREE.Mesh[] = [];
  for (const [wx, wz] of [
    [-0.92, 1.36],
    [0.92, 1.36],
    [-0.92, -1.36],
    [0.92, -1.36],
  ]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(wx, wheelRadius, wz);
    car.add(w);
    wheels.push(w);
  }

  const lampGeo = new THREE.BoxGeometry(0.32, 0.14, 0.08);
  for (const lx of [-0.62, 0.62]) {
    const hl = new THREE.Mesh(lampGeo, headlightMat);
    hl.position.set(lx, chassisY + 0.1, chassisLen * 0.5 + 0.02);
    car.add(hl);
    const tl = new THREE.Mesh(lampGeo, taillightMat);
    tl.position.set(lx, chassisY + 0.1, -chassisLen * 0.5 - 0.02);
    car.add(tl);
  }

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
    barBase.position.set(0, roofH + 0.08, -0.1);
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
    lightbarRed.position.set(0.32, roofH + 0.13, -0.1);
    lightbarBlue = new THREE.Mesh(podGeo, blueBarMat);
    lightbarBlue.position.set(-0.32, roofH + 0.13, -0.1);
    car.add(lightbarRed, lightbarBlue);
    disposables.push(whiteMat, barBaseGeo, podGeo, redBarMat, blueBarMat);
  }

  group.add(car);
  disposables.push(
    darkTrimMat,
    metalMat,
    cyanNeonMat,
    carGlassMat,
    headlightMat,
    taillightMat,
    wheelMat,
    driverSkinMat,
    driverJacketMat,
    wheelGeo,
    bodyMat,
    chassisGeo,
    dashGeo,
    gaugeGeo,
    pillarGeo,
    seatGeo,
    driverHeadGeo,
    driverTorsoGeo,
    ledGeo,
    lockLedMat,
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

  const halfX = Math.abs(Math.cos(rotY)) * 1.05 + Math.abs(Math.sin(rotY)) * 2.25;
  const halfZ = Math.abs(Math.sin(rotY)) * 1.05 + Math.abs(Math.cos(rotY)) * 2.25;
  const colliderIndex = colliders.length;
  colliders.push({
    minX: cx - halfX,
    maxX: cx + halfX,
    minZ: cz - halfZ,
    maxZ: cz + halfZ,
    minY: cy,
    height: cy + roofH + 0.15,
    vaultable: true,
  });

  const maxSpeed =
    variant === 'coupe'
      ? 35
      : variant === 'muscle'
        ? 34
        : variant === 'police'
          ? 33
          : variant === 'suv'
            ? 27
            : variant === 'pickup'
              ? 26
              : variant === 'van'
                ? 23
                : 29;
  const accel =
    variant === 'coupe' || variant === 'muscle'
      ? 24
      : variant === 'police'
        ? 22
        : variant === 'van'
          ? 14
          : 18;

  return {
    id,
    variant,
    maxSpeed,
    accel,
    root: car,
    position: new THREE.Vector3(cx, cy, cz),
    yaw: rotY,
    speed: 0,
    steer: 0,
    health: variant === 'van' || variant === 'suv' ? 185 : 140,
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
  };
}

export interface PoliceStationBuildResult {
  policeDeskPos: THREE.Vector3;
  holdingCellPos: THREE.Vector3;
  cellBailPos: THREE.Vector3;
  cellReleasePos: THREE.Vector3;
  cellDoorMesh: THREE.Group;
  cellDoorColliderIndex: number;
  officerSpawnPos: THREE.Vector3;
  zone: CityZone;
}

export function createPolicePrecinct(
  px: number,
  py: number,
  pz: number,
  textures: ProceduralTextureSet,
  group: THREE.Group,
  colliders: CityCollider[],
  walkables: WalkableSurface[],
  lightAnchors: CityLightAnchor[],
  disposables: Array<{ dispose: () => void }>,
  facingNorth = true,
): PoliceStationBuildResult {
  const pw = 18;
  const pd = 16;
  const wallH = 4.6;

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x263244,
    roughness: 0.72,
    metalness: 0.18,
  });
  const floorMat = new THREE.MeshStandardMaterial({
    map: textures.interiorFloorMap,
    roughness: 0.42,
    metalness: 0.12,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.55,
    metalness: 0.45,
  });
  const barMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.3,
    metalness: 0.85,
  });
  const blueLampMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 2.2,
  });

  const addBox = (
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

  // Floor & Walkable
  addBox(px, py - 0.08, pz, pw, 0.16, pd, floorMat, false);
  walkables.push({
    minX: px - pw / 2,
    maxX: px + pw / 2,
    minZ: pz - pd / 2,
    maxZ: pz + pd / 2,
    yStart: py + 0.08,
    yEnd: py + 0.08,
    axis: 'flat',
  });

  const doorZ = facingNorth ? pz - pd / 2 + 0.3 : pz + pd / 2 - 0.3;
  const backZ = facingNorth ? pz + pd / 2 - 0.3 : pz - pd / 2 + 0.3;

  // Side walls & back wall
  addBox(px - pw / 2 + 0.3, py, pz, 0.6, wallH, pd, wallMat);
  addBox(px + pw / 2 - 0.3, py, pz, 0.6, wallH, pd, wallMat);
  addBox(px, py, backZ, pw, wallH, 0.6, wallMat);
  // Front walls leaving 5m center doorway open
  addBox(px - 5.75, py, doorZ, 6.5, wallH, 0.6, wallMat);
  addBox(px + 5.75, py, doorZ, 6.5, wallH, 0.6, wallMat);
  // Roof slab
  addBox(px, py + wallH, pz, pw + 0.5, 0.55, pd + 0.5, trimMat, false);

  // Booking Desk
  const deskZ = facingNorth ? pz + 1.5 : pz - 1.5;
  addBox(px - 3.6, py + 0.08, deskZ, 4.8, 1.05, 1.1, trimMat);
  addBox(px - 3.6, py + 1.14, deskZ, 4.7, 0.06, 0.15, blueLampMat, false);

  // Holding Cell Partition & Iron Bars (East half of station)
  const cellCenterX = px + 4.4;
  const cellCenterZ = facingNorth ? pz + 3.2 : pz - 3.2;
  const cellFrontZ = facingNorth ? cellCenterZ - 3.0 : cellCenterZ + 3.0;
  // Inner solid partition wall separating cell west side from lobby
  addBox(px + 1.1, py + 0.08, cellCenterZ, 0.35, wallH - 0.1, 6.0, wallMat);
  // Barred front posts leaving 2.0m doorway in center
  for (const bxOffset of [-2.4, -2.0, -1.6, 1.6, 2.0, 2.4]) {
    addBox(cellCenterX + bxOffset, py + 0.08, cellFrontZ, 0.1, wallH - 0.2, 0.1, barMat);
  }
  // Cell Bed / Bench & Sink inside holding cell
  addBox(px + 6.8, py + 0.08, cellCenterZ + (facingNorth ? 1.5 : -1.5), 1.4, 0.52, 2.2, trimMat);
  addBox(px + 2.4, py + 0.08, cellCenterZ + (facingNorth ? 2.1 : -2.1), 0.75, 0.85, 0.6, barMat);

  // Hinged Barred Cell Gate (unlocks when bail is paid!)
  const cellDoorMesh = new THREE.Group();
  cellDoorMesh.position.set(cellCenterX - 1.2, py + 0.08, cellFrontZ);
  for (let b = 0; b <= 6; b++) {
    const barGeo = new THREE.CylinderGeometry(0.032, 0.032, 2.55, 8);
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(b * 0.38, 1.28, 0);
    cellDoorMesh.add(bar);
    disposables.push(barGeo);
  }
  const railGeo = new THREE.BoxGeometry(2.4, 0.1, 0.1);
  const topRail = new THREE.Mesh(railGeo, trimMat);
  topRail.position.set(1.15, 2.5, 0);
  const midRail = new THREE.Mesh(railGeo, trimMat);
  midRail.position.set(1.15, 1.25, 0);
  cellDoorMesh.add(topRail, midRail);
  group.add(cellDoorMesh);
  disposables.push(railGeo);

  const cellDoorColliderIndex = colliders.length;
  colliders.push({
    minX: cellCenterX - 1.35,
    maxX: cellCenterX + 1.35,
    minZ: cellFrontZ - 0.18,
    maxZ: cellFrontZ + 0.18,
    minY: py,
    height: -1, // opens by default unless player is locked inside!
  });

  // LCPD Sign
  const signTex = createNeonSignTexture('LCPD POLICE PRECINCT', '#38bdf8');
  const signMat = new THREE.MeshStandardMaterial({
    map: signTex,
    emissive: 0x38bdf8,
    emissiveMap: signTex,
    emissiveIntensity: 1.9,
  });
  const signGeo = new THREE.BoxGeometry(6.8, 1.3, 0.24);
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(px, py + wallH + 0.85, facingNorth ? pz - pd / 2 - 0.28 : pz + pd / 2 + 0.28);
  if (facingNorth) sign.rotation.y = Math.PI;
  group.add(sign);

  lightAnchors.push(
    { x: px, y: py + 3.8, z: pz, color: 0xe0f2fe, intensity: 28, distance: 26 },
    { x: px, y: py + 4.4, z: facingNorth ? pz - pd / 2 - 2.6 : pz + pd / 2 + 2.6, color: 0x38bdf8, intensity: 24, distance: 24 },
  );

  disposables.push(wallMat, floorMat, trimMat, barMat, blueLampMat, signTex, signMat, signGeo);

  return {
    policeDeskPos: new THREE.Vector3(px - 3.6, py + 0.08, facingNorth ? deskZ - 1.45 : deskZ + 1.45),
    holdingCellPos: new THREE.Vector3(cellCenterX - 0.2, py + 0.08, cellCenterZ),
    cellBailPos: new THREE.Vector3(cellCenterX - 0.2, py + 0.08, facingNorth ? cellFrontZ + 1.15 : cellFrontZ - 1.15),
    cellReleasePos: new THREE.Vector3(px - 2.2, py + 0.08, facingNorth ? pz - 3.5 : pz + 3.5),
    cellDoorMesh,
    cellDoorColliderIndex,
    officerSpawnPos: new THREE.Vector3(px - 3.6, py + 0.08, facingNorth ? deskZ + 1.2 : deskZ - 1.2),
    zone: {
      name: 'LCPD Police Precinct',
      minX: px - pw / 2,
      maxX: px + pw / 2,
      minZ: pz - pd / 2,
      maxZ: pz + pd / 2,
    },
  };
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
  const houses: HouseSpec[] = [];
  const birdPerches: BirdPerchSpec[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  const extraMissions: ExtraMissionSpot[] = [];

  // 1. Expanded Asphalt Open-World Ground Plane (860m x 860m into horizon fog)
  const groundGeo = new THREE.PlaneGeometry(860, 860);
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

  // 2. Expanded Road Markings & Crosswalks across 5x5 Avenue Grid [-114, -52, 0, 52, 114] + Airport Connector
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

  const avenueLines = [-114, -52, 0, 52, 114];
  const nearAnyAvenue = (v: number) => avenueLines.some((a) => Math.abs(v - a) < 8);
  const dashPositions: Array<[number, number, number]> = [];
  for (let d = -168; d <= 168; d += 8) {
    if (!nearAnyAvenue(d)) {
      for (const a of avenueLines) {
        if (a === 0 && d < -114) continue; // Keep North concrete crash wall plaza clean behind -114
        if (a === -114 && Math.abs(d) < 16) continue;
        dashPositions.push([a, d, 0]);
        dashPositions.push([d, a, Math.PI / 2]);
      }
    }
  }
  // Airport East Access Boulevard dashes (x = 122..152 at z = 0)
  for (let ax = 122; ax <= 148; ax += 8) {
    dashPositions.push([ax, 0, Math.PI / 2]);
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
  for (const ix of avenueLines) {
    for (const iz of avenueLines) {
      if (ix === 0 && iz === -114) continue;
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

  // 3. City Block Sidewalk Islands (Inner + Expanded Outer Districts)
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
  // Outer District Sidewalk Plazas along North (-142), West (-142), South (+142)
  const outerPlazas: Array<[number, number]> = [
    [-142, -82], [-142, -26], [-142, 26], [-142, 82], [-142, 142],
    [-82, 142], [82, 142], [-82, -142], [-28, -142], [28, -142], [82, -142],
  ];
  for (const [px, pz] of outerPlazas) {
    const swGeo = new THREE.BoxGeometry(34, 0.08, 34);
    const sw = new THREE.Mesh(swGeo, sidewalkMat);
    sw.position.set(px, 0.04, pz);
    sw.receiveShadow = true;
    group.add(sw);
    disposables.push(swGeo);
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
    // Realistic Syndicate HQ Upgrades: Exterior Canopy Columns, Reception Monitors, Hologram Map Table & Turnstiles
    const canopyGeo = new THREE.BoxGeometry(7.2, 0.34, 3.6);
    const canopyS = new THREE.Mesh(canopyGeo, metalMat);
    canopyS.position.set(lx, wallH - 0.15, lz + ld / 2 + 1.6);
    const canopyColGeo = new THREE.CylinderGeometry(0.18, 0.2, wallH - 0.3, 10);
    for (const cx of [-2.9, 2.9]) {
      const col = new THREE.Mesh(canopyColGeo, metalMat);
      col.position.set(lx + cx, (wallH - 0.3) * 0.5, lz + ld / 2 + 3.1);
      group.add(col);
    }
    const monitorGeo = new THREE.BoxGeometry(0.75, 0.45, 0.08);
    const holoTableGeo = new THREE.CylinderGeometry(1.4, 1.1, 0.85, 12);
    const holoDiscGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.06, 12);
    const holoTable = new THREE.Mesh(holoTableGeo, darkTrimMat);
    holoTable.position.set(lx - 4.0, 0.52, lz + 1.5);
    const holoDisc = new THREE.Mesh(holoDiscGeo, cyanNeonMat);
    holoDisc.position.set(lx - 4.0, 0.98, lz + 1.5);
    for (const mx of [0.8, 2.0, 3.2]) {
      const mon = new THREE.Mesh(monitorGeo, cyanNeonMat);
      mon.position.set(lx + mx, 1.52, lz - 3.0);
      group.add(mon);
    }
    group.add(canopyS, holoTable, holoDisc);
    disposables.push(canopyGeo, canopyColGeo, monitorGeo, holoTableGeo, holoDiscGeo);

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

  // 5. ENTERABLE AREA #2: 24H Neon Lounge & Bar (-26, +26) — Upgraded with Canopy, Backlit Bottle Wall, Bar Stools & Velvet Booths
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

    // Exterior Entrance Awning & Velvet Stanchions
    const barCanopyGeo = new THREE.BoxGeometry(6.6, 0.3, 2.8);
    const barCanopy = new THREE.Mesh(barCanopyGeo, darkTrimMat);
    barCanopy.position.set(bx, wallH - 0.25, bz - bd / 2 - 1.3);
    const barCanopyTrim = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.08, 0.14), cyanNeonMat);
    barCanopyTrim.position.set(bx, wallH - 0.25, bz - bd / 2 - 2.68);
    group.add(barCanopy, barCanopyTrim);
    disposables.push(barCanopyGeo, barCanopyTrim.geometry);

    // Bar Counter, Neon Strip, Backlit Liquor Shelves, Stools & Reserve Wine Display
    addWall(bx - 3.5, 0.14, bz + 3.5, 6.2, 1.1, 1.2, darkTrimMat);
    const barStripGeo = new THREE.BoxGeometry(6.2, 0.12, 0.16);
    const barStrip = new THREE.Mesh(barStripGeo, cyanNeonMat);
    barStrip.position.set(bx - 3.5, 1.24, bz + 2.95);
    group.add(barStrip);

    // Illuminated back-bar liquor rack against South wall
    addWall(bx - 3.5, 0.14, bz + 7.8, 6.2, 2.9, 0.65, darkTrimMat);
    const rackLedGeo = new THREE.BoxGeometry(5.6, 0.08, 0.14);
    const rackLed = new THREE.Mesh(rackLedGeo, cyanNeonMat);
    rackLed.position.set(bx - 3.5, 2.15, bz + 7.45);
    group.add(rackLed);
    const stoolGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.76, 10);
    for (let st = 0; st < 4; st++) {
      const stool = new THREE.Mesh(stoolGeo, metalMat);
      stool.position.set(bx - 5.6 + st * 1.4, 0.52, bz + 2.0);
      group.add(stool);
    }

    const wineMat = new THREE.MeshPhysicalMaterial({
      color: 0x450a0a,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.45,
      roughness: 0.18,
      clearcoat: 1.0,
    });
    const bottleGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.34, 8);
    const bottleNeckGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.14, 8);
    for (let wb = 0; wb < 3; wb++) {
      const bMesh = new THREE.Mesh(bottleGeo, wineMat);
      bMesh.position.set(bx - 4.6 + wb * 0.9, 1.42, bz + 3.4);
      const nMesh = new THREE.Mesh(bottleNeckGeo, wineMat);
      nMesh.position.set(bx - 4.6 + wb * 0.9, 1.64, bz + 3.4);
      group.add(bMesh, nMesh);
    }
    // Red velvet VIP booths on East half
    const loungeVelvetMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.8 });
    addWall(bx + 4.2, 0.14, bz + 4.0, 2.6, 0.82, 1.4, loungeVelvetMat);
    addWall(bx + 4.2, 0.14, bz - 3.0, 2.6, 0.82, 1.4, loungeVelvetMat);
    addWall(bx + 4.2, 0.14, bz + 5.6, 2.8, 1.05, 0.8, metalMat);
    addWall(bx + 4.2, 0.14, bz - 4.6, 2.8, 1.05, 0.8, metalMat);
    disposables.push(barStripGeo, rackLedGeo, stoolGeo, wineMat, bottleGeo, bottleNeckGeo, loungeVelvetMat);

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

  // 5b. ENTERABLE AREA #2B: Realistic 24H SUPERMART (+24, +24) — Stocked Grocery Aisles, Chilled Coolers, Conveyor Checkout & Shopping Carts!
  const supermarketCheckoutPos = new THREE.Vector3(24 + 1.4, 0.14, 24 + 3.2);
  {
    const sx = 24;
    const sz = 24;
    const sw = 18;
    const sd = 18;
    const wallH = 4.6;

    const floorGeo = new THREE.BoxGeometry(sw, 0.1, sd);
    const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
    floor.position.set(sx, 0.09, sz);
    floor.receiveShadow = true;
    group.add(floor);
    disposables.push(floorGeo);

    // East & South solid walls
    addWall(sx + sw / 2 - 0.3, 0.08, sz, 0.6, wallH, sd, concreteTrimMat);
    addWall(sx, 0.08, sz + sd / 2 - 0.3, sw, wallH, 0.6, concreteTrimMat);
    // West wall facing spawn street: sliding door frame + destructible glass windows!
    addDestructibleGlassPane('glass_store_w1', sx - sw / 2 + 0.3, 0.08, sz - 5.6, 0.28, wallH - 0.4, 6.2);
    addDestructibleGlassPane('glass_store_w2', sx - sw / 2 + 0.3, 0.08, sz + 5.6, 0.28, wallH - 0.4, 6.2);
    // North wall with glass
    addDestructibleGlassPane('glass_store_n1', sx - 5.6, 0.08, sz - sd / 2 + 0.3, 6.2, wallH - 0.4, 0.28);
    addDestructibleGlassPane('glass_store_n2', sx + 5.6, 0.08, sz - sd / 2 + 0.3, 6.2, wallH - 0.4, 0.28);

    // Storefront Red/Green Canopy & Shopping Cart Corral outside West Entrance
    const greenAwnMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
    const redStripeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const awnGeo = new THREE.BoxGeometry(2.6, 0.28, sw + 0.4);
    const awn = new THREE.Mesh(awnGeo, greenAwnMat);
    awn.position.set(sx - sw / 2 - 1.2, wallH - 0.25, sz);
    const awnStripeGeo = new THREE.BoxGeometry(0.18, 0.28, sw + 0.42);
    const awnStripe = new THREE.Mesh(awnStripeGeo, redStripeMat);
    awnStripe.position.set(sx - sw / 2 - 2.45, wallH - 0.25, sz);
    group.add(awn, awnStripe);
    // Shopping carts parked neatly South of West entrance
    const cartGeo = new THREE.BoxGeometry(0.95, 0.85, 0.62);
    for (let c = 0; c < 3; c++) {
      const cart = new THREE.Mesh(cartGeo, metalMat);
      cart.position.set(sx - sw / 2 - 1.1, 0.52, sz + 4.4 + c * 0.72);
      group.add(cart);
    }
    disposables.push(greenAwnMat, redStripeMat, awnGeo, awnStripeGeo, cartGeo);

    // Upper tower above store
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

    // Checkout Conveyor Counter + Laser Scanner Arch + POS Touchscreen + Clerk Spot
    addWall(sx + 3.6, 0.14, sz + 3.6, 5.4, 1.06, 1.35, darkTrimMat);
    const beltGeo = new THREE.BoxGeometry(3.2, 0.06, 0.72);
    const belt = new THREE.Mesh(beltGeo, concreteTrimMat);
    belt.position.set(sx + 2.8, 1.23, sz + 3.6);
    const posScreenGeo = new THREE.BoxGeometry(0.55, 0.45, 0.12);
    const posScreen = new THREE.Mesh(posScreenGeo, cyanNeonMat);
    posScreen.position.set(sx + 4.6, 1.52, sz + 3.4);
    const payBeaconGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 12);
    const payBeaconMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const payBeacon = new THREE.Mesh(payBeaconGeo, payBeaconMat);
    payBeacon.position.set(supermarketCheckoutPos.x, 0.16, supermarketCheckoutPos.z);
    group.add(belt, posScreen, payBeacon);
    disposables.push(beltGeo, posScreenGeo, payBeaconGeo, payBeaconMat);

    // Double-Sided Stocked Grocery Aisles with Colorful Product Boxes
    const boxColors = [0xef4444, 0xf59e0b, 0x22c55e, 0x3b82f6, 0xa855f7, 0xeab308];
    const boxMats = boxColors.map((col) => new THREE.MeshStandardMaterial({ color: col, roughness: 0.55 }));
    const prodGeo = new THREE.BoxGeometry(0.38, 0.36, 0.26);
    for (const aisleZ of [sz - 3.6, sz + 0.4]) {
      addWall(sx - 2.0, 0.14, aisleZ, 5.2, 1.75, 0.95, metalMat);
      for (let tier = 0; tier < 2; tier++) {
        for (let px = 0; px < 6; px++) {
          const b1 = new THREE.Mesh(prodGeo, boxMats[(px + tier) % boxMats.length]);
          b1.position.set(sx - 4.1 + px * 0.82, 0.75 + tier * 0.65, aisleZ - 0.52);
          const b2 = new THREE.Mesh(prodGeo, boxMats[(px + tier + 2) % boxMats.length]);
          b2.position.set(sx - 4.1 + px * 0.82, 0.75 + tier * 0.65, aisleZ + 0.52);
          group.add(b1, b2);
        }
      }
    }
    // Illuminated Chilled Beverage Coolers along East Back Wall
    const coolerGlowMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    addWall(sx + sw / 2 - 1.15, 0.14, sz - 2.4, 1.1, 2.5, 9.6, metalMat);
    const coolerDoorGeo = new THREE.BoxGeometry(0.14, 1.85, 8.8);
    const coolerDoor = new THREE.Mesh(coolerDoorGeo, coolerGlowMat);
    coolerDoor.position.set(sx + sw / 2 - 1.74, 1.38, sz - 2.4);
    group.add(coolerDoor);
    // Fresh Produce Island
    addWall(sx - 5.2, 0.14, sz + 5.0, 2.6, 0.85, 1.6, concreteTrimMat);
    disposables.push(...boxMats, prodGeo, coolerGlowMat, coolerDoorGeo);

    for (const stZ of [sz - 3.0, sz + 3.0]) {
      const storeStripGeo = new THREE.BoxGeometry(10, 0.1, 0.8);
      const storeStrip = new THREE.Mesh(storeStripGeo, warmCeilingMat);
      storeStrip.position.set(sx, wallH - 0.08, stZ);
      group.add(storeStrip);
      disposables.push(storeStripGeo);
    }

    lightAnchors.push(
      { x: sx, y: 3.9, z: sz, color: 0xfff0c2, intensity: 30, distance: 26 },
      { x: sx - 9, y: 4.0, z: sz, color: 0x4ade80, intensity: 24, distance: 22 },
    );

    const signTex = createNeonSignTexture('24H SUPERMART', '#22c55e');
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: 0x22c55e,
      emissiveMap: signTex,
      emissiveIntensity: 1.8,
    });
    const signGeo = new THREE.BoxGeometry(0.25, 1.45, 6.2);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(sx - sw / 2 - 0.3, wallH + 0.95, sz);
    group.add(sign);
    disposables.push(signTex, signMat, signGeo);
  }

  // 5c. ENTERABLE AREA #2C: ATELIER VEX Boutique & Tailor (-24, +72) — Designer Canopy, Window Mannequins & Jewelry Case
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

    // Designer Entrance Canopy
    const bAwnGeo = new THREE.BoxGeometry(6.4, 0.26, 2.4);
    const bAwn = new THREE.Mesh(bAwnGeo, darkTrimMat);
    bAwn.position.set(ax, wallH - 0.22, az - ad / 2 - 1.1);
    group.add(bAwn);
    disposables.push(bAwnGeo);

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

    // Tailor Counter, Clothing Racks & Window Display Mannequins
    addWall(ax + 3.2, 0.14, az + 4.2, 4.8, 1.05, 1.0, darkTrimMat);
    const manBaseGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.3, 12);
    const manBodyGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.95, 10);
    const manHeadGeo = new THREE.SphereGeometry(0.16, 10, 8);
    for (const mx of [ax - 5.2, ax + 5.2]) {
      const mb = new THREE.Mesh(manBaseGeo, darkTrimMat);
      mb.position.set(mx, 0.28, az - ad / 2 + 1.45);
      const mTorso = new THREE.Mesh(manBodyGeo, metalMat);
      mTorso.position.set(mx, 0.95, az - ad / 2 + 1.45);
      const mHead = new THREE.Mesh(manHeadGeo, metalMat);
      mHead.position.set(mx, 1.62, az - ad / 2 + 1.45);
      group.add(mb, mTorso, mHead);
    }
    disposables.push(manBaseGeo, manBodyGeo, manHeadGeo);

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

  // 6. ENTERABLE AREA #3: Open-Bay Parking & Service Garage (-26, -26) — Upgraded with Two-Post Lift, Tool Chest & Oil Drums
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

    // Garage Lift Posts & Rolling Red Tool Chest
    const liftRedMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45, metalness: 0.45 });
    const postGeo = new THREE.BoxGeometry(0.32, 3.4, 0.32);
    const crossGeo = new THREE.BoxGeometry(3.8, 0.25, 0.32);
    const lp1 = new THREE.Mesh(postGeo, liftRedMat);
    lp1.position.set(gx - 7.5, 1.75, gz + 3.0);
    const lp2 = new THREE.Mesh(postGeo, liftRedMat);
    lp2.position.set(gx - 3.9, 1.75, gz + 3.0);
    const lCross = new THREE.Mesh(crossGeo, liftRedMat);
    lCross.position.set(gx - 5.7, 3.4, gz + 3.0);
    const chestGeo = new THREE.BoxGeometry(1.6, 1.15, 0.72);
    const chest = new THREE.Mesh(chestGeo, liftRedMat);
    chest.position.set(gx - 8.5, 0.68, gz - 6.0);
    group.add(lp1, lp2, lCross, chest);
    disposables.push(liftRedMat, postGeo, crossGeo, chestGeo);

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

  // 8a. HOTEL VEX (-26, -84.5): 6 Full Walkable Floors (1F Lobby .. 6F Imperial Penthouse) + Realistic Steel & Mahogany Elevator
  let hotelVex!: HotelVexSpec;
  {
    const hx = -26;
    const hz = -84.5;
    const hw = 24;
    const hd = 31;
    const floorH = 4.8;
    const y1 = 0.14;
    const y2 = 5.0;
    const y3 = 9.8;
    const y4 = 14.6;
    const y5 = 19.4;
    const y6 = 24.2;
    const allFloors: [number, number, number, number, number, number] = [y1, y2, y3, y4, y5, y6];
    const minX = hx - hw / 2; // -38
    const maxX = hx + hw / 2; // -14
    const minZ = hz - hd / 2; // -100
    const maxZ = hz + hd / 2; // -69

    const addWalkableSlab = (
      x1: number,
      x2: number,
      z1: number,
      z2: number,
      topY: number,
      thickness: number,
      mat: THREE.Material,
    ) => {
      const w = x2 - x1;
      const d = z2 - z1;
      const slabGeo = new THREE.BoxGeometry(w, thickness, d);
      const slab = new THREE.Mesh(slabGeo, mat);
      slab.position.set((x1 + x2) * 0.5, topY - thickness * 0.5, (z1 + z2) * 0.5);
      slab.receiveShadow = true;
      slab.castShadow = true;
      group.add(slab);
      disposables.push(slabGeo);
      walkables.push({
        minX: x1,
        maxX: x2,
        minZ: z1,
        maxZ: z2,
        yStart: topY,
        yEnd: topY,
        axis: 'flat',
      });
    };

    // --- 1F FLOOR & CARPET ---
    addWalkableSlab(minX, maxX, minZ, maxZ, y1, 0.12, interiorFloorMat);

    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x5c1424,
      roughness: 0.88,
      metalness: 0.05,
    });
    const carpetGeo = new THREE.BoxGeometry(3.4, 0.02, hd - 2);
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.position.set(hx, y1 + 0.01, hz);
    carpet.receiveShadow = true;
    group.add(carpet);
    disposables.push(carpetMat, carpetGeo);

    // Outer Perimeter Walls spanning 1F..5F (y = 0.08..24.2)
    addWall(hx, 0.08, minZ + 0.3, hw, 24.12, 0.6, concreteTrimMat);
    addWall(minX + 0.3, 0.08, hz, 0.6, 24.12, hd, concreteTrimMat);
    addWall(maxX - 0.3, 0.08, hz, 0.6, 24.12, hd, concreteTrimMat);

    // 1F South entrance facade (z = -69): open 5.6m lobby doors flanked by pillars & destructible glass
    addWall(minX + 1.4, 0.08, maxZ - 0.3, 2.8, floorH, 0.6, concreteTrimMat);
    addWall(maxX - 1.4, 0.08, maxZ - 0.3, 2.8, floorH, 0.6, concreteTrimMat);
    addDestructibleGlassPane('glass_hotel_s1', hx - 6.0, 0.08, maxZ - 0.3, 6.4, floorH - 0.4, 0.28);
    addDestructibleGlassPane('glass_hotel_s2', hx + 6.0, 0.08, maxZ - 0.3, 6.4, floorH - 0.4, 0.28);

    // 2F..5F South curtain glass + concrete piers
    for (const fy of [y2, y3, y4, y5]) {
      addWall(minX + 1.4, fy, maxZ - 0.3, 2.8, floorH, 0.6, concreteTrimMat);
      addWall(maxX - 1.4, fy, maxZ - 0.3, 2.8, floorH, 0.6, concreteTrimMat);
      const glassS = new THREE.Mesh(
        new THREE.BoxGeometry(18.0, floorH - 0.4, 0.26),
        shatterGlassMat,
      );
      glassS.position.set(hx, fy + (floorH - 0.4) * 0.5, maxZ - 0.3);
      group.add(glassS);
      disposables.push(glassS.geometry);
      colliders.push({
        minX: hx - 9.0,
        maxX: hx + 9.0,
        minZ: maxZ - 0.45,
        maxZ: maxZ - 0.15,
        minY: fy,
        height: fy + floorH,
      });
    }

    // Helper for Floor Slabs 2F..6F with exact Stairwell Cutout + Elevator Cutout (-20..-17, -75..-72)
    const addUpperHotelFloorSlab = (topY: number, isEvenFloor: boolean) => {
      // Even floors (2F, 4F, 6F): landing arrives at West stairwell (cutout x=-37.2..-33.8); 3F, 5F use East cutout (x=-33.6..-30.6)
      const cutMinX = isEvenFloor ? -37.2 : -33.6;
      const cutMaxX = isEvenFloor ? -33.8 : -30.6;
      // North section (z=-100..-80.5)
      addWalkableSlab(minX, maxX, minZ, -80.5, topY, 0.28, interiorFloorMat);
      // South section (-71.2..-69) clear across elevator south edge (-72)
      addWalkableSlab(minX, -20.1, -71.2, maxZ, topY, 0.28, interiorFloorMat);
      addWalkableSlab(-20.1, maxX, -71.9, maxZ, topY, 0.28, interiorFloorMat);
      // West strip left of cutout
      if (cutMinX > minX + 0.1) {
        addWalkableSlab(minX, cutMinX, -80.5, -71.2, topY, 0.28, interiorFloorMat);
      }
      // Mid strip between cutout and elevator shaft west face (-20.1)
      addWalkableSlab(cutMaxX, -20.1, -80.5, -71.2, topY, 0.28, interiorFloorMat);
      // Around elevator shaft East & North sides (shaft: x=-20.1..-16.9, z=-75.1..-71.9)
      addWalkableSlab(-20.1, maxX, -80.5, -75.1, topY, 0.28, interiorFloorMat);
      addWalkableSlab(-16.9, maxX, -75.1, -71.9, topY, 0.28, interiorFloorMat);
    };

    for (let i = 1; i < allFloors.length; i++) {
      addUpperHotelFloorSlab(allFloors[i], (i + 1) % 2 === 0);
    }

    // --- GRAND STAIRWELL RAMPS (1F -> 2F -> 3F -> 4F -> 5F -> 6F) ---
    const stepMat = new THREE.MeshStandardMaterial({
      color: 0x2a313d,
      roughness: 0.7,
      metalness: 0.25,
    });
    disposables.push(stepMat);

    const stairRun = 9.0;
    for (let f = 0; f < allFloors.length - 1; f++) {
      const yBot = allFloors[f];
      const yTop = allFloors[f + 1];
      const rise = yTop - yBot;
      const rampLen = Math.hypot(stairRun, rise);
      const rampAngle = Math.atan2(rise, stairRun);
      const isOddFlight = f % 2 === 0; // 1->2, 3->4, 5->6 go West sloping UP to -Z; 2->3, 4->5 go East sloping UP to +Z
      const cx = isOddFlight ? -35.3 : -32.1;
      const rampGeo = new THREE.BoxGeometry(isOddFlight ? 2.8 : 2.5, 0.24, rampLen);
      const rampMesh = new THREE.Mesh(rampGeo, stepMat);
      rampMesh.position.set(cx, (yBot + yTop) * 0.5 - 0.14, -76.0);
      rampMesh.rotation.x = isOddFlight ? rampAngle : -rampAngle;
      rampMesh.receiveShadow = true;
      group.add(rampMesh);
      disposables.push(rampGeo);
      walkables.push({
        minX: isOddFlight ? -36.8 : -33.5,
        maxX: isOddFlight ? -33.8 : -30.7,
        minZ: -80.5,
        maxZ: -71.5,
        yStart: isOddFlight ? yTop : yBot,
        yEnd: isOddFlight ? yBot : yTop,
        axis: 'z',
      });
      // Safety rail along landing
      addWall(-33.7, yTop, -75.9, 0.16, 1.0, 9.2, metalMat);
      if (!isOddFlight) {
        addWall(-30.6, yTop, -75.9, 0.16, 1.0, 9.2, metalMat);
      }
    }

    // --- REALISTIC STEEL & MAHOGANY ELEVATOR SHAFT + ANIMATED CABIN (-18.5, y, -73.5) ---
    const elevX = -18.5;
    const elevZ = -73.5;
    const elevatorPos = new THREE.Vector3(elevX, y1, elevZ);
    const shaftTotalH = y6 + 5.2;

    const shaftFrameGeo = new THREE.BoxGeometry(0.18, shaftTotalH, 0.18);
    for (const [fx, fz] of [
      [-1.38, -1.38],
      [1.38, -1.38],
      [-1.38, 1.38],
      [1.38, 1.38],
    ]) {
      const post = new THREE.Mesh(shaftFrameGeo, metalMat);
      post.position.set(elevX + fx, shaftTotalH * 0.5, elevZ + fz);
      group.add(post);
    }
    // Steel guide rails + counterweight shaft back
    const guideGeo = new THREE.BoxGeometry(2.6, shaftTotalH, 0.16);
    const guideBack = new THREE.Mesh(guideGeo, darkTrimMat);
    guideBack.position.set(elevX, shaftTotalH * 0.5, elevZ - 1.42);
    group.add(guideBack);
    disposables.push(shaftFrameGeo, guideGeo);

    // Landing Door Frames & Floor Indicators on all 6 floors
    const frameTopGeo = new THREE.BoxGeometry(2.8, 0.36, 0.24);
    const frameSideGeo = new THREE.BoxGeometry(0.24, 3.0, 0.24);
    const callLightGeo = new THREE.BoxGeometry(0.55, 0.18, 0.1);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.25,
    });
    const mahoganyMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.5,
      metalness: 0.15,
    });
    const mirrorCabinMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.85,
      roughness: 0.18,
    });
    disposables.push(frameTopGeo, frameSideGeo, callLightGeo, brassMat, mahoganyMat, mirrorCabinMat);

    for (const fy of allFloors) {
      const fTop = new THREE.Mesh(frameTopGeo, metalMat);
      fTop.position.set(elevX, fy + 2.75, elevZ + 1.35);
      const fL = new THREE.Mesh(frameSideGeo, metalMat);
      fL.position.set(elevX - 1.25, fy + 1.5, elevZ + 1.35);
      const fR = new THREE.Mesh(frameSideGeo, metalMat);
      fR.position.set(elevX + 1.25, fy + 1.5, elevZ + 1.35);
      const callLed = new THREE.Mesh(callLightGeo, cyanNeonMat);
      callLed.position.set(elevX, fy + 2.8, elevZ + 1.48);
      group.add(fTop, fL, fR, callLed);
    }

    // Animated Real Elevator Cabin Group
    const elevatorCabinGroup = new THREE.Group();
    elevatorCabinGroup.position.set(elevX, y1, elevZ);
    const cFloorGeo = new THREE.BoxGeometry(2.55, 0.14, 2.55);
    const cFloor = new THREE.Mesh(cFloorGeo, carpetMat);
    cFloor.position.set(0, -0.04, 0);
    const cCeil = new THREE.Mesh(cFloorGeo, metalMat);
    cCeil.position.set(0, 2.72, 0);
    const cBackGeo = new THREE.BoxGeometry(2.5, 2.68, 0.12);
    const cBack = new THREE.Mesh(cBackGeo, mirrorCabinMat);
    cBack.position.set(0, 1.34, -1.24);
    const cSideGeo = new THREE.BoxGeometry(0.12, 2.68, 2.5);
    const cLeft = new THREE.Mesh(cSideGeo, mahoganyMat);
    cLeft.position.set(-1.24, 1.34, 0);
    const cRight = new THREE.Mesh(cSideGeo, mahoganyMat);
    cRight.position.set(1.24, 1.34, 0);
    // Brass handrails & illuminated ceiling skylight panel
    const railBackGeo = new THREE.CylinderGeometry(0.032, 0.032, 2.1, 8);
    railBackGeo.rotateZ(Math.PI / 2);
    const railBack = new THREE.Mesh(railBackGeo, brassMat);
    railBack.position.set(0, 1.0, -1.1);
    const domeGeo = new THREE.BoxGeometry(1.4, 0.08, 1.4);
    const dome = new THREE.Mesh(domeGeo, warmCeilingMat);
    dome.position.set(0, 2.62, 0);
    // Double Sliding Doors at front (+Z) of cabin (open = split apart!)
    const cabDoorGeo = new THREE.BoxGeometry(1.16, 2.5, 0.09);
    const cabDoorMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.72,
      roughness: 0.28,
      transparent: true,
      opacity: 0.82,
    });
    const elevatorDoorL = new THREE.Mesh(cabDoorGeo, cabDoorMat);
    elevatorDoorL.position.set(-1.12, 1.25, 1.22); // open at start
    const elevatorDoorR = new THREE.Mesh(cabDoorGeo, cabDoorMat);
    elevatorDoorR.position.set(1.12, 1.25, 1.22);
    elevatorCabinGroup.add(cFloor, cCeil, cBack, cLeft, cRight, railBack, dome, elevatorDoorL, elevatorDoorR);
    group.add(elevatorCabinGroup);
    disposables.push(cFloorGeo, cBackGeo, cSideGeo, railBackGeo, domeGeo, cabDoorGeo, cabDoorMat);

    // --- 6F IMPERIAL PENTHOUSE & OPEN-AIR SKY TERRACE (y = 24.2) ---
    addWall(hx, y6, minZ + 0.3, hw, floorH, 0.6, concreteTrimMat);
    addWall(minX + 0.3, y6, -92.5, 0.6, floorH, 15.0, concreteTrimMat);
    addWall(maxX - 0.3, y6, -92.5, 0.6, floorH, 15.0, concreteTrimMat);
    // Open-air Sky Terrace south & side metal balustrades (z = -85..-69)
    addWall(hx, y6, maxZ - 0.25, hw, 1.05, 0.35, metalMat);
    addWall(minX + 0.25, y6, -77.0, 0.35, 1.05, 16.0, metalMat);
    addWall(maxX - 0.25, y6, -77.0, 0.35, 1.05, 16.0, metalMat);

    // Penthouse Bar & Sofa + Sky Lounge Deck Chairs
    addWall(hx + 4.5, y6, -95.0, 4.4, 1.05, 1.1, darkTrimMat);
    addWall(hx - 4.0, y6, -93.0, 3.2, 0.85, 1.4, carpetMat);
    addWall(hx + 3.0, y6, -75.0, 3.6, 0.72, 1.5, darkTrimMat);

    // Crown Roof above 6F Penthouse North Wing
    const pRoofGeo = new THREE.BoxGeometry(hw + 0.4, 0.5, 15.6);
    const pRoof = new THREE.Mesh(pRoofGeo, concreteTrimMat);
    pRoof.position.set(hx, y6 + floorH + 0.25, -92.2);
    group.add(pRoof);
    const crownTowerGeo = new THREE.BoxGeometry(hw - 2.4, 5.2, 12.6);
    const crownTower = new THREE.Mesh(crownTowerGeo, facadeMats[0]);
    crownTower.position.set(hx, y6 + floorH + 3.1, -92.2);
    crownTower.castShadow = true;
    group.add(crownTower);
    disposables.push(pRoofGeo, crownTowerGeo);

    // --- 1F CONCIERGE FRONT DESK (z = -76.8) ---
    addWall(hx, y1, -76.8, 5.4, 1.12, 1.15, darkTrimMat);
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

    // 1F Lobby partition wall at z = -81 separating Lobby from Guest Wing corridor
    addWall(-31.2, 0.08, -81, 5.0, floorH, 0.45, concreteTrimMat);
    addWall(hx + 7.4, 0.08, -81, 9.2, floorH, 0.45, concreteTrimMat);

    // 1F..5F Suite Dividers
    for (const fy of [0.08, y2, y3, y4, y5]) {
      addWall(hx - 7.4, fy, -90.5, 9.2, floorH, 0.45, concreteTrimMat);
      addWall(hx + 7.4, fy, -90.5, 9.2, floorH, 0.45, concreteTrimMat);
      if (fy > 1.0) {
        addWall(hx, fy, -74.5, 4.8, 0.95, 1.4, darkTrimMat);
      }
    }

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
      addWall(wallX, 0.08, zStart + segLen / 2, 0.4, floorH, segLen, concreteTrimMat);
      addWall(wallX, 0.08, zEnd - segLen / 2, 0.4, floorH, segLen, concreteTrimMat);

      const lintelGeo = new THREE.BoxGeometry(0.4, floorH - 2.6, 2.2);
      const lintel = new THREE.Mesh(lintelGeo, concreteTrimMat);
      lintel.position.set(wallX, 2.6 + (floorH - 2.6) / 2, doorCenterZ);
      group.add(lintel);
      disposables.push(lintelGeo);

      const doorPivot = new THREE.Group();
      doorPivot.position.set(wallX, y1, doorCenterZ - 0.98);
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
        doorPos: new THREE.Vector3(wallX + sideSign * 0.9, y1, doorCenterZ),
        bedPos,
      };
    };

    const addSuiteFurnishings = (
      bx: number,
      by: number,
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
      frame.position.set(bx, by + 0.22, bz);
      const mattress = new THREE.Mesh(mattressGeo, mattressMat);
      mattress.position.set(bx, by + 0.56, bz);
      group.add(frame, mattress);
      disposables.push(frameGeo, mattressGeo, mattressMat);
      colliders.push({
        minX: bx - 1.15,
        maxX: bx + 1.15,
        minZ: bz - 1.05,
        maxZ: bz + 1.05,
        minY: by,
        height: by + 0.9,
      });
    };

    const bed201 = new THREE.Vector3(-34.6, y1, -85.8);
    const bed202 = new THREE.Vector3(-34.6, y1, -95.2);
    const bed203 = new THREE.Vector3(-17.4, y1, -85.8);
    addSuiteFurnishings(bed201.x, y1, bed201.z, false);
    addSuiteFurnishings(bed202.x, y1, bed202.z, false);
    addSuiteFurnishings(bed203.x, y1, bed203.z, false);
    addSuiteFurnishings(-16.8, y1, -93.0, true);

    // 2F..5F Open Suites Furnishings
    for (const fy of [y2, y3, y4, y5]) {
      addSuiteFurnishings(-34.6, fy, -85.8, false);
      addSuiteFurnishings(-34.6, fy, -95.2, false);
      addSuiteFurnishings(-17.4, fy, -85.8, false);
      addSuiteFurnishings(-17.4, fy, -95.2, fy === y5);
    }

    const door201 = addCorridorWallWithDoor('201', -28.6, -90.5, -81.0, 1, false, bed201);
    const door202 = addCorridorWallWithDoor('202', -28.6, -100.0, -90.5, 1, false, bed202);
    const door203 = addCorridorWallWithDoor('203', -23.4, -90.5, -81.0, -1, false, bed203);
    const door204 = addCorridorWallWithDoor('204', -23.4, -100.0, -90.5, -1, false);

    // Suite 204 VIP Vault Desk + Glowing Encrypted Obsidian Ledger
    addWall(-17.5, y1, -97.6, 2.8, 0.96, 1.1, darkTrimMat);
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

    // Interior Lighting across all 6 Floors + Exterior Sign
    for (const fy of allFloors) {
      for (const lz of [-74.5, -85.5, -95.0]) {
        const stripGeo = new THREE.BoxGeometry(3.4, 0.1, 1.0);
        const strip = new THREE.Mesh(stripGeo, warmCeilingMat);
        strip.position.set(hx, fy + floorH - 0.35, lz);
        group.add(strip);
        disposables.push(stripGeo);
      }
    }
    lightAnchors.push(
      { x: hx, y: 4.3, z: -74.5, color: 0xffdca8, intensity: 30, distance: 26 },
      { x: hx, y: 4.3, z: -90.0, color: 0xffd28a, intensity: 26, distance: 26 },
      { x: -18.5, y: 4.0, z: -95.5, color: 0x34d399, intensity: 22, distance: 18 },
      { x: hx, y: y2 + 4.0, z: -86.0, color: 0xffe4b0, intensity: 26, distance: 26 },
      { x: hx, y: y4 + 4.0, z: -86.0, color: 0xfbbf24, intensity: 26, distance: 26 },
      { x: hx, y: y6 + 3.6, z: -84.0, color: 0xfde68a, intensity: 30, distance: 28 },
      { x: hx, y: 4.5, z: maxZ + 3.8, color: 0xf59e0b, intensity: 24, distance: 24 },
    );

    const hSignTex = createNeonSignTexture('HOTEL VEX · 6F', '#f59e0b');
    const hSignMat = new THREE.MeshStandardMaterial({
      map: hSignTex,
      emissive: 0xf59e0b,
      emissiveMap: hSignTex,
      emissiveIntensity: 1.9,
    });
    const hSignGeo = new THREE.BoxGeometry(6.4, 1.5, 0.25);
    const hSign = new THREE.Mesh(hSignGeo, hSignMat);
    hSign.position.set(hx, floorH + 0.9, maxZ + 0.35);
    group.add(hSign);
    disposables.push(hSignTex, hSignMat, hSignGeo);

    extraZones.push(
      { name: 'Hotel Vex Lobby (1F)', minX, maxX, minZ: -81, maxZ },
      { name: 'Hotel Vex Suites (1F)', minX, maxX, minZ, maxZ: -81 },
    );

    hotelVex = {
      deskPos: new THREE.Vector3(hx, y1, -75.4),
      conciergePos: new THREE.Vector3(hx, y1, -78.4),
      elevatorPos,
      floorY: allFloors,
      elevatorCabinGroup,
      elevatorDoorL,
      elevatorDoorR,
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

    // Interior counter / table away from doorway + Exterior Awning + Realistic Business-Specific Interiors!
    const counterX = b.doorSide === 'east' ? b.x - b.w * 0.2 : b.doorSide === 'west' ? b.x + b.w * 0.2 : b.x;
    const counterZ = b.doorSide === 'south' ? b.z - b.d * 0.2 : b.doorSide === 'north' ? b.z + b.d * 0.2 : b.z;
    addWall(counterX, 0.14, counterZ, 3.6, 1.05, 1.1, darkTrimMat);

    // Architectural Awning over each business entrance
    const awnW = b.doorSide === 'north' || b.doorSide === 'south' ? doorW + 1.8 : 2.2;
    const awnD = b.doorSide === 'east' || b.doorSide === 'west' ? doorW + 1.8 : 2.2;
    const bAwnGeo = new THREE.BoxGeometry(awnW, 0.24, awnD);
    const bAwn = new THREE.Mesh(bAwnGeo, darkTrimMat);
    if (b.doorSide === 'south') bAwn.position.set(b.x, wallH - 0.2, maxZ + 1.0);
    else if (b.doorSide === 'north') bAwn.position.set(b.x, wallH - 0.2, minZ - 1.0);
    else if (b.doorSide === 'east') bAwn.position.set(maxX + 1.0, wallH - 0.2, b.z);
    else bAwn.position.set(minX - 1.0, wallH - 0.2, b.z);
    group.add(bAwn);
    disposables.push(bAwnGeo);

    // Business-specific realistic interior details & Bank Server Terminal side mission!
    if (b.name.includes('Cyber Arcade')) {
      const cabGeo = new THREE.BoxGeometry(0.85, 1.85, 0.85);
      const scrGeo = new THREE.BoxGeometry(0.65, 0.55, 0.08);
      const purpMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, emissive: 0xa855f7, emissiveIntensity: 1.5 });
      for (let i = 0; i < 4; i++) {
        const cz = b.z - 2.6 + i * 1.65;
        const cab = new THREE.Mesh(cabGeo, darkTrimMat);
        cab.position.set(b.x - 3.6, 1.0, cz);
        const scr = new THREE.Mesh(scrGeo, purpMat);
        scr.position.set(b.x - 3.15, 1.38, cz);
        scr.rotation.y = Math.PI / 2;
        group.add(cab, scr);
      }
      disposables.push(cabGeo, scrGeo, purpMat);
    } else if (b.name.includes('Meridian Bank')) {
      // Bank Vault Door on North wall + Teller Glass Bar + Glowing Hackable Offshore Terminal!
      const vaultGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.45, 16);
      vaultGeo.rotateX(Math.PI / 2);
      const vaultDoor = new THREE.Mesh(vaultGeo, metalMat);
      vaultDoor.position.set(b.x + 5.5, 2.0, minZ + 0.85);
      const tellerGlass = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.15, 0.12), shatterGlassMat);
      tellerGlass.position.set(counterX, 1.72, counterZ + 0.35);
      group.add(vaultDoor, tellerGlass);
      const termPos = new THREE.Vector3(b.x - 5.5, 0.14, b.z - 4.2);
      addWall(termPos.x, 0.14, termPos.z, 1.2, 1.1, 0.8, darkTrimMat);
      const hackMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.48, 0.14),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x38bdf8, emissiveIntensity: 2.4 }),
      );
      hackMesh.position.set(termPos.x, 1.52, termPos.z);
      const ringMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.05, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
      );
      ringMesh.position.set(termPos.x, 0.16, termPos.z + 1.1);
      group.add(hackMesh, ringMesh);
      extraMissions.push({
        id: 'bank_hack',
        pos: new THREE.Vector3(termPos.x, 0.14, termPos.z + 1.1),
        mesh: hackMesh,
        ringMesh,
        rewardCash: 850,
        completed: false,
      });
      disposables.push(vaultGeo, tellerGlass.geometry, hackMesh.geometry, hackMesh.material, ringMesh.geometry, ringMesh.material);
    } else if (b.name.includes('Velvet Jazz Club')) {
      const stageGeo = new THREE.BoxGeometry(6.8, 0.45, 3.8);
      const stage = new THREE.Mesh(stageGeo, concreteTrimMat);
      stage.position.set(b.x, 0.32, b.z + 4.8);
      const pianoGeo = new THREE.BoxGeometry(2.1, 0.95, 1.5);
      const piano = new THREE.Mesh(pianoGeo, darkTrimMat);
      piano.position.set(b.x - 1.2, 1.0, b.z + 4.8);
      group.add(stage, piano);
      disposables.push(stageGeo, pianoGeo);
    } else if (b.name.includes('Metro Transit')) {
      const kioskGeo = new THREE.BoxGeometry(0.9, 1.9, 1.6);
      const kiosk = new THREE.Mesh(kioskGeo, cyanNeonMat);
      kiosk.position.set(b.x - 6.5, 1.05, b.z + 2.5);
      const benchGeo = new THREE.BoxGeometry(4.2, 0.55, 0.9);
      const bench = new THREE.Mesh(benchGeo, metalMat);
      bench.position.set(b.x + 4.5, 0.4, b.z + 3.0);
      group.add(kiosk, bench);
      disposables.push(kioskGeo, benchGeo);
    } else if (b.name.includes('Harbor Logistics') || b.name.includes('Eastside Imports')) {
      const crateGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
      const crate = new THREE.Mesh(crateGeo, concreteTrimMat);
      crate.position.set(b.x - 4.2, 0.85, b.z);
      const crate2 = new THREE.Mesh(crateGeo, concreteTrimMat);
      crate2.position.set(b.x - 4.2, 2.25, b.z);
      group.add(crate, crate2);
      disposables.push(crateGeo);
    } else if (b.name.includes('Pawn 24H') || b.name.includes('Westside Lofts')) {
      const caseGeo = new THREE.BoxGeometry(1.2, 1.05, 4.4);
      const gCase = new THREE.Mesh(caseGeo, shatterGlassMat);
      gCase.position.set(b.x + 2.5, 0.68, b.z);
      group.add(gCase);
      disposables.push(caseGeo);
    }

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

  // Outer-Ring District Buildings & Landmarks around the Expanded Perimeter (-142 / +142)
  const outerDistrictBuildings: Array<[number, number, number, number, number, number]> = [
    [-142, -82, 24, 24, 32, 0],
    [-142, -26, 26, 22, 24, 1],
    [-142, 26, 24, 26, 28, 2],
    [-142, 82, 24, 24, 36, 0],
    [-142, 142, 26, 24, 22, 1],
    [-82, 142, 24, 24, 30, 0],
    [82, 142, 24, 24, 28, 2],
    [-82, -142, 24, 24, 34, 1],
    [-28, -142, 24, 22, 42, 0],
    [28, -142, 24, 22, 38, 0],
    [82, -142, 24, 24, 26, 2],
  ];
  for (const [bx, bz, bw, bd, bh, style] of outerDistrictBuildings) {
    const oGeo = new THREE.BoxGeometry(bw, bh, bd);
    const oMesh = new THREE.Mesh(oGeo, facadeMats[style]);
    oMesh.position.set(bx, bh / 2 + 0.08, bz);
    oMesh.castShadow = true;
    oMesh.receiveShadow = true;
    group.add(oMesh);
    disposables.push(oGeo);
    colliders.push({
      minX: bx - bw / 2,
      maxX: bx + bw / 2,
      minZ: bz - bd / 2,
      maxZ: bz + bd / 2,
      height: bh + 0.5,
    });
  }

  // 8c. ELEGANT HOUSE: RAVENSCROFT VILLA (-82, -82) — Deliver Fine Wine for Custom Weapons!
  const villaTablePos = new THREE.Vector3(-82.5, 0.14, -81.5);
  {
    const vx = -82;
    const vz = -82;
    const vw = 20;
    const vd = 18;
    const wallH = 5.2;
    const minX = vx - vw / 2; // -92
    const maxX = vx + vw / 2; // -72
    const minZ = vz - vd / 2; // -91
    const maxZ = vz + vd / 2; // -73

    const swGeo = new THREE.BoxGeometry(38, 0.08, 38);
    const sw = new THREE.Mesh(swGeo, sidewalkMat);
    sw.position.set(vx, 0.04, vz);
    sw.receiveShadow = true;
    group.add(sw);
    disposables.push(swGeo);

    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xe2ddd4,
      roughness: 0.25,
      metalness: 0.12,
    });
    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x6b1224,
      roughness: 0.85,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.28,
      metalness: 0.85,
    });
    const vFloorGeo = new THREE.BoxGeometry(vw, 0.12, vd);
    const vFloor = new THREE.Mesh(vFloorGeo, marbleMat);
    vFloor.position.set(vx, 0.09, vz);
    vFloor.receiveShadow = true;
    const rugGeo = new THREE.BoxGeometry(10, 0.02, 8);
    const rug = new THREE.Mesh(rugGeo, velvetMat);
    rug.position.set(vx, 0.16, vz);
    group.add(vFloor, rug);
    disposables.push(marbleMat, velvetMat, goldMat, vFloorGeo, rugGeo);

    // North, West, South walls + East Portico Entrance (open center 4.8m doorway at x = -72)
    addWall(vx, 0.08, minZ + 0.3, vw, wallH, 0.6, marbleMat);
    addWall(minX + 0.3, 0.08, vz, 0.6, wallH, vd, marbleMat);
    addWall(vx, 0.08, maxZ - 0.3, vw, wallH, 0.6, marbleMat);
    addWall(maxX - 0.3, 0.08, vz - 5.6, 0.6, wallH, 6.8, marbleMat);
    addWall(maxX - 0.3, 0.08, vz + 5.6, 0.6, wallH, 6.8, marbleMat);
    addDestructibleGlassPane('glass_villa_e1', maxX - 0.3, 0.08, vz - 2.9, 0.24, wallH - 0.6, 1.4);
    addDestructibleGlassPane('glass_villa_e2', maxX - 0.3, 0.08, vz + 2.9, 0.24, wallH - 0.6, 1.4);

    // Classical Columns outside East portico
    const colGeo = new THREE.CylinderGeometry(0.28, 0.34, wallH, 12);
    for (const cz of [vz - 3.0, vz + 3.0]) {
      const col = new THREE.Mesh(colGeo, marbleMat);
      col.position.set(maxX + 1.4, wallH / 2 + 0.08, cz);
      col.castShadow = true;
      group.add(col);
    }
    const vRoofGeo = new THREE.BoxGeometry(vw + 3.2, 0.55, vd + 1.0);
    const vRoof = new THREE.Mesh(vRoofGeo, concreteTrimMat);
    vRoof.position.set(vx + 0.8, wallH + 0.32, vz);
    vRoof.castShadow = true;
    const crownGeo = new THREE.ConeGeometry(10.5, 3.8, 4);
    const crown = new THREE.Mesh(crownGeo, darkTrimMat);
    crown.position.set(vx, wallH + 2.5, vz);
    crown.rotation.y = Math.PI / 4;
    group.add(vRoof, crown);
    disposables.push(colGeo, vRoofGeo, crownGeo);

    // Interior Tasting Table & Armory Weapon Rack Display
    addWall(villaTablePos.x, 0.14, villaTablePos.z, 2.4, 0.92, 1.4, darkTrimMat);
    const rackGeo = new THREE.BoxGeometry(3.2, 1.6, 0.4);
    const rack = new THREE.Mesh(rackGeo, goldMat);
    rack.position.set(vx - 6.8, 0.95, vz);
    group.add(rack);
    disposables.push(rackGeo);
    colliders.push({
      minX: vx - 8.4,
      maxX: vx - 5.2,
      minZ: vz - 0.4,
      maxZ: vz + 0.4,
      minY: 0.14,
      height: 1.8,
    });

    lightAnchors.push(
      { x: vx, y: 4.4, z: vz, color: 0xfde68a, intensity: 30, distance: 26 },
      { x: maxX + 2.5, y: 4.2, z: vz, color: 0xfbbf24, intensity: 22, distance: 20 },
    );
    const vSignTex = createNeonSignTexture('RAVENSCROFT VILLA', '#fbbf24');
    const vSignMat = new THREE.MeshStandardMaterial({
      map: vSignTex,
      emissive: 0xfbbf24,
      emissiveMap: vSignTex,
      emissiveIntensity: 1.5,
    });
    const vSignGeo = new THREE.BoxGeometry(0.25, 1.2, 5.4);
    const vSign = new THREE.Mesh(vSignGeo, vSignMat);
    vSign.position.set(maxX + 2.4, wallH + 0.85, vz);
    group.add(vSign);
    disposables.push(vSignTex, vSignMat, vSignGeo);

    extraZones.push({ name: 'Ravenscroft Villa (Interior)', minX, maxX, minZ, maxZ });
  }

  // 8d. SW RESIDENTIAL SUBURB (-82, +82) — 3 Enterable Houses with Lockable Doors, Safes & Side Mission Item
  {
    const subSwGeo = new THREE.BoxGeometry(38, 0.08, 38);
    const subSw = new THREE.Mesh(subSwGeo, sidewalkMat);
    subSw.position.set(-82, 0.04, 82);
    subSw.receiveShadow = true;
    group.add(subSw);
    disposables.push(subSwGeo);

    const houseSpecs: Array<{
      id: string;
      name: string;
      x: number;
      z: number;
      w: number;
      d: number;
      wallColor: number;
      roofColor: number;
      lootCash: number;
      hasSideDrive?: boolean;
    }> = [
      { id: 'house_maple', name: 'Maple House #14', x: -72, z: 73, w: 12, d: 11, wallColor: 0x64748b, roofColor: 0x334155, lootCash: 350 },
      { id: 'house_cedar', name: 'Cedar House #28', x: -91, z: 73, w: 12, d: 11, wallColor: 0x785a46, roofColor: 0x3b2618, lootCash: 425 },
      { id: 'house_oak', name: 'Oak Residence #42', x: -81.5, z: 92, w: 15, d: 12, wallColor: 0x475569, roofColor: 0x1e293b, lootCash: 500, hasSideDrive: true },
    ];

    houseSpecs.forEach((h) => {
      const wallH = 3.9;
      const minX = h.x - h.w / 2;
      const maxX = h.x + h.w / 2;
      const minZ = h.z - h.d / 2;
      const maxZ = h.z + h.d / 2;

      const houseWallMat = new THREE.MeshStandardMaterial({
        color: h.wallColor,
        roughness: 0.78,
      });
      const houseRoofMat = new THREE.MeshStandardMaterial({
        color: h.roofColor,
        roughness: 0.65,
      });
      const floorGeo = new THREE.BoxGeometry(h.w, 0.1, h.d);
      const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
      floor.position.set(h.x, 0.09, h.z);
      floor.receiveShadow = true;
      group.add(floor);
      disposables.push(houseWallMat, houseRoofMat, floorGeo);

      // Solid East, West, South walls + North front wall with 2.0m center door & window panes
      addWall(minX + 0.25, 0.08, h.z, 0.5, wallH, h.d, houseWallMat);
      addWall(maxX - 0.25, 0.08, h.z, 0.5, wallH, h.d, houseWallMat);
      addWall(h.x, 0.08, maxZ - 0.25, h.w, wallH, 0.5, houseWallMat);

      const segW = (h.w - 2.1) * 0.5;
      addWall(h.x - 1.05 - segW * 0.5, 0.08, minZ + 0.25, segW, wallH, 0.5, houseWallMat);
      addWall(h.x + 1.05 + segW * 0.5, 0.08, minZ + 0.25, segW, wallH, 0.5, houseWallMat);
      const lintelGeo = new THREE.BoxGeometry(2.2, wallH - 2.5, 0.5);
      const lintel = new THREE.Mesh(lintelGeo, houseWallMat);
      lintel.position.set(h.x, 2.5 + (wallH - 2.5) * 0.5, minZ + 0.25);
      group.add(lintel);

      // Roof & gable
      const roofGeo = new THREE.BoxGeometry(h.w + 0.8, 0.35, h.d + 0.8);
      const roof = new THREE.Mesh(roofGeo, houseRoofMat);
      roof.position.set(h.x, wallH + 0.2, h.z);
      roof.castShadow = true;
      const gableGeo = new THREE.ConeGeometry(Math.max(h.w, h.d) * 0.72, 2.4, 4);
      const gable = new THREE.Mesh(gableGeo, houseRoofMat);
      gable.position.set(h.x, wallH + 1.55, h.z);
      gable.rotation.y = Math.PI / 4;
      group.add(roof, gable);
      disposables.push(lintelGeo, roofGeo, gableGeo);

      // Hinged Lockable House Front Door
      const doorPivot = new THREE.Group();
      doorPivot.position.set(h.x - 0.96, 0.14, minZ + 0.25);
      const dMat = new THREE.MeshStandardMaterial({ color: 0x3b2416, roughness: 0.55 });
      const dGeo = new THREE.BoxGeometry(1.92, 2.4, 0.14);
      const dMesh = new THREE.Mesh(dGeo, dMat);
      dMesh.position.set(0.96, 1.2, 0);
      dMesh.castShadow = true;
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), ledMat);
      led.position.set(1.74, 1.24, -0.11);
      doorPivot.add(dMesh, led);
      group.add(doorPivot);

      const colliderIndex = colliders.length;
      colliders.push({
        minX: h.x - 1.0,
        maxX: h.x + 1.0,
        minZ: minZ,
        maxZ: minZ + 0.5,
        minY: 0.08,
        height: 2.6,
      });

      // Interior Bed, Table & Stealable Wall Safe
      addWall(h.x - h.w * 0.28, 0.14, h.z + h.d * 0.2, 2.1, 0.72, 1.8, darkTrimMat);
      addWall(h.x + h.w * 0.25, 0.14, h.z - 0.5, 1.8, 0.78, 1.1, metalMat);

      const safePos = new THREE.Vector3(h.x + h.w * 0.28, 1.15, h.z + h.d * 0.28);
      const safeGeo = new THREE.BoxGeometry(0.85, 0.95, 0.75);
      const safeMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.75,
        metalness: 0.75,
        roughness: 0.25,
      });
      const safeMesh = new THREE.Mesh(safeGeo, safeMat);
      safeMesh.position.copy(safePos);
      group.add(safeMesh);
      disposables.push(dMat, dGeo, led.geometry, ledMat, safeGeo, safeMat);
      colliders.push({
        minX: safePos.x - 0.45,
        maxX: safePos.x + 0.45,
        minZ: safePos.z - 0.4,
        maxZ: safePos.z + 0.4,
        minY: 0.14,
        height: 1.7,
      });

      let sideItemMesh: THREE.Mesh | undefined;
      let sideItemPos: THREE.Vector3 | undefined;
      if (h.hasSideDrive) {
        sideItemPos = new THREE.Vector3(h.x + h.w * 0.25, 1.05, h.z - 0.5);
        const driveGeo = new THREE.BoxGeometry(0.45, 0.12, 0.34);
        const driveMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          emissive: 0x38bdf8,
          emissiveIntensity: 2.2,
          metalness: 0.85,
          roughness: 0.2,
        });
        sideItemMesh = new THREE.Mesh(driveGeo, driveMat);
        sideItemMesh.position.copy(sideItemPos);
        group.add(sideItemMesh);
        disposables.push(driveGeo, driveMat);
      }

      const signTex = createNeonSignTexture(h.name.toUpperCase(), '#f59e0b');
      const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        emissive: 0xf59e0b,
        emissiveMap: signTex,
        emissiveIntensity: 1.2,
      });
      const signGeo = new THREE.BoxGeometry(3.4, 0.7, 0.16);
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(h.x, 3.1, minZ - 0.15);
      sign.rotation.y = Math.PI;
      group.add(sign);
      disposables.push(signTex, signMat, signGeo);

      lightAnchors.push({
        x: h.x,
        y: 3.4,
        z: h.z,
        color: 0xfde68a,
        intensity: 18,
        distance: 16,
      });
      extraZones.push({ name: `${h.name} (Interior)`, minX, maxX, minZ, maxZ });

      houses.push({
        id: h.id,
        name: h.name,
        doorPivot,
        lockLedMat: ledMat,
        colliderIndex,
        doorPos: new THREE.Vector3(h.x, 0.14, minZ - 0.7),
        unlocked: false,
        doorSideSign: -1,
        safeMesh,
        safePos,
        lootCash: h.lootCash,
        robbed: false,
        sideItemMesh,
        sideItemPos,
        sideItemDone: false,
      });
    });
  }

  // 8e. SANITATION GARBAGE TRUCK PROP (West Neon Alleyways x = -64, z = -10)
  {
    const gx = -64;
    const gz = -10;
    const truck = new THREE.Group();
    truck.position.set(gx, 0.08, gz);
    const truckGreenMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.55, metalness: 0.35 });
    const cabGeo = new THREE.BoxGeometry(2.4, 2.3, 2.2);
    const cab = new THREE.Mesh(cabGeo, truckGreenMat);
    cab.position.set(0, 1.45, 2.4);
    const hopperGeo = new THREE.BoxGeometry(2.5, 2.6, 5.2);
    const hopper = new THREE.Mesh(hopperGeo, truckGreenMat);
    hopper.position.set(0, 1.65, -1.4);
    const beaconGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.18, 8);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 2.2 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 2.7, 2.6);
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.32, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    for (const [wx, wz] of [[-1.15, 2.2], [1.15, 2.2], [-1.15, -2.5], [1.15, -2.5]]) {
      const w = new THREE.Mesh(wheelGeo, darkTrimMat);
      w.position.set(wx, 0.45, wz);
      truck.add(w);
    }
    truck.add(cab, hopper, beacon);
    group.add(truck);
    disposables.push(truckGreenMat, cabGeo, hopperGeo, beaconGeo, beaconMat, wheelGeo);
    colliders.push({
      minX: gx - 1.35,
      maxX: gx + 1.35,
      minZ: gz - 4.1,
      maxZ: gz + 3.6,
      minY: 0,
      height: 3.1,
    });
  }

  // 8f. BIRD PERCHES (Sidewalks, Plaza & Rooftops)
  birdPerches.push(
    { position: new THREE.Vector3(-8.5, 0.08, 42), rooftop: false },
    { position: new THREE.Vector3(8.5, 0.08, 36), rooftop: false },
    { position: new THREE.Vector3(-12.5, 0.08, 52), rooftop: false },
    { position: new THREE.Vector3(12.5, 0.08, 12), rooftop: false },
    { position: new THREE.Vector3(-12.5, 0.08, -14), rooftop: false },
    { position: new THREE.Vector3(-68, 0.08, 66), rooftop: false },
    { position: new THREE.Vector3(-70, 0.08, -76), rooftop: false },
    { position: new THREE.Vector3(64, 3.4, 2), rooftop: true },
    { position: new THREE.Vector3(-24, 9.8, -74), rooftop: true },
    { position: new THREE.Vector3(-28, 9.8, -78), rooftop: true },
  );

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

  // 10. Diverse Driveable Vehicles (Sedan, Coupe, Muscle, SUV, Pickup, Van, Police)
  const carColors = [0x1c2430, 0x5b1f26, 0x1f3d33, 0x3b4454, 0x6b4e23, 0x0f766e, 0x7c2d12];
  const variantsPool: VehicleVariant[] = ['sedan', 'coupe', 'muscle', 'suv', 'pickup', 'van'];
  interface VehicleSpawnConfig {
    x: number;
    z: number;
    rotY: number;
    locked: boolean;
    isNpcTraffic: boolean;
    isPoliceCruiser?: boolean;
    variant?: VehicleVariant;
    waypoints?: THREE.Vector3[];
  }
  const carSpots: VehicleSpawnConfig[] = [
    { x: -6.5, z: 36, rotY: 0, locked: true, isNpcTraffic: false, variant: 'muscle' },
    { x: 7.2, z: -32, rotY: Math.PI, locked: false, isNpcTraffic: false, variant: 'coupe' },
    { x: -7.2, z: -16, rotY: 0, locked: true, isNpcTraffic: false, variant: 'suv' },
    { x: 7.2, z: 16, rotY: Math.PI, locked: false, isNpcTraffic: false, variant: 'pickup' },
    { x: -32, z: -28, rotY: Math.PI / 2, locked: true, isNpcTraffic: false, variant: 'van' },
    { x: -20, z: -28, rotY: Math.PI / 2, locked: false, isNpcTraffic: false, variant: 'sedan' },
    { x: -46, z: 18, rotY: 0, locked: true, isNpcTraffic: false, variant: 'muscle' },
    { x: 46, z: -18, rotY: Math.PI, locked: false, isNpcTraffic: false, variant: 'suv' },
    { x: 18, z: 58, rotY: Math.PI / 2, locked: true, isNpcTraffic: false, variant: 'coupe' },
    { x: -18, z: -58, rotY: -Math.PI / 2, locked: false, isNpcTraffic: false, variant: 'pickup' },
    // Airport Dropoff SUV & Precinct Cruiser + Expanded Outer Ring Traffic
    { x: 146, z: 6.5, rotY: -Math.PI / 2, locked: false, isNpcTraffic: false, variant: 'suv' },
    { x: 10.5, z: 140, rotY: 0, locked: true, isNpcTraffic: false, isPoliceCruiser: true },
    { x: -128, z: -12, rotY: Math.PI / 2, locked: false, isNpcTraffic: false, variant: 'coupe' },
    { x: 96, z: 120, rotY: -Math.PI / 2, locked: true, isNpcTraffic: false, variant: 'pickup' },
    // Live NPC-Driven Traffic across Downtown avenues
    {
      x: 3.1,
      z: 20,
      rotY: Math.PI,
      locked: true,
      isNpcTraffic: true,
      variant: 'sedan',
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
      variant: 'suv',
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
      variant: 'pickup',
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
      variant: 'van',
      waypoints: [
        new THREE.Vector3(-48.9, 0.08, -3.1),
        new THREE.Vector3(-48.9, 0.08, 54.9),
        new THREE.Vector3(48.9, 0.08, 54.9),
        new THREE.Vector3(48.9, 0.08, -3.1),
      ],
    },
    {
      x: -111,
      z: 20,
      rotY: 0,
      locked: true,
      isNpcTraffic: true,
      variant: 'muscle',
      waypoints: [
        new THREE.Vector3(-111, 0.08, 111),
        new THREE.Vector3(111, 0.08, 111),
        new THREE.Vector3(111, 0.08, -111),
        new THREE.Vector3(-111, 0.08, -111),
      ],
    },
    // Primary LCPD Responding Patrol Cruiser
    {
      x: 11.5,
      z: -48,
      rotY: Math.PI,
      locked: true,
      isNpcTraffic: false,
      isPoliceCruiser: true,
    },
  ];

  carSpots.forEach((spot, idx) => {
    const built = createDriveableVehicle(
      {
        id: spot.isPoliceCruiser ? (idx === carSpots.length - 1 ? 'police_cruiser' : `police_${idx}`) : `car_${idx}`,
        x: spot.x,
        z: spot.z,
        rotY: spot.rotY,
        locked: spot.locked,
        isNpcTraffic: spot.isNpcTraffic,
        isPoliceCruiser: spot.isPoliceCruiser,
        variant: spot.variant ?? variantsPool[idx % variantsPool.length],
        color: carColors[idx % carColors.length],
        waypoints: spot.waypoints,
      },
      textures,
      group,
      colliders,
      disposables,
    );
    vehicles.push(built);
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
  for (let p = -172; p <= 172; p += 12) {
    if (Math.abs(p) > 8) {
      barrierTransforms.push([p, -174, 0]);
      barrierTransforms.push([p, 174, 0]);
      barrierTransforms.push([-174, p, Math.PI / 2]);
      barrierTransforms.push([174, p, Math.PI / 2]);
    }
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

  // 13d. LCPD Downtown Police Precinct (South Boulevard, z = 152) & Realistic Obsidian International Airport (East Extension x = 152..295)
  const downtownPolice = createPolicePrecinct(
    0,
    0,
    152,
    textures,
    group,
    colliders,
    walkables,
    lightAnchors,
    disposables,
    true,
  );
  extraZones.push(downtownPolice.zone);

  // REALISTIC OBSIDIAN INTERNATIONAL AIRPORT (x = 152..295)
  let airportDeskPos!: THREE.Vector3;
  let planeBoardPos!: THREE.Vector3;
  {
    const ax = 166;
    const tw = 28;
    const td = 54;
    const wallH = 6.4;

    // Terminal Concourse Perimeter with Glass Curtain Walls & 10m Entryway Openings
    addWall(ax - tw / 2, 0, -16.5, 0.6, wallH, 21, concreteTrimMat);
    addWall(ax - tw / 2, 0, 16.5, 0.6, wallH, 21, concreteTrimMat);
    addWall(ax + tw / 2, 0, -16.5, 0.6, wallH, 21, concreteTrimMat);
    addWall(ax + tw / 2, 0, 16.5, 0.6, wallH, 21, concreteTrimMat);
    addWall(ax, 0, -td / 2, tw, wallH, 0.6, concreteTrimMat);
    addWall(ax, 0, td / 2, tw, wallH, 0.6, concreteTrimMat);
    addDestructibleGlassPane('glass_airport_w1', ax - tw / 2 + 0.35, 0.1, -6.5, 0.25, wallH - 0.6, 4.2);
    addDestructibleGlassPane('glass_airport_w2', ax - tw / 2 + 0.35, 0.1, 6.5, 0.25, wallH - 0.6, 4.2);

    const termFloorGeo = new THREE.BoxGeometry(tw, 0.14, td);
    const termFloor = new THREE.Mesh(termFloorGeo, interiorFloorMat);
    termFloor.position.set(ax, 0.05, 0);
    termFloor.receiveShadow = true;
    group.add(termFloor);
    walkables.push({
      minX: ax - tw / 2,
      maxX: ax + tw / 2,
      minZ: -td / 2,
      maxZ: td / 2,
      yStart: 0.12,
      yEnd: 0.12,
      axis: 'flat',
    });

    // Sweeping Cantilever Curbside Departure Canopy & Terminal Roof
    const termRoofGeo = new THREE.BoxGeometry(tw + 2, 0.6, td + 2);
    const termRoof = new THREE.Mesh(termRoofGeo, metalMat);
    termRoof.position.set(ax, wallH + 0.3, 0);
    const canopyGeo = new THREE.BoxGeometry(6.4, 0.32, 30);
    const curbCanopy = new THREE.Mesh(canopyGeo, concreteTrimMat);
    curbCanopy.position.set(ax - tw / 2 - 3.0, wallH - 0.5, 0);
    const curbColGeo = new THREE.CylinderGeometry(0.24, 0.26, wallH - 0.6, 10);
    for (const cz of [-12, 0, 12]) {
      const col = new THREE.Mesh(curbColGeo, metalMat);
      col.position.set(ax - tw / 2 - 5.6, (wallH - 0.6) * 0.5, cz);
      group.add(col);
    }
    group.add(termRoof, curbCanopy);

    // Check-In Desks + Glowing Overhead Departures FIDS Board
    addWall(ax + 2.5, 0.12, -8.0, 1.3, 1.08, 8.2, darkTrimMat);
    airportDeskPos = new THREE.Vector3(ax - 0.2, 0.12, -8.0);
    const fidsTex = createNeonSignTexture('DEPARTURES · SOLSTICE · AETHER · GATE 1', '#fbbf24');
    const fidsMat = new THREE.MeshStandardMaterial({
      map: fidsTex,
      emissive: 0xfbbf24,
      emissiveMap: fidsTex,
      emissiveIntensity: 1.5,
    });
    const fidsGeo = new THREE.BoxGeometry(0.18, 1.4, 8.6);
    const fids = new THREE.Mesh(fidsGeo, fidsMat);
    fids.position.set(ax + 2.6, 4.4, -8.0);
    group.add(fids);

    // Baggage Claim Carousel in South Concourse with Suitcases
    const carouselGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.55, 20);
    const carousel = new THREE.Mesh(carouselGeo, darkTrimMat);
    carousel.position.set(ax - 2.0, 0.4, 15.0);
    const bagGeo = new THREE.BoxGeometry(0.75, 0.55, 0.45);
    const bagColors = [0xb91c1c, 0x0369a1, 0xca8a04, 0x334155];
    const bagMats = bagColors.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }));
    for (let bi = 0; bi < 4; bi++) {
      const ang = (bi / 4) * Math.PI * 2;
      const bag = new THREE.Mesh(bagGeo, bagMats[bi]);
      bag.position.set(ax - 2.0 + Math.cos(ang) * 2.4, 0.94, 15.0 + Math.sin(ang) * 2.4);
      bag.rotation.y = ang;
      group.add(bag);
    }
    group.add(carousel);

    // Security Archway Frame (wide clear passage inside!)
    addWall(ax + 6.5, 0.12, -2.5, 0.45, 2.8, 0.5, metalMat);
    addWall(ax + 6.5, 0.12, 2.5, 0.45, 2.8, 0.5, metalMat);
    const archTopGeo = new THREE.BoxGeometry(0.45, 0.4, 5.5);
    const archTop = new THREE.Mesh(archTopGeo, metalMat);
    archTop.position.set(ax + 6.5, 2.95, 0);
    group.add(archTop);

    // Row of Gate Waiting Seats
    const seatRowGeo = new THREE.BoxGeometry(0.85, 0.72, 4.6);
    for (const sz of [7.0, 13.0]) {
      const sRow = new THREE.Mesh(seatRowGeo, darkTrimMat);
      sRow.position.set(ax + 9.0, 0.48, sz);
      group.add(sRow);
    }

    const termSignTex = createNeonSignTexture('OBSIDIAN INTL AIRPORT', '#38bdf8');
    const termSignMat = new THREE.MeshStandardMaterial({
      map: termSignTex,
      emissive: 0x38bdf8,
      emissiveMap: termSignTex,
      emissiveIntensity: 1.9,
    });
    const termSignGeo = new THREE.BoxGeometry(0.28, 1.6, 11.2);
    const termSign = new THREE.Mesh(termSignGeo, termSignMat);
    termSign.position.set(ax - tw / 2 - 5.9, wallH + 0.75, 0);
    group.add(termSign);

    lightAnchors.push(
      { x: ax, y: 5.2, z: 0, color: 0xe0f2fe, intensity: 34, distance: 38 },
      { x: ax, y: 5.2, z: 16, color: 0xfde68a, intensity: 28, distance: 32 },
      { x: 204, y: 9.0, z: 0, color: 0xfde68a, intensity: 36, distance: 44 },
    );

    // Tall Air Traffic Control Tower (172, 0, -44) + Glass Observation Cab + Radar Dish
    addWall(172, 0, -44, 6.0, 28, 6.0, concreteTrimMat);
    const atcCabGeo = new THREE.CylinderGeometry(5.4, 3.8, 3.8, 10);
    const atcCab = new THREE.Mesh(atcCabGeo, cyanNeonMat);
    atcCab.position.set(172, 29.8, -44);
    const atcRoofGeo = new THREE.CylinderGeometry(5.8, 5.8, 0.5, 10);
    const atcRoof = new THREE.Mesh(atcRoofGeo, metalMat);
    atcRoof.position.set(172, 31.9, -44);
    const radarDishGeo = new THREE.BoxGeometry(3.2, 1.1, 0.35);
    const radarDish = new THREE.Mesh(radarDishGeo, metalMat);
    radarDish.position.set(172, 33.1, -44);
    radarDish.rotation.y = 0.6;
    group.add(atcCab, atcRoof, radarDish);

    // North Maintenance Hangar (x = 198, z = -56) with Charter Jet & Contraband Briefcase Mission!
    addWall(198, 0, -68, 26, 9.2, 0.8, metalMat);
    addWall(185, 0, -56, 0.8, 9.2, 24, metalMat);
    addWall(211, 0, -56, 0.8, 9.2, 24, metalMat);
    const hangarRoofGeo = new THREE.BoxGeometry(27.5, 0.7, 25);
    const hangarRoof = new THREE.Mesh(hangarRoofGeo, concreteTrimMat);
    hangarRoof.position.set(198, 9.5, -56);
    group.add(hangarRoof);
    // Briefcase Mission Pickup inside Hangar
    const casePos = new THREE.Vector3(203, 0.25, -56);
    const caseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.45, 0.26),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.8, metalness: 0.7 }),
    );
    caseMesh.position.set(casePos.x, 0.65, casePos.z);
    const caseRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.06, 16),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
    );
    caseRing.position.set(casePos.x, 0.12, casePos.z);
    group.add(caseMesh, caseRing);
    extraMissions.push({
      id: 'airport_briefcase',
      pos: new THREE.Vector3(casePos.x, 0.14, casePos.z),
      mesh: caseMesh,
      ringMesh: caseRing,
      rewardCash: 550,
      completed: false,
    });

    // Enclosed Glass Jetbridge Corridor leading East to Commercial Airliner
    const jbGeo = new THREE.BoxGeometry(20, 2.8, 3.2);
    const jb = new THREE.Mesh(jbGeo, shatterGlassMat);
    jb.position.set(190, 3.1, -3.5);
    group.add(jb);

    // Asphalt Runway Strip & Markings + PAPI / Edge / Centerline Lights (x = 244..284, z = -140..140)
    const rwyCenterGeo = new THREE.PlaneGeometry(0.85, 7.5);
    const rwyEdgeGeo = new THREE.BoxGeometry(0.45, 0.24, 0.45);
    const rwyLightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.4,
    });
    for (let rz = -132; rz <= 132; rz += 16) {
      const lL = new THREE.Mesh(rwyEdgeGeo, rwyLightMat);
      lL.position.set(244, 0.12, rz);
      const lR = new THREE.Mesh(rwyEdgeGeo, rwyLightMat);
      lR.position.set(284, 0.12, rz);
      const centerLine = new THREE.Mesh(rwyCenterGeo, whitePaintMat);
      centerLine.rotation.x = -Math.PI / 2;
      centerLine.position.set(264, 0.02, rz);
      group.add(lL, lR, centerLine);
    }

    // Detailed Widebody Commercial Jet Airliner at Tarmac Gate (208, 0, 0)
    const planeGroup = new THREE.Group();
    planeGroup.position.set(208, 0.05, 0);
    const jetWhiteMat = new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      roughness: 0.24,
      metalness: 0.45,
      clearcoat: 0.85,
    });
    const jetAccentMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.5,
    });
    const fuselageGeo = new THREE.CylinderGeometry(2.55, 2.45, 28.0, 18);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, jetWhiteMat);
    fuselage.position.set(0, 3.4, 0);
    fuselage.castShadow = true;
    const noseGeo = new THREE.ConeGeometry(2.55, 5.4, 18);
    noseGeo.rotateX(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, jetWhiteMat);
    nose.position.set(0, 3.4, -16.7);
    const tailGeo = new THREE.BoxGeometry(0.36, 5.8, 4.4);
    const tailFin = new THREE.Mesh(tailGeo, jetAccentMat);
    tailFin.position.set(0, 7.2, 11.8);
    const wingGeo = new THREE.BoxGeometry(30.0, 0.32, 5.2);
    const mainWing = new THREE.Mesh(wingGeo, jetWhiteMat);
    mainWing.position.set(0, 2.9, 1.0);
    const engGeo = new THREE.CylinderGeometry(0.85, 0.85, 3.4, 14);
    engGeo.rotateX(Math.PI / 2);
    const engL = new THREE.Mesh(engGeo, metalMat);
    engL.position.set(-6.4, 2.1, 0.2);
    const engR = new THREE.Mesh(engGeo, metalMat);
    engR.position.set(6.4, 2.1, 0.2);
    const stairGeo = new THREE.BoxGeometry(1.8, 2.8, 3.8);
    const stair = new THREE.Mesh(stairGeo, metalMat);
    stair.position.set(-3.6, 1.4, -5.5);
    // Illuminated passenger cabin windows along both sides
    const jetWinGeo = new THREE.BoxGeometry(0.1, 0.42, 0.62);
    for (let wz = -10; wz <= 10; wz += 2.0) {
      const jwL = new THREE.Mesh(jetWinGeo, cyanNeonMat);
      jwL.position.set(-2.52, 3.85, wz);
      const jwR = new THREE.Mesh(jetWinGeo, cyanNeonMat);
      jwR.position.set(2.52, 3.85, wz);
      planeGroup.add(jwL, jwR);
    }
    planeGroup.add(fuselage, nose, tailFin, mainWing, engL, engR, stair);
    group.add(planeGroup);

    colliders.push({
      minX: 204,
      maxX: 212,
      minZ: -17.5,
      maxZ: 17.5,
      height: 6.2,
    });
    planeBoardPos = new THREE.Vector3(201.5, 0.08, -5.5);
    extraZones.push(
      { name: 'Obsidian Airport Terminal', minX: ax - tw / 2, maxX: ax + tw / 2, minZ: -td / 2, maxZ: td / 2 },
      { name: 'Airport Runway & Tarmac', minX: 182, maxX: 292, minZ: -145, maxZ: 145 },
    );

    disposables.push(
      termFloorGeo,
      termRoofGeo,
      canopyGeo,
      curbColGeo,
      fidsTex,
      fidsMat,
      fidsGeo,
      carouselGeo,
      bagGeo,
      ...bagMats,
      archTopGeo,
      seatRowGeo,
      termSignTex,
      termSignMat,
      termSignGeo,
      atcCabGeo,
      atcRoofGeo,
      radarDishGeo,
      hangarRoofGeo,
      caseMesh.geometry,
      caseMesh.material,
      caseRing.geometry,
      caseRing.material,
      jbGeo,
      rwyCenterGeo,
      rwyEdgeGeo,
      rwyLightMat,
      jetWhiteMat,
      jetAccentMat,
      fuselageGeo,
      noseGeo,
      tailGeo,
      wingGeo,
      engGeo,
      stairGeo,
      jetWinGeo,
    );
  }

  const skylineGeo = new THREE.BoxGeometry(1, 1, 1);
  const skylineMat = new THREE.MeshStandardMaterial({
    map: textures.facadeGlassMap,
    color: 0x627794,
    roughness: 0.45,
    metalness: 0.35,
  });
  disposables.push(skylineGeo, skylineMat);

  const skyCount = 64;
  const skylineInst = new THREE.InstancedMesh(skylineGeo, skylineMat, skyCount);
  for (let i = 0; i < skyCount; i++) {
    const angle = (i / skyCount) * Math.PI * 2;
    const radius = 236 + (i % 4) * 22;
    const sx = Math.cos(angle) * radius;
    const sz = Math.sin(angle) * radius;
    const w = 16 + (i % 3) * 7;
    const d = 16 + ((i + 1) % 3) * 7;
    const h = 48 + ((i * 19) % 62);
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
    { name: '24H SuperMart (Interior)', minX: 15, maxX: 33, minZ: 15, maxZ: 33 },
    { name: 'Parking Garage Bay 04 (Interior)', minX: -37, maxX: -15, minZ: -37, maxZ: -15 },
    { name: 'Skyline Concrete Overpass', minX: 59, maxX: 69, minZ: -28, maxZ: 28 },
    { name: 'East Cargo Docks', minX: 74, maxX: 118, minZ: -45, maxZ: 45 },
    { name: 'North Hotel District', minX: -60, maxX: 60, minZ: -165, maxZ: -52 },
    { name: 'West Neon Alleyways', minX: -165, maxX: -52, minZ: -115, maxZ: 115 },
    { name: 'South Metro Plaza', minX: -115, maxX: 115, minZ: 52, maxZ: 175 },
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
    // Hotel Vex Concierge & Guest Wing Guards (1F & 2F)
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
    {
      id: 'hotel_exec_guard',
      name: '2F Executive Guard',
      role: 'guard',
      health: 95,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(-26, 5.0, -84.0),
        new THREE.Vector3(-26, 5.0, -96.0),
        new THREE.Vector3(-20, 5.0, -84.0),
      ],
    },
    // Trash Collectors patrolling dumpsters & Sanitation Truck
    {
      id: 'collector_1',
      name: 'Gabe (Sanitation Crew)',
      role: 'collector',
      health: 70,
      voiceName: 'Puck',
      waypoints: [
        new THREE.Vector3(-59, 0.08, -10),
        new THREE.Vector3(-39, 0.08, 22),
        new THREE.Vector3(-15.5, 0.08, -22),
      ],
    },
    {
      id: 'collector_2',
      name: 'Sam (Waste Collector)',
      role: 'collector',
      health: 70,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(-11.5, 0.08, 75),
        new THREE.Vector3(15.5, 0.08, -4),
        new THREE.Vector3(36.5, 0.08, 22),
      ],
    },
    // People with No Money (give $50 for grateful reaction)
    {
      id: 'poor_1',
      name: 'Old Eli (Down on Luck)',
      role: 'poor',
      health: 45,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(-13.5, 0.08, 56),
        new THREE.Vector3(-14.2, 0.08, 57),
      ],
    },
    {
      id: 'poor_2',
      name: 'Rosa (Struggling Resident)',
      role: 'poor',
      health: 45,
      voiceName: 'Kore',
      waypoints: [
        new THREE.Vector3(-56, 0.08, -14),
        new THREE.Vector3(-56, 0.08, -12),
      ],
    },
    {
      id: 'poor_3',
      name: 'Leo M. (Homeless Veteran)',
      role: 'poor',
      health: 45,
      voiceName: 'Puck',
      waypoints: [
        new THREE.Vector3(14, 0.08, 64),
        new THREE.Vector3(14, 0.08, 62),
      ],
    },
    // Gentleman in Suit waiting inside Ravenscroft Villa (-82, -82)
    {
      id: 'gentleman_ravenscroft',
      name: 'Julian Ravenscroft',
      role: 'gentleman',
      health: 100,
      voiceName: 'Charon',
      waypoints: [
        new THREE.Vector3(-82.5, 0.15, -83.5),
        new THREE.Vector3(-81.5, 0.15, -83.5),
      ],
    },
    // Downtown Precinct Desk Officer + Airport Gate Attendant
    {
      id: 'precinct_officer',
      name: 'Sgt. Miller (LCPD Desk)',
      role: 'police',
      health: 120,
      voiceName: 'Charon',
      isIndoorStore: true,
      waypoints: [
        downtownPolice.officerSpawnPos.clone(),
        downtownPolice.officerSpawnPos.clone().add(new THREE.Vector3(0.6, 0, 0)),
      ],
    },
    {
      id: 'airport_agent',
      name: 'Elena (Gate Agent)',
      role: 'clerk',
      health: 60,
      voiceName: 'Zephyr',
      isIndoorStore: true,
      storeClerkArchetype: 'beg',
      waypoints: [
        new THREE.Vector3(170.2, 0.14, -8.0),
        new THREE.Vector3(170.2, 0.14, -6.5),
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
    houses,
    birdPerches,
    barWinePos: new THREE.Vector3(-28.8, 0.14, 28.0),
    villaTablePos,
    npcSpawns,
    disposables,
    mapBounds: { minX: -175, maxX: 300, minZ: -175, maxZ: 185 },
    policeDeskPos: downtownPolice.policeDeskPos,
    holdingCellPos: downtownPolice.holdingCellPos,
    cellBailPos: downtownPolice.cellBailPos,
    cellReleasePos: downtownPolice.cellReleasePos,
    cellDoorMesh: downtownPolice.cellDoorMesh,
    cellDoorColliderIndex: downtownPolice.cellDoorColliderIndex,
    airportDeskPos,
    planeBoardPos,
    supermarketCheckoutPos,
    extraMissions,
  };
}
