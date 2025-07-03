import { RefactorSongResponse } from "@joytify/shared-types/types";
import { getManageSongCardDetailsContent } from "../contents/manage-song-card-details.content";
import { useScopedIntl } from "../hooks/intl.hook";

type ManageSongCardDetailsProps = {
  song: RefactorSongResponse;
};

const ManageSongCardDetails: React.FC<ManageSongCardDetailsProps> = ({ song }) => {
  const { intl, fm } = useScopedIntl();
  const songCardDetailsFields = getManageSongCardDetailsContent(fm, intl, song);

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

export default ManageSongCardDetails;
