import { twMerge } from "tailwind-merge";

import PlaylistBodyHeader from "./playlist-body-header.component";
import PlaylistBodyContent from "./playlist-body-content.component";
import { refactorResPlaylist } from "../constants/axios-response.constant";

type PlaylistBodyProps = {
  playlist: refactorResPlaylist;
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
