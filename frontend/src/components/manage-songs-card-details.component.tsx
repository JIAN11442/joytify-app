import { useScopedIntl } from "../hooks/intl.hook";
import { getManageSongsCardDetailsContent } from "../contents/manage-songs-card-details.content";
import { RefactorSongResponse } from "@joytify/shared-types/types";

type ManageSongsCardDetailsProps = {
  song: RefactorSongResponse;
};

const ManageSongsCardDetails: React.FC<ManageSongsCardDetailsProps> = ({ song }) => {
  const { intl, fm } = useScopedIntl();
  const songCardDetailsFields = getManageSongsCardDetailsContent(fm, intl, song);

  return (
    <div
      className={`
        flex
        flex-col
        gap-1
        text-sm
        text-neutral-500
        leading-7
      `}
    >
      {songCardDetailsFields.map((field) => {
        const { id, title, value } = field;

        return (
          <div
            key={id}
            className={`
              flex 
              gap-5 
              justify-between 
              items-baseline 
              truncate
          `}
          >
            <span className="text-neutral-500">{title}:</span>
            <span className="song-card-details">{value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ManageSongsCardDetails;
