import { generateResSong } from "../constants/data-type.constant";

type SongsGridProps = {
  songs: generateResSong[];
};

const SongsGrid: React.FC<SongsGridProps> = ({ songs }) => {
  return <div>{songs.map((song) => song.title)}</div>;
};

export default SongsGrid;
