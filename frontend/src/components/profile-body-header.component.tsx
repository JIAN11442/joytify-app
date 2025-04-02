import { AiFillEdit } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";

import Menu from "./menu.component";
import Icon from "./react-icons.component";

import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ProfileBodyHeaderProps = {
  profileUser: RefactorProfileUserResponse;
};

const ProfileBodyHeader: React.FC<ProfileBodyHeaderProps> = ({ profileUser }) => {
  const { activeProfileOptionsMenu, setActiveProfileOptionsMenu, setActiveProfileEditModal } =
    useUserState();

  // handle active profile options menu
  const handleActiveProfileOptionsMenu = () => {
    timeoutForDelay(() => {
      setActiveProfileOptionsMenu(!activeProfileOptionsMenu);
    });
  };

  // handle active edit profile modal
  const handleActiveEditProfileModal = () => {
    timeoutForDelay(() => {
      setActiveProfileEditModal({ active: true, profileUser });
    });
  };

  return (
    <div>
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
        className={`w-[210px]`}
      >
        {/* Edit details */}
        <button
          type="button"
          onClick={handleActiveEditProfileModal}
          className={`menu-btn normal-case`}
        >
          <Icon name={AiFillEdit} opts={{ size: 18 }} />
          <p>Edit details</p>
        </button>
      </Menu>
    </div>
  );
};

export default ProfileBodyHeader;
