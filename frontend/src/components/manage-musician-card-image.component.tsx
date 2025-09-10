import { twMerge } from "tailwind-merge";
import { TiUserOutline } from "react-icons/ti";
import { PiMusicNoteSimpleFill } from "react-icons/pi";
import Icon from "./react-icons.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { MusicianResponse } from "@joytify/types/types";

type ManageMusicianCardImageProps = {
  fm: ScopedFormatMessage;
  musician: MusicianResponse;
  hasTags?: boolean;
  hasStats?: boolean;
  tw?: { img?: string };
};

const ManageMusicianCardImage: React.FC<ManageMusicianCardImageProps> = ({
  fm,
  musician,
  hasTags = true,
  hasStats = true,
  tw,
}) => {
  const musicianRoleFm = fm("musician.role");
  const { coverImage, roles, followers, songs } = musician;

  return (
    <div className={`group relative w-full h-full overflow-hidden`}>
      <img
        src={coverImage}
        className={twMerge(
          `
            w-full
            h-[250px]
            object-cover
            rounded-md
          `,
          tw?.img
        )}
      />

      {/* mask */}
      <div className={`image-bottom-mask group-hover:rounded-none`} />

      {/* tags */}
      {hasTags && (
        <div
          className={`
            absolute
            top-2
            left-2
            flex
            gap-2
            mt-2
          `}
        >
          {roles.map((role) => (
            <div key={role} className={`tag-label`}>
              {musicianRoleFm(role)}
            </div>
          ))}
        </div>
      )}

      {/* stats */}
      {hasStats && (
        <div
          className={`
            absolute
            bottom-2
            flex
            px-4
            w-full
            items-center
            justify-between
        `}
        >
          {/* followers */}
          <div
            className={`
              flex
              gap-1
              text-sm
              font-ubuntu
              text-neutral-300
              items-center
            `}
          >
            <p>{followers.length}</p>
            <Icon name={TiUserOutline} opts={{ size: 18 }} />
          </div>

          {/* songs */}
          <div
            className={`
              flex
              gap-1
              text-sm
              font-ubuntu
              text-neutral-300
              items-center
            `}
          >
            <p>{songs.length}</p>
            <Icon name={PiMusicNoteSimpleFill} opts={{ size: 16 }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMusicianCardImage;
