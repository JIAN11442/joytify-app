import { MdDevices } from "react-icons/md";
import { LuWifi, LuWifiOff } from "react-icons/lu";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { IconName } from "../components/react-icons.component";

interface DeviceStatusOverviewField {
  id: string;
  key: string;
  color: string;
  icon: { name: IconName; color: string; size: number };
  title: string;
  description: string;
}

export const getDeviceStatusOverviewFields = (
  fm: ScopedFormatMessage
): DeviceStatusOverviewField[] => {
  const settingsConnectedDevicesFm = fm("settings.connectedDevices");

  const fields = [
    {
      id: "overview-total-devices",
      key: "total",
      color: "#93c5fd",
      icon: { name: MdDevices, color: "text-blue-300", size: 25 },
      title: settingsConnectedDevicesFm("overview.total.title"),
      description: settingsConnectedDevicesFm("overview.total.description"),
    },
    {
      id: "overview-online-devices",
      key: "online",
      color: "#86efac",
      icon: { name: LuWifi, color: "text-green-300", size: 25 },
      title: settingsConnectedDevicesFm("overview.online.title"),
      description: settingsConnectedDevicesFm("overview.online.description"),
    },
    {
      id: "overview-offline-devices",
      key: "offline",
      color: "#fca5a5",
      icon: { name: LuWifiOff, color: "text-red-300", size: 25 },
      title: settingsConnectedDevicesFm("overview.offline.title"),
      description: settingsConnectedDevicesFm("overview.offline.description"),
    },
  ];

  return fields as DeviceStatusOverviewField[];
};
