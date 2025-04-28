import Loader from "../components/loader.component";
import AccountProfileCard from "../components/account-profile-card.component";
import AccountDetailsForm from "../components/account-details-form.component";
import useSidebarState from "../states/sidebar.state";
import useSettingsState from "../states/settings.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import useUserState from "../states/user.state";

const SettingsAccountPage = () => {
  const { profileUser } = useUserState();
  const { collapseSideBarState } = useSidebarState();
  const { openAccountDerergistrationModal, setActiveChangePasswordModal } = useSettingsState();

  const { isCollapsed } = collapseSideBarState;

  if (!profileUser) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const handleActiveChangePasswordModal = () => {
    timeoutForDelay(() => {
      setActiveChangePasswordModal(true);
    });
  };

  const handleActiveAccountDeregistrationModal = () => {
    timeoutForDelay(() => {
      openAccountDerergistrationModal(profileUser);
    });
  };

  const { auth_for_third_party: isThirdPartyUser } = profileUser;

  return (
    <div
      className={`
        flex
        flex-col
        min-w-[400px]
        ${isCollapsed && "md:w-[95%] lg:w-[85%]"}
        h-fit
        my-8
        px-8
        gap-4
      `}
    >
      {/* title */}
      <h1 className={`mb-5 text-3xl font-bold`}>Account</h1>

      <div
        className={`
          flex
          flex-col
          gap-10
        `}
      >
        {/* account settings */}
        <div
          className={`
            flex
            flex-col
            w-full
            p-5
            gap-y-4
            bg-black/50
            rounded-md
          `}
        >
          {/* account profile card */}
          <AccountProfileCard profileUser={profileUser} />

          {/* divider */}
          <hr className={`mt-4 border-neutral-900/80`} />

          {/* advanced info settings */}
          <AccountDetailsForm profileUser={profileUser} />
        </div>

        {/* change password */}
        {!isThirdPartyUser && (
          <div className={`flex flex-col gap-5`}>
            {/* title and description */}
            <div className={`flex flex-col gap-2`}>
              <p className={`text-xl font-bold`}>Password and Authentication</p>
              <p className={`text-sm text-neutral-500`}>
                Change your password to keep your account secure.
              </p>
            </div>

            {/* change password button */}
            <button
              onClick={handleActiveChangePasswordModal}
              className={`
                submit-btn
                w-fit
                p-3
                text-sm
                rounded-md
              `}
            >
              Change Password
            </button>
          </div>
        )}

        {/* deregister account */}
        <div className={`flex flex-col gap-5`}>
          {/* title and description */}
          <div className={`flex flex-col gap-2`}>
            <p className={`text-xl font-bold`}>Deregister Account</p>
            <p className={`text-sm text-neutral-500`}>
              Permanently delete your account from the platform.
            </p>
          </div>

          {/* deregister account button */}
          <button
            onClick={handleActiveAccountDeregistrationModal}
            className={`
              submit-btn
              w-fit
              p-3
              text-sm
              rounded-md
              bg-red-500
              border-red-500
            `}
          >
            Deregister Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsAccountPage;
