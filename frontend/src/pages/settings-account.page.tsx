import { RiUserSettingsLine } from "react-icons/ri";
import Loader from "../components/loader.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import PageSectionTitle from "../components/page-section-title.component";
import AccountDetailsForm from "../components/account-details-form.component";
import AccountInfoSection from "../components/account-info-section.component";
import { useScopedIntl } from "../hooks/intl.hook";
import useUserState from "../states/user.state";
import useSettingsState from "../states/settings.state";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const SettingsAccountPage = () => {
  const { fm } = useScopedIntl();
  const settingsAccountFm = fm("settings.account");

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

  const { authForThirdParty: isThirdPartyUser } = profileUser;

  return (
    <div
      className={`
        page-container
        h-fit
        ${isCollapsed && "md:w-[95%] lg:w-[85%]"}
      `}
    >
      {/* title */}
      <AnimationWrapper initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <PageSectionTitle
          icon={{ name: RiUserSettingsLine }}
          title={settingsAccountFm("title")}
          description={settingsAccountFm("description")}
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
          <AccountInfoSection profileUser={profileUser} />

          {/* divider */}
          <hr className={`mt-4 border-neutral-900/80`} />

          {/* advanced info settings */}
          <AccountDetailsForm profileUser={profileUser} />
        </div>

        {/* change password */}
        {!isThirdPartyUser && (
          <div className={`flex flex-col gap-5`}>
            <div className={`flex flex-col gap-2`}>
              <p className={`text-xl font-bold`}>{settingsAccountFm("changePassword.title")}</p>
              <p className={`text-sm text-neutral-500`}>
                {settingsAccountFm("changePassword.description")}
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
              {settingsAccountFm("changePassword.button")}
            </button>
          </div>
        )}

        {/* deregister account */}
        <div className={`flex flex-col gap-5`}>
          <div className={`flex flex-col gap-2`}>
            <p className={`text-xl font-bold`}>{settingsAccountFm("deregisterAccount.title")}</p>
            <p className={`text-sm text-neutral-500`}>
              {settingsAccountFm("deregisterAccount.description")}
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
            {settingsAccountFm("deregisterAccount.button")}
          </button>
        </div>
      </AnimationWrapper>
    </div>
  );
};

export default SettingsAccountPage;
