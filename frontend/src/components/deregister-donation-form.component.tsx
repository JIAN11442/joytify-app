import { useMemo, useState } from "react";

import Loader from "./loader.component";
import DonationTermsAgreement from "./donation-terms-agreement.component";
import { TermsChecked } from "./account-deregistration-agreement.component";
import AccountDeregistrationAgreement from "./account-deregistration-agreement.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { AccountDeregistrationStatus } from "@joytify/shared-types/constants";
import { DeregisterUserAccountRequest } from "@joytify/shared-types/types";
import useSettingsState from "../states/settings.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type DeregisterDonationFormProps = {
  deregisterFn: (params: DeregisterUserAccountRequest) => void;
  isPending: boolean;
};

const DeregisterDonationForm: React.FC<DeregisterDonationFormProps> = ({
  deregisterFn,
  isPending,
}) => {
  const { fm } = useScopedIntl();
  const derergistrationModalFm = fm("settings.account.deregistration.modal");
  const { INITIAL_CONFIRMATION } = AccountDeregistrationStatus;

  const [showAgreement, setShowAgreement] = useState(false);
  const [allTermsChecked, setAllTermsChecked] = useState(false);
  const [dataUsageConsent, setDataUsageConsent] = useState<boolean>(false);
  const { navigateOnDeregistrationStatus } = useSettingsState();

  const handleDataUsageConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    timeoutForDelay(() => {
      setDataUsageConsent(e.target.checked);
    });
  };

  const handleTermsChange = (state: TermsChecked) => {
    timeoutForDelay(() => {
      setAllTermsChecked(state.understandTerms && state.agreeToTerms);
    });
  };

  const handleConfirmDeregisterAccount = () => {
    if (!showAgreement) {
      setShowAgreement(true);
    } else {
      deregisterFn({ shouldDeleteSongs: !dataUsageConsent });
    }
  };

  const handleCancelDeregisterAccount = () => {
    timeoutForDelay(() => {
      navigateOnDeregistrationStatus(INITIAL_CONFIRMATION);
    });
  };

  const confirmBtnDisabled = useMemo(() => {
    return isPending || (showAgreement && !allTermsChecked);
  }, [isPending, showAgreement, allTermsChecked]);

  const cancelBtnDisabled = useMemo(() => {
    return isPending;
  }, [isPending]);

  return (
    <div>
      {/* donation terms agreement */}
      <DonationTermsAgreement
        fm={fm}
        isPending={isPending}
        dataUsageConsent={dataUsageConsent}
        onChange={handleDataUsageConsentChange}
      />

      {/* divider */}
      <hr className={`divider`} />

      {/* terms of agreement */}
      {showAgreement && (
        <AccountDeregistrationAgreement isPending={isPending} onTermsChange={handleTermsChange} />
      )}

      {/* buttons */}
      <div
        className={`
          flex
          flex-col
          mt-8
          gap-3
          items-center
          text-center
          text-white
          text-[14px]
          font-semibold
        `}
      >
        {/* confirm */}
        <button
          type="button"
          disabled={confirmBtnDisabled}
          onClick={handleConfirmDeregisterAccount}
          className={`
            submit-btn
            py-2.5
            bg-red-500
            rounded-md
            border-none
          `}
        >
          {isPending ? (
            <Loader loader={{ size: 20 }} />
          ) : (
            derergistrationModalFm("button.permanentlyDelete")
          )}
        </button>

        {/* cancel */}
        <button
          onClick={handleCancelDeregisterAccount}
          disabled={cancelBtnDisabled}
          className={`
            submit-btn
            py-2.5
            bg-neutral-500/50
            rounded-md
            border-none
          `}
        >
          {derergistrationModalFm("button.backToPreviousPage")}
        </button>
      </div>
    </div>
  );
};

export default DeregisterDonationForm;
