/**
 * Device ID Management Service
 * Generates and manages unique device identifiers for user sessions
 */

const DEVICE_ID_KEY = 'meera_fashion_device_id';
const DEVICE_ID_VERSION = 'v1';

interface DeviceInfo {
  id: string;
  createdAt: string;
  lastActive: string;
  fingerprint: string;
}

/**
 * Generate a unique device fingerprint based on browser/device characteristics
 */
function generateFingerprint(): string {
  const navigator_data = `${navigator.userAgent}-${navigator.language}-${new Date().getTimezoneOffset()}`;
  const screen_data = `${window.screen.width}x${window.screen.height}-${window.screen.colorDepth}`;
  
  // Simple hash function
  let hash = 0;
  const str = navigator_data + screen_data;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  const timestamp = Date.now().toString(16);
  const random = Math.random().toString(16).slice(2);
  const fingerprint = generateFingerprint();
  
  return `${DEVICE_ID_VERSION}-${timestamp}-${random}-${fingerprint}`;
}

/**
 * Get or create device ID from localStorage
 */
export function getDeviceId(): string {
  try {
    const stored = localStorage.getItem(DEVICE_ID_KEY);
    
    if (stored) {
      try {
        const deviceInfo: DeviceInfo = JSON.parse(stored);
        // Update last active time
        deviceInfo.lastActive = new Date().toISOString();
        localStorage.setItem(DEVICE_ID_KEY, JSON.stringify(deviceInfo));
        return deviceInfo.id;
      } catch {
        // Invalid stored data, generate new
        localStorage.removeItem(DEVICE_ID_KEY);
      }
    }
    
    // Create new device ID
    const newDeviceInfo: DeviceInfo = {
      id: generateDeviceId(),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      fingerprint: generateFingerprint(),
    };
    
    localStorage.setItem(DEVICE_ID_KEY, JSON.stringify(newDeviceInfo));
    return newDeviceInfo.id;
  } catch (error) {
    console.warn('Device ID storage unavailable, using temporary ID');
    return `temp-${generateDeviceId()}`;
  }
}

/**
 * Clear device ID (useful for logout/reset)
 */
export function clearDeviceId(): void {
  try {
    localStorage.removeItem(DEVICE_ID_KEY);
  } catch (error) {
    console.warn('Failed to clear device ID');
  }
}

/**
 * Get current device info
 */
export function getDeviceInfo(): DeviceInfo | null {
  try {
    const stored = localStorage.getItem(DEVICE_ID_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    return null;
  }
  return null;
}
