import { useState } from "react";
import QueuePlayButton from "./queue-play-button.component";
import SongTableListArrangementMenu from "./song-table-list-arrangement-menu.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorAlbumResponse } from "@joytify/types/types";

type AlbumActionPanelProps = {
  fm: ScopedFormatMessage;
  album: RefactorAlbumResponse;
};

const AlbumActionPanel: React.FC<AlbumActionPanelProps> = ({ fm, album }) => {
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
      <SongTableListArrangementMenu
        fm={fm}
        menuActiveState={{ visible: activeArrangementMenu, setVisible: setActiveArrangementMenu }}
      />
    </div>
  );
};

export default AlbumActionPanel;
