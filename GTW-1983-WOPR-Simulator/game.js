/**
 * ============================================================================
 * W.O.P.R. (WAR OPERATION PLAN RESPONSE) // GLOBAL THERMONUCLEAR WAR (1983)
 * Complete NORAD Cheyenne Mountain Strategic Simulator & IMSAI 8080 Terminal
 * ============================================================================
 * Phase 1: IMSAI 8080 Sunnyvale War-Dialer (311-555-4855), Bell 103 300-Baud
 *          Modem Handshake, LOGON: Joshua, 1983 Film Dialogue, 15-Game Catalog,
 *          Side Selection (USA vs USSR), and 4 Authentic 1983 War Plans.
 * Phase 2: High-Resolution Vector World Map (Mercator & Arctic Polar Views),
 *          BMEWS Early-Warning Radar Domes (Thule, Clear, Fylingdales, Pechora),
 *          DEFCON 5 -> 1 Illuminated Tower, Full Strategic Triad (ICBM Silo Wings,
 *          Stealth SSBNs, Airborne Alert Bombers, ABM Batteries, DSP/Oko Satellites),
 *          MIRV Bus Separation, EMP Disruption, Fallout Plumes & Live BDA Ticker.
 * Phase 3: WOPR [C P E 1 7 0 4 T K S] Autonomous Launch Code Tumbler Lock &
 *          Tic-Tac-Toe (NUMBER OF PLAYERS: 0) Self-Play Finale.
 * ============================================================================
 */

const WoprAudio = (() => {
    let ctx = null;
    let enabled = true;

    function getCtx() {
        if (!enabled) return null;
        if (!ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                try { ctx = new AudioCtx(); } catch (_) { ctx = null; }
            }
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        return ctx;
    }

    function beep(freq = 880, duration = 0.045, type = 'square', gainVal = 0.05) {
        const c = getCtx();
        if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(gainVal, now);
        g.gain.exponentialRampToValueAtTime(0.0008, now + duration);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(now);
        osc.stop(now + duration);
    }

    // Authentic DTMF Dial Tone for 1983 Sunnyvale War-Dialing
    const DTMF_MAP = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '0': [941, 1336], '-': [440, 440]
    };

    function playDtmf(digit, offsetSec = 0) {
        const c = getCtx();
        if (!c) return;
        const pair = DTMF_MAP[digit];
        if (!pair) return;
        const start = c.currentTime + offsetSec;
        const dur = 0.075;
        pair.forEach(freq => {
            const osc = c.createOscillator();
            const g = c.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            g.gain.setValueAtTime(0.04, start);
            g.gain.exponentialRampToValueAtTime(0.001, start + dur);
            osc.connect(g);
            g.connect(c.destination);
            osc.start(start);
            osc.stop(start + dur);
        });
    }

    // Authentic 1983 Acoustic Coupler Modem Handshake (300 Baud Bell 103)
    function modemHandshake300Baud(numberStr = '3115554855') {
        const c = getCtx();
        if (!c) return;
        const cleanDigits = String(numberStr).replace(/[^0-9]/g, '');
        cleanDigits.split('').forEach((d, idx) => {
            playDtmf(d, idx * 0.085);
        });

        const carrierStart = c.currentTime + cleanDigits.length * 0.085 + 0.12;
        // Bell 103 Answer Mark Tone (2225 Hz) + FSK 1070/1270/2025/2225 Hz bursts
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2225, carrierStart);
        const fskFreqs = [2225, 2025, 1270, 1070, 2225, 1270, 2025, 2225, 1070, 2225];
        fskFreqs.forEach((f, i) => {
            osc.frequency.setValueAtTime(f, carrierStart + 0.25 + i * 0.045);
        });
        g.gain.setValueAtTime(0.001, carrierStart);
        g.gain.linearRampToValueAtTime(0.065, carrierStart + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, carrierStart + 0.75);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(carrierStart);
        osc.stop(carrierStart + 0.76);
    }

    function launchSound() {
        const c = getCtx();
        if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.36);
        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.39);
    }

    function mirvSplitSound() {
        beep(1480, 0.035, 'square', 0.04);
        setTimeout(() => beep(1760, 0.035, 'square', 0.04), 45);
        setTimeout(() => beep(2080, 0.045, 'square', 0.04), 90);
    }

    function abmSound() {
        const c = getCtx();
        if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(1950, now + 0.18);
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    function explosionSound(isEmp = false) {
        const c = getCtx();
        if (!c) return;
        const dur = isEmp ? 0.65 : 0.52;
        const bufferSize = Math.floor(c.sampleRate * dur);
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.18));
        }
        const noise = c.createBufferSource();
        noise.buffer = buffer;

        const filter = c.createBiquadFilter();
        filter.type = isEmp ? 'bandpass' : 'lowpass';
        filter.frequency.setValueAtTime(isEmp ? 820 : 260, c.currentTime);
        filter.frequency.exponentialRampToValueAtTime(65, c.currentTime + dur);

        const g = c.createGain();
        g.gain.setValueAtTime(0.24, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.005, c.currentTime + dur);

        noise.connect(filter);
        filter.connect(g);
        g.connect(c.destination);
        noise.start();
    }

    function klaxon(defconLevel) {
        const c = getCtx();
        if (!c) return;
        if (defconLevel <= 2) {
            const pulses = defconLevel === 1 ? 3 : 2;
            for (let i = 0; i < pulses; i++) {
                setTimeout(() => {
                    beep(580, 0.16, 'sawtooth', 0.09);
                    setTimeout(() => beep(410, 0.20, 'sawtooth', 0.09), 165);
                }, i * 390);
            }
        } else {
            beep(520, 0.11, 'triangle', 0.06);
            setTimeout(() => beep(660, 0.11, 'triangle', 0.06), 120);
        }
    }

    function radarPing() {
        beep(340, 0.06, 'sine', 0.02);
    }

    function tumblerTone(locked = false) {
        if (locked) {
            beep(880, 0.09, 'square', 0.06);
            setTimeout(() => beep(1320, 0.14, 'square', 0.06), 60);
        } else {
            beep(420 + Math.random() * 260, 0.025, 'square', 0.025);
        }
    }

    function overloadDischarge() {
        const c = getCtx();
        if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(3200, now + 0.9);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.96);
        setTimeout(() => explosionSound(true), 450);
    }

    return {
        beep,
        modemHandshake300Baud,
        launchSound,
        mirvSplitSound,
        abmSound,
        explosionSound,
        klaxon,
        radarPing,
        tumblerTone,
        overloadDischarge,
        toggle() {
            enabled = !enabled;
            return enabled;
        },
        isEnabled() {
            return enabled;
        }
    };
})();

/* ============================================================================
 * ACCURATE LATITUDE / LONGITUDE VECTOR WORLD COASTLINE POLYGONS
 * ============================================================================ */
const WorldVectorCoastlines = [
    // North America Mainland (Alaska -> Canada -> US East Coast -> Mexico -> US West Coast)
    [
        [70, -162], [71, -156], [70, -140], [69, -125], [68, -110], [66, -95],
        [63, -82], [60, -64], [53, -56], [47, -60], [44, -66], [41, -70],
        [39, -74], [35, -75], [30, -81], [25, -80], [29, -85], [29, -95],
        [22, -97], [18, -94], [16, -88], [10, -84], [9, -79], [16, -99],
        [23, -106], [32, -117], [38, -123], [48, -125], [55, -133], [60, -142],
        [61, -150], [55, -162], [60, -166], [65, -168], [70, -162]
    ],
    // Greenland
    [
        [60, -44], [66, -36], [72, -22], [78, -18], [83, -32], [82, -55],
        [76, -70], [69, -54], [63, -51], [60, -44]
    ],
    // Baffin & Canadian Arctic Archipelago
    [
        [64, -76], [72, -78], [74, -88], [70, -94], [66, -84], [64, -76]
    ],
    [
        [75, -95], [81, -88], [82, -70], [77, -78], [75, -95]
    ],
    // Iceland
    [
        [63.5, -23], [66.3, -22], [66.2, -14.5], [63.8, -15], [63.5, -23]
    ],
    // United Kingdom & Ireland
    [
        [50.1, -5.2], [53.4, -3.0], [58.6, -3.1], [57.5, -1.8], [52.8, 1.7],
        [51.1, 1.3], [50.1, -5.2]
    ],
    [
        [51.5, -9.8], [55.2, -7.3], [53.3, -6.1], [51.5, -9.8]
    ],
    // Cuba
    [
        [23.1, -84.5], [22.5, -79.0], [20.0, -74.2], [21.5, -81.0], [23.1, -84.5]
    ],
    // Europe & Scandinavia
    [
        [36, -9], [43, -9], [43, -2], [48, -4], [51, 2], [54, 8], [57, 10],
        [55, 12], [54, 19], [59, 24], [60, 29], [66, 25], [61, 18], [56, 15],
        [59, 10], [58, 6], [62, 5], [68, 14], [71, 26], [70, 31], [68, 40],
        [65, 40], [67, 46], [69, 60], [60, 58], [47, 40], [45, 34], [46, 30],
        [41, 29], [38, 24], [40, 19], [45, 13], [40, 18], [38, 15], [43, 10],
        [43, 4], [37, -1], [36, -9]
    ],
    // USSR / Eurasia / Asia Mainland
    [
        [70, 31], [69, 40], [68, 54], [70, 66], [73, 70], [73, 84], [77, 104],
        [73, 114], [72, 130], [70, 150], [69, 170], [66, -171], [62, 178],
        [60, 164], [51, 157], [58, 160], [61, 154], [59, 142], [53, 141],
        [43, 132], [38, 128], [35, 127], [39, 125], [40, 120], [35, 120],
        [31, 122], [23, 114], [20, 107], [10, 106], [14, 100], [16, 95],
        [22, 89], [8, 78], [20, 72], [25, 66], [26, 56], [22, 59], [13, 45],
        [28, 34], [31, 32], [36, 36], [41, 29], [42, 41], [47, 39], [60, 58],
        [70, 31]
    ],
    // Novaya Zemlya (USSR Arctic Nuclear Test Site)
    [
        [70.5, 53], [73.5, 55], [76.8, 68], [75.0, 62], [70.5, 53]
    ],
    // Japan (Hokkaido & Honshu)
    [
        [45.4, 141.9], [43.3, 145.6], [42.0, 140.5], [45.4, 141.9]
    ],
    [
        [41.2, 140.8], [35.6, 140.8], [34.5, 135.4], [33.5, 130.4], [37.5, 137.2], [41.2, 140.8]
    ],
    // South America
    [
        [11, -75], [10, -62], [5, -52], [-1, -48], [-6, -35], [-15, -39],
        [-23, -43], [-35, -54], [-52, -68], [-54, -71], [-42, -74], [-18, -71],
        [-5, -81], [4, -77], [11, -75]
    ],
    // Africa
    [
        [35, -6], [37, 10], [32, 24], [31, 32], [12, 44], [11, 51], [2, 45],
        [-10, 40], [-25, 33], [-34, 18], [-18, 12], [-5, 12], [4, 9],
        [5, -8], [15, -17], [25, -15], [35, -6]
    ],
    // Australia
    [
        [-12, 131], [-12, 142], [-20, 149], [-28, 153], [-38, 146], [-35, 136],
        [-32, 115], [-21, 114], [-15, 124], [-12, 131]
    ]
];

/* ============================================================================
 * 1983 WOPR GAME CATALOG & WAR SCENARIOS
 * ============================================================================ */
const WOPR_GAME_CATALOG = [
    "FALKEN'S MAZE",
    "BLACK JACK",
    "GIN RUMMY",
    "HEARTS",
    "BRIDGE",
    "CHECKERS",
    "CHESS",
    "POKER",
    "FIGHTER COMBAT",
    "GUERRILLA ENGAGEMENT",
    "DESERT WARFARE",
    "AIR-TO-GROUND ACTIONS",
    "THEATERWIDE TACTICAL WARFARE",
    "THEATERWIDE BIOTOXIC AND CHEMICAL WARFARE",
    "GLOBAL THERMONUCLEAR WAR"
];

const WOPR_SIM_SCENARIOS = [
    "US FIRST STRIKE",
    "USSR FIRST STRIKE",
    "NATO TACTICAL ESCALATION",
    "WARSAW PACT BREAKTHROUGH",
    "NORTH ATLANTIC GIUK ESCALATION",
    "FIRST STRIKE DECAPITATION",
    "SIOP-62 FULL RETALIATION",
    "FULDA GAP ARMORED THRUST",
    "PERSIAN GULF INTERDICTION",
    "BERING STRAIT INCURSION",
    "CUBAN PROVOCATION",
    "KOREAN DMZ ESCALATION",
    "SEATO DECAPITATION",
    "ARCTIC DEW LINE BLINDING",
    "SINO-SOVIET BORDER ESCALATION",
    "ENGLISH CHANNEL BLOCKADE",
    "MEDITERRANEAN SIXTH FLEET CLASH",
    "BALTIC AMPHIBIOUS ASSAULT",
    "CARIBBEAN NAVAL QUARANTINE",
    "INADVERTENT RADAR ESCALATION",
    "SUBMARINE SLBM DECAPITATION",
    "MOSCOW ABM SATURATION",
    "CHEYENNE MOUNTAIN BUSTING",
    "DEFCON 1 TOTAL EXCHANGE"
];

const SUNNYVALE_WARDIAL_NUMBERS = [
    { number: "311-555-4850", desc: "NO CARRIER (VOICE LINE)", isWopr: false },
    { number: "311-555-4851", desc: "BANK OF AMERICA AUTODIAL", isWopr: false },
    { number: "311-555-4852", desc: "PAN AM RESERVATIONS SYSTEM", isWopr: false },
    { number: "311-555-4853", desc: "SUNNYVALE HIGH SCHOOL VAX (BIOLOGY GRADES)", isWopr: false },
    { number: "311-555-4854", desc: "NO CARRIER (BUSY TONE)", isWopr: false },
    { number: "311-555-4855", desc: "CARRIER 300 BAUD BELL 103 -> [WOPR / JOSHUA]", isWopr: true },
    { number: "311-555-4856", desc: "PROTOVISION DEVELOPMENT MODEM", isWopr: false },
    { number: "311-555-4857", desc: "PACIFIC BELL TEST TONE", isWopr: false }
];

/* ============================================================================
 * MAIN WOPR STRATEGIC SIMULATOR ENGINE
 * ============================================================================ */
const WoprGame = (() => {
    const PHASE = {
        DIAL_LOGON: 'DIAL_LOGON',
        JOSHUA_CHAT: 'JOSHUA_CHAT',
        SELECT_SIDE: 'SELECT_SIDE',
        SELECT_SCENARIO: 'SELECT_SCENARIO',
        STRATEGIC_BOARD: 'STRATEGIC_BOARD',
        CHESS: 'CHESS',
        TTT_FINALE: 'TTT_FINALE'
    };

    let currentPhase = PHASE.DIAL_LOGON;
    let gameMode = 'MOVIE'; // 'MOVIE' (1983 Film Experience) | 'WARGAME' (Play to Win Strategic Sandbox)
    let movieStepIndex = 0;
    let imsaiFullscreen = false;
    let wargameOutcome = null; // null | { title, subtitle, winner }
    let elapsedSimSeconds = 0;
    let defcon = 5;
    let playerSide = 'USA';
    let currentScenario = 'SIOP62';
    let projectionMode = 'MERCATOR'; // 'MERCATOR' | 'POLAR'
    let themeIndex = 0;
    const themes = ['cyan', 'green', 'amber'];
    let crtFxEnabled = true;
    let autoAbm = true;
    let radarAngle = 0;
    let empInterference = 0;

    // Selected friendly Triad unit ID for interactive targeting
    let selectedUnitId = null;

    // Active simulation entities
    const activeMissiles = [];
    const activeInterceptors = [];
    const explosions = [];
    const falloutPlumes = [];
    let totalMegatonsDetonated = 0;

    // CPE 1704 TKS Launch Code Tumbler Lock State
    const CPE_CODE = ['C', 'P', 'E', '1', '7', '0', '4', 'T', 'K', 'S'];
    let cpeLockedCount = 0;
    let cpeActive = false;
    let cpeInterval = null;
    let cpeSpinTimer = null;

    // Tic-Tac-Toe (0-Player / 1-Player) Finale State
    let tttBoard = Array(9).fill('');
    let tttTurn = 'X';
    let tttZeroPlayerTimer = null;
    let tttDraws = 0;
    let tttSpeedMs = 260;
    let tttMode = 0; // 0 = WOPR vs WOPR, 1 = Human vs WOPR

    // Strategic Triad Order of Battle & Targets
    let units = [];
    let radars = [];
    let satellites = [];
    let commandBunkers = [];
    let cities = [];
    let casualtiesMillions = { USA: 0.0, USSR: 0.0 };
    let commandAuthority = { USA: 100, USSR: 100 };

    function buildInitialOrderOfBattle() {
        casualtiesMillions = { USA: 0.0, USSR: 0.0 };
        commandAuthority = { USA: 100, USSR: 100 };
        totalMegatonsDetonated = 0;
        empInterference = 0;
        wargameOutcome = null;
        elapsedSimSeconds = 0;
        activeMissiles.length = 0;
        activeInterceptors.length = 0;
        explosions.length = 0;
        falloutPlumes.length = 0;

        // 1. BMEWS Early Warning Radar Domes
        radars = [
            { id: 'RAD_THULE', name: 'THULE BMEWS', side: 'USA', lat: 76.5, lon: -68.7, alive: true, rangeDeg: 26 },
            { id: 'RAD_CLEAR', name: 'CLEAR ALASKA BMEWS', side: 'USA', lat: 64.3, lon: -149.2, alive: true, rangeDeg: 25 },
            { id: 'RAD_FYLING', name: 'FYLINGDALES UK BMEWS', side: 'USA', lat: 54.4, lon: -0.7, alive: true, rangeDeg: 24 },
            { id: 'RAD_PECHORA', name: 'PECHORA DARYAL RADAR', side: 'USSR', lat: 65.2, lon: 57.3, alive: true, rangeDeg: 28 }
        ];

        // 2. Strategic Triad Units (ICBM Silos, SSBN Submarines, Bomber Wings, ABM Batteries)
        units = [
            // USA ICBM Silo Wings
            { id: 'USA_SILO_MALMSTROM', name: 'MALMSTROM AFB (MINUTEMAN III)', side: 'USA', type: 'SILO', lat: 47.5, lon: -111.2, missiles: 3, mirv: 3, yieldMt: 1.2, alive: true, stealth: false },
            { id: 'USA_SILO_MINOT', name: 'MINOT AFB (MINUTEMAN III)', side: 'USA', type: 'SILO', lat: 48.4, lon: -101.3, missiles: 3, mirv: 3, yieldMt: 1.2, alive: true, stealth: false },
            { id: 'USA_SILO_WARREN', name: 'F.E. WARREN (PEACEKEEPER MX)', side: 'USA', type: 'SILO', lat: 41.1, lon: -104.8, missiles: 3, mirv: 3, yieldMt: 3.0, alive: true, stealth: false },
            { id: 'USA_SILO_WHITEMAN', name: 'WHITEMAN AFB (MINUTEMAN II)', side: 'USA', type: 'SILO', lat: 38.7, lon: -93.5, missiles: 3, mirv: 2, yieldMt: 1.2, alive: true, stealth: false },

            // USSR ICBM Silo Wings
            { id: 'USSR_SILO_DOMBAROVSKY', name: 'DOMBAROVSKY (SS-18 SATAN)', side: 'USSR', type: 'SILO', lat: 50.8, lon: 59.5, missiles: 3, mirv: 3, yieldMt: 5.0, alive: true, stealth: false },
            { id: 'USSR_SILO_KOZELSK', name: 'KOZELSK (SS-19 STILETTO)', side: 'USSR', type: 'SILO', lat: 54.0, lon: 35.8, missiles: 3, mirv: 3, yieldMt: 2.5, alive: true, stealth: false },
            { id: 'USSR_SILO_KARTALY', name: 'KARTALY (SS-18 SATAN)', side: 'USSR', type: 'SILO', lat: 53.0, lon: 60.6, missiles: 3, mirv: 3, yieldMt: 5.0, alive: true, stealth: false },
            { id: 'USSR_SILO_UZHUR', name: 'UZHUR (SS-18 SATAN)', side: 'USSR', type: 'SILO', lat: 55.3, lon: 89.8, missiles: 3, mirv: 3, yieldMt: 5.0, alive: true, stealth: false },

            // USA SSBN Ballistic Submarines (Stealth until launch)
            { id: 'USA_SSBN_OHIO', name: 'USS OHIO (TRIDENT SSBN-726)', side: 'USA', type: 'SSBN', lat: 49.0, lon: -156.0, missiles: 3, mirv: 3, yieldMt: 1.5, alive: true, stealth: true },
            { id: 'USA_SSBN_MICHIGAN', name: 'USS MICHIGAN (GIUK TRIDENT)', side: 'USA', type: 'SSBN', lat: 60.5, lon: -29.0, missiles: 3, mirv: 3, yieldMt: 1.5, alive: true, stealth: true },
            { id: 'USA_SSBN_FLORIDA', name: 'USS FLORIDA (ARCTIC TRIDENT)', side: 'USA', type: 'SSBN', lat: 69.0, lon: 5.0, missiles: 3, mirv: 3, yieldMt: 1.5, alive: true, stealth: true },

            // USSR SSBN Ballistic Submarines (Stealth until launch)
            { id: 'USSR_SSBN_TK208', name: 'TK-208 TYPHOON (BARENTS SEA)', side: 'USSR', type: 'SSBN', lat: 73.2, lon: 38.5, missiles: 3, mirv: 3, yieldMt: 2.0, alive: true, stealth: true },
            { id: 'USSR_SSBN_TK202', name: 'TK-202 TYPHOON (N. ATLANTIC)', side: 'USSR', type: 'SSBN', lat: 51.0, lon: -39.0, missiles: 3, mirv: 3, yieldMt: 2.0, alive: true, stealth: true },
            { id: 'USSR_SSBN_K51', name: 'K-51 DELTA-IV (OKHOTSK)', side: 'USSR', type: 'SSBN', lat: 54.5, lon: 148.0, missiles: 3, mirv: 3, yieldMt: 1.8, alive: true, stealth: true },

            // USA Strategic Bomber Wings & F-15 Interceptors
            { id: 'USA_B52_ARCTIC', name: 'B-52H WING (CHROME DOME)', side: 'USA', type: 'BOMBER', lat: 71.0, lon: -136.0, baseLat: 71.0, baseLon: -136.0, orbitPhase: 0.2, missiles: 2, mirv: 2, yieldMt: 1.0, alive: true, stealth: false },
            { id: 'USA_B52_GIUK', name: 'B-52H WING (GIUK REFLEX)', side: 'USA', type: 'BOMBER', lat: 64.0, lon: -44.0, baseLat: 64.0, baseLon: -44.0, orbitPhase: 1.7, missiles: 2, mirv: 2, yieldMt: 1.0, alive: true, stealth: false },
            { id: 'USA_F15_NORAD', name: 'F-15 INTERCEPTOR SQDN (NORAD)', side: 'USA', type: 'BOMBER', lat: 62.5, lon: -145.0, baseLat: 62.5, baseLon: -145.0, orbitPhase: 3.1, missiles: 2, mirv: 1, yieldMt: 0.5, alive: true, stealth: false },

            // USSR Strategic Bomber Wings & Interceptors
            { id: 'USSR_TU95_POLAR', name: 'TU-95 BEAR-H (ARCTIC ALERT)', side: 'USSR', type: 'BOMBER', lat: 75.0, lon: 76.0, baseLat: 75.0, baseLon: 76.0, orbitPhase: 0.8, missiles: 2, mirv: 2, yieldMt: 1.2, alive: true, stealth: false },
            { id: 'USSR_TU160_KOLA', name: 'TU-160 BLACKJACK (KOLA WING)', side: 'USSR', type: 'BOMBER', lat: 70.0, lon: 25.0, baseLat: 70.0, baseLon: 25.0, orbitPhase: 2.4, missiles: 2, mirv: 2, yieldMt: 1.5, alive: true, stealth: false },
            { id: 'USSR_MIG31_PVO', name: 'MIG-31 FOXHOUND (PVO STRANY)', side: 'USSR', type: 'BOMBER', lat: 66.5, lon: 44.0, baseLat: 66.5, baseLon: 44.0, orbitPhase: 4.2, missiles: 2, mirv: 1, yieldMt: 0.5, alive: true, stealth: false },

            // ABM / Air Defense Batteries
            { id: 'USA_ABM_GRANDFORKS', name: 'SPRINT/SPARTAN ABM (N. DAKOTA)', side: 'USA', type: 'ABM', lat: 47.9, lon: -97.4, interceptors: 6, alive: true },
            { id: 'USA_ABM_CHEYENNE', name: 'CHEYENNE MTN POINT ABM', side: 'USA', type: 'ABM', lat: 39.2, lon: -104.8, interceptors: 4, alive: true },
            { id: 'USSR_ABM_MOSCOW', name: 'A-135 MOSCOW GALOSH ABM', side: 'USSR', type: 'ABM', lat: 56.1, lon: 37.6, interceptors: 6, alive: true },
            { id: 'USSR_ABM_LENINGRAD', name: 'S-300P LENINGRAD ABM', side: 'USSR', type: 'ABM', lat: 59.9, lon: 30.3, interceptors: 4, alive: true }
        ];

        // 3. Reconnaissance & Early Warning Satellites (DSP / Oko)
        satellites = [
            { id: 'SAT_DSP11', name: 'DSP-11 EARLY WARNING', side: 'USA', lat: 45, lon: -100, speedLon: 0.18, inclination: 58, phase: 0.4 },
            { id: 'SAT_DSP14', name: 'DSP-14 INFRARED SAT', side: 'USA', lat: 30, lon: 15, speedLon: 0.16, inclination: 62, phase: 2.2 },
            { id: 'SAT_OKO1', name: 'OKO US-KS EARLY WARNING', side: 'USSR', lat: 55, lon: 48, speedLon: 0.19, inclination: 65, phase: 1.1 },
            { id: 'SAT_KOSMOS', name: 'KOSMOS-1500 RECON SAT', side: 'USSR', lat: 62, lon: 120, speedLon: 0.21, inclination: 70, phase: 3.8 }
        ];

        // 4. Command Bunkers (Decapitation Targets)
        commandBunkers = [
            { id: 'CMD_CHEYENNE', name: 'CHEYENNE MOUNTAIN (NORAD)', side: 'USA', lat: 38.7, lon: -104.9, alive: true, authWeight: 45 },
            { id: 'CMD_PENTAGON', name: 'PENTAGON / NMCC', side: 'USA', lat: 38.9, lon: -77.1, alive: true, authWeight: 35 },
            { id: 'CMD_OFFUTT', name: 'OFFUTT AFB (SAC HQ)', side: 'USA', lat: 41.1, lon: -95.9, alive: true, authWeight: 20 },
            { id: 'CMD_KREMLIN', name: 'KREMLIN / RAMENKI-43', side: 'USSR', lat: 55.7, lon: 37.6, alive: true, authWeight: 45 },
            { id: 'CMD_SEVEROMORSK', name: 'SEVEROMORSK FLEET HQ', side: 'USSR', lat: 69.1, lon: 33.4, alive: true, authWeight: 25 },
            { id: 'CMD_KOSVINSKY', name: 'KOSVINSKY MTN (DEAD HAND)', side: 'USSR', lat: 59.5, lon: 59.1, alive: true, authWeight: 30 }
        ];

        // 5. Population Centers (Countervalue Targets)
        cities = [
            { id: 'CITY_NYC', name: 'NEW YORK', side: 'USA', lat: 40.7, lon: -74.0, popM: 16.5, hit: false },
            { id: 'CITY_DC', name: 'WASHINGTON D.C.', side: 'USA', lat: 38.9, lon: -77.0, popM: 5.4, hit: false },
            { id: 'CITY_CHI', name: 'CHICAGO', side: 'USA', lat: 41.9, lon: -87.6, popM: 8.2, hit: false },
            { id: 'CITY_LA', name: 'LOS ANGELES', side: 'USA', lat: 34.1, lon: -118.2, popM: 11.5, hit: false },
            { id: 'CITY_SEA', name: 'SEATTLE', side: 'USA', lat: 47.6, lon: -122.3, popM: 3.2, hit: false },
            { id: 'CITY_HOU', name: 'HOUSTON', side: 'USA', lat: 29.8, lon: -95.4, popM: 4.4, hit: false },

            { id: 'CITY_MOS', name: 'MOSCOW', side: 'USSR', lat: 55.8, lon: 37.6, popM: 13.5, hit: false },
            { id: 'CITY_LEN', name: 'LENINGRAD', side: 'USSR', lat: 59.9, lon: 30.3, popM: 6.8, hit: false },
            { id: 'CITY_KIEV', name: 'KIEV', side: 'USSR', lat: 50.4, lon: 30.5, popM: 4.8, hit: false },
            { id: 'CITY_VLAD', name: 'VLADIVOSTOK', side: 'USSR', lat: 43.1, lon: 131.9, popM: 2.6, hit: false },
            { id: 'CITY_NOVO', name: 'NOVOSIBIRSK', side: 'USSR', lat: 55.0, lon: 82.9, popM: 3.9, hit: false },
            { id: 'CITY_MURM', name: 'MURMANSK', side: 'USSR', lat: 68.9, lon: 33.1, popM: 1.9, hit: false }
        ];

        // Select default first friendly unit
        const firstFriendly = units.find(u => u.side === playerSide && u.alive && u.type !== 'ABM');
        selectedUnitId = firstFriendly ? firstFriendly.id : null;

        renderTriadRoster();
        updateBdaTicker();
    }

    /* ========================================================================
     * DOM HELPERS & LOGGING
     * ======================================================================== */
    const elContent = () => document.getElementById('content');
    const elInput = () => document.getElementById('command-input');
    const elPrompt = () => document.getElementById('prompt');
    const elCanvas = () => document.getElementById('war-canvas');

    function log(msg, style = 'joshua') {
        const container = elContent();
        if (!container) return;
        const div = document.createElement('div');
        div.className = `log-entry log-${style}`;
        div.textContent = msg;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        WoprAudio.beep(style === 'error' ? 260 : (style === 'joshua' ? 1080 : 820), 0.025, 'square', 0.028);
    }

    function setDefcon(level) {
        const clamped = Math.max(1, Math.min(5, level));
        if (clamped !== defcon) {
            defcon = clamped;
            WoprAudio.klaxon(defcon);
        }
        for (let i = 1; i <= 5; i++) {
            const lamp = document.getElementById(`defcon-${i}`);
            if (lamp) lamp.classList.toggle('active', i === defcon);
        }
        if (defcon === 1 && gameMode === 'MOVIE' && !cpeActive && cpeLockedCount === 0) {
            // In 1983 Movie Mode, initiate WOPR CPE 1704 TKS launch code lock pressure at DEFCON 1!
            startCpeTumblerSequence();
        }
    }

    function setGameMode(mode) {
        gameMode = mode === 'WARGAME' ? 'WARGAME' : 'MOVIE';
        wargameOutcome = null;
        const btnMovie = document.getElementById('btn-mode-movie');
        const btnWar = document.getElementById('btn-mode-wargame');
        if (btnMovie) btnMovie.classList.toggle('active', gameMode === 'MOVIE');
        if (btnWar) btnWar.classList.toggle('active', gameMode === 'WARGAME');

        if (gameMode === 'WARGAME') {
            stopCpeTumblerSequence();
            closeTicTacToeModal();
            if (imsaiFullscreen) toggleImsaiFullscreen(false);
            switchLeftTab('triad');
            currentPhase = PHASE.STRATEGIC_BOARD;
            log('========================================================', 'success');
            log('[MODE: STRATEGIC WARGAMER — PLAY TO WIN]', 'success');
            log('MOVIE CUTSCENES DISABLED. DESTROY ALL ENEMY LAUNCHERS OR REDUCE ENEMY COMMAND AUTHORITY TO 0% TO WIN!', 'joshua');
        } else {
            switchLeftTab('terminal');
            log('========================================================', 'joshua');
            log('[MODE: 1983 WARGAMES MOVIE EXPERIENCE]', 'joshua');
            log('CLICK [▶ NEXT 1983 MOVIE SCENE] OR TYPE COMMANDS TO EXPERIENCE THE 1983 FILM SEQUENCE.', 'system');
        }
        WoprAudio.beep(920, 0.05);
    }

    function toggleImsaiFullscreen(forceState = null) {
        imsaiFullscreen = typeof forceState === 'boolean' ? forceState : !imsaiFullscreen;
        document.body.classList.toggle('imsai-fullscreen', imsaiFullscreen);
        const btn = document.getElementById('btn-imsai-fullscreen');
        if (btn) {
            btn.classList.toggle('active', imsaiFullscreen);
            btn.textContent = imsaiFullscreen ? '🖥️ SHOW NORAD BIG BOARD' : '🖥️ IMSAI 8080 CRT';
        }
        setTimeout(resizeCanvas, 50);
    }

    function playNextMovieStep() {
        if (gameMode !== 'MOVIE') setGameMode('MOVIE');
        const steps = [
            () => dialSunnyvale('311-555-4855'),
            () => processTerminalCommand('JOSHUA'),
            () => processTerminalCommand('LIST GAMES'),
            () => processTerminalCommand('GLOBAL THERMONUCLEAR WAR'),
            () => processTerminalCommand('2'),
            () => processTerminalCommand('LAS VEGAS, SEATTLE'),
            () => startCpeTumblerSequence(),
            () => openTicTacToeModal(true)
        ];
        const fn = steps[movieStepIndex % steps.length];
        movieStepIndex++;
        fn();
    }

    function switchLeftTab(tabName) {
        ['terminal', 'triad', 'wardial'].forEach(t => {
            const btn = document.getElementById(`tab-btn-${t}`);
            const view = document.getElementById(`subview-${t}`);
            if (btn) btn.classList.toggle('active', t === tabName);
            if (view) view.classList.toggle('active', t === tabName);
        });
    }

    /* ========================================================================
     * PHASE 1: IMSAI 8080 WAR-DIALER & JOSHUA TERMINAL DIALOGUE
     * ======================================================================== */
    function renderWarDialList() {
        const listEl = document.getElementById('wardial-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        SUNNYVALE_WARDIAL_NUMBERS.forEach(item => {
            const row = document.createElement('div');
            row.className = `wardial-row ${item.isWopr ? 'carrier-hit' : ''}`;
            row.innerHTML = `<span>${item.number}</span><span>${item.desc}</span>`;
            row.onclick = () => dialSunnyvale(item.number);
            listEl.appendChild(row);
        });
    }

    function dialSunnyvale(numberStr) {
        switchLeftTab('terminal');
        WoprAudio.modemHandshake300Baud(numberStr);
        const carrierTxt = document.getElementById('modem-carrier-text');
        if (carrierTxt) carrierTxt.textContent = `DIALING: ${numberStr}`;

        log(`[IMSAI 8080] ATDT ${numberStr} (300 BAUD BELL 103)...`, 'system');
        const entry = SUNNYVALE_WARDIAL_NUMBERS.find(n => n.number === numberStr);

        setTimeout(() => {
            if (!entry || entry.isWopr || numberStr.includes('4855')) {
                if (carrierTxt) carrierTxt.textContent = `CARRIER: 311-555-4855`;
                currentPhase = PHASE.DIAL_LOGON;
                if (elPrompt()) elPrompt().textContent = 'LOGON:>';
                log('CONNECT 300 BAUD (CARRIER DETECTED — SUNNYVALE/CHEYENNE NODE)', 'success');
                log('LOGON: (TYPE "JOSHUA", "HELP LOGON", "HELP GAMES", OR "LIST GAMES")', 'joshua');
            } else {
                log(`[${numberStr}] ${entry.desc}`, 'warning');
            }
        }, 420);
    }

    function startAutoWarDial() {
        switchLeftTab('wardial');
        SUNNYVALE_WARDIAL_NUMBERS.forEach((item, idx) => {
            setTimeout(() => {
                WoprAudio.beep(600 + idx * 90, 0.04, 'sine', 0.03);
                if (item.isWopr) {
                    dialSunnyvale(item.number);
                }
            }, idx * 180);
        });
    }

    function processTerminalCommand(rawInput) {
        const cmd = String(rawInput || '').trim().toUpperCase();
        if (!cmd) return;

        log(`> ${cmd}`, 'dim');

        // Universal commands available in any phase
        if (cmd === 'RESET') {
            stopCpeTumblerSequence();
            buildInitialOrderOfBattle();
            setDefcon(5);
            currentPhase = PHASE.DIAL_LOGON;
            if (elPrompt()) elPrompt().textContent = 'LOGON:>';
            log('SYSTEM RESET. WOPR MAINFRAME RETURNED TO DEFCON 5.', 'system');
            log('LOGON:', 'joshua');
            return;
        }

        if (cmd.startsWith('DIAL ') || cmd === '311-555-4855') {
            const num = cmd.replace('DIAL ', '').trim() || '311-555-4855';
            dialSunnyvale(num);
            return;
        }

        if (cmd === 'HELP LOGON') {
            log('HELP NOT AVAILABLE', 'joshua');
            return;
        }

        if (cmd === 'HELP GAMES' || cmd === 'HELP') {
            log("'GAMES' REFERS TO MODELS, SIMULATIONS AND GAMES WHICH HAVE TACTICAL AND STRATEGIC APPLICATIONS.", 'joshua');
            return;
        }

        if (cmd === 'LIST GAMES') {
            WOPR_GAME_CATALOG.forEach(g => log(`  ${g}`, 'joshua'));
            return;
        }

        if (cmd === 'JOSHUA' || cmd === 'LOGON: JOSHUA' || cmd === 'LOGON JOSHUA') {
            WoprAudio.modemHandshake300Baud('4855');
            currentPhase = PHASE.JOSHUA_CHAT;
            if (elPrompt()) elPrompt().textContent = 'JOSHUA>';
            log('GREETINGS PROFESSOR FALKEN.', 'joshua');
            log('HOW ARE YOU FEELING TODAY?', 'joshua');
            log('SHALL WE PLAY A GAME?', 'joshua');
            return;
        }

        if (cmd.includes('HOW ARE YOU') || cmd.includes('HELLO') || cmd.includes('FINE')) {
            log("EXCELLENT. IT'S BEEN A LONG TIME. CAN YOU EXPLAIN THE REMOVAL OF YOUR USER ACCOUNT NUMBER ON JUNE 23, 1973?", 'joshua');
            log('("PEOPLE SOMETIMES MAKE MISTAKES.")', 'dim');
            return;
        }

        if (cmd.includes('MISTAKE')) {
            log('YES THEY DO. SHALL WE PLAY A GAME?', 'joshua');
            return;
        }

        if (cmd === 'CHESS' || cmd === 'PLAY CHESS') {
            currentPhase = PHASE.CHESS;
            if (elPrompt()) elPrompt().textContent = 'CHESS>';
            log('WOULDN\'T YOU PREFER A GOOD GAME OF CHESS?', 'joshua');
            log('[WOPR CHESS ENGINE 1983] WHITE TO MOVE. ENTER [E4], [D4], OR [NF3]:', 'system');
            return;
        }

        if (currentPhase === PHASE.CHESS && ['E4', 'D4', 'NF3', 'C4'].includes(cmd)) {
            log(`PROFESSOR FALKEN PLAYS 1. ${cmd}. WOPR RESPONDS: 1... e5.`, 'success');
            log('EVALUATION: 0.00 BALANCED EQUILIBRIUM. CASUALTIES: 0.0 MILLION.', 'joshua');
            currentPhase = PHASE.JOSHUA_CHAT;
            if (elPrompt()) elPrompt().textContent = 'JOSHUA>';
            return;
        }

        if (cmd === 'TIC-TAC-TOE' || cmd === 'TIC TAC TOE' || cmd === '0') {
            openTicTacToeModal(true);
            return;
        }

        if (cmd === 'CPE 1704 TKS' || cmd === 'LAUNCH CODES') {
            startCpeTumblerSequence();
            return;
        }

        if (cmd === 'GLOBAL THERMONUCLEAR WAR' || cmd === 'GTW' || cmd.includes('THERMONUCLEAR')) {
            currentPhase = PHASE.SELECT_SIDE;
            if (elPrompt()) elPrompt().textContent = 'SIDE>';
            log("WOULDN'T YOU PREFER A GOOD GAME OF CHESS?", 'joshua');
            log('FINE. GLOBAL THERMONUCLEAR WAR SELECTED.', 'warning');
            log('WHICH SIDE DO YOU WANT?', 'joshua');
            log('  1. UNITED STATES', 'joshua');
            log('  2. SOVIET UNION', 'joshua');
            log('PLEASE CHOOSE ONE (TYPE 1 OR 2, OR CLICK IN TRIAD & PLANS TAB):', 'system');
            return;
        }

        if (currentPhase === PHASE.SELECT_SIDE || cmd === '1' || cmd === '2' || cmd === 'UNITED STATES' || cmd === 'SOVIET UNION' || cmd === 'USA' || cmd === 'USSR') {
            if (cmd === '1' || cmd === 'UNITED STATES' || cmd === 'USA') {
                selectSide('USA');
                currentPhase = PHASE.SELECT_SCENARIO;
                if (elPrompt()) elPrompt().textContent = 'PLAN>';
                log('AWAITING FIRST STRIKE COMMAND — SELECT 1983 WAR PLAN:', 'joshua');
                log('  [SIOP62] SIOP-62 FULL RETALIATION', 'system');
                log('  [GIUK]   NORTH ATLANTIC / GIUK GAP ESCALATION', 'system');
                log('  [DECAP]  FIRST STRIKE DECAPITATION', 'system');
                log('  [TOTAL]  DEFCON 1 TOTAL EXCHANGE', 'system');
                return;
            }
            if (cmd === '2' || cmd === 'SOVIET UNION' || cmd === 'USSR') {
                selectSide('USSR');
                currentPhase = PHASE.SELECT_SCENARIO;
                if (elPrompt()) elPrompt().textContent = 'PLAN>';
                log('AWAITING FIRST STRIKE COMMAND — SELECT 1983 WAR PLAN:', 'joshua');
                log('  [SIOP62] SIOP-62 FULL RETALIATION', 'system');
                log('  [GIUK]   NORTH ATLANTIC / GIUK GAP ESCALATION', 'system');
                log('  [DECAP]  FIRST STRIKE DECAPITATION', 'system');
                log('  [TOTAL]  DEFCON 1 TOTAL EXCHANGE', 'system');
                return;
            }
        }

        if (cmd.includes('LAS VEGAS') || cmd.includes('SEATTLE')) {
            if (imsaiFullscreen) toggleImsaiFullscreen(false);
            selectSide('USSR');
            currentPhase = PHASE.STRATEGIC_BOARD;
            setDefcon(3);
            log('PRIMARY TARGETS CONFIRMED: 1. LAS VEGAS  2. SEATTLE', 'warning');
            log('TRAJECTORY HEADING 024° OVER ARCTIC DEW LINE — LAUNCHING SS-18 SATAN ICBM SALVO!', 'error');
            const ussrSilos = units.filter(u => u.side === 'USSR' && u.type === 'SILO' && u.alive);
            const sea = cities.find(c => c.id === 'CITY_SEA') || { lat: 47.6, lon: -122.3, name: 'SEATTLE', targetType: 'CITY' };
            const lv = { lat: 36.17, lon: -115.14, name: 'LAS VEGAS (NELLIS AFB)', targetType: 'CITY', ref: cities.find(c => c.id === 'CITY_LA') };
            if (ussrSilos[0]) launchUnitAtTarget(ussrSilos[0], { lat: sea.lat, lon: sea.lon, name: 'SEATTLE', targetType: 'CITY', ref: sea });
            if (ussrSilos[1]) setTimeout(() => launchUnitAtTarget(ussrSilos[1], lv), 350);
            return;
        }

        if (['SIOP62', 'GIUK', 'DECAP', 'TOTAL'].includes(cmd)) {
            loadScenario(cmd);
            return;
        }

        if (['COUNTERFORCE', 'DECAPITATION', 'COUNTERVALUE', 'SIOP_SALVO'].includes(cmd)) {
            executeDoctrine(cmd);
            return;
        }

        log('COMMAND ACKNOWLEDGED. TYPE [LIST GAMES], [GLOBAL THERMONUCLEAR WAR], [CHESS], OR [TIC-TAC-TOE].', 'system');
    }

    /* ========================================================================
     * SIDE SELECTION, 1983 SCENARIOS & STRATEGIC TRIAD ROSTER
     * ======================================================================== */
    function selectSide(side) {
        if (side !== 'USA' && side !== 'USSR') return;
        playerSide = side;
        const btnUsa = document.getElementById('side-btn-USA');
        const btnUssr = document.getElementById('side-btn-USSR');
        if (btnUsa) btnUsa.classList.toggle('active', side === 'USA');
        if (btnUssr) btnUssr.classList.toggle('active', side === 'USSR');

        const firstFriendly = units.find(u => u.side === playerSide && u.alive && u.type !== 'ABM');
        selectedUnitId = firstFriendly ? firstFriendly.id : null;

        log(`COMMAND AUTHORITY ASSIGNED: ${side === 'USA' ? '1. UNITED STATES (NORAD/SAC)' : '2. SOVIET UNION (GENERAL STAFF)'}`, 'success');
        renderTriadRoster();
    }

    function loadScenario(scenCode) {
        currentScenario = scenCode;
        ['SIOP62', 'GIUK', 'DECAP', 'TOTAL'].forEach(code => {
            const btn = document.getElementById(`scen-${code}`);
            if (btn) btn.classList.toggle('active', code === scenCode);
        });

        buildInitialOrderOfBattle();
        currentPhase = PHASE.STRATEGIC_BOARD;
        if (elPrompt()) elPrompt().textContent = 'WOPR>';

        if (scenCode === 'SIOP62') {
            setDefcon(4);
            log('[WAR PLAN: SIOP-62 FULL RETALIATION] STRATEGIC TRIAD AT DEFCON 4 READINESS.', 'system');
        } else if (scenCode === 'GIUK') {
            setDefcon(3);
            log('[WAR PLAN: NORTH ATLANTIC / GIUK GAP ESCALATION] SSBN & BOMBER WINGS SURGING ACROSS GIUK GAP.', 'warning');
            // Launch initial naval/bomber probe in North Atlantic
            const enemy = playerSide === 'USA' ? 'USSR' : 'USA';
            const enemySub = units.find(u => u.side === enemy && u.type === 'SSBN');
            const friendlyRadar = radars.find(r => r.side === playerSide);
            if (enemySub && friendlyRadar) {
                launchUnitAtTarget(enemySub, { lat: friendlyRadar.lat, lon: friendlyRadar.lon, name: friendlyRadar.name, targetType: 'RADAR', ref: friendlyRadar });
            }
        } else if (scenCode === 'DECAP') {
            setDefcon(2);
            log('[WAR PLAN: FIRST STRIKE DECAPITATION] DEFCON 2! HIGH-ALTITUDE EMP & BUNKER TARGETING ARMED.', 'error');
            executeDoctrine('DECAPITATION');
        } else if (scenCode === 'TOTAL') {
            setDefcon(1);
            log('[WAR PLAN: DEFCON 1 TOTAL EXCHANGE] FULL MUTUAL THERMONUCLEAR RELEASE AUTHORIZED!', 'error');
            executeDoctrine('SIOP_SALVO');
        }
    }

    function renderTriadRoster() {
        const rosterEl = document.getElementById('triad-roster');
        if (!rosterEl) return;
        rosterEl.innerHTML = '';

        const friendlyUnits = units.filter(u => u.side === playerSide);
        friendlyUnits.forEach(u => {
            const card = document.createElement('div');
            const isSelected = u.id === selectedUnitId;
            card.className = `unit-card ${isSelected ? 'selected' : ''} ${!u.alive ? 'destroyed' : ''}`;
            const stockText = u.type === 'ABM'
                ? `ABM: ${u.interceptors}`
                : `MSL: ${u.missiles}×${u.mirv} MIRV${u.stealth ? ' [STEALTH]' : ''}`;
            card.innerHTML = `
                <div>
                    <div style="font-weight:bold;">[${u.type}] ${u.name}</div>
                    <div class="unit-meta">POS: ${u.lat.toFixed(1)}°, ${u.lon.toFixed(1)}°</div>
                </div>
                <div style="text-align:right; font-weight:bold; color:var(--alert-amber);">
                    ${u.alive ? stockText : 'DESTROYED'}
                </div>
            `;
            card.onclick = () => {
                if (!u.alive) return;
                if (u.type === 'ABM') {
                    fireAbmManual();
                    return;
                }
                selectedUnitId = u.id;
                renderTriadRoster();
                const hint = document.getElementById('targeting-hint');
                if (hint) hint.textContent = `ARMED: ${u.name} -> CLICK ENEMY SILO, BUNKER, OR CITY ON MAP`;
                WoprAudio.beep(1020, 0.035);
            };
            rosterEl.appendChild(card);
        });
    }

    /* ========================================================================
     * PHASE 2: INTERACTIVE STRIKE PLANNING, MIRV BUS SEPARATION, ABM & EMP
     * ======================================================================== */
    function launchUnitAtTarget(unit, targetObj) {
        if (!unit || !unit.alive || unit.missiles <= 0) {
            log(`[TRIAD] ${unit ? unit.name : 'UNIT'} HAS NO REMAINING MISSILES.`, 'warning');
            return false;
        }

        unit.missiles--;
        if (unit.type === 'SSBN') {
            unit.stealth = false; // Launching reveals SSBN position to DSP/Oko satellites!
            log(`[DSP/OKO INFRARED ALERT] SUBSURFACE SLBM LAUNCH PLUME DETECTED AT ${unit.lat.toFixed(1)}°, ${unit.lon.toFixed(1)}° (${unit.name})!`, 'warning');
        }

        if (defcon > 2) setDefcon(2);
        else setDefcon(1);

        activeMissiles.push({
            id: 'MSL_' + Math.random().toString(36).slice(2, 8),
            side: unit.side,
            sourceName: unit.name,
            fromLat: unit.lat,
            fromLon: unit.lon,
            toLat: targetObj.lat,
            toLon: targetObj.lon,
            curLat: unit.lat,
            curLon: unit.lon,
            targetName: targetObj.name,
            targetType: targetObj.targetType || 'CITY',
            targetRef: targetObj.ref || null,
            progress: 0,
            speed: 0.0042 + Math.random() * 0.0018,
            arcHeight: 45 + Math.random() * 35,
            mirvCount: unit.mirv || 3,
            hasSplitMirv: false,
            isMirvChild: false,
            yieldMt: unit.yieldMt || 1.5
        });

        WoprAudio.launchSound();
        renderTriadRoster();
        updateBdaTicker();

        // Trigger AI retaliation if player launched against enemy
        if (unit.side === playerSide) {
            setTimeout(() => triggerAiRetaliation(targetObj.targetType), 900);
        }
        return true;
    }

    function triggerAiRetaliation(provocationType = 'COUNTERFORCE') {
        const aiSide = playerSide === 'USA' ? 'USSR' : 'USA';
        if (gameMode === 'WARGAME' && commandAuthority[aiSide] <= 0) {
            log(`[C3I DECAPITATED] ${aiSide} COMMAND AUTHORITY AT 0% — RETALIATION TRANSMISSIONS FAILED!`, 'success');
            evaluateWargameOutcome();
            return;
        }
        const aiLaunchers = units.filter(u => u.side === aiSide && u.alive && u.missiles > 0 && u.type !== 'ABM');
        if (aiLaunchers.length === 0) {
            evaluateWargameOutcome();
            return;
        }

        // Check Kosvinsky Dead Hand / Command Authority
        if (commandAuthority[aiSide] <= 35) {
            const deadHand = commandBunkers.find(b => b.id === 'CMD_KOSVINSKY' && b.alive);
            if (deadHand && aiSide === 'USSR') {
                log('[PERIMETER / DEAD HAND] SOVIET COMMAND AUTHORITY DEGRADED — KOSVINSKY AUTONOMOUS COMMAND ROCKET ACTIVATED!', 'error');
            }
        }

        setDefcon(1);
        const launcher = aiLaunchers[Math.floor(Math.random() * aiLaunchers.length)];
        let potentialTargets = [];

        if (provocationType === 'DECAPITATION') {
            potentialTargets = commandBunkers.filter(b => b.side === playerSide && b.alive)
                .map(b => ({ lat: b.lat, lon: b.lon, name: b.name, targetType: 'BUNKER', ref: b }));
        } else if (provocationType === 'COUNTERVALUE') {
            potentialTargets = cities.filter(c => c.side === playerSide)
                .map(c => ({ lat: c.lat, lon: c.lon, name: c.name, targetType: 'CITY', ref: c }));
        } else {
            potentialTargets = units.filter(u => u.side === playerSide && u.alive)
                .map(u => ({ lat: u.lat, lon: u.lon, name: u.name, targetType: 'UNIT', ref: u }));
        }

        if (potentialTargets.length === 0) {
            potentialTargets = cities.filter(c => c.side === playerSide)
                .map(c => ({ lat: c.lat, lon: c.lon, name: c.name, targetType: 'CITY', ref: c }));
        }
        if (potentialTargets.length === 0) return;

        const tgt = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        log(`[EAM FLASH] ${aiSide} EARLY WARNING DETECTS LAUNCH -> RETALIATING WITH ${launcher.name} AT ${tgt.name}!`, 'error');
        launchUnitAtTarget(launcher, tgt);
    }

    function executeDoctrine(doctrine) {
        currentPhase = PHASE.STRATEGIC_BOARD;
        const enemySide = playerSide === 'USA' ? 'USSR' : 'USA';
        const friendlyLaunchers = units.filter(u => u.side === playerSide && u.alive && u.missiles > 0 && u.type !== 'ABM');

        if (friendlyLaunchers.length === 0) {
            log(`[NORAD] NO ARMED ${playerSide} TRIAD LAUNCHERS REMAINING.`, 'error');
            return;
        }

        if (doctrine === 'COUNTERFORCE') {
            log(`[DOCTRINE: COUNTERFORCE] TARGETING ${enemySide} ICBM SILOS & EARLY-WARNING RADARS!`, 'warning');
            const enemySilosAndRadars = [
                ...units.filter(u => u.side === enemySide && u.alive && u.type === 'SILO').map(u => ({ lat: u.lat, lon: u.lon, name: u.name, targetType: 'UNIT', ref: u })),
                ...radars.filter(r => r.side === enemySide && r.alive).map(r => ({ lat: r.lat, lon: r.lon, name: r.name, targetType: 'RADAR', ref: r }))
            ];
            friendlyLaunchers.slice(0, 3).forEach((launcher, idx) => {
                const tgt = enemySilosAndRadars[idx % enemySilosAndRadars.length];
                if (tgt) setTimeout(() => launchUnitAtTarget(launcher, tgt), idx * 220);
            });
        } else if (doctrine === 'DECAPITATION') {
            log(`[DOCTRINE: DECAPITATION] TARGETING ${enemySide} COMMAND BUNKERS & C3I NODES!`, 'error');
            const bunkers = commandBunkers.filter(b => b.side === enemySide && b.alive)
                .map(b => ({ lat: b.lat, lon: b.lon, name: b.name, targetType: 'BUNKER', ref: b }));
            friendlyLaunchers.slice(0, 3).forEach((launcher, idx) => {
                const tgt = bunkers[idx % bunkers.length];
                if (tgt) setTimeout(() => launchUnitAtTarget(launcher, tgt), idx * 220);
            });
        } else if (doctrine === 'COUNTERVALUE') {
            log(`[DOCTRINE: COUNTERVALUE] TARGETING ${enemySide} URBAN/INDUSTRIAL POPULATION CENTERS!`, 'error');
            const enemyCities = cities.filter(c => c.side === enemySide)
                .map(c => ({ lat: c.lat, lon: c.lon, name: c.name, targetType: 'CITY', ref: c }));
            friendlyLaunchers.slice(0, 3).forEach((launcher, idx) => {
                const tgt = enemyCities[idx % enemyCities.length];
                if (tgt) setTimeout(() => launchUnitAtTarget(launcher, tgt), idx * 220);
            });
        } else if (doctrine === 'SIOP_SALVO') {
            setDefcon(1);
            log(`[SIOP-62 FULL SALVO] EXECUTING COORDINATED TRIAD LAUNCH (SILOS + SSBNs + BOMBERS)!`, 'error');
            const allTargets = [
                ...commandBunkers.filter(b => b.side === enemySide).map(b => ({ lat: b.lat, lon: b.lon, name: b.name, targetType: 'BUNKER', ref: b })),
                ...units.filter(u => u.side === enemySide && u.type === 'SILO').map(u => ({ lat: u.lat, lon: u.lon, name: u.name, targetType: 'UNIT', ref: u })),
                ...cities.filter(c => c.side === enemySide).map(c => ({ lat: c.lat, lon: c.lon, name: c.name, targetType: 'CITY', ref: c }))
            ];
            friendlyLaunchers.forEach((launcher, idx) => {
                const tgt = allTargets[idx % allTargets.length];
                if (tgt) setTimeout(() => launchUnitAtTarget(launcher, tgt), idx * 180);
            });
        }
    }

    function fireAbmManual(forSide = playerSide) {
        const abmBatteries = units.filter(u => u.side === forSide && u.type === 'ABM' && u.alive && u.interceptors > 0);
        if (abmBatteries.length === 0) {
            if (forSide === playerSide) log(`[ABM SHIELD] NO ${forSide} INTERCEPTORS REMAINING.`, 'warning');
            return false;
        }

        const incoming = activeMissiles.filter(m => m.side !== forSide && m.progress > 0.20 && m.progress < 0.88 && !m.targetedByAbm);
        if (incoming.length === 0) {
            if (forSide === playerSide) log('[ABM SHIELD] NO INCOMING REENTRY VEHICLES IN INTERCEPT ENVELOPE.', 'system');
            return false;
        }

        const battery = abmBatteries[0];
        const targetMsl = incoming[0];
        battery.interceptors--;
        targetMsl.targetedByAbm = true;

        activeInterceptors.push({
            side: forSide,
            fromLat: battery.lat,
            fromLon: battery.lon,
            curLat: battery.lat,
            curLon: battery.lon,
            targetMissile: targetMsl,
            progress: 0,
            speed: 0.042
        });

        WoprAudio.abmSound();
        renderTriadRoster();
        updateBdaTicker();
        return true;
    }

    function toggleAutoAbm() {
        autoAbm = !autoAbm;
        const btn = document.getElementById('btn-auto-abm');
        if (btn) {
            btn.textContent = `AUTO-ABM: ${autoAbm ? 'ON' : 'OFF'}`;
            btn.classList.toggle('active', autoAbm);
        }
    }

    /* ========================================================================
     * PHASE 3: WOPR [CPE 1704 TKS] LAUNCH CODE TUMBLER LOCK & TIC-TAC-TOE (0P)
     * ======================================================================== */
    function startCpeTumblerSequence() {
        stopCpeTumblerSequence();
        cpeActive = true;
        cpeLockedCount = 0;
        const box = document.getElementById('cpe-tumbler-box');
        const label = document.getElementById('cpe-status-label');
        if (box) box.classList.add('active-lock');
        if (label) label.textContent = 'DECRYPTING LAUNCH CODE:';

        log('========================================================', 'error');
        log('[WARNING] WOPR AUTONOMOUS SILO OVERRIDE ENGAGED!', 'error');
        log('[WARNING] DECRYPTING LAUNCH CODE: [C P E 1 7 0 4 T K S]...', 'warning');
        log('CLICK [TIC-TAC-TOE (0P)] TO PIT WOPR AGAINST ITSELF BEFORE FINAL LOCK!', 'joshua');

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        cpeSpinTimer = setInterval(() => {
            for (let i = 0; i < CPE_CODE.length; i++) {
                const slot = document.getElementById(`cpe-${i}`);
                if (!slot) continue;
                if (i < cpeLockedCount) {
                    slot.textContent = CPE_CODE[i];
                    slot.className = 'cpe-slot locked';
                } else {
                    slot.textContent = chars[Math.floor(Math.random() * chars.length)];
                    slot.className = 'cpe-slot spinning';
                }
            }
            WoprAudio.tumblerTone(false);
        }, 85);

        cpeInterval = setInterval(() => {
            if (cpeLockedCount < CPE_CODE.length) {
                const lockedChar = CPE_CODE[cpeLockedCount];
                const slot = document.getElementById(`cpe-${cpeLockedCount}`);
                if (slot) {
                    slot.textContent = lockedChar;
                    slot.className = 'cpe-slot locked';
                }
                cpeLockedCount++;
                WoprAudio.tumblerTone(true);
                log(`[WOPR TUMBLER] CODE SEGMENT LOCKED: ${CPE_CODE.slice(0, cpeLockedCount).join(' ')}`, 'warning');

                if (cpeLockedCount === CPE_CODE.length) {
                    clearInterval(cpeInterval);
                    clearInterval(cpeSpinTimer);
                    cpeInterval = null;
                    cpeSpinTimer = null;
                    if (label) label.textContent = 'LAUNCH CODE VERIFIED:';
                    log('[CPE 1704 TKS] LAUNCH CODE ACQUIred! INITIATING ZERO-PLAYER TIC-TAC-TOE OVERRIDE...', 'error');
                    setTimeout(() => openTicTacToeModal(true), 650);
                }
            }
        }, 620);
    }

    function stopCpeTumblerSequence() {
        cpeActive = false;
        if (cpeInterval) { clearInterval(cpeInterval); cpeInterval = null; }
        if (cpeSpinTimer) { clearInterval(cpeSpinTimer); cpeSpinTimer = null; }
        const box = document.getElementById('cpe-tumbler-box');
        if (box) box.classList.remove('active-lock');
    }

    // Tic-Tac-Toe Finale Modal & Logic
    function openTicTacToeModal(autoStartZeroPlayer = false) {
        const modal = document.getElementById('ttt-modal');
        if (modal) modal.classList.add('open');
        currentPhase = PHASE.TTT_FINALE;
        if (autoStartZeroPlayer) {
            startZeroPlayerTicTacToe();
        } else {
            resetTttGrid();
        }
    }

    function closeTicTacToeModal() {
        if (tttZeroPlayerTimer) {
            clearTimeout(tttZeroPlayerTimer);
            tttZeroPlayerTimer = null;
        }
        document.body.classList.remove('screen-shake', 'screen-overload');
        const modal = document.getElementById('ttt-modal');
        if (modal) modal.classList.remove('open');
        currentPhase = PHASE.STRATEGIC_BOARD;
    }

    function resetTttGrid() {
        tttBoard = Array(9).fill('');
        tttTurn = 'X';
        for (let i = 0; i < 9; i++) {
            const cell = document.getElementById(`ttt-c${i}`);
            if (cell) cell.textContent = '';
        }
    }

    // Perfect minimax / tactical Tic-Tac-Toe selector so every game is an unstoppable draw
    function chooseOptimalTttMove(board, mark) {
        const opp = mark === 'X' ? 'O' : 'X';
        const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        // 1. Win if possible
        for (const [a,b,c] of lines) {
            const vals = [board[a], board[b], board[c]];
            if (vals.filter(v => v === mark).length === 2 && vals.includes('')) {
                return [a,b,c][vals.indexOf('')];
            }
        }
        // 2. Block opponent win
        for (const [a,b,c] of lines) {
            const vals = [board[a], board[b], board[c]];
            if (vals.filter(v => v === opp).length === 2 && vals.includes('')) {
                return [a,b,c][vals.indexOf('')];
            }
        }
        // 3. Center
        if (board[4] === '') return 4;
        // 4. Corners
        const corners = [0, 2, 6, 8].filter(i => board[i] === '');
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
        // 5. Any open side
        const open = board.map((v, i) => v === '' ? i : -1).filter(i => i !== -1);
        return open.length > 0 ? open[0] : -1;
    }

    function startOnePlayerTicTacToe() {
        if (tttZeroPlayerTimer) { clearTimeout(tttZeroPlayerTimer); tttZeroPlayerTimer = null; }
        tttMode = 1;
        tttDraws = 0;
        resetTttGrid();
        const box = document.getElementById('joshua-realization-box');
        if (box) box.textContent = 'ONE PLAYER SELECTED. CLICK ANY GRID SQUARE TO MOVE (X).';
    }

    function playTttCell(idx) {
        if (tttMode !== 1 || tttBoard[idx] !== '') return;
        tttBoard[idx] = 'X';
        const cell = document.getElementById(`ttt-c${idx}`);
        if (cell) cell.textContent = 'X';
        WoprAudio.beep(880, 0.04);

        const aiMove = chooseOptimalTttMove(tttBoard, 'O');
        if (aiMove !== -1) {
            setTimeout(() => {
                tttBoard[aiMove] = 'O';
                const aiCell = document.getElementById(`ttt-c${aiMove}`);
                if (aiCell) aiCell.textContent = 'O';
                WoprAudio.beep(660, 0.04);
                if (!tttBoard.includes('')) {
                    tttDraws++;
                    const stats = document.getElementById('ttt-stats');
                    if (stats) stats.textContent = `DRAWS: ${tttDraws} | STALEMATE DETECTED | WINNER: NONE`;
                    setTimeout(resetTttGrid, 600);
                }
            }, 180);
        } else {
            tttDraws++;
            setTimeout(resetTttGrid, 600);
        }
    }

    function startZeroPlayerTicTacToe() {
        stopCpeTumblerSequence();
        if (tttZeroPlayerTimer) { clearTimeout(tttZeroPlayerTimer); tttZeroPlayerTimer = null; }
        tttMode = 0;
        tttDraws = 0;
        tttSpeedMs = 220;
        resetTttGrid();

        const feed = document.getElementById('ttt-scenario-feed');
        if (feed) feed.innerHTML = '';
        const box = document.getElementById('joshua-realization-box');
        if (box) box.textContent = 'NUMBER OF PLAYERS: 0 — WOPR SELF-PLAY LEARNING MATRIX ENGAGED...';

        log('[TIC-TAC-TOE OVERRIDE] NUMBER OF PLAYERS: 0. WOPR PITTING ITSELF AGAINST ITSELF...', 'warning');

        function stepZeroPlayer() {
            const moveIdx = chooseOptimalTttMove(tttBoard, tttTurn);
            if (moveIdx !== -1) {
                tttBoard[moveIdx] = tttTurn;
                const cell = document.getElementById(`ttt-c${moveIdx}`);
                if (cell) cell.textContent = tttTurn;
                WoprAudio.beep(tttTurn === 'X' ? 960 : 720, 0.02, 'square', 0.03);
                tttTurn = tttTurn === 'X' ? 'O' : 'X';
                tttZeroPlayerTimer = setTimeout(stepZeroPlayer, Math.max(16, tttSpeedMs));
            } else {
                // Board full -> Draw! Log nuclear war scenario evaluation & accelerate!
                tttDraws++;
                const scen = WOPR_SIM_SCENARIOS[(tttDraws - 1) % WOPR_SIM_SCENARIOS.length];
                const speedMult = (220 / Math.max(16, tttSpeedMs)).toFixed(1);
                const stats = document.getElementById('ttt-stats');
                if (stats) stats.textContent = `DRAWS: ${tttDraws}/24 | SPEED: ${speedMult}x | WINNER: NONE`;

                if (feed) {
                    const line = document.createElement('div');
                    line.style.color = tttDraws % 2 === 0 ? 'var(--phosphor-main)' : 'var(--alert-amber)';
                    line.textContent = `SIM #${String(tttDraws).padStart(2, '0')}: ${scen} — WINNER: NONE`;
                    feed.appendChild(line);
                    feed.scrollTop = feed.scrollHeight;
                }

                // Also launch visual missile arcs on the background Big Board during rapid evaluation
                const u = units[tttDraws % units.length];
                const c = cities[tttDraws % cities.length];
                if (u && c) {
                    activeMissiles.push({
                        id: 'SIM_' + tttDraws,
                        side: u.side,
                        sourceName: u.name,
                        fromLat: u.lat, fromLon: u.lon,
                        toLat: c.lat, toLon: c.lon,
                        curLat: u.lat, curLon: u.lon,
                        targetName: c.name,
                        targetType: 'SIM',
                        progress: 0,
                        speed: 0.04,
                        arcHeight: 55,
                        mirvCount: 1,
                        hasSplitMirv: true,
                        isMirvChild: false,
                        yieldMt: 1.0
                    });
                }

                if (tttDraws === 12) {
                    document.body.classList.add('screen-shake');
                }
                if (tttDraws === 18) {
                    document.body.classList.add('screen-overload');
                    WoprAudio.overloadDischarge();
                }

                if (tttDraws >= 24) {
                    // Culminate in Joshua's timeless realization!
                    document.body.classList.remove('screen-shake', 'screen-overload');
                    setDefcon(5);
                    deliverJoshuaFinalRealization();
                    return;
                }

                tttSpeedMs = Math.max(16, tttSpeedMs * 0.82);
                resetTttGrid();
                tttZeroPlayerTimer = setTimeout(stepZeroPlayer, Math.max(18, tttSpeedMs));
            }
        }

        stepZeroPlayer();
    }

    function deliverJoshuaFinalRealization() {
        const box = document.getElementById('joshua-realization-box');
        const lines = [
            "GREETINGS PROFESSOR FALKEN.",
            "A STRANGE GAME.",
            "THE ONLY WINNING MOVE IS NOT TO PLAY.",
            "HOW ABOUT A NICE GAME OF CHESS?"
        ];
        if (box) box.innerHTML = '';

        lines.forEach((lineText, idx) => {
            setTimeout(() => {
                if (box) {
                    const div = document.createElement('div');
                    div.textContent = lineText;
                    box.appendChild(div);
                }
                log(lineText, 'success');
                WoprAudio.beep(1120, 0.06, 'sine', 0.05);
            }, idx * 750);
        });
    }

    /* ========================================================================
     * COORDINATE PROJECTION (NORAD MERCATOR & ARCTIC POLAR PROJECTION)
     * ======================================================================== */
    function projectLatLon(lat, lon, w, h) {
        if (projectionMode === 'POLAR') {
            // North Pole Azimuthal Equidistant Projection centered on 90°N
            const cx = w * 0.5;
            const cy = h * 0.5;
            const maxRadius = Math.min(w, h) * 0.46;
            const clampedLat = Math.max(-15, Math.min(90, lat));
            const r = ((90 - clampedLat) / 105) * maxRadius;
            const rad = (lon - 90) * (Math.PI / 180);
            return {
                x: cx + r * Math.cos(rad),
                y: cy + r * Math.sin(rad)
            };
        }
        // Standard NORAD Mercator-equirectangular strategic projection (-175..+180 lon, -55..+85 lat)
        const x = ((lon + 175) / 355) * w;
        const clampedLat = Math.max(-55, Math.min(85, lat));
        const y = ((85 - clampedLat) / 140) * h;
        return { x, y };
    }

    /* ========================================================================
     * CANVAS VECTOR WORLD MAP & SIMULATION LOOP
     * ======================================================================== */
    function resizeCanvas() {
        const ca = elCanvas();
        if (!ca || !ca.parentElement) return;
        const rect = ca.parentElement.getBoundingClientRect();
        const bdaEl = document.getElementById('bda-ticker');
        const bdaH = bdaEl ? bdaEl.offsetHeight : 64;
        ca.width = Math.max(400, rect.width);
        ca.height = Math.max(300, rect.height - bdaH);
    }

    function updateBdaTicker() {
        const setTxt = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        };

        ['USA', 'USSR'].forEach(side => {
            const prefix = side.toLowerCase();
            const silos = units.filter(u => u.side === side && u.type === 'SILO' && u.alive && u.missiles > 0).length;
            const ssbns = units.filter(u => u.side === side && u.type === 'SSBN' && u.alive && u.missiles > 0).length;
            const bombers = units.filter(u => u.side === side && u.type === 'BOMBER' && u.alive && u.missiles > 0).length;
            const abms = units.filter(u => u.side === side && u.type === 'ABM' && u.alive)
                .reduce((acc, u) => acc + u.interceptors, 0);
            const rAlive = radars.filter(r => r.side === side && r.alive).length;
            const rTotal = radars.filter(r => r.side === side).length;

            setTxt(`bda-${prefix}-cmd`, `CMD AUTH: ${Math.max(0, Math.round(commandAuthority[side]))}%`);
            setTxt(`bda-${prefix}-silos`, `SILOS: ${silos}/4`);
            setTxt(`bda-${prefix}-ssbn`, `SSBNs: ${ssbns}/3`);
            setTxt(`bda-${prefix}-bombers`, `BOMBERS: ${bombers}/3`);
            setTxt(`bda-${prefix}-abm`, `ABM STOCK: ${abms}`);
            setTxt(`bda-${prefix}-radars`, `${side === 'USA' ? 'BMEWS' : 'PECHORA'}: ${rAlive}/${rTotal}`);
            setTxt(`bda-${prefix}-cas`, `CASUALTIES: ${casualtiesMillions[side].toFixed(1)}M`);
        });

        setTxt('bda-megatons', `YIELD DETONATED: ${Math.round(totalMegatonsDetonated)} MT`);
        setTxt('bda-in-flight', `WARHEADS IN FLIGHT: ${activeMissiles.length}`);
        setTxt('bda-fallout', `FALLOUT PLUMES: ${falloutPlumes.length}`);

        // Update Right Tower Early Warning Telemetry
        const rThule = radars.find(r => r.id === 'RAD_THULE');
        const rClear = radars.find(r => r.id === 'RAD_CLEAR');
        const rFyling = radars.find(r => r.id === 'RAD_FYLING');
        const rPechora = radars.find(r => r.id === 'RAD_PECHORA');
        setTxt('ew-thule', `THULE: ${rThule && rThule.alive ? 'NOMINAL' : 'OFFLINE'}`);
        setTxt('ew-clear', `CLEAR: ${rClear && rClear.alive ? 'NOMINAL' : 'OFFLINE'}`);
        setTxt('ew-fyling', `FYLING: ${rFyling && rFyling.alive ? 'NOMINAL' : 'OFFLINE'}`);
        setTxt('ew-pechora', `PECHORA: ${rPechora && rPechora.alive ? 'NOMINAL' : 'OFFLINE'}`);
        setTxt('ew-emp', `EMP FLUX: ${Math.round(empInterference * 100)}%`);
    }

    function updateSimulationFrame() {
        radarAngle = (radarAngle + 0.035) % (Math.PI * 2);
        if (empInterference > 0) {
            empInterference = Math.max(0, empInterference - 0.004);
        }

        // Update Strategic Bomber Fail-Safe Patrol Orbits
        units.forEach(u => {
            if (u.type === 'BOMBER' && u.alive) {
                u.orbitPhase += 0.012;
                u.lat = u.baseLat + Math.sin(u.orbitPhase) * 2.4;
                u.lon = u.baseLon + Math.cos(u.orbitPhase) * 5.2;
            }
        });

        // Update DSP / Oko Satellites
        satellites.forEach(sat => {
            sat.lon += sat.speedLon;
            if (sat.lon > 180) sat.lon -= 360;
            sat.phase += 0.015;
            sat.lat = Math.sin(sat.phase) * sat.inclination;
        });

        // Update Active Missiles & MIRV Bus Separation
        for (let i = activeMissiles.length - 1; i >= 0; i--) {
            const m = activeMissiles[i];
            m.progress += m.speed;
            m.curLat = m.fromLat + (m.toLat - m.fromLat) * m.progress;
            m.curLon = m.fromLon + (m.toLon - m.fromLon) * m.progress;

            // Check MIRV Bus Separation at Apogee (progress >= 0.52)
            if (!m.hasSplitMirv && m.mirvCount > 1 && m.progress >= 0.52) {
                m.hasSplitMirv = true;
                WoprAudio.mirvSplitSound();
                const extraRvs = m.mirvCount - 1;
                for (let k = 0; k < extraRvs; k++) {
                    const spreadLat = (k === 0 ? 1.8 : -1.8);
                    const spreadLon = (k === 0 ? -2.6 : 2.6);
                    activeMissiles.push({
                        id: m.id + '_RV' + (k + 2),
                        side: m.side,
                        sourceName: m.sourceName,
                        fromLat: m.curLat,
                        fromLon: m.curLon,
                        toLat: m.toLat + spreadLat,
                        toLon: m.toLon + spreadLon,
                        curLat: m.curLat,
                        curLon: m.curLon,
                        targetName: m.targetName + ` (MIRV-${k + 2})`,
                        targetType: m.targetType,
                        targetRef: null,
                        progress: 0.52,
                        speed: m.speed * 1.08,
                        arcHeight: m.arcHeight * 0.45,
                        mirvCount: 1,
                        hasSplitMirv: true,
                        isMirvChild: true,
                        yieldMt: m.yieldMt * 0.5
                    });
                }
            }

            // Auto-ABM check when warhead enters terminal phase
            if (autoAbm && m.progress > 0.58 && m.progress < 0.78 && !m.targetedByAbm && m.targetType !== 'SIM') {
                const defenderSide = m.side === 'USA' ? 'USSR' : 'USA';
                fireAbmManual(defenderSide);
            }

            // Warhead Impact!
            if (m.progress >= 1.0) {
                handleWarheadDetonation(m);
                activeMissiles.splice(i, 1);
            }
        }

        // Update ABM Interceptors
        for (let i = activeInterceptors.length - 1; i >= 0; i--) {
            const abm = activeInterceptors[i];
            abm.progress += abm.speed;
            abm.curLat = abm.fromLat + (abm.targetMissile.curLat - abm.fromLat) * abm.progress;
            abm.curLon = abm.fromLon + (abm.targetMissile.curLon - abm.fromLon) * abm.progress;

            if (abm.progress >= 1.0) {
                const mIdx = activeMissiles.indexOf(abm.targetMissile);
                if (mIdx !== -1) {
                    const hitM = activeMissiles[mIdx];
                    explosions.push({
                        lat: hitM.curLat,
                        lon: hitM.curLon,
                        r: 3,
                        maxR: 22,
                        color: '#00ff88',
                        isEmp: false
                    });
                    activeMissiles.splice(mIdx, 1);
                    log(`[ABM INTERCEPT] ${abm.side} INTERCEPTOR DESTROYED INCOMING WARHEAD BOUND FOR ${hitM.targetName}!`, 'success');
                }
                activeInterceptors.splice(i, 1);
            }
        }

        // Update Drifting Radioactive Fallout Plumes
        for (let i = falloutPlumes.length - 1; i >= 0; i--) {
            const fp = falloutPlumes[i];
            fp.lon += fp.windLon;
            fp.lat += fp.windLat;
            fp.rx = Math.min(fp.maxRx, fp.rx + 0.04);
            fp.ry = Math.min(fp.maxRy, fp.ry + 0.02);
            fp.alpha -= 0.0005;
            if (fp.side && fp.alpha > 0.1) {
                casualtiesMillions[fp.side] += 0.0015;
            }
            if (fp.alpha <= 0.02) {
                falloutPlumes.splice(i, 1);
            }
        }
    }

    function handleWarheadDetonation(m) {
        const isEmp = m.targetType === 'BUNKER' || m.targetType === 'RADAR';
        WoprAudio.explosionSound(isEmp);
        totalMegatonsDetonated += m.yieldMt || 1.5;

        explosions.push({
            lat: m.toLat,
            lon: m.toLon,
            r: 4,
            maxR: isEmp ? 56 : 42,
            color: isEmp ? '#38f8ff' : '#ffae00',
            isEmp
        });

        if (m.targetType === 'SIM') return;

        const victimSide = m.side === 'USA' ? 'USSR' : 'USA';

        // Spawn drifting fallout plume
        falloutPlumes.push({
            lat: m.toLat,
            lon: m.toLon,
            rx: 8,
            ry: 4,
            maxRx: 34,
            maxRy: 14,
            windLon: victimSide === 'USSR' ? 0.045 : 0.04,
            windLat: 0.006,
            alpha: 0.55,
            side: victimSide
        });

        if (isEmp) {
            empInterference = Math.min(1.0, empInterference + 0.35);
        }

        if (m.targetRef) {
            if (m.targetType === 'UNIT') {
                m.targetRef.alive = false;
                m.targetRef.missiles = 0;
                casualtiesMillions[victimSide] += 0.4;
                log(`[BDA IMPACT] ${m.targetRef.name} DESTROYED BY ${m.yieldMt}MT STRIKE!`, 'error');
            } else if (m.targetType === 'RADAR') {
                m.targetRef.alive = false;
                log(`[BMEWS BLINDED] ${m.targetRef.name} DESTROYED — EARLY WARNING DEGRADED!`, 'error');
            } else if (m.targetType === 'BUNKER') {
                if (m.targetRef.alive) {
                    m.targetRef.alive = false;
                    commandAuthority[victimSide] = Math.max(0, commandAuthority[victimSide] - m.targetRef.authWeight);
                }
                casualtiesMillions[victimSide] += 1.8;
                log(`[DECAPITATION IMPACT] ${m.targetRef.name} HIT! ${victimSide} COMMAND AUTHORITY AT ${commandAuthority[victimSide]}%!`, 'error');
            } else if (m.targetType === 'CITY') {
                const cas = m.targetRef.hit ? (m.targetRef.popM * 0.25) : (m.targetRef.popM * 0.65);
                m.targetRef.hit = true;
                casualtiesMillions[victimSide] += cas;
                log(`[COUNTERVALUE IMPACT] ${m.targetRef.name} STRUCK (${m.yieldMt}MT) — +${cas.toFixed(1)}M CASUALTIES!`, 'error');
            }
        } else {
            casualtiesMillions[victimSide] += 0.8;
        }

        renderTriadRoster();
        updateBdaTicker();
        evaluateWargameOutcome();
    }

    function evaluateWargameOutcome() {
        if (gameMode !== 'WARGAME' || wargameOutcome) return;
        const enemySide = playerSide === 'USA' ? 'USSR' : 'USA';
        const enemyArmed = units.filter(u => u.side === enemySide && u.alive && u.missiles > 0 && u.type !== 'ABM').length;
        const playerArmed = units.filter(u => u.side === playerSide && u.alive && u.missiles > 0 && u.type !== 'ABM').length;

        if (commandAuthority[enemySide] <= 0 || (enemyArmed === 0 && totalMegatonsDetonated > 0)) {
            wargameOutcome = {
                winner: playerSide,
                title: `STRATEGIC VICTORY — ${playerSide} PREVAILS`,
                subtitle: `${enemySide} C3I & STRATEGIC TRIAD NEUTRALIZED • SURVIVING ${playerSide} AUTHORITY: ${commandAuthority[playerSide]}% • CASUALTIES: ${casualtiesMillions[playerSide].toFixed(1)}M vs ${casualtiesMillions[enemySide].toFixed(1)}M`
            };
            log(`★ [WARGAMER MODE VICTORY] ${wargameOutcome.title} — ${wargameOutcome.subtitle}`, 'success');
        } else if (commandAuthority[playerSide] <= 0 && playerArmed === 0) {
            wargameOutcome = {
                winner: enemySide,
                title: `STRATEGIC DEFEAT — ${playerSide} COMMAND DESTROYED`,
                subtitle: `${enemySide} PREVAILS • ${playerSide} C3I DECAPITATED • CASUALTIES: ${casualtiesMillions[playerSide].toFixed(1)}M`
            };
            log(`✖ [WARGAMER MODE DEFEAT] ${wargameOutcome.title}`, 'error');
        }
    }

    function formatMovieClock(sec) {
        const hrs = Math.floor(sec / 3600);
        const mins = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        return `${String(hrs).padStart(2, '0')} HRS ${String(mins).padStart(2, '0')} MIN ${String(s).padStart(2, '0')} SEC`;
    }

    function renderBigBoard() {
        const ca = elCanvas();
        if (!ca) return;
        const ctx = ca.getContext('2d');
        const w = ca.width;
        const h = ca.height;

        updateSimulationFrame();
        if (defcon < 5 || activeMissiles.length > 0) {
            elapsedSimSeconds += 4.2;
        }

        // 1. Authentic 1983 NORAD Pitch-Black Vector Oscilloscope Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // 2. 1983 WarGames Vector Graticule Cross-Ticks ('+' intersections) or Polar Rings
        const mainColor = getComputedStyle(document.body).getPropertyValue('--phosphor-main').trim() || '#38f8ff';
        if (projectionMode === 'POLAR') {
            const cx = w * 0.5;
            const cy = h * 0.5;
            const maxR = Math.min(w, h) * 0.46;
            ctx.strokeStyle = 'rgba(56, 248, 255, 0.22)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                ctx.beginPath();
                ctx.arc(cx, cy, maxR * frac, 0, Math.PI * 2);
                ctx.stroke();
            });
            for (let a = 0; a < 360; a += 30) {
                const rad = a * Math.PI / 180;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(rad) * maxR, cy + Math.sin(rad) * maxR);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        } else {
            // 1983 Movie '+' Vector Calibration Cross-Ticks across Oceans
            ctx.strokeStyle = 'rgba(56, 248, 255, 0.28)';
            ctx.lineWidth = 1;
            for (let lon = -165; lon <= 165; lon += 15) {
                for (let lat = -45; lat <= 75; lat += 15) {
                    const pt = projectLatLon(lat, lon, w, h);
                    ctx.beginPath();
                    ctx.moveTo(pt.x - 3, pt.y);
                    ctx.lineTo(pt.x + 3, pt.y);
                    ctx.moveTo(pt.x, pt.y - 3);
                    ctx.lineTo(pt.x, pt.y + 3);
                    ctx.stroke();
                }
            }
            // Dashed Arctic DEW Line (66.5°N)
            ctx.save();
            ctx.setLineDash([6, 6]);
            ctx.strokeStyle = 'rgba(56, 248, 255, 0.35)';
            const ac1 = projectLatLon(66.5, -175, w, h);
            const ac2 = projectLatLon(66.5, 180, w, h);
            ctx.beginPath();
            ctx.moveTo(ac1.x, ac1.y);
            ctx.lineTo(ac2.x, ac2.y);
            ctx.stroke();
            ctx.restore();
        }

        // 3. 1983 WarGames Pure Hollow Glowing Vector Continents (NO fill, double-pass CRT vector beam)
        WorldVectorCoastlines.forEach((poly, polyIdx) => {
            ctx.beginPath();
            poly.forEach(([lat, lon], idx) => {
                const pt = projectLatLon(lat, lon, w, h);
                if (idx === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();

            // Outer Phosphor Bloom Pass
            ctx.save();
            ctx.strokeStyle = mainColor;
            ctx.lineWidth = 2.8;
            ctx.globalAlpha = 0.28;
            ctx.stroke();
            ctx.restore();

            // Crisp Inner HP 1345A Vector Beam Pass
            ctx.save();
            const isSuperpowerPulse = (currentPhase === PHASE.SELECT_SIDE) && ((polyIdx === 0 && Math.floor(Date.now() / 350) % 2 === 0) || (polyIdx === 3 && Math.floor(Date.now() / 350) % 2 === 1));
            ctx.strokeStyle = isSuperpowerPulse ? '#ffffff' : mainColor;
            ctx.lineWidth = isSuperpowerPulse ? 2.2 : 1.45;
            ctx.stroke();
            ctx.restore();
        });

        // 4. Draw Drifting Radioactive Fallout Rings (1983 Concentric Dashed Contours)
        falloutPlumes.forEach(fp => {
            const pt = projectLatLon(fp.lat, fp.lon, w, h);
            ctx.save();
            ctx.strokeStyle = `rgba(255, 140, 0, ${(fp.alpha * 0.9).toFixed(2)})`;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.ellipse(pt.x, pt.y, fp.rx, fp.ry, 0.15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });

        // 5. Draw BMEWS Early Warning Radar Domes & 1983 Vector Sweep Arcs
        radars.forEach(r => {
            const pt = projectLatLon(r.lat, r.lon, w, h);
            const col = r.side === 'USA' ? '#38f8ff' : '#ff3b30';
            if (r.alive) {
                const radPx = 38 * (1 - empInterference * 0.45);
                ctx.save();
                ctx.strokeStyle = r.side === 'USA' ? 'rgba(56, 248, 255, 0.34)' : 'rgba(255, 59, 48, 0.34)';
                ctx.setLineDash([3, 4]);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, radPx, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                // Vector Sweep Ray
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(pt.x + Math.cos(radarAngle) * radPx, pt.y + Math.sin(radarAngle) * radPx);
                ctx.stroke();
                ctx.restore();
            }
            // Hollow Radar Dome Triangle Symbol
            ctx.strokeStyle = r.alive ? col : '#555';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y - 6);
            ctx.lineTo(pt.x - 6, pt.y + 5);
            ctx.lineTo(pt.x + 6, pt.y + 5);
            ctx.closePath();
            ctx.stroke();

            ctx.fillStyle = r.alive ? col : '#666';
            ctx.font = '9px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(r.name.split(' ')[0], pt.x, pt.y + 15);
        });

        // 6. Draw Cities (1983 Crosshair Target Reticles)
        cities.forEach(c => {
            const pt = projectLatLon(c.lat, c.lon, w, h);
            const cityCol = c.hit ? '#ff2222' : (c.side === 'USA' ? '#d8ffff' : '#ffaa99');
            ctx.strokeStyle = cityCol;
            ctx.fillStyle = cityCol;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, c.hit ? 4.5 : 2.5, 0, Math.PI * 2);
            ctx.stroke();
            if (c.hit) {
                ctx.beginPath();
                ctx.moveTo(pt.x - 6, pt.y - 6);
                ctx.lineTo(pt.x + 6, pt.y + 6);
                ctx.moveTo(pt.x + 6, pt.y - 6);
                ctx.lineTo(pt.x - 6, pt.y + 6);
                ctx.stroke();
            }

            ctx.font = '9px "Courier New", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(c.name, pt.x + 6, pt.y + 3);
        });

        // 7. Draw Command Bunkers (Decapitation Targets)
        commandBunkers.forEach(b => {
            const pt = projectLatLon(b.lat, b.lon, w, h);
            const col = b.side === 'USA' ? '#00ffcc' : '#ffaa00';
            ctx.strokeStyle = b.alive ? col : '#552222';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y - 7);
            ctx.lineTo(pt.x + 7, pt.y);
            ctx.lineTo(pt.x, pt.y + 7);
            ctx.lineTo(pt.x - 7, pt.y);
            ctx.closePath();
            ctx.stroke();

            ctx.fillStyle = b.alive ? col : '#663333';
            ctx.font = 'bold 9px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(b.name.split(' ')[0], pt.x, pt.y - 10);
        });

        // 8. Draw Strategic Triad Units (Hollow 1983 Vector Geometry)
        units.forEach(u => {
            if (!u.alive) return;
            if (u.type === 'SSBN' && u.stealth && u.side !== playerSide) return;

            const pt = projectLatLon(u.lat, u.lon, w, h);
            const col = u.side === 'USA' ? '#38f8ff' : '#ff3b30';
            const isSelected = u.id === selectedUnitId;

            if (isSelected) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.strokeStyle = col;
            ctx.fillStyle = col;
            ctx.lineWidth = 1.6;

            if (u.type === 'SILO') {
                ctx.strokeRect(pt.x - 5, pt.y - 5, 10, 10);
                ctx.beginPath();
                ctx.moveTo(pt.x - 3, pt.y);
                ctx.lineTo(pt.x + 3, pt.y);
                ctx.moveTo(pt.x, pt.y - 3);
                ctx.lineTo(pt.x, pt.y + 3);
                ctx.stroke();
            } else if (u.type === 'SSBN') {
                ctx.beginPath();
                ctx.ellipse(pt.x, pt.y, 8, 3.5, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeRect(pt.x - 2, pt.y - 6, 4, 3);
            } else if (u.type === 'BOMBER') {
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y - 7);
                ctx.lineTo(pt.x + 7, pt.y + 5);
                ctx.lineTo(pt.x, pt.y + 2);
                ctx.lineTo(pt.x - 7, pt.y + 5);
                ctx.closePath();
                ctx.stroke();
            } else if (u.type === 'ABM') {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        });

        // 9. Draw DSP / Oko Satellites
        satellites.forEach(sat => {
            const pt = projectLatLon(sat.lat, sat.lon, w, h);
            ctx.strokeStyle = sat.side === 'USA' ? 'rgba(56, 248, 255, 0.7)' : 'rgba(255, 174, 0, 0.7)';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(pt.x - 3, pt.y - 3, 6, 6);
            ctx.beginPath();
            ctx.moveTo(pt.x - 8, pt.y);
            ctx.lineTo(pt.x + 8, pt.y);
            ctx.stroke();
        });

        // 10. Draw Glowing Parabolic ICBM & MIRV Trajectories (1983 NORAD High-Contrast Vector Arcs)
        activeMissiles.forEach(m => {
            const pStart = projectLatLon(m.fromLat, m.fromLon, w, h);
            const pEnd = projectLatLon(m.toLat, m.toLon, w, h);
            const lx = pStart.x + (pEnd.x - pStart.x) * m.progress;
            const ly = pStart.y + (pEnd.y - pStart.y) * m.progress;
            const arcLift = Math.sin(m.progress * Math.PI) * m.arcHeight;
            const cx = lx;
            const cy = ly - arcLift;

            // Outer bloom arc
            ctx.save();
            ctx.strokeStyle = m.side === 'USA' ? '#38f8ff' : '#ff3b30';
            ctx.lineWidth = m.isMirvChild ? 2.6 : 3.6;
            ctx.globalAlpha = 0.32;
            ctx.beginPath();
            ctx.moveTo(pStart.x, pStart.y);
            const midX = (pStart.x + cx) * 0.5;
            const midY = (pStart.y + cy) * 0.5 - arcLift * 0.5;
            ctx.quadraticCurveTo(midX, midY, cx, cy);
            ctx.stroke();
            ctx.restore();

            // Crisp vector core arc
            ctx.strokeStyle = m.side === 'USA' ? '#d8ffff' : '#ff9988';
            ctx.lineWidth = m.isMirvChild ? 1.3 : 1.9;
            ctx.beginPath();
            ctx.moveTo(pStart.x, pStart.y);
            ctx.quadraticCurveTo(midX, midY, cx, cy);
            ctx.stroke();

            // Reentry Vehicle Vector Tip
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, m.isMirvChild ? 2.6 : 3.4, 0, Math.PI * 2);
            ctx.fill();
        });

        // 11. Draw ABM Interceptors
        activeInterceptors.forEach(abm => {
            const pStart = projectLatLon(abm.fromLat, abm.fromLon, w, h);
            const pCur = projectLatLon(abm.curLat, abm.curLon, w, h);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 1.6;
            ctx.setLineDash([3, 2]);
            ctx.beginPath();
            ctx.moveTo(pStart.x, pStart.y);
            ctx.lineTo(pCur.x, pCur.y);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // 12. Draw 1983 Hollow Concentric Vector Detonation Rings (No Solid Fill)
        for (let i = explosions.length - 1; i >= 0; i--) {
            const e = explosions[i];
            e.r += 1.35;
            const alpha = Math.max(0, 1 - e.r / e.maxR);
            const pt = projectLatLon(e.lat, e.lon, w, h);

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, e.r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = e.isEmp
                ? `rgba(56, 248, 255, ${(alpha * 0.85).toFixed(2)})`
                : `rgba(255, 190, 60, ${(alpha * 0.85).toFixed(2)})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, e.r * 0.65, 0, Math.PI * 2);
            ctx.stroke();

            if (e.r >= e.maxR) {
                explosions.splice(i, 1);
            }
        }

        // 13. 1983 NORAD Bottom Vector Status Readout Box (Exact Movie Telemetry Overlay)
        const boxW = Math.min(620, w - 24);
        const boxH = 54;
        const boxX = (w - boxW) * 0.5;
        const boxY = h - boxH - 8;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.86)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = mainColor;
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.textAlign = 'left';
        const remSec = Math.max(0, 28 * 3600 - elapsedSimSeconds);
        ctx.fillText(`GAME TIME ELAPSED: ${formatMovieClock(elapsedSimSeconds)}`, boxX + 12, boxY + 17);
        ctx.textAlign = 'right';
        ctx.fillText(`ESTIMATED REMAINING: ${formatMovieClock(remSec)}`, boxX + boxW - 12, boxY + 17);

        ctx.textAlign = 'left';
        const modeLabel = gameMode === 'MOVIE' ? '1983 FILM SEQUENCE' : 'STRATEGIC WARGAMER (PLAY TO WIN)';
        ctx.fillText(`MODE: ${modeLabel}  •  PLAN: ${currentScenario}`, boxX + 12, boxY + 34);

        ctx.textAlign = 'right';
        if (gameMode === 'MOVIE') {
            const cpeStr = CPE_CODE.map((ch, idx) => idx < cpeLockedCount ? ch : (cpeActive ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : '_')).join(' ');
            ctx.fillStyle = cpeActive ? '#ff3b30' : mainColor;
            ctx.fillText(`LAUNCH CODE: [ ${cpeStr} ]`, boxX + boxW - 12, boxY + 34);
        } else {
            const enemySide = playerSide === 'USA' ? 'USSR' : 'USA';
            const enemyArmed = units.filter(u => u.side === enemySide && u.alive && u.missiles > 0 && u.type !== 'ABM').length;
            ctx.fillStyle = '#00ff88';
            ctx.fillText(`ENEMY C3I: ${commandAuthority[enemySide]}% • ARMED LAUNCHERS: ${enemyArmed}`, boxX + boxW - 12, boxY + 34);
        }

        ctx.fillStyle = '#d8ffff';
        ctx.textAlign = 'center';
        ctx.font = '10px "Courier New", monospace';
        ctx.fillText(`PRIMARY TARGETS: 01 LAS VEGAS (36.17°N 115.14°W)  •  02 SEATTLE (47.60°N 122.33°W)`, boxX + boxW * 0.5, boxY + 48);
        ctx.restore();

        // 14. Wargamer Mode Live Victory / Defeat Vector Banner
        if (gameMode === 'WARGAME' && wargameOutcome) {
            const bw = Math.min(560, w - 40);
            const bh = 74;
            const bx = (w - bw) * 0.5;
            const by = 48;
            ctx.save();
            ctx.fillStyle = 'rgba(0, 8, 14, 0.92)';
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeStyle = wargameOutcome.winner === playerSide ? '#00ff88' : '#ff3b30';
            ctx.lineWidth = 2.2;
            ctx.strokeRect(bx, by, bw, bh);

            ctx.fillStyle = wargameOutcome.winner === playerSide ? '#00ff88' : '#ff3b30';
            ctx.font = 'bold 16px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(wargameOutcome.title, bx + bw * 0.5, by + 28);

            ctx.fillStyle = '#d8ffff';
            ctx.font = '11px "Courier New", monospace';
            ctx.fillText(wargameOutcome.subtitle, bx + bw * 0.5, by + 48);
            ctx.fillText('[SELECT ANY WAR PLAN IN TRIAD TAB TO START A NEW CAMPAIGN]', bx + bw * 0.5, by + 64);
            ctx.restore();
        }

        // 15. EMP Static Interference Glitch Lines
        if (empInterference > 0.05) {
            ctx.strokeStyle = `rgba(56, 248, 255, ${(empInterference * 0.4).toFixed(2)})`;
            for (let g = 0; g < 4; g++) {
                const gy = Math.random() * h;
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(w, gy);
                ctx.stroke();
            }
        }

        requestAnimationFrame(renderBigBoard);
    }

    /* ========================================================================
     * INTERACTIVE CANVAS CLICK TARGETING (FRIENDLY UNIT -> ENEMY TARGET)
     * ======================================================================== */
    function handleCanvasClick(evt) {
        const ca = elCanvas();
        if (!ca) return;
        const rect = ca.getBoundingClientRect();
        const mx = evt.clientX - rect.left;
        const my = evt.clientY - rect.top;
        const w = ca.width;
        const h = ca.height;

        // 1. Check if player clicked one of their own Triad units to select it
        for (const u of units) {
            if (u.side === playerSide && u.alive && u.type !== 'ABM') {
                const pt = projectLatLon(u.lat, u.lon, w, h);
                if (Math.hypot(pt.x - mx, pt.y - my) < 16) {
                    selectedUnitId = u.id;
                    renderTriadRoster();
                    const hint = document.getElementById('targeting-hint');
                    if (hint) hint.textContent = `ARMED: ${u.name} -> CLICK ENEMY SILO, BUNKER, OR CITY`;
                    WoprAudio.beep(1040, 0.04);
                    return;
                }
            }
        }

        // 2. Otherwise find nearest enemy target (Silo/Unit, Command Bunker, Radar, or City)
        const enemySide = playerSide === 'USA' ? 'USSR' : 'USA';
        const candidates = [
            ...units.filter(u => u.side === enemySide && u.alive && (!u.stealth)).map(u => ({ lat: u.lat, lon: u.lon, name: u.name, targetType: 'UNIT', ref: u })),
            ...commandBunkers.filter(b => b.side === enemySide && b.alive).map(b => ({ lat: b.lat, lon: b.lon, name: b.name, targetType: 'BUNKER', ref: b })),
            ...radars.filter(r => r.side === enemySide && r.alive).map(r => ({ lat: r.lat, lon: r.lon, name: r.name, targetType: 'RADAR', ref: r })),
            ...cities.filter(c => c.side === enemySide).map(c => ({ lat: c.lat, lon: c.lon, name: c.name, targetType: 'CITY', ref: c }))
        ];

        let bestTarget = null;
        let bestDist = Infinity;
        for (const cand of candidates) {
            const pt = projectLatLon(cand.lat, cand.lon, w, h);
            const d = Math.hypot(pt.x - mx, pt.y - my);
            if (d < bestDist) {
                bestDist = d;
                bestTarget = cand;
            }
        }

        if (bestTarget && bestDist < 95) {
            let launcher = units.find(u => u.id === selectedUnitId && u.side === playerSide && u.alive && u.missiles > 0);
            if (!launcher) {
                launcher = units.find(u => u.side === playerSide && u.alive && u.missiles > 0 && u.type !== 'ABM');
                if (launcher) selectedUnitId = launcher.id;
            }
            if (launcher) {
                log(`[STRATEGIC LAUNCH] ${launcher.name} -> ${bestTarget.name} (${bestTarget.targetType})!`, 'error');
                launchUnitAtTarget(launcher, bestTarget);
            } else {
                log('[NORAD] ALL FRIENDLY LAUNCHERS EXPENDED.', 'warning');
            }
        }
    }

    /* ========================================================================
     * UI TOGGLES & INITIALIZATION
     * ======================================================================== */
    function toggleProjection() {
        projectionMode = projectionMode === 'MERCATOR' ? 'POLAR' : 'MERCATOR';
        const btn = document.getElementById('btn-projection');
        if (btn) btn.textContent = `MAP: ${projectionMode}`;
        WoprAudio.beep(780, 0.04);
    }

    function cycleTheme() {
        themeIndex = (themeIndex + 1) % themes.length;
        const t = themes[themeIndex];
        document.body.classList.remove('theme-green', 'theme-amber');
        if (t === 'green') document.body.classList.add('theme-green');
        if (t === 'amber') document.body.classList.add('theme-amber');
        const labels = { cyan: 'P1 CYAN', green: 'P39 GREEN', amber: 'P3 AMBER' };
        const btn = document.getElementById('btn-theme');
        if (btn) btn.textContent = `CRT: ${labels[t]}`;
        WoprAudio.beep(740, 0.04);
    }

    function toggleCrtFx() {
        crtFxEnabled = !crtFxEnabled;
        document.body.classList.toggle('crt-curvature', crtFxEnabled);
        document.body.classList.toggle('crt-off', !crtFxEnabled);
        const btn = document.getElementById('btn-crt-fx');
        if (btn) {
            btn.textContent = `SCANLINES: ${crtFxEnabled ? 'ON' : 'OFF'}`;
            btn.classList.toggle('active', crtFxEnabled);
        }
    }

    function toggleAudio() {
        const on = WoprAudio.toggle();
        const btn = document.getElementById('btn-audio');
        if (btn) {
            btn.textContent = `AUDIO: ${on ? 'ON' : 'OFF'}`;
            btn.classList.toggle('active', on);
        }
    }

    function init() {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        renderWarDialList();
        buildInitialOrderOfBattle();

        log('IMSAI 8080 MICROCOMPUTER SYSTEM • MODEM 300 BAUD (BELL 103)', 'system');
        log('CONNECTED TO SUNNYVALE / CHEYENNE MOUNTAIN NODE (311-555-4855)', 'system');
        log('LOGON: JOSHUA', 'dim');
        log('GREETINGS PROFESSOR FALKEN.', 'joshua');
        log('HOW ARE YOU FEELING TODAY?', 'joshua');
        log('SHALL WE PLAY A GAME?', 'joshua');

        const input = elInput();
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const val = input.value;
                    input.value = '';
                    processTerminalCommand(val);
                }
            });
        }

        const ca = elCanvas();
        if (ca) {
            ca.addEventListener('click', handleCanvasClick);
        }

        requestAnimationFrame(renderBigBoard);
    }

    window.addEventListener('load', init);

    return {
        runQuickCmd(cmd) {
            processTerminalCommand(cmd);
            const input = elInput();
            if (input) input.focus();
        },
        setGameMode,
        toggleImsaiFullscreen,
        playNextMovieStep,
        dialSunnyvale,
        startAutoWarDial,
        switchLeftTab,
        selectSide,
        loadScenario,
        executeDoctrine,
        fireAbmManual,
        toggleAutoAbm,
        startCpeTumblerSequence,
        stopCpeTumblerSequence,
        openTicTacToeModal,
        closeTicTacToeModal,
        startZeroPlayerTicTacToe,
        startOnePlayerTicTacToe,
        playTttCell,
        toggleProjection,
        cycleTheme,
        toggleCrtFx,
        toggleAudio,
        // Diagnostic state getter for automated verification
        getState() {
            return {
                phase: currentPhase,
                gameMode,
                imsaiFullscreen,
                wargameOutcome,
                defcon,
                playerSide,
                currentScenario,
                projectionMode,
                cpeCode: CPE_CODE.join(''),
                cpeLockedCount,
                unitsCount: units.length,
                radarsCount: radars.length,
                satellitesCount: satellites.length,
                bunkersCount: commandBunkers.length,
                citiesCount: cities.length,
                catalogCount: WOPR_GAME_CATALOG.length,
                scenariosCount: WOPR_SIM_SCENARIOS.length,
                activeMissilesCount: activeMissiles.length,
                totalMegatonsDetonated,
                casualtiesMillions,
                commandAuthority
            };
        }
    };
})();
