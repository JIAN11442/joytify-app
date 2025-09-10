import { InputHTMLAttributes } from "react";
import { IconBaseProps, IconType } from "react-icons";
import Icon from "./react-icons.component";
import CheckboxLabel from "./checkbox-label.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { PlaylistResponse, PlaylistsResponse } from "@joytify/types/types";

interface PlaylistAssignmentListProps extends InputHTMLAttributes<HTMLInputElement> {
  fm: ScopedFormatMessage;
  title: string;
  playlists: PlaylistsResponse;
  icon: { name: IconType; opts?: IconBaseProps };
  selectFn: (playlist: PlaylistResponse) => void;
}

const PlaylistAssignmentList: React.FC<PlaylistAssignmentListProps> = ({
  fm,
  title,
  playlists,
  icon,
  selectFn,
  ...props
}) => {
  const playlistItemFm = fm("playlist.item");

  return (
    <div
      className={`
        flex
        flex-col
        gap-3
      `}
    >
      {/* title */}
      <div
        className={`
          flex
          gap-2
          items-center
        `}
      >
        <Icon name={icon.name} opts={icon.opts} className={`text-green-500`} />
        <p className={`text-sm text-neutral-500 font-bold`}>
          {title.toUpperCase()} ({playlists.length})
        </p>
      </div>

      {playlists.map((playlist) => {
        const { title, coverImage } = playlist;

        return (
          <CheckboxLabel
            key={`added-playlist-${playlist._id}`}
            onChange={(e) => {
              e.stopPropagation();
              selectFn(playlist);
            }}
            tw={{
              label: `
                p-3
                pl-5
                gap-5
                bg-neutral-700/20
                hover:bg-neutral-700/50
                items-center
                border-[0.1px]
                border-neutral-700
                rounded-xl
              `,
              input: `w-4 h-4 accent-green-500`,
            }}
            {...props}
          >
            <div className={`flex gap-3 items-center`}>
              <img src={coverImage} className={`w-16 h-16 object-cover rounded-md`} />
              <p className={`flex flex-col gap-1 text-sm`}>
                <span className={`text-neutral-300 font-semibold`}>{title}</span>
                <span className={`text-neutral-500`}>
                  {playlistItemFm("songs.count", { count: playlist.songs.length })}
                </span>
              </p>
            </div>
          </CheckboxLabel>
        );
      })}
    </div>
  );
};

export default PlaylistAssignmentList;
