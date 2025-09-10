import { useCallback, useMemo } from "react";

import Modal from "./modal.component";
import UpdatePasswordForm from "./update-password-form.component";
import PasswordUpdateStatusForm from "./password-update-status-form.component";
import { useChangePasswordMutation } from "../hooks/user-mutate.hook";
import { PasswordUpdateStatus } from "@joytify/types/constants";
import useSettingsState from "../states/settings.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { useScopedIntl } from "../hooks/intl.hook";

const ChangePasswordModal = () => {
  const { fm } = useScopedIntl();
  const changePasswordFm = fm("change.password");

  const { INITIAL, SUCCESS, FAILURE } = PasswordUpdateStatus;

  const {
    activeChangePasswordModal,
    passwordChangeStatus,
    setActiveChangePasswordModal,
    setPasswordChangeStatus,
  } = useSettingsState();

  const { mutate: changePasswordFn, isPending } = useChangePasswordMutation();

  const handleCloseModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveChangePasswordModal(false);
      setPasswordChangeStatus(INITIAL);
    });
  }, [setActiveChangePasswordModal, setPasswordChangeStatus, INITIAL]);

  const title = useMemo(() => {
    switch (passwordChangeStatus) {
      case INITIAL:
        return changePasswordFm("initial.title");
      case SUCCESS:
        return changePasswordFm("success.title");
      case FAILURE:
        return changePasswordFm("failure.title");
      default:
        return changePasswordFm("default.title");
    }
  }, [passwordChangeStatus]);

  const description = useMemo(() => {
    switch (passwordChangeStatus) {
      case INITIAL:
        return changePasswordFm("initial.description");
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
