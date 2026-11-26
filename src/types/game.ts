export type LimbId = 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'torso';

export type LimbCondition = 'intact' | 'fractured' | 'severed';

export type RegenStage = 'none' | 'bone' | 'flesh' | 'skin' | 'clothing';

export interface LimbStatus {
  condition: LimbCondition;
  regenProgress: number; // 0..1
  stage: RegenStage;
}

export type LimbMap = Record<LimbId, LimbStatus>;

export type CameraPreset = 'combat' | 'wide' | 'regen';

export type WeaponId =
  | 'unarmed'
  | 'blades'
  | 'kunai'
  | 'pistol'
  | 'shotgun'
  | 'lockpick'
  | 'phone';

export type NpcRole =
  | 'civilian'
  | 'clerk'
  | 'guard'
  | 'heavy'
  | 'target'
  | 'police'
  | 'collector'
  | 'poor'
  | 'gentleman'
  | 'inmate'
  | 'marshal';

export type OutfitId =
  | 'tactical'
  | 'street'
  | 'suit'
  | 'worker'
  | 'leather'
  | 'coastal'
  | 'trench'
  | 'cyber';

export type HotelRoomId = '201' | '202' | '203';

export type HotelFloor = 1 | 2 | 3 | 4 | 5 | 6;

export type HotelHeistState = 'none' | 'active' | 'completed';

export type MapId = 'city' | 'coast' | 'sky' | 'prison' | 'plane_incident';

export type VehicleVariant =
  | 'sedan'
  | 'coupe'
  | 'muscle'
  | 'suv'
  | 'pickup'
  | 'van'
  | 'police';

export type ActiveCinematic =
  | 'none'
  | 'boutique_greet'
  | 'silence_kill'
  | 'smash_car_window'
  | 'hotel_checkin'
  | 'bar_wine_serve'
  | 'deliver_wine'
  | 'plane_threat'
  | 'plane_crash_wasted'
  | 'fall_plunge_wasted'
  | 'ocean_dump'
  | 'arrested_transfer';

export type ShopItemId =
  | 'energy_drink'
  | 'bento_meal'
  | 'medkit'
  | 'kevlar_vest'
  | 'ammo_lockpick';

export type ExtraMissionId =
  | 'bank_hack'
  | 'airport_briefcase'
  | 'coast_smuggler'
  | 'sky_relay';

export type NpcAlertState =
  | 'neutral'
  | 'patrol'
  | 'suspicious'
  | 'staring'
  | 'calling_police'
  | 'fighting'
  | 'arrested'
  | 'fleeing'
  | 'cowering'
  | 'threaten'
  | 'combat'
  | 'eliminated';

export type StealthState = 'hidden' | 'caution' | 'exposed';

export type GamePhase = 'intro' | 'briefing' | 'playing' | 'victory' | 'defeat';

export interface VoiceCaption {
  id: number;
  speaker: string;
  role: 'assassin' | 'guard' | 'target' | 'civilian';
  text: string;
  timestamp: number;
}

export interface RadarBlip {
  id: string;
  x: number;
  z: number;
  role: NpcRole;
  alertState: NpcAlertState;
}

export interface TalkTargetInfo {
  id: string;
  name: string;
  role: NpcRole;
  zone: string;
  voiceName: 'Charon' | 'Puck' | 'Kore' | 'Zephyr';
}

export interface DialogueMessage {
  sender: 'player' | 'npc';
  text: string;
}

export type LanguageCode = 'en' | 'es' | 'fr' | 'ja';

export type WeatherType = 'sunny' | 'overcast' | 'rain' | 'fog';

export interface SideMissionItem {
  id: string;
  title: string;
  done: boolean;
}

export interface ArrestedFighterInfo {
  id: string;
  name: string;
  bailCost: number;
}

export interface PrisonNeeds {
  hunger: number;
  energy: number;
  hygiene: number;
  strength: number;
}

export interface GameSnapshot {
  phase: GamePhase;
  language: LanguageCode;
  weather: WeatherType;
  weatherVisibilityPct: number;
  inGameTimeStr: string;
  currentMap: MapId;
  hasPlaneTicketTo: 'coast' | 'sky' | null;
  ticketKioskOpen: boolean;
  policeMenuOpen: boolean;
  arrestedFighters: ArrestedFighterInfo[];
  companionCount: number;
  inHoldingCell: boolean;
  holdingCellBail: number;
  prisonNeeds: PrisonNeeds;
  prisonEscapeProgress: number;
  planeIntegrity: number;
  elevatorRiding: boolean;
  canSurrender: boolean;
  cash: number;
  hasWine: boolean;
  wineDelivered: boolean;
  drunkTimer: number;
  hotelFloor: HotelFloor;
  elevatorMenuOpen: boolean;
  phoneOpen: boolean;
  watchedVideoIds: string[];
  revealedHouses: string[];
  robbedHouses: string[];
  peopleHelped: number;
  suitRewardClaimed: boolean;
  supermarketOpen: boolean;
  inSupermarket: boolean;
  armor: number;
  missionsCompleted: number;
  bankDataHacked: boolean;
  airportBriefcaseRecovered: boolean;
  coastPackageRecovered: boolean;
  skyRelayHacked: boolean;
  activeSideMissions: SideMissionItem[];
  health: number;
  maxHealth: number;
  stamina: number;
  wantedLevel: number; // 0 = normal citizen, 1..3 = wanted
  equippedWeapon: WeaponId;
  outfit: OutfitId;
  appearanceMenuOpen: boolean;
  lockpickMinigameOpen: boolean;
  nearCarLocked: boolean;
  hotelRoomMenuOpen: boolean;
  chosenHotelRoom: HotelRoomId | null;
  hotelHeistState: HotelHeistState;
  policeResponding: boolean;
  activeCinematic: ActiveCinematic;
  suspicionLevel: number; // 0..1 max NPC recognition stare progress
  policeCallProgress: number; // 0..1 active 911 call progress
  wantedPostersCount: number;
  canSilenceWitness: boolean;
  weaponWheelOpen: boolean;
  isCrouching: boolean;
  isSprinting: boolean;
  isRegenerating: boolean;
  activeRegenStage: RegenStage;
  isRagdoll: boolean;
  deathReason: string | null;
  inVehicle: boolean;
  vehicleSpeedKmh: number;
  limbs: LimbMap;
  targetsRemaining: number;
  totalTargets: number;
  guardsEliminated: number;
  totalEnemies: number;
  stealthState: StealthState;
  currentZone: string;
  contextPrompt: string | null;
  talkTarget: TalkTargetInfo | null;
  cameraPreset: CameraPreset;
  pointerLocked: boolean;
  ttsStatus: 'initializing' | 'gemini' | 'fallback';
  caption: VoiceCaption | null;
  radarBlips: RadarBlip[];
  kunaiCooldown: number;
  elapsedSeconds: number;
}

export interface CityCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  height: number;
  vaultable?: boolean;
}

export interface WalkableSurface {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  yStart: number;
  yEnd: number;
  axis: 'flat' | 'x' | 'z';
}

export interface CityLightAnchor {
  x: number;
  y: number;
  z: number;
  color: number;
  intensity: number;
  distance: number;
}

export interface CityZone {
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}
