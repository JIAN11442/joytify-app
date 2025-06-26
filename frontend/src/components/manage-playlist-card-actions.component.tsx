import Icon, { IconName } from "./react-icons.component";
import { getManagePlaylistCardActionsContent } from "../contents/manage-playlist-card-actions.content";
import { PlaylistResponse } from "@joytify/shared-types/types";
import { twMerge } from "tailwind-merge";
import { IconBaseProps } from "react-icons";

type ManagePlaylistCardActionsProps = {
  isGroupHovered: boolean;
  playlist: PlaylistResponse;
  icon?: { name?: IconName; opts?: IconBaseProps };
  className?: string;
  tw?: { button?: string; icon?: string };
};

const ManagePlaylistCardActions: React.FC<ManagePlaylistCardActionsProps> = ({
  isGroupHovered,
  playlist,
  icon,
  className,
  tw,
}) => {
  const playlistCardActions = getManagePlaylistCardActionsContent({ playlist });

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

        return (
          <button
            key={id}
            onClick={onClick}
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

export default ManagePlaylistCardActions;
