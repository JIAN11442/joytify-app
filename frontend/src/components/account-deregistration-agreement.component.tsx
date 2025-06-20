import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import CheckboxLabel from "./checkbox-label.component";
import AnimationWrapper from "./animation-wrapper.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { timeoutForDelay } from "../lib/timeout.lib";

export type TermsChecked = {
  understandTerms: boolean;
  agreeToTerms: boolean;
};

type AccountDeregistrationAgreementProps = {
  isPending: boolean;
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
  isPending,
  onTermsChange,
  className,
  tw,
}: AccountDeregistrationAgreementProps) => {
  const { fm } = useScopedIntl();
  const prefix = "settings.account.deregistration.agreement";
  const deregistrationAgreementFm = fm(prefix);

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

  const termsAgreementLabelTw = {
    label: twMerge(
      `p-3 gap-3 mb-0 ${isPending ? "no-hover opacity-80" : "hover:bg-red-400/10"}`,
      tw?.label
    ),
    input: twMerge(`accent-red-500`, tw?.input),
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
      {/* title */}
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
        {deregistrationAgreementFm("title")}
      </p>

      {/* terms of agreement 1 */}
      <CheckboxLabel
        checked={termsChecked.understandTerms}
        disabled={isPending}
        onChange={() => handleCheckboxChange("understandTerms")}
        tw={termsAgreementLabelTw}
      >
        <span className="text-sm text-neutral-300">
          <FormattedMessage
            id={`${prefix}.1`}
            values={{
              strong: (chunks) => <strong className="text-red-400">{chunks}</strong>,
              ul: (chunks) => <ul className="list-disc mt-2 ml-10">{chunks}</ul>,
              li: (chunks) => <li>{chunks}</li>,
            }}
          />
        </span>
      </CheckboxLabel>

      {/* terms of agreement 2 */}
      <CheckboxLabel
        checked={termsChecked.agreeToTerms}
        disabled={isPending}
        onChange={() => handleCheckboxChange("agreeToTerms")}
        tw={termsAgreementLabelTw}
      >
        <span className={`text-sm text-neutral-300`}>
          <FormattedMessage
            id={`${prefix}.2`}
            values={{
              a: (chunks) => (
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
                  {chunks}
                </a>
              ),
              strong: (chunks) => <strong className="text-red-400 font-medium">{chunks}</strong>,
            }}
          />
        </span>
      </CheckboxLabel>
    </AnimationWrapper>
  );
};

export default AccountDeregistrationAgreement;
