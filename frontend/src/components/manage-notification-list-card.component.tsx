import { FormattedMessage, IntlShape } from "react-intl";
import { IoStatsChartOutline } from "react-icons/io5";
import { RiErrorWarningLine, RiUserStarLine } from "react-icons/ri";
import ManageNotificationCard from "./manage-notification-card.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { NotificationTypeOptions } from "@joytify/shared-types/constants";
import { RefactorNotificationResponse } from "@joytify/shared-types/types";
import { getTimeAgo } from "../utils/get-time.util";
import useLocaleState from "../states/locale.state";

type NotificationListCardProps = {
  fm: ScopedFormatMessage;
  intl: IntlShape;
  notification: RefactorNotificationResponse;
};

const ManageNotificationListCard: React.FC<NotificationListCardProps> = ({
  fm,
  intl,
  notification,
}) => {
  const notificationControlPanelFm = fm("manage.notification.controlPanel");
  const notificationCardPrefix = "manage.notification.card";
  const notificationCardFm = fm(notificationCardPrefix);

  const { themeLocale } = useLocaleState();

  const { type, isRead, monthlyStatistic, followingArtistUpdate, systemAnnouncement, createdAt } =
    notification;
  const { MONTHLY_STATISTIC, FOLLOWING_ARTIST_UPDATE, SYSTEM_ANNOUNCEMENT } =
    NotificationTypeOptions;

  const localeDateTimeAgo = getTimeAgo(createdAt.toString(), themeLocale);

  switch (type) {
    // monthly statistics
    case MONTHLY_STATISTIC: {
      if (!monthlyStatistic) return null;

      const { month, totalHours, growthPercentage } = monthlyStatistic;
      const tag = notificationControlPanelFm("monthlyStats");
      const title = notificationCardFm("monthlyStats.title", { month });

      const MonthlyStatsDescription = () => {
        if (growthPercentage === undefined) return null;

        const isGrowth = growthPercentage > 0;
        const growthType = isGrowth ? "increase" : "decrease";
        const absGrowthPercentage = Math.abs(growthPercentage);

        return (
          <>
            <FormattedMessage
              id={`${notificationCardPrefix}.monthlyStats.description`}
              values={{
                totalHours,
                span: (chunks: React.ReactNode) => (
                  <span className={`text-orange-400 font-bold`}>{chunks}</span>
                ),
              }}
            />
            <FormattedMessage
              id={`${notificationCardPrefix}.monthlyStats.description.additionalInfo.growth.${growthType}`}
              values={{
                growthPercentage: absGrowthPercentage,
                span: (chunks: React.ReactNode) => (
                  <span className={`text-orange-400 font-bold`}>{chunks}</span>
                ),
              }}
            />
          </>
        );
      };

      return (
        <ManageNotificationCard
          fm={fm}
          icon={{ name: IoStatsChartOutline, opts: { size: 22 } }}
          tag={tag}
          isRead={isRead}
          title={title}
          description={<MonthlyStatsDescription />}
          date={localeDateTimeAgo}
          tw={{ icon: "text-orange-400" }}
        />
      );
    }

    // following artist updates
    case FOLLOWING_ARTIST_UPDATE: {
      if (!followingArtistUpdate) return null;

      const { artistName, songName, albumName } = followingArtistUpdate;

      const artistUpdateFm = fm(`${notificationCardPrefix}.artistUpdate`);

      const tag = notificationControlPanelFm("artistUpdates");
      const titleAdditionalInfo = artistUpdateFm("title.additionalInfo.newSong");
      const title = artistUpdateFm("title", {
        artist: artistName,
        additionalInfo: titleAdditionalInfo,
      });

      const ArtistUpdateDescription = () => {
        const hasAlbum = albumName && albumName.trim() !== "";
        const artistUpdateDescriptionId = `${notificationCardPrefix}.artistUpdate.description`;
        const additionalInfoId = `${artistUpdateDescriptionId}.additionalInfo.${
          hasAlbum ? "newSongToAlbum" : "newSong"
        }`;

        return (
          <FormattedMessage
            id={artistUpdateDescriptionId}
            values={{
              artist: artistName,
              additionalInfo: (
                <FormattedMessage
                  id={additionalInfoId}
                  values={{
                    song: songName,
                    album: albumName,
                    span: (chunk) => <span className={`text-indigo-400 font-bold`}>{chunk}</span>,
                  }}
                />
              ),
              span: (chunk) => <span className={`text-indigo-400 font-bold`}>{chunk}</span>,
            }}
          />
        );
      };

      return (
        <ManageNotificationCard
          fm={fm}
          icon={{ name: RiUserStarLine, opts: { size: 22 } }}
          tag={tag}
          isRead={isRead}
          title={title}
          description={<ArtistUpdateDescription />}
          date={localeDateTimeAgo}
          tw={{ icon: "text-indigo-400" }}
        />
      );
    }

    // system announcements
    case SYSTEM_ANNOUNCEMENT: {
      if (!systemAnnouncement) return null;

      const { date, startTime, endTime } = systemAnnouncement;
      const title = notificationCardFm("systemAnnouncement.title");

      const SystemAnnouncementDescription = () => {
        if (!date || !startTime || !endTime) return null;

        return (
          <FormattedMessage
            id={`${notificationCardPrefix}.systemAnnouncement.description`}
            values={{
              date: intl.formatDate(date, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              startTime: intl.formatTime(startTime, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              endTime: intl.formatTime(endTime, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              span: (chunk) => <span className={`text-cyan-400 font-bold`}>{chunk}</span>,
            }}
          />
        );
      };

      return (
        <ManageNotificationCard
          fm={fm}
          icon={{ name: RiErrorWarningLine, opts: { size: 25 } }}
          tag={notificationControlPanelFm("systemAnnouncements")}
          isRead={isRead}
          title={title}
          description={<SystemAnnouncementDescription />}
          date={localeDateTimeAgo}
          tw={{ icon: "text-cyan-400" }}
        />
      );
    }
    default:
      return <div>hello, this is unknown notification</div>;
  }
};

export default ManageNotificationListCard;
