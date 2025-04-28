import { useEffect, useState } from "react";
import AnimationWrapper from "./animation-wrapper.component";
import TermsAgreementLabel from "./terms-agreement-label.component";
import { timeoutForDelay } from "../lib/timeout.lib";
import { twMerge } from "tailwind-merge";

export type TermsChecked = {
  understandTerms: boolean;
  agreeToTerms: boolean;
};

type AccountDeregistrationAgreementProps = {
  onTermsChange?: (state: TermsChecked) => void;
  className?: string;
  tw?: {
    title?: string;
    label?: string;
    input?: string;
    strong?: string;
    href?: string;
  };
};

const AccountDeregistrationAgreement = ({
  onTermsChange,
  className,
  tw,
}: AccountDeregistrationAgreementProps) => {
  const [termsChecked, setTermsChecked] = useState<TermsChecked>({
    understandTerms: false,
    agreeToTerms: false,
  });

  const handleCheckboxChange = (name: keyof typeof termsChecked) => {
    timeoutForDelay(() => {
      setTermsChecked((prev) => {
        const newState = {
          ...prev,
          [name]: !prev[name],
        };
        onTermsChange?.(newState);
        return newState;
      });
    });
  };

  // initialize terms checked state
  useEffect(() => {
    onTermsChange?.(termsChecked);
  }, []);

  return (
    <AnimationWrapper
      className={twMerge(
        `
        flex
        flex-col
        p-4
        gap-2
        bg-red-500/5
        border-l-2
        border-red-500
        rounded-md
        rounded-l-none
        leading-6
      `,
        className
      )}
    >
      <p
        className={twMerge(
          `
          text-[14px] 
          text-red-500
          font-bold
          `,
          tw?.title
        )}
      >
        * Terms of Agreement
      </p>

      {/* terms of agreement */}
      <TermsAgreementLabel
        checked={termsChecked.understandTerms}
        onChange={() => handleCheckboxChange("understandTerms")}
        tw={{
          label: twMerge(`mb-0 hover:bg-red-400/10`, tw?.label),
          input: twMerge(`accent-red-500`, tw?.input),
        }}
      >
        <span className={`text-sm text-neutral-300`}>
          <span>
            I understand that this operation will{" "}
            <strong className={twMerge(`text-red-400`, tw?.strong)}>
              permanently delete the account and all associated data
            </strong>
            , including:
          </span>

          <ul className={`list-disc mt-2 ml-10`}>
            <li>Personal information and credentials</li>
            <li>Playback history and statistics</li>
          </ul>
        </span>
      </TermsAgreementLabel>

      <TermsAgreementLabel
        checked={termsChecked.agreeToTerms}
        onChange={() => handleCheckboxChange("agreeToTerms")}
        tw={{
          label: twMerge(`mb-0 hover:bg-red-400/10`, tw?.label),
          input: twMerge(`accent-red-500`, tw?.input),
        }}
      >
        <span className={`text-sm text-neutral-300`}>
          I have read and agree to the{" "}
          <a
            href="/policies/account-deregistration"
            target="_blank"
            className={twMerge(
              `
                text-red-400 
                hover:text-red-300
                underline
                transition-all
              `,
              tw?.href
            )}
          >
            account deregistration policy
          </a>{" "}
          and conditions and confirm that all data will be{" "}
          <strong
            className={twMerge(
              `
                text-red-400
                font-medium
              `,
              tw?.strong
            )}
          >
            completely deleted
          </strong>
        </span>
      </TermsAgreementLabel>
    </AnimationWrapper>
  );
};

export default AccountDeregistrationAgreement;
