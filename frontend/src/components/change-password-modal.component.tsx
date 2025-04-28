import { useMemo } from "react";
import Modal from "./modal.component";
import UpdatePasswordForm from "./update-password-form.component";
import PasswordUpdateStatusForm from "./password-update-status-form.component";
import { useChangePasswordMutation } from "../hooks/user-mutate.hook";
import { PasswordUpdateStatus } from "@joytify/shared-types/constants";
import useSettingsState from "../states/settings.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const ChangePasswordModal = () => {
  const { INITIAL, SUCCESS, FAILURE } = PasswordUpdateStatus;

  const {
    activeChangePasswordModal,
    passwordChangeStatus,
    setActiveChangePasswordModal,
    setPasswordChangeStatus,
  } = useSettingsState();

  const { mutate: changePasswordFn, isPending } = useChangePasswordMutation();

  const handleCloseModal = () => {
    timeoutForDelay(() => {
      setActiveChangePasswordModal(false);
      setPasswordChangeStatus(INITIAL);
    });
  };

  const title = useMemo(() => {
    switch (passwordChangeStatus) {
      case INITIAL:
        return "Change password";
      case SUCCESS:
        return "Password changed";
      case FAILURE:
        return "Password change failed";
      default:
        return "Change password";
    }
  }, [passwordChangeStatus]);

  const description = useMemo(() => {
    switch (passwordChangeStatus) {
      case INITIAL:
        return "Enter your current password and your new password.";
    }
  }, [passwordChangeStatus]);

  return (
    <Modal
      title={title}
      description={description}
      activeState={activeChangePasswordModal}
      closeModalFn={!isPending ? handleCloseModal : undefined}
    >
      <div
        className={`
          flex
          flex-col
          items-center
          justify-start
      `}
      >
        {passwordChangeStatus === INITIAL ? (
          <UpdatePasswordForm
            updatePasswordFn={(params) => changePasswordFn(params)}
            isPending={isPending}
            disabled={isPending}
            className={`w-full`}
          />
        ) : (
          <PasswordUpdateStatusForm
            isSuccess={passwordChangeStatus === SUCCESS}
            setPasswordUpdateStatus={setPasswordChangeStatus}
            logoutAllDevices={true}
            closeModalFn={handleCloseModal}
            className="mt-2"
          />
        )}
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
