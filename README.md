# Fathom

Fathom is a browser-only bioluminescent deep-sea maze chase built on the Simple
2D engine. You guide a glowing forager through a dark trench, eat plankton to
grow your light, and survive predators that hunt by light, sound, and flare.

This is the Kindle dive: explored maze tiles are remembered, but anything beyond
your circular view is blacked out until you swim close again.

## Install

```sh
npm ci
```

## Development

```sh
npm run dev
```

Vite serves the game with hot reload. Open the local URL it prints and play in a
browser.

## Production Build

```sh
npm run build
```

The static site is emitted to `dist/`, with `dist/index.html` as the entry
point. The build can be served from a static host at the root or under a
sub-path.

## Checks

```sh
npm run typecheck
npm run lint
npm run format
npm test
```

## Controls

- Move: arrow keys or WASD
- Sonar pulse: Space
- Ink cloud: Shift
- Confirm menu item: Enter or Space
- Pause or back: Escape
- Pause toggle: P
- Mute: M

Menus also support pointer and touch selection.
