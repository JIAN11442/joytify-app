import { useMemo } from "react";
import { useIntl } from "react-intl";

import Modal from "./modal.component";
import UpdatePasswordForm from "./update-password-form.component";
import PasswordUpdateStatusForm from "./password-update-status-form.component";

import { useChangePasswordMutation } from "../hooks/user-mutate.hook";
import { PasswordUpdateStatus } from "@joytify/shared-types/constants";
import useSettingsState from "../states/settings.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const ChangePasswordModal = () => {
  const intl = useIntl();
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
        return intl.formatMessage({ id: "change.password.initial.title" });
      case SUCCESS:
        return intl.formatMessage({ id: "change.password.success.title" });
      case FAILURE:
        return intl.formatMessage({ id: "change.password.failure.title" });
      default:
        return intl.formatMessage({ id: "change.password.default.title" });
    }
  }, [passwordChangeStatus]);

  const description = useMemo(() => {
    switch (passwordChangeStatus) {
      case INITIAL:
        return intl.formatMessage({ id: "change.password.initial.description" });
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
