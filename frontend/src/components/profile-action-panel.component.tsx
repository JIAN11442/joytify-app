import { AiFillEdit } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";

import Menu from "./menu.component";
import Icon from "./react-icons.component";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { ScopedFormatMessage } from "../hooks/intl.hook";

type ProfileActionPanelProps = {
  fm: ScopedFormatMessage;
  profileUser: RefactorProfileUserResponse;
};

const ProfileActionPanel: React.FC<ProfileActionPanelProps> = ({ fm, profileUser }) => {
  const profileActionPaneFm = fm("profile.action.panel");

  const { activeProfileOptionsMenu, setActiveProfileOptionsMenu, setActiveProfileEditModal } =
    useUserState();

  const handleActiveProfileOptionsMenu = () => {
    timeoutForDelay(() => {
      setActiveProfileOptionsMenu(!activeProfileOptionsMenu);
    });
  };

  const handleActiveEditProfileModal = () => {
    timeoutForDelay(() => {
      setActiveProfileEditModal({ active: true, profileUser });
    });
  };

  return (
    <div className={`relative`}>
      {/* options */}
      <button
        type="button"
        onClick={handleActiveProfileOptionsMenu}
        className={`
          text-grey-custom/50   
          hover:text-white
          outline-none
          transition 
        `}
      >
        <Icon name={BiDotsHorizontalRounded} opts={{ size: 30 }} />
      </button>

      {/* options menu */}
      <Menu
        activeState={{
          visible: activeProfileOptionsMenu,
          setVisible: setActiveProfileOptionsMenu,
        }}
        wrapper={{ transformOrigin: "top left" }}
        className={`absolute top-0 left-10 w-[210px]`}
      >
        {/* Edit details */}
        <button
          type="button"
          onClick={handleActiveEditProfileModal}
          className={`menu-btn normal-case`}
        >
          <Icon name={AiFillEdit} opts={{ size: 18 }} />
          <p>{profileActionPaneFm("editDetails")}</p>
        </button>
      </Menu>
    </div>
  );
};

export default ProfileActionPanel;
