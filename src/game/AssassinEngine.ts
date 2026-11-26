import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type {
  ActiveCinematic,
  CameraPreset,
  CityCollider,
  CityLightAnchor,
  CityZone,
  GamePhase,
  GameSnapshot,
  HotelHeistState,
  HotelRoomId,
  LanguageCode,
  LimbId,
  LimbMap,
  NpcAlertState,
  NpcRole,
  OutfitId,
  RadarBlip,
  RegenStage,
  StealthState,
  TalkTargetInfo,
  VoiceCaption,
  WalkableSurface,
  WeaponId,
  WeatherType,
} from '../types/game';
import { UI_STRINGS } from '../i18n/translations';
import { SoundAndVoiceEngine } from '../audio/soundEngine';
import {
  applyAnatomicalState,
  applyAssassinOutfit,
  applyNpcRagdollPose,
  applyRagdollPose,
  createAssassinRig,
  createNpcRig,
  setAssassinWeaponVisual,
  updateClothPhysics,
  type AssassinRig,
  type NpcRig,
} from './characterRig';
import {
  buildCityDistrict,
  type DestructibleGlassSpec,
  type DriveableVehicleSpec,
  type DumpsterSpec,
  type HotelRoomDoorSpec,
  type HotelVexSpec,
  type UtilityPoleSpec,
  type WantedPosterSlot,
} from './cityBuilder';
import { createProceduralTextures, type ProceduralTextureSet } from './textures';

interface NpcEntity {
  id: string;
  name: string;
  role: NpcRole;
  voiceName: 'Charon' | 'Puck' | 'Kore' | 'Zephyr';
  isIndoorStore: boolean;
  storeClerkArchetype?: 'threaten' | 'beg';
  isBoutiqueResident: boolean;
  isPosterWorker: boolean;
  rig: NpcRig;
  position: THREE.Vector3;
  yaw: number;
  health: number;
  maxHealth: number;
  alertState: NpcAlertState;
  alertTimer: number;
  attackCooldown: number;
  muzzleTimer: number;
  waypoints: THREE.Vector3[];
  waypointIndex: number;
  lastKnownPlayerPos: THREE.Vector3 | null;
  speechCooldown: number;
  walkPhase: number;
  deathTimer: number;
  ragdollSeed: number;
  ragdollFallDir: 1 | -1;
  ragdollVel: THREE.Vector3;
  suspicion: number;
  callTimer: number;
  targetPosterId: string | null;
  posterHangTimer: number;
  fightTargetId?: string | null;
  fightTimer?: number;
  punchCooldown?: number;
  isDynamicSpawn?: boolean;
  isPoliceOfficer?: boolean;
  isPlayerFighter?: boolean;
  disposed: boolean;
}

interface Projectile {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  fromPlayer: boolean;
  isSilent: boolean;
  damage: number;
  life: number;
}

interface SeveredDebris {
  mesh: THREE.Object3D;
  velocity: THREE.Vector3;
  angVel: THREE.Vector3;
  life: number;
}

interface ParticleBurst {
  points: THREE.Points;
  velocities: Float32Array;
  life: number;
  maxLife: number;
}

const LIMB_IDS: LimbId[] = [
  'leftArm',
  'rightArm',
  'leftLeg',
  'rightLeg',
  'torso',
];

function createDefaultLimbs(): LimbMap {
  return {
    leftArm: { condition: 'intact', regenProgress: 0, stage: 'none' },
    rightArm: { condition: 'intact', regenProgress: 0, stage: 'none' },
    leftLeg: { condition: 'intact', regenProgress: 0, stage: 'none' },
    rightLeg: { condition: 'intact', regenProgress: 0, stage: 'none' },
    torso: { condition: 'intact', regenProgress: 0, stage: 'none' },
  };
}

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _camGoal = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _skyTargetColor = new THREE.Color();
const _fogTargetColor = new THREE.Color();
const _hemiSkyTarget = new THREE.Color();
const _hemiGroundTarget = new THREE.Color();
const _keyTargetColor = new THREE.Color();
const _rimTargetColor = new THREE.Color();

interface WeatherConfig {
  skyHex: number;
  fogHex: number;
  fogDensity: number;
  hemiSkyHex: number;
  hemiGroundHex: number;
  hemiIntensity: number;
  keyHex: number;
  keyIntensity: number;
  rimHex: number;
  rimIntensity: number;
  exposure: number;
  rainOpacity: number;
  rainSpeed: number;
  sightMult: number;
  suspicionMult: number;
  hearingMult: number;
  patrolSpeedMult: number;
}

const WEATHER_ORDER: WeatherType[] = ['sunny', 'overcast', 'rain', 'fog'];
const WEATHER_CYCLE_SECONDS = 38;

const WEATHER_CONFIGS: Record<WeatherType, WeatherConfig> = {
  sunny: {
    skyHex: 0x3b6ea5,
    fogHex: 0x5c85b3,
    fogDensity: 0.0026,
    hemiSkyHex: 0xc8e4ff,
    hemiGroundHex: 0x3b4456,
    hemiIntensity: 1.58,
    keyHex: 0xfff1d6,
    keyIntensity: 2.85,
    rimHex: 0x89bbf5,
    rimIntensity: 1.15,
    exposure: 1.38,
    rainOpacity: 0,
    rainSpeed: 0,
    sightMult: 1.28,
    suspicionMult: 1.3,
    hearingMult: 1.05,
    patrolSpeedMult: 0.95,
  },
  overcast: {
    skyHex: 0x1b2638,
    fogHex: 0x222f44,
    fogDensity: 0.0064,
    hemiSkyHex: 0x8bb2ec,
    hemiGroundHex: 0x1e2432,
    hemiIntensity: 1.15,
    keyHex: 0xdbeafe,
    keyIntensity: 1.65,
    rimHex: 0x649ce0,
    rimIntensity: 0.95,
    exposure: 1.2,
    rainOpacity: 0,
    rainSpeed: 0,
    sightMult: 1.0,
    suspicionMult: 1.0,
    hearingMult: 1.0,
    patrolSpeedMult: 1.0,
  },
  rain: {
    skyHex: 0x0b1220,
    fogHex: 0x0d1526,
    fogDensity: 0.0105,
    hemiSkyHex: 0x6b8ec2,
    hemiGroundHex: 0x131924,
    hemiIntensity: 0.95,
    keyHex: 0xbcd3f5,
    keyIntensity: 1.25,
    rimHex: 0x5183c4,
    rimIntensity: 1.05,
    exposure: 1.12,
    rainOpacity: 0.44,
    rainSpeed: 24,
    sightMult: 0.7,
    suspicionMult: 0.68,
    hearingMult: 0.65,
    patrolSpeedMult: 1.05,
  },
  fog: {
    skyHex: 0x3b4859,
    fogHex: 0x455366,
    fogDensity: 0.032,
    hemiSkyHex: 0x9cb0c9,
    hemiGroundHex: 0x26303d,
    hemiIntensity: 1.05,
    keyHex: 0xcbd5e1,
    keyIntensity: 0.92,
    rimHex: 0x7c93ad,
    rimIntensity: 0.72,
    exposure: 1.08,
    rainOpacity: 0,
    rainSpeed: 0,
    sightMult: 0.44,
    suspicionMult: 0.45,
    hearingMult: 0.85,
    patrolSpeedMult: 0.78,
  },
};

const SHELTER_ANCHORS: THREE.Vector3[] = [
  new THREE.Vector3(-25, 0, -24), // Parking Garage Bay 04
  new THREE.Vector3(-20, 0, 26),  // 24H Neon Lounge
  new THREE.Vector3(20, 0, 24),   // 24H Corner Mart
  new THREE.Vector3(20, 0, -26),  // Syndicate Tower Lobby
  new THREE.Vector3(-20, 0, 72),  // Atelier Vex Boutique
  new THREE.Vector3(-26, 0, -76), // Hotel Vex Lobby
  new THREE.Vector3(26, 0, 76),   // Metro Transit Station
  new THREE.Vector3(26, 0, -76),  // Meridian Bank
  new THREE.Vector3(34, 0, 36),   // Cyber Arcade
  new THREE.Vector3(-76, 0, -26), // Pawn 24H
  new THREE.Vector3(-76, 0, 26),  // Westside Lofts Lobby
  new THREE.Vector3(-26, 0, 86),  // Velvet Jazz Club
];

export class AssassinEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private textures: ProceduralTextureSet;
  private sound: SoundAndVoiceEngine;

  private cityGroup: THREE.Group | null = null;
  private colliders: CityCollider[] = [];
  private walkables: WalkableSurface[] = [];
  private lightAnchors: CityLightAnchor[] = [];
  private zones: CityZone[] = [];
  private vehicles: DriveableVehicleSpec[] = [];
  private destructibleGlass: DestructibleGlassSpec[] = [];
  private utilityPoles: UtilityPoleSpec[] = [];
  private dumpsters: DumpsterSpec[] = [];
  private wantedPosters: WantedPosterSlot[] = [];
  private npcSpawns: ReturnType<typeof buildCityDistrict>['npcSpawns'] = [];
  private disposables: Array<{ dispose: () => void }> = [];

  private pointLightPool: THREE.PointLight[] = [];

  private assassin: AssassinRig;
  private npcs: NpcEntity[] = [];
  private projectiles: Projectile[] = [];
  private debris: SeveredDebris[] = [];
  private bursts: ParticleBurst[] = [];

  private rainPoints: THREE.Points;
  private rainMat: THREE.PointsMaterial;
  private rainPositions: Float32Array;
  private weather: WeatherType = 'sunny';
  private weatherTimer = 0;
  private currentRainSpeed = 0;

  private phase: GamePhase = 'intro';
  private language: LanguageCode = 'en';
  private playerPos = new THREE.Vector3(0, 0, 44);
  private playerVelY = 0;
  private playerYaw = Math.PI;
  private prevPlayerYaw = Math.PI;
  private camYaw = 0;
  private camPitch = 0.2;
  private currentCamPos = new THREE.Vector3(0, 3, 49);
  private currentCamLook = new THREE.Vector3(0, 1.4, 44);
  private cameraPreset: CameraPreset = 'combat';

  private introTime = 0;
  private introCrashTime = -1;
  private introShake = 0;

  private currentOutfit: OutfitId = 'tactical';
  private wantedOutfitId: OutfitId = 'tactical';
  private appearanceMenuOpen = false;
  private activeCinematic: ActiveCinematic = 'none';
  private cinematicTimer = 0;
  private boutiqueGreetingDone = false;
  private boutiqueStylistGreeted = false;
  private wasInsideBoutique = false;
  private postersTriggered = false;
  private silenceNpc: NpcEntity | null = null;
  private silenceDumpster: DumpsterSpec | null = null;
  private silenceStartPos = new THREE.Vector3();
  private silenceDumpStandPos = new THREE.Vector3();
  private silenceShotFired = false;
  private silenceDumped = false;
  private silenceLidClosed = false;
  private lockpickMinigameOpen = false;
  private lockpickTarget: 'car' | 'hotel_204' | null = null;
  private lockpickCar: DriveableVehicleSpec | null = null;
  private smashCar: DriveableVehicleSpec | null = null;
  private smashWindowBroken = false;
  private smashPainCried = false;

  private hotelVex!: HotelVexSpec;
  private hotelCheckinDone = false;
  private hotelGreetingSpoken = false;
  private hotelRoomMenuOpen = false;
  private chosenHotelRoom: HotelRoomId | null = null;
  private hotelHeistState: HotelHeistState = 'none';

  private policeDispatch: {
    active: boolean;
    stage: 'idle' | 'driving' | 'halting' | 'blame_1' | 'blame_2' | 'arresting' | 'escorting';
    timer: number;
    fighterIds: [string, string] | null;
    officerIds: string[];
    cruiser: DriveableVehicleSpec | null;
    fightSpot: THREE.Vector3;
    sirenCooldown: number;
  } = {
    active: false,
    stage: 'idle',
    timer: 0,
    fighterIds: null,
    officerIds: [],
    cruiser: null,
    fightSpot: new THREE.Vector3(),
    sirenCooldown: 0,
  };

  private health = 100;
  private maxHealth = 100;
  private stamina = 100;
  private wantedLevel = 0;
  private equippedWeapon: WeaponId = 'blades';
  private weaponWheelOpen = false;
  private conversationActive = false;
  private activeTalkNpcId: string | null = null;
  private activeVehicle: DriveableVehicleSpec | null = null;

  private isRagdoll = false;
  private ragdollProgress = 0;
  private ragdollSeed = 1;
  private deathReasonKey: 'crash' | 'combat' | null = null;

  private limbs: LimbMap = createDefaultLimbs();
  private isRegenerating = false;
  private activeRegenStage: RegenStage = 'none';
  private lastPlayedRegenStage: RegenStage = 'none';

  private attackAnim = 0;
  private attackCombo = 0;
  private attackCooldown = 0;
  private kunaiCooldown = 0;
  private walkPhase = 0;
  private footstepAccum = 0;
  private elapsedSeconds = 0;
  private totalTime = 0;

  private keys = new Set<string>();
  private crouchToggled = false;
  private pointerLocked = false;
  private isMouseDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  private clock = new THREE.Clock();
  private frameId = 0;
  private disposed = false;
  private snapshotTimer = 0;
  private caption: VoiceCaption | null = null;
  private ttsStatus: 'initializing' | 'gemini' | 'fallback' = 'initializing';

  private onSnapshot: (snap: GameSnapshot) => void;
  private onContextLost?: () => void;
  private onRequestTalk?: (target: TalkTargetInfo) => void;

  private kunaiGeo = new THREE.ConeGeometry(0.045, 0.34, 6);
  private kunaiMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.16,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.35,
  });
  private bulletGeo = new THREE.SphereGeometry(0.055, 6, 6);
  private bulletMat = new THREE.MeshBasicMaterial({ color: 0xff9f43 });
  private playerBulletMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  private hemiLight: THREE.HemisphereLight;
  private keyLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private fogExp: THREE.FogExp2;

  constructor(
    container: HTMLElement,
    onSnapshot: (snap: GameSnapshot) => void,
    onContextLost?: () => void,
    onRequestTalk?: (target: TalkTargetInfo) => void,
  ) {
    this.container = container;
    this.onSnapshot = onSnapshot;
    this.onContextLost = onContextLost;
    this.onRequestTalk = onRequestTalk;

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.24;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(WEATHER_CONFIGS.sunny.skyHex);
    this.fogExp = new THREE.FogExp2(
      WEATHER_CONFIGS.sunny.fogHex,
      WEATHER_CONFIGS.sunny.fogDensity,
    );
    this.scene.fog = this.fogExp;

    this.camera = new THREE.PerspectiveCamera(
      58,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      320,
    );

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(
      new RoomEnvironment(),
      0.04,
    ).texture;
    pmrem.dispose();

    this.hemiLight = new THREE.HemisphereLight(
      WEATHER_CONFIGS.sunny.hemiSkyHex,
      WEATHER_CONFIGS.sunny.hemiGroundHex,
      WEATHER_CONFIGS.sunny.hemiIntensity,
    );
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(
      WEATHER_CONFIGS.sunny.keyHex,
      WEATHER_CONFIGS.sunny.keyIntensity,
    );
    this.keyLight.position.set(24, 38, 20);
    this.keyLight.castShadow = !this.isSoftwareGl;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    const d = 38;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.camera.near = 2;
    this.keyLight.shadow.camera.far = 110;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);
    this.scene.add(this.keyLight.target);

    this.rimLight = new THREE.DirectionalLight(
      WEATHER_CONFIGS.sunny.rimHex,
      WEATHER_CONFIGS.sunny.rimIntensity,
    );
    this.rimLight.position.set(-28, 22, -26);
    this.scene.add(this.rimLight);

    const poolCount = this.isSoftwareGl ? 3 : 6;
    for (let i = 0; i < poolCount; i++) {
      const pl = new THREE.PointLight(0xffcb78, 20, 26, 1.5);
      this.scene.add(pl);
      this.pointLightPool.push(pl);
    }

    this.textures = createProceduralTextures(this.renderer);
    this.rebuildWorld();

    this.assassin = createAssassinRig(this.textures);
    this.assassin.root.position.copy(this.playerPos);
    setAssassinWeaponVisual(this.assassin, this.equippedWeapon);
    this.scene.add(this.assassin.root);
    this.disposables.push(...this.assassin.disposables);

    const rainCount = 900;
    this.rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 48;
      this.rainPositions[i * 3 + 1] = Math.random() * 22;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 48;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(this.rainPositions, 3),
    );
    this.rainMat = new THREE.PointsMaterial({
      color: 0xa4c0e6,
      size: 0.09,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.rainPoints = new THREE.Points(rainGeo, this.rainMat);
    this.rainPoints.frustumCulled = false;
    this.rainPoints.visible = false;
    this.scene.add(this.rainPoints);
    this.disposables.push(rainGeo, this.rainMat);

    this.sound = new SoundAndVoiceEngine(
      (cap) => {
        this.caption = cap;
        this.emitSnapshot();
      },
      (status) => {
        this.ttsStatus = status;
        this.emitSnapshot();
      },
    );
    this.applyWeatherImmediate('sunny');

    this.spawnNpcs();
    this.setupIntroState();
    this.updateDynamicLights();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.updateCamera(1.0);
    this.emitSnapshot();
    this.startLoop();
  }

  private setupIntroState() {
    this.phase = 'intro';
    this.introTime = 0;
    this.introCrashTime = -1;
    this.introShake = 0;
    this.assassin.root.visible = false;

    const car = this.vehicles[0];
    if (car) {
      car.position.set(-2.4, 0.08, 42);
      car.yaw = Math.PI;
      car.speed = 28;
      car.driverHands.visible = false;
      car.root.position.copy(car.position);
      car.root.rotation.y = car.yaw;
      const col = this.colliders[car.colliderIndex];
      if (col) col.height = -1;
      this.playerPos.copy(car.position);
    }
  }

  public skipIntro() {
    if (this.phase !== 'intro') return;
    const car = this.vehicles[0];
    if (car && this.introCrashTime < 0) {
      car.position.set(-2.4, 0.08, -111.7);
      car.yaw = Math.PI;
      car.speed = 0;
      car.driverHands.visible = false;
      car.root.position.copy(car.position);
      car.root.rotation.y = car.yaw;
      this.damageVehicleAt(car, 28, 'front');
    }
    this.phase = 'briefing';
    this.camera.fov = 58;
    this.camera.updateProjectionMatrix();
    this.emitSnapshot();
  }

  private rebuildWorld() {
    if (this.cityGroup) {
      this.scene.remove(this.cityGroup);
    }
    const city = buildCityDistrict(this.textures, this.isSoftwareGl);
    this.cityGroup = city.group;
    this.colliders = city.colliders;
    this.walkables = city.walkables;
    this.lightAnchors = city.lightAnchors;
    this.zones = city.zones;
    this.vehicles = city.vehicles;
    this.destructibleGlass = city.destructibleGlass;
    this.utilityPoles = city.utilityPoles;
    this.dumpsters = city.dumpsters;
    this.wantedPosters = city.wantedPosters;
    this.hotelVex = city.hotelVex;
    this.npcSpawns = city.npcSpawns;
    this.disposables.push(...city.disposables);
    this.scene.add(this.cityGroup);
  }

  private spawnNpcs() {
    for (const n of this.npcs) {
      this.scene.remove(n.rig.root);
      n.rig.disposables.forEach((d) => d.dispose());
    }
    this.npcs = [];

    this.npcSpawns.forEach((s, idx) => {
      const start = s.waypoints[0].clone();
      const nextWp = s.waypoints[1] ?? start;
      const initYaw =
        s.waypoints.length > 1
          ? Math.atan2(nextWp.x - start.x, nextWp.z - start.z)
          : 0;
      const rig = createNpcRig(s.role, this.textures, idx);
      rig.root.position.copy(start);
      rig.root.rotation.y = initYaw;
      this.scene.add(rig.root);

      this.npcs.push({
        id: s.id,
        name: s.name,
        role: s.role,
        voiceName: s.voiceName,
        isIndoorStore: Boolean(s.isIndoorStore),
        storeClerkArchetype: s.storeClerkArchetype,
        isBoutiqueResident: Boolean(s.isBoutiqueResident),
        isPosterWorker: Boolean(s.isPosterWorker),
        rig,
        position: start,
        yaw: initYaw,
        health: s.health,
        maxHealth: s.health,
        alertState: 'neutral',
        alertTimer: 0,
        attackCooldown: 1.0,
        muzzleTimer: 0,
        waypoints: s.waypoints,
        waypointIndex: 1 % s.waypoints.length,
        lastKnownPlayerPos: null,
        speechCooldown: 2 + Math.random() * 6,
        walkPhase: Math.random() * Math.PI * 2,
        deathTimer: 0,
        ragdollSeed: Math.random() > 0.5 ? 1 : -1,
        ragdollFallDir: -1,
        ragdollVel: new THREE.Vector3(),
        suspicion: 0,
        callTimer: 0,
        targetPosterId: null,
        posterHangTimer: 0,
        disposed: false,
      });
    });
  }

  public setLanguage(lang: LanguageCode) {
    this.language = lang;
    this.sound.setLanguage(lang);
    this.emitSnapshot();
  }

  public startGame() {
    this.resetMission('playing');
    this.sound.startAmbience();
    void this.sound.prewarmVoices();
    this.sound.speak('assassin_intro', { force: true });
    this.requestPointerLock();
  }

  public resetMission(nextPhase: GamePhase = 'playing') {
    this.phase = nextPhase;
    this.playerPos.set(0, 0, 44);
    this.playerVelY = 0;
    this.playerYaw = Math.PI;
    this.prevPlayerYaw = Math.PI;
    this.camYaw = 0;
    this.camPitch = 0.2;
    this.camera.fov = 58;
    this.camera.updateProjectionMatrix();
    this.health = 100;
    this.stamina = 100;
    this.wantedLevel = 0;
    this.equippedWeapon = 'blades';
    this.weaponWheelOpen = false;
    this.appearanceMenuOpen = false;
    this.activeCinematic = 'none';
    this.cinematicTimer = 0;
    this.boutiqueGreetingDone = false;
    this.boutiqueStylistGreeted = false;
    this.wasInsideBoutique = false;
    this.postersTriggered = false;
    this.silenceNpc = null;
    this.silenceDumpster = null;
    this.silenceShotFired = false;
    this.silenceDumped = false;
    this.silenceLidClosed = false;
    this.lockpickMinigameOpen = false;
    this.lockpickTarget = null;
    this.lockpickCar = null;
    this.smashCar = null;
    this.smashWindowBroken = false;
    this.smashPainCried = false;
    this.hotelCheckinDone = false;
    this.hotelGreetingSpoken = false;
    this.hotelRoomMenuOpen = false;
    this.chosenHotelRoom = null;
    this.hotelHeistState = 'none';
    this.policeDispatch = {
      active: false,
      stage: 'idle',
      timer: 0,
      fighterIds: null,
      officerIds: [],
      cruiser: null,
      fightSpot: new THREE.Vector3(),
      sirenCooldown: 0,
    };
    this.currentOutfit = 'tactical';
    this.wantedOutfitId = 'tactical';
    applyAssassinOutfit(this.assassin, 'tactical');

    this.conversationActive = false;
    this.activeTalkNpcId = null;
    this.activeVehicle = null;
    this.isRagdoll = false;
    this.ragdollProgress = 0;
    this.deathReasonKey = null;

    this.limbs = createDefaultLimbs();
    this.isRegenerating = false;
    this.activeRegenStage = 'none';
    this.lastPlayedRegenStage = 'none';
    this.attackAnim = 0;
    this.attackCombo = 0;
    this.attackCooldown = 0;
    this.walkPhase = 0;
    this.footstepAccum = 0;
    this.crouchToggled = false;
    this.elapsedSeconds = 0;
    this.kunaiCooldown = 0;
    this.weather = 'sunny';
    this.weatherTimer = 0;
    this.applyWeatherImmediate('sunny');

    this.projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.projectiles = [];
    this.debris.forEach((d) => this.scene.remove(d.mesh));
    this.debris = [];

    this.rebuildWorld();

    this.assassin.root.visible = true;
    this.assassin.root.position.copy(this.playerPos);
    this.assassin.root.rotation.set(0, this.playerYaw, 0);
    this.assassin.pelvis.position.y = 0.94;
    this.assassin.pelvis.rotation.set(0, 0, 0);
    this.assassin.torsoPivot.rotation.set(0, 0, 0);
    this.assassin.headPivot.rotation.set(0, 0, 0);
    setAssassinWeaponVisual(this.assassin, this.equippedWeapon);

    LIMB_IDS.forEach((id) => {
      if (id !== 'torso') {
        const rigLimb = this.assassin.limbs[id];
        rigLimb.pivot.rotation.set(0, 0, 0);
        rigLimb.lowerPivot.rotation.set(0, 0, 0);
        rigLimb.growthRoot.rotation.set(0, 0, 0);
      }
      applyAnatomicalState(this.assassin, id, this.limbs[id], 0);
    });
    for (const panel of this.assassin.clothPanels) {
      panel.angleX = 0.14;
      panel.velX = 0;
      panel.angleZ = panel.side * 0.08;
      panel.velZ = 0;
      panel.pivot.rotation.set(-0.14, 0, panel.side * 0.08);
    }

    this.spawnNpcs();
    this.updateCamera(1.0);
    this.emitSnapshot();
  }

  public requestPointerLock() {
    try {
      if (
        this.phase === 'playing' &&
        !this.weaponWheelOpen &&
        !this.appearanceMenuOpen &&
        !this.lockpickMinigameOpen &&
        !this.hotelRoomMenuOpen &&
        this.activeCinematic === 'none' &&
        !this.conversationActive &&
        document.pointerLockElement !== this.renderer.domElement
      ) {
        this.renderer.domElement.requestPointerLock?.();
      }
    } catch {
      // Fallback drag-look works automatically
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    this.cameraPreset = preset;
    this.emitSnapshot();
  }

  public cycleWeather() {
    const idx = WEATHER_ORDER.indexOf(this.weather);
    const next = WEATHER_ORDER[(idx + 1) % WEATHER_ORDER.length];
    this.setWeather(next);
  }

  public setWeather(next: WeatherType) {
    if (next === this.weather) return;
    this.weather = next;
    this.weatherTimer = 0;
    this.sound.setWeatherAmbience(next);
    this.sound.playWeatherTransition(next);

    let closest: NpcEntity | null = null;
    let bestD = 26;
    for (const npc of this.npcs) {
      if (
        npc.alertState === 'eliminated' ||
        npc.alertState === 'combat' ||
        npc.alertState === 'fleeing'
      ) {
        continue;
      }
      const d = npc.position.distanceTo(this.playerPos);
      if (d < bestD) {
        bestD = d;
        closest = npc;
      }
    }
    if (closest) {
      if (next === 'rain' && closest.role === 'civilian') {
        this.speakNpc(closest, 'civ_weather_rain');
      } else if (next === 'fog' && (closest.role === 'guard' || closest.role === 'heavy')) {
        this.speakNpc(closest, 'guard_weather_fog');
      } else if (next === 'sunny') {
        this.speakNpc(
          closest,
          closest.role === 'civilian' ? 'civ_weather_sunny' : 'guard_weather_sunny',
        );
      }
      closest.speechCooldown = 10;
    }
    this.emitSnapshot();
  }

  private applyWeatherImmediate(weather: WeatherType) {
    const cfg = WEATHER_CONFIGS[weather];
    (this.scene.background as THREE.Color).setHex(cfg.skyHex);
    this.fogExp.color.setHex(cfg.fogHex);
    this.fogExp.density = cfg.fogDensity;
    this.hemiLight.color.setHex(cfg.hemiSkyHex);
    this.hemiLight.groundColor.setHex(cfg.hemiGroundHex);
    this.hemiLight.intensity = cfg.hemiIntensity;
    this.keyLight.color.setHex(cfg.keyHex);
    this.keyLight.intensity = cfg.keyIntensity;
    this.rimLight.color.setHex(cfg.rimHex);
    this.rimLight.intensity = cfg.rimIntensity;
    this.renderer.toneMappingExposure = cfg.exposure;
    this.rainMat.opacity = cfg.rainOpacity;
    this.rainPoints.visible = cfg.rainOpacity > 0.015;
    this.currentRainSpeed = cfg.rainSpeed;
    this.sound?.setWeatherAmbience(weather);
  }

  private updateWeather(dt: number) {
    if (this.phase === 'playing' && !this.isRagdoll) {
      this.weatherTimer += dt;
      if (this.weatherTimer >= WEATHER_CYCLE_SECONDS) {
        this.cycleWeather();
      }
    }
    const cfg = WEATHER_CONFIGS[this.weather];
    const alpha = 1 - Math.exp(-1.15 * dt);

    _skyTargetColor.setHex(cfg.skyHex);
    (this.scene.background as THREE.Color).lerp(_skyTargetColor, alpha);

    _fogTargetColor.setHex(cfg.fogHex);
    this.fogExp.color.lerp(_fogTargetColor, alpha);
    this.fogExp.density = THREE.MathUtils.lerp(
      this.fogExp.density,
      cfg.fogDensity,
      alpha,
    );

    _hemiSkyTarget.setHex(cfg.hemiSkyHex);
    _hemiGroundTarget.setHex(cfg.hemiGroundHex);
    this.hemiLight.color.lerp(_hemiSkyTarget, alpha);
    this.hemiLight.groundColor.lerp(_hemiGroundTarget, alpha);
    this.hemiLight.intensity = THREE.MathUtils.lerp(
      this.hemiLight.intensity,
      cfg.hemiIntensity,
      alpha,
    );

    _keyTargetColor.setHex(cfg.keyHex);
    this.keyLight.color.lerp(_keyTargetColor, alpha);
    this.keyLight.intensity = THREE.MathUtils.lerp(
      this.keyLight.intensity,
      cfg.keyIntensity,
      alpha,
    );

    _rimTargetColor.setHex(cfg.rimHex);
    this.rimLight.color.lerp(_rimTargetColor, alpha);
    this.rimLight.intensity = THREE.MathUtils.lerp(
      this.rimLight.intensity,
      cfg.rimIntensity,
      alpha,
    );

    this.renderer.toneMappingExposure = THREE.MathUtils.lerp(
      this.renderer.toneMappingExposure,
      cfg.exposure,
      alpha,
    );

    this.rainMat.opacity = THREE.MathUtils.lerp(
      this.rainMat.opacity,
      cfg.rainOpacity,
      alpha,
    );
    this.currentRainSpeed = THREE.MathUtils.lerp(
      this.currentRainSpeed,
      cfg.rainSpeed,
      alpha,
    );
    this.rainPoints.visible = this.rainMat.opacity > 0.015;
  }

  private isPositionSheltered(pos: THREE.Vector3): boolean {
    for (const z of this.zones) {
      if (
        z.name.includes('(Interior)') &&
        pos.x >= z.minX &&
        pos.x <= z.maxX &&
        pos.z >= z.minZ &&
        pos.z <= z.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  private getNearestShelterPoint(pos: THREE.Vector3): THREE.Vector3 {
    let best = SHELTER_ANCHORS[0];
    let bestSq = Infinity;
    for (const s of SHELTER_ANCHORS) {
      const dx = s.x - pos.x;
      const dz = s.z - pos.z;
      const dSq = dx * dx + dz * dz;
      if (dSq < bestSq) {
        bestSq = dSq;
        best = s;
      }
    }
    return best;
  }

  public setWeapon(weapon: WeaponId) {
    this.equippedWeapon = weapon;
    setAssassinWeaponVisual(this.assassin, weapon);
    if (this.weaponWheelOpen) {
      this.weaponWheelOpen = false;
      this.sound.playSlowMo(false);
      this.requestPointerLock();
    }
    this.emitSnapshot();
  }

  public setOutfit(outfit: OutfitId) {
    if (this.phase !== 'playing' || this.isRagdoll) return;
    this.currentOutfit = outfit;
    applyAssassinOutfit(this.assassin, outfit);
    this.sound.playOutfitSwap();
    this.spawnBurst(
      this.playerPos.clone().add(new THREE.Vector3(0, 1.25, 0)),
      0x38bdf8,
      16,
      2.2,
    );

    // Changing into a fresh disguise lets the player blend back in
    this.wantedLevel = 0;
    for (const npc of this.npcs) {
      if (npc.alertState === 'eliminated') continue;
      npc.suspicion = 0;
      npc.callTimer = 0;
      npc.rig.phoneMesh.visible = false;
      if (
        npc.alertState === 'staring' ||
        npc.alertState === 'calling_police' ||
        npc.alertState === 'suspicious'
      ) {
        npc.alertState = 'patrol';
      }
    }
    this.emitSnapshot();
  }

  public toggleAppearanceMenu(force?: boolean) {
    if (
      this.phase !== 'playing' ||
      this.isRagdoll ||
      this.conversationActive ||
      this.lockpickMinigameOpen
    ) {
      return;
    }
    const next = force !== undefined ? force : !this.appearanceMenuOpen;
    if (next === this.appearanceMenuOpen) return;
    this.appearanceMenuOpen = next;
    this.keys.clear();
    if (next) {
      this.weaponWheelOpen = false;
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    } else {
      this.requestPointerLock();
    }
    this.emitSnapshot();
  }

  public toggleWeaponWheel(force?: boolean) {
    if (
      this.phase !== 'playing' ||
      this.isRagdoll ||
      this.conversationActive ||
      this.appearanceMenuOpen ||
      this.lockpickMinigameOpen ||
      this.activeCinematic !== 'none'
    ) {
      return;
    }
    const next = force !== undefined ? force : !this.weaponWheelOpen;
    if (next === this.weaponWheelOpen) return;
    this.weaponWheelOpen = next;
    this.sound.playSlowMo(next);
    if (next && document.pointerLockElement) {
      document.exitPointerLock?.();
    } else if (!next) {
      this.requestPointerLock();
    }
    this.emitSnapshot();
  }

  public playLockpickTick(success: boolean) {
    this.sound.playLockpickTick(success);
  }

  public completeLockpickMinigame(success: boolean) {
    const target = this.lockpickTarget;
    const car = this.lockpickCar;
    this.lockpickMinigameOpen = false;
    this.lockpickTarget = null;
    this.lockpickCar = null;
    if (!success) {
      this.requestPointerLock();
      this.emitSnapshot();
      return;
    }
    if (target === 'hotel_204') {
      this.unlockHotelDoor(this.hotelVex.suite204Door, -1);
      this.sound.playCarUnlock();
      this.requestPointerLock();
      this.emitSnapshot();
      return;
    }
    if (!car) {
      this.requestPointerLock();
      this.emitSnapshot();
      return;
    }
    car.locked = false;
    car.lockLedMat.color.setHex(0x10b981);
    car.isNpcTraffic = false;
    car.speed = 0;
    car.driverModel.visible = false;
    this.sound.playCarUnlock();
    this.enterVehicle(car);
  }

  public cancelLockpickMinigame() {
    if (!this.lockpickMinigameOpen) return;
    this.lockpickMinigameOpen = false;
    this.lockpickTarget = null;
    this.lockpickCar = null;
    this.requestPointerLock();
    this.emitSnapshot();
  }

  public triggerSmashFromMinigame() {
    const target = this.lockpickTarget;
    const car = this.lockpickCar;
    this.lockpickMinigameOpen = false;
    this.lockpickTarget = null;
    this.lockpickCar = null;
    if (target === 'hotel_204') {
      this.forceSuite204Door();
      this.requestPointerLock();
      this.emitSnapshot();
    } else if (car) {
      this.startSmashWindowCinematic(car);
    } else {
      this.requestPointerLock();
      this.emitSnapshot();
    }
  }

  private unlockHotelDoor(door: HotelRoomDoorSpec, sideSign: 1 | -1) {
    if (door.unlocked) return;
    door.unlocked = true;
    door.lockLedMat.color.setHex(0x10b981);
    door.pivot.rotation.y = sideSign * -Math.PI * 0.48;
    const col = this.colliders[door.colliderIndex];
    if (col) col.height = -1;
  }

  private forceSuite204Door() {
    const door = this.hotelVex.suite204Door;
    if (door.unlocked) return;
    this.unlockHotelDoor(door, -1);
    this.sound.playMetalCrash(0.55);
    this.spawnBurst(
      door.doorPos.clone().add(new THREE.Vector3(0, 1.2, 0)),
      0xfbbf24,
      16,
      3.0,
    );
    const guard = this.npcs.find((n) => n.id === 'hotel_guard');
    if (guard && guard.alertState !== 'eliminated') {
      guard.alertState = 'combat';
      guard.lastKnownPlayerPos = this.playerPos.clone();
      guard.alertTimer = 16;
      this.speakNpc(guard, 'guard_combat_1');
    }
  }

  public selectHotelRoom(roomId: HotelRoomId) {
    if (this.phase !== 'playing' || this.isRagdoll) return;
    const door = this.hotelVex.rooms[roomId];
    const sideSign: 1 | -1 = roomId === '203' ? -1 : 1;
    this.unlockHotelDoor(door, sideSign);
    this.chosenHotelRoom = roomId;
    this.hotelRoomMenuOpen = false;
    if (this.hotelHeistState === 'none') {
      this.hotelHeistState = 'active';
    }
    this.sound.playHotelChime();
    this.sound.speak('hotel_heist_intel', { force: true });
    this.requestPointerLock();
    this.emitSnapshot();
  }

  public closeHotelRoomMenu() {
    if (!this.hotelRoomMenuOpen) return;
    this.hotelRoomMenuOpen = false;
    this.requestPointerLock();
    this.emitSnapshot();
  }

  public setConversationActive(active: boolean, npcId?: string | null) {
    this.conversationActive = active;
    this.activeTalkNpcId = active ? (npcId ?? this.activeTalkNpcId) : null;
    this.keys.clear();
    if (active) {
      this.weaponWheelOpen = false;
      this.appearanceMenuOpen = false;
      this.lockpickMinigameOpen = false;
      this.lockpickCar = null;
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    } else {
      this.requestPointerLock();
    }
    this.emitSnapshot();
  }

  public async speakAiReply(
    npcId: string,
    replyText: string,
    mood: string,
  ) {
    const npc = this.npcs.find((n) => n.id === npcId);
    if (!npc || npc.alertState === 'eliminated') return;

    const dist = npc.position.distanceTo(this.playerPos);
    const voiceRole =
      npc.role === 'target'
        ? 'target'
        : npc.role === 'civilian' || npc.role === 'clerk'
          ? 'civilian'
          : 'guard';

    void this.sound.speakDynamicText(
      npc.name,
      voiceRole,
      npc.voiceName,
      replyText,
      { npcId: npc.id, distance: dist, pan: 0 },
    );

    if (mood === 'flee') {
      npc.alertState = 'fleeing';
    } else if (mood === 'hostile') {
      npc.alertState = npc.role === 'clerk' ? 'threaten' : 'combat';
      if (npc.role === 'clerk') {
        npc.rig.weaponGroup.visible = true;
      }
      npc.lastKnownPlayerPos = this.playerPos.clone();
      npc.alertTimer = 10;
    } else if (mood === 'nervous' && npc.role === 'clerk') {
      npc.alertState = 'cowering';
    }
    this.emitSnapshot();
  }

  public toggleMute(): boolean {
    const next = !this.sound.isMuted();
    this.sound.setMuted(next);
    return next;
  }

  public inflictTestTrauma(
    kind: 'severRightArm' | 'severLeftLeg' | 'breakLeg' | 'breakRibs',
  ) {
    if (this.phase !== 'playing' || this.isRagdoll) return;
    if (kind === 'severRightArm') {
      this.applyLimbTrauma('rightArm', 'severed');
    } else if (kind === 'severLeftLeg') {
      this.applyLimbTrauma('leftLeg', 'severed');
    } else if (kind === 'breakLeg') {
      this.applyLimbTrauma('rightLeg', 'fractured');
    } else if (kind === 'breakRibs') {
      this.applyLimbTrauma('torso', 'fractured');
    }
    this.emitSnapshot();
  }

  public triggerRegeneration() {
    if (this.phase !== 'playing' || this.isRagdoll) return;
    const anyInjured = LIMB_IDS.some(
      (id) => this.limbs[id].condition !== 'intact',
    );
    if (!anyInjured || this.isRegenerating) return;

    this.isRegenerating = true;
    this.activeRegenStage = 'bone';
    this.lastPlayedRegenStage = 'bone';
    this.sound.playRegenStage('bone');
    this.sound.speak('assassin_regen_start', { force: true });

    LIMB_IDS.forEach((id) => {
      if (this.limbs[id].condition !== 'intact') {
        this.limbs[id].regenProgress = 0.01;
        this.limbs[id].stage = 'bone';
      }
    });
    this.emitSnapshot();
  }

  private applyLimbTrauma(limbId: LimbId, kind: 'fractured' | 'severed') {
    const cur = this.limbs[limbId];
    if (cur.condition === 'severed') return;
    if (limbId === 'torso' && kind === 'severed') kind = 'fractured';

    cur.condition = kind;
    cur.regenProgress = 0;
    cur.stage = 'none';
    this.isRegenerating = false;

    const worldPos = this.playerPos.clone().add(new THREE.Vector3(0, 1.25, 0));

    if (kind === 'severed' && limbId !== 'torso') {
      this.sound.playSever();
      this.sound.speak('assassin_injured');
      this.spawnBurst(worldPos, 0xb91c1c, 22, 3.8);
      this.spawnSeveredLimbDebris(limbId);
    } else {
      this.sound.playBoneBreak();
      this.sound.speak('assassin_fracture');
      this.spawnBurst(worldPos, 0xf59e0b, 14, 2.6);
    }
    applyAnatomicalState(this.assassin, limbId, cur, this.totalTime);
  }

  private spawnSeveredLimbDebris(
    limbId: 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg',
  ) {
    const isArm = limbId === 'leftArm' || limbId === 'rightArm';
    const g = new THREE.Group();

    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xece5d2,
      roughness: 0.45,
    });
    const fleshMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.35,
    });
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0x1a202c,
      roughness: 0.72,
    });

    const segGeo = new THREE.CylinderGeometry(
      isArm ? 0.045 : 0.065,
      isArm ? 0.038 : 0.055,
      isArm ? 0.56 : 0.78,
      8,
    );
    const seg = new THREE.Mesh(segGeo, clothMat);
    seg.castShadow = true;
    g.add(seg);

    const stumpCapGeo = new THREE.SphereGeometry(isArm ? 0.048 : 0.068, 8, 6);
    const stumpCap = new THREE.Mesh(stumpCapGeo, fleshMat);
    stumpCap.position.y = isArm ? 0.28 : 0.39;
    g.add(stumpCap);

    const tipBoneGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.08, 6);
    const tipBone = new THREE.Mesh(tipBoneGeo, boneMat);
    tipBone.position.y = isArm ? 0.32 : 0.43;
    g.add(tipBone);

    const side = limbId === 'leftArm' || limbId === 'leftLeg' ? -1 : 1;
    g.position.set(
      this.playerPos.x + side * 0.4,
      this.playerPos.y + (isArm ? 1.35 : 0.65),
      this.playerPos.z,
    );
    this.scene.add(g);

    this.debris.push({
      mesh: g,
      velocity: new THREE.Vector3(
        side * (2.2 + Math.random() * 1.4),
        2.6,
        (Math.random() - 0.5) * 2.2,
      ),
      angVel: new THREE.Vector3(6, 4, 8),
      life: 9.0,
    });
  }

  private detachCarPart(
    car: DriveableVehicleSpec,
    part: THREE.Mesh,
    velScale: number,
  ) {
    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    part.getWorldPosition(worldPos);
    part.getWorldQuaternion(worldQuat);
    car.root.remove(part);
    part.position.copy(worldPos);
    part.quaternion.copy(worldQuat);
    this.scene.add(part);

    this.debris.push({
      mesh: part,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 6 * velScale,
        3.2 + Math.random() * 3,
        (Math.random() - 0.5) * 6 * velScale,
      ),
      angVel: new THREE.Vector3(5, 7, 4),
      life: 14.0,
    });
  }

  private shatterGlassPane(glass: DestructibleGlassSpec) {
    if (glass.shattered) return;
    glass.shattered = true;
    glass.mesh.visible = false;
    const col = this.colliders[glass.colliderIndex];
    if (col) col.height = -1; // disable collision cleanly
    this.sound.playGlassShatter();
    this.spawnBurst(glass.center, 0xa5f3fc, 28, 4.6);

    // Glass shattering startles nearby store clerk or guards without adding wanted stars
    const glassHearingRadius = 15 * WEATHER_CONFIGS[this.weather].hearingMult;
    for (const npc of this.npcs) {
      if (npc.alertState === 'eliminated') continue;
      const dist = npc.position.distanceTo(glass.center);
      if (dist > glassHearingRadius) continue;
      if (npc.role === 'clerk') {
        if (npc.storeClerkArchetype === 'threaten') {
          npc.alertState = 'threaten';
          npc.rig.weaponGroup.visible = true;
          this.speakNpc(npc, 'clerk_threat');
        } else {
          npc.alertState = 'cowering';
          this.speakNpc(npc, 'clerk_beg');
        }
      } else if (npc.role === 'guard' || npc.role === 'heavy') {
        if (npc.alertState === 'neutral' || npc.alertState === 'patrol') {
          npc.alertState = 'suspicious';
          npc.lastKnownPlayerPos = glass.center.clone();
          npc.alertTimer = 8;
        }
      }
    }
  }

  private damageVehicleAt(
    car: DriveableVehicleSpec,
    impactSpeed: number,
    hitSpot?: 'front' | 'rear' | 'side' | 'glass',
  ) {
    car.health -= impactSpeed * 2.5;
    this.sound.playMetalCrash(Math.min(1.3, impactSpeed / 14));

    if (!car.windshieldBroken && (hitSpot === 'glass' || impactSpeed > 8)) {
      car.windshieldBroken = true;
      car.windshield.visible = false;
      const wp = new THREE.Vector3();
      car.windshield.getWorldPosition(wp);
      this.sound.playGlassShatter();
      this.spawnBurst(wp, 0xbae6fd, 22, 4.0);
    }

    if (!car.sideWindowsBroken && (hitSpot === 'glass' || impactSpeed > 13)) {
      car.sideWindowsBroken = true;
      car.sideWindows.visible = false;
      const wp = new THREE.Vector3();
      car.sideWindows.getWorldPosition(wp);
      this.spawnBurst(wp, 0xbae6fd, 18, 3.6);
    }

    if (!car.frontBumperDetached && hitSpot !== 'rear' && impactSpeed > 7) {
      car.frontBumperDetached = true;
      this.detachCarPart(car, car.frontBumper, 1.0);
    }
    if (!car.rearBumperDetached && hitSpot === 'rear' && impactSpeed > 7) {
      car.rearBumperDetached = true;
      this.detachCarPart(car, car.rearBumper, 1.0);
    }
    if (!car.hoodDetached && impactSpeed > 11) {
      car.hoodDetached = true;
      this.detachCarPart(car, car.hood, 1.2);
    }
    if (!car.leftDoorDetached && impactSpeed > 15) {
      car.leftDoorDetached = true;
      this.detachCarPart(car, car.leftDoor, 1.1);
    }
    if (!car.rightDoorDetached && impactSpeed > 17) {
      car.rightDoorDetached = true;
      this.detachCarPart(car, car.rightDoor, 1.1);
    }
  }

  private spawnBurst(
    origin: THREE.Vector3,
    colorHex: number,
    count: number,
    speed: number,
  ) {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;
      velocities[i * 3] = (Math.random() - 0.5) * speed * 2;
      velocities[i * 3 + 1] = Math.random() * speed * 1.6;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.12,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);
    this.bursts.push({ points: pts, velocities, life: 0.55, maxLife: 0.55 });
  }

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);

    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    dom.addEventListener('contextmenu', this.handleContextMenu);
    dom.addEventListener('webglcontextlost', this.handleWebglLost);
  }

  private handleWebglLost = (e: Event) => {
    e.preventDefault();
    this.onContextLost?.();
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private handleResize = () => {
    if (this.disposed) return;
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private handlePointerLockChange = () => {
    this.pointerLocked =
      document.pointerLockElement === this.renderer.domElement;
    this.emitSnapshot();
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (this.phase !== 'playing' || this.isRagdoll) return;
    if (
      this.weaponWheelOpen ||
      this.appearanceMenuOpen ||
      this.lockpickMinigameOpen ||
      this.hotelRoomMenuOpen ||
      this.activeCinematic !== 'none' ||
      this.conversationActive
    ) {
      return;
    }
    this.sound.startAmbience();

    if (!this.pointerLocked) {
      this.requestPointerLock();
    }

    if (e.button === 0) {
      this.isMouseDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      if (!this.activeVehicle) {
        this.performPrimaryAttack();
      }
    } else if (e.button === 2 && !this.activeVehicle) {
      this.throwKunai();
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (
      this.phase !== 'playing' ||
      this.weaponWheelOpen ||
      this.appearanceMenuOpen ||
      this.lockpickMinigameOpen ||
      this.hotelRoomMenuOpen ||
      this.activeCinematic !== 'none' ||
      this.conversationActive
    ) {
      return;
    }
    const sens = 0.0024;
    if (this.pointerLocked) {
      this.camYaw -= e.movementX * sens;
      this.camPitch = THREE.MathUtils.clamp(
        this.camPitch + e.movementY * sens,
        -0.38,
        0.72,
      );
    } else if (this.isMouseDragging) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.camYaw -= dx * 0.0045;
      this.camPitch = THREE.MathUtils.clamp(
        this.camPitch + dy * 0.0045,
        -0.38,
        0.72,
      );
    }
  };

  private handleMouseUp = () => {
    this.isMouseDragging = false;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.conversationActive) {
      if (e.code === 'Escape') {
        this.setConversationActive(false);
      }
      return;
    }

    if (this.lockpickMinigameOpen) {
      if (e.code === 'Escape') {
        this.cancelLockpickMinigame();
      }
      return;
    }

    this.keys.add(e.code);
    if (this.phase === 'intro') {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        this.skipIntro();
      }
      return;
    }
    if (this.phase !== 'playing' || this.isRagdoll) return;

    if (this.activeCinematic !== 'none') return;

    if (this.hotelRoomMenuOpen) {
      if (e.code === 'Escape') {
        this.closeHotelRoomMenu();
      }
      return;
    }

    if (this.appearanceMenuOpen) {
      if (e.code === 'Escape' || e.code === 'KeyB') {
        this.toggleAppearanceMenu(false);
      }
      return;
    }

    if (e.code === 'KeyG') {
      e.preventDefault();
      this.toggleWeaponWheel();
      return;
    }

    if (this.weaponWheelOpen) {
      if (e.code === 'Digit1') this.setWeapon('unarmed');
      else if (e.code === 'Digit2') this.setWeapon('blades');
      else if (e.code === 'Digit3') this.setWeapon('kunai');
      else if (e.code === 'Digit4') this.setWeapon('pistol');
      else if (e.code === 'Digit5') this.setWeapon('shotgun');
      else if (e.code === 'Digit6') this.setWeapon('lockpick');
      else if (e.code === 'Escape') this.toggleWeaponWheel(false);
      return;
    }

    if (
      e.code === 'KeyB' &&
      !this.activeVehicle &&
      this.getCurrentZoneName() === 'Atelier Vex Boutique (Interior)'
    ) {
      this.toggleAppearanceMenu(true);
      return;
    }

    if (e.code === 'KeyE') {
      this.handleInteractKey();
      return;
    }

    if (e.code === 'KeyN') {
      this.cycleWeather();
      return;
    }

    if (e.code === 'KeyT' && !this.activeVehicle) {
      const talk = this.getTalkCandidate();
      if (talk) {
        this.setConversationActive(true, talk.id);
        this.onRequestTalk?.(talk);
      }
      return;
    }

    if (this.activeVehicle) return;

    const floorY = this.getGroundHeightAt(this.playerPos.x, this.playerPos.z);
    if (e.code === 'KeyC' || e.code === 'ControlLeft') {
      this.crouchToggled = !this.crouchToggled;
    } else if (e.code === 'KeyF') {
      this.performPrimaryAttack();
    } else if (e.code === 'KeyQ') {
      this.throwKunai();
    } else if (e.code === 'KeyR') {
      this.triggerRegeneration();
    } else if (e.code === 'Space' && this.playerPos.y <= floorY + 0.08) {
      const legBroken =
        this.limbs.leftLeg.condition !== 'intact' ||
        this.limbs.rightLeg.condition !== 'intact';
      this.playerVelY = legBroken ? 4.4 : 6.6;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private getNearestVehicle(maxDist = 3.8): DriveableVehicleSpec | null {
    let best: DriveableVehicleSpec | null = null;
    let bestD = maxDist;
    for (const v of this.vehicles) {
      const d = v.position.distanceTo(this.playerPos);
      if (d < bestD) {
        bestD = d;
        best = v;
      }
    }
    return best;
  }

  private enterVehicle(car: DriveableVehicleSpec) {
    this.activeVehicle = car;
    car.isNpcTraffic = false;
    car.driverModel.visible = false;
    this.crouchToggled = false;
    this.assassin.root.visible = false;
    // Clear parked collider while driving
    const col = this.colliders[car.colliderIndex];
    if (col) col.height = -1;
    this.sound.playCarDoor();
    this.requestPointerLock();
    this.emitSnapshot();
  }

  private startSmashWindowCinematic(car: DriveableVehicleSpec) {
    car.speed = 0;
    car.isNpcTraffic = false;
    car.driverModel.visible = false;

    this.activeCinematic = 'smash_car_window';
    this.cinematicTimer = 0;
    this.smashCar = car;
    this.smashWindowBroken = false;
    this.smashPainCried = false;
    this.crouchToggled = false;
    this.keys.clear();
    this.weaponWheelOpen = false;
    this.appearanceMenuOpen = false;
    this.lockpickMinigameOpen = false;
    this.lockpickCar = null;

    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    this.emitSnapshot();
  }

  private handleInteractKey() {
    if (this.activeVehicle) {
      this.toggleVehicleEntry();
      return;
    }

    // 1. Steal Encrypted Obsidian Ledger in Suite 204
    if (
      !this.hotelVex.ledgerStolen &&
      this.hotelVex.suite204Door.unlocked &&
      this.playerPos.distanceTo(this.hotelVex.ledgerPos) < 3.0
    ) {
      this.hotelVex.ledgerStolen = true;
      this.hotelVex.ledgerMesh.visible = false;
      this.hotelHeistState = 'completed';
      this.sound.playHeistPickup();
      this.sound.speak('assassin_heist_done', { force: true });
      this.spawnBurst(this.hotelVex.ledgerPos.clone(), 0x10b981, 24, 3.6);
      this.emitSnapshot();
      return;
    }

    // 2. Unlock Suite 204 Door (silent lockpick vs forceful alert)
    if (
      !this.hotelVex.suite204Door.unlocked &&
      this.playerPos.distanceTo(this.hotelVex.suite204Door.doorPos) < 2.8
    ) {
      if (this.equippedWeapon === 'lockpick') {
        this.lockpickTarget = 'hotel_204';
        this.lockpickCar = null;
        this.lockpickMinigameOpen = true;
        this.keys.clear();
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        this.emitSnapshot();
      } else {
        this.forceSuite204Door();
        this.emitSnapshot();
      }
      return;
    }

    // 3. Rest in chosen Hotel Suite bed to heal & regenerate limbs
    if (this.chosenHotelRoom) {
      const chosenDoor = this.hotelVex.rooms[this.chosenHotelRoom];
      if (
        chosenDoor.bedPos &&
        this.playerPos.distanceTo(chosenDoor.bedPos) < 3.2
      ) {
        this.health = this.maxHealth;
        this.stamina = 100;
        this.isRegenerating = false;
        this.activeRegenStage = 'none';
        LIMB_IDS.forEach((id) => {
          this.limbs[id] = { condition: 'intact', regenProgress: 0, stage: 'none' };
          applyAnatomicalState(this.assassin, id, this.limbs[id], this.totalTime);
        });
        this.sound.playHotelChime();
        this.spawnBurst(
          this.playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)),
          0x38bdf8,
          18,
          2.5,
        );
        this.emitSnapshot();
        return;
      }
    }

    // 4. Hotel Vex Front Desk check-in / change suite
    if (this.playerPos.distanceTo(this.hotelVex.deskPos) < 4.0) {
      if (!this.hotelCheckinDone) {
        this.startHotelCheckinCinematic();
      } else {
        this.hotelRoomMenuOpen = true;
        this.keys.clear();
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        this.emitSnapshot();
      }
      return;
    }

    this.toggleVehicleEntry();
  }

  private startHotelCheckinCinematic() {
    this.activeCinematic = 'hotel_checkin';
    this.cinematicTimer = 0;
    this.hotelGreetingSpoken = false;
    this.crouchToggled = false;
    this.keys.clear();
    this.weaponWheelOpen = false;
    this.appearanceMenuOpen = false;
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    const concierge = this.npcs.find((n) => n.id === 'hotel_concierge');
    if (concierge) {
      this.speakNpc(concierge, 'hotel_concierge_greet');
    } else {
      this.sound.speak('hotel_concierge_greet', { force: true });
    }
    this.emitSnapshot();
  }

  private toggleVehicleEntry() {
    if (this.activeVehicle) {
      const car = this.activeVehicle;
      car.speed *= 0.25;
      // Restore car collider at current resting pose
      const halfX =
        Math.abs(Math.cos(car.yaw)) * 1.05 + Math.abs(Math.sin(car.yaw)) * 2.2;
      const halfZ =
        Math.abs(Math.sin(car.yaw)) * 1.05 + Math.abs(Math.cos(car.yaw)) * 2.2;
      const col = this.colliders[car.colliderIndex];
      if (col) {
        col.minX = car.position.x - halfX;
        col.maxX = car.position.x + halfX;
        col.minZ = car.position.z - halfZ;
        col.maxZ = car.position.z + halfZ;
        col.height = 1.58;
      }

      // Exit to left driver side (+X in +Z forward space rotated by yaw)
      this.playerPos.set(
        car.position.x + Math.cos(car.yaw) * 1.85,
        this.getGroundHeightAt(car.position.x, car.position.z),
        car.position.z - Math.sin(car.yaw) * 1.85,
      );
      this.assassin.root.visible = true;
      this.activeVehicle = null;
      this.sound.playCarDoor();
      this.emitSnapshot();
      return;
    }

    const near = this.getNearestVehicle(4.0);
    if (!near) return;
    near.speed = 0;
    near.isNpcTraffic = false;
    near.driverModel.visible = false;

    if (near.locked) {
      if (this.equippedWeapon === 'lockpick') {
        this.lockpickTarget = 'car';
        this.lockpickCar = near;
        this.lockpickMinigameOpen = true;
        this.keys.clear();
        this.weaponWheelOpen = false;
        this.appearanceMenuOpen = false;
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        this.emitSnapshot();
      } else {
        this.startSmashWindowCinematic(near);
      }
      return;
    }

    this.enterVehicle(near);
  }

  private getTalkCandidate(): TalkTargetInfo | null {
    if (this.activeVehicle) return null;
    let bestNpc: NpcEntity | null = null;
    let bestD = 3.8;
    for (const npc of this.npcs) {
      if (npc.alertState === 'eliminated' || npc.alertState === 'combat') continue;
      const d = npc.position.distanceTo(this.playerPos);
      if (d < bestD) {
        bestD = d;
        bestNpc = npc;
      }
    }
    if (!bestNpc) return null;
    return {
      id: bestNpc.id,
      name: bestNpc.name,
      role: bestNpc.role,
      zone: this.getCurrentZoneName(),
      voiceName: bestNpc.voiceName,
    };
  }

  private getGroundHeightAt(x: number, z: number): number {
    let bestY = 0;
    for (const w of this.walkables) {
      if (x >= w.minX && x <= w.maxX && z >= w.minZ && z <= w.maxZ) {
        let y = w.yStart;
        if (w.axis === 'z') {
          const t = (z - w.minZ) / Math.max(0.001, w.maxZ - w.minZ);
          y = THREE.MathUtils.lerp(w.yStart, w.yEnd, t);
        } else if (w.axis === 'x') {
          const t = (x - w.minX) / Math.max(0.001, w.maxX - w.minX);
          y = THREE.MathUtils.lerp(w.yStart, w.yEnd, t);
        }
        if (y > bestY) bestY = y;
      }
    }
    return bestY;
  }

  private getCurrentZoneName(): string {
    for (const z of this.zones) {
      if (
        this.playerPos.x >= z.minX &&
        this.playerPos.x <= z.maxX &&
        this.playerPos.z >= z.minZ &&
        this.playerPos.z <= z.maxZ
      ) {
        return z.name;
      }
    }
    return 'Outer City Boulevard';
  }

  private getSilenceWitnessCandidate(): NpcEntity | null {
    if (this.activeVehicle || this.activeCinematic !== 'none') return null;
    let best: NpcEntity | null = null;
    let bestScore = Infinity;
    for (const npc of this.npcs) {
      if (npc.alertState === 'eliminated' || npc.disposed) continue;
      if (
        npc.alertState !== 'calling_police' &&
        npc.alertState !== 'staring' &&
        npc.alertState !== 'suspicious'
      ) {
        continue;
      }
      const dist = npc.position.distanceTo(this.playerPos);
      if (dist <= 3.1) {
        const score =
          dist - (npc.alertState === 'calling_police' ? 1.2 : 0.4);
        if (score < bestScore) {
          bestScore = score;
          best = npc;
        }
      }
    }
    return best;
  }

  private getStealthKillCandidate(): NpcEntity | null {
    if (this.activeVehicle) return null;
    for (const npc of this.npcs) {
      if (npc.alertState === 'eliminated' || npc.disposed) continue;
      const dist = npc.position.distanceTo(this.playerPos);
      if (
        dist <= 2.65 &&
        npc.alertState !== 'combat' &&
        npc.alertState !== 'threaten'
      ) {
        return npc;
      }
    }
    return null;
  }

  private startSilenceCinematic(npc: NpcEntity) {
    let nearestDump: DumpsterSpec | null = null;
    let bestD = Infinity;
    for (const d of this.dumpsters) {
      const dist = d.position.distanceTo(npc.position);
      if (dist < bestD) {
        bestD = dist;
        nearestDump = d;
      }
    }

    this.activeCinematic = 'silence_kill';
    this.cinematicTimer = 0;
    this.silenceNpc = npc;
    this.silenceDumpster = nearestDump;
    this.silenceStartPos.copy(npc.position);
    if (nearestDump) {
      this.silenceDumpStandPos.set(
        nearestDump.position.x + Math.sin(nearestDump.yaw) * 1.45,
        this.getGroundHeightAt(
          nearestDump.position.x + Math.sin(nearestDump.yaw) * 1.45,
          nearestDump.position.z + Math.cos(nearestDump.yaw) * 1.45,
        ),
        nearestDump.position.z + Math.cos(nearestDump.yaw) * 1.45,
      );
    } else {
      this.silenceDumpStandPos.copy(npc.position);
    }
    this.silenceShotFired = false;
    this.silenceDumped = false;
    this.silenceLidClosed = false;

    this.crouchToggled = false;
    this.keys.clear();
    this.weaponWheelOpen = false;
    this.appearanceMenuOpen = false;

    npc.rig.phoneMesh.visible = false;
    npc.rig.posterMesh.visible = false;
    npc.rig.alertRing.visible = false;
    npc.rig.muzzleFlash.visible = false;
    npc.suspicion = 0;
    npc.callTimer = 0;
    npc.alertState = 'eliminated';

    setAssassinWeaponVisual(this.assassin, 'pistol');
    this.sound.playMuffledStruggle();
    this.speakNpc(npc, 'npc_muffled');

    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    this.emitSnapshot();
  }

  private performPrimaryAttack() {
    if (this.attackCooldown > 0 || this.activeCinematic !== 'none') return;

    const silenceTarget = this.getSilenceWitnessCandidate();
    if (silenceTarget) {
      this.startSilenceCinematic(silenceTarget);
      return;
    }

    if (this.equippedWeapon === 'lockpick') {
      if (
        !this.hotelVex.suite204Door.unlocked &&
        this.playerPos.distanceTo(this.hotelVex.suite204Door.doorPos) < 2.8
      ) {
        this.lockpickTarget = 'hotel_204';
        this.lockpickCar = null;
        this.lockpickMinigameOpen = true;
        this.keys.clear();
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        this.emitSnapshot();
        return;
      }
      const nearCar = this.getNearestVehicle(4.0);
      if (nearCar && nearCar.locked) {
        nearCar.speed = 0;
        nearCar.isNpcTraffic = false;
        nearCar.driverModel.visible = false;
        this.lockpickTarget = 'car';
        this.lockpickCar = nearCar;
        this.lockpickMinigameOpen = true;
        this.keys.clear();
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        this.emitSnapshot();
      }
      return;
    }

    if (this.equippedWeapon === 'pistol') {
      this.fireFirearm(false);
      return;
    }
    if (this.equippedWeapon === 'shotgun') {
      this.fireFirearm(true);
      return;
    }

    const bothArmsSevered =
      this.limbs.leftArm.condition === 'severed' &&
      this.limbs.rightArm.condition === 'severed';
    this.attackCooldown = bothArmsSevered ? 0.65 : 0.36;
    this.attackAnim = 1.0;
    this.attackCombo = (this.attackCombo + 1) % 2;

    const stealthTarget = this.getStealthKillCandidate();
    if (stealthTarget && this.equippedWeapon !== 'unarmed') {
      _v1.subVectors(stealthTarget.position, this.playerPos).setY(0);
      const hitDir =
        _v1.lengthSq() > 0.001
          ? _v1.clone().normalize()
          : new THREE.Vector3(Math.sin(this.playerYaw), 0, Math.cos(this.playerYaw));
      this.eliminateNpc(stealthTarget, true, hitDir);
      this.sound.playStealthKill();
      if (_v1.length() > 0.8) {
        _v1.normalize().multiplyScalar(0.5);
        this.playerPos.add(_v1);
      }
      this.health = Math.min(this.maxHealth, this.health + 12);
      return;
    }

    this.sound.playSlash();

    const forwardDir = _v1.set(
      Math.sin(this.playerYaw),
      0,
      Math.cos(this.playerYaw),
    );
    const dmg =
      this.equippedWeapon === 'unarmed' ? 26 : bothArmsSevered ? 24 : 52;

    // Check melee shattering nearby storefront glass or parked car glass!
    for (const glass of this.destructibleGlass) {
      if (glass.shattered) continue;
      if (glass.center.distanceTo(this.playerPos) < 2.9) {
        this.shatterGlassPane(glass);
      }
    }
    for (const car of this.vehicles) {
      if (car.position.distanceTo(this.playerPos) < 2.8) {
        if (car.isNpcTraffic) {
          car.isNpcTraffic = false;
          car.speed = 0;
          car.driverModel.visible = false;
        }
        this.damageVehicleAt(car, 9, 'glass');
      }
    }

    for (const npc of this.npcs) {
      if (npc.alertState === 'eliminated') continue;
      _v2.subVectors(npc.position, this.playerPos);
      const dy = Math.abs(_v2.y);
      _v2.y = 0;
      const dist = _v2.length();
      if (dist <= 2.75 && dy < 1.8) {
        _v2.normalize();
        if (forwardDir.dot(_v2) > 0.15 || dist < 1.35) {
          this.damageNpc(npc, dmg, true, _v2.clone());
        }
      }
    }
  }

  private fireFirearm(isShotgun: boolean) {
    if (
      this.limbs.leftArm.condition === 'severed' &&
      this.limbs.rightArm.condition === 'severed'
    ) {
      return;
    }
    this.attackCooldown = isShotgun ? 0.78 : 0.28;
    this.attackAnim = 0.65;

    if (isShotgun) {
      this.sound.playShotgunBlast(0);
      // Loud gunfire alerts nearby NPCs to sound without granting wanted stars (rain muffles range)
      const shotHearingRadius = 28 * WEATHER_CONFIGS[this.weather].hearingMult;
      for (const npc of this.npcs) {
        if (npc.alertState === 'eliminated') continue;
        const dist = npc.position.distanceTo(this.playerPos);
        if (dist > shotHearingRadius) continue;
        if (npc.role === 'civilian' && npc.alertState !== 'fleeing') {
          npc.alertState = 'fleeing';
          npc.alertTimer = 14;
        } else if (
          (npc.role === 'guard' || npc.role === 'heavy' || npc.role === 'target') &&
          (npc.alertState === 'neutral' || npc.alertState === 'patrol')
        ) {
          npc.alertState = 'suspicious';
          npc.lastKnownPlayerPos = this.playerPos.clone();
          npc.alertTimer = 10;
        }
      }
    } else {
      // Silenced 9mm: completely silent, alerts zero NPCs!
      this.sound.playPistolShot(0);
    }

    const origin = this.playerPos.clone().add(new THREE.Vector3(0, 1.44, 0));
    const baseDir = new THREE.Vector3();
    this.camera.getWorldDirection(baseDir);
    baseDir.normalize();

    const pellets = isShotgun ? 5 : 1;
    for (let i = 0; i < pellets; i++) {
      const dir = baseDir.clone();
      if (isShotgun) {
        dir.x += (Math.random() - 0.5) * 0.14;
        dir.y += (Math.random() - 0.5) * 0.08;
        dir.z += (Math.random() - 0.5) * 0.14;
        dir.normalize();
      }
      const mesh = new THREE.Mesh(this.bulletGeo, this.playerBulletMat);
      mesh.position.copy(origin);
      this.scene.add(mesh);

      this.projectiles.push({
        mesh,
        position: origin.clone(),
        velocity: dir.multiplyScalar(isShotgun ? 44 : 52),
        fromPlayer: true,
        isSilent: !isShotgun,
        damage: isShotgun ? 34 : 58,
        life: isShotgun ? 0.9 : 1.6,
      });
    }
  }

  private throwKunai() {
    if (this.kunaiCooldown > 0 || this.phase !== 'playing') return;
    if (
      this.limbs.leftArm.condition === 'severed' &&
      this.limbs.rightArm.condition === 'severed'
    ) {
      return;
    }

    this.kunaiCooldown = 1.1;
    this.attackAnim = 0.7;
    this.sound.playKunaiThrow();

    const origin = this.playerPos.clone().add(new THREE.Vector3(0, 1.42, 0));
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    dir.normalize();

    const mesh = new THREE.Mesh(this.kunaiGeo, this.kunaiMat);
    mesh.position.copy(origin);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      position: origin,
      velocity: dir.multiplyScalar(42),
      fromPlayer: true,
      isSilent: true,
      damage: 64,
      life: 2.2,
    });
  }

  /**
   * Returns living NPCs who actually have line-of-sight visual confirmation of the kill.
   */
  private getKillWitnesses(
    victim: NpcEntity,
    killPos: THREE.Vector3,
  ): NpcEntity[] {
    const witnesses: NpcEntity[] = [];
    const eyeA = new THREE.Vector3();
    const targetB = new THREE.Vector3(killPos.x, killPos.y + 1.1, killPos.z);
    const toKill = new THREE.Vector3();
    const npcFwd = new THREE.Vector3();

    const weatherCfg = WEATHER_CONFIGS[this.weather];
    const witnessRange = 34 * weatherCfg.sightMult;
    const closePeripheralRange = 9.5 * weatherCfg.sightMult;

    for (const npc of this.npcs) {
      if (npc === victim || npc.alertState === 'eliminated') continue;
      const dist = npc.position.distanceTo(killPos);
      if (dist > witnessRange) continue;

      toKill.subVectors(killPos, npc.position).setY(0);
      const len = toKill.length();
      if (len > 0.01) toKill.divideScalar(len);

      npcFwd.set(Math.sin(npc.yaw), 0, Math.cos(npc.yaw));
      const facingKill =
        npcFwd.dot(toKill) > 0.08 || dist <= closePeripheralRange;
      if (!facingKill) continue;

      eyeA.set(npc.position.x, npc.position.y + 1.52, npc.position.z);
      if (this.hasLineOfSight(eyeA, targetB)) {
        witnesses.push(npc);
      }
    }
    return witnesses;
  }

  /**
   * Grants wanted stars and triggers witness panic ONLY when someone actually witnesses a kill!
   */
  private onKillWitnessed(witnesses: NpcEntity[], killPos: THREE.Vector3) {
    this.wantedLevel = Math.min(3, this.wantedLevel + 1);

    for (const npc of witnesses) {
      const dist = npc.position.distanceTo(killPos);
      if (npc.role === 'civilian') {
        npc.alertState = 'fleeing';
        npc.alertTimer = 18;
        if (dist < 28) {
          this.speakNpc(
            npc,
            Math.random() > 0.5 ? 'civ_panic_1' : 'civ_panic_2',
          );
        }
      } else if (npc.role === 'clerk') {
        if (npc.storeClerkArchetype === 'threaten') {
          npc.alertState = dist < 14 ? 'threaten' : 'cowering';
          npc.rig.weaponGroup.visible = true;
          npc.alertTimer = 16;
          this.speakNpc(npc, 'clerk_threat');
        } else {
          npc.alertState = dist < 12 ? 'cowering' : 'fleeing';
          npc.alertTimer = 16;
          this.speakNpc(npc, 'clerk_beg');
        }
      } else {
        npc.alertState = 'combat';
        npc.lastKnownPlayerPos = this.playerPos.clone();
        npc.alertTimer = 14;
        this.speakNpc(
          npc,
          npc.role === 'target' ? 'target_panic' : 'guard_combat_1',
        );
      }
    }

    // Guards near shouting witnesses also rally to the witness call
    for (const other of this.npcs) {
      if (other.alertState === 'eliminated') continue;
      if (
        other.role !== 'guard' &&
        other.role !== 'heavy' &&
        other.role !== 'target'
      ) {
        continue;
      }
      if (witnesses.includes(other)) continue;
      if (
        witnesses.some((w) => w.position.distanceTo(other.position) < 22) &&
        (other.alertState === 'neutral' || other.alertState === 'patrol')
      ) {
        other.alertState = 'suspicious';
        other.lastKnownPlayerPos = this.playerPos.clone();
        other.alertTimer = 12;
      }
    }
  }

  private damageNpc(
    npc: NpcEntity,
    amount: number,
    isStealth: boolean,
    hitDir?: THREE.Vector3,
  ) {
    if (npc.alertState === 'eliminated') return;
    npc.health -= amount;
    this.spawnBurst(
      npc.position.clone().add(new THREE.Vector3(0, 1.3, 0)),
      0xdc2626,
      14,
      3.2,
    );

    if (npc.health <= 0) {
      this.eliminateNpc(npc, isStealth, hitDir);
    } else {
      // Non-lethal hit: wounded NPC reacts, NO wanted stars until a kill is witnessed!
      if (npc.role === 'civilian') {
        npc.alertState = 'fleeing';
        this.speakNpc(npc, 'civ_panic_1');
      } else if (npc.role === 'clerk' && npc.storeClerkArchetype === 'beg') {
        npc.alertState = 'fleeing';
        this.speakNpc(npc, 'clerk_beg');
      } else {
        npc.alertState = 'combat';
        if (npc.role === 'clerk') npc.rig.weaponGroup.visible = true;
        npc.lastKnownPlayerPos = this.playerPos.clone();
        npc.alertTimer = 12;
        this.speakNpc(
          npc,
          npc.role === 'target'
            ? 'target_panic'
            : npc.role === 'clerk'
              ? 'clerk_threat'
              : 'guard_combat_1',
        );
      }

      // Loud shots/impacts alert nearby guards with LOS, suppressed shots do NOT!
      if (!isStealth) {
        for (const other of this.npcs) {
          if (other === npc || other.alertState === 'eliminated') continue;
          if (
            (other.role === 'guard' || other.role === 'heavy') &&
            other.position.distanceTo(npc.position) < 18 &&
            (other.alertState === 'neutral' || other.alertState === 'patrol')
          ) {
            other.alertState = 'suspicious';
            other.lastKnownPlayerPos = this.playerPos.clone();
            other.alertTimer = 10;
          }
        }
      }
    }
  }

  private eliminateNpc(
    npc: NpcEntity,
    isStealth: boolean,
    hitDir?: THREE.Vector3,
  ) {
    npc.health = 0;
    npc.alertState = 'eliminated';
    npc.deathTimer = 0.001;
    npc.ragdollSeed = Math.random() > 0.5 ? 1 : -1;
    npc.rig.alertRing.visible = false;
    npc.rig.muzzleFlash.visible = false;

    const kb = hitDir
      ? hitDir.clone().setY(0).normalize()
      : new THREE.Vector3().subVectors(npc.position, this.playerPos).setY(0).normalize();
    const npcFwd = new THREE.Vector3(Math.sin(npc.yaw), 0, Math.cos(npc.yaw));
    // Tip backward if hit in front, forward if hit from behind
    npc.ragdollFallDir = npcFwd.dot(kb) < 0 ? -1 : 1;
    npc.ragdollVel.copy(kb).multiplyScalar(isStealth ? 2.4 : 4.6);

    this.spawnBurst(
      npc.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
      0xb91c1c,
      20,
      3.4,
    );

    // Witness check: wanted stars ONLY appear if another living NPC witnesses the kill!
    const witnesses = this.getKillWitnesses(npc, npc.position);
    if (witnesses.length > 0) {
      this.onKillWitnessed(witnesses, npc.position);
    }

    const dist = npc.position.distanceTo(this.playerPos);
    if (!isStealth && witnesses.length > 0 && dist < 24 && npc.role !== 'civilian') {
      this.sound.speak('guard_down', { npcId: npc.id, distance: dist, pan: 0 });
    } else {
      this.sound.speak(
        Math.random() > 0.5 ? 'assassin_kill_1' : 'assassin_kill_2',
      );
    }

    const targetsAlive = this.npcs.filter(
      (n) => n.role === 'target' && n.alertState !== 'eliminated',
    ).length;

    if (targetsAlive === 0) {
      this.phase = 'victory';
      this.sound.speak('assassin_victory', { force: true });
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      this.emitSnapshot();
    }
  }

  private speakNpc(npc: NpcEntity, lineId: string) {
    const dist = npc.position.distanceTo(this.playerPos);
    if (dist > 50) return;
    _v1.subVectors(npc.position, this.playerPos).setY(0);
    _right.set(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
    const pan =
      _v1.lengthSq() > 0.01
        ? THREE.MathUtils.clamp(_v1.normalize().dot(_right), -0.88, 0.88)
        : 0;
    this.sound.speak(lineId, { npcId: npc.id, distance: dist, pan });
  }

  private hasLineOfSight(a: THREE.Vector3, b: THREE.Vector3): boolean {
    const steps = 12;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const px = THREE.MathUtils.lerp(a.x, b.x, t);
      const py = THREE.MathUtils.lerp(a.y, b.y, t);
      const pz = THREE.MathUtils.lerp(a.z, b.z, t);
      for (const c of this.colliders) {
        const minY = c.minY ?? 0;
        if (
          c.height > 1.6 &&
          py >= minY &&
          py <= c.height &&
          px >= c.minX &&
          px <= c.maxX &&
          pz >= c.minZ &&
          pz <= c.maxZ
        ) {
          return false;
        }
      }
    }
    return true;
  }

  private resolveCircleCollisions(pos: THREE.Vector3, radius: number): number {
    let maxPen = 0;
    const prevX = pos.x;
    const prevZ = pos.z;

    pos.x = THREE.MathUtils.clamp(pos.x, -114, 114);
    pos.z = THREE.MathUtils.clamp(pos.z, -114, 114);
    if (pos.x !== prevX || pos.z !== prevZ) maxPen = 0.25;

    for (const c of this.colliders) {
      const minY = c.minY ?? 0;
      if (c.height < 0) continue;
      if (pos.y + 1.6 < minY) continue;
      if (pos.y >= c.height - 0.15) continue;

      const closestX = THREE.MathUtils.clamp(pos.x, c.minX, c.maxX);
      const closestZ = THREE.MathUtils.clamp(pos.z, c.minZ, c.maxZ);
      const dx = pos.x - closestX;
      const dz = pos.z - closestZ;
      const distSq = dx * dx + dz * dz;
      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        if (dist > 0.0001) {
          const push = radius - dist;
          maxPen = Math.max(maxPen, push);
          pos.x += (dx / dist) * push;
          pos.z += (dz / dist) * push;
        } else {
          const penL = Math.abs(pos.x - c.minX);
          const penR = Math.abs(c.maxX - pos.x);
          const penT = Math.abs(pos.z - c.minZ);
          const penB = Math.abs(c.maxZ - pos.z);
          const m = Math.min(penL, penR, penT, penB);
          maxPen = Math.max(maxPen, m);
          if (m === penL) pos.x = c.minX - radius;
          else if (m === penR) pos.x = c.maxX + radius;
          else if (m === penT) pos.z = c.minZ - radius;
          else pos.z = c.maxZ + radius;
        }
      }
    }
    return maxPen;
  }

  private updateDynamicLights() {
    if (this.pointLightPool.length === 0 || this.lightAnchors.length === 0) {
      return;
    }
    const sorted = this.lightAnchors
      .map((a) => ({
        a,
        dSq:
          (a.x - this.playerPos.x) * (a.x - this.playerPos.x) +
          (a.z - this.playerPos.z) * (a.z - this.playerPos.z),
      }))
      .sort((u, v) => u.dSq - v.dSq);

    for (let i = 0; i < this.pointLightPool.length; i++) {
      const pl = this.pointLightPool[i];
      const item = sorted[i];
      if (!item) {
        pl.intensity = 0;
        continue;
      }
      pl.position.set(item.a.x, item.a.y, item.a.z);
      pl.color.setHex(item.a.color);
      pl.intensity = item.a.intensity;
      pl.distance = item.a.distance;
    }
  }

  private startLoop() {
    const tick = () => {
      if (this.disposed) return;
      const rawDt = Math.min(0.05, this.clock.getDelta());
      this.update(rawDt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };
    tick();
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || !gl.fenceSync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private triggerWasted(reasonKey: 'crash' | 'combat') {
    if (this.isRagdoll) return;
    this.isRagdoll = true;
    this.ragdollProgress = 0;
    this.ragdollSeed = Math.random() > 0.5 ? 1 : -1;
    this.deathReasonKey = reasonKey;
    this.health = 0;
    this.weaponWheelOpen = false;
    this.appearanceMenuOpen = false;
    this.lockpickMinigameOpen = false;
    this.lockpickCar = null;
    this.smashCar = null;
    this.activeCinematic = 'none';
    this.conversationActive = false;
    this.activeTalkNpcId = null;

    if (this.activeVehicle) {
      const car = this.activeVehicle;
      this.playerPos.set(
        car.position.x + Math.cos(car.yaw) * 1.6,
        this.getGroundHeightAt(car.position.x, car.position.z),
        car.position.z - Math.sin(car.yaw) * 1.6,
      );
      this.activeVehicle = null;
      this.assassin.root.visible = true;
    }

    this.phase = 'defeat';
    this.sound.playDeathWasted();
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    this.emitSnapshot();
  }

  private updateIntro(rawDt: number) {
    const car = this.vehicles[0];
    if (!car) {
      this.phase = 'briefing';
      this.emitSnapshot();
      return;
    }

    this.introTime += rawDt;
    const t = this.introTime;

    if (this.introCrashTime < 0) {
      car.speed = THREE.MathUtils.lerp(27, 34, Math.min(1, t / 4.2));
      car.position.z -= car.speed * rawDt;
      car.root.position.copy(car.position);
      car.root.rotation.y = car.yaw;
      for (const w of car.wheels) {
        w.rotation.x += (car.speed * rawDt) / 0.34;
      }
      car.steeringWheel.rotation.z = Math.sin(t * 2.5) * 0.08;
      this.playerPos.copy(car.position);
      this.updateDynamicLights();

      if (t < 2.2) {
        // Exterior speeding car chase/tracking shot
        car.driverHands.visible = false;
        const p = t / 2.2;
        if (t < 1.1) {
          this.camera.position.set(
            car.position.x - 4.2 + p * 3.0,
            1.45,
            car.position.z - 8.2,
          );
          this.camera.lookAt(car.position.x, 0.9, car.position.z);
        } else {
          const swing = (t - 1.1) / 1.1;
          this.camera.position.set(
            car.position.x + 2.8 - swing * 2.4,
            1.65 + swing * 0.35,
            car.position.z + 5.8 - swing * 0.6,
          );
          this.camera.lookAt(car.position.x, 1.0, car.position.z - 8);
        }
      } else {
        // Sudden cut to First-Person Driver Perspective!
        car.driverHands.visible = true;
        if (this.camera.fov !== 72) {
          this.camera.fov = 72;
          this.camera.updateProjectionMatrix();
        }
        // Driver eye inside left-seat (+X local -> -X world when yaw = Math.PI)
        this.camera.position.set(
          car.position.x - 0.35,
          car.position.y + 1.18,
          car.position.z - 0.02,
        );
        // Brief glance to side right after shifting POV, then lock eyes straight ahead toward the wall!
        const fpT = t - 2.2;
        const glanceOffset =
          fpT < 0.65 ? Math.sin((fpT / 0.65) * Math.PI) * 3.8 : 0;
        this.camera.lookAt(
          car.position.x - 0.35 + glanceOffset,
          car.position.y + 1.06 + Math.sin(t * 14) * 0.008,
          car.position.z - 28,
        );
      }

      if (car.position.z <= -111.7) {
        this.introCrashTime = t;
        this.introShake = 0.65;
        car.speed = 0;
        car.driverHands.visible = false;
        this.damageVehicleAt(car, 30, 'front');
        this.spawnBurst(
          new THREE.Vector3(car.position.x, 1.2, -113.5),
          0xfbbf24,
          36,
          6.0,
        );
      }
    } else {
      const postT = t - this.introCrashTime;
      this.introShake = Math.max(0, this.introShake - rawDt * 1.4);
      const sx = (Math.random() - 0.5) * this.introShake * 0.38;
      const sy = (Math.random() - 0.5) * this.introShake * 0.38;
      const pull = Math.min(1, postT / 1.15);

      if (this.camera.fov !== 60) {
        this.camera.fov = 60;
        this.camera.updateProjectionMatrix();
      }
      this.camera.position.set(
        car.position.x - 0.35 - pull * 2.4 + sx,
        car.position.y + 1.2 + pull * 1.3 + sy,
        car.position.z + pull * 5.8,
      );
      this.camera.lookAt(car.position.x, 1.05, -113.2);

      if (postT >= 1.15) {
        this.phase = 'briefing';
        this.emitSnapshot();
      }
    }
  }

  private update(rawDt: number) {
    // Slow-motion multiplier for 'G' Weapon Wheel, intro crash aftermath, or WASTED ragdoll
    const timeScale =
      this.phase === 'intro' && this.introCrashTime >= 0
        ? 0.32
        : this.isRagdoll
          ? 0.28
          : this.weaponWheelOpen
            ? 0.2
            : 1.0;
    const dt = rawDt * timeScale;
    this.totalTime += dt;
    this.updateWeather(rawDt);

    // Rain particles (only active & falling when rain/transition is visible)
    if (this.rainPoints.visible) {
      const fallSpeed = Math.max(8, this.currentRainSpeed);
      const rArr = this.rainPositions;
      for (let i = 0; i < rArr.length; i += 3) {
        rArr[i + 1] -= fallSpeed * dt;
        if (rArr[i + 1] < 0) {
          rArr[i] = this.playerPos.x + (Math.random() - 0.5) * 48;
          rArr[i + 1] = 18 + Math.random() * 5;
          rArr[i + 2] = this.playerPos.z + (Math.random() - 0.5) * 48;
        }
      }
      this.rainPoints.geometry.attributes.position.needsUpdate = true;
    }

    // Toppling Utility Poles animation
    for (const pole of this.utilityPoles) {
      if (pole.fallen && pole.fallAngle < Math.PI / 2 - 0.05) {
        pole.fallAngle = Math.min(Math.PI / 2 - 0.05, pole.fallAngle + dt * 3.8);
        pole.pivot.rotation.y = pole.fallYaw;
        pole.pivot.rotation.x = pole.fallAngle;
      }
    }

    // Debris (severed limbs & detached car parts)
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i];
      d.life -= dt;
      if (d.life <= 0) {
        this.scene.remove(d.mesh);
        this.debris.splice(i, 1);
        continue;
      }
      const floor = this.getGroundHeightAt(d.mesh.position.x, d.mesh.position.z);
      if (d.mesh.position.y > floor + 0.09) {
        d.velocity.y -= 15 * dt;
        d.mesh.position.addScaledVector(d.velocity, dt);
        d.mesh.rotation.x += d.angVel.x * dt;
        d.mesh.rotation.z += d.angVel.z * dt;
        if (d.mesh.position.y <= floor + 0.09) {
          d.mesh.position.y = floor + 0.09;
          d.velocity.multiplyScalar(0.25);
          d.velocity.y = 0;
          d.angVel.set(0, 0, 0);
        }
      }
    }

    // Particle Bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.scene.remove(b.points);
        b.points.geometry.dispose();
        (b.points.material as THREE.Material).dispose();
        this.bursts.splice(i, 1);
        continue;
      }
      const posAttr = b.points.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let j = 0; j < arr.length; j += 3) {
        b.velocities[j + 1] -= 9.8 * dt;
        arr[j] += b.velocities[j] * dt;
        arr[j + 1] = Math.max(0.04, arr[j + 1] + b.velocities[j + 1] * dt);
        arr[j + 2] += b.velocities[j + 2] * dt;
      }
      posAttr.needsUpdate = true;
      (b.points.material as THREE.PointsMaterial).opacity = b.life / b.maxLife;
    }

    // Ragdoll state during WASTED screen (keep cloth anti-clipping physics active!)
    if (this.isRagdoll) {
      this.ragdollProgress = Math.min(1, this.ragdollProgress + rawDt * 1.4);
      applyRagdollPose(this.assassin, this.ragdollProgress, this.ragdollSeed);
      updateClothPhysics(
        this.assassin,
        0,
        0.22 * this.ragdollProgress,
        -0.18 * this.ragdollProgress,
        false,
        rawDt,
        0,
        0,
        true,
      );
      this.assassin.root.position.copy(this.playerPos);
      this.camYaw += rawDt * 0.25;
      this.updateCamera(rawDt);
      return;
    }

    if (this.phase === 'intro') {
      this.updateIntro(rawDt);
      return;
    }

    if (this.phase === 'briefing') {
      // Hover camera dramatically over the crashed intro wreckage behind the title card
      const car = this.vehicles[0];
      if (car && this.introCrashTime >= 0) {
        this.camera.position.set(
          car.position.x - 2.6 + Math.sin(this.totalTime * 0.3) * 0.6,
          car.position.y + 2.4,
          car.position.z + 5.8,
        );
        this.camera.lookAt(car.position.x, 1.0, -113.2);
      } else {
        this.updateCamera(rawDt);
      }
      return;
    }

    if (this.phase !== 'playing') {
      this.updateCamera(rawDt);
      return;
    }

    this.elapsedSeconds += dt;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.kunaiCooldown = Math.max(0, this.kunaiCooldown - dt);
    this.attackAnim = Math.max(0, this.attackAnim - dt * 3.4);

    if (this.activeCinematic === 'boutique_greet') {
      this.updateBoutiqueCinematic(rawDt);
      this.updateDynamicLights();
      this.sound.updateSpatialVoices(this.playerPos, this.camYaw, (npcId) => {
        if (npcId.startsWith('car_')) {
          return this.vehicles.find((v) => v.id === npcId)?.position ?? null;
        }
        const found = this.npcs.find((n) => n.id === npcId);
        return found ? found.position : null;
      });
      this.snapshotTimer += rawDt;
      if (this.snapshotTimer >= 0.08) {
        this.snapshotTimer = 0;
        this.emitSnapshot();
      }
      return;
    }

    if (this.activeCinematic === 'silence_kill') {
      this.updateSilenceCinematic(rawDt);
      this.updateDynamicLights();
      this.sound.updateSpatialVoices(this.playerPos, this.camYaw, (npcId) => {
        if (npcId.startsWith('car_')) {
          return this.vehicles.find((v) => v.id === npcId)?.position ?? null;
        }
        const found = this.npcs.find((n) => n.id === npcId);
        return found ? found.position : null;
      });
      this.snapshotTimer += rawDt;
      if (this.snapshotTimer >= 0.08) {
        this.snapshotTimer = 0;
        this.emitSnapshot();
      }
      return;
    }

    if (this.activeCinematic === 'smash_car_window') {
      this.updateSmashWindowCinematic(rawDt);
      this.updateDynamicLights();
      this.sound.updateSpatialVoices(this.playerPos, this.camYaw, (npcId) => {
        if (npcId.startsWith('car_') || npcId === 'police_cruiser') {
          return this.vehicles.find((v) => v.id === npcId)?.position ?? null;
        }
        const found = this.npcs.find((n) => n.id === npcId);
        return found ? found.position : null;
      });
      this.snapshotTimer += rawDt;
      if (this.snapshotTimer >= 0.08) {
        this.snapshotTimer = 0;
        this.emitSnapshot();
      }
      return;
    }

    if (this.activeCinematic === 'hotel_checkin') {
      this.updateHotelCheckinCinematic(rawDt);
      this.updateDynamicLights();
      this.sound.updateSpatialVoices(this.playerPos, this.camYaw, (npcId) => {
        if (npcId.startsWith('car_') || npcId === 'police_cruiser') {
          return this.vehicles.find((v) => v.id === npcId)?.position ?? null;
        }
        const found = this.npcs.find((n) => n.id === npcId);
        return found ? found.position : null;
      });
      this.snapshotTimer += rawDt;
      if (this.snapshotTimer >= 0.08) {
        this.snapshotTimer = 0;
        this.emitSnapshot();
      }
      return;
    }

    // Check Hotel Vex Lobby front-desk auto check-in cinematic on first visit
    if (
      !this.hotelCheckinDone &&
      !this.activeVehicle &&
      this.playerPos.distanceTo(this.hotelVex.deskPos) < 3.6
    ) {
      this.startHotelCheckinCinematic();
      return;
    }

    // Check Atelier Vex Boutique entry (greeting cinematic + appearance option) and exit (WANTED posters!)
    const insideBoutique =
      !this.activeVehicle &&
      this.playerPos.x >= -31.4 &&
      this.playerPos.x <= -16.6 &&
      this.playerPos.z >= 65.6 &&
      this.playerPos.z <= 78.4;

    if (insideBoutique && !this.boutiqueGreetingDone) {
      this.activeCinematic = 'boutique_greet';
      this.cinematicTimer = 0;
      this.boutiqueStylistGreeted = false;
      this.crouchToggled = false;
      this.keys.clear();
      this.weaponWheelOpen = false;
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      this.sound.speak('assassin_greet', { force: true });
      this.emitSnapshot();
      return;
    }

    if (this.boutiqueGreetingDone && !insideBoutique && !this.postersTriggered) {
      this.triggerCityWantedPosters();
    }
    this.wasInsideBoutique = insideBoutique;

    this.updateRegeneration(dt);
    this.updateTrafficVehicles(dt);
    if (this.activeVehicle) {
      this.updateVehicleDriving(dt);
    } else {
      this.updatePlayer(dt);
    }
    this.updateProjectiles(dt);
    this.updatePoliceResponse(dt);
    this.updateNpcs(dt);
    this.updateDynamicLights();

    this.sound.updateSpatialVoices(this.playerPos, this.camYaw, (npcId) => {
      if (npcId.startsWith('car_')) {
        return this.vehicles.find((v) => v.id === npcId)?.position ?? null;
      }
      const found = this.npcs.find((n) => n.id === npcId);
      return found ? found.position : null;
    });

    this.updateCamera(rawDt);
    this.keyLight.position.set(
      this.playerPos.x + 24,
      38,
      this.playerPos.z + 20,
    );
    this.keyLight.target.position.copy(this.playerPos);

    this.snapshotTimer += rawDt;
    if (this.snapshotTimer >= 0.08) {
      this.snapshotTimer = 0;
      this.emitSnapshot();
    }
  }

  private triggerCityWantedPosters() {
    this.postersTriggered = true;
    const workers = this.npcs.filter(
      (n) =>
        n.alertState !== 'eliminated' &&
        (n.isPosterWorker || (n.role === 'civilian' && !n.isBoutiqueResident)),
    );
    this.wantedPosters.forEach((slot, idx) => {
      const worker = workers[idx % Math.max(1, workers.length)];
      if (worker && !worker.targetPosterId) {
        worker.targetPosterId = slot.id;
        worker.posterHangTimer = 0;
        worker.rig.posterMesh.visible = true;
      }
    });
  }

  private updateBoutiqueCinematic(rawDt: number) {
    this.cinematicTimer += rawDt;
    const t = this.cinematicTimer;

    // Walk Assassin smoothly into center of Atelier Vex & wave hello
    const targetPos = _v1.set(-23.6, 0.14, 70.6);
    const toTarget = _v2.subVectors(targetPos, this.playerPos);
    toTarget.y = 0;
    const dist = toTarget.length();
    if (dist > 0.12) {
      toTarget.normalize();
      this.playerPos.addScaledVector(toTarget, Math.min(dist, 3.6 * rawDt));
      this.walkPhase += rawDt * 8;
    } else {
      this.walkPhase = THREE.MathUtils.damp(this.walkPhase, 0, 8, rawDt);
    }
    this.playerPos.y = this.getGroundHeightAt(this.playerPos.x, this.playerPos.z);

    const greetYaw = Math.atan2(-21.2 - this.playerPos.x, 74.2 - this.playerPos.z);
    this.playerYaw = this.dampAngle(this.playerYaw, greetYaw, 8, rawDt);
    this.assassin.root.position.copy(this.playerPos);
    this.assassin.root.rotation.y = this.playerYaw;

    const stride = dist > 0.12 ? Math.sin(this.walkPhase) * 0.45 : 0;
    this.assassin.limbs.leftLeg.pivot.rotation.x = stride;
    this.assassin.limbs.rightLeg.pivot.rotation.x = -stride;
    this.assassin.limbs.leftArm.pivot.rotation.x = -stride * 0.4;
    this.assassin.limbs.rightArm.pivot.rotation.x =
      -2.15 + Math.sin(t * 8.5) * 0.28;
    this.assassin.limbs.rightArm.pivot.rotation.z = -0.32;

    updateClothPhysics(
      this.assassin,
      dist > 0.12 ? 3.2 : 0,
      stride,
      -stride,
      false,
      rawDt,
      0,
      0,
      false,
    );

    // Boutique stylist & patrons face assassin and wave back
    this.npcs.forEach((npc, idx) => {
      if (!npc.isBoutiqueResident || npc.alertState === 'eliminated') return;
      _v3.subVectors(this.playerPos, npc.position).setY(0);
      if (_v3.lengthSq() > 0.01) {
        npc.yaw = this.dampAngle(
          npc.yaw,
          Math.atan2(_v3.x, _v3.z),
          8,
          rawDt,
        );
      }
      npc.rig.root.rotation.y = npc.yaw;
      npc.rig.leftLeg.rotation.x = 0;
      npc.rig.rightLeg.rotation.x = 0;
      npc.rig.leftArm.rotation.x = 0;
      npc.rig.rightArm.rotation.x = -1.95 + Math.sin(t * 7.5 + idx) * 0.25;
    });

    if (t >= 1.25 && !this.boutiqueStylistGreeted) {
      this.boutiqueStylistGreeted = true;
      const stylist = this.npcs.find((n) => n.id === 'boutique_stylist');
      if (stylist) {
        this.speakNpc(stylist, 'clerk_boutique');
      } else {
        this.sound.speak('clerk_boutique', { force: true });
      }
    }

    // Sweeping Atelier Vex interior cinematic shot
    const sweep = Math.min(1, t / 3.2);
    this.camera.fov = 54;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(
      THREE.MathUtils.lerp(-27.2, -21.2, sweep),
      THREE.MathUtils.lerp(2.15, 1.85, sweep),
      THREE.MathUtils.lerp(67.2, 68.4, sweep),
    );
    this.camera.lookAt(-23.0, 1.45, 72.4);

    if (t >= 3.25) {
      this.activeCinematic = 'none';
      this.boutiqueGreetingDone = true;
      this.assassin.limbs.rightArm.pivot.rotation.set(0, 0, 0);
      this.camera.fov = 58;
      this.camera.updateProjectionMatrix();
      this.toggleAppearanceMenu(true);
    }
  }

  private updateSilenceCinematic(rawDt: number) {
    this.cinematicTimer += rawDt;
    const t = this.cinematicTimer;
    const npc = this.silenceNpc;
    const dump = this.silenceDumpster;

    if (!npc) {
      this.activeCinematic = 'none';
      setAssassinWeaponVisual(this.assassin, this.equippedWeapon);
      return;
    }

    if (t < 1.15) {
      // Phase 1: Grab from behind, clamp left hand over victim's mouth, draw suppressed pistol
      const faceYaw = npc.yaw;
      const fwdX = Math.sin(faceYaw);
      const fwdZ = Math.cos(faceYaw);
      const behindGoal = _v1.set(
        this.silenceStartPos.x - fwdX * 0.44,
        this.silenceStartPos.y,
        this.silenceStartPos.z - fwdZ * 0.44,
      );
      this.playerPos.lerp(behindGoal, Math.min(1, rawDt * 12));
      this.playerYaw = this.dampAngle(this.playerYaw, faceYaw, 14, rawDt);

      this.assassin.root.position.copy(this.playerPos);
      this.assassin.root.rotation.y = this.playerYaw;
      this.assassin.limbs.leftArm.pivot.rotation.set(-1.72, 0, 0.56);
      this.assassin.limbs.rightArm.pivot.rotation.set(-1.35, 0, -0.15);
      this.assassin.limbs.leftLeg.pivot.rotation.x = 0.14;
      this.assassin.limbs.rightLeg.pivot.rotation.x = -0.18;

      npc.rig.root.position.copy(this.silenceStartPos);
      npc.rig.head.rotation.y = Math.sin(t * 24) * 0.16;
      npc.rig.leftArm.rotation.x = -1.15 + Math.sin(t * 16) * 0.2;
      npc.rig.rightArm.rotation.x = -1.15 - Math.sin(t * 16) * 0.2;

      this.camera.fov = 46;
      this.camera.updateProjectionMatrix();
      const sideX = Math.cos(faceYaw);
      const sideZ = -Math.sin(faceYaw);
      this.camera.position.set(
        this.silenceStartPos.x + sideX * 2.1 + fwdX * 1.1,
        this.silenceStartPos.y + 1.62,
        this.silenceStartPos.z + sideZ * 2.1 + fwdZ * 1.1,
      );
      this.camera.lookAt(
        this.silenceStartPos.x,
        this.silenceStartPos.y + 1.38,
        this.silenceStartPos.z,
      );
    } else if (t < 1.85) {
      // Phase 2: Suppressed shot & slump
      if (!this.silenceShotFired) {
        this.silenceShotFired = true;
        this.sound.playPistolShot(0);
        this.spawnBurst(
          this.silenceStartPos.clone().add(new THREE.Vector3(0, 1.48, 0)),
          0xb91c1c,
          24,
          3.4,
        );
      }
      const slump = (t - 1.15) / 0.7;
      applyNpcRagdollPose(npc.rig, slump * 0.85, 1, -1);
      this.assassin.limbs.leftArm.pivot.rotation.set(-0.4, 0, 0);
      this.assassin.limbs.rightArm.pivot.rotation.set(
        -1.35 + Math.max(0, 0.25 - slump) * 0.6,
        0,
        0,
      );
    } else if (t < 3.65) {
      // Phase 3: Carry / drag body to nearest dumpster & lift lid
      const moveT = (t - 1.85) / 1.8;
      this.playerPos.lerpVectors(
        this.silenceStartPos,
        this.silenceDumpStandPos,
        moveT,
      );
      this.playerPos.y = this.getGroundHeightAt(this.playerPos.x, this.playerPos.z);
      _v1.subVectors(this.silenceDumpStandPos, this.silenceStartPos).setY(0);
      if (_v1.lengthSq() > 0.02) {
        this.playerYaw = this.dampAngle(
          this.playerYaw,
          Math.atan2(_v1.x, _v1.z),
          10,
          rawDt,
        );
      }
      this.assassin.root.position.copy(this.playerPos);
      this.assassin.root.rotation.y = this.playerYaw;
      this.walkPhase += rawDt * 8.5;
      const stride = Math.sin(this.walkPhase) * 0.45;
      this.assassin.limbs.leftLeg.pivot.rotation.x = stride;
      this.assassin.limbs.rightLeg.pivot.rotation.x = -stride;
      this.assassin.limbs.leftArm.pivot.rotation.set(-0.95, 0, 0.1);
      this.assassin.limbs.rightArm.pivot.rotation.set(-0.95, 0, -0.1);

      npc.position.set(
        this.playerPos.x - Math.sin(this.playerYaw) * 0.48,
        this.playerPos.y,
        this.playerPos.z - Math.cos(this.playerYaw) * 0.48,
      );
      npc.rig.root.position.copy(npc.position);
      applyNpcRagdollPose(npc.rig, 0.9, 1, -1);

      if (dump && t >= 3.05) {
        const lidOpen = Math.min(1, (t - 3.05) / 0.45);
        dump.lidPivot.rotation.x = THREE.MathUtils.lerp(
          0,
          -Math.PI * 0.68,
          lidOpen,
        );
      }

      this.camera.fov = 54;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(
        this.playerPos.x + 3.2,
        this.playerPos.y + 2.1,
        this.playerPos.z + 3.4,
      );
      this.camera.lookAt(
        this.playerPos.x,
        this.playerPos.y + 1.1,
        this.playerPos.z,
      );
    } else {
      // Phase 4: Deposit body inside dumpster & slam lid shut
      if (!this.silenceDumped) {
        this.silenceDumped = true;
        npc.rig.root.visible = false;
        npc.disposed = true;
        this.sound.playDumpsterThud();
        if (dump) {
          this.spawnBurst(
            dump.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
            0x64748b,
            14,
            2.4,
          );
        }
      }
      if (dump && t >= 3.95) {
        const closeT = Math.min(1, (t - 3.95) / 0.28);
        dump.lidPivot.rotation.x = THREE.MathUtils.lerp(
          -Math.PI * 0.68,
          0,
          closeT,
        );
      }
      if (t >= 4.2 && !this.silenceLidClosed) {
        this.silenceLidClosed = true;
        this.sound.playMetalCrash(0.45);
      }

      if (t >= 4.5) {
        if (dump) dump.lidPivot.rotation.x = 0;
        this.activeCinematic = 'none';
        const victimWasTarget = npc.role === 'target';
        this.silenceNpc = null;
        this.silenceDumpster = null;
        setAssassinWeaponVisual(this.assassin, this.equippedWeapon);
        this.assassin.limbs.leftArm.pivot.rotation.set(0, 0, 0);
        this.assassin.limbs.rightArm.pivot.rotation.set(0, 0, 0);
        this.camera.fov = 58;
        this.camera.updateProjectionMatrix();

        const targetsAlive = this.npcs.filter(
          (n) => n.role === 'target' && n.alertState !== 'eliminated',
        ).length;
        if (victimWasTarget && targetsAlive === 0) {
          this.phase = 'victory';
          this.sound.speak('assassin_victory', { force: true });
        } else {
          this.sound.speak('assassin_kill_2');
          this.requestPointerLock();
        }
        this.emitSnapshot();
      }
    }

    updateClothPhysics(
      this.assassin,
      t >= 1.85 && t < 3.65 ? 3.5 : 0,
      this.assassin.limbs.leftLeg.pivot.rotation.x,
      this.assassin.limbs.rightLeg.pivot.rotation.x,
      false,
      rawDt,
      0,
      0,
      false,
    );
  }

  private updateSmashWindowCinematic(rawDt: number) {
    this.cinematicTimer += rawDt;
    const t = this.cinematicTimer;
    const car = this.smashCar;
    if (!car) {
      this.activeCinematic = 'none';
      return;
    }

    const sideX = Math.cos(car.yaw);
    const sideZ = -Math.sin(car.yaw);
    const standPos = _v1.set(
      car.position.x + sideX * 1.48,
      this.getGroundHeightAt(
        car.position.x + sideX * 1.48,
        car.position.z + sideZ * 1.48,
      ),
      car.position.z + sideZ * 1.48,
    );
    this.playerPos.lerp(standPos, Math.min(1, rawDt * 12));
    this.playerYaw = this.dampAngle(
      this.playerYaw,
      car.yaw - Math.PI / 2,
      14,
      rawDt,
    );
    this.assassin.root.position.copy(this.playerPos);
    this.assassin.root.rotation.y = this.playerYaw;
    this.assassin.limbs.leftLeg.pivot.rotation.x = 0.08;
    this.assassin.limbs.rightLeg.pivot.rotation.x = -0.1;

    if (t < 0.65) {
      // Wind up and smash driver side window with right elbow/forearm
      if (t < 0.28) {
        const p = t / 0.28;
        this.assassin.limbs.rightArm.pivot.rotation.set(-0.35 + p * 0.75, 0, -0.45);
        this.assassin.limbs.leftArm.pivot.rotation.set(-0.3, 0, 0.2);
      } else {
        const p = Math.min(1, (t - 0.28) / 0.22);
        this.assassin.limbs.rightArm.pivot.rotation.set(
          0.4 - p * 2.05,
          0,
          -0.15,
        );
        this.assassin.limbs.leftArm.pivot.rotation.set(-0.45, 0, 0.15);
      }
      this.assassin.torsoPivot.rotation.x = 0.18;

      if (t >= 0.42 && !this.smashWindowBroken) {
        this.smashWindowBroken = true;
        car.sideWindowsBroken = true;
        car.sideWindows.visible = false;
        const winPos = new THREE.Vector3(
          car.position.x + sideX * 0.88,
          car.position.y + 1.18,
          car.position.z + sideZ * 0.88,
        );
        this.sound.playGlassShatter();
        this.sound.playCarAlarm();
        this.spawnBurst(winPos, 0xbae6fd, 28, 4.4);
        this.spawnBurst(winPos, 0xb91c1c, 16, 3.2);

        this.applyLimbTrauma('rightArm', 'fractured');
        if (this.health > 16) {
          this.health = Math.max(8, this.health - 14);
        } else {
          this.onPlayerHit(14);
        }

        // Breaking the window draws immediate attention and alerts nearby NPCs
        let sawBreakIn = false;
        for (const npc of this.npcs) {
          if (npc.alertState === 'eliminated') continue;
          const dist = npc.position.distanceTo(car.position);
          if (dist > 30) continue;
          if (dist < 22) sawBreakIn = true;
          if (npc.role === 'civilian') {
            npc.alertState = 'fleeing';
            npc.alertTimer = 14;
            if (dist < 20) this.speakNpc(npc, 'civ_panic_1');
          } else if (npc.role === 'clerk') {
            npc.alertState =
              npc.storeClerkArchetype === 'threaten' ? 'threaten' : 'cowering';
            if (npc.storeClerkArchetype === 'threaten') {
              npc.rig.weaponGroup.visible = true;
            }
          } else {
            npc.alertState = dist < 14 ? 'combat' : 'suspicious';
            npc.lastKnownPlayerPos = car.position.clone();
            npc.alertTimer = 14;
            if (dist < 22) this.speakNpc(npc, 'guard_suspicious');
          }
        }
        if (sawBreakIn) {
          this.wantedLevel = Math.min(3, this.wantedLevel + 1);
        }
      }
    } else if (t < 1.75) {
      // Clutch injured right arm in pain while hunched next to door
      const pulse = Math.sin(t * 14) * 0.06;
      this.assassin.torsoPivot.rotation.x = 0.28 + pulse;
      this.assassin.headPivot.rotation.x = 0.22;
      this.assassin.limbs.rightArm.pivot.rotation.set(-0.92 + pulse, 0, 0.45);
      this.assassin.limbs.leftArm.pivot.rotation.set(-1.32 - pulse, 0, -0.62);
      if (t >= 0.72 && !this.smashPainCried) {
        this.smashPainCried = true;
        this.sound.speak('assassin_window_pain', { force: true });
      }
    } else {
      // Reach in, unlock from inside, and get into driver's seat
      const p = Math.min(1, (t - 1.75) / 0.55);
      this.assassin.torsoPivot.rotation.x = THREE.MathUtils.lerp(0.28, 0.1, p);
      this.assassin.headPivot.rotation.x = THREE.MathUtils.lerp(0.22, 0, p);
      this.assassin.limbs.leftArm.pivot.rotation.set(-0.85 * (1 - p), 0, -0.2);
      this.assassin.limbs.rightArm.pivot.rotation.set(-0.75 * (1 - p), 0, 0.15);

      if (t >= 2.28) {
        car.locked = false;
        car.lockLedMat.color.setHex(0x10b981);
        this.activeCinematic = 'none';
        this.smashCar = null;
        this.assassin.torsoPivot.rotation.set(0, 0, 0);
        this.assassin.headPivot.rotation.set(0, 0, 0);
        this.assassin.limbs.leftArm.pivot.rotation.set(0, 0, 0);
        this.assassin.limbs.rightArm.pivot.rotation.set(0, 0, 0);
        this.camera.fov = 58;
        this.camera.updateProjectionMatrix();
        this.enterVehicle(car);
        return;
      }
    }

    // Tight dramatic over-the-shoulder angle focused on broken window & injured arm
    const fwdX = Math.sin(car.yaw);
    const fwdZ = Math.cos(car.yaw);
    this.camera.fov = 50;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(
      car.position.x + sideX * 3.15 + fwdX * 1.45,
      car.position.y + 1.68,
      car.position.z + sideZ * 3.15 + fwdZ * 1.45,
    );
    this.camera.lookAt(
      this.playerPos.x - sideX * 0.25,
      this.playerPos.y + 1.18,
      this.playerPos.z - sideZ * 0.25,
    );

    updateClothPhysics(
      this.assassin,
      0,
      this.assassin.limbs.leftLeg.pivot.rotation.x,
      this.assassin.limbs.rightLeg.pivot.rotation.x,
      false,
      rawDt,
      0,
      0,
      false,
    );
  }

  private updateHotelCheckinCinematic(rawDt: number) {
    this.cinematicTimer += rawDt;
    const t = this.cinematicTimer;

    const standTarget = _v1.set(-26, 0.14, -74.6);
    const toTarget = _v2.subVectors(standTarget, this.playerPos);
    toTarget.y = 0;
    const dist = toTarget.length();
    if (dist > 0.12) {
      toTarget.normalize();
      this.playerPos.addScaledVector(toTarget, Math.min(dist, 3.2 * rawDt));
      this.walkPhase += rawDt * 8;
    } else {
      this.walkPhase = THREE.MathUtils.damp(this.walkPhase, 0, 8, rawDt);
    }
    this.playerPos.y = this.getGroundHeightAt(this.playerPos.x, this.playerPos.z);

    this.playerYaw = this.dampAngle(this.playerYaw, Math.PI, 8, rawDt);
    this.assassin.root.position.copy(this.playerPos);
    this.assassin.root.rotation.y = this.playerYaw;

    const stride = dist > 0.12 ? Math.sin(this.walkPhase) * 0.42 : 0;
    this.assassin.limbs.leftLeg.pivot.rotation.x = stride;
    this.assassin.limbs.rightLeg.pivot.rotation.x = -stride;
    this.assassin.limbs.leftArm.pivot.rotation.x = -stride * 0.4;
    this.assassin.limbs.rightArm.pivot.rotation.x = stride * 0.4;

    updateClothPhysics(
      this.assassin,
      dist > 0.12 ? 3.0 : 0,
      stride,
      -stride,
      false,
      rawDt,
      0,
      0,
      false,
    );

    const concierge = this.npcs.find((n) => n.id === 'hotel_concierge');
    if (concierge && concierge.alertState !== 'eliminated') {
      concierge.yaw = this.dampAngle(concierge.yaw, 0, 8, rawDt);
      concierge.rig.root.rotation.y = concierge.yaw;
      concierge.rig.rightArm.rotation.x = -0.35 + Math.sin(t * 5) * 0.12;
    }

    if (t >= 1.15 && !this.hotelGreetingSpoken) {
      this.hotelGreetingSpoken = true;
      this.sound.speak('assassin_hotel_reply', { force: true });
    }

    const sweep = Math.min(1, t / 2.4);
    this.camera.fov = 54;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(
      THREE.MathUtils.lerp(-29.2, -22.6, sweep),
      THREE.MathUtils.lerp(2.25, 1.92, sweep),
      THREE.MathUtils.lerp(-71.8, -73.0, sweep),
    );
    this.camera.lookAt(-26, 1.4, -77.6);

    if (t >= 2.45) {
      this.activeCinematic = 'none';
      this.hotelCheckinDone = true;
      this.hotelRoomMenuOpen = true;
      this.camera.fov = 58;
      this.camera.updateProjectionMatrix();
      this.emitSnapshot();
    }
  }

  private spawnDynamicStreetNpc(
    id: string,
    name: string,
    role: NpcRole,
    pos: THREE.Vector3,
    yaw: number,
    opts?: {
      fightTargetId?: string | null;
      isPoliceOfficer?: boolean;
      isPlayerFighter?: boolean;
      health?: number;
    },
  ): NpcEntity {
    const rig = createNpcRig(role, this.textures, Math.floor(Math.random() * 12));
    rig.root.position.copy(pos);
    rig.root.rotation.y = yaw;
    this.scene.add(rig.root);

    const npc: NpcEntity = {
      id,
      name,
      role,
      voiceName: role === 'police' ? 'Charon' : 'Puck',
      isIndoorStore: false,
      isBoutiqueResident: false,
      isPosterWorker: false,
      rig,
      position: pos.clone(),
      yaw,
      health: opts?.health ?? (role === 'police' ? 110 : 65),
      maxHealth: opts?.health ?? (role === 'police' ? 110 : 65),
      alertState: opts?.fightTargetId ? 'fighting' : 'patrol',
      alertTimer: 16,
      attackCooldown: 0.9,
      muzzleTimer: 0,
      waypoints: [pos.clone()],
      waypointIndex: 0,
      lastKnownPlayerPos: null,
      speechCooldown: 2,
      walkPhase: 0,
      deathTimer: 0,
      ragdollSeed: Math.random() > 0.5 ? 1 : -1,
      ragdollFallDir: -1,
      ragdollVel: new THREE.Vector3(),
      suspicion: 0,
      callTimer: 0,
      targetPosterId: null,
      posterHangTimer: 0,
      fightTargetId: opts?.fightTargetId ?? null,
      fightTimer: 0,
      punchCooldown: 0.4 + Math.random() * 0.4,
      isDynamicSpawn: true,
      isPoliceOfficer: Boolean(opts?.isPoliceOfficer),
      isPlayerFighter: Boolean(opts?.isPlayerFighter),
      disposed: false,
    };
    this.npcs.push(npc);
    return npc;
  }

  private triggerCarBrawl(
    carA: DriveableVehicleSpec,
    carB: DriveableVehicleSpec | null,
    vsPlayer: boolean,
  ) {
    carA.crashCooldown = 14;
    carA.isNpcTraffic = false;
    carA.speed = 0;
    carA.driverModel.visible = false;
    this.damageVehicleAt(carA, 7.5, 'front');

    const exitAx = carA.position.x + Math.cos(carA.yaw) * 1.65;
    const exitAz = carA.position.z - Math.sin(carA.yaw) * 1.65;
    const posA = new THREE.Vector3(exitAx, this.getGroundHeightAt(exitAx, exitAz), exitAz);
    const stamp = Math.floor(performance.now());
    const idA = `brawler_a_${stamp}`;

    if (!vsPlayer && carB) {
      carB.crashCooldown = 14;
      carB.isNpcTraffic = false;
      carB.speed = 0;
      carB.driverModel.visible = false;
      this.damageVehicleAt(carB, 7.5, 'front');

      const exitBx = carB.position.x + Math.cos(carB.yaw) * 1.65;
      const exitBz = carB.position.z - Math.sin(carB.yaw) * 1.65;
      const posB = new THREE.Vector3(exitBx, this.getGroundHeightAt(exitBx, exitBz), exitBz);
      const idB = `brawler_b_${stamp}`;

      const yawA = Math.atan2(posB.x - posA.x, posB.z - posA.z);
      const yawB = Math.atan2(posA.x - posB.x, posA.z - posB.z);
      const npcA = this.spawnDynamicStreetNpc(idA, 'Motorist A', 'civilian', posA, yawA, {
        fightTargetId: idB,
      });
      const npcB = this.spawnDynamicStreetNpc(idB, 'Motorist B', 'civilian', posB, yawB, {
        fightTargetId: idA,
      });
      this.sound.playCensorBleep();
      this.speakNpc(npcA, 'driver_fight_1');
      this.speakNpc(npcB, 'driver_fight_2');
    } else {
      // Player vehicle collision: angry driver exits to fight (plus passenger/nearby driver if another car is close!)
      const yawA = Math.atan2(this.playerPos.x - posA.x, this.playerPos.z - posA.z);
      const nearbyOtherNpc = this.npcs.find(
        (n) =>
          n.alertState !== 'eliminated' &&
          !n.isPoliceOfficer &&
          (n.role === 'civilian' || n.role === 'guard') &&
          n.position.distanceTo(posA) < 12,
      );
      if (nearbyOtherNpc && Math.random() < 0.45) {
        const npcA = this.spawnDynamicStreetNpc(idA, 'Furious Driver', 'civilian', posA, yawA, {
          fightTargetId: nearbyOtherNpc.id,
        });
        nearbyOtherNpc.alertState = 'fighting';
        nearbyOtherNpc.fightTargetId = idA;
        nearbyOtherNpc.punchCooldown = 0.6;
        this.sound.playCensorBleep();
        this.speakNpc(npcA, 'driver_fight_1');
      } else {
        const npcA = this.spawnDynamicStreetNpc(idA, 'Furious Driver', 'civilian', posA, yawA, {
          fightTargetId: 'player',
          isPlayerFighter: true,
        });
        this.sound.playCensorBleep();
        this.speakNpc(npcA, 'driver_fight_1');
      }
    }
  }

  private updateTrafficVehicles(dt: number) {
    const swerveLines = ['driver_swerve_1', 'driver_swerve_2'];

    for (const car of this.vehicles) {
      if (car === this.activeVehicle || !car.isNpcTraffic) continue;
      if (car.trafficWaypoints.length === 0) continue;

      car.hornCooldown = Math.max(0, car.hornCooldown - dt);
      car.crashCooldown = Math.max(0, car.crashCooldown - dt);
      car.swerveTimer = Math.max(0, car.swerveTimer - dt);

      const wp = car.trafficWaypoints[car.trafficWpIndex];
      const toWpX = wp.x - car.position.x;
      const toWpZ = wp.z - car.position.z;
      const distToWp = Math.hypot(toWpX, toWpZ);
      if (distToWp < 2.6) {
        car.trafficWpIndex =
          (car.trafficWpIndex + 1) % car.trafficWaypoints.length;
      } else if (distToWp > 0.1 && car.swerveTimer <= 0) {
        const desiredYaw = Math.atan2(toWpX, toWpZ);
        car.yaw = this.dampAngle(car.yaw, desiredYaw, 4.2, dt);
      }

      if (car.swerveTimer > 0) {
        car.yaw += car.swerveDir * 1.45 * dt;
      }

      const fwdX = Math.sin(car.yaw);
      const fwdZ = Math.cos(car.yaw);
      const rightX = Math.cos(car.yaw);
      const rightZ = -Math.sin(car.yaw);

      let blockedByPlayer = false;
      if (!this.activeVehicle && !this.isRagdoll) {
        const dx = this.playerPos.x - car.position.x;
        const dz = this.playerPos.z - car.position.z;
        const fwdDist = dx * fwdX + dz * fwdZ;
        const latDist = dx * rightX + dz * rightZ;

        if (fwdDist > 1.5 && fwdDist < 8.8 && Math.abs(latDist) < 2.05) {
          blockedByPlayer = true;
          if (car.hornCooldown <= 0) {
            car.hornCooldown = 2.8;
            this.sound.playCarHorn();
            this.sound.playCensorBleep();
            const camRightX = Math.cos(this.camYaw);
            const camRightZ = -Math.sin(this.camYaw);
            const dist = Math.hypot(dx, dz);
            const pan =
              dist > 0.05
                ? THREE.MathUtils.clamp(
                    ((-dx * camRightX - dz * camRightZ) / dist),
                    -0.88,
                    0.88,
                  )
                : 0;
            const curseLines = ['driver_curse_1', 'driver_curse_2', 'driver_curse_3'];
            const line =
              curseLines[Math.floor(Math.random() * curseLines.length)];
            this.sound.speak(line, { npcId: car.id, distance: dist, pan });
          }
        } else if (
          fwdDist > -1.9 &&
          fwdDist < 2.15 &&
          Math.abs(latDist) < 1.05 &&
          Math.abs(car.speed) > 4.2
        ) {
          car.speed = 0;
          this.onPlayerHit(10);
        }
      }

      // Check near-collision with other vehicles (including Player's activeVehicle!)
      let blockedByVehicleOrNpc = false;
      for (const other of this.vehicles) {
        if (other === car) continue;
        const dx = other.position.x - car.position.x;
        const dz = other.position.z - car.position.z;
        const dist = Math.hypot(dx, dz);
        const fwdDist = dx * fwdX + dz * fwdZ;
        const latDist = dx * rightX + dz * rightZ;

        const isActiveClose = other === this.activeVehicle || other.isNpcTraffic;
        if (
          isActiveClose &&
          car.crashCooldown <= 0 &&
          fwdDist > 2.2 &&
          fwdDist < 10.5 &&
          Math.abs(latDist) < 2.65
        ) {
          if (car.hornCooldown <= 0) {
            car.hornCooldown = 3.0;
            this.sound.playCarHorn();
            this.sound.playCensorBleep();
            const playerD = car.position.distanceTo(this.playerPos);
            if (playerD < 46) {
              const line = swerveLines[Math.floor(Math.random() * swerveLines.length)];
              this.sound.speak(line, { npcId: car.id, distance: playerD, pan: 0 });
            }
          }
          if (car.swerveTimer <= 0 && fwdDist > 4.8 && Math.random() < 0.55) {
            car.swerveTimer = 0.85;
            car.swerveDir = latDist >= 0 ? -1 : 1;
          } else if (dist < 4.5 && other.isNpcTraffic) {
            this.triggerCarBrawl(car, other, false);
            break;
          }
        }

        if (fwdDist > 0 && fwdDist < 6.4 && Math.abs(latDist) < 2.1 && car.swerveTimer <= 0) {
          blockedByVehicleOrNpc = true;
          break;
        }
      }

      if (!car.isNpcTraffic) continue; // may have stopped for brawl

      if (!blockedByVehicleOrNpc) {
        for (const npc of this.npcs) {
          if (npc.alertState === 'eliminated' || npc.disposed) continue;
          const dx = npc.position.x - car.position.x;
          const dz = npc.position.z - car.position.z;
          const fwdDist = dx * fwdX + dz * fwdZ;
          const latDist = dx * rightX + dz * rightZ;
          if (fwdDist > 1.4 && fwdDist < 5.4 && Math.abs(latDist) < 1.45) {
            blockedByVehicleOrNpc = true;
            break;
          }
        }
      }

      const targetSpeed =
        blockedByPlayer || blockedByVehicleOrNpc ? 0 : car.swerveTimer > 0 ? 10.8 : 9.4;
      car.speed = THREE.MathUtils.damp(
        car.speed,
        targetSpeed,
        targetSpeed === 0 ? 10 : 3.2,
        dt,
      );

      car.position.x += fwdX * car.speed * dt;
      car.position.z += fwdZ * car.speed * dt;
      for (const w of car.wheels) {
        w.rotation.x += (car.speed * dt) / 0.34;
      }

      car.root.position.copy(car.position);
      car.root.rotation.y = car.yaw;

      const halfX =
        Math.abs(Math.cos(car.yaw)) * 1.05 + Math.abs(Math.sin(car.yaw)) * 2.15;
      const halfZ =
        Math.abs(Math.sin(car.yaw)) * 1.05 + Math.abs(Math.cos(car.yaw)) * 2.15;
      const col = this.colliders[car.colliderIndex];
      if (col) {
        col.minX = car.position.x - halfX;
        col.maxX = car.position.x + halfX;
        col.minZ = car.position.z - halfZ;
        col.maxZ = car.position.z + halfZ;
        col.height = 1.58;
      }
    }
  }

  private updateVehicleDriving(dt: number) {
    const car = this.activeVehicle;
    if (!car) return;

    const throttle =
      (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) -
      (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    const steerInput =
      (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0) -
      (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0);
    const handbrake = this.keys.has('Space');

    if (throttle > 0) {
      car.speed = Math.min(31, car.speed + 16.5 * dt);
    } else if (throttle < 0) {
      car.speed = Math.max(-12, car.speed - 18.0 * dt);
    } else {
      car.speed = THREE.MathUtils.damp(car.speed, 0, handbrake ? 6 : 1.6, dt);
    }

    if (handbrake) {
      car.speed = THREE.MathUtils.damp(car.speed, 0, 7.5, dt);
    }

    const steerRate =
      Math.abs(car.speed) > 0.5
        ? 2.15 * Math.sign(car.speed) * Math.min(1, Math.abs(car.speed) / 6)
        : 0;
    car.yaw += steerInput * steerRate * dt;

    // Smooth camera follow behind car
    if (!this.pointerLocked && !this.isMouseDragging) {
      this.camYaw = this.dampAngle(this.camYaw, car.yaw + Math.PI, 3.2, dt);
    }

    const fwdX = Math.sin(car.yaw);
    const fwdZ = Math.cos(car.yaw);
    car.position.x += fwdX * car.speed * dt;
    car.position.z += fwdZ * car.speed * dt;

    // Spin wheels
    for (const w of car.wheels) {
      w.rotation.x += (car.speed * dt) / 0.34;
    }

    const impactSpeed = Math.abs(car.speed);

    // Near-collision / actual bump against NPC traffic cars -> swerve & curse OR driver gets out to fight!
    if (impactSpeed > 3.2) {
      for (const other of this.vehicles) {
        if (other === car || !other.isNpcTraffic || other.crashCooldown > 0) continue;
        const dist = car.position.distanceTo(other.position);
        if (dist < 4.2) {
          this.triggerCarBrawl(other, car, true);
          car.speed *= 0.25;
          break;
        }
      }
    }

    // 1. Smash through storefront glass!
    for (const glass of this.destructibleGlass) {
      if (glass.shattered) continue;
      if (
        car.position.x > glass.minX - 1.5 &&
        car.position.x < glass.maxX + 1.5 &&
        car.position.z > glass.minZ - 1.5 &&
        car.position.z < glass.maxZ + 1.5
      ) {
        this.shatterGlassPane(glass);
        car.speed *= 0.85;
      }
    }

    // 2. Snap Utility Poles on high-speed impact!
    for (const pole of this.utilityPoles) {
      if (pole.fallen) continue;
      const dx = car.position.x - pole.x;
      const dz = car.position.z - pole.z;
      if (dx * dx + dz * dz < 1.9 * 1.9 && impactSpeed > 6.5) {
        pole.fallen = true;
        pole.fallYaw = car.yaw;
        const col = this.colliders[pole.colliderIndex];
        if (col) col.height = -1;
        pole.wires.forEach((w) => {
          w.visible = false;
        });
        this.spawnBurst(new THREE.Vector3(pole.x, 4.5, pole.z), 0x38bdf8, 20, 5.0);
        this.damageVehicleAt(car, impactSpeed * 0.7, 'front');
        car.speed *= 0.72;
      }
    }

    // 3. Hit NPCs with car
    if (impactSpeed > 4.5) {
      for (const npc of this.npcs) {
        if (npc.alertState === 'eliminated') continue;
        const d = npc.position.distanceTo(car.position);
        if (d < 2.25) {
          this.damageNpc(npc, impactSpeed * 9, false);
        }
      }
    }

    // 4. Solid building / barrier / parked car collision -> part damage or high-speed WASTED crash!
    const pen = this.resolveCircleCollisions(car.position, 1.45);
    if (pen > 0.04 && impactSpeed > 5.5) {
      this.damageVehicleAt(car, impactSpeed, car.speed < 0 ? 'rear' : 'front');
      if (impactSpeed >= 21.5) {
        car.speed = 0;
        this.triggerWasted('crash');
        return;
      } else if (impactSpeed >= 13.5) {
        this.onPlayerHit(Math.round(impactSpeed * 1.8));
      }
      car.speed *= -0.22;
    }

    car.root.position.copy(car.position);
    car.root.rotation.y = car.yaw;
    this.playerPos.copy(car.position);
  }

  private updateRegeneration(dt: number) {
    if (!this.isRegenerating) return;

    let highestProgress = 0;
    let anyActive = false;

    for (const id of LIMB_IDS) {
      const st = this.limbs[id];
      if (st.condition === 'intact') continue;

      anyActive = true;
      st.regenProgress = Math.min(1, st.regenProgress + dt * 0.27);
      const p = st.regenProgress;
      highestProgress = Math.max(highestProgress, p);

      if (p < 0.25) st.stage = 'bone';
      else if (p < 0.52) st.stage = 'flesh';
      else if (p < 0.78) st.stage = 'skin';
      else st.stage = 'clothing';

      if (p >= 1) {
        st.condition = 'intact';
        st.regenProgress = 0;
        st.stage = 'none';
      }
      applyAnatomicalState(this.assassin, id, st, this.totalTime);
    }

    this.health = Math.min(this.maxHealth, this.health + dt * 14);

    if (!anyActive) {
      this.isRegenerating = false;
      this.activeRegenStage = 'none';
      this.lastPlayedRegenStage = 'none';
      this.emitSnapshot();
      return;
    }

    const stage: RegenStage =
      highestProgress < 0.25
        ? 'bone'
        : highestProgress < 0.52
          ? 'flesh'
          : highestProgress < 0.78
            ? 'skin'
            : 'clothing';

    this.activeRegenStage = stage;
    if (stage !== this.lastPlayedRegenStage) {
      this.lastPlayedRegenStage = stage;
      this.sound.playRegenStage(stage);
      const col =
        stage === 'bone'
          ? 0xfef08a
          : stage === 'flesh'
            ? 0xef4444
            : stage === 'skin'
              ? 0xfdba74
              : 0x38bdf8;
      this.spawnBurst(
        this.playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)),
        col,
        10,
        1.8,
      );
    }
  }

  private updatePlayer(dt: number) {
    let moveX = 0;
    let moveZ = 0;
    if (!this.conversationActive) {
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) moveZ += 1;
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) moveZ -= 1;
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) moveX -= 1;
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) moveX += 1;
    }

    const moving = moveX !== 0 || moveZ !== 0;
    const sprinting =
      moving &&
      !this.crouchToggled &&
      (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) &&
      this.stamina > 5;

    if (sprinting) {
      this.stamina = Math.max(0, this.stamina - 20 * dt);
    } else {
      this.stamina = Math.min(100, this.stamina + 16 * dt);
    }

    const injuredLegs =
      (this.limbs.leftLeg.condition !== 'intact' ? 1 : 0) +
      (this.limbs.rightLeg.condition !== 'intact' ? 1 : 0);
    const legMult = injuredLegs === 2 ? 0.42 : injuredLegs === 1 ? 0.68 : 1.0;

    const baseSpeed = this.crouchToggled ? 3.4 : sprinting ? 9.4 : 5.8;
    const speed = moving ? baseSpeed * legMult : 0;

    if (moving) {
      _forward.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw));
      _right.set(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
      _v1
        .set(0, 0, 0)
        .addScaledVector(_forward, moveZ)
        .addScaledVector(_right, moveX)
        .normalize();

      this.playerPos.addScaledVector(_v1, speed * dt);

      const targetYaw = Math.atan2(_v1.x, _v1.z);
      let diff = targetYaw - this.playerYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.playerYaw += diff * Math.min(1, dt * 12);

      this.walkPhase += dt * (sprinting ? 13 : this.crouchToggled ? 6 : 9);
      this.footstepAccum += dt * (sprinting ? 2.7 : 1.7);
      if (this.footstepAccum >= 1) {
        this.footstepAccum = 0;
        this.sound.playFootstep(this.crouchToggled, sprinting);
      }
    } else {
      this.walkPhase = THREE.MathUtils.damp(this.walkPhase, 0, 6, dt);
    }

    const floorY = this.getGroundHeightAt(this.playerPos.x, this.playerPos.z);
    if (this.playerPos.y > floorY || this.playerVelY > 0) {
      this.playerVelY -= 18 * dt;
      this.playerPos.y += this.playerVelY * dt;
      if (this.playerPos.y <= floorY) {
        this.playerPos.y = floorY;
        this.playerVelY = 0;
      }
    } else {
      this.playerPos.y = floorY;
    }

    this.resolveCircleCollisions(this.playerPos, 0.44);
    this.assassin.root.position.copy(this.playerPos);
    this.assassin.root.rotation.y = this.playerYaw;

    const stride = moving ? Math.sin(this.walkPhase) : 0;
    const limpDrop =
      injuredLegs > 0 && moving ? Math.abs(Math.sin(this.walkPhase)) * 0.1 : 0;

    const targetPelvisY = (this.crouchToggled ? 0.66 : 0.94) - limpDrop;
    this.assassin.pelvis.position.y = THREE.MathUtils.damp(
      this.assassin.pelvis.position.y,
      targetPelvisY,
      12,
      dt,
    );
    this.assassin.torsoPivot.rotation.x = THREE.MathUtils.damp(
      this.assassin.torsoPivot.rotation.x,
      this.crouchToggled ? 0.4 : sprinting ? 0.22 : 0.05,
      10,
      dt,
    );

    const legAmp = this.crouchToggled ? 0.35 : sprinting ? 0.85 : 0.58;
    const leftLegAngle = stride * legAmp;
    const rightLegAngle = -stride * legAmp;
    this.assassin.limbs.leftLeg.pivot.rotation.x = leftLegAngle;
    this.assassin.limbs.rightLeg.pivot.rotation.x = rightLegAngle;

    const aimingGun =
      this.equippedWeapon === 'pistol' || this.equippedWeapon === 'shotgun';
    const slashSwing =
      this.attackAnim > 0 ? Math.sin(this.attackAnim * Math.PI) * 1.85 : 0;
    const activeArm =
      this.attackCombo === 0 &&
      this.limbs.rightArm.condition !== 'severed'
        ? 'right'
        : 'left';

    this.assassin.limbs.leftArm.pivot.rotation.x =
      -stride * legAmp * 0.7 - (activeArm === 'left' ? slashSwing : 0);
    this.assassin.limbs.rightArm.pivot.rotation.x = aimingGun
      ? -Math.PI * 0.44 + (this.attackAnim > 0 ? 0.18 : 0)
      : stride * legAmp * 0.7 - (activeArm === 'right' ? slashSwing : 0);

    const yawRate = dt > 0.0001 ? (this.playerYaw - this.prevPlayerYaw) / dt : 0;
    this.prevPlayerYaw = this.playerYaw;

    // Anti-clipping cloth simulation for coat tails
    updateClothPhysics(
      this.assassin,
      speed,
      leftLegAngle,
      rightLegAngle,
      this.crouchToggled,
      dt,
      yawRate,
      this.playerVelY,
      false,
    );
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.position.addScaledVector(p.velocity, dt);
      p.mesh.position.copy(p.position);

      let remove = p.life <= 0 || p.position.y < 0;

      // Check storefront destructible glass hit
      if (!remove) {
        for (const glass of this.destructibleGlass) {
          if (glass.shattered) continue;
          if (
            p.position.y >= glass.minY &&
            p.position.y <= glass.maxY &&
            p.position.x >= glass.minX - 0.18 &&
            p.position.x <= glass.maxX + 0.18 &&
            p.position.z >= glass.minZ - 0.18 &&
            p.position.z <= glass.maxZ + 0.18
          ) {
            this.shatterGlassPane(glass);
            remove = true;
            break;
          }
        }
      }

      // Check vehicle glass / body hit
      if (!remove) {
        for (const car of this.vehicles) {
          if (car === this.activeVehicle) continue;
          const dx = p.position.x - car.position.x;
          const dz = p.position.z - car.position.z;
          if (dx * dx + dz * dz < 4.5 && p.position.y < 1.65) {
            if (car.isNpcTraffic) {
              car.isNpcTraffic = false;
              car.speed = 0;
              car.driverModel.visible = false;
            }
            this.damageVehicleAt(car, 10, p.position.y > 0.9 ? 'glass' : 'front');
            remove = true;
            break;
          }
        }
      }

      if (!remove) {
        for (const c of this.colliders) {
          const minY = c.minY ?? 0;
          if (c.height < 0) continue;
          if (
            p.position.y >= minY &&
            p.position.y <= c.height &&
            p.position.x >= c.minX &&
            p.position.x <= c.maxX &&
            p.position.z >= c.minZ &&
            p.position.z <= c.maxZ
          ) {
            this.spawnBurst(p.position, 0xfbbf24, 6, 2.0);
            remove = true;
            break;
          }
        }
      }

      if (!remove && p.fromPlayer) {
        for (const npc of this.npcs) {
          if (npc.alertState === 'eliminated') continue;
          const dx = p.position.x - npc.position.x;
          const dz = p.position.z - npc.position.z;
          if (
            dx * dx + dz * dz < 0.44 &&
            p.position.y >= npc.position.y + 0.15 &&
            p.position.y <= npc.position.y + 1.88
          ) {
            const hitDir = p.velocity.clone().setY(0).normalize();
            const dmg = p.isSilent ? Math.max(p.damage, 125) : p.damage;
            this.damageNpc(npc, dmg, p.isSilent, hitDir);
            remove = true;
            break;
          }
        }
      } else if (!remove && !p.fromPlayer && !this.activeVehicle) {
        const dx = p.position.x - this.playerPos.x;
        const dz = p.position.z - this.playerPos.z;
        const maxH = this.playerPos.y + (this.crouchToggled ? 1.2 : 1.78);
        if (
          dx * dx + dz * dz < 0.36 &&
          p.position.y >= this.playerPos.y + 0.1 &&
          p.position.y <= maxH
        ) {
          this.onPlayerHit(p.damage);
          remove = true;
        }
      }

      if (remove) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  private onPlayerHit(damage: number) {
    if (this.isRagdoll) return;
    this.health = Math.max(0, this.health - damage);
    this.spawnBurst(
      this.playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)),
      0xdc2626,
      12,
      2.8,
    );

    const roll = Math.random();
    if (roll < 0.42) {
      const intactLimbs = LIMB_IDS.filter(
        (id) => this.limbs[id].condition === 'intact',
      );
      if (intactLimbs.length > 0) {
        const chosen =
          intactLimbs[Math.floor(Math.random() * intactLimbs.length)];
        const sever = chosen !== 'torso' && Math.random() < 0.45;
        this.applyLimbTrauma(chosen, sever ? 'severed' : 'fractured');
      }
    }

    if (this.health <= 0) {
      this.triggerWasted('combat');
    }
  }

  private updatePoliceResponse(dt: number) {
    const d = this.policeDispatch;

    if (!d.active) {
      const fighters = this.npcs.filter(
        (n) =>
          n.alertState === 'fighting' &&
          !n.isPlayerFighter &&
          !n.disposed,
      );
      if (fighters.length >= 2) {
        const f1 = fighters[0];
        const f2 =
          fighters.find((f) => f.id === f1.fightTargetId) ?? fighters[1];
        const cruiser =
          this.vehicles.find(
            (v) => v.isPoliceCruiser && v !== this.activeVehicle,
          ) ?? null;

        d.active = true;
        d.stage = 'driving';
        d.timer = 0;
        d.sirenCooldown = 0;
        d.fighterIds = [f1.id, f2.id];
        d.officerIds = [];
        d.cruiser = cruiser;
        d.fightSpot.copy(f1.position).lerp(f2.position, 0.5);

        if (cruiser) {
          cruiser.isNpcTraffic = false;
          cruiser.driverModel.visible = true;
          const col = this.colliders[cruiser.colliderIndex];
          if (col) col.height = -1;
        }
        this.sound.playPoliceSiren();
        this.emitSnapshot();
      }
      return;
    }

    d.timer += dt;
    d.sirenCooldown -= dt;

    // Flash LCPD cruiser red/blue lightbars while active
    if (d.cruiser?.lightbarRed && d.cruiser?.lightbarBlue) {
      const redOn = Math.floor(this.totalTime * 9) % 2 === 0;
      (d.cruiser.lightbarRed.material as THREE.MeshStandardMaterial).emissiveIntensity =
        redOn ? 3.2 : 0.2;
      (d.cruiser.lightbarBlue.material as THREE.MeshStandardMaterial).emissiveIntensity =
        redOn ? 0.2 : 3.2;
    }

    const f1 = d.fighterIds
      ? this.npcs.find((n) => n.id === d.fighterIds![0])
      : undefined;
    const f2 = d.fighterIds
      ? this.npcs.find((n) => n.id === d.fighterIds![1])
      : undefined;

    if (!f1 || !f2 || f1.alertState === 'eliminated' || f2.alertState === 'eliminated') {
      d.active = false;
      d.stage = 'idle';
      if (d.cruiser?.lightbarRed && d.cruiser?.lightbarBlue) {
        (d.cruiser.lightbarRed.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
        (d.cruiser.lightbarBlue.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
      }
      this.emitSnapshot();
      return;
    }

    d.fightSpot.copy(f1.position).lerp(f2.position, 0.5);

    if (d.stage === 'driving') {
      if (d.sirenCooldown <= 0) {
        d.sirenCooldown = 1.9;
        this.sound.playPoliceSiren();
      }
      const cruiser = d.cruiser;
      let arrived = d.timer > 4.2;
      if (cruiser) {
        const dx = d.fightSpot.x - cruiser.position.x;
        const dz = d.fightSpot.z - cruiser.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 6.8 && d.timer <= 4.2) {
          const desiredYaw = Math.atan2(dx, dz);
          cruiser.yaw = this.dampAngle(cruiser.yaw, desiredYaw, 5.5, dt);
          cruiser.speed = 13.5;
          cruiser.position.x += Math.sin(cruiser.yaw) * cruiser.speed * dt;
          cruiser.position.z += Math.cos(cruiser.yaw) * cruiser.speed * dt;
          for (const w of cruiser.wheels) {
            w.rotation.x += (cruiser.speed * dt) / 0.34;
          }
          cruiser.root.position.copy(cruiser.position);
          cruiser.root.rotation.y = cruiser.yaw;
        } else {
          arrived = true;
          cruiser.speed = 0;
          cruiser.driverModel.visible = false;
          const halfX =
            Math.abs(Math.cos(cruiser.yaw)) * 1.05 +
            Math.abs(Math.sin(cruiser.yaw)) * 2.2;
          const halfZ =
            Math.abs(Math.sin(cruiser.yaw)) * 1.05 +
            Math.abs(Math.cos(cruiser.yaw)) * 2.2;
          const col = this.colliders[cruiser.colliderIndex];
          if (col) {
            col.minX = cruiser.position.x - halfX;
            col.maxX = cruiser.position.x + halfX;
            col.minZ = cruiser.position.z - halfZ;
            col.maxZ = cruiser.position.z + halfZ;
            col.height = 1.58;
          }
        }
      }

      if (arrived) {
        const basePos = cruiser ? cruiser.position : d.fightSpot;
        const yaw = cruiser ? cruiser.yaw : 0;
        const off1 = new THREE.Vector3(
          basePos.x + Math.cos(yaw) * 1.9,
          this.getGroundHeightAt(basePos.x, basePos.z),
          basePos.z - Math.sin(yaw) * 1.9,
        );
        const off2 = new THREE.Vector3(
          basePos.x - Math.cos(yaw) * 1.9,
          this.getGroundHeightAt(basePos.x, basePos.z),
          basePos.z + Math.sin(yaw) * 1.9,
        );
        const stamp = Math.floor(performance.now());
        const o1 = this.spawnDynamicStreetNpc(
          `officer_1_${stamp}`,
          'Officer Miller (LCPD)',
          'police',
          off1,
          Math.atan2(d.fightSpot.x - off1.x, d.fightSpot.z - off1.z),
          { isPoliceOfficer: true },
        );
        const o2 = this.spawnDynamicStreetNpc(
          `officer_2_${stamp}`,
          'Officer Grant (LCPD)',
          'police',
          off2,
          Math.atan2(d.fightSpot.x - off2.x, d.fightSpot.z - off2.z),
          { isPoliceOfficer: true },
        );
        d.officerIds = [o1.id, o2.id];
        d.stage = 'halting';
        d.timer = 0;

        // Break up the fight immediately!
        f1.alertState = 'arrested';
        f2.alertState = 'arrested';
        this.speakNpc(o1, 'police_halt');
      }
    } else if (d.stage === 'halting') {
      for (let i = 0; i < d.officerIds.length; i++) {
        const off = this.npcs.find((n) => n.id === d.officerIds[i]);
        if (!off) continue;
        const stopDist = i === 0 ? 3.1 : 3.6;
        _v1.subVectors(d.fightSpot, off.position).setY(0);
        if (_v1.length() > stopDist) {
          _v1.normalize();
          off.position.addScaledVector(_v1, 3.6 * dt);
          off.walkPhase += dt * 8;
        }
        off.yaw = Math.atan2(d.fightSpot.x - off.position.x, d.fightSpot.z - off.position.z);
        off.rig.root.position.copy(off.position);
        off.rig.root.rotation.y = off.yaw;
      }
      if (d.timer >= 1.8) {
        d.stage = 'blame_1';
        d.timer = 0;
        this.speakNpc(f1, 'fight_blame_1');
      }
    } else if (d.stage === 'blame_1') {
      const o1 = this.npcs.find((n) => n.id === d.officerIds[0]);
      if (o1) {
        f1.yaw = Math.atan2(o1.position.x - f1.position.x, o1.position.z - f1.position.z);
      }
      if (d.timer >= 2.6) {
        d.stage = 'blame_2';
        d.timer = 0;
        this.speakNpc(f2, 'fight_blame_2');
      }
    } else if (d.stage === 'blame_2') {
      const o1 = this.npcs.find((n) => n.id === d.officerIds[0]);
      if (o1) {
        f2.yaw = Math.atan2(o1.position.x - f2.position.x, o1.position.z - f2.position.z);
      }
      if (d.timer >= 2.7) {
        d.stage = 'arresting';
        d.timer = 0;
        const o1Ref = this.npcs.find((n) => n.id === d.officerIds[0]);
        if (o1Ref) this.speakNpc(o1Ref, 'police_arrest');
      }
    } else if (d.stage === 'arresting') {
      if (d.timer >= 2.2) {
        d.stage = 'escorting';
        d.timer = 0;
      }
    } else if (d.stage === 'escorting') {
      const targetPos = d.cruiser ? d.cruiser.position : d.fightSpot;
      for (const npc of [f1, f2]) {
        _v1.subVectors(targetPos, npc.position).setY(0);
        if (_v1.length() > 2.4) {
          _v1.normalize();
          npc.position.addScaledVector(_v1, 2.2 * dt);
          npc.yaw = Math.atan2(_v1.x, _v1.z);
          npc.walkPhase += dt * 5;
        }
      }
      for (const oid of d.officerIds) {
        const off = this.npcs.find((n) => n.id === oid);
        if (!off) continue;
        _v1.subVectors(targetPos, off.position).setY(0);
        if (_v1.length() > 2.8) {
          _v1.normalize();
          off.position.addScaledVector(_v1, 2.2 * dt);
          off.yaw = Math.atan2(_v1.x, _v1.z);
          off.walkPhase += dt * 5;
        }
      }

      if (d.timer >= 4.2) {
        for (const id of [...(d.fighterIds ?? []), ...d.officerIds]) {
          const npc = this.npcs.find((n) => n.id === id);
          if (npc) {
            npc.rig.root.visible = false;
            npc.disposed = true;
            npc.alertState = 'eliminated';
          }
        }
        if (d.cruiser?.lightbarRed && d.cruiser?.lightbarBlue) {
          (d.cruiser.lightbarRed.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
          (d.cruiser.lightbarBlue.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
        }
        d.active = false;
        d.stage = 'idle';
        this.emitSnapshot();
      }
    }
  }

  private updateNpcs(dt: number) {
    const anyKilled = this.npcs.some(
      (n) => n.alertState === 'eliminated' && !n.disposed && !n.isDynamicSpawn,
    );

    for (const npc of this.npcs) {
      if (npc.disposed) continue;

      if (npc.alertState === 'eliminated') {
        npc.rig.phoneMesh.visible = false;
        npc.rig.posterMesh.visible = false;
        npc.deathTimer = Math.min(1, npc.deathTimer + dt * 2.2);
        if (npc.ragdollVel.lengthSq() > 0.01) {
          npc.position.addScaledVector(npc.ragdollVel, dt);
          npc.ragdollVel.multiplyScalar(Math.max(0, 1 - dt * 5.2));
          npc.position.y = this.getGroundHeightAt(npc.position.x, npc.position.z);
          this.resolveCircleCollisions(npc.position, 0.44);
          npc.rig.root.position.copy(npc.position);
        }
        applyNpcRagdollPose(
          npc.rig,
          npc.deathTimer,
          npc.ragdollSeed,
          npc.ragdollFallDir,
        );
        continue;
      }

      npc.muzzleTimer = Math.max(0, npc.muzzleTimer - dt);
      npc.rig.muzzleFlash.visible = npc.muzzleTimer > 0;
      npc.attackCooldown = Math.max(0, npc.attackCooldown - dt);
      npc.speechCooldown -= dt;

      const distToPlayer = npc.position.distanceTo(this.playerPos);
      _v1.subVectors(this.playerPos, npc.position);
      _v1.y = 0;
      const dirToPlayer =
        _v1.lengthSq() > 0.0001
          ? _v1.clone().normalize()
          : new THREE.Vector3(0, 0, 1);
      const npcForward = _v2.set(Math.sin(npc.yaw), 0, Math.cos(npc.yaw));

      const isTalkingToPlayer =
        this.conversationActive && npc.id === this.activeTalkNpcId;

      if (isTalkingToPlayer) {
        const faceYaw = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        npc.yaw = this.dampAngle(npc.yaw, faceYaw, 10, dt);
        npc.walkPhase = 0;
        npc.rig.root.position.copy(npc.position);
        npc.rig.root.rotation.y = npc.yaw;
        npc.rig.leftLeg.rotation.x = THREE.MathUtils.damp(
          npc.rig.leftLeg.rotation.x,
          0,
          12,
          dt,
        );
        npc.rig.rightLeg.rotation.x = THREE.MathUtils.damp(
          npc.rig.rightLeg.rotation.x,
          0,
          12,
          dt,
        );
        npc.rig.leftArm.rotation.x = THREE.MathUtils.damp(
          npc.rig.leftArm.rotation.x,
          0,
          12,
          dt,
        );
        npc.rig.rightArm.rotation.x = THREE.MathUtils.damp(
          npc.rig.rightArm.rotation.x,
          0,
          12,
          dt,
        );
        npc.rig.leftForearm.rotation.x = 0;
        npc.rig.bodyPivot.position.y = THREE.MathUtils.damp(
          npc.rig.bodyPivot.position.y,
          0.94,
          12,
          dt,
        );
        continue;
      }

      const weatherCfg = WEATHER_CONFIGS[this.weather];
      const sightRange =
        (this.crouchToggled ? 13 : 24) * weatherCfg.sightMult;
      const coneThreshold =
        this.weather === 'fog' ? 0.44 : this.weather === 'sunny' ? 0.28 : 0.35;
      const inCone =
        distToPlayer < sightRange &&
        npcForward.dot(dirToPlayer) > coneThreshold &&
        this.hasLineOfSight(
          _v3.set(npc.position.x, npc.position.y + 1.5, npc.position.z),
          this.playerPos
            .clone()
            .setY(this.playerPos.y + (this.crouchToggled ? 0.9 : 1.5)),
        );

      if (
        npc.alertState !== 'fighting' &&
        npc.alertState !== 'arrested' &&
        npc.alertState !== 'combat'
      ) {
        // Check wanted stars & suspicion only for normal pedestrians/clerks/guards
      }

      if (npc.alertState === 'fighting') {
        npc.punchCooldown = Math.max(0, (npc.punchCooldown ?? 0.6) - dt);
        const targetPos = npc.isPlayerFighter
          ? this.playerPos
          : this.npcs.find((o) => o.id === npc.fightTargetId && o.alertState !== 'eliminated')
              ?.position;

        if (!targetPos) {
          npc.alertState = 'patrol';
        } else {
          _v1.subVectors(targetPos, npc.position).setY(0);
          const dist = _v1.length();
          if (dist > 0.01) {
            npc.yaw = this.dampAngle(npc.yaw, Math.atan2(_v1.x, _v1.z), 12, dt);
          }
          if (dist > 1.35) {
            _v1.normalize();
            npc.position.addScaledVector(_v1, 3.4 * dt);
            npc.walkPhase += dt * 9;
          } else if ((npc.punchCooldown ?? 0) <= 0) {
            npc.punchCooldown = 0.78 + Math.random() * 0.28;
            npc.fightTimer = 0.35;
            this.sound.playPunchImpact();
            if (npc.isPlayerFighter && !this.activeVehicle && dist < 1.8) {
              this.onPlayerHit(5);
            }
          }
        }
        npc.fightTimer = Math.max(0, (npc.fightTimer ?? 0) - dt);
        npc.position.y = this.getGroundHeightAt(npc.position.x, npc.position.z);
        this.resolveCircleCollisions(npc.position, 0.42);
        npc.rig.root.position.copy(npc.position);
        npc.rig.root.rotation.y = npc.yaw;
        const swing = npc.fightTimer > 0 ? Math.sin((npc.fightTimer / 0.35) * Math.PI) * 1.65 : 0;
        npc.rig.rightArm.rotation.x = -0.95 - swing;
        npc.rig.leftArm.rotation.x = -0.85 + swing * 0.6;
        const s = Math.sin(npc.walkPhase) * 0.42;
        npc.rig.leftLeg.rotation.x = s;
        npc.rig.rightLeg.rotation.x = -s;
        npc.rig.bodyPivot.position.y = 0.94;
        continue;
      }

      if (npc.isPoliceOfficer && this.policeDispatch.active && npc.alertState !== 'combat') {
        npc.position.y = this.getGroundHeightAt(npc.position.x, npc.position.z);
        npc.rig.root.position.copy(npc.position);
        npc.rig.root.rotation.y = npc.yaw;
        const moving = this.policeDispatch.stage === 'halting' || this.policeDispatch.stage === 'escorting';
        const s = moving ? Math.sin(npc.walkPhase) * 0.48 : 0;
        npc.rig.leftLeg.rotation.x = s;
        npc.rig.rightLeg.rotation.x = -s;
        npc.rig.leftArm.rotation.x = -s * 0.35;
        npc.rig.rightArm.rotation.x = this.policeDispatch.stage === 'halting' ? -1.1 : s * 0.35;
        npc.rig.bodyPivot.position.y = 0.94;
        continue;
      }

      if (npc.alertState === 'arrested') {
        npc.position.y = this.getGroundHeightAt(npc.position.x, npc.position.z);
        npc.rig.root.position.copy(npc.position);
        npc.rig.root.rotation.y = npc.yaw;
        npc.rig.leftArm.rotation.x = -2.45;
        npc.rig.rightArm.rotation.x = -2.45;
        const s = this.policeDispatch.stage === 'escorting' ? Math.sin(npc.walkPhase) * 0.38 : 0;
        npc.rig.leftLeg.rotation.x = s;
        npc.rig.rightLeg.rotation.x = -s;
        npc.rig.bodyPivot.position.y = 0.94;
        continue;
      }

      // IMPORTANT: When wantedLevel === 0, NPCs perceive player as a normal citizen,
      // EXCEPT when WANTED posters are up (or kills occurred), staring longer makes them recognize your face & call 911!
      if (this.wantedLevel > 0 && inCone) {
        npc.rig.phoneMesh.visible = false;
        npc.rig.posterMesh.visible = false;
        if (npc.role === 'civilian' && npc.alertState !== 'fleeing') {
          npc.alertState = 'fleeing';
          npc.alertTimer = 15;
          this.speakNpc(npc, 'civ_panic_2');
        } else if (npc.role === 'clerk') {
          if (npc.storeClerkArchetype === 'threaten') {
            npc.rig.weaponGroup.visible = true;
            if (distToPlayer < 8.5) {
              npc.alertState = 'combat';
            } else if (npc.alertState !== 'combat') {
              npc.alertState = 'threaten';
            }
          } else {
            npc.alertState = distToPlayer < 6 ? 'fleeing' : 'cowering';
          }
        } else if (
          npc.role === 'guard' ||
          npc.role === 'heavy' ||
          npc.role === 'target' ||
          npc.role === 'police'
        ) {
          if (npc.alertState !== 'combat') {
            npc.alertState = 'combat';
            this.speakNpc(
              npc,
              npc.role === 'target' ? 'target_panic' : 'guard_combat_1',
            );
          }
          npc.lastKnownPlayerPos = this.playerPos.clone();
          npc.alertTimer = 10.0;
        }
      } else if (
        this.wantedLevel === 0 &&
        !this.activeVehicle &&
        (this.postersTriggered || anyKilled) &&
        !(npc.isBoutiqueResident && this.wasInsideBoutique) &&
        npc.alertState !== 'fleeing' &&
        npc.alertState !== 'cowering' &&
        npc.alertState !== 'combat' &&
        npc.alertState !== 'threaten' &&
        !npc.isPoliceOfficer
      ) {
        if (inCone) {
          const proxFactor = THREE.MathUtils.clamp(
            1.35 - distToPlayer / Math.max(8, 18 * weatherCfg.sightMult),
            0.35,
            1.35,
          );
          const disguiseSpeed =
            this.currentOutfit === this.wantedOutfitId ? 0.36 : 0.14;
          const prevSusp = npc.suspicion;
          npc.suspicion = Math.min(
            1,
            npc.suspicion +
              dt * proxFactor * disguiseSpeed * weatherCfg.suspicionMult,
          );

          if (
            npc.suspicion >= 0.35 &&
            (npc.alertState === 'neutral' ||
              npc.alertState === 'patrol' ||
              npc.alertState === 'suspicious')
          ) {
            npc.alertState = 'staring';
            npc.targetPosterId = null;
            npc.rig.posterMesh.visible = false;
          }
          if (
            prevSusp < 0.72 &&
            npc.suspicion >= 0.72 &&
            npc.alertState === 'staring'
          ) {
            this.speakNpc(npc, 'npc_recognize');
          }
          if (npc.suspicion >= 1 && npc.alertState === 'staring') {
            npc.alertState = 'calling_police';
            npc.callTimer = 4.8;
            npc.rig.phoneMesh.visible = true;
            this.sound.playPhoneDial();
            this.speakNpc(npc, 'npc_call_police');
          }
        } else {
          npc.suspicion = Math.max(0, npc.suspicion - dt * 0.22);
          if (npc.alertState === 'staring' && npc.suspicion < 0.2) {
            npc.alertState = 'patrol';
          }
        }
      }

      const ringMat = npc.rig.alertRing.material as THREE.MeshBasicMaterial;
      ringMat.color.setHex(
        npc.alertState === 'combat' ||
          npc.alertState === 'threaten' ||
          npc.alertState === 'calling_police'
          ? 0xef4444
          : npc.alertState === 'staring'
            ? 0xf97316
            : npc.alertState === 'fleeing' || npc.alertState === 'cowering'
              ? 0xfbbf24
              : npc.role === 'target'
                ? 0xd97706
                : npc.role === 'civilian' || npc.role === 'clerk'
                  ? 0x38bdf8
                  : 0x64748b,
      );

      let hangingNow = false;
      let shelteredInRain = false;
      let hurryingInRain = false;

      // State Machine Execution
      if (npc.alertState === 'staring') {
        const targetYaw = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        npc.yaw = this.dampAngle(npc.yaw, targetYaw, 8, dt);
      } else if (npc.alertState === 'calling_police') {
        const targetYaw = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        npc.yaw = this.dampAngle(npc.yaw, targetYaw, 10, dt);
        npc.callTimer -= dt;
        if (npc.callTimer <= 0) {
          npc.rig.phoneMesh.visible = false;
          this.wantedLevel = Math.min(3, this.wantedLevel + 1);
          npc.alertState =
            npc.role === 'guard' ||
            npc.role === 'heavy' ||
            npc.role === 'target' ||
            npc.role === 'police'
              ? 'combat'
              : 'fleeing';
          npc.lastKnownPlayerPos = this.playerPos.clone();
          npc.alertTimer = 14;
          this.speakNpc(
            npc,
            npc.alertState === 'combat' ? 'guard_combat_2' : 'civ_panic_2',
          );
          for (const other of this.npcs) {
            if (other === npc || other.alertState === 'eliminated') continue;
            if (
              (other.role === 'guard' ||
                other.role === 'heavy' ||
                other.role === 'target') &&
              other.position.distanceTo(npc.position) < 28
            ) {
              other.alertState = 'combat';
              other.lastKnownPlayerPos = this.playerPos.clone();
              other.alertTimer = 14;
            }
          }
        }
      } else if (npc.alertState === 'neutral' || npc.alertState === 'patrol') {
        // Poster-hanging assignment after player leaves Atelier Vex
        const posterSlot = npc.targetPosterId
          ? this.wantedPosters.find((p) => p.id === npc.targetPosterId)
          : undefined;
        if (posterSlot && !posterSlot.posted) {
          _v1.subVectors(posterSlot.hangStandPos, npc.position);
          _v1.y = 0;
          if (_v1.length() > 0.52) {
            _v1.normalize();
            npc.position.addScaledVector(_v1, 2.55 * dt);
            npc.yaw = this.dampAngle(
              npc.yaw,
              Math.atan2(_v1.x, _v1.z),
              8,
              dt,
            );
            npc.walkPhase += dt * 6.0;
          } else {
            hangingNow = true;
            npc.yaw = this.dampAngle(npc.yaw, posterSlot.hangYaw, 10, dt);
            npc.posterHangTimer += dt;
            if (npc.posterHangTimer >= 1.05) {
              posterSlot.posted = true;
              posterSlot.mesh.visible = true;
              this.sound.playPosterSlap();
              if (distToPlayer < 26) {
                this.speakNpc(npc, 'npc_poster_hang');
              }
              npc.posterHangTimer = 0;
              const nextSlot = npc.isPosterWorker
                ? this.wantedPosters.find(
                    (p) =>
                      !p.posted &&
                      !this.npcs.some((o) => o.targetPosterId === p.id),
                  )
                : undefined;
              npc.targetPosterId = nextSlot ? nextSlot.id : null;
              npc.rig.posterMesh.visible = Boolean(nextSlot);
            }
          }
        } else {
          if (npc.targetPosterId) {
            npc.targetPosterId = null;
            npc.rig.posterMesh.visible = false;
          }
          const isOutdoorCiv =
            npc.role === 'civilian' &&
            !npc.isIndoorStore &&
            !npc.isBoutiqueResident;

          if (this.weather === 'rain' && isOutdoorCiv) {
            const shelter = this.getNearestShelterPoint(npc.position);
            if (
              this.isPositionSheltered(npc.position) ||
              npc.position.distanceTo(shelter) < 2.2
            ) {
              shelteredInRain = true;
              // Wait dry under shelter looking toward the street
              const lookOutYaw =
                Math.atan2(-npc.position.x, -npc.position.z) +
                Math.sin(this.totalTime * 0.7 + npc.position.x) * 0.25;
              npc.yaw = this.dampAngle(npc.yaw, lookOutYaw, 4, dt);
            } else {
              hurryingInRain = true;
              _v1.subVectors(shelter, npc.position);
              _v1.y = 0;
              if (_v1.lengthSq() > 0.01) {
                _v1.normalize();
                const prevX = npc.position.x;
                const prevZ = npc.position.z;
                npc.position.addScaledVector(_v1, 3.05 * dt);
                this.resolveCircleCollisions(npc.position, 0.42);
                const movedDist = Math.hypot(
                  npc.position.x - prevX,
                  npc.position.z - prevZ,
                );
                if (movedDist < 0.35 * dt) {
                  // Duck against storefront awning if direct doorway path is blocked
                  shelteredInRain = true;
                  hurryingInRain = false;
                } else {
                  const targetYaw = Math.atan2(_v1.x, _v1.z);
                  npc.yaw = this.dampAngle(npc.yaw, targetYaw, 8, dt);
                  npc.walkPhase += dt * 7.8;
                }
              }
            }
          } else {
            const wp = npc.waypoints[npc.waypointIndex];
            _v1.subVectors(wp, npc.position);
            _v1.y = 0;
            if (_v1.length() < 0.85) {
              npc.waypointIndex = (npc.waypointIndex + 1) % npc.waypoints.length;
            } else {
              _v1.normalize();
              const patrolSpeed = 1.85 * weatherCfg.patrolSpeedMult;
              npc.position.addScaledVector(_v1, patrolSpeed * dt);
              const fogScan =
                this.weather === 'fog' &&
                (npc.role === 'guard' || npc.role === 'heavy')
                  ? Math.sin(this.totalTime * 1.4 + npc.position.x * 0.2) * 0.38
                  : 0;
              const targetYaw = Math.atan2(_v1.x, _v1.z) + fogScan;
              npc.yaw = this.dampAngle(npc.yaw, targetYaw, 6, dt);
              npc.walkPhase += dt * 4.6 * weatherCfg.patrolSpeedMult;
            }
          }

          if (npc.speechCooldown <= 0) {
            npc.speechCooldown = 9 + Math.random() * 11;
            if (npc.role === 'civilian') {
              const line =
                this.weather === 'rain'
                  ? 'civ_weather_rain'
                  : this.weather === 'sunny'
                    ? Math.random() > 0.45
                      ? 'civ_weather_sunny'
                      : 'civ_chat_2'
                    : Math.random() > 0.5
                      ? 'civ_chat_1'
                      : 'civ_chat_2';
              this.speakNpc(npc, line);
            } else if (npc.role === 'clerk') {
              this.speakNpc(npc, 'clerk_greet');
            } else if (npc.role === 'target') {
              const line =
                npc.id === 'target_1'
                  ? 'target_patrol'
                  : npc.id === 'target_2'
                    ? 'target_broker'
                    : 'target_captain';
              this.speakNpc(npc, line);
            } else {
              const line =
                this.weather === 'fog'
                  ? Math.random() > 0.4
                    ? 'guard_weather_fog'
                    : 'guard_patrol_1'
                  : this.weather === 'sunny'
                    ? Math.random() > 0.45
                      ? 'guard_weather_sunny'
                      : 'guard_patrol_1'
                    : this.weather === 'rain'
                      ? 'guard_patrol_2'
                      : 'guard_patrol_3';
              this.speakNpc(npc, line);
            }
          }
        }
      } else if (npc.alertState === 'fleeing') {
        // Run directly away from the player!
        _v1.subVectors(npc.position, this.playerPos);
        _v1.y = 0;
        if (_v1.lengthSq() > 0.01) {
          _v1.normalize();
          npc.position.addScaledVector(_v1, 5.8 * dt);
          npc.yaw = this.dampAngle(
            npc.yaw,
            Math.atan2(_v1.x, _v1.z),
            10,
            dt,
          );
          npc.walkPhase += dt * 11;
        }
        if (npc.speechCooldown <= 0 && distToPlayer < 26) {
          npc.speechCooldown = 5 + Math.random() * 6;
          this.speakNpc(
            npc,
            npc.role === 'clerk'
              ? 'clerk_beg'
              : Math.random() > 0.5
                ? 'civ_panic_1'
                : 'civ_panic_2',
          );
        }
      } else if (npc.alertState === 'cowering') {
        const targetYaw = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        npc.yaw = this.dampAngle(npc.yaw, targetYaw, 8, dt);
        if (npc.speechCooldown <= 0 && distToPlayer < 16) {
          npc.speechCooldown = 6;
          this.speakNpc(npc, 'clerk_beg');
        }
      } else if (npc.alertState === 'threaten') {
        const targetYaw = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        npc.yaw = this.dampAngle(npc.yaw, targetYaw, 10, dt);
        if (distToPlayer < 7.5 && inCone) {
          npc.alertState = 'combat';
        }
      } else if (npc.alertState === 'suspicious') {
        npc.alertTimer -= dt;
        if (npc.lastKnownPlayerPos) {
          _v1.subVectors(npc.lastKnownPlayerPos, npc.position);
          _v1.y = 0;
          if (_v1.length() > 1.2) {
            _v1.normalize();
            npc.position.addScaledVector(_v1, 2.7 * dt);
            npc.yaw = this.dampAngle(
              npc.yaw,
              Math.atan2(_v1.x, _v1.z),
              8,
              dt,
            );
            npc.walkPhase += dt * 6.8;
          }
        }
        if (npc.alertTimer <= 0) {
          npc.alertState = 'patrol';
        }
      } else if (npc.alertState === 'combat') {
        npc.alertTimer -= dt;
        const targetYaw = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        npc.yaw = this.dampAngle(npc.yaw, targetYaw, 10, dt);

        if ((distToPlayer > 7.5 || !inCone) && npc.role !== 'clerk') {
          if (npc.lastKnownPlayerPos) {
            _v1.subVectors(npc.lastKnownPlayerPos, npc.position);
            _v1.y = 0;
            if (_v1.length() > 1.5) {
              _v1.normalize();
              npc.position.addScaledVector(_v1, 3.8 * dt);
              npc.walkPhase += dt * 8.5;
            }
          }
        }

        if (inCone && npc.attackCooldown <= 0) {
          if (npc.role === 'heavy' && distToPlayer < 2.5 && !this.activeVehicle) {
            npc.attackCooldown = 1.3;
            this.onPlayerHit(24);
          } else {
            npc.attackCooldown = npc.role === 'heavy' ? 1.15 : 1.45;
            npc.muzzleTimer = 0.08;
            this.sound.playGunshot(distToPlayer);

            const origin = npc.position
              .clone()
              .add(new THREE.Vector3(0, 1.42, 0));
            const aim = this.playerPos
              .clone()
              .add(new THREE.Vector3(0, this.crouchToggled ? 0.75 : 1.25, 0))
              .sub(origin)
              .normalize();
            aim.x += (Math.random() - 0.5) * 0.07;
            aim.y += (Math.random() - 0.5) * 0.04;
            aim.normalize();

            const bMesh = new THREE.Mesh(this.bulletGeo, this.bulletMat);
            bMesh.position.copy(origin);
            this.scene.add(bMesh);
            this.projectiles.push({
              mesh: bMesh,
              position: origin,
              velocity: aim.multiplyScalar(29),
              fromPlayer: false,
              isSilent: false,
              damage: npc.role === 'heavy' ? 20 : 14,
              life: 2.0,
            });
          }
        }
      }

      npc.position.y = this.getGroundHeightAt(npc.position.x, npc.position.z);
      this.resolveCircleCollisions(npc.position, 0.42);
      npc.rig.root.position.copy(npc.position);
      npc.rig.root.rotation.y = npc.yaw;

      // Pose arms & legs based on state
      const isMoving =
        (!hangingNow &&
          !shelteredInRain &&
          (npc.alertState === 'neutral' || npc.alertState === 'patrol')) ||
        npc.alertState === 'fleeing' ||
        npc.alertState === 'suspicious' ||
        npc.alertState === 'combat';
      const s = isMoving ? Math.sin(npc.walkPhase) * 0.55 : 0;
      npc.rig.leftLeg.rotation.x = s;
      npc.rig.rightLeg.rotation.x = -s;

      npc.rig.leftForearm.rotation.x =
        npc.alertState === 'calling_police'
          ? -1.1
          : hurryingInRain
            ? -1.18
            : 0;
      npc.rig.rightForearm.rotation.x = hangingNow ? -0.45 : 0;

      if (npc.alertState === 'cowering') {
        npc.rig.leftArm.rotation.x = -2.35;
        npc.rig.rightArm.rotation.x = -2.35;
        npc.rig.bodyPivot.position.y = 0.78;
      } else if (npc.alertState === 'fleeing') {
        npc.rig.leftArm.rotation.x = -1.7 + s * 0.6;
        npc.rig.rightArm.rotation.x = -1.7 - s * 0.6;
        npc.rig.bodyPivot.position.y = 0.94;
      } else if (npc.alertState === 'calling_police') {
        npc.rig.leftArm.rotation.x = -1.75;
        npc.rig.rightArm.rotation.x = 0.12;
        npc.rig.bodyPivot.position.y = 0.94;
      } else if (npc.alertState === 'staring') {
        npc.rig.leftArm.rotation.x = -0.25;
        npc.rig.rightArm.rotation.x = -0.18;
        npc.rig.bodyPivot.position.y = 0.94;
      } else if (hangingNow) {
        npc.rig.rightArm.rotation.x = -1.45;
        npc.rig.leftArm.rotation.x = -0.35;
        npc.rig.bodyPivot.position.y = 0.94;
      } else if (
        npc.alertState === 'combat' ||
        npc.alertState === 'threaten'
      ) {
        npc.rig.rightArm.rotation.x = -Math.PI * 0.48;
        npc.rig.leftArm.rotation.x = s * 0.4;
        npc.rig.bodyPivot.position.y = 0.94;
      } else if (hurryingInRain) {
        // Shield head from heavy rain while hurrying for shelter
        npc.rig.leftArm.rotation.x = -1.65;
        npc.rig.rightArm.rotation.x = -s * 0.5;
        npc.rig.bodyPivot.position.y = 0.91;
      } else {
        npc.rig.rightArm.rotation.x = -s * 0.4;
        npc.rig.leftArm.rotation.x = s * 0.4;
        npc.rig.bodyPivot.position.y =
          this.weather === 'rain' && !shelteredInRain ? 0.91 : 0.94;
      }
    }
  }

  private dampAngle(current: number, target: number, lambda: number, dt: number) {
    let diff = target - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return current + diff * (1 - Math.exp(-lambda * dt));
  }

  private updateCamera(dt: number) {
    const presetDist = this.activeVehicle
      ? 6.4
      : this.cameraPreset === 'regen'
        ? 2.4
        : this.cameraPreset === 'wide'
          ? 6.6
          : 4.25;
    const presetShoulder = this.activeVehicle
      ? 0
      : this.cameraPreset === 'regen'
        ? 0.3
        : this.cameraPreset === 'wide'
          ? 0.35
          : 0.72;
    const presetHeight = this.activeVehicle
      ? 2.15
      : this.cameraPreset === 'regen'
        ? 1.28
        : this.cameraPreset === 'wide'
          ? 2.4
          : 1.68;

    const crouchDrop = this.crouchToggled && !this.activeVehicle ? -0.35 : 0;

    const shoulderX = Math.cos(this.camYaw) * presetShoulder;
    const shoulderZ = -Math.sin(this.camYaw) * presetShoulder;

    _lookTarget.set(
      this.playerPos.x + shoulderX * 0.55,
      this.playerPos.y + presetHeight + crouchDrop,
      this.playerPos.z + shoulderZ * 0.55,
    );

    const horizDist = Math.cos(this.camPitch) * presetDist;
    const vertOffset = Math.sin(this.camPitch) * presetDist;

    _camGoal.set(
      _lookTarget.x + Math.sin(this.camYaw) * horizDist + shoulderX * 0.45,
      Math.max(this.playerPos.y + 0.55, _lookTarget.y + vertOffset),
      _lookTarget.z + Math.cos(this.camYaw) * horizDist + shoulderZ * 0.45,
    );

    for (const c of this.colliders) {
      const minY = c.minY ?? 0;
      if (
        c.height > 2 &&
        _camGoal.y >= minY &&
        _camGoal.y <= c.height &&
        _camGoal.x >= c.minX - 0.3 &&
        _camGoal.x <= c.maxX + 0.3 &&
        _camGoal.z >= c.minZ - 0.3 &&
        _camGoal.z <= c.maxZ + 0.3
      ) {
        _camGoal.lerp(_lookTarget, 0.6);
      }
    }

    const lambda = dt >= 0.9 ? 100 : 12;
    this.currentCamPos.lerp(_camGoal, 1 - Math.exp(-lambda * dt));
    this.currentCamLook.lerp(_lookTarget, 1 - Math.exp(-lambda * dt));

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentCamLook);

    const sprinting =
      this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const speedKmh = this.activeVehicle ? Math.abs(this.activeVehicle.speed) * 3.6 : 0;
    const targetFov =
      this.cameraPreset === 'regen'
        ? 48
        : this.activeVehicle
          ? Math.min(76, 58 + speedKmh * 0.16)
          : sprinting
            ? 65
            : 58;
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.damp(
        this.camera.fov,
        targetFov,
        8,
        dt,
      );
      this.camera.updateProjectionMatrix();
    }
  }

  private emitSnapshot() {
    const anyCombat = this.npcs.some(
      (n) => n.alertState === 'combat' || n.alertState === 'threaten',
    );
    const anySuspicious = this.npcs.some(
      (n) => n.alertState === 'suspicious' || n.alertState === 'fleeing',
    );
    const stealthState: StealthState = anyCombat
      ? 'exposed'
      : anySuspicious
        ? 'caution'
        : 'hidden';

    const stealthCandidate = this.getStealthKillCandidate();
    const silenceCandidate = this.getSilenceWitnessCandidate();
    const nearVehicle = this.getNearestVehicle(4.0);
    const talkTarget = this.getTalkCandidate();
    const anyInjured = LIMB_IDS.some(
      (id) => this.limbs[id].condition !== 'intact',
    );
    const zoneName = this.getCurrentZoneName();
    const inBoutique = zoneName === 'Atelier Vex Boutique (Interior)';

    const t = UI_STRINGS[this.language];

    let maxSuspicion = 0;
    let maxCallProgress = 0;
    for (const n of this.npcs) {
      if (n.alertState === 'eliminated') continue;
      if (n.suspicion > maxSuspicion) maxSuspicion = n.suspicion;
      if (n.alertState === 'calling_police') {
        const p = THREE.MathUtils.clamp(1 - n.callTimer / 4.8, 0, 1);
        if (p > maxCallProgress) maxCallProgress = p;
      }
    }

    let contextPrompt: string | null = null;
    const chosenBed = this.chosenHotelRoom
      ? this.hotelVex.rooms[this.chosenHotelRoom].bedPos
      : undefined;
    if (
      this.activeCinematic !== 'none' ||
      this.lockpickMinigameOpen ||
      this.hotelRoomMenuOpen
    ) {
      contextPrompt = null;
    } else if (this.activeVehicle) {
      contextPrompt = t.promptExitCar;
    } else if (
      !this.hotelVex.ledgerStolen &&
      this.hotelVex.suite204Door.unlocked &&
      this.playerPos.distanceTo(this.hotelVex.ledgerPos) < 3.0
    ) {
      contextPrompt = t.promptStealLedger;
    } else if (
      !this.hotelVex.suite204Door.unlocked &&
      this.playerPos.distanceTo(this.hotelVex.suite204Door.doorPos) < 2.8
    ) {
      contextPrompt =
        this.equippedWeapon === 'lockpick'
          ? t.promptPickSuiteDoor
          : t.promptForceSuiteDoor;
    } else if (chosenBed && this.playerPos.distanceTo(chosenBed) < 3.2) {
      contextPrompt = t.promptRestBed;
    } else if (this.playerPos.distanceTo(this.hotelVex.deskPos) < 4.0) {
      contextPrompt = t.promptHotelDesk;
    } else if (silenceCandidate) {
      contextPrompt = `${t.promptSilenceWitness} ${silenceCandidate.name}`;
    } else if (anyInjured && !this.isRegenerating) {
      contextPrompt = t.promptRegen;
    } else if (inBoutique && this.boutiqueGreetingDone) {
      contextPrompt = t.promptChangeOutfit;
    } else if (stealthCandidate && this.wantedLevel > 0) {
      contextPrompt = `${t.promptAssassinate} ${stealthCandidate.name}`;
    } else if (talkTarget) {
      contextPrompt = `${t.promptTalk} ${talkTarget.name}`;
    } else if (nearVehicle) {
      contextPrompt = nearVehicle.locked
        ? this.equippedWeapon === 'lockpick'
          ? t.promptUnlockCar
          : t.promptSmashCar
        : t.promptEnterCar;
    } else if (stealthCandidate) {
      contextPrompt = `${t.promptStrike} ${stealthCandidate.name}`;
    }

    const cosY = Math.cos(-this.camYaw);
    const sinY = Math.sin(-this.camYaw);
    const radarBlips: RadarBlip[] = this.npcs.map((n) => {
      const dx = (n.position.x - this.playerPos.x) / 72;
      const dz = (n.position.z - this.playerPos.z) / 72;
      return {
        id: n.id,
        x: THREE.MathUtils.clamp(dx * cosY - dz * sinY, -0.95, 0.95),
        z: THREE.MathUtils.clamp(dx * sinY + dz * cosY, -0.95, 0.95),
        role: n.role,
        alertState: n.alertState,
      };
    });

    const limbsClone: LimbMap = {
      leftArm: { ...this.limbs.leftArm },
      rightArm: { ...this.limbs.rightArm },
      leftLeg: { ...this.limbs.leftLeg },
      rightLeg: { ...this.limbs.rightLeg },
      torso: { ...this.limbs.torso },
    };

    const activeCaption =
      this.caption && performance.now() - this.caption.timestamp < 5800
        ? this.caption
        : null;

    const deathReason =
      this.deathReasonKey === 'crash'
        ? t.deathCrash
        : this.deathReasonKey === 'combat'
          ? t.deathCombat
          : null;

    this.onSnapshot({
      phase: this.phase,
      language: this.language,
      weather: this.weather,
      weatherVisibilityPct: Math.round(
        WEATHER_CONFIGS[this.weather].sightMult * 100,
      ),
      health: Math.round(this.health),
      maxHealth: this.maxHealth,
      stamina: Math.round(this.stamina),
      wantedLevel: this.wantedLevel,
      equippedWeapon: this.equippedWeapon,
      outfit: this.currentOutfit,
      appearanceMenuOpen: this.appearanceMenuOpen,
      lockpickMinigameOpen: this.lockpickMinigameOpen,
      nearCarLocked: Boolean(nearVehicle?.locked),
      hotelRoomMenuOpen: this.hotelRoomMenuOpen,
      chosenHotelRoom: this.chosenHotelRoom,
      hotelHeistState: this.hotelHeistState,
      policeResponding: this.policeDispatch.active,
      activeCinematic: this.activeCinematic,
      suspicionLevel: maxSuspicion,
      policeCallProgress: maxCallProgress,
      wantedPostersCount: this.wantedPosters.filter((p) => p.posted).length,
      canSilenceWitness: Boolean(silenceCandidate),
      weaponWheelOpen: this.weaponWheelOpen,
      isCrouching: this.crouchToggled,
      isSprinting:
        this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'),
      isRegenerating: this.isRegenerating,
      activeRegenStage: this.activeRegenStage,
      isRagdoll: this.isRagdoll,
      deathReason,
      inVehicle: Boolean(this.activeVehicle),
      vehicleSpeedKmh: this.activeVehicle
        ? Math.round(Math.abs(this.activeVehicle.speed) * 3.6)
        : 0,
      limbs: limbsClone,
      targetsRemaining: this.npcs.filter(
        (n) => n.role === 'target' && n.alertState !== 'eliminated',
      ).length,
      totalTargets: this.npcs.filter((n) => n.role === 'target').length,
      guardsEliminated: this.npcs.filter(
        (n) => n.alertState === 'eliminated',
      ).length,
      totalEnemies: this.npcs.length,
      stealthState,
      currentZone: zoneName,
      contextPrompt,
      talkTarget,
      cameraPreset: this.cameraPreset,
      pointerLocked: this.pointerLocked,
      ttsStatus: this.ttsStatus,
      caption: activeCaption,
      radarBlips,
      kunaiCooldown: Math.min(1, this.kunaiCooldown / 1.1),
      elapsedSeconds: Math.floor(this.elapsedSeconds),
    });
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener(
      'pointerlockchange',
      this.handlePointerLockChange,
    );
    const dom = this.renderer.domElement;
    dom.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    dom.removeEventListener('contextmenu', this.handleContextMenu);
    dom.removeEventListener('webglcontextlost', this.handleWebglLost);

    this.sound.dispose();
    this.textures.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.npcs.forEach((n) => n.rig.disposables.forEach((d) => d.dispose()));
    this.kunaiGeo.dispose();
    this.kunaiMat.dispose();
    this.bulletGeo.dispose();
    this.bulletMat.dispose();
    this.playerBulletMat.dispose();
    this.renderer.dispose();
    if (dom.parentElement === this.container) {
      this.container.removeChild(dom);
    }
  }
}
