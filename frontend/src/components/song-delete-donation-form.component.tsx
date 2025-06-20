import { useCallback, useMemo, useState } from "react";
import DonationTermsAgreement from "./donation-terms-agreement.component";
import { TermsChecked } from "./account-deregistration-agreement.component";
import AccountDeregistrationAgreement from "./account-deregistration-agreement.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { useDeleteSongMutation } from "../hooks/song-mutate.hook";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import { timeoutForDelay } from "../lib/timeout.lib";
import Loader from "./loader.component";

type SongDeleteDonationFormProps = {
  fm: ScopedFormatMessage;
  song: RefactorSongResponse;
  closeModalFn: () => void;
  backToInitialPageFn: () => void;
};

const SongDeleteDonationForm: React.FC<SongDeleteDonationFormProps> = ({
  fm,
  song,
  closeModalFn,
  backToInitialPageFn,
}) => {
  const donationFormFm = fm("song.delete.modal.donation");

  const [dataUsageConsent, setDataUsageConsent] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [allTermsChecked, setAllTermsChecked] = useState(false);

  const { mutate: deleteSongFn, isPending } = useDeleteSongMutation(closeModalFn);

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

  const handleDeleteSong = useCallback(() => {
    timeoutForDelay(() => {
      if (!showAgreement) {
        setShowAgreement(true);
      } else if (showAgreement && allTermsChecked) {
        deleteSongFn({
          songId: song._id,
          shouldDeleteSongs: !dataUsageConsent,
        });
      }
    });
  }, [song, showAgreement, dataUsageConsent, allTermsChecked]);

  const deleteBtnDisabled = useMemo(() => {
    return isPending || (showAgreement && !allTermsChecked);
  }, [isPending, showAgreement, allTermsChecked]);

  return (
    <form>
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
      <div className={`flex flex-col mt-8 gap-3`}>
        <button
          type="button"
          disabled={deleteBtnDisabled}
          onClick={handleDeleteSong}
          className={`
            submit-btn
            py-2.5
            bg-red-500
            rounded-md
            border-none
          `}
        >
          {isPending ? <Loader loader={{ size: 20 }} /> : donationFormFm("delete")}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={backToInitialPageFn}
          className={`
            submit-btn
            py-2.5
            bg-neutral-500/50
            rounded-md
            border-none
          `}
        >
          {donationFormFm("back")}
        </button>
      </div>
    </form>
  );
};

export default SongDeleteDonationForm;
