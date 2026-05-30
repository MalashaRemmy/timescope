# TimeScope

A cinematic temporal visualization platform. Navigate time like a map — zoom, pan, and explore across scales from decades to hours.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Canvas API** (coordinate-based rendering engine)

## Timezone

Locked to **Africa/Lusaka** (CAT, UTC+2).

---

## Local Development

### Prerequisites

- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Interactions

| Action | Result |
|--------|--------|
| **Drag** left/right | Pan through time |
| **Scroll wheel** | Zoom in/out |
| **Pinch** (touch) | Zoom in/out |
| **⬤ Now** button | Snap to present |
| **+ / −** buttons | Step zoom levels |

## Zoom Scales

Decade → 5 Years → 4 Years → 3 Years → 2 Years → **Year** (default) → Quarter → Month → Week → Day → Hours

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or push to GitHub and import at [vercel.com](https://vercel.com).

---

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Main page — orchestrates all components
│   └── globals.css         # Tailwind + custom keyframes
├── components/
│   ├── timeline/
│   │   ├── TimelineCanvas.tsx   # Canvas wrapper + interaction bridge
│   │   └── NowMarker.tsx        # Animated NOW tooltip
│   ├── ui/
│   │   ├── Header.tsx           # Logo + scale badge + live clock
│   │   └── ScaleTransition.tsx  # Animated scale label
│   └── hud/
│       └── HUD.tsx              # Bottom control bar
├── hooks/
│   ├── useViewport.ts      # Zoom/pan state machine (useReducer)
│   ├── useLiveClock.ts     # 1s clock tick in Africa/Lusaka
│   ├── useCanvasSize.ts    # DPR-aware canvas sizing via ResizeObserver
│   └── useInteractions.ts  # Mouse/wheel/touch event handlers
├── lib/
│   ├── constants.ts        # Scales, colors, time constants
│   ├── timeEngine.ts       # Coordinate math, clock helpers
│   └── canvasRenderer.ts   # All canvas drawing logic
└── types/
    └── index.ts            # TypeScript interfaces
```
