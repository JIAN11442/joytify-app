import { FormattedMessage, IntlShape } from "react-intl";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { GrServices } from "react-icons/gr";
import { IoTrash } from "react-icons/io5";
import { TiWarning } from "react-icons/ti";
import { MdMarkEmailRead } from "react-icons/md";
import { IconName } from "../components/react-icons.component";

type AccountDeregistrationPolicyContent = {
  id: string;
  icon: { name: IconName; color: string; size: number };
  title: string;
  contents: React.ReactNode[];
};

export const getAccountDeregistrationPolicyContents = (
  intl: IntlShape
): AccountDeregistrationPolicyContent[] => {
  const contents = [
    {
      id: "effect-of-deletion",
      icon: { name: IoTrash, color: "text-red-500", size: 30 },
      title: intl.formatMessage({ id: "deregistration.policy.effectOfDeletion.title" }),
      contents: [
        <FormattedMessage id="deregistration.policy.effectOfDeletion.description.1" />,
        <FormattedMessage id="deregistration.policy.effectOfDeletion.description.2" />,
        <>
          <FormattedMessage id="deregistration.policy.effectOfDeletion.description.3.1" />
          <a href="#treatment-of-shared-content" className={`text-blue-600 underline`}>
            <FormattedMessage id="deregistration.policy.effectOfDeletion.description.3.2" />
          </a>
          <FormattedMessage id="deregistration.policy.effectOfDeletion.description.3.3" />
        </>,
        <FormattedMessage id="deregistration.policy.effectOfDeletion.description.4" />,
      ],
    },
    {
      id: "treatment-of-shared-content",
      icon: { name: AiFillSafetyCertificate, color: "text-sky-500", size: 30 },
      title: intl.formatMessage({ id: "deregistration.policy.treatmentOfSharedContent.title" }),
      contents: [
        <FormattedMessage id="deregistration.policy.treatmentOfSharedContent.description.1" />,
        <FormattedMessage id="deregistration.policy.treatmentOfSharedContent.description.2" />,
        <FormattedMessage id="deregistration.policy.treatmentOfSharedContent.description.3" />,
      ],
    },
    {
      id: "impact-on-linked-services",
      icon: { name: GrServices, color: "text-indigo-500", size: 30 },
      title: intl.formatMessage({ id: "deregistration.policy.impactOnLinkedServices.title" }),
      contents: [
        <FormattedMessage id="deregistration.policy.impactOnLinkedServices.description.1" />,
        <FormattedMessage id="deregistration.policy.impactOnLinkedServices.description.2" />,
      ],
    },
    {
      id: "data-deletion-timeline",
      icon: { name: MdMarkEmailRead, color: "text-green-500", size: 30 },
      title: intl.formatMessage({ id: "deregistration.policy.dataDeletionTimeline.title" }),
      contents: [
        <FormattedMessage id="deregistration.policy.dataDeletionTimeline.description.1" />,
        <FormattedMessage id="deregistration.policy.dataDeletionTimeline.description.2" />,
        <FormattedMessage id="deregistration.policy.dataDeletionTimeline.description.3" />,
        <FormattedMessage id="deregistration.policy.dataDeletionTimeline.description.4" />,
      ],
    },
    {
      id: "confirmation-and-appeal",
      icon: { name: TiWarning, color: "text-orange-400", size: 30 },
      title: intl.formatMessage({ id: "deregistration.policy.confirmationAndAppeal.title" }),
      contents: [
        <FormattedMessage id="deregistration.policy.confirmationAndAppeal.description.1" />,
        <>
          <FormattedMessage id="deregistration.policy.confirmationAndAppeal.description.2.1" />
          <a
            href={`https://mail.google.com/mail/?view=cm&to=${import.meta.env.VITE_SENDER_EMAIL}`}
            target="_blank"
            className={`text-blue-600 underline`}
          >
            <FormattedMessage id="deregistration.policy.confirmationAndAppeal.description.2.2" />
          </a>
          <FormattedMessage id="deregistration.policy.confirmationAndAppeal.description.2.3" />
        </>,
      ],
    },
  ];

  return contents;
};
