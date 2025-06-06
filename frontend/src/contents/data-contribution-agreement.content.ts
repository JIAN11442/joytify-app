import { ScopedFormatMessage } from "../hooks/intl.hook";

type DataContributionAgreement = {
  label: string;
  description: string;
};

export const getDataContributionAgreement = (
  fm: ScopedFormatMessage
): DataContributionAgreement[] => {
  const deregistrationDonationFm = fm("settings.account.deregistration.modal.donation");

  const content = [
    {
      label: deregistrationDonationFm("contributeToPublicLibrary.title"),
      description: deregistrationDonationFm("contributeToPublicLibrary.description"),
    },
    {
      label: deregistrationDonationFm("improveOurServices.title"),
      description: deregistrationDonationFm("improveOurServices.description"),
    },
  ];

  return content;
};
