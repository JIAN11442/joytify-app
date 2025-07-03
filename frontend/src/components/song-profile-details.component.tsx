import { useState } from "react";
import { useScopedIntl } from "../hooks/intl.hook";
import { SongProfileDetailsOptions } from "@joytify/shared-types/constants";
import { RefactorSongResponse, SongProfileDetailsType } from "@joytify/shared-types/types";
import { getSongProfileDetailsContent } from "../contents/song-profile-details.content";
import { timeoutForDelay } from "../lib/timeout.lib";

type SongProfileDetailsProps = {
  song: RefactorSongResponse;
};

const SongProfileDetails: React.FC<SongProfileDetailsProps> = ({ song }) => {
  const { fm, intl } = useScopedIntl();
  const songProfileDetailsContent = getSongProfileDetailsContent(fm, intl, song);

  const { BASIC_INFO, STATS_INFO } = SongProfileDetailsOptions;

  const [selectedDetailsType, setSelectedDetailsType] =
    useState<SongProfileDetailsType>(BASIC_INFO);

  const handleSwitchDetailsType = (key: SongProfileDetailsType) => {
    timeoutForDelay(() => {
      setSelectedDetailsType(key);
    });
  };

  const { paletee } = song;
  const { basicInfoField, statsInfoField } = songProfileDetailsContent;

  return (
    <div
      className={`
        flex
        flex-col
        w-full
        gap-5
      `}
    >
      {/* button */}
      <div
        className={`
          max-sm:grid
          max-sm:grid-cols-2
          sm:flex
          gap-3
          w-full
          items-center
          sm:justify-end
        `}
      >
        {/* options */}
        {Object.values(songProfileDetailsContent).map((field) => {
          const { id, key, title } = field;

          return (
            <button
              key={id}
              style={{
                backgroundColor: `${paletee?.vibrant}`,
              }}
              onClick={() => handleSwitchDetailsType(key)}
              className={`
                p-2
                px-5
                text-[14px]
                font-ubuntu
                ${selectedDetailsType === key ? "opacity-100" : "opacity-50 hover:opacity-60"}
                rounded-md
                transition-all
              `}
            >
              {title}
            </button>
          );
        })}
      </div>

      {/* information */}
      <div className={`bg-neutral-100/5 p-10 rounded-md`}>
        {selectedDetailsType === BASIC_INFO && (
          <div
            className={`
              flex
              flex-col
              w-full
              gap-4
              text-[14px]
            `}
          >
            {basicInfoField.items.map((item) => {
              const { id, title, value } = item;

              return (
                <div key={id} className={`flex gap-5 justify-between items-baseline truncate`}>
                  <span className="text-neutral-400">{title}:</span>
                  <span className={`song-card-details ${value === "N/A" && "text-neutral-500"}`}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {selectedDetailsType === STATS_INFO && (
          <div
            className={`
              flex
              flex-col
              w-full
              gap-5
              text-[14px]
            `}
          >
            {statsInfoField.items.map((item) => {
              const { id, title, value } = item;

              return (
                <div key={id} className={`flex gap-5 justify-between items-baseline truncate`}>
                  <span className="text-neutral-400">{title}:</span>
                  <span className={`song-card-details ${value === "N/A" && "text-neutral-500"}`}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongProfileDetails;
