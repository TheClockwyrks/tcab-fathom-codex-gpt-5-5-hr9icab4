import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  ALERT_TIME,
  BINDINGS,
  BRIGHT_HALFLIFE,
  BRIGHT_HOLD,
  BRIGHT_PER_EAT,
  CUES,
  DEN_ORDER,
  DEN_RELEASE_GAP,
  DIVE_LABEL,
  DRIFTER_INTERVAL,
  DRIFTER_MAX,
  DRIFTER_SPEED,
  FATHOM_DEBUG_VERSION,
  FLARE_BLOOM,
  FLARE_CHARGE,
  FLARE_INTERVAL,
  FLARE_RADIUS,
  FORAGER_SPEED,
  GAMEOVER_ITEMS,
  GLOAMFIN_CHASE_SPEED,
  GLOAMFIN_CORNER_SPEED,
  GLOAMFIN_GIVEUP,
  GLOAMFIN_HEAR,
  GLOAMFIN_PING_INTERVAL,
  GLOAMFIN_PING_MIN_GAP,
  GLOAMFIN_PING_RANGE,
  GLOAMFIN_RAMP_TIME,
  GLOAMFIN_SEARCH_DELAY,
  GLOAMFIN_SEARCH_ROAM,
  GRID_COLS,
  GRID_ORIGIN_X,
  GRID_ORIGIN_Y,
  GRID_ROWS,
  INK_COOLDOWN,
  INK_LIFE,
  INK_RADIUS,
  KINDLE_VISION_GAIN,
  KINDLE_VISION_MIN,
  LANTERN_RANGE_BASE,
  LANTERN_RANGE_GAIN,
  LINGER_TIME,
  PAUSE_ITEMS,
  PLANKTON_DOT,
  PREDATOR_SPEED,
  type PredatorKind,
  ROSTER_ADD_ORDER,
  SCORE_CLEAR,
  SCORE_DRIFTER,
  SCORE_PLANKTON,
  SONAR_COOLDOWN,
  SONAR_MARK_TIME,
  SONAR_RANGE_BASE,
  SONAR_RANGE_MIN,
  SONAR_WAVE_SPEED,
  STAGE_H,
  STAGE_W,
  START_LIVES,
  TAGLINE_TEXT,
  TILE,
  TICK_DT,
  TITLE_ITEMS,
  TITLE_TEXT,
  VISION_GAIN,
  VISION_MIN,
} from "./constants";

export const BACKGROUND = "#041016";

type Direction = "up" | "down" | "left" | "right";
type Screen =
  | "title"
  | "howto"
  | "countdown"
  | "playing"
  | "paused"
  | "cleared"
  | "gameover";
type PredatorState = "den" | "wander" | "chase" | "search";
type PulseSource = "forager" | "gloamfin";
type PulseTint = "cyan" | "violet" | "orange";

interface Vec {
  readonly x: number;
  readonly y: number;
}

interface GridBody {
  readonly x: number;
  readonly y: number;
  readonly tx: number;
  readonly ty: number;
  readonly dir: Direction;
}

export interface ForagerState extends GridBody {
  readonly moving: boolean;
  readonly desiredDir: Direction;
}

export interface DrifterState {
  readonly x: number;
  readonly y: number;
  readonly tx: number;
  readonly ty: number;
  readonly dir: Direction;
  readonly lit: boolean;
  readonly mind: boolean;
  readonly travel: boolean;
}

export interface PredatorSnapshotState extends GridBody {
  readonly kind: PredatorKind;
  readonly state: PredatorState;
  readonly released: boolean;
  readonly mind: boolean;
  readonly travel: boolean;
  readonly speed: number;
  readonly alert: boolean;
  readonly lit: boolean;
  readonly detectRange: number | null;
  readonly hearingRange: number | null;
  readonly hearingLock: boolean | null;
  readonly flareCharging: boolean | null;
  readonly flaring: boolean | null;
  readonly flareRadius: number | null;
}

interface PredatorRuntimeState extends PredatorSnapshotState {
  readonly fix: TilePoint | null;
  readonly linger: number;
  readonly alertTime: number;
  readonly releaseTime: number;
  readonly sonarMark: number;
  readonly pingTimer: number;
  readonly pingGap: number;
  readonly pingCatches: readonly string[];
  readonly searchOrigin: TilePoint | null;
  readonly searchTime: number;
  readonly searchPingTime: number;
  readonly searchPingCast: boolean;
  readonly chaseSpeed: number;
  readonly ramp: number;
  readonly flareTimer: number;
  readonly flareCharge: number;
  readonly flareBloom: number;
  readonly flareFade: number;
}

export interface PulseState {
  readonly source: PulseSource;
  readonly tint: PulseTint;
  readonly ox: number;
  readonly oy: number;
  readonly front: number;
  readonly range: number;
  readonly caughtForager: boolean;
  readonly marks: readonly string[];
  readonly id: number;
}

export interface InkCloudState {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly remaining: number;
}

export interface AssetsState {
  readonly forager: readonly ImageBitmap[];
  readonly lanternjaw: readonly ImageBitmap[];
  readonly gloamfin: readonly ImageBitmap[];
  readonly flarefish: readonly ImageBitmap[];
  readonly drifter: readonly ImageBitmap[];
  readonly flareBloom: readonly ImageBitmap[];
  readonly tiles: readonly ImageBitmap[];
}

export interface FathomState {
  readonly version: 1;
  readonly screen: Screen;
  readonly menuIndex: number | null;
  readonly titleIndex: number;
  readonly depth: number;
  readonly score: number;
  readonly lives: number;
  readonly muted: boolean;
  readonly planktonRemaining: number;
  readonly drifterIn: number;
  readonly brightness: number;
  readonly brightHold: number;
  readonly visionRadius: number;
  readonly windowRadius: number;
  readonly sonar: {
    readonly ready: boolean;
    readonly cooldown: number;
    readonly range: number;
  };
  readonly ink: { readonly ready: boolean; readonly cooldown: number };
  readonly grid: {
    readonly cols: number;
    readonly rows: number;
    readonly tile: number;
    readonly originX: number;
    readonly originY: number;
  };
  readonly tiles: readonly string[];
  readonly plankton: readonly string[];
  readonly visibility: readonly string[];
  readonly forager: ForagerState;
  readonly drifters: readonly DrifterState[];
  readonly predators: readonly PredatorRuntimeState[];
  readonly pulses: readonly PulseState[];
  readonly inkClouds: readonly InkCloudState[];
  readonly simTime: number;
  readonly tickRemainder: number;
  readonly playTime: number;
  readonly countdown: number;
  readonly clearedTime: number;
  readonly startTile: TilePoint;
  readonly nextPulseId: number;
  readonly assets: AssetsState;
}

export type FathomSnapshot = Omit<
  FathomState,
  | "assets"
  | "tickRemainder"
  | "playTime"
  | "countdown"
  | "clearedTime"
  | "startTile"
  | "nextPulseId"
  | "predators"
  | "pulses"
> & {
  readonly predators: readonly PredatorSnapshotState[];
  readonly pulses: readonly Omit<
    PulseState,
    "caughtForager" | "marks" | "id"
  >[];
};

export interface FathomDebugApi {
  readonly version: 1;
  reset(state: DeepReadonly<FathomState>): FathomState;
  snapshot(state: DeepReadonly<FathomState>): FathomSnapshot;
  reconcile(state: DeepReadonly<FathomState>): FathomState;
  setScreen(state: DeepReadonly<FathomState>, s: Screen): FathomState;
  setMenuIndex(state: DeepReadonly<FathomState>, index: number): FathomState;
  setTitleIndex(state: DeepReadonly<FathomState>, index: number): FathomState;
  menuItemRect(
    state: DeepReadonly<FathomState>,
    index: number,
  ): { x: number; y: number; w: number; h: number } | null;
  setScore(state: DeepReadonly<FathomState>, points: number): FathomState;
  setLives(state: DeepReadonly<FathomState>, n: number): FathomState;
  setDepth(state: DeepReadonly<FathomState>, d: number): FathomState;
  setMaze(
    state: DeepReadonly<FathomState>,
    rows: readonly string[],
  ): FathomState;
  setPlankton(
    state: DeepReadonly<FathomState>,
    tx: number,
    ty: number,
    present: boolean,
  ): FathomState;
  clearPlankton(state: DeepReadonly<FathomState>): FathomState;
  clearFog(state: DeepReadonly<FathomState>): FathomState;
  setForagerTile(
    state: DeepReadonly<FathomState>,
    tx: number,
    ty: number,
  ): FathomState;
  setForagerDir(state: DeepReadonly<FathomState>, dir: Direction): FathomState;
  setBrightness(state: DeepReadonly<FathomState>, g: number): FathomState;
  setBrightHold(state: DeepReadonly<FathomState>, seconds: number): FathomState;
  clearPredators(state: DeepReadonly<FathomState>): FathomState;
  addPredator(
    state: DeepReadonly<FathomState>,
    kind: PredatorKind,
    tx: number,
    ty: number,
  ): FathomState;
  setPredatorTile(
    state: DeepReadonly<FathomState>,
    index: number,
    tx: number,
    ty: number,
  ): FathomState;
  setPredatorDir(
    state: DeepReadonly<FathomState>,
    index: number,
    dir: Direction,
  ): FathomState;
  setPredatorState(
    state: DeepReadonly<FathomState>,
    index: number,
    value: Exclude<PredatorState, "search">,
  ): FathomState;
  setPredatorReleased(
    state: DeepReadonly<FathomState>,
    index: number,
    released: boolean,
  ): FathomState;
  setPredatorMind(
    state: DeepReadonly<FathomState>,
    index: number,
    enabled: boolean,
  ): FathomState;
  setPredatorTravel(
    state: DeepReadonly<FathomState>,
    index: number,
    enabled: boolean,
  ): FathomState;
  spawnDrifter(
    state: DeepReadonly<FathomState>,
    tx: number,
    ty: number,
  ): FathomState;
  clearDrifters(state: DeepReadonly<FathomState>): FathomState;
  setDrifterMind(
    state: DeepReadonly<FathomState>,
    index: number,
    enabled: boolean,
  ): FathomState;
  setDrifterTravel(
    state: DeepReadonly<FathomState>,
    index: number,
    enabled: boolean,
  ): FathomState;
  setDrifterIn(state: DeepReadonly<FathomState>, seconds: number): FathomState;
  setSonarCooldown(
    state: DeepReadonly<FathomState>,
    seconds: number,
  ): FathomState;
  setInkCooldown(
    state: DeepReadonly<FathomState>,
    seconds: number,
  ): FathomState;
}

interface TilePoint {
  readonly tx: number;
  readonly ty: number;
}

interface TickResult {
  readonly state: FathomState;
  readonly cues: ReadonlySet<string>;
}

const COUNTDOWN_TIME = 2;
const CLEARED_TIME = 2;
const MENU_W = 360;
const MENU_H = 54;
const MENU_GAP = 14;
const DIRS: readonly Direction[] = ["up", "down", "left", "right"];
const VECTORS: Record<Direction, TilePoint> = {
  up: { tx: 0, ty: -1 },
  down: { tx: 0, ty: 1 },
  left: { tx: -1, ty: 0 },
  right: { tx: 1, ty: 0 },
};

let rngSeed = 0x51f7a0;

function random(): number {
  rngSeed = (rngSeed * 1664525 + 1013904223) >>> 0;
  return rngSeed / 0x100000000;
}

function tileCenter(tx: number, ty: number): Vec {
  return {
    x: GRID_ORIGIN_X + tx * TILE + TILE / 2,
    y: GRID_ORIGIN_Y + ty * TILE + TILE / 2,
  };
}

function tileOf(x: number, y: number): TilePoint {
  return {
    tx: Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.floor((x - GRID_ORIGIN_X) / TILE)),
    ),
    ty: Math.max(
      0,
      Math.min(GRID_ROWS - 1, Math.floor((y - GRID_ORIGIN_Y) / TILE)),
    ),
  };
}

function key(tx: number, ty: number): string {
  return `${tx},${ty}`;
}

function distance(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function opposite(dir: Direction): Direction {
  if (dir === "up") return "down";
  if (dir === "down") return "up";
  if (dir === "left") return "right";
  return "left";
}

function setChar(
  rows: readonly string[],
  tx: number,
  ty: number,
  ch: string,
): string[] {
  const copy = [...rows];
  const row = copy[ty] ?? "";
  copy[ty] = `${row.slice(0, tx)}${ch}${row.slice(tx + 1)}`;
  return copy;
}

function tileAt(rows: readonly string[], tx: number, ty: number): string {
  return rows[ty]?.[tx] ?? "#";
}

function isCorridor(rows: readonly string[], tx: number, ty: number): boolean {
  return tileAt(rows, tx, ty) === ".";
}

function isPredatorOpen(
  rows: readonly string[],
  tx: number,
  ty: number,
): boolean {
  const ch = tileAt(rows, tx, ty);
  return ch === "." || ch === "g" || ch === "d";
}

function wrappedNeighbor(
  rows: readonly string[],
  tx: number,
  ty: number,
  dir: Direction,
): TilePoint {
  let nx = tx + VECTORS[dir].tx;
  const ny = ty + VECTORS[dir].ty;
  if (ny >= 0 && ny < GRID_ROWS) {
    if (
      nx < 0 &&
      isCorridor(rows, 0, ty) &&
      isCorridor(rows, GRID_COLS - 1, ty)
    ) {
      nx = GRID_COLS - 1;
    } else if (
      nx >= GRID_COLS &&
      isCorridor(rows, 0, ty) &&
      isCorridor(rows, GRID_COLS - 1, ty)
    ) {
      nx = 0;
    }
  }
  return { tx: nx, ty: ny };
}

function openDirs(
  rows: readonly string[],
  tx: number,
  ty: number,
  predator: boolean,
): Direction[] {
  return DIRS.filter((dir) => {
    const n = wrappedNeighbor(rows, tx, ty, dir);
    return predator
      ? isPredatorOpen(rows, n.tx, n.ty)
      : isCorridor(rows, n.tx, n.ty);
  });
}

function sonarRange(depth: number): number {
  return Math.max(SONAR_RANGE_MIN, SONAR_RANGE_BASE - (depth - 1));
}

function visionRadius(g: number): number {
  return VISION_MIN + VISION_GAIN * g;
}

function windowRadius(g: number): number {
  return KINDLE_VISION_MIN + KINDLE_VISION_GAIN * g;
}

function detectRange(g: number): number {
  return LANTERN_RANGE_BASE + LANTERN_RANGE_GAIN * g;
}

function gridFrame(): FathomState["grid"] {
  return {
    cols: GRID_COLS,
    rows: GRID_ROWS,
    tile: TILE,
    originX: GRID_ORIGIN_X,
    originY: GRID_ORIGIN_Y,
  };
}

function generatedMaze(): readonly string[] {
  const rows = Array.from({ length: GRID_ROWS }, () => "#".repeat(GRID_COLS));
  const carve = (tx: number, ty: number, ch = ".") => {
    rows[ty] = `${rows[ty].slice(0, tx)}${ch}${rows[ty].slice(tx + 1)}`;
  };

  for (let ty = 1; ty < GRID_ROWS - 1; ty += 2) {
    for (let tx = 1; tx < GRID_COLS - 1; tx++) carve(tx, ty);
  }
  for (let tx = 1; tx < GRID_COLS - 1; tx += 4) {
    for (let ty = 1; ty < GRID_ROWS - 1; ty++) carve(tx, ty);
  }
  for (let tx = 3; tx < GRID_COLS - 1; tx += 8) {
    for (let ty = 2; ty < GRID_ROWS - 2; ty += 4) carve(tx, ty);
  }
  for (let tx = 32; tx > 1; tx -= 8) {
    for (let ty = 4; ty < GRID_ROWS - 2; ty += 4) carve(tx, ty);
  }
  for (let ty = 11; ty < 16; ty++) {
    carve(17, ty);
    carve(18, ty);
  }
  for (let tx = 7; tx <= 28; tx++) carve(tx, 15);

  const wrapRow = 9;
  for (let tx = 0; tx < GRID_COLS; tx++) carve(tx, wrapRow);

  for (let ty = 7; ty <= 9; ty++) {
    for (let tx = 16; tx <= 19; tx++) carve(tx, ty, "d");
  }
  carve(18, 6, "g");
  carve(18, 5);
  carve(17, 5);
  carve(19, 5);
  carve(17, 3);
  carve(19, 3);
  return rows;
}

function planktonFor(tiles: readonly string[]): string[] {
  return tiles.map((row) =>
    [...row].map((ch) => (ch === "." ? "*" : "-")).join(""),
  );
}

function countLayer(rows: readonly string[], ch: string): number {
  return rows.reduce(
    (total, row) => total + [...row].filter((cell) => cell === ch).length,
    0,
  );
}

function makePredator(
  kind: PredatorKind,
  index: number,
  released = false,
): PredatorRuntimeState {
  const denTiles: readonly TilePoint[] = [
    { tx: 17, ty: 8 },
    { tx: 18, ty: 8 },
    { tx: 16, ty: 8 },
    { tx: 19, ty: 8 },
    { tx: 17, ty: 9 },
    { tx: 18, ty: 9 },
  ];
  const spot = denTiles[index % denTiles.length] ?? { tx: 17, ty: 8 };
  const pos = tileCenter(spot.tx, spot.ty);
  return {
    kind,
    x: pos.x,
    y: pos.y,
    tx: spot.tx,
    ty: spot.ty,
    dir: "up",
    state: released ? "wander" : "den",
    released,
    mind: true,
    travel: true,
    speed: kind === "lanternjaw" && released ? DRIFTER_SPEED : PREDATOR_SPEED,
    alert: false,
    lit: false,
    detectRange: kind === "gloamfin" ? null : LANTERN_RANGE_BASE,
    hearingRange: kind === "gloamfin" ? GLOAMFIN_HEAR : null,
    hearingLock: kind === "gloamfin" ? false : null,
    flareCharging: kind === "flarefish" ? false : null,
    flaring: kind === "flarefish" ? false : null,
    flareRadius: kind === "flarefish" ? 0 : null,
    fix: null,
    linger: 0,
    alertTime: 0,
    releaseTime: index * DEN_RELEASE_GAP,
    sonarMark: 0,
    pingTimer: GLOAMFIN_PING_INTERVAL,
    pingGap: 0,
    pingCatches: [],
    searchOrigin: null,
    searchTime: 0,
    searchPingTime: 0,
    searchPingCast: false,
    chaseSpeed: GLOAMFIN_CHASE_SPEED,
    ramp: GLOAMFIN_RAMP_TIME,
    flareTimer: FLARE_INTERVAL,
    flareCharge: 0,
    flareBloom: 0,
    flareFade: 0,
  };
}

function roster(depth: number): readonly PredatorRuntimeState[] {
  const kinds: PredatorKind[] = [...DEN_ORDER];
  const extras = Math.min(depth - 1, ROSTER_ADD_ORDER.length);
  for (let i = 0; i < extras; i++)
    kinds.push(ROSTER_ADD_ORDER[i] ?? "gloamfin");
  return kinds.map((kind, index) => makePredator(kind, index));
}

function baseState(
  assets: AssetsState,
  muted: boolean,
  titleIndex = 0,
): FathomState {
  const tiles = generatedMaze();
  const startTile = { tx: 18, ty: 15 };
  const start = tileCenter(startTile.tx, startTile.ty);
  const plankton = planktonFor(tiles);
  return reconcileState({
    version: 1,
    screen: "title",
    menuIndex: titleIndex,
    titleIndex,
    depth: 1,
    score: 0,
    lives: START_LIVES,
    muted,
    planktonRemaining: countLayer(plankton, "*"),
    drifterIn: DRIFTER_INTERVAL,
    brightness: 0,
    brightHold: 0,
    visionRadius: VISION_MIN,
    windowRadius: KINDLE_VISION_MIN,
    sonar: { ready: true, cooldown: 0, range: SONAR_RANGE_BASE },
    ink: { ready: true, cooldown: 0 },
    grid: gridFrame(),
    tiles,
    plankton,
    visibility: Array.from({ length: GRID_ROWS }, () => "u".repeat(GRID_COLS)),
    forager: {
      x: start.x,
      y: start.y,
      tx: startTile.tx,
      ty: startTile.ty,
      dir: "left",
      moving: false,
      desiredDir: "left",
    },
    drifters: [],
    predators: roster(1),
    pulses: [],
    inkClouds: [],
    simTime: 0,
    tickRemainder: 0,
    playTime: 0,
    countdown: COUNTDOWN_TIME,
    clearedTime: CLEARED_TIME,
    startTile,
    nextPulseId: 1,
    assets,
  });
}

function beginDive(
  state: DeepReadonly<FathomState>,
  titleIndex = state.titleIndex,
): FathomState {
  return {
    ...baseState(state.assets, state.muted, titleIndex),
    screen: "countdown",
    menuIndex: null,
  };
}

function resetAttempt(state: FathomState): FathomState {
  const start = tileCenter(state.startTile.tx, state.startTile.ty);
  return reconcileState({
    ...state,
    screen: "countdown",
    menuIndex: null,
    brightness: 0,
    brightHold: 0,
    sonar: { ...state.sonar, cooldown: 0, ready: true },
    ink: { cooldown: 0, ready: true },
    drifterIn: DRIFTER_INTERVAL,
    forager: {
      ...state.forager,
      x: start.x,
      y: start.y,
      tx: state.startTile.tx,
      ty: state.startTile.ty,
      moving: false,
    },
    drifters: [],
    predators: roster(state.depth),
    pulses: [],
    inkClouds: [],
    playTime: 0,
    countdown: COUNTDOWN_TIME,
  });
}

function nextDepth(state: FathomState): FathomState {
  const base = baseState(state.assets, state.muted, state.titleIndex);
  return {
    ...base,
    screen: "countdown",
    menuIndex: null,
    depth: state.depth + 1,
    score: state.score,
    lives: state.lives,
    predators: roster(state.depth + 1),
    sonar: { ready: true, cooldown: 0, range: sonarRange(state.depth + 1) },
    simTime: state.simTime,
  };
}

function reconcileState<T extends FathomState>(state: T): T {
  const brightness = Math.max(0, Math.min(1, state.brightness));
  return {
    ...state,
    brightness,
    planktonRemaining: countLayer(state.plankton, "*"),
    visionRadius: visionRadius(brightness),
    windowRadius: windowRadius(brightness),
    sonar: {
      ready: state.sonar.cooldown <= 0,
      cooldown: Math.max(0, state.sonar.cooldown),
      range: sonarRange(state.depth),
    },
    ink: {
      ready: state.ink.cooldown <= 0,
      cooldown: Math.max(0, state.ink.cooldown),
    },
    forager: { ...state.forager, ...tileOf(state.forager.x, state.forager.y) },
    drifters: state.drifters.map((d) => ({ ...d, ...tileOf(d.x, d.y) })),
    predators: state.predators.map((p) => {
      const t = tileOf(p.x, p.y);
      return {
        ...p,
        ...t,
        speed: predatorSpeed(p),
        detectRange: p.kind === "gloamfin" ? null : detectRange(brightness),
        hearingRange: p.kind === "gloamfin" ? GLOAMFIN_HEAR : null,
        flareRadius:
          p.kind === "flarefish" ? (p.flareBloom > 0 ? FLARE_RADIUS : 0) : null,
      };
    }),
  };
}

function predatorSpeed(p: DeepReadonly<PredatorRuntimeState>): number {
  if (p.state === "den") return PREDATOR_SPEED;
  if (p.kind === "lanternjaw" && p.state === "wander") return DRIFTER_SPEED;
  if (p.kind === "gloamfin" && p.state === "chase") return p.chaseSpeed;
  return PREDATOR_SPEED;
}

function snapshot(state: DeepReadonly<FathomState>): FathomSnapshot {
  const {
    assets,
    tickRemainder,
    playTime,
    countdown,
    clearedTime,
    startTile,
    nextPulseId,
    ...plain
  } = state;
  void assets;
  void tickRemainder;
  void playTime;
  void countdown;
  void clearedTime;
  void startTile;
  void nextPulseId;
  return {
    ...plain,
    predators: state.predators.map(
      ({
        fix,
        linger,
        alertTime,
        releaseTime,
        sonarMark,
        pingTimer,
        pingGap,
        pingCatches,
        searchOrigin,
        searchTime,
        searchPingTime,
        searchPingCast,
        chaseSpeed,
        ramp,
        flareTimer,
        flareCharge,
        flareBloom,
        flareFade,
        ...p
      }) => {
        void fix;
        void linger;
        void alertTime;
        void releaseTime;
        void sonarMark;
        void pingTimer;
        void pingGap;
        void pingCatches;
        void searchOrigin;
        void searchTime;
        void searchPingTime;
        void searchPingCast;
        void chaseSpeed;
        void ramp;
        void flareTimer;
        void flareCharge;
        void flareBloom;
        void flareFade;
        return p;
      },
    ),
    pulses: state.pulses.map(({ caughtForager, marks, id, ...pulse }) => {
      void caughtForager;
      void marks;
      void id;
      return pulse;
    }),
  };
}

function lineHitsRock(rows: readonly string[], a: Vec, b: Vec): boolean {
  const steps = Math.max(4, Math.ceil(distance(a, b) / 8));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const p = tileOf(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    if (tileAt(rows, p.tx, p.ty) === "#") return true;
  }
  return false;
}

function cloudBlocks(
  a: Vec,
  b: Vec,
  cloud: DeepReadonly<InkCloudState>,
): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t =
    len2 === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((cloud.x - a.x) * dx + (cloud.y - a.y) * dy) / len2),
        );
  const x = a.x + dx * t;
  const y = a.y + dy * t;
  return Math.hypot(cloud.x - x, cloud.y - y) <= cloud.radius;
}

function blinded(
  predator: DeepReadonly<PredatorRuntimeState>,
  forager: DeepReadonly<ForagerState>,
  clouds: readonly DeepReadonly<InkCloudState>[],
): boolean {
  if (predator.kind === "gloamfin") return false;
  return clouds.some(
    (cloud) =>
      Math.hypot(predator.x - cloud.x, predator.y - cloud.y) <= cloud.radius ||
      cloudBlocks(predator, forager, cloud),
  );
}

function canSenseLight(
  p: DeepReadonly<PredatorRuntimeState>,
  state: DeepReadonly<FathomState>,
): boolean {
  if (p.kind === "gloamfin" || blinded(p, state.forager, state.inkClouds))
    return false;
  return (
    distance(p, state.forager) <= detectRange(state.brightness) &&
    !lineHitsRock(state.tiles, p, state.forager)
  );
}

function shortestDir(
  rows: readonly string[],
  from: TilePoint,
  to: TilePoint,
  predator: boolean,
): Direction | null {
  if (from.tx === to.tx && from.ty === to.ty) return null;
  const queue: TilePoint[] = [from];
  const seen = new Set([key(from.tx, from.ty)]);
  const first = new Map<string, Direction>();
  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi];
    if (!cur) break;
    for (const dir of openDirs(rows, cur.tx, cur.ty, predator)) {
      const n = wrappedNeighbor(rows, cur.tx, cur.ty, dir);
      const k = key(n.tx, n.ty);
      if (seen.has(k)) continue;
      seen.add(k);
      first.set(k, first.get(key(cur.tx, cur.ty)) ?? dir);
      if (n.tx === to.tx && n.ty === to.ty) return first.get(k) ?? dir;
      queue.push(n);
    }
  }
  return null;
}

function chooseWander(
  rows: readonly string[],
  body: GridBody,
  predator: boolean,
): Direction {
  const dirs = openDirs(rows, body.tx, body.ty, predator);
  if (dirs.length === 0) return body.dir;
  const forward = dirs.filter((dir) => dir !== opposite(body.dir));
  const choices = forward.length > 0 ? forward : dirs;
  return choices[Math.floor(random() * choices.length)] ?? body.dir;
}

function atCenter(body: GridBody): boolean {
  const c = tileCenter(body.tx, body.ty);
  return Math.abs(body.x - c.x) < 0.01 && Math.abs(body.y - c.y) < 0.01;
}

function moveBody<T extends GridBody>(
  rows: readonly string[],
  body: T,
  dir: Direction,
  speed: number,
  dt: number,
  predator: boolean,
): T {
  if (speed <= 0) return body;
  let remaining = speed * dt;
  let current: T = { ...body, dir };
  while (remaining > 0.0001) {
    const center = tileCenter(current.tx, current.ty);
    const targetTile = wrappedNeighbor(
      rows,
      current.tx,
      current.ty,
      current.dir,
    );
    const open = predator
      ? isPredatorOpen(rows, targetTile.tx, targetTile.ty)
      : isCorridor(rows, targetTile.tx, targetTile.ty);
    if (!open) return { ...current, x: center.x, y: center.y };
    const target = tileCenter(targetTile.tx, targetTile.ty);
    const d = distance(current, target);
    if (remaining >= d) {
      remaining -= d;
      current = {
        ...current,
        x: target.x,
        y: target.y,
        tx: targetTile.tx,
        ty: targetTile.ty,
      };
    } else {
      const ratio = remaining / d;
      current = {
        ...current,
        x: current.x + (target.x - current.x) * ratio,
        y: current.y + (target.y - current.y) * ratio,
      };
      remaining = 0;
    }
  }
  return current;
}

function stepForager(state: FathomState): FathomState {
  const f = state.forager;
  let dir = f.dir;
  let moving = f.moving;
  if (f.desiredDir === opposite(f.dir)) {
    dir = f.desiredDir;
    moving = true;
  }
  if (atCenter(f)) {
    const desired = wrappedNeighbor(state.tiles, f.tx, f.ty, f.desiredDir);
    const ahead = wrappedNeighbor(state.tiles, f.tx, f.ty, dir);
    if (isCorridor(state.tiles, desired.tx, desired.ty)) {
      dir = f.desiredDir;
      moving = true;
    } else if (!isCorridor(state.tiles, ahead.tx, ahead.ty)) {
      moving = false;
    }
  }
  const moved = moving
    ? moveBody(
        state.tiles,
        { ...f, dir, moving },
        dir,
        FORAGER_SPEED,
        TICK_DT,
        false,
      )
    : { ...f, dir, moving };
  return { ...state, forager: { ...moved, desiredDir: f.desiredDir, moving } };
}

function revealLight(state: FathomState): FathomState {
  let visibility = state.visibility.map((row) => row.replace(/l/gu, "r"));
  const litTiles = new Set<string>();
  for (let ty = 0; ty < GRID_ROWS; ty++) {
    for (let tx = 0; tx < GRID_COLS; tx++) {
      const center = tileCenter(tx, ty);
      if (
        distance(state.forager, center) <= state.visionRadius &&
        !lineHitsRock(state.tiles, state.forager, center)
      ) {
        litTiles.add(key(tx, ty));
        visibility = setChar(visibility, tx, ty, "l");
      }
    }
  }
  for (const p of state.predators) {
    if (p.kind === "flarefish" && p.flareBloom > 0) {
      for (let ty = 0; ty < GRID_ROWS; ty++) {
        for (let tx = 0; tx < GRID_COLS; tx++) {
          if (distance(p, tileCenter(tx, ty)) <= FLARE_RADIUS) {
            litTiles.add(key(tx, ty));
            visibility = setChar(visibility, tx, ty, "l");
          }
        }
      }
    }
  }
  const drifters = state.drifters.map((d) => ({
    ...d,
    lit: litTiles.has(key(d.tx, d.ty)),
  }));
  const predators = state.predators.map((p) => {
    const lit =
      (p.kind !== "lanternjaw" && p.sonarMark > 0) ||
      p.alertTime > 0 ||
      litTiles.has(key(p.tx, p.ty)) ||
      state.predators.some(
        (f) =>
          f.kind === "flarefish" &&
          f.flareBloom > 0 &&
          distance(f, p) <= FLARE_RADIUS,
      );
    return { ...p, lit, alert: p.alertTime > 0 };
  });
  return { ...state, visibility, drifters, predators };
}

function pulseDistances(
  rows: readonly string[],
  origin: TilePoint,
  range: number,
): Map<string, number> {
  const dist = new Map<string, number>([[key(origin.tx, origin.ty), 0]]);
  const queue: TilePoint[] = [origin];
  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi];
    if (!cur) break;
    const d = dist.get(key(cur.tx, cur.ty)) ?? 0;
    if (d >= range) continue;
    for (const dir of openDirs(rows, cur.tx, cur.ty, false)) {
      const n = wrappedNeighbor(rows, cur.tx, cur.ty, dir);
      const k = key(n.tx, n.ty);
      if (dist.has(k)) continue;
      dist.set(k, d + 1);
      queue.push(n);
    }
  }
  return dist;
}

function revealPulse(
  state: FathomState,
  pulse: PulseState,
  previous: number,
): FathomState {
  if (pulse.source !== "forager") return state;
  const distances = pulseDistances(
    state.tiles,
    { tx: pulse.ox, ty: pulse.oy },
    pulse.range,
  );
  let visibility = state.visibility;
  let predators = state.predators;
  distances.forEach((d, k) => {
    if (d > previous && d <= pulse.front) {
      const [txText, tyText] = k.split(",");
      const tx = Number(txText);
      const ty = Number(tyText);
      visibility = setChar(visibility, tx, ty, "l");
      for (const dir of DIRS) {
        const n = wrappedNeighbor(state.tiles, tx, ty, dir);
        if (tileAt(state.tiles, n.tx, n.ty) === "#")
          visibility = setChar(visibility, n.tx, n.ty, "l");
      }
      predators = predators.map((p) =>
        p.kind !== "lanternjaw" && p.tx === tx && p.ty === ty
          ? { ...p, sonarMark: SONAR_MARK_TIME, lit: true }
          : p,
      );
    }
  });
  return { ...state, visibility, predators };
}

function stepPulses(state: FathomState, cues: Set<string>): FathomState {
  let next: FathomState = { ...state, pulses: [] };
  for (const pulse of state.pulses) {
    const previous = pulse.front;
    const advanced = {
      ...pulse,
      front: pulse.front + SONAR_WAVE_SPEED * TICK_DT,
    };
    next = revealPulse(next, advanced, previous);
    if (advanced.source === "gloamfin" && !advanced.caughtForager) {
      const dist = pulseDistances(
        next.tiles,
        { tx: advanced.ox, ty: advanced.oy },
        advanced.range,
      );
      const foragerDist = dist.get(key(next.forager.tx, next.forager.ty));
      if (
        foragerDist !== undefined &&
        foragerDist > previous &&
        foragerDist <= advanced.front
      ) {
        next = acquireGloamfinByPing(next, advanced.id);
        next = {
          ...next,
          pulses: [...next.pulses, { ...advanced, caughtForager: true }],
        };
        continue;
      }
    }
    if (advanced.front <= advanced.range + 0.7)
      next = { ...next, pulses: [...next.pulses, advanced] };
  }
  cues.delete("");
  return next;
}

function acquireGloamfinByPing(
  state: FathomState,
  pulseId: number,
): FathomState {
  return {
    ...state,
    predators: state.predators.map((p) => {
      if (p.kind !== "gloamfin" || p.pingCatches.includes(String(pulseId)))
        return p;
      return acquirePredator(
        p,
        { tx: state.forager.tx, ty: state.forager.ty },
        true,
        {
          pingCatches: [...p.pingCatches, String(pulseId)],
        },
      );
    }),
  };
}

function acquirePredator(
  p: PredatorRuntimeState,
  fix: TilePoint,
  alert: boolean,
  patch: Partial<PredatorRuntimeState> = {},
): PredatorRuntimeState {
  const fresh = p.state !== "chase";
  return {
    ...p,
    ...patch,
    state: "chase",
    fix,
    linger: LINGER_TIME,
    alertTime: alert && fresh ? ALERT_TIME : p.alertTime,
    chaseSpeed:
      p.kind === "gloamfin" && fresh ? GLOAMFIN_CHASE_SPEED : p.chaseSpeed,
    ramp: GLOAMFIN_RAMP_TIME,
    searchOrigin: null,
    searchTime: 0,
    searchPingCast: false,
  };
}

function stepPredatorMind(
  state: FathomState,
  p: PredatorRuntimeState,
  index: number,
  cues: Set<string>,
): PredatorRuntimeState {
  let next = {
    ...p,
    alertTime: Math.max(0, p.alertTime - TICK_DT),
    sonarMark: Math.max(0, p.sonarMark - TICK_DT),
    pingGap: Math.max(0, p.pingGap - TICK_DT),
  };
  if (!next.released && state.playTime >= next.releaseTime)
    next = { ...next, released: true };
  if (!next.mind) return next;
  if (next.state === "den" && next.released && atCenter(next) && next.ty <= 6)
    next = { ...next, state: "wander" };
  if (next.kind === "lanternjaw") {
    if (canSenseLight(next, state)) {
      next = acquirePredator(
        next,
        { tx: state.forager.tx, ty: state.forager.ty },
        false,
      );
    } else if (next.state === "chase") {
      if (blinded(next, state.forager, state.inkClouds))
        next = { ...next, state: "wander", fix: null, linger: 0 };
      else {
        const linger = Math.max(0, next.linger - TICK_DT);
        next =
          linger <= 0
            ? { ...next, state: "wander", fix: null, linger: 0 }
            : { ...next, linger };
      }
    }
  } else if (next.kind === "flarefish") {
    const lightSense = canSenseLight(next, state);
    if (lightSense) {
      next = acquirePredator(
        next,
        { tx: state.forager.tx, ty: state.forager.ty },
        true,
      );
    } else if (
      next.flareBloom > 0 &&
      !blinded(next, state.forager, state.inkClouds) &&
      distance(next, state.forager) <= FLARE_RADIUS
    ) {
      cues.add(CUES.flare);
      next = acquirePredator(
        next,
        { tx: state.forager.tx, ty: state.forager.ty },
        true,
        {
          flareBloom: 0,
          flaring: false,
        },
      );
    } else if (next.state === "chase") {
      if (blinded(next, state.forager, state.inkClouds)) {
        next = {
          ...next,
          state: "wander",
          fix: null,
          linger: 0,
          flareTimer: FLARE_INTERVAL,
        };
      } else {
        const linger = Math.max(0, next.linger - TICK_DT);
        next =
          linger <= 0
            ? {
                ...next,
                state: "wander",
                fix: null,
                linger: 0,
                flareTimer: FLARE_INTERVAL,
              }
            : { ...next, linger };
      }
    } else if (next.state === "wander") {
      next = stepFlareTimer(next, cues);
    }
  } else {
    const hearing = distance(next, state.forager) <= GLOAMFIN_HEAR;
    if (hearing) {
      next = acquirePredator(
        next,
        { tx: state.forager.tx, ty: state.forager.ty },
        true,
        {
          hearingLock: true,
        },
      );
    } else {
      next = { ...next, hearingLock: false };
      if (
        next.state === "chase" &&
        next.fix &&
        next.tx === next.fix.tx &&
        next.ty === next.fix.ty
      ) {
        if (next.tx !== state.forager.tx || next.ty !== state.forager.ty) {
          next = {
            ...next,
            state: "search",
            searchOrigin: next.fix,
            searchTime: GLOAMFIN_GIVEUP,
            searchPingTime: GLOAMFIN_SEARCH_DELAY,
            searchPingCast: false,
          };
        }
      } else if (next.state === "search") {
        next = stepSearch(next, state, cues);
      }
      next = stepGloamfinPing(next, state, cues, "violet", false, index);
    }
  }
  return next;
}

function stepFlareTimer(
  p: PredatorRuntimeState,
  cues: Set<string>,
): PredatorRuntimeState {
  if (p.flareCharge > 0) {
    const charge = Math.max(0, p.flareCharge - TICK_DT);
    if (charge === 0) {
      cues.add(CUES.flare);
      return {
        ...p,
        flareCharge: 0,
        flareCharging: false,
        flareBloom: FLARE_BLOOM,
        flaring: true,
      };
    }
    return { ...p, flareCharge: charge, flareCharging: true };
  }
  if (p.flareBloom > 0) {
    const bloom = Math.max(0, p.flareBloom - TICK_DT);
    return bloom === 0
      ? {
          ...p,
          flareBloom: 0,
          flaring: false,
          flareRadius: 0,
          flareFade: 0.4,
          flareTimer: FLARE_INTERVAL,
        }
      : { ...p, flareBloom: bloom, flaring: true, flareRadius: FLARE_RADIUS };
  }
  const timer = Math.max(0, p.flareTimer - TICK_DT);
  return timer === 0
    ? { ...p, flareTimer: 0, flareCharge: FLARE_CHARGE, flareCharging: true }
    : { ...p, flareTimer: timer };
}

function stepSearch(
  p: PredatorRuntimeState,
  state: FathomState,
  cues: Set<string>,
): PredatorRuntimeState {
  let next = {
    ...p,
    searchTime: Math.max(0, p.searchTime - TICK_DT),
    searchPingTime: Math.max(0, p.searchPingTime - TICK_DT),
  };
  if (!next.searchPingCast && next.searchPingTime <= 0) {
    next = stepGloamfinPing(next, state, cues, "orange", true, 0);
  }
  if (next.searchTime <= 0)
    next = { ...next, state: "wander", fix: null, searchOrigin: null };
  return next;
}

function stepGloamfinPing(
  p: PredatorRuntimeState,
  state: FathomState,
  cues: Set<string>,
  tint: PulseTint,
  forced: boolean,
  index: number,
): PredatorRuntimeState {
  if (p.hearingLock) return p;
  const timer = forced ? 0 : Math.max(0, p.pingTimer - TICK_DT);
  if (timer <= 0 && p.pingGap <= 0) {
    void state;
    void tint;
    void index;
    cues.add(CUES.predatorPing);
    return {
      ...p,
      pingTimer: GLOAMFIN_PING_INTERVAL,
      pingGap: GLOAMFIN_PING_MIN_GAP,
      searchPingCast: forced || p.searchPingCast,
    };
  }
  return { ...p, pingTimer: timer };
}

function stepPredatorTravel(
  state: FathomState,
  p: PredatorRuntimeState,
): PredatorRuntimeState {
  if (!p.travel || !p.released) return p;
  let dir = p.dir;
  if (p.state === "den") {
    const target = p.ty > 6 ? { tx: 18, ty: 6 } : { tx: 18, ty: 5 };
    dir = shortestDir(state.tiles, p, target, true) ?? "up";
  } else if (atCenter(p)) {
    if (p.state === "chase" && p.fix) {
      const nextDir = shortestDir(state.tiles, p, p.fix, true);
      if (nextDir) {
        if (
          p.kind === "gloamfin" &&
          nextDir !== p.dir &&
          nextDir !== opposite(p.dir)
        ) {
          p = { ...p, chaseSpeed: GLOAMFIN_CORNER_SPEED, ramp: 0 };
        }
        dir = nextDir;
      }
    } else if (
      p.state === "search" &&
      p.searchOrigin &&
      Math.abs(p.tx - p.searchOrigin.tx) + Math.abs(p.ty - p.searchOrigin.ty) >
        GLOAMFIN_SEARCH_ROAM
    ) {
      dir = shortestDir(state.tiles, p, p.searchOrigin, true) ?? p.dir;
    } else {
      dir = chooseWander(state.tiles, p, true);
    }
  }
  const speed = predatorSpeed(p);
  let moved = moveBody(state.tiles, { ...p, dir }, dir, speed, TICK_DT, true);
  if (
    moved.kind === "gloamfin" &&
    moved.state === "chase" &&
    moved.chaseSpeed < GLOAMFIN_CHASE_SPEED
  ) {
    const ramp = Math.min(GLOAMFIN_RAMP_TIME, moved.ramp + TICK_DT);
    moved = {
      ...moved,
      ramp,
      chaseSpeed:
        GLOAMFIN_CORNER_SPEED +
        (GLOAMFIN_CHASE_SPEED - GLOAMFIN_CORNER_SPEED) *
          (ramp / GLOAMFIN_RAMP_TIME),
    };
  }
  return moved;
}

function stepPredators(state: FathomState, cues: Set<string>): FathomState {
  const next: FathomState = {
    ...state,
    pulses: [...state.pulses],
    nextPulseId: state.nextPulseId + state.predators.length,
  };
  const newPulses: PulseState[] = [];
  const predators = state.predators.map((p, index) => {
    const minded = stepPredatorMind(next, p, index, cues);
    if (
      p.kind === "gloamfin" &&
      p.pingTimer <= TICK_DT &&
      minded.pingTimer === GLOAMFIN_PING_INTERVAL &&
      !p.hearingLock
    ) {
      newPulses.push({
        source: "gloamfin",
        tint:
          minded.searchPingCast && p.state === "search" ? "orange" : "violet",
        ox: p.tx,
        oy: p.ty,
        front: 0,
        range: GLOAMFIN_PING_RANGE,
        caughtForager: false,
        marks: [],
        id: state.nextPulseId + index,
      });
    }
    const travelled = stepPredatorTravel(next, minded);
    return { ...travelled, speed: predatorSpeed(travelled) };
  });
  return { ...next, predators, pulses: [...next.pulses, ...newPulses] };
}

function stepDrifters(state: FathomState): FathomState {
  let drifters = state.drifters.map((d) => {
    if (!d.mind || !d.travel) return d;
    const dir = atCenter(d)
      ? chooseWander(state.tiles, d as GridBody, false)
      : d.dir;
    return moveBody(
      state.tiles,
      { ...d, dir },
      dir,
      DRIFTER_SPEED,
      TICK_DT,
      false,
    );
  });
  let drifterIn = state.drifterIn;
  if (state.planktonRemaining > 0) {
    drifterIn = Math.max(0, drifterIn - TICK_DT);
    if (drifterIn <= 0) {
      if (drifters.length < DRIFTER_MAX) {
        const gate = findGate(state.tiles);
        if (gate) {
          const entry = openDirs(state.tiles, gate.tx, gate.ty, false)
            .map((dir) => wrappedNeighbor(state.tiles, gate.tx, gate.ty, dir))
            .find((pt) => isCorridor(state.tiles, pt.tx, pt.ty));
          if (entry) drifters = [...drifters, makeDrifter(entry.tx, entry.ty)];
        }
      }
      drifterIn = DRIFTER_INTERVAL;
    }
  }
  return { ...state, drifters, drifterIn };
}

function findGate(rows: readonly string[]): TilePoint | null {
  for (let ty = 0; ty < GRID_ROWS; ty++) {
    for (let tx = 0; tx < GRID_COLS; tx++) {
      if (tileAt(rows, tx, ty) === "g") return { tx, ty };
    }
  }
  return null;
}

function makeDrifter(tx: number, ty: number): DrifterState {
  const pos = tileCenter(tx, ty);
  return { ...pos, tx, ty, dir: "left", lit: false, mind: true, travel: true };
}

function eatThings(state: FathomState, cues: Set<string>): FathomState {
  let next = state;
  if (tileAt(next.plankton, next.forager.tx, next.forager.ty) === "*") {
    const plankton = setChar(
      next.plankton,
      next.forager.tx,
      next.forager.ty,
      "-",
    );
    const remaining = countLayer(plankton, "*");
    cues.add(CUES.eat);
    next = {
      ...next,
      plankton,
      planktonRemaining: remaining,
      score: next.score + SCORE_PLANKTON + (remaining === 0 ? SCORE_CLEAR : 0),
      brightness: Math.min(1, next.brightness + BRIGHT_PER_EAT),
      brightHold: BRIGHT_HOLD,
      screen: remaining === 0 ? "cleared" : next.screen,
      clearedTime: remaining === 0 ? CLEARED_TIME : next.clearedTime,
    };
    if (remaining === 0) cues.add(CUES.descend);
  }
  const before = next.drifters.length;
  const drifters = next.drifters.filter(
    (d) => d.tx !== next.forager.tx || d.ty !== next.forager.ty,
  );
  if (drifters.length !== before)
    next = {
      ...next,
      drifters,
      score: next.score + SCORE_DRIFTER * (before - drifters.length),
    };
  return next;
}

function contact(state: FathomState, cues: Set<string>): FathomState {
  if (state.screen !== "playing") return state;
  const caught = state.predators.some(
    (p) => p.released && p.tx === state.forager.tx && p.ty === state.forager.ty,
  );
  if (!caught) return state;
  cues.add(CUES.caught);
  if (state.lives <= 0) return { ...state, screen: "gameover", menuIndex: 0 };
  return resetAttempt({ ...state, lives: state.lives - 1 });
}

function stepTimers(state: FathomState): FathomState {
  const brightHold = Math.max(0, state.brightHold - TICK_DT);
  let brightness = state.brightness;
  if (state.brightHold <= 0) brightness *= 0.5 ** (TICK_DT / BRIGHT_HALFLIFE);
  if (brightness < 0.001) brightness = 0;
  return reconcileState({
    ...state,
    simTime: state.simTime + TICK_DT,
    brightHold,
    brightness,
    sonar: {
      ...state.sonar,
      cooldown: Math.max(0, state.sonar.cooldown - TICK_DT),
    },
    ink: {
      ready: state.ink.cooldown - TICK_DT <= 0,
      cooldown: Math.max(0, state.ink.cooldown - TICK_DT),
    },
    inkClouds: state.inkClouds
      .map((cloud) => ({ ...cloud, remaining: cloud.remaining - TICK_DT }))
      .filter((cloud) => cloud.remaining > 0),
    predators: state.predators.map((p) => ({
      ...p,
      flareFade: Math.max(0, p.flareFade - TICK_DT),
      flareBloom:
        p.flareBloom > 0 ? Math.max(0, p.flareBloom - TICK_DT) : p.flareBloom,
    })),
  });
}

function fixedTick(state: FathomState): TickResult {
  const cues = new Set<string>();
  let next = stepTimers(state);
  if (next.screen === "countdown") {
    const countdown = Math.max(0, next.countdown - TICK_DT);
    next = revealLight({ ...next, countdown });
    if (countdown <= 0) next = { ...next, screen: "playing", playTime: 0 };
    return { state: next, cues };
  }
  if (next.screen === "cleared") {
    const clearedTime = Math.max(0, next.clearedTime - TICK_DT);
    next = { ...next, clearedTime };
    if (clearedTime <= 0) next = nextDepth(next);
    return { state: next, cues };
  }
  if (next.screen !== "playing") return { state: next, cues };

  next = { ...next, playTime: next.playTime + TICK_DT };
  next = stepForager(next);
  next = stepDrifters(next);
  next = stepPredators(next, cues);
  next = stepPulses(next, cues);
  next = eatThings(next, cues);
  next = contact(next, cues);
  next = revealLight(next);
  return { state: next, cues };
}

function applyInputs(state: FathomState, api: UpdateApi): FathomState {
  let next = state;
  if (api.input.pressed("mute")) api.audio.setMuted(!api.audio.muted());
  if (next.screen === "playing") {
    for (const dir of DIRS) {
      if (api.input.value(dir) > 0)
        next = {
          ...next,
          forager: { ...next.forager, desiredDir: dir, moving: true },
        };
    }
    if (
      api.input.value("up") +
        api.input.value("down") +
        api.input.value("left") +
        api.input.value("right") ===
      0
    ) {
      next = { ...next, forager: { ...next.forager, moving: false } };
    }
    if (api.input.pressed("pause"))
      return { ...next, screen: "paused", menuIndex: 0 };
    if (api.input.pressed("a") && next.sonar.cooldown <= 0) {
      const pulse: PulseState = {
        source: "forager",
        tint: "cyan",
        ox: next.forager.tx,
        oy: next.forager.ty,
        front: 0,
        range: next.sonar.range,
        caughtForager: false,
        marks: [],
        id: next.nextPulseId,
      };
      api.audio.play(CUES.sonar);
      next = {
        ...next,
        pulses: [...next.pulses, pulse],
        sonar: { ...next.sonar, cooldown: SONAR_COOLDOWN, ready: false },
        nextPulseId: next.nextPulseId + 1,
      };
    }
    if (api.input.pressed("b") && next.ink.cooldown <= 0) {
      api.audio.play(CUES.ink);
      next = {
        ...next,
        inkClouds: [
          ...next.inkClouds,
          {
            x: next.forager.x,
            y: next.forager.y,
            radius: INK_RADIUS,
            remaining: INK_LIFE,
          },
        ],
        ink: { cooldown: INK_COOLDOWN, ready: false },
      };
    }
  } else if (
    next.screen === "title" ||
    next.screen === "paused" ||
    next.screen === "gameover"
  ) {
    if (
      next.screen === "paused" &&
      (api.input.pressed("pause") || api.input.pressed("back"))
    ) {
      return { ...next, screen: "playing", menuIndex: null };
    }
    next = updateMenuInput(next, api);
  } else if (next.screen === "howto") {
    if (
      api.input.pressed("confirm") ||
      api.input.pressed("back") ||
      howtoPointer(api)
    ) {
      next = { ...next, screen: "title", menuIndex: next.titleIndex };
    }
  }
  return next;
}

function howtoPointer(api: UpdateApi): boolean {
  return api.input.pointerPressed() && api.input.pointerReleased();
}

function updateMenuInput(state: FathomState, api: UpdateApi): FathomState {
  const count = menuItems(state.screen).length;
  let index = state.menuIndex ?? 0;
  if (api.input.pressed("up")) index = (index + count - 1) % count;
  if (api.input.pressed("down")) index = (index + 1) % count;
  const pointer = api.input.pointer();
  for (let i = 0; i < count; i++) {
    const rect = menuRect(state.screen, i);
    if (
      rect &&
      pointer.x >= rect.x &&
      pointer.x <= rect.x + rect.w &&
      pointer.y >= rect.y &&
      pointer.y <= rect.y + rect.h
    )
      index = i;
  }
  let next: FathomState = { ...state, menuIndex: index };
  if (api.input.pressed("confirm") || clickedMenu(api, state.screen, index))
    next = confirmMenu(next, index);
  return next;
}

function clickedMenu(api: UpdateApi, screen: Screen, index: number): boolean {
  const rect = menuRect(screen, index);
  if (!rect) return false;
  const pointer = api.input.pointer();
  return (
    (api.input.pointerPressed() || api.input.pointerReleased()) &&
    pointer.x >= rect.x &&
    pointer.x <= rect.x + rect.w &&
    pointer.y >= rect.y &&
    pointer.y <= rect.y + rect.h
  );
}

function confirmMenu(state: FathomState, index: number): FathomState {
  if (state.screen === "title") {
    if (index === 0) return beginDive({ ...state, titleIndex: index }, index);
    return { ...state, screen: "howto", menuIndex: null, titleIndex: index };
  }
  if (state.screen === "paused") {
    if (index === 0) return { ...state, screen: "playing", menuIndex: null };
    if (index === 1) return beginDive(state);
    return {
      ...baseState(state.assets, state.muted, state.titleIndex),
      titleIndex: state.titleIndex,
      menuIndex: state.titleIndex,
    };
  }
  if (state.screen === "gameover") {
    if (index === 0) return beginDive(state);
    return {
      ...baseState(state.assets, state.muted, state.titleIndex),
      menuIndex: state.titleIndex,
    };
  }
  return state;
}

function menuItems(screen: Screen): readonly string[] {
  if (screen === "title") return TITLE_ITEMS;
  if (screen === "paused") return PAUSE_ITEMS;
  if (screen === "gameover") return GAMEOVER_ITEMS;
  return [];
}

function menuRect(
  screen: Screen,
  index: number,
): { x: number; y: number; w: number; h: number } | null {
  const items = menuItems(screen);
  if (index < 0 || index >= items.length) return null;
  const total = items.length * MENU_H + (items.length - 1) * MENU_GAP;
  return {
    x: STAGE_W / 2 - MENU_W / 2,
    y: STAGE_H / 2 - total / 2 + index * (MENU_H + MENU_GAP),
    w: MENU_W,
    h: MENU_H,
  };
}

function playCues(api: UpdateApi, cues: ReadonlySet<string>): void {
  for (const cue of cues) api.audio.play(cue);
}

async function loadFrames(
  api: InitApi<FathomState>,
  folder: string,
  count: number,
): Promise<ImageBitmap[]> {
  return Promise.all(
    Array.from({ length: count }, (_, i) =>
      api.assets.loadImage(`${folder}/${i}.png`),
    ),
  );
}

function registerAudio(api: InitApi<FathomState>): void {
  api.audio.define(CUES.eat, {
    wave: "triangle",
    freq: 900,
    freqTo: 1250,
    durationMs: 70,
    gain: 0.16,
  });
  api.audio.define(CUES.sonar, {
    wave: "sine",
    freq: 240,
    freqTo: 760,
    durationMs: 180,
    gain: 0.14,
  });
  api.audio.define(CUES.ink, {
    wave: "sawtooth",
    freq: 130,
    freqTo: 70,
    durationMs: 180,
    gain: 0.12,
  });
  api.audio.define(CUES.predatorPing, {
    wave: "sine",
    freq: 520,
    freqTo: 180,
    durationMs: 140,
    gain: 0.13,
  });
  api.audio.define(CUES.flare, {
    wave: "square",
    freq: 120,
    freqTo: 580,
    durationMs: 220,
    gain: 0.11,
  });
  api.audio.define(CUES.caught, {
    wave: "sawtooth",
    freq: 80,
    freqTo: 30,
    durationMs: 350,
    gain: 0.18,
  });
  api.audio.define(CUES.descend, {
    wave: "triangle",
    freq: 180,
    freqTo: 70,
    durationMs: 420,
    gain: 0.15,
  });
}

function registerDiagnostics(api: InitApi<FathomState>): void {
  api.diagnostics.register("screen", (s) => s.screen);
  api.diagnostics.register("depth", (s) => s.depth);
  api.diagnostics.register("score", (s) => s.score);
  api.diagnostics.register("lives", (s) => s.lives);
  api.diagnostics.register("brightness", (s) =>
    Number(s.brightness.toFixed(2)),
  );
  api.diagnostics.register("V", (s) => Math.round(s.visionRadius));
  api.diagnostics.register("R", (s) => Math.round(s.windowRadius));
  api.diagnostics.register("sonar", (s) => Number(s.sonar.cooldown.toFixed(2)));
  api.diagnostics.register("ink", (s) => Number(s.ink.cooldown.toFixed(2)));
  api.diagnostics.register("plankton", (s) => s.planktonRemaining);
  api.diagnostics.register(
    "forager",
    (s) => `${s.forager.tx},${s.forager.ty} ${s.forager.dir}`,
  );
  for (let i = 0; i < 6; i++) {
    api.diagnostics.register(`pred ${i}`, (s) => {
      const p = s.predators[i];
      return p
        ? `${p.kind} ${p.state} ${p.tx},${p.ty} ${Math.round(p.speed)} ${p.alert}`
        : "-";
    });
  }
}

function makeDebug(): FathomDebugApi {
  const assertWhole = (value: number, name: string, min: number) => {
    if (!Number.isInteger(value) || value < min)
      throw new RangeError(`${name} is outside its domain`);
  };
  const assertTile = (tx: number, ty: number) => {
    if (
      !Number.isInteger(tx) ||
      !Number.isInteger(ty) ||
      tx < 0 ||
      tx >= GRID_COLS ||
      ty < 0 ||
      ty >= GRID_ROWS
    ) {
      throw new RangeError("tile is outside the grid");
    }
  };
  const predator = (state: DeepReadonly<FathomState>, index: number) => {
    assertWhole(index, "index", 0);
    const p = state.predators[index];
    if (!p) throw new RangeError("predator index is outside the roster");
    return p;
  };
  return {
    version: FATHOM_DEBUG_VERSION,
    reset: (state) => baseState(state.assets, state.muted),
    snapshot,
    reconcile: (state) => reconcileState(state as FathomState),
    setScreen: (state, s) => ({
      ...(state as FathomState),
      screen: s,
      menuIndex:
        s === "title"
          ? state.titleIndex
          : s === "paused" || s === "gameover"
            ? 0
            : null,
    }),
    setMenuIndex: (state, index) => {
      const items = menuItems(state.screen);
      if (!items[index])
        throw new RangeError("menu index is outside the current menu");
      return { ...(state as FathomState), menuIndex: index };
    },
    setTitleIndex: (state, index) => {
      if (!TITLE_ITEMS[index])
        throw new RangeError("title index is outside the title menu");
      return { ...(state as FathomState), titleIndex: index };
    },
    menuItemRect: (state, index) => menuRect(state.screen, index),
    setScore: (state, points) => {
      assertWhole(points, "points", 0);
      return { ...(state as FathomState), score: points };
    },
    setLives: (state, n) => {
      assertWhole(n, "lives", 0);
      return { ...(state as FathomState), lives: n };
    },
    setDepth: (state, d) => {
      assertWhole(d, "depth", 1);
      return reconcileState({
        ...(state as FathomState),
        depth: d,
        predators: roster(d),
      });
    },
    setMaze: (state, rows) => {
      if (
        rows.length !== GRID_ROWS ||
        rows.some((row) => row.length !== GRID_COLS || /[^#.gd]/u.test(row)) ||
        countLayer(rows, "g") !== 1
      ) {
        throw new RangeError("maze fixture is outside its domain");
      }
      return { ...(state as FathomState), tiles: [...rows] };
    },
    setPlankton: (state, tx, ty, present) => {
      assertTile(tx, ty);
      if (!isCorridor(state.tiles, tx, ty))
        throw new RangeError("plankton tile is not a corridor");
      return reconcileState({
        ...(state as FathomState),
        plankton: setChar(state.plankton, tx, ty, present ? "*" : "-"),
      });
    },
    clearPlankton: (state) =>
      reconcileState({
        ...(state as FathomState),
        plankton: state.plankton.map((row) => row.replace(/\*/gu, "-")),
      }),
    clearFog: (state) => ({
      ...(state as FathomState),
      visibility: Array.from({ length: GRID_ROWS }, () =>
        "u".repeat(GRID_COLS),
      ),
    }),
    setForagerTile: (state, tx, ty) => {
      assertTile(tx, ty);
      if (!isCorridor(state.tiles, tx, ty))
        throw new RangeError("forager tile is not a corridor");
      const pos = tileCenter(tx, ty);
      return {
        ...(state as FathomState),
        forager: { ...state.forager, ...pos, tx, ty, moving: false },
      };
    },
    setForagerDir: (state, dir) => {
      if (!DIRS.includes(dir))
        throw new RangeError("direction is outside its domain");
      return {
        ...(state as FathomState),
        forager: { ...state.forager, dir, desiredDir: dir, moving: false },
      };
    },
    setBrightness: (state, g) => {
      if (g < 0 || g > 1)
        throw new RangeError("brightness is outside its domain");
      return reconcileState({ ...(state as FathomState), brightness: g });
    },
    setBrightHold: (state, seconds) => {
      if (seconds < 0 || seconds > BRIGHT_HOLD)
        throw new RangeError("brightHold is outside its domain");
      return { ...(state as FathomState), brightHold: seconds };
    },
    clearPredators: (state) => ({ ...(state as FathomState), predators: [] }),
    addPredator: (state, kind, tx, ty) => {
      assertTile(tx, ty);
      if (
        !["lanternjaw", "gloamfin", "flarefish"].includes(kind) ||
        !isCorridor(state.tiles, tx, ty)
      ) {
        throw new RangeError("predator add is outside its domain");
      }
      const pos = tileCenter(tx, ty);
      return {
        ...(state as FathomState),
        predators: [
          ...state.predators,
          {
            ...makePredator(kind, state.predators.length, true),
            ...pos,
            tx,
            ty,
          },
        ],
      };
    },
    setPredatorTile: (state, index, tx, ty) => {
      assertTile(tx, ty);
      predator(state, index);
      if (!isPredatorOpen(state.tiles, tx, ty))
        throw new RangeError("predator tile is not open");
      const pos = tileCenter(tx, ty);
      return {
        ...(state as FathomState),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, ...pos, tx, ty } : p,
        ) as PredatorRuntimeState[],
      };
    },
    setPredatorDir: (state, index, dir) => {
      predator(state, index);
      if (!DIRS.includes(dir))
        throw new RangeError("direction is outside its domain");
      return {
        ...(state as FathomState),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, dir } : p,
        ) as PredatorRuntimeState[],
      };
    },
    setPredatorState: (state, index, value) => {
      const p = predator(state, index);
      if (!["den", "wander", "chase"].includes(value))
        throw new RangeError("predator state is outside its domain");
      if (
        value === "den" &&
        !["d", "g"].includes(tileAt(state.tiles, p.tx, p.ty))
      )
        throw new RangeError("den state requires a den tile");
      if (value !== "den" && !isCorridor(state.tiles, p.tx, p.ty))
        throw new RangeError("loose predator requires a corridor");
      return {
        ...(state as FathomState),
        predators: state.predators.map((q, i) =>
          i === index
            ? {
                ...q,
                state: value,
                fix:
                  value === "chase"
                    ? { tx: state.forager.tx, ty: state.forager.ty }
                    : null,
              }
            : q,
        ) as PredatorRuntimeState[],
      };
    },
    setPredatorReleased: (state, index, released) => {
      predator(state, index);
      return {
        ...(state as FathomState),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, released } : p,
        ) as PredatorRuntimeState[],
      };
    },
    setPredatorMind: (state, index, enabled) => {
      predator(state, index);
      return {
        ...(state as FathomState),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, mind: enabled } : p,
        ) as PredatorRuntimeState[],
      };
    },
    setPredatorTravel: (state, index, enabled) => {
      predator(state, index);
      return {
        ...(state as FathomState),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, travel: enabled } : p,
        ) as PredatorRuntimeState[],
      };
    },
    spawnDrifter: (state, tx, ty) => {
      assertTile(tx, ty);
      if (!isCorridor(state.tiles, tx, ty))
        throw new RangeError("drifter tile is not a corridor");
      return {
        ...(state as FathomState),
        drifters: [...state.drifters, makeDrifter(tx, ty)],
      };
    },
    clearDrifters: (state) => ({ ...(state as FathomState), drifters: [] }),
    setDrifterMind: (state, index, enabled) => {
      assertWhole(index, "index", 0);
      if (!state.drifters[index])
        throw new RangeError("drifter index is outside the list");
      return {
        ...(state as FathomState),
        drifters: state.drifters.map((d, i) =>
          i === index ? { ...d, mind: enabled } : d,
        ) as DrifterState[],
      };
    },
    setDrifterTravel: (state, index, enabled) => {
      assertWhole(index, "index", 0);
      if (!state.drifters[index])
        throw new RangeError("drifter index is outside the list");
      return {
        ...(state as FathomState),
        drifters: state.drifters.map((d, i) =>
          i === index ? { ...d, travel: enabled } : d,
        ) as DrifterState[],
      };
    },
    setDrifterIn: (state, seconds) => {
      if (seconds < 0 || seconds > DRIFTER_INTERVAL)
        throw new RangeError("drifterIn is outside its domain");
      return { ...(state as FathomState), drifterIn: seconds };
    },
    setSonarCooldown: (state, seconds) => {
      if (seconds < 0)
        throw new RangeError("sonar cooldown is outside its domain");
      return reconcileState({
        ...(state as FathomState),
        sonar: { ...state.sonar, cooldown: seconds },
      });
    },
    setInkCooldown: (state, seconds) => {
      if (seconds < 0)
        throw new RangeError("ink cooldown is outside its domain");
      return reconcileState({
        ...(state as FathomState),
        ink: { cooldown: seconds, ready: seconds === 0 },
      });
    },
  };
}

export const game: Game<FathomState, FathomDebugApi> = {
  async initialize(
    api: InitApi<FathomState>,
  ): Promise<[FathomState, FathomDebugApi]> {
    for (const action of ACTIONS)
      api.input.register(action, { keys: [...BINDINGS[action]] });
    registerAudio(api);
    registerDiagnostics(api);
    const [
      forager,
      lanternjaw,
      gloamfin,
      flarefish,
      drifter,
      flareBloom,
      tiles,
    ] = await Promise.all([
      loadFrames(api, "glimmerfin", 8),
      loadFrames(api, "lanternjaw", 16),
      loadFrames(api, "gloamfin", 8),
      loadFrames(api, "flarefish", 8),
      loadFrames(api, "drifter", 8),
      loadFrames(api, "flare-bloom", 8),
      loadFrames(api, "trench-walls", 19),
    ]);
    const assets = {
      forager,
      lanternjaw,
      gloamfin,
      flarefish,
      drifter,
      flareBloom,
      tiles,
    };
    return [baseState(assets, false), makeDebug()];
  },

  update(
    state: DeepReadonly<FathomState>,
    api: UpdateApi,
    dt: number,
  ): FathomState {
    let next = applyInputs(state as FathomState, api);
    let accumulator = Math.min(0.25, next.tickRemainder + dt);
    const cues = new Set<string>();
    while (accumulator >= TICK_DT) {
      const result = fixedTick(next);
      next = result.state;
      for (const cue of result.cues) cues.add(cue);
      accumulator -= TICK_DT;
    }
    playCues(api, cues);
    return { ...next, tickRemainder: accumulator, muted: api.audio.muted() };
  },

  render(state: DeepReadonly<FathomState>, api: RenderApi): void {
    const ctx = api.ctx;
    drawBackdrop(ctx);
    if (state.screen === "title") drawTitle(ctx, state);
    else {
      drawMazeView(ctx, state);
      if (["countdown", "playing", "paused", "cleared"].includes(state.screen))
        drawHud(ctx, state);
      if (state.screen === "howto") drawHowTo(ctx);
      if (state.screen === "paused") drawMenuOverlay(ctx, state, "PAUSED");
      if (state.screen === "cleared")
        drawCenterText(ctx, `DEPTH ${state.depth} CLEARED`, "#ffe7a1");
      if (state.screen === "countdown") drawCenterText(ctx, "DIVE", "#a8fff6");
      if (state.screen === "gameover") drawGameOver(ctx, state);
    }
  },
};

function drawBackdrop(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, STAGE_H);
  gradient.addColorStop(0, "#061b24");
  gradient.addColorStop(1, "#02070c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
}

function drawMazeView(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  const f = state.forager;
  ctx.save();
  ctx.beginPath();
  ctx.arc(f.x, f.y, state.windowRadius, 0, Math.PI * 2);
  ctx.clip();
  drawTiles(ctx, state);
  drawPlankton(ctx, state);
  drawInk(ctx, state);
  drawCreatures(ctx, state);
  ctx.restore();
  drawWindowGlow(ctx, state);
  drawFlares(ctx, state);
  drawPulses(ctx, state);
  drawForager(ctx, state);
  ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
  ctx.beginPath();
  ctx.rect(GRID_ORIGIN_X, GRID_ORIGIN_Y, GRID_COLS * TILE, GRID_ROWS * TILE);
  ctx.arc(f.x, f.y, state.windowRadius, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
}

function drawTiles(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  for (let ty = 0; ty < GRID_ROWS; ty++) {
    for (let tx = 0; tx < GRID_COLS; tx++) {
      const x = GRID_ORIGIN_X + tx * TILE;
      const y = GRID_ORIGIN_Y + ty * TILE;
      const vis = tileAt(state.visibility, tx, ty);
      if (vis === "u") {
        ctx.drawImage(state.assets.tiles[17], x, y);
        continue;
      }
      ctx.globalAlpha = vis === "r" ? 0.45 : 1;
      const ch = tileAt(state.tiles, tx, ty);
      if (ch === "#")
        ctx.drawImage(state.assets.tiles[wallFrame(state.tiles, tx, ty)], x, y);
      else if (ch === "g") ctx.drawImage(state.assets.tiles[18], x, y);
      else ctx.drawImage(state.assets.tiles[16], x, y);
      ctx.globalAlpha = 1;
    }
  }
}

function wallFrame(rows: readonly string[], tx: number, ty: number): number {
  return (
    (tileAt(rows, tx, ty - 1) === "#" ? 1 : 0) +
    (tileAt(rows, tx + 1, ty) === "#" ? 2 : 0) +
    (tileAt(rows, tx, ty + 1) === "#" ? 4 : 0) +
    (tileAt(rows, tx - 1, ty) === "#" ? 8 : 0)
  );
}

function drawPlankton(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  for (let ty = 0; ty < GRID_ROWS; ty++) {
    for (let tx = 0; tx < GRID_COLS; tx++) {
      if (
        tileAt(state.plankton, tx, ty) !== "*" ||
        tileAt(state.visibility, tx, ty) === "u"
      )
        continue;
      const c = tileCenter(tx, ty);
      ctx.fillStyle =
        tileAt(state.visibility, tx, ty) === "l"
          ? "#aefdf1"
          : "rgba(128, 220, 210, 0.45)";
      ctx.beginPath();
      ctx.arc(c.x, c.y, PLANKTON_DOT / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawInk(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  for (const cloud of state.inkClouds) {
    ctx.fillStyle = `rgba(0, 2, 8, ${0.32 + 0.3 * (cloud.remaining / INK_LIFE)})`;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCreatures(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  const t = state.simTime;
  for (const d of state.drifters) {
    drawAmber(ctx, d.x, d.y);
    if (d.lit)
      drawSprite(ctx, state.assets.drifter[Math.floor(t * 8) % 8], d.x, d.y);
  }
  for (const p of state.predators) {
    if (p.kind === "lanternjaw") drawAmber(ctx, p.x, p.y);
    if (p.alert) drawAlert(ctx, p);
    if (!p.lit) continue;
    const frame = predatorFrame(state, p);
    drawSprite(ctx, frame, p.x, p.y);
  }
}

function predatorFrame(
  state: DeepReadonly<FathomState>,
  p: DeepReadonly<PredatorRuntimeState>,
): ImageBitmap {
  const pair = dirFrame(p.dir);
  const wobble = Math.floor(state.simTime * 8) % 2;
  if (p.kind === "lanternjaw") {
    if (p.state === "wander")
      return state.assets.lanternjaw[8 + (Math.floor(state.simTime * 8) % 8)];
    return state.assets.lanternjaw[pair + wobble];
  }
  if (p.kind === "gloamfin") return state.assets.gloamfin[pair + wobble];
  return state.assets.flarefish[pair + wobble];
}

function dirFrame(dir: Direction): number {
  if (dir === "down") return 0;
  if (dir === "up") return 2;
  if (dir === "left") return 4;
  return 6;
}

function drawForager(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  const radius = state.visionRadius;
  const glow = ctx.createRadialGradient(
    state.forager.x,
    state.forager.y,
    4,
    state.forager.x,
    state.forager.y,
    radius,
  );
  glow.addColorStop(0, `rgba(113, 255, 238, ${0.2 + state.brightness * 0.25})`);
  glow.addColorStop(1, "rgba(113, 255, 238, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(state.forager.x, state.forager.y, radius, 0, Math.PI * 2);
  ctx.fill();
  const frame =
    dirFrame(state.forager.dir) +
    (state.forager.moving ? Math.floor(state.simTime * 9) % 2 : 0);
  drawSprite(
    ctx,
    state.assets.forager[frame],
    state.forager.x,
    state.forager.y,
  );
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
): void {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, x - TILE / 2, y - TILE / 2, TILE, TILE);
}

function drawAmber(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const glow = ctx.createRadialGradient(x, y, 1, x, y, 28);
  glow.addColorStop(0, "rgba(255, 194, 92, 0.95)");
  glow.addColorStop(1, "rgba(255, 81, 42, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffc268";
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawAlert(
  ctx: CanvasRenderingContext2D,
  p: DeepReadonly<PredatorRuntimeState>,
): void {
  const age = 1 - p.alertTime / ALERT_TIME;
  ctx.strokeStyle =
    p.kind === "gloamfin"
      ? `rgba(190, 112, 255, ${1 - age})`
      : `rgba(255, 121, 92, ${1 - age})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 18 + age * 32, 0, Math.PI * 2);
  ctx.stroke();
}

function drawWindowGlow(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  const glow = ctx.createRadialGradient(
    state.forager.x,
    state.forager.y,
    state.visionRadius,
    state.forager.x,
    state.forager.y,
    state.windowRadius,
  );
  glow.addColorStop(0, "rgba(65, 177, 194, 0.08)");
  glow.addColorStop(1, "rgba(65, 177, 194, 0.02)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(state.forager.x, state.forager.y, state.windowRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlares(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  for (const p of state.predators) {
    if (p.kind !== "flarefish") continue;
    const active = p.flareCharge > 0 || p.flareBloom > 0 || p.flareFade > 0;
    if (!active) continue;
    const frame =
      p.flareCharge > 0
        ? 2 - Math.floor((p.flareCharge / FLARE_CHARGE) * 3)
        : p.flareBloom > 0
          ? 3 + Math.floor((1 - p.flareBloom / FLARE_BLOOM) * 3)
          : 6 + Math.min(1, Math.floor((1 - p.flareFade / 0.4) * 2));
    ctx.globalAlpha = p.flareFade > 0 ? p.flareFade / 0.4 : 0.85;
    ctx.drawImage(
      state.assets.flareBloom[Math.max(0, Math.min(7, frame))],
      p.x - FLARE_RADIUS,
      p.y - FLARE_RADIUS,
      FLARE_RADIUS * 2,
      FLARE_RADIUS * 2,
    );
    ctx.globalAlpha = 1;
  }
}

function drawPulses(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  for (const pulse of state.pulses) {
    const distances = pulseDistances(
      state.tiles,
      { tx: pulse.ox, ty: pulse.oy },
      pulse.range,
    );
    ctx.strokeStyle =
      pulse.tint === "cyan"
        ? "#5ff9ff"
        : pulse.tint === "violet"
          ? "#b77cff"
          : "#ff9d45";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.72;
    for (const [k, d] of distances) {
      if (Math.abs(d - pulse.front) > 0.45) continue;
      const [txText, tyText] = k.split(",");
      const c = tileCenter(Number(txText), Number(tyText));
      ctx.beginPath();
      ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  ctx.fillStyle = "rgba(2, 8, 13, 0.82)";
  ctx.fillRect(0, 0, STAGE_W, 80);
  ctx.fillRect(0, 656, STAGE_W, 64);
  ctx.font = "48px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillStyle = "#d7fff8";
  ctx.fillText(String(state.score).padStart(5, "0"), 64, 54);
  ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillStyle = "#6ba7b0";
  ctx.fillText(DIVE_LABEL, 1090, 48);
  ctx.fillStyle = "#bceee9";
  ctx.fillText(`DEPTH ${state.depth}`, 64, 696);
  for (let i = 0; i < state.lives; i++)
    drawSprite(ctx, state.assets.forager[6], 216 + i * 28, 686);
  drawGauge(ctx, 890, 674, "SONAR", 1 - state.sonar.cooldown / SONAR_COOLDOWN);
  drawGauge(ctx, 1060, 674, "INK", 1 - state.ink.cooldown / INK_COOLDOWN);
}

function drawGauge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  amount: number,
): void {
  ctx.strokeStyle = "#2e5963";
  ctx.strokeRect(x, y, 120, 14);
  ctx.fillStyle = amount >= 1 ? "#75fff0" : "#4f9bae";
  ctx.fillRect(x + 2, y + 2, Math.max(0, Math.min(1, amount)) * 116, 10);
  ctx.fillStyle = "#bceee9";
  ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(label, x, y - 8);
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  drawMazeView(ctx, { ...state, screen: "playing" });
  ctx.fillStyle = "rgba(0, 5, 10, 0.68)";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.textAlign = "center";
  ctx.font = "92px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillStyle = "#cafff8";
  ctx.fillText(TITLE_TEXT, STAGE_W / 2, 190);
  ctx.font = "24px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillStyle = "#73aeb7";
  ctx.fillText(TAGLINE_TEXT, STAGE_W / 2, 232);
  drawMenu(ctx, state);
  ctx.textAlign = "start";
}

function drawMenuOverlay(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
  title: string,
): void {
  ctx.fillStyle = "rgba(0, 4, 9, 0.68)";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  drawCenterText(ctx, title, "#d7fff8", -135);
  drawMenu(ctx, state);
}

function drawGameOver(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  drawBackdrop(ctx);
  drawCenterText(ctx, "GAME OVER", "#ffd1c1", -160);
  drawCenterText(
    ctx,
    `SCORE ${state.score}    DEPTH ${state.depth}`,
    "#d7fff8",
    -95,
  );
  drawMenu(ctx, state);
}

function drawMenu(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FathomState>,
): void {
  const items = menuItems(state.screen);
  ctx.textAlign = "center";
  ctx.font = "24px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  items.forEach((item, index) => {
    const rect = menuRect(state.screen, index);
    if (!rect) return;
    const selected = index === state.menuIndex;
    ctx.fillStyle = selected
      ? "rgba(107, 255, 238, 0.17)"
      : "rgba(7, 25, 32, 0.72)";
    ctx.strokeStyle = selected ? "#75fff0" : "#28505a";
    ctx.lineWidth = 2;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = selected ? "#effffb" : "#92c5cb";
    ctx.fillText(item, rect.x + rect.w / 2, rect.y + 36);
  });
  ctx.textAlign = "start";
}

function drawHowTo(ctx: CanvasRenderingContext2D): void {
  drawBackdrop(ctx);
  ctx.font = "44px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillStyle = "#d7fff8";
  ctx.fillText("HOW TO PLAY", 96, 130);
  ctx.font = "22px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillStyle = "#bceee9";
  const lines = [
    "WASD or arrows swim the corridors. Space sends a cyan sonar pulse.",
    "Shift releases ink. Escape pauses. M mutes the sound.",
    "Eat plankton to brighten your glow and widen the circle of memory.",
    "Lanternjaw hunts light, Gloamfin hunts sound, Flarefish hunts by flare.",
    "Beyond your circle, even remembered ground goes black until you return.",
    "",
    "Press Enter, Space, Escape, click, or tap to return.",
  ];
  lines.forEach((line, i) => ctx.fillText(line, 96, 198 + i * 42));
}

function drawCenterText(
  ctx: CanvasRenderingContext2D,
  text: string,
  color: string,
  dy = 0,
): void {
  ctx.textAlign = "center";
  ctx.font = "46px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillStyle = color;
  ctx.fillText(text, STAGE_W / 2, STAGE_H / 2 + dy);
  ctx.textAlign = "start";
}
