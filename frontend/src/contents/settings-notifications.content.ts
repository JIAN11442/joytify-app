import { RiUserStarLine } from "react-icons/ri";
import { IoStatsChartOutline } from "react-icons/io5";
import { MdOutlineAnnouncement } from "react-icons/md";

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
      name: "monthlyStatistics",
      icon: { name: IoStatsChartOutline, color: "text-orange-400", size: 25 },
      title: settingsNotificationsFm("monthlyStatisticsReport.title"),
      description: settingsNotificationsFm("monthlyStatisticsReport.description"),
    },
    {
      id: "following-artist-updates",
      name: "followingArtistUpdates",
      icon: { name: RiUserStarLine, color: "text-indigo-400", size: 25 },
      title: settingsNotificationsFm("followingArtistUpdates.title"),
      description: settingsNotificationsFm("followingArtistUpdates.description"),
    },
    {
      id: "system-announcements",
      name: "systemAnnouncements",
      icon: { name: MdOutlineAnnouncement, color: "text-cyan-400", size: 25 },
      title: settingsNotificationsFm("systemAnnouncements.title"),
      description: settingsNotificationsFm("systemAnnouncements.description"),
    },
  ];
  return fields as NotificationField[];
};
