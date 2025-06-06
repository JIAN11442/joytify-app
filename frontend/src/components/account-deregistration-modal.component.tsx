import { useMemo } from "react";

import Modal from "../components/modal.component";
import DeregisterDonationForm from "./deregister-donation-form.component";
import DeregisterConfirmationForm from "./deregister-confirmation-form.component";
import { useDeregisterMutation } from "../hooks/user-mutate.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { AccountDeregistrationStatus } from "@joytify/shared-types/constants";
import useSettingsState from "../states/settings.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const AccountDeregistrationModal = () => {
  const { fm } = useScopedIntl();
  const deregistrationModalFm = fm("settings.account.deregistration.modal");
  const { INITIAL_CONFIRMATION, DATA_DONATION } = AccountDeregistrationStatus;

  const { activeAccountDeregistrationModal, closeAccountDeregistrationModal } = useSettingsState();
  const { active, status } = activeAccountDeregistrationModal;

  const handleCloseModal = () => {
    timeoutForDelay(() => {
      closeAccountDeregistrationModal();
    });
  };

  const { mutate: deregisterAccountFn, isPending } = useDeregisterMutation(handleCloseModal);

  const title = useMemo(() => {
    switch (status) {
      case INITIAL_CONFIRMATION:
        return deregistrationModalFm("confirmation.title");
      case DATA_DONATION:
        return deregistrationModalFm("donation.title");
    }
  }, [status]);

  const description = useMemo(() => {
    switch (status) {
      case INITIAL_CONFIRMATION:
        return deregistrationModalFm("confirmation.description");
      case DATA_DONATION:
        return deregistrationModalFm("donation.description");
    }
  }, [status]);

  return (
    <Modal
      title={title}
      description={description}
      activeState={active}
      closeModalFn={status === INITIAL_CONFIRMATION && !isPending ? handleCloseModal : undefined}
      autoCloseModal={status === INITIAL_CONFIRMATION && !isPending}
      switchPage={{ initialPage: INITIAL_CONFIRMATION, currentPage: status }}
      className={`sm:min-w-[550px]`}
      tw={status === DATA_DONATION ? { title: "text-start", description: "text-start" } : {}}
    >
      {/* initial confirmation page */}
      {status === INITIAL_CONFIRMATION && (
        <DeregisterConfirmationForm deregisterFn={deregisterAccountFn} isPending={isPending} />
      )}

      {/* data donation page */}
      {status === DATA_DONATION && (
        <DeregisterDonationForm deregisterFn={deregisterAccountFn} isPending={isPending} />
      )}
    </Modal>
  );
};

export default AccountDeregistrationModal;
