import { useIntl } from "react-intl";
import { RiUserSettingsLine } from "react-icons/ri";
import Loader from "../components/loader.component";
import AccountProfileCard from "../components/account-profile-card.component";
import AccountDetailsForm from "../components/account-details-form.component";
import SettingSectionTitle from "../components/settings-section-title.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import useSettingsState from "../states/settings.state";
import useSidebarState from "../states/sidebar.state";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const SettingsAccountPage = () => {
  const intl = useIntl();
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
      <AnimationWrapper initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <SettingSectionTitle
          icon={{ name: RiUserSettingsLine }}
          title={intl.formatMessage({ id: "settings.account.title" })}
          description={intl.formatMessage({ id: "settings.account.description" })}
        />
      </AnimationWrapper>

      {/* account settings */}
      <AnimationWrapper
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col gap-10`}
      >
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
            <div className={`flex flex-col gap-2`}>
              <p className={`text-xl font-bold`}>
                {intl.formatMessage({ id: "settings.account.changePassword.title" })}
              </p>
              <p className={`text-sm text-neutral-500`}>
                {intl.formatMessage({ id: "settings.account.changePassword.description" })}
              </p>
            </div>

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
              {intl.formatMessage({ id: "settings.account.changePassword.button" })}
            </button>
          </div>
        )}

        {/* deregister account */}
        <div className={`flex flex-col gap-5`}>
          <div className={`flex flex-col gap-2`}>
            <p className={`text-xl font-bold`}>
              {intl.formatMessage({ id: "settings.account.deregisterAccount.title" })}
            </p>
            <p className={`text-sm text-neutral-500`}>
              {intl.formatMessage({ id: "settings.account.deregisterAccount.description" })}
            </p>
          </div>

          <button
            onClick={handleActiveAccountDeregistrationModal}
            className={`
              submit-btn
              w-fit
              p-3
              text-sm
              bg-red-500
              border-red-500
              rounded-md
            `}
          >
            {intl.formatMessage({ id: "settings.account.deregisterAccount.button" })}
          </button>
        </div>
      </AnimationWrapper>
    </div>
  );
};

export default SettingsAccountPage;
