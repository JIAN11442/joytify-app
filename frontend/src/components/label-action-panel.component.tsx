import { useState } from "react";
import QueuePlayButton from "./queue-play-button.component";
import SongTableListArrangementMenu from "./song-table-list-arrangement-menu.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorSearchLabelResponse } from "@joytify/shared-types/types";

type LabelActionPanelProps = {
  fm: ScopedFormatMessage;
  label: RefactorSearchLabelResponse;
};

const LabelActionPanel: React.FC<LabelActionPanelProps> = ({ fm, label }) => {
  const { songs } = label;
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

export default LabelActionPanel;
