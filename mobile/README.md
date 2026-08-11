# Kokoro Mobile

Kokoro Mobile is the learner-facing Expo application. It consumes the existing Express/MongoDB learning API while the web frontend remains available for engine diagnostics and development tools.

## Current Mobile Slice

- Roadmap-first Map home
- Compact Review of the Day state with a task-weighted roadmap-area preview
- Interactive completed/current/unlocked/locked lesson nodes
- Native lesson detail sheet
- Teaching-before-assessment lessons with character focus, ordered tracing, word context, and recap steps
- Real roadmap lesson and daily review start actions
- Native question session with immediate feedback
- Mobile result screen
- Map, Review, Progress, and Profile tabs

Review and Progress currently contain product-direction placeholders. The Map, lesson sheet, Session, and Result flows are connected to the backend.

The Review of the Day focus bar summarizes active ReviewTasks by roadmap area. It explains the intended focus without claiming an exact per-area question allocation.
Its preview includes a scrollable chapter list, semantic mistake/memory/practice indicators, and skill-level chapter details.

Hiragana Vowels is the current lesson-component pilot. Its tracing interaction
uses local ordered stroke validation and haptics; tracing does not create an
Attempt or change learner mastery. Only the final backend session writes
learning evidence.

## Local Setup

Install dependencies from the repository root:

```bash
npm install --prefix mobile
```

Copy the example mobile environment file:

```bash
cp mobile/.env.example mobile/.env.local
```

From the repository root, `npm run mobile:start` detects the Mac's LAN address
and passes it to Expo automatically. For a manual override, set
`EXPO_PUBLIC_API_URL` to an address the device can reach:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5050
```

- iOS simulator can normally use `http://127.0.0.1:5050`.
- Android emulator can normally use `http://10.0.2.2:5050`.
- A physical phone needs the Mac's LAN IP and both devices on the same network.
- Never put MongoDB credentials or other secrets in an `EXPO_PUBLIC_` variable.

Start the backend:

```bash
npm run dev
```

Start Expo:

```bash
npm run mobile:start
```

Scan the QR code using Expo Go, or press `i`, `a`, or `w` for the available simulator/web target.

## Verification

```bash
npm run mobile:lint
npm run mobile:typecheck
cd mobile && npx expo export --platform web
```

Expo SDK 54 is intentionally used for immediate Expo Go testing. Its current build-tool dependency tree reports a PostCSS advisory whose automated npm remediation upgrades to SDK 57. Do not run `npm audit fix --force`; move to SDK 57 deliberately when Kokoro adopts development builds.

## Architecture Boundary

The mobile app owns learner-facing presentation and navigation. The backend remains the source of truth for roadmap progress, recommendations, question selection, attempts, memory, SkillState, ReviewTask, and review completion.
