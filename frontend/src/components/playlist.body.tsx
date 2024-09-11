import { twMerge } from "tailwind-merge";

import PlaylistBodyHeader from "./playlist-body-header.component";
import { resPlaylist } from "../constants/data-type.constant";
import PlaylistBodyContent from "./playlist-body-content.component";

type PlaylistBodyProps = {
  playlist: resPlaylist;
  className?: string;
};

const PlaylistBody: React.FC<PlaylistBodyProps> = ({ playlist, className }) => {
  return (
    <div
      className={twMerge(
        `
          flex
          flex-col
          mt-10
          w-full
          h-full
          p-6
          bg-gradient-to-b
          from-neutral-900/20
          to-neutral-900  
          overflow-y-auto
        `,
        className
      )}
    >
      <PlaylistBodyHeader playlist={playlist} />
      <PlaylistBodyContent playlist={playlist} />
    </div>
  );
};

export default PlaylistBody;
