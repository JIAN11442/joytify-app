import { twMerge } from "tailwind-merge";
import { IconBaseProps } from "react-icons";
import Icon, { IconName } from "./react-icons.component";
import { getManagePlaylistsCardActionsContent } from "../contents/manage-playlists-card-actions.content";
import { PlaylistResponse } from "@joytify/shared-types/types";

type ManagePlaylistsCardActionsProps = {
  isGroupHovered: boolean;
  playlist: PlaylistResponse;
  icon?: { name?: IconName; opts?: IconBaseProps };
  className?: string;
  tw?: { button?: string; icon?: string };
};

const ManagePlaylistsCardActions: React.FC<ManagePlaylistsCardActionsProps> = ({
  isGroupHovered,
  playlist,
  icon,
  className,
  tw,
}) => {
  const playlistCardActions = getManagePlaylistsCardActionsContent({ playlist });

  return (
    <div
      className={twMerge(
        `
          flex
          gap-2
          items-center
        `,
        className
      )}
    >
      {playlistCardActions.map((action) => {
        const { id, color, hidden, onClick } = action;

        const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          onClick();
        };

        return (
          <button
            key={id}
            onClick={handleOnClick}
            style={{ color: isGroupHovered ? color : undefined }}
            className={twMerge(
              `
              flex
              text-neutral-500/50
              opacity-50
              hover:opacity-100
              items-center
              justify-center
              rounded-md
              duration-300
              transition-all
              ${hidden && "hidden"}
            `,
              tw?.button
            )}
          >
            <Icon
              name={icon?.name ?? action.icon.name}
              opts={{ size: action.icon?.size, ...icon?.opts }}
              className={tw?.icon}
            />
          </button>
        );
      })}
    </div>
  );
};

export default ManagePlaylistsCardActions;
