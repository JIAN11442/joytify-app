import { useState } from "react";
import QueuePlayButton from "./queue-play-button.component";
import { RefactorAlbumResponse } from "@joytify/shared-types/types";
import SongListArrangementMenu from "./song-list-arrangement-menu.component";

type AlbumActionPanelProps = {
  album: RefactorAlbumResponse;
};

const AlbumActionPanel: React.FC<AlbumActionPanelProps> = ({ album }) => {
  const { songs } = album;

  const [activeArrangementMenu, setActiveArrangementMenu] = useState(false);

  return (
    <div
      className={`
        flex
        items-center
        justify-between
    `}
    >
      {/* left side */}
      {songs && songs.length > 0 && <QueuePlayButton songs={songs} />}

      {/* right side */}
      <SongListArrangementMenu
        menuActiveState={{ visible: activeArrangementMenu, setVisible: setActiveArrangementMenu }}
      />
    </div>
  );
};

export default AlbumActionPanel;
