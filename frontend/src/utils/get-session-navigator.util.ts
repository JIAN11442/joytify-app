import { SessionNavigator } from "@joytify/shared-types/types";

type ExpandNavigator = Navigator & SessionNavigator;

export const getSessionNavigator = () => {
  const nav = navigator as ExpandNavigator;

  return {
    userAgent: nav.userAgent,
    maxTouchPoints: nav.maxTouchPoints,
    onLine: nav.onLine,
    connection: {
      effectiveType: nav.connection.effectiveType,
      type: nav.connection.type,
      downlink: nav.connection.downlink,
      downlinkMax: nav.connection.downlinkMax,
      rtt: nav.connection.rtt,
      saveData: nav.connection.saveData,
    },
  };
};
