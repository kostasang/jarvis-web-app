# Jarvis Smart Home Web App

Next.js 14 web application for smart home management.

## Requirements

- Node.js 18.17.0+
- npm 9+ (or yarn)

## Setup

```bash
git clone <repo-url>
cd jarvis-web-app
npm install
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://jarvis-core.ddns.net
NEXT_PUBLIC_MEDIA_SERVER_URL=https://jarvis-core.ddns.net:8889
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

**Required:**
- `NEXT_PUBLIC_API_URL` - FastAPI backend URL
- `NEXT_PUBLIC_MEDIA_SERVER_URL` - MediaMTX server URL for camera streams  
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key

## Development

```bash
npm run dev
```

Runs on http://127.0.0.1:5500

**Custom host/port:**
```bash
npm run dev -- --hostname 0.0.0.0 --port 3000
```

## Production

```bash
npm run build
npm start
```

**Custom host/port:**
```bash
npm start -- --hostname 0.0.0.0 --port 3000
```

## Scripts

- `npm run dev` - Development server (127.0.0.1:5500)
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - ESLint

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- Lucide React