import { RiErrorWarningLine, RiUserStarLine } from "react-icons/ri";
import { IoStatsChartOutline } from "react-icons/io5";
import { IconName } from "../components/react-icons.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { DefaultNotificationPreferencesForm } from "../types/form.type";

interface NotificationField {
  id: string;
  name: keyof DefaultNotificationPreferencesForm;
  icon: { name: IconName; color: string; size: number };
  title: string;
  description: string;
}

export const getSettingsNotificationsFields = (fm: ScopedFormatMessage): NotificationField[] => {
  const settingsNotificationsFm = fm("settings.notifications");

  const fields = [
    {
      id: "monthly-statistics-report",
      name: "monthlyStatistic",
      icon: { name: IoStatsChartOutline, color: "text-orange-400", size: 25 },
      title: settingsNotificationsFm("monthlyStatisticReport.title"),
      description: settingsNotificationsFm("monthlyStatisticReport.description"),
    },
    {
      id: "following-artist-update",
      name: "followingArtistUpdate",
      icon: { name: RiUserStarLine, color: "text-indigo-400", size: 25 },
      title: settingsNotificationsFm("followingArtistUpdate.title"),
      description: settingsNotificationsFm("followingArtistUpdate.description"),
    },
    {
      id: "system-announcement",
      name: "systemAnnouncement",
      icon: { name: RiErrorWarningLine, color: "text-cyan-400", size: 25 },
      title: settingsNotificationsFm("systemAnnouncement.title"),
      description: settingsNotificationsFm("systemAnnouncement.description"),
    },
  ];
  return fields as NotificationField[];
};
