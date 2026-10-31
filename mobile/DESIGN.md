# Kokoro Mobile — Design Document

> Reference for collaborating with **Google Stitch** on research into the current app.
> This document describes the app **as implemented** in this directory (`mobile/`), not a
> future spec. Where design intent is inferred rather than explicit in code, it is called
> out under **Assumption**. Sources are cited by path so every claim can be verified.

---

## 1. Purpose

Kokoro Mobile is the primary **learner-facing** surface of the Kokoro Japanese-learning
prototype (Expo / React Native). It presents a **roadmap-first** learning journey: the
learner sees a vertical "Map" of units and lessons, opens a lesson, works through
teaching-then-practice content, and sees a result. A parallel **Review of the Day** flow
lets them refresh material the backend judges to be at risk of being forgotten.

The app owns **presentation and navigation only**. The Express/MongoDB backend remains the
source of truth for roadmap progress, question selection, attempts, memory/SkillState, and
review completion (`mobile/README.md`, "Architecture Boundary"). The app is a thin,
stateful client over a REST API.

**Product scope today** (`mobile/README.md`): the Map, lesson detail, teaching lesson,
Session, and Result flows are wired to the backend. The **Review**, **Progress**, and
**Profile** tabs are intentional placeholders establishing navigation and product
direction, not finished surfaces.

- **Platform**: Expo SDK 54, React Native 0.81, New Architecture enabled (`mobile/app.json`).
- **App identity**: name "Kokoro", slug `kokoro-mobile`, scheme `kokoro`, bundle
  `com.kokoro.learning`, **portrait-only**, **light UI style** (`userInterfaceStyle: "light"`).
- **Targets**: iOS (tablet supported), Android (edge-to-edge, adaptive icon), and static web
  export.

---

## 2. Tech Stack & Conventions

| Concern | Choice | Source |
|---|---|---|
| Framework | Expo + React Native, `expo-router` file-based routing | `mobile/package.json`, `mobile/app.json` (plugins) |
| Language | TypeScript, strict typed routes (`experiments.typedRoutes`) | `mobile/app.json`, `mobile/tsconfig.json` |
| Navigation | `expo-router` `Stack` + `Tabs` | `mobile/app/_layout.tsx`, `mobile/app/(tabs)/_layout.tsx` |
| State | **Zustand** single session store | `mobile/store/session-store.ts` |
| Networking | `fetch` wrapper, no client lib | `mobile/services/kokoro-api.ts` |
| Icons | `@expo/vector-icons` **Ionicons** throughout | all screens |
| Gestures | `react-native-gesture-handler` (root provider + tracing) | `mobile/app/_layout.tsx`, tracing component |
| Animation | `react-native-reanimated`, `Animated` API | `_layout.tsx`, lesson screen |
| Vector drawing | `react-native-svg` (kana stroke tracing) | `components/lesson/character-trace-step.tsx` |
| Audio | `expo-speech` (kana / word pronunciation) | `app/lesson/[lessonId].tsx` |
| Haptics | `expo-haptics` (tab press, tracing feedback) | `components/haptic-tab.tsx`, tracing component |
| Images | `expo-image` (lesson illustrations) | `app/lesson/[lessonId].tsx` |

**File-naming convention**: all source files are **kebab-case** (`lesson-detail-sheet.tsx`,
`review-of-day-strip.tsx`, `session-store.ts`). Route files under `app/` follow expo-router
conventions (`_layout.tsx`, `[lessonId].tsx`, `(tabs)/`).

**Path aliasing**: imports use the `@/` alias (e.g. `@/constants/kokoro-theme`,
`@/store/session-store`) resolving to the `mobile/` root (`mobile/tsconfig.json`).

---

## 3. Navigation Flow

Two nested navigators, both header-less (chrome is drawn by each screen):

```text
RootLayout (Stack)                       mobile/app/_layout.tsx
├── (tabs)               headerShown:false     → Bottom-tab navigator (default anchor)
│   ├── index      "Map"       map / map-outline
│   ├── review     "Review"    refresh-circle(-outline)   [placeholder]
│   ├── progress   "Progress"  git-network(-outline)      [placeholder]
│   └── profile    "Profile"   person(-outline)           [placeholder]
├── lesson/[lessonId]   headerShown:false     → Teaching lesson (data-driven steps)
├── session             headerShown:false, gestureEnabled:false → Question session
└── result              headerShown:false, gestureEnabled:false → Session result
```

- The app **anchors on `(tabs)`** (`unstable_settings.anchor`), so the tab bar is home base.
- `session` and `result` **disable the swipe-back gesture** so a learner cannot accidentally
  abandon a graded session; both exit only via explicit buttons (a close "X" that
  `router.replace('/')`, or "Return to your map").
- Root stack sets a canvas background on `contentStyle` and forces `StatusBar` to `dark`
  content (dark glyphs on the light canvas).

### Primary user journeys (verified in code)

1. **Start a lesson** — `app/(tabs)/index.tsx` → `LessonDetailSheet` → `beginLesson()`:
   - If the lesson `content.hasTeachingContent` is true → `router.push('/lesson/[lessonId]')`
     (teaching screen), which itself later starts the backend session.
   - Otherwise → `startLesson(lessonId)` on the store → `router.push('/session')`.
2. **Daily Review** — Map → `ReviewOfDayStrip` → `ReviewPreviewSheet` → `startDailyReview()`
   → `router.push('/session')`.
3. **Answer loop** — `app/session.tsx`: submit answer → inline feedback → Continue →
   last question completes the session → `router.replace('/result')`.
4. **Return** — `app/result.tsx` → `reset()` store → `router.replace('/')`, re-passing the
   `roadmapId` param so the Map reopens on the same path.

**Roadmap selection**: the selected roadmap id is carried as a route param
(`?roadmapId=`), defaulting to `'n5-foundation'`, and round-trips through
`router.setParams` / `router.replace` so navigation state stays the single source of the
active path.

---

## 4. Screen & UI Structure

### 4.1 Map (`app/(tabs)/index.tsx`) — the home screen

The scrollable learning path. Composition top-to-bottom:

- **Header**: "Kokoro" wordmark + "こころ" subscript, and a right-aligned **progress pill**
  (`{percent}%` + `{shortLabel} PATH`) that opens the roadmap selector.
- **`ReviewOfDayStrip`**: compact daily-review state / continue-lesson entry point.
- **Path intro**: eyebrow "YOUR LEARNING MAP", roadmap title, "N of M lessons complete".
- **`RoadmapUnit` list**: one per unit, each rendering a column of **`RoadmapNode`**s.
- **Journey-end footer**: a "more of the journey is still being written" closing note.

Screen states are explicit: **loading** (centered spinner + "Opening your Japanese path"),
**error** (offline icon, message, "Try again"), and **loaded**. Data is fetched on
`useFocusEffect` (refetch every time the tab regains focus) with pull-to-refresh via
`RefreshControl`. Two calls run in parallel: `getRoadmap` and `getHomeRecommendation`, both
for user `'guest'`.

Three modal sheets are mounted at the bottom of the screen and toggled by state:
`LessonDetailSheet`, `ReviewPreviewSheet`, `RoadmapSelectorSheet`.

### 4.2 Teaching lesson (`app/lesson/[lessonId].tsx`)

Data-driven lesson player. Fetches `LessonContent` from
`/api/lessons/{id}/content` and renders a sequence of **step components** by
discriminated `step.type` (`mobile/types/learning.ts`, `LessonContentStep`):

- `introduction` — title + body (optionally a sequence of statements) + callout.
- `character_focus` — a single kana with romanization and a **sound cue** (expo-speech).
- `character_trace` — interactive stroke tracing (`CharacterTraceStep`).
- `word_example` / `word_context` — a vocabulary item with a **local PNG illustration**
  (`assets/lesson-examples/*.png`, mapped in `LESSON_ILLUSTRATIONS`), segmented reading,
  and audio.
- `kana_group` — a grid of `KanaCard`s (character, romanization, pronunciation hint, example).
- `guided_choice` — an ungraded practice question with hint + explanation.
- `recap` — summary list of characters learned.

Teaching interactions **do not write learner state** — tracing uses local ordered-stroke
validation and haptics only; only the final backend Session records attempts and mastery
(`mobile/README.md`; confirmed by store/API — the teaching screen has no attempt-writing
call). This is a deliberate **teaching-before-assessment** design.

### 4.3 Question session (`app/session.tsx`)

The graded loop, driven entirely by `useSessionStore`.

- **Top bar**: close "X", a progress track/fill bar, and an "N/M" counter.
- **Body**: eyebrow (review vs lesson-title context), the prompt, and either **choice
  options** (`multiple_choice`, `meaning_match`, `translation_choice`) rendered as
  selectable `Pressable`s, or a free-text `TextInput` for other types.
- **Inline feedback** card after submit: green "That is correct" (checkmark) or a neutral
  accent "Keep this one close" card showing the correct answer.
- **Action bar**: single primary button that morphs "Check answer" → "Continue" → "See your
  result", disabled while submitting or with no answer.

### 4.4 Result (`app/result.tsx`)

Completion screen: success checkmark badge, "LESSON COMPLETE" / "REVIEW COMPLETE" eyebrow, a
large percentage score, "X of Y correct", and — for reviews — a two-cell summary
("refreshed" / "returning later"). One primary button returns to the map and resets the store.

### 4.5 Placeholder tabs (`review.tsx`, `progress.tsx`, `profile.tsx`)

All three share an identical layout: centered `SafeAreaView` column with an Ionicon, an
eyebrow, a display-font title, and a "coming next" body. They exist to establish the
four-tab IA and product direction. **Assumption**: their eventual content mirrors the web
app's `/review`, `/insights`, and profile surfaces, but this is not encoded in the mobile
code — treat them as intentional stubs.

---

## 5. Component Architecture

Presentational components live in `mobile/components/`; the Map screen is the primary
composition root that wires them together.

### 5.1 Kokoro product components (`components/`)

| Component | Role |
|---|---|
| `roadmap-unit.tsx` | Unit heading (kicker/title/progress) + column of `RoadmapNode`s. |
| `roadmap-node.tsx` | A single lesson node on the winding path. State→visual mapping (see §7); alternates label left/right by index for the zig-zag path; draws connector line, current-lesson halo + dot, and status copy. |
| `lesson-detail-sheet.tsx` | Bottom-sheet `Modal` with lesson status, description, kana preview tiles, and the start CTA. Handles locked / coming_soon disabled states. |
| `review-of-day-strip.tsx` | Compact daily-review entry on the Map (task-weighted summary). |
| `review-preview-sheet.tsx` | Fuller review preview: scrollable chapter list, mistake/memory/practice indicators, skill-level detail. |
| `roadmap-selector-sheet.tsx` | Bottom sheet to switch between available roadmaps. |
| `lesson/character-trace-step.tsx` | SVG stroke-tracing widget: samples expected stroke polylines, validates the drawn attempt locally, animates a guide dot, gives haptic feedback. Ordered, self-contained, no network. |

### 5.2 Expo-template scaffolding (`components/`, `components/ui/`)

These ship with the Expo starter and are **not** part of the Kokoro visual language:
`themed-text.tsx`, `themed-view.tsx`, `parallax-scroll-view.tsx`, `hello-wave.tsx`,
`external-link.tsx`, `ui/collapsible.tsx`, `ui/icon-symbol.tsx(.ios)`, plus the
`hooks/use-color-scheme*` and `constants/theme.ts` files. **Assumption**: these are
leftover template files; the shipped Kokoro screens style themselves directly from
`constants/kokoro-theme.ts` and do not use the `useThemeColor` light/dark hook. Stitch
research should treat `kokoro-theme.ts` as authoritative, not `constants/theme.ts`.

The one template piece the product **does** use is `components/haptic-tab.tsx` (wired as
`tabBarButton` for a light iOS haptic on tab press).

### 5.3 State management (`store/session-store.ts`)

A **single Zustand store** owns the entire active-session lifecycle — there is no other
global state:

```text
state:   sessionId, questions[], currentIndex, roadmap, answers[], report, isStarting, startError
actions: startLesson(lessonId) · startDailyReview() · submitAnswer(qId, answer)
         · nextQuestion() · completeSession() · reset()
```

Screen-local UI concerns (selected answer, feedback, modal visibility, the selected
roadmap id) are kept in `useState` in the screens, not the store. The store is the
handoff channel between `session.tsx` and `result.tsx` (`report` is set on completion and
read by the result screen). Roadmap/recommendation data is **not** stored globally — it is
fetched and held locally in the Map screen.

### 5.4 API layer (`services/kokoro-api.ts`)

A single typed `request<T>()` `fetch` wrapper: injects `Content-Type: application/json`,
enforces a **12s timeout** via `AbortController`, and unwraps the backend's
`{ success, data, message }` envelope (throwing `message` on failure). Base URL resolves
from `EXPO_PUBLIC_API_URL`, else platform defaults (`10.0.2.2` Android emulator, `127.0.0.1`
iOS, `localhost` web). All calls currently hard-code `userId: 'guest'`. Endpoints:
`getRoadmap`, `getHomeRecommendation`, `getLessonContent`, `startLearningSession`,
`submitSessionAnswer`, `completeLearningSession`.

Domain types live in `mobile/types/learning.ts` and mirror the backend contract
(`RoadmapResponse`, `HomeRecommendation`, `ReviewOfDay`, `Question`, `SessionStartResponse`,
`LessonContent` and its step union) — this file is the best single reference for the
data shapes Stitch will encounter.

---

## 6. Styling Conventions

- **No CSS/styling library.** Every component uses React Native `StyleSheet.create` with
  styles co-located at the bottom of its own file. There is no shared component library and
  no styled-components/Tamagui/NativeWind.
- **Single design-token source**: `mobile/constants/kokoro-theme.ts` exports `palette`,
  `type`, and `shadow`. All Kokoro screens import from it. There is **no dark mode** in the
  product surfaces — the app is fixed to a warm light theme (`app.json`
  `userInterfaceStyle: "light"`).

### 6.1 Palette (`kokoro-theme.ts`)

| Token | Value | Usage |
|---|---|---|
| `canvas` | `#F7F2E8` | screen background (warm paper) |
| `surface` | `#FFFCF6` | cards, sheets, tab bar |
| `ink` | `#292620` | primary text |
| `muted` | `#746E65` | secondary text |
| `line` | `#D8CEC0` | borders / dividers |
| `accent` | `#B74635` | brand red — CTAs, active state, current lesson |
| `accentSoft` | `#F3DED6` | accent tint (selected option, halo) |
| `gold` / `goldSoft` | `#C58B37` / `#F5E8C8` | unlocked / secondary highlight |
| `success` / `successSoft` | `#4E755B` / `#DFEADF` | completed, correct feedback |
| `locked` | `#C9C2B8` | locked lesson nodes |
| `danger` | `#A84238` | inline errors |
| `white` | `#FFFFFF` | on-accent text |

The overall aesthetic is a **warm, paper-like, serif-accented** palette — cream canvas,
terracotta-red brand accent, muted gold and forest-green as secondaries.

### 6.2 Typography (`type`)

Platform-selected font families, not custom fonts:
- `type.display` → Georgia (iOS) / serif (Android/web) — used for wordmark, screen titles,
  scores, unit titles (the "editorial" voice).
- `type.body` → System / sans-serif — labels, eyebrows, metadata.

**Convention patterns** observed across screens: uppercase **eyebrow** labels (`fontSize`
10–11, `fontWeight` 800–900) above a serif display title; body copy at 13–16 in `muted`.

### 6.3 Shape, elevation, spacing

- **Border radius**: pills/nodes are fully rounded; cards, sheets, buttons use `borderRadius: 8`.
- **Elevation**: `shadow` token is platform-selected (iOS `shadowColor/Opacity/Radius/Offset`,
  Android `elevation`, web `boxShadow`) and applied sparingly (current node, sheets, cards).
- **Layout**: content columns are centered and width-capped (`maxWidth` ~520–620) so tablet
  and web renders stay readable; horizontal padding 20–28. Primary buttons target ~54px min
  height. `SafeAreaView` (from `react-native-safe-area-context`) wraps every screen.
- **Accessibility**: interactive elements set `accessibilityRole`/`accessibilityLabel`
  (nodes, sheet controls, sound buttons, session close), and audio buttons expose
  `accessibilityState` busy/disabled. Pressed states use opacity or a slight scale-down.

---

## 7. Lesson-state visual language (for Stitch reference)

Lesson status (`LessonStatus` in `types/learning.ts`) drives node appearance in
`roadmap-node.tsx`:

| Status | Node color | Icon | Status copy |
|---|---|---|---|
| `completed` | `success` (green) | `checkmark` | "Completed" |
| current / `in_progress` | `accent` (red) | `book` | "Next lesson" / "{accuracy}% so far" |
| `unlocked` | `gold` | `play` | "Ready" |
| `coming_soon` | grey `#DED8CF` | `lock-closed` | "Coming soon" |
| `locked` | grey `#DED8CF` | `lock-closed` | "Locked" |

The **current** lesson additionally gets a halo ring, a larger icon, an accent dot, and the
elevation shadow — it is the strongest visual anchor on the Map.

---

## 8. Known gaps & assumptions (call-outs for research)

- **Auth**: everything is hard-coded to `userId: 'guest'`; there is no login, and the
  Profile tab is a stub. **Assumption**: multi-user is planned but unbuilt on mobile.
- **Session resume**: an interrupted session is not resumed at the saved question — leaving
  a session returns to the Map (project `README.md` "Current Limitations").
- **Review / Progress / Profile**: navigation-only placeholders; their real UX is undefined
  in mobile code.
- **Template residue**: `constants/theme.ts`, the `use-color-scheme` hooks, and most
  `components/ui/*` + `themed-*` files are Expo-starter scaffolding not used by product
  screens. Treat `constants/kokoro-theme.ts` as the design source of truth.
- **Teaching content coverage**: only lessons with `content.hasTeachingContent` route through
  the teaching screen; the pilot is Hiragana Vowels (illustration assets exist only for
  vowels). Other lessons go straight to the question session.
