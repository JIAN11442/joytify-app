import { twMerge } from "tailwind-merge";
import ProfileBodyHeader from "./profile-body-header.component";
import ProfileBodyContent from "./profile-body-content.component";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";

type ProfileBodyProps = {
  profileUser: RefactorProfileUserResponse;
  className?: string;
};

const ProfileBody: React.FC<ProfileBodyProps> = ({ profileUser, className }) => {
  return (
    <div
      className={twMerge(
        `
          flex
          flex-col
          mt-10
          w-full
          h-full
          p-6
          bg-gradient-to-b
          from-neutral-900/20
          to-neutral-900  
        `,
        className
      )}
    >
      <ProfileBodyHeader profileUser={profileUser} />
      <ProfileBodyContent profileUser={profileUser} />
    </div>
  );
};

export default ProfileBody;
