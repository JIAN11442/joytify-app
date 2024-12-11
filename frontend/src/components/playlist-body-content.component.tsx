import SongsList from "./songs-list.component";
import { refactorResPlaylist } from "../constants/axios-response.constant";

type PlaylistBodyContentProps = {
  playlist: refactorResPlaylist;
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
