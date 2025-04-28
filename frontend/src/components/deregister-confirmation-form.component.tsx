import { useMemo, useState } from "react";
import Loader from "./loader.component";
import WarningMsgBox from "./warning-message-box.component";
import AnimationWrapper from "./animation-wrapper.component";
import AccountDeregistrationAgreement, {
  TermsChecked,
} from "./account-deregistration-agreement.component";

import { AccountDeregistrationStatus } from "@joytify/shared-types/constants";
import { DeregisterUserAccountRequest } from "@joytify/shared-types/types";
import useSettingsState from "../states/settings.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type DeregisterConfirmationFormProps = {
  deregisterFn: (params: DeregisterUserAccountRequest) => void;
  isPending: boolean;
};

const DeregisterConfirmationForm: React.FC<DeregisterConfirmationFormProps> = ({
  deregisterFn,
  isPending,
}) => {
  const { DATA_DONATION } = AccountDeregistrationStatus;

  const [showAgreement, setShowAgreement] = useState<boolean>(false);
  const [allTermsChecked, setAllTermsChecked] = useState<boolean>(false);

  const {
    activeAccountDeregistrationModal,
    closeAccountDeregistrationModal,
    navigateOnDeregistrationStatus,
  } = useSettingsState();
  const { profileUser } = activeAccountDeregistrationModal;
  const { songs } = profileUser ?? {};
  const hasUserUploadedSongs = !!(songs?.totalDocs && songs?.totalDocs > 0);

  const handleCancelDeregisterAccount = () => {
    timeoutForDelay(() => {
      closeAccountDeregistrationModal();
    });
  };

  const handleConfirmDeregisterAccount = () => {
    timeoutForDelay(() => {
      if (!hasUserUploadedSongs && !showAgreement) {
        setShowAgreement(true);
      } else {
        if (hasUserUploadedSongs) {
          navigateOnDeregistrationStatus(DATA_DONATION);
        } else {
          deregisterFn({ shouldDeleteSongs: false });
        }
      }
    });
  };

  const handleTermsChange = (state: TermsChecked) => {
    timeoutForDelay(() => {
      setAllTermsChecked(state.understandTerms && state.agreeToTerms);
    });
  };

  const confirmBtnDisabled = useMemo(() => {
    return isPending || (showAgreement && !allTermsChecked);
  }, [isPending, showAgreement, allTermsChecked]);

  const cancelBtnDisabled = useMemo(() => {
    return isPending;
  }, [isPending]);

  const warningMsg =
    "This action will permanently delete your account and all associated data. All content, including personal information and transaction history, will be erased immediately.";

  return (
    <div className={`flex flex-col gap-8`}>
      {/* contents */}
      <div className={`flex flex-col gap-2`}>
        {/* warning box */}
        {showAgreement ? (
          <hr className={`divider my-2`} />
        ) : (
          <AnimationWrapper>
            <WarningMsgBox
              warningMsg={warningMsg}
              transition={{ duration: 0 }}
              tw={{
                wrapper: "mt-0",
                msg: "text-[14px] leading-6",
                clsIcon: "hidden",
              }}
            />
          </AnimationWrapper>
        )}

        {/* content */}
        <p className={`text-red-500 font-bold`}>
          Are you sure you want to permanently delete your account?
        </p>
      </div>

      {/* terms of agreement */}
      {showAgreement && <AccountDeregistrationAgreement onTermsChange={handleTermsChange} />}

      {/* buttons */}
      <div
        className={`
          flex
          flex-col
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
          ) : hasUserUploadedSongs ? (
            "Next"
          ) : (
            "Permanently Delete My Account"
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
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeregisterConfirmationForm;
