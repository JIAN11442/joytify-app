import SongsList from "./songs-list.component";
import { generateResPlaylist } from "../constants/data-type.constant";

type PlaylistBodyContentProps = {
  playlist: generateResPlaylist;
};

const PlaylistBodyContent: React.FC<PlaylistBodyContentProps> = ({
  playlist,
}) => {
  const { songs } = playlist;

  return (
    <div
      className={`
        mt-5
        overflow-x-hidden
      `}
    >
      <SongsList songs={songs} />
    </div>
  );
};

export default PlaylistBodyContent;
