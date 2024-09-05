import SongsList from "./songs-list.component";
import { resPlaylist } from "../constants/data-type.constant";

type PlaylistBodyContentProps = {
  playlist: resPlaylist;
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
