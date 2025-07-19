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
NEXT_PUBLIC_WEBSOCKET_URL=wss://jarvis-core.ddns.net
NEXT_PUBLIC_MEDIA_SERVER_URL=https://jarvis-core.ddns.net:8889
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

**Required:**

- `NEXT_PUBLIC_API_URL` - FastAPI backend URL
- `NEXT_PUBLIC_WEBSOCKET_URL` - WebSocket URL for real-time device notifications
- `NEXT_PUBLIC_MEDIA_SERVER_URL` - MediaMTX server URL for camera streams  
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key

## Development

```bash
npm run dev -- --hostname 127.0.0.1 --port 5500
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

## GitHub Pages Deployment

This app is configured for automatic deployment to GitHub Pages via GitHub Actions.

### Setup Steps

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"

2. **Add Environment Secrets** in your repository:
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `NEXT_PUBLIC_API_URL`
     - `NEXT_PUBLIC_WEBSOCKET_URL`
     - `NEXT_PUBLIC_MEDIA_SERVER_URL`
     - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

3. **Update basePath** in `next.config.js`:
   - Change `/jarvis-web-app` to match your repository name

4. **Push to cursor-support branch** - deployment happens automatically

**Your app will be available at:** `https://username.github.io/repository-name`

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
