import { useState } from "react";
import QueuePlayButton from "./queue-play-button.component";
import SongListArrangementMenu from "./song-list-arrangement-menu.component";
import { RefactorMusicianResponse } from "@joytify/shared-types/types";

type MusicianActionPanelProps = {
  musician: RefactorMusicianResponse;
};

const MusicianActionPanel: React.FC<MusicianActionPanelProps> = ({ musician }) => {
  const { songs } = musician;

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

export default MusicianActionPanel;
