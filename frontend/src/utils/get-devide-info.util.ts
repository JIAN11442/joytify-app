import DeviceDetector from "node-device-detector";
import { deviceDetect } from "react-device-detect";
import { DEVICE_TYPES, SCREEN_SIZES } from "@joytify/types/constants";
import { ExpandNavigator, IPGeoLocation, SessionInfo } from "@joytify/types/types";

type DeviceCategory = {
  isTablet: boolean;
  isMobile: boolean;
  isBrowser: boolean;
};

const nav = navigator as ExpandNavigator;

const calculateScreenDiagonal = (): number => {
  const width = window.screen.width / window.devicePixelRatio;
  const height = window.screen.height / window.devicePixelRatio;
  return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 96;
};

const hasTouchSupport = (): boolean => {
  return "ontouchstart" in window || nav.maxTouchPoints > 0;
};

const getNetworkType = () => {
  return {
    type: nav.connection?.effectiveType?.toUpperCase() ?? "Unknown",
    downlink: nav.connection?.downlink ?? 0,
    rtt: nav.connection?.rtt ?? 0,
    saveData: nav.connection?.saveData ?? false,
  };
};

const getDeviceCategory = ({ isTablet, isMobile, isBrowser }: DeviceCategory): string => {
  if (isTablet) return DEVICE_TYPES.TABLET;
  if (isMobile) return DEVICE_TYPES.MOBILE;
  if (!isBrowser) return DEVICE_TYPES.UNKNOWN;

  const screenWidth = window.screen.width;
  const diagonalInches = calculateScreenDiagonal();
  const hasTouch = hasTouchSupport();

  if (
    (!hasTouch &&
      diagonalInches >= SCREEN_SIZES.LAPTOP.MIN_DIAGONAL &&
      diagonalInches <= SCREEN_SIZES.LAPTOP.MAX_DIAGONAL) ||
    (screenWidth >= SCREEN_SIZES.LAPTOP.MIN_WIDTH && screenWidth <= SCREEN_SIZES.LAPTOP.MAX_WIDTH)
  ) {
    return DEVICE_TYPES.LAPTOP;
  }

  if (
    (!hasTouch && diagonalInches > SCREEN_SIZES.DESKTOP.MIN_DIAGONAL) ||
    screenWidth > SCREEN_SIZES.DESKTOP.MIN_WIDTH
  ) {
    return DEVICE_TYPES.DESKTOP;
  }

  return DEVICE_TYPES.UNKNOWN;
};

export const getSessionInfo = (ipGeoLocationInfo: IPGeoLocation): SessionInfo => {
  const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    osIndexes: true,
    deviceAliasCode: false,
    deviceTrusted: false,
    deviceInfo: false,
    maxUserAgentSize: 500,
  });

  const nodeDeviceInfo = detector.detect(nav.userAgent);
  const reactDeviceInfo = deviceDetect(nav.userAgent);

  const deviceIsMobile = reactDeviceInfo.isMobile ?? false;
  const deviceIsTablet = reactDeviceInfo.isTablet ?? false;
  const deviceIsBrowser = reactDeviceInfo.isBrowser ?? false;
  const deviceIsDesktop = !deviceIsMobile && !deviceIsTablet;
  const deviceIsTouch = hasTouchSupport();
  const deviceType = getDeviceCategory({
    isMobile: deviceIsMobile,
    isTablet: deviceIsTablet,
    isBrowser: deviceIsBrowser,
  });

  return {
    userAgent: nav.userAgent,
    device: {
      name: nodeDeviceInfo.device.brand ?? "Unknown",
      type: deviceType,
      os: reactDeviceInfo.osName ?? "Unknown",
      osVersion: nodeDeviceInfo.os.version ?? "Unknown",
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio ?? 1,
      },
      isTouch: deviceIsTouch,
      isMobile: deviceIsMobile,
      isTablet: deviceIsTablet,
      isDesktop: deviceIsDesktop,
    },
    browser: {
      name: nodeDeviceInfo.client.name ?? "Unknown",
      version: nodeDeviceInfo.client.version ?? "Unknown",
      engine: nodeDeviceInfo.client.engine ?? "Unknown",
      engineVersion: nodeDeviceInfo.client.engine_version ?? "Unknown",
    },
    network: getNetworkType(),
    location: {
      ipAddress: ipGeoLocationInfo.ip,
      country: ipGeoLocationInfo.country_name,
      region: ipGeoLocationInfo.region_name,
      city: ipGeoLocationInfo.city_name,
      timezone: ipGeoLocationInfo.time_zone,
      isp: ipGeoLocationInfo.as,
    },
    status: {
      online: true,
      lastActive: "",
    },
  };
};
