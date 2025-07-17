# Jarvis Smart Home Web App

A modern, responsive web application for managing your smart home ecosystem built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.17+ or 20+
- **npm** or **yarn** package manager
- **Git** for cloning the repository

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd jarvis-web-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**:
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
   > **Note**: Replace with your actual FastAPI backend URL

### Development Server

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at **http://127.0.0.1:5500**

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. **Start production server**:
   ```bash
   npm start
   # or
   yarn start
   ```

### Serving Options

#### Option 1: Development Server (Recommended for testing)
```bash
npm run dev -- --hostname 127.0.0.1 --port 5500
```

#### Option 2: Production Build + Serve
```bash
# Build the app
npm run build

# Serve the built app
npm start -- --hostname 127.0.0.1 --port 5500
```

#### Option 3: Static Export (if needed)
```bash
# Add to next.config.js if you need static export
npm run build
npx serve out/ -l 5500
```

### Configuration

#### Backend Connection
The app connects to your FastAPI backend via the `NEXT_PUBLIC_API_URL` environment variable. Make sure your backend is running and accessible.

#### Network Access
- **Local access**: http://127.0.0.1:5500
- **Network access**: http://[your-ip]:5500 (configure hostname in next.config.js if needed)

## 🎨 Design & Features

### Color Palette
- **Primary**: Blue tones (#3b82f6) - Professional and trustworthy
- **Secondary**: Teal accents (#14b8a6) - Modern tech feel  
- **Dark Theme**: Sophisticated dark grays (#0f172a to #1e293b)
- **Glass Morphism**: Subtle transparency effects for modern UI

### Design Philosophy
- **Professional**: Clean, enterprise-grade interface suitable for smart home management
- **Responsive**: Optimized for both laptop and smartphone viewing
- **Accessible**: High contrast ratios and clear typography
- **Modern**: Glass morphism, gradient backgrounds, smooth animations

## 🔐 Authentication

The login screen integrates with your FastAPI backend using:
- OAuth2 password flow (`/token` endpoint)
- JWT token storage in localStorage
- Automatic token refresh handling
- Secure logout (`/logout` endpoint)

## 🏠 Hub Management

After login, users can manage multiple smart home hubs:

### First Time Setup
- **No Hubs**: Welcome screen with "Claim First Hub" button
- **Hub Claiming**: Modal with Hub ID and verification code input
- **Guided Setup**: Clear instructions for finding credentials on Raspberry Pi

### Hub Dashboard
- **Hub Grid**: Visual cards showing all connected hubs
- **Hub Status**: Real-time online/offline indicators
- **Editable Nicknames**: Click-to-edit hub names for easy identification
- **Live Device Stats**: Real-time device counts and last update timestamps

### Hub Navigation
Each hub card provides access to:
- 📍 **Areas**: Manage rooms and locations within the hub ✅ **IMPLEMENTED**
- 📊 **Devices & Sensors**: View all devices with filtering and real-time data ✅ **IMPLEMENTED**

### Device & Sensor Management ✅ **LATEST**
Comprehensive device monitoring with **real-time updates every 5 seconds**:

#### **Device Type Support**
- 🌡️ **Environmental**: Temperature sensors (℃), humidity sensors (%), air quality monitors
- 🔒 **Security**: Infrared sensors, door/window sensors, motion detectors
- 💡 **Control**: Smart switches, lights, controllable devices

#### **Real-time Features**
- **Live Values**: Auto-refreshing sensor readings and device states
- **Last Update**: Shows when latest data was received from any sensor
- **Status Indicators**: Clean design without colored backgrounds
- **Value Formatting**: Automatic formatting based on device type and binary states

#### **Advanced Filtering**
- **Category Filter**: Environmental, Security, Control devices
- **Area Filter**: Filter by specific rooms/locations + "Unassigned" devices
- **Search**: Find devices by name or description
- **Collapsible Stats**: Device category breakdowns in expandable section

#### **Area Management**
- **Create/Rename/Delete**: Full CRUD operations for organizing devices
- **Unassigned Devices**: Special section for devices not yet assigned to areas
- **Device Lists**: Expandable area cards showing devices within each location

### API Integration
**Hub Management:**
- `GET /get_hubs`: Fetch user's claimed hubs
- `POST /claim_hub`: Add new hub with verification
- `POST /set_hub_nickname`: Update hub display names

**Area Management:**
- `GET /get_areas`: Fetch areas for a hub
- `POST /create_area`: Create new area within a hub
- `PUT /rename_area`: Update area name
- `DELETE /delete_area`: Remove area and unassign devices

**Device & Sensor Data:**
- `GET /get_devices_latest_data`: Fetch latest readings from all devices/sensors (**refreshed every 5 seconds**)

## 📱 Mobile Responsive

The interface adapts seamlessly across devices:
- **Desktop**: Full-featured layout with glass card design
- **Mobile**: Touch-optimized inputs and responsive typography
- **Tablet**: Balanced experience between desktop and mobile

## 🛠 Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful, consistent icons
- **Axios**: HTTP client for API communication

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🐛 Troubleshooting

### Port Already in Use
If port 5500 is busy:
```bash
# Kill the process using the port
lsof -ti:5500 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Backend Connection Issues
- Check that your FastAPI backend is running
- Verify the `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS or network errors

### Build Issues
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

---

**Ready to manage your smart home!** 🏠✨