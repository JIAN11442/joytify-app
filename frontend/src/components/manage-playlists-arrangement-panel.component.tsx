import { twMerge } from "tailwind-merge";
import Icon from "./react-icons.component";
import { ManagePlaylistsControlPanelField } from "../contents/manage-playlists-control-panel.content";
import { ManagePlaylistsArrangementType } from "../types/manage.type";
import { timeoutForDelay } from "../lib/timeout.lib";

type ArrangementPanelProps = {
  arrangementField: ManagePlaylistsControlPanelField;
  arrangement: ManagePlaylistsArrangementType;
  onArrangementChange?: (arrangement: ManagePlaylistsArrangementType) => void;
  className?: string;
};

const ManagePlaylistsArrangementPanel: React.FC<ArrangementPanelProps> = ({
  arrangementField,
  arrangement,
  onArrangementChange,
  className,
}) => {
  const handleToggleArrangement = (key: ManagePlaylistsArrangementType) => {
    timeoutForDelay(() => {
      onArrangementChange?.(key);
    });
  };

  return (
    <div className={twMerge(`control-panel-items-wrapper`, className)}>
      {arrangementField.items.map((item) => {
        const { id, key, title, icon } = item;
        const arrangementKey = key as ManagePlaylistsArrangementType;

        return (
          <button
            key={id}
            onClick={() => handleToggleArrangement(arrangementKey)}
            className={`
              control-panel-btn
              ${arrangement === arrangementKey ? `control-panel-selected` : "hover:bg-neutral-700"}
            `}
            title={title}
          >
            {icon && <Icon name={icon.name} opts={{ size: icon.size }} />}
          </button>
        );
      })}
    </div>
  );
};

export default ManagePlaylistsArrangementPanel;
