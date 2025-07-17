export interface DeviceTypeConfig {
  category: 'environmental' | 'security' | 'control'
  icon: string
  description: string
  values: 'continuous' | 'binary'
  unit?: string
  round?: number
  valueMap?: {
    [key: number]: {
      text: string
      color: string
    }
  }
}

export const DEVICE_TYPES: Record<number, DeviceTypeConfig> = {
  0: {
    category: "environmental",
    icon: "🌡️", // Temperature
    description: "Temperature Sensor",
    values: 'continuous',
    unit: "℃",
    round: 1
  },
  1: {
    category: "environmental", 
    icon: "💧", // Water drop for humidity
    description: "Humidity Sensor",
    values: 'continuous',
    unit: "%",
    round: 0
  },
  2: {
    category: "environmental",
    icon: "☠️", // Air quality
    description: "Air Quality Sensor",
    values: 'binary',
    valueMap: {
      0: {
        text: "Non-toxic",
        color: "blue"
      },
      1: {
        text: "Toxic", 
        color: "orange"
      }
    }
  },
  3: {
    category: "security",
    icon: "👁️", // Eye for infrared
    description: "Infrared Sensor",
    values: 'binary',
    valueMap: {
      0: {
        text: "No threat",
        color: "green"
      },
      1: {
        text: "Threat",
        color: "red"
      }
    }
  },
  4: {
    category: "control",
    icon: "💡", // Light bulb
    description: "Remote Light Switch",
    values: 'binary',
    valueMap: {
      0: {
        text: "Off",
        color: 'gray'
      },
      1: {
        text: "On",
        color: 'yellow'
      }
    }
  },
  5: {
    category: "security",
    icon: "🔒", // Lock
    description: "Frame Status Sensor", 
    values: 'binary',
    valueMap: {
      0: {
        text: "Closed",
        color: "green"
      },
      1: {
        text: "Open",
        color: "red"
      }
    }
  }
}

export const DEVICE_CATEGORIES = {
  environmental: {
    name: 'Environmental',
    color: 'bg-green-500',
    description: 'Temperature, humidity, air quality sensors'
  },
  security: {
    name: 'Security',
    color: 'bg-red-500', 
    description: 'Motion detectors, door sensors, security devices'
  },
  control: {
    name: 'Control',
    color: 'bg-blue-500',
    description: 'Lights, switches, controllable devices'
  }
} as const 