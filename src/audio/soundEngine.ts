import * as THREE from 'three';
import type { LanguageCode, RegenStage, VoiceCaption, WeatherType } from '../types/game';
import { VOICE_TEXT_BY_LANG } from '../i18n/translations';

export interface VoiceLineDef {
  id: string;
  speaker: string;
  role: 'assassin' | 'guard' | 'target' | 'civilian';
  voiceName: 'Fenrir' | 'Charon' | 'Puck' | 'Kore' | 'Zephyr';
  style: string;
  text: string;
}

export const VOICE_CATALOG: Record<string, VoiceLineDef> = {
  assassin_intro: {
    id: 'assassin_intro',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style:
      'Very deep, gravelly, calm, menacing male assassin baritone voice, slow deliberate cadence',
    text: 'Contracts active across the district. Blend in until it is time to strike.',
  },
  assassin_kill_1: {
    id: 'assassin_kill_1',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style:
      'Very deep, cold, gravelly male assassin baritone voice, quiet menace',
    text: 'Contract closed.',
  },
  assassin_kill_2: {
    id: 'assassin_kill_2',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style:
      'Very deep, gravelly, calm male assassin baritone voice, low whisper',
    text: 'No witnesses. Keep moving.',
  },
  assassin_injured: {
    id: 'assassin_injured',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style:
      'Very deep, strained, gravelly male assassin baritone voice, stoic through pain',
    text: 'Severed flesh means nothing. Watch it grow back.',
  },
  assassin_fracture: {
    id: 'assassin_fracture',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, gravelly, unshaken male assassin baritone voice',
    text: 'A broken bone will not stop the blade.',
  },
  assassin_regen_start: {
    id: 'assassin_regen_start',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style:
      'Very deep, resonant, gravelly male assassin baritone voice, steady intensity',
    text: 'Bone. Flesh. Skin. Whole again.',
  },
  assassin_victory: {
    id: 'assassin_victory',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, cold, satisfied male assassin baritone voice',
    text: 'All targets eliminated. Vanishing into the city.',
  },
  guard_patrol_1: {
    id: 'guard_patrol_1',
    speaker: 'Street Security',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Casual, grounded security guard talking on night shift',
    text: 'Quiet night on the avenue so far. Just another late shift.',
  },
  guard_patrol_2: {
    id: 'guard_patrol_2',
    speaker: 'District Guard',
    role: 'guard',
    voiceName: 'Puck',
    style: 'Relaxed street patrolman chatting casually',
    text: 'Rain is picking up near the Neon Lounge. Might grab coffee on break.',
  },
  guard_patrol_3: {
    id: 'guard_patrol_3',
    speaker: 'Garage Attendant',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Casual, gritty night guard muttering on duty',
    text: 'Couple sedans parked inside Bay 04. Everything looks normal.',
  },
  guard_suspicious: {
    id: 'guard_suspicious',
    speaker: 'Street Enforcer',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Suspicious, tense security guard calling out in the dark',
    text: 'Hey, hold on! What are you doing over there?',
  },
  guard_combat_1: {
    id: 'guard_combat_1',
    speaker: 'Syndicate Enforcer',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Aggressive, urgent tactical guard shouting in combat',
    text: 'Man down! Take him out, open fire!',
  },
  guard_combat_2: {
    id: 'guard_combat_2',
    speaker: 'District Lookout',
    role: 'guard',
    voiceName: 'Puck',
    style: 'Panicked, urgent guard shouting during firefight',
    text: 'He is armed and dangerous! Stop him now!',
  },
  guard_down: {
    id: 'guard_down',
    speaker: 'Street Enforcer',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Weak, defeated gasp of a fallen guard',
    text: 'No... how did he get so close...',
  },
  civ_chat_1: {
    id: 'civ_chat_1',
    speaker: 'City Pedestrian',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Casual everyday city pedestrian talking calmly at night',
    text: 'Hey man, rough weather tonight. Watch out on the wet asphalt.',
  },
  civ_chat_2: {
    id: 'civ_chat_2',
    speaker: 'Night Resident',
    role: 'civilian',
    voiceName: 'Zephyr',
    style: 'Normal, friendly city resident walking home',
    text: 'The Neon Lounge is still open across the street if you need a drink.',
  },
  civ_panic_1: {
    id: 'civ_panic_1',
    speaker: 'Fleeing Civilian',
    role: 'civilian',
    voiceName: 'Zephyr',
    style: 'Terrified, screaming civilian running away in panic',
    text: 'Oh God, he just killed someone! Run! Get out of here!',
  },
  civ_panic_2: {
    id: 'civ_panic_2',
    speaker: 'Panicked Bystander',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Frantic, terrified bystander shouting while fleeing',
    text: 'Someone call for help! He has blood on his hands! Run!',
  },
  clerk_greet: {
    id: 'clerk_greet',
    speaker: 'Store Clerk',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Laid-back late-night convenience store / bar clerk',
    text: 'Evening. Take a look around, just keep the glass intact.',
  },
  clerk_beg: {
    id: 'clerk_beg',
    speaker: 'Terrified Clerk',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Trembling, desperate store clerk begging for his life',
    text: 'Please, do not kill me! Take the cash, take anything, just let me live!',
  },
  clerk_threat: {
    id: 'clerk_threat',
    speaker: 'Armed Store Clerk',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Furious, defensive shopkeeper leveling a shotgun over the counter',
    text: 'Get out of my store right now or I will blow you across the street!',
  },
  target_patrol: {
    id: 'target_patrol',
    speaker: 'Director Vance (Target)',
    role: 'target',
    voiceName: 'Kore',
    style: 'Cold, arrogant corporate syndicate boss voice',
    text: 'Keep the lobby clear for the midnight transfer. I do not want interruptions.',
  },
  target_broker: {
    id: 'target_broker',
    speaker: 'Broker Sera (Target)',
    role: 'target',
    voiceName: 'Zephyr',
    style: 'Sharp, composed underworld broker voice inside the lounge',
    text: 'Pour another round and watch the street entrance.',
  },
  target_captain: {
    id: 'target_captain',
    speaker: 'Captain Kade (Target)',
    role: 'target',
    voiceName: 'Charon',
    style: 'Commanding, heavy mercenary captain voice at the docks',
    text: 'Manifest looks clean. Keep the dockyard floodlights lit.',
  },
  target_panic: {
    id: 'target_panic',
    speaker: 'Syndicate Target',
    role: 'target',
    voiceName: 'Kore',
    style: 'Alarmed, urgent crime boss yelling for bodyguards',
    text: 'Security! Eliminate him right now!',
  },
  assassin_greet: {
    id: 'assassin_greet',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, calm, smooth male baritone greeting politely',
    text: 'Evening, everyone. Just looking for a different look tonight.',
  },
  clerk_boutique: {
    id: 'clerk_boutique',
    speaker: 'Clara (Atelier Vex)',
    role: 'civilian',
    voiceName: 'Zephyr',
    style: 'Warm, welcoming luxury boutique stylist greeting a customer',
    text: 'Welcome to Atelier Vex! Feel free to try on any of our outfits.',
  },
  npc_recognize: {
    id: 'npc_recognize',
    speaker: 'Suspicious Pedestrian',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Startled, realization voice recognizing a wanted face',
    text: 'Wait a second... I know that face! You are the killer on the poster!',
  },
  npc_call_police: {
    id: 'npc_call_police',
    speaker: 'Witness on Phone',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Urgent, panicked voice calling 911 into a smartphone',
    text: '911! I found the wanted killer right here—send officers now!',
  },
  npc_muffled: {
    id: 'npc_muffled',
    speaker: 'Silenced Witness',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Muffled, choked gasp behind a covered mouth',
    text: 'Mmph—! Mmm...!',
  },
  npc_poster_hang: {
    id: 'npc_poster_hang',
    speaker: 'Flyer Worker',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Casual street worker putting up police wanted posters',
    text: 'Police just dropped off these wanted flyers. Keep an eye out for this guy.',
  },
  assassin_window_pain: {
    id: 'assassin_window_pain',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, pained, gravelly male assassin baritone grunting through glass cut',
    text: 'Agh... shattered glass tore right into my forearm.',
  },
  driver_curse_1: {
    id: 'driver_curse_1',
    speaker: 'Angry Driver',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Furious road-rage driver shouting out the car window',
    text: 'Hey! Watch where the f*** you are walking, a**hole!',
  },
  driver_curse_2: {
    id: 'driver_curse_2',
    speaker: 'Furious Commuter',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Irritable driver yelling angrily after slamming the brakes',
    text: 'Get the h*** out of the road before I flatten your a**!',
  },
  driver_curse_3: {
    id: 'driver_curse_3',
    speaker: 'Road-Rage Driver',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Loud, exasperated driver cursing out the windshield',
    text: 'Are you blind, motherf***er?! Move out of the street!',
  },
  driver_swerve_1: {
    id: 'driver_swerve_1',
    speaker: 'Swerving Driver',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Panicked, furious driver yanking the wheel while swearing',
    text: 'F***! Watch your lane, you f***ing idiot!',
  },
  driver_swerve_2: {
    id: 'driver_swerve_2',
    speaker: 'Commuter Driver',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Alarmed, angry driver shouting while swerving hard',
    text: 'Move, a**hole! Are you trying to get us both killed?!',
  },
  driver_fight_1: {
    id: 'driver_fight_1',
    speaker: 'Furious Driver',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Aggressive driver stepping out of car ready to throw punches',
    text: 'You f***ing scraped my bumper! Step out and fight me!',
  },
  driver_fight_2: {
    id: 'driver_fight_2',
    speaker: 'Angry Motorist',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Heated motorist yelling right before throwing a punch',
    text: 'You cut me off, you piece of s***! Come here!',
  },
  fight_blame_1: {
    id: 'fight_blame_1',
    speaker: 'Fighter A',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Defensive, panicked voice pointing and blaming the other guy to police',
    text: 'Officer, he started it! He swerved into me and swung first!',
  },
  fight_blame_2: {
    id: 'fight_blame_2',
    speaker: 'Fighter B',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Frantic, indignant voice trying to shift blame onto the other fighter',
    text: 'Don’t listen to him! He started it! Arrest him, not me!',
  },
  police_halt: {
    id: 'police_halt',
    speaker: 'LCPD Officer',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Commanding, booming police officer breaking up a street brawl',
    text: 'Police! Break it up right now! Both of you, hands where I can see them!',
  },
  police_arrest: {
    id: 'police_arrest',
    speaker: 'LCPD Officer',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Firm, no-nonsense police officer cuffing two suspects',
    text: 'Save it for the precinct. He started, he started—you are both under arrest!',
  },
  hotel_concierge_greet: {
    id: 'hotel_concierge_greet',
    speaker: 'Concierge (Hotel Vex)',
    role: 'civilian',
    voiceName: 'Zephyr',
    style: 'Refined, courteous luxury hotel concierge at the marble front desk',
    text: 'Good evening, and welcome to Hotel Vex. Which suite would you prefer tonight?',
  },
  assassin_hotel_reply: {
    id: 'assassin_hotel_reply',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, calm, smooth male assassin baritone at check-in desk',
    text: 'I need a quiet room for the night. Show me the open suites.',
  },
  hotel_heist_intel: {
    id: 'hotel_heist_intel',
    speaker: 'Handler Intel',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, crisp tactical whisper delivering a new hotel heist contract',
    text: 'Suite key registered. Syndicate courier is inside Suite 204—infiltrate it and steal the encrypted ledger.',
  },
  assassin_heist_done: {
    id: 'assassin_heist_done',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, satisfied, gravelly male assassin baritone',
    text: 'Encrypted Obsidian Ledger secured. Time to slip out clean.',
  },
  civ_weather_sunny: {
    id: 'civ_weather_sunny',
    speaker: 'City Pedestrian',
    role: 'civilian',
    voiceName: 'Zephyr',
    style: 'Relaxed, cheerful pedestrian enjoying clear sunny weather',
    text: 'Clear skies finally. Feels good to stroll down the avenue without a coat.',
  },
  civ_weather_rain: {
    id: 'civ_weather_rain',
    speaker: 'Hurrying Pedestrian',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Hurried, annoyed pedestrian ducking out of sudden rain',
    text: 'Damn rain—better duck under cover before I get soaked!',
  },
  guard_weather_fog: {
    id: 'guard_weather_fog',
    speaker: 'District Guard',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Tense, squinting night guard peering into thick fog',
    text: 'Cannot see ten meters in this fog... stay sharp on the perimeter.',
  },
  guard_weather_sunny: {
    id: 'guard_weather_sunny',
    speaker: 'Street Security',
    role: 'guard',
    voiceName: 'Charon',
    style: 'Alert, composed guard scanning a clear street',
    text: 'Bright and clear across the block. Keep your eyes peeled.',
  },
  bartender_serve_wine: {
    id: 'bartender_serve_wine',
    speaker: 'Leo (Lounge Bartender)',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Smooth, hospitable late-night bartender pouring vintage wine across the counter',
    text: 'Here you go, friend. House reserve vintage—drink it whenever you like, or deliver it whole.',
  },
  assassin_drink_wine: {
    id: 'assassin_drink_wine',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, calm, gravelly male assassin baritone savoring vintage wine',
    text: 'Smooth vintage. Keeps the nerves steady for the night ahead.',
  },
  suit_man_greet: {
    id: 'suit_man_greet',
    speaker: 'Julian Ravenscroft',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Refined, wealthy gentleman in a tailored suit speaking inside his marble villa',
    text: 'Good evening. Bring me a bottle of reserve wine from the Neon Lounge and I will arm you well.',
  },
  suit_man_no_wine: {
    id: 'suit_man_no_wine',
    speaker: 'Julian Ravenscroft',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Polite, expectant gentleman in a suit reminding a guest',
    text: 'Bring a vintage bottle from the Neon Lounge bar first, and my private armory is yours.',
  },
  suit_man_reward: {
    id: 'suit_man_reward',
    speaker: 'Julian Ravenscroft',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Delighted, aristocratic gentleman rewarding a courier with custom weapons',
    text: 'Exquisite vintage. As promised—take my custom arsenal and six hundred in cash.',
  },
  poor_beg_1: {
    id: 'poor_beg_1',
    speaker: 'Struggling Citizen',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Humble, weary, shivering pedestrian asking politely for help on the street',
    text: 'Spare a little cash if you can... I have not had a warm meal in days.',
  },
  poor_grateful_1: {
    id: 'poor_grateful_1',
    speaker: 'Grateful Citizen',
    role: 'civilian',
    voiceName: 'Zephyr',
    style: 'Overjoyed, deeply thankful voice after receiving money on the street',
    text: 'Thank you so much! You have no idea how much this helps me tonight.',
  },
  poor_grateful_2: {
    id: 'poor_grateful_2',
    speaker: 'Grateful Citizen',
    role: 'civilian',
    voiceName: 'Puck',
    style: 'Warm, relieved, heartfelt gratitude from someone helped out of poverty',
    text: 'Bless you, stranger! I will never forget your kindness tonight.',
  },
  collector_chat_1: {
    id: 'collector_chat_1',
    speaker: 'Sanitation Worker',
    role: 'civilian',
    voiceName: 'Charon',
    style: 'Steady, working-class sanitation crew worker hauling alley trash bags',
    text: 'Clearing the alley dumpsters before morning traffic rolls in.',
  },
  burglary_loot: {
    id: 'burglary_loot',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, quiet, composed male assassin baritone pocketing cash from a cracked safe',
    text: 'Safe cracked. Cash secured.',
  },
  side_mission_done: {
    id: 'side_mission_done',
    speaker: 'Vesper (Assassin)',
    role: 'assassin',
    voiceName: 'Fenrir',
    style: 'Very deep, focused male assassin baritone completing a side contract',
    text: 'Encrypted drive recovered. Side contract complete.',
  },
};

interface ActiveSpatialVoice {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  pannerNode: StereoPannerNode;
  npcId: string;
}

const _tmpVec = new THREE.Vector3();
const _rightVec = new THREE.Vector3();

export function computeDistanceGain(distance: number): number {
  if (distance >= 52) return 0;
  return THREE.MathUtils.clamp(
    1.1 / (1 + Math.pow(Math.max(0, distance - 2.0) / 7.2, 1.55)),
    0,
    1.15,
  );
}

export class SoundAndVoiceEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rainNode: AudioNode | null = null;
  private rainGainNode: GainNode | null = null;
  private rainFilterNode: BiquadFilterNode | null = null;
  private currentWeather: WeatherType = 'sunny';
  private muted = false;
  private audioBufferCache = new Map<string, AudioBuffer>();
  private loadingIds = new Set<string>();
  private ttsStatus: 'initializing' | 'gemini' | 'fallback' = 'initializing';
  private lastVoiceTime = 0;
  private lastNpcSpeakTime = 0;
  private captionSeq = 0;
  private onCaption?: (caption: VoiceCaption) => void;
  private onStatusChange?: (
    status: 'initializing' | 'gemini' | 'fallback',
  ) => void;
  private activeAssassinSource: AudioBufferSourceNode | null = null;
  private activeNpcVoices: ActiveSpatialVoice[] = [];
  private language: LanguageCode = 'en';

  constructor(
    onCaption?: (caption: VoiceCaption) => void,
    onStatusChange?: (status: 'initializing' | 'gemini' | 'fallback') => void,
  ) {
    this.onCaption = onCaption;
    this.onStatusChange = onStatusChange;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.88;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : 0.88,
        this.ctx.currentTime,
        0.04,
      );
    }
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getTtsStatus() {
    return this.ttsStatus;
  }

  public setLanguage(lang: LanguageCode) {
    this.language = lang;
  }

  private getLocalizedText(lineId: string, fallbackText: string): string {
    if (this.language === 'en') return fallbackText;
    return VOICE_TEXT_BY_LANG[this.language]?.[lineId] || fallbackText;
  }

  public startAmbience() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.rainNode) return;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.075;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = this.currentWeather === 'rain' ? 1320 : 720;
    bandpass.Q.value = 0.6;

    const rainGain = ctx.createGain();
    rainGain.gain.value =
      this.currentWeather === 'rain'
        ? 0.2
        : this.currentWeather === 'fog'
          ? 0.025
          : this.currentWeather === 'overcast'
            ? 0.014
            : 0.0;

    noise.connect(bandpass);
    bandpass.connect(rainGain);
    rainGain.connect(this.masterGain);
    noise.start();

    this.rainNode = noise;
    this.rainGainNode = rainGain;
    this.rainFilterNode = bandpass;
  }

  public setWeatherAmbience(weather: WeatherType) {
    this.currentWeather = weather;
    if (!this.ctx || !this.rainGainNode || !this.rainFilterNode) return;
    const now = this.ctx.currentTime;
    const targetGain =
      weather === 'rain'
        ? 0.2
        : weather === 'fog'
          ? 0.025
          : weather === 'overcast'
            ? 0.014
            : 0.0;
    const targetFreq =
      weather === 'rain' ? 1320 : weather === 'fog' ? 560 : 880;
    this.rainGainNode.gain.setTargetAtTime(targetGain, now, 0.7);
    this.rainFilterNode.frequency.setTargetAtTime(targetFreq, now, 0.7);
  }

  public playWeatherTransition(weather: WeatherType) {
    if (weather !== 'rain') return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    // Subtle distant thunder roll when rain moves in
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(58, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 1.6);
    lp.type = 'lowpass';
    lp.frequency.value = 140;
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.14, now + 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    osc.connect(lp);
    lp.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.85);
  }

  public stopAmbience() {
    if (this.rainNode && 'stop' in this.rainNode) {
      try {
        (this.rainNode as AudioBufferSourceNode).stop();
      } catch {
        // ignore
      }
    }
    this.rainNode = null;
    this.rainGainNode = null;
    this.rainFilterNode = null;
  }

  public async prewarmVoices() {
    const priorityIds = [
      'assassin_intro',
      'assassin_regen_start',
      'assassin_injured',
      'assassin_kill_1',
      'civ_chat_1',
      'civ_panic_1',
      'clerk_beg',
      'clerk_threat',
      'guard_patrol_1',
      'guard_combat_1',
      'target_patrol',
    ];

    try {
      const healthRes = await fetch('/api/health');
      const health = (await healthRes.json()) as { ttsReady?: boolean };
      if (!health.ttsReady) {
        this.ttsStatus = 'fallback';
        this.onStatusChange?.('fallback');
        return;
      }
    } catch {
      this.ttsStatus = 'fallback';
      this.onStatusChange?.('fallback');
      return;
    }

    const results = await Promise.allSettled(
      priorityIds.map((id) => this.fetchTtsBuffer(id)),
    );
    const anyLoaded = results.some(
      (r) => r.status === 'fulfilled' && r.value !== null,
    );
    this.ttsStatus = anyLoaded ? 'gemini' : 'fallback';
    this.onStatusChange?.(this.ttsStatus);

    const remaining = Object.keys(VOICE_CATALOG).filter(
      (id) => !priorityIds.includes(id),
    );
    for (const id of remaining) {
      void this.fetchTtsBuffer(id);
    }
  }

  private async fetchTtsBuffer(lineId: string): Promise<AudioBuffer | null> {
    const cacheKey = `${this.language}:${lineId}`;
    if (this.audioBufferCache.has(cacheKey)) {
      return this.audioBufferCache.get(cacheKey) || null;
    }
    if (this.loadingIds.has(cacheKey)) return null;
    const def = VOICE_CATALOG[lineId];
    if (!def) return null;

    this.loadingIds.add(cacheKey);
    try {
      const text = this.getLocalizedText(lineId, def.text);
      const buf = await this.synthesizeRawTts(
        text,
        def.voiceName,
        def.style,
      );
      if (buf) {
        this.audioBufferCache.set(cacheKey, buf);
      }
      return buf;
    } finally {
      this.loadingIds.delete(cacheKey);
    }
  }

  private async synthesizeRawTts(
    text: string,
    voiceName: VoiceLineDef['voiceName'],
    style: string,
  ): Promise<AudioBuffer | null> {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName, style }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { audioBase64?: string };
      if (!data.audioBase64) return null;

      const ctx = this.ensureContext();
      if (!ctx) return null;

      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoded = await ctx.decodeAudioData(bytes.buffer.slice(0));
      if (this.ttsStatus !== 'gemini') {
        this.ttsStatus = 'gemini';
        this.onStatusChange?.('gemini');
      }
      return decoded;
    } catch {
      return null;
    }
  }

  public updateSpatialVoices(
    playerPos: THREE.Vector3,
    camYaw: number,
    getNpcPos: (npcId: string) => THREE.Vector3 | null,
  ) {
    if (!this.ctx || this.activeNpcVoices.length === 0) return;
    const now = this.ctx.currentTime;
    _rightVec.set(Math.cos(camYaw), 0, -Math.sin(camYaw));

    for (const v of this.activeNpcVoices) {
      const npcPos = getNpcPos(v.npcId);
      if (!npcPos) continue;
      const dist = npcPos.distanceTo(playerPos);
      const gain = computeDistanceGain(dist);
      _tmpVec.subVectors(npcPos, playerPos).setY(0);
      const pan =
        _tmpVec.lengthSq() > 0.01
          ? THREE.MathUtils.clamp(_tmpVec.normalize().dot(_rightVec), -0.9, 0.9)
          : 0;

      v.gainNode.gain.setTargetAtTime(gain, now, 0.045);
      v.pannerNode.pan.setTargetAtTime(pan, now, 0.045);
    }
  }

  public speak(
    lineId: string,
    opts?: { npcId?: string; distance?: number; pan?: number; force?: boolean },
  ) {
    const def = VOICE_CATALOG[lineId];
    if (!def) return;

    const now = performance.now();
    const isNpc = def.role !== 'assassin';
    if (!opts?.force) {
      if (now - this.lastVoiceTime < 1100) return;
      if (isNpc && now - this.lastNpcSpeakTime < 2000) return;
    }

    const distance = opts?.distance ?? 0;
    if (isNpc && distance > 46) return;

    this.lastVoiceTime = now;
    if (isNpc) this.lastNpcSpeakTime = now;

    const localizedText = this.getLocalizedText(lineId, def.text);

    if (!isNpc || distance <= 32) {
      this.onCaption?.({
        id: ++this.captionSeq,
        speaker: def.speaker,
        role: def.role,
        text: localizedText,
        timestamp: now,
      });
    }

    if (this.muted) return;

    const cacheKey = `${this.language}:${lineId}`;
    const cached = this.audioBufferCache.get(cacheKey);
    if (cached) {
      this.playVoiceBuffer(
        cached,
        def.role,
        opts?.npcId,
        distance,
        opts?.pan ?? 0,
      );
      return;
    }

    void this.fetchTtsBuffer(lineId);
    this.speakWebSpeech({ ...def, text: localizedText }, distance);
  }

  public async speakDynamicText(
    speaker: string,
    role: 'assassin' | 'guard' | 'target' | 'civilian',
    voiceName: VoiceLineDef['voiceName'],
    text: string,
    opts?: { npcId?: string; distance?: number; pan?: number },
  ) {
    const distance = opts?.distance ?? 1.5;
    this.onCaption?.({
      id: ++this.captionSeq,
      speaker,
      role,
      text,
      timestamp: performance.now(),
    });
    if (this.muted) return;

    const style =
      role === 'civilian'
        ? 'Natural open-world street conversation'
        : role === 'target'
          ? 'Guarded, tense syndicate boss speaking'
          : 'Gritty street security talking';

    const buf = await this.synthesizeRawTts(text, voiceName, style);
    if (buf) {
      this.playVoiceBuffer(buf, role, opts?.npcId, distance, opts?.pan ?? 0);
    } else {
      this.speakWebSpeech(
        { id: 'dyn', speaker, role, voiceName, style, text },
        distance,
      );
    }
  }

  private playVoiceBuffer(
    buffer: AudioBuffer,
    role: VoiceLineDef['role'],
    npcId: string | undefined,
    distance: number,
    pan: number,
  ) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    if (this.activeAssassinSource && role === 'assassin') {
      try {
        this.activeAssassinSource.stop();
      } catch {
        // ignore
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const gainNode = ctx.createGain();
    const distAtten =
      role === 'assassin' ? 1.15 : computeDistanceGain(distance);
    gainNode.gain.value = distAtten;

    if (role === 'assassin') {
      src.playbackRate.value = 0.92;

      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.value = 145;
      lowShelf.gain.value = 8.0;

      const midScoop = ctx.createBiquadFilter();
      midScoop.type = 'peaking';
      midScoop.frequency.value = 950;
      midScoop.Q.value = 1.2;
      midScoop.gain.value = -2.5;

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 4;

      src.connect(lowShelf);
      lowShelf.connect(midScoop);
      midScoop.connect(comp);
      comp.connect(gainNode);
      gainNode.connect(this.masterGain);
      this.activeAssassinSource = src;
    } else {
      const pannerNode = ctx.createStereoPanner();
      pannerNode.pan.value = Math.max(-0.9, Math.min(0.9, pan));
      src.connect(pannerNode);
      pannerNode.connect(gainNode);
      gainNode.connect(this.masterGain);

      if (npcId) {
        const entry: ActiveSpatialVoice = {
          source: src,
          gainNode,
          pannerNode,
          npcId,
        };
        this.activeNpcVoices.push(entry);
        src.onended = () => {
          const idx = this.activeNpcVoices.indexOf(entry);
          if (idx !== -1) this.activeNpcVoices.splice(idx, 1);
        };
      }
    }

    src.start();
  }

  private speakWebSpeech(def: VoiceLineDef, distance: number) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      const synth = window.speechSynthesis;
      if (def.role === 'assassin') {
        synth.cancel();
      } else if (synth.speaking) {
        return;
      }

      const utter = new SpeechSynthesisUtterance(def.text);
      const bcp47 =
        this.language === 'es'
          ? 'es-ES'
          : this.language === 'fr'
            ? 'fr-FR'
            : this.language === 'ja'
              ? 'ja-JP'
              : 'en-US';
      utter.lang = bcp47;
      const voices = synth.getVoices();
      const langPrefix = this.language;
      const langVoices = voices.filter((v) =>
        v.lang.toLowerCase().startsWith(langPrefix),
      );
      const pool = langVoices.length > 0 ? langVoices : voices;
      if (pool.length > 0) {
        if (def.role === 'assassin') {
          const deep =
            pool.find((v) =>
              /daniel|george|david|mark|alex|jorge|pablo|male|uk|en-gb/i.test(
                v.name,
              ),
            ) || pool[0];
          utter.voice = deep;
        } else if (def.role === 'target') {
          const sharp =
            pool.find((v) =>
              /samantha|victoria|karen|zira|monica|paulina|female/i.test(v.name),
            ) || pool[0];
          utter.voice = sharp;
        } else {
          utter.voice = pool[pool.length > 1 ? 1 : 0];
        }
      }

      if (def.role === 'assassin') {
        utter.pitch = 0.28;
        utter.rate = 0.84;
        utter.volume = 0.95;
      } else {
        utter.pitch = def.role === 'target' ? 1.15 : 0.96;
        utter.rate = 1.02;
        utter.volume = Math.max(
          0.05,
          Math.min(0.95, computeDistanceGain(distance)),
        );
      }
      synth.speak(utter);
    } catch {
      // ignore
    }
  }

  public playFootstep(crouch: boolean, sprint: boolean) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(crouch ? 75 : sprint ? 120 : 95, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.06);
    gain.gain.setValueAtTime(crouch ? 0.035 : sprint ? 0.1 : 0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  public playSlash() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;

    const len = Math.floor(ctx.sampleRate * 0.14);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.13);
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
  }

  public playKunaiThrow() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.11);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playPistolShot(distance = 0) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const atten = distance <= 0 ? 1 : Math.max(0.08, computeDistanceGain(distance));

    const len = Math.floor(ctx.sampleRate * 0.11);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2600, now);
    bp.Q.value = 1.1;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.32 * atten, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    src.connect(bp);
    bp.connect(g);
    g.connect(this.masterGain);
    src.start(now);
  }

  public playShotgunBlast(distance = 0) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const atten = distance <= 0 ? 1 : Math.max(0.1, computeDistanceGain(distance));

    const len = Math.floor(ctx.sampleRate * 0.28);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2400, now);
    lp.frequency.exponentialRampToValueAtTime(160, now + 0.27);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.46 * atten, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    src.connect(lp);
    lp.connect(g);
    g.connect(this.masterGain);
    src.start(now);
  }

  public playStealthKill() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;

    this.playSlash();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.28);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  public playGunshot(distance: number) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const atten = Math.max(0.06, computeDistanceGain(distance));

    const len = Math.floor(ctx.sampleRate * 0.16);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1900, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.32 * atten, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
  }

  public playGlassShatter() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;

    const len = Math.floor(ctx.sampleRate * 0.32);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / ctx.sampleRate;
      const burst = Math.sin(t * 28000) + Math.sin(t * 17500) + (Math.random() * 2 - 1);
      d[i] = burst * 0.33 * Math.pow(1 - i / len, 1.9);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2600;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    src.connect(hp);
    hp.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);

    // Three cascading crystalline pings
    for (let k = 0; k < 4; k++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const start = now + k * 0.045;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3400 + k * 680 + Math.random() * 400, start);
      g.gain.setValueAtTime(0.08, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + 0.13);
    }
  }

  public playMetalCrash(intensity = 1) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const amp = THREE.MathUtils.clamp(intensity, 0.25, 1.4);

    const len = Math.floor(ctx.sampleRate * 0.38);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(640, now);
    bp.Q.value = 1.4;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.45 * amp, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.masterGain);
    src.start(now);

    const thud = ctx.createOscillator();
    const tg = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(115, now);
    thud.frequency.exponentialRampToValueAtTime(28, now + 0.28);
    tg.gain.setValueAtTime(0.45 * amp, now);
    tg.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    thud.connect(tg);
    tg.connect(this.masterGain);
    thud.start(now);
    thud.stop(now + 0.31);
  }

  public playCarDoor() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playSlowMo(entering: boolean) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(entering ? 420 : 140, now);
    osc.frequency.exponentialRampToValueAtTime(entering ? 95 : 360, now + 0.22);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playDeathWasted() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;

    // Signature dramatic low-end boom + descending sub-bass + eerie chord swell
    const boom = ctx.createOscillator();
    const bg = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(160, now);
    boom.frequency.exponentialRampToValueAtTime(32, now + 1.25);
    bg.gain.setValueAtTime(0.58, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
    boom.connect(bg);
    bg.connect(this.masterGain);
    boom.start(now);
    boom.stop(now + 1.4);

    // Metallic reverberant sting
    for (const freq of [196, 233.08, 293.66]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(920, now);
      lp.frequency.exponentialRampToValueAtTime(180, now + 1.5);
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.94, now + 1.5);
      g.gain.setValueAtTime(0.09, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      osc.connect(lp);
      lp.connect(g);
      g.connect(this.masterGain);
      osc.start(now + 0.04);
      osc.stop(now + 1.65);
    }
  }

  public playBoneBreak() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;

    const len = Math.floor(ctx.sampleRate * 0.12);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = i < 180 ? 1 : Math.pow(1 - i / len, 3);
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1450;
    bp.Q.value = 2.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.45, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.masterGain);
    src.start(now);

    const sub = ctx.createOscillator();
    const sg = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(135, now);
    sub.frequency.exponentialRampToValueAtTime(38, now + 0.18);
    sg.gain.setValueAtTime(0.35, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    sub.connect(sg);
    sg.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.2);
  }

  public playSever() {
    this.playSlash();
    this.playBoneBreak();
  }

  public playRegenStage(stage: RegenStage) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted || stage === 'none') return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (stage === 'bone') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    } else if (stage === 'flesh') {
      osc.type = 'sawtooth';
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(240, now);
      lp.frequency.exponentialRampToValueAtTime(620, now + 0.45);
      osc.frequency.setValueAtTime(92, now);
      osc.frequency.linearRampToValueAtTime(126, now + 0.45);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.52);
      return;
    } else if (stage === 'skin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(510, now + 0.32);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    } else {
      osc.type = 'square';
      const lp = ctx.createBiquadFilter();
      lp.type = 'bandpass';
      lp.frequency.value = 1200;
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.25);
      return;
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playOutfitSwap() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(900, now);
    bp.frequency.exponentialRampToValueAtTime(2200, now + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.masterGain);
    src.start(now);
  }

  public playPosterSlap() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.08);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.24, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.masterGain);
    src.start(now);
  }

  public playPhoneDial() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const t0 = now + i * 0.09;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 2 ? 941 : 697 + i * 73, t0);
      g.gain.setValueAtTime(0.11, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t0);
      osc.stop(t0 + 0.075);
    }
  }

  public playMuffledStruggle() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.35);
    lp.type = 'lowpass';
    lp.frequency.value = 340;
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc.connect(lp);
    lp.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.44);
  }

  public playDumpsterThud() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(125, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.24);
    g.gain.setValueAtTime(0.42, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.27);
  }

  public playCarHorn() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    for (const freq of [392, 494]) {
      const osc = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      lp.type = 'lowpass';
      lp.frequency.value = 1650;
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.14, now + 0.03);
      g.gain.setValueAtTime(0.14, now + 0.34);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
      osc.connect(lp);
      lp.connect(g);
      g.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.46);
    }
  }

  public playCarAlarm() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t0 = now + i * 0.24;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1180, t0);
      osc.frequency.setValueAtTime(880, t0 + 0.09);
      g.gain.setValueAtTime(0.12, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t0);
      osc.stop(t0 + 0.19);
    }
  }

  public playCarUnlock() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    for (const [offset, freq] of [
      [0, 1420],
      [0.09, 1980],
    ]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + offset);
      g.gain.setValueAtTime(0.16, now + offset);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.09);
    }
  }

  public playLockpickTick(success = true) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = success ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(success ? 1280 : 210, now);
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCensorBleep() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime + 0.42;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    g.gain.setValueAtTime(0.11, now);
    g.gain.setValueAtTime(0.11, now + 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playPoliceSiren() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.linearRampToValueAtTime(1180, now + 0.42);
    osc.frequency.linearRampToValueAtTime(640, now + 0.84);
    osc.frequency.linearRampToValueAtTime(1180, now + 1.26);
    osc.frequency.linearRampToValueAtTime(640, now + 1.68);
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.11, now + 0.08);
    g.gain.setValueAtTime(0.1, now + 1.45);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.72);
    osc.connect(lp);
    lp.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.75);
  }

  public playPunchImpact() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
    g.gain.setValueAtTime(0.32, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playHotelChime() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    for (const [offset, freq] of [
      [0, 1046.5],
      [0.12, 1318.5],
    ]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + offset);
      g.gain.setValueAtTime(0.14, now + offset);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.55);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.56);
    }
  }

  public playHeistPickup() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    for (const [offset, freq] of [
      [0, 523.25],
      [0.08, 659.25],
      [0.16, 783.99],
      [0.24, 1046.5],
    ]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + offset);
      g.gain.setValueAtTime(0.16, now + offset);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.34);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.35);
    }
  }

  public playWinePour() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.48);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.sin((i / len) * Math.PI);
      const glug = 0.55 + 0.45 * Math.sin(i * 0.015);
      d[i] = (Math.random() * 2 - 1) * env * glug;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(650, now);
    bp.frequency.exponentialRampToValueAtTime(1240, now + 0.45);
    bp.Q.value = 3.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.masterGain);
    src.start(now);
  }

  public playCoinChime() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    for (const [offset, freq] of [
      [0, 1318.5],
      [0.07, 1760],
    ]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + offset);
      g.gain.setValueAtTime(0.14, now + offset);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.26);
    }
  }

  public playElevatorDing() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1174.66, now);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.68);
  }

  public playPhoneClick() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1650, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.045);
    g.gain.setValueAtTime(0.11, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playBirdFlutter() {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t0 = now + i * 0.075;
      const len = Math.floor(ctx.sampleRate * 0.05);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < len; j++) {
        d[j] = (Math.random() * 2 - 1) * Math.sin((j / len) * Math.PI);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1800;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.09, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      src.start(t0);
    }
  }

  public dispose() {
    this.stopAmbience();
    this.activeNpcVoices = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
