import { useMemo, useState } from "react";
import Loader from "./loader.component";
import AccountDeregistrationAgreement, {
  TermsChecked,
} from "./account-deregistration-agreement.component";
import TermsAgreementLabel from "./terms-agreement-label.component";
import { getDataContributionAgreement } from "../contents/data-contribution-agreement.content";
import { AccountDeregistrationStatus } from "@joytify/shared-types/constants";
import { DeregisterUserAccountRequest } from "@joytify/shared-types/types";
import useSettingsState from "../states/settings.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { useScopedIntl } from "../hooks/intl.hook";

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

  const dataContributionAgreement = getDataContributionAgreement(fm);

  return (
    <div>
      {/* options label */}
      <TermsAgreementLabel disabled={isPending} onChange={handleDataUsageConsentChange}>
        <div className={`flex flex-col gap-3`}>
          {dataContributionAgreement.map((opt) => {
            const { label, description } = opt;
            return (
              <div key={`data-donate-option-${label}`}>
                <p
                  className={`
                    text-[14px]
                    font-medium 
                    ${
                      isPending
                        ? "no-hover text-white opacity-50"
                        : dataUsageConsent
                        ? "text-white"
                        : "text-neutral-400 group-hover:text-white"
                    }
                  `}
                >
                  {label}
                </p>
                <p
                  className={`
                    mt-1
                    text-sm 
                    ${
                      isPending
                        ? "no-hover text-neutral-600 opacity-50"
                        : dataUsageConsent
                        ? "text-neutral-500"
                        : "text-neutral-600 group-hover:text-neutral-500"
                    }
                  `}
                >
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </TermsAgreementLabel>

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
