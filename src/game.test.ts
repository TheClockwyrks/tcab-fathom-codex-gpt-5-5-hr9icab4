import { describe, expect, it, vi } from "vitest";
import type { InitApi, UpdateApi } from "@clockwyrks/simple-2d";
import { TICK_DT } from "./constants";
import { game, type FathomState } from "./game";

function initApi(): InitApi<FathomState> {
  return {
    input: {
      register: vi.fn(),
      layout: () => null,
    },
    audio: {
      define: vi.fn(),
      load: vi.fn(async () => undefined),
    },
    assets: {
      loadImage: vi.fn(async () => ({}) as ImageBitmap),
      loadAudio: vi.fn(async () => ({}) as AudioBuffer),
      load: vi.fn(async () => new Blob()),
      resolve: (path: string) => `assets/${path}`,
    },
    diagnostics: {
      register: vi.fn(),
    },
    events: {
      on: vi.fn(() => () => undefined),
    },
    viewport: () => ({
      width: 1280,
      height: 720,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    }),
  };
}

function updateApi(): UpdateApi {
  const pressed = vi.fn(() => false);
  const value = vi.fn(() => 0);
  return {
    input: {
      value,
      pressed,
      pointer: () => ({
        x: 0,
        y: 0,
        down: false,
        device: "mouse",
        buttons: [],
      }),
      pointerPressed: () => false,
      pointerReleased: () => false,
      pointerSamples: () => [],
      pointerContacts: () => [],
      wheel: () => ({ x: 0, y: 0 }),
    },
    audio: {
      play: vi.fn(),
      loop: vi.fn(),
      stop: vi.fn(),
      looping: () => false,
      setMuted: vi.fn(),
      muted: () => false,
    },
    frame: () => ({ count: 0, timeMs: 0, lastDeltaMs: 0 }),
    viewport: () => ({
      width: 1280,
      height: 720,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    }),
  };
}

describe("Fathom game", () => {
  it("initializes the debug surface and title snapshot", async () => {
    const [state, debug] = await game.initialize(initApi());
    const snap = debug.snapshot(state);

    expect(debug.version).toBe(1);
    expect(snap.screen).toBe("title");
    expect(snap.menuIndex).toBe(0);
    expect(snap.depth).toBe(1);
    expect(snap.predators.map((p) => p.kind)).toEqual([
      "lanternjaw",
      "gloamfin",
      "flarefish",
    ]);
    expect(snap.tiles).toHaveLength(18);
    expect(snap.visibility.every((row) => /^u+$/u.test(row))).toBe(true);
  });

  it("advances countdown on fixed ticks and enters play", async () => {
    const [state, debug] = await game.initialize(initApi());
    let next = debug.setScreen(state, "countdown");
    const api = updateApi();

    for (let i = 0; i < Math.ceil(2 / TICK_DT) + 2; i++) {
      next = game.update(next, api, TICK_DT);
    }

    expect(next.screen).toBe("playing");
    expect(next.simTime).toBeGreaterThanOrEqual(2);
  });

  it("scores plankton through the ordinary update path", async () => {
    const [state, debug] = await game.initialize(initApi());
    let next = debug.setScreen(state, "playing");
    next = debug.setForagerTile(next, next.startTile.tx, next.startTile.ty);
    expect(next.plankton[next.forager.ty]?.[next.forager.tx]).toBe("*");

    next = game.update(next, updateApi(), TICK_DT);

    expect(next.score).toBe(10);
    expect(next.brightness).toBeGreaterThan(0);
    expect(next.plankton[next.forager.ty]?.[next.forager.tx]).toBe("-");
  });
});
