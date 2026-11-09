# AOM Online Madrasa — Client

Frontend for **AOM Online Madrasa**, an online madrasa management system. The
entire user interface is in **Bangla** (বাংলা) with an Islamic madrasa theme.

> Phase 1 — Foundation only. Feature pages, dashboards and modules are added in
> later phases.

## Tech Stack

- **Next.js 16** (App Router, JavaScript)
- **React 19**
- **Tailwind CSS v4** (`@tailwindcss/postcss`, theme via `@theme` in `globals.css`)
- **Redux Toolkit** + `react-redux`
- **react-hook-form** + `@hookform/resolvers` + `zod`
- **framer-motion**, **react-icons**
- Default font: **Hind Siliguri** (`next/font/google`, subsets `bengali` + `latin`)

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve production build on port 5005
npm run lint     # eslint
```

## Environment

Copy `.env.local.example` to `.env.local` and set the backend URL:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The client appends `/api` automatically (see `src/config/api.js`).

## Project Structure

```
src/
├── app/                     # App Router (layout.js, globals.css, page.jsx)
├── components/
│   ├── ui/                  # Reusable UI: Button, Card, Input, Select,
│   │                        #   Badge, Modal, Skeleton, Spinner
│   ├── shared/              # Navbar, Footer
│   └── ReduxProviderWrapper.jsx
├── config/api.js            # Central API base URL
├── context/SettingsContext.jsx
└── redux/store.js           # Redux store (empty reducers for now)
```

## Design System

Defined via `@theme` in `src/app/globals.css`:

- **Primary teal** — `#029199` (sampled from the logo)
- **Secondary** — deep Islamic green
- **Accent** — Islamic gold / amber
- Soft near-white / light-teal surfaces, rounded corners, soft shadows

Colors are exposed as Tailwind utilities, e.g. `bg-primary-500`,
`text-secondary-700`, `ring-accent-200`.
