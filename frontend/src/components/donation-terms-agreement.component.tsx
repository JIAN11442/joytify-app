import CheckboxLabel from "./checkbox-label.component";
import { getDataContributionAgreement } from "../contents/data-contribution-agreement.content";
import { ScopedFormatMessage } from "../hooks/intl.hook";

type DonationTermsAgreementProps = {
  fm: ScopedFormatMessage;
  isPending: boolean;
  dataUsageConsent: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const DonationTermsAgreement: React.FC<DonationTermsAgreementProps> = ({
  fm,
  isPending,
  dataUsageConsent,
  onChange,
}) => {
  const dataContributionAgreement = getDataContributionAgreement(fm);

  return (
    <CheckboxLabel
      disabled={isPending}
      onChange={(e) => onChange?.(e)}
      tw={{ label: `p-3 mb-4 gap-3`, input: `accent-green-500` }}
    >
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
    </CheckboxLabel>
  );
};

export default DonationTermsAgreement;
