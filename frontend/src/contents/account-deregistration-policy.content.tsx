import { FormattedMessage } from "react-intl";
import { IoTrash } from "react-icons/io5";
import { TiWarning } from "react-icons/ti";
import { GrServices } from "react-icons/gr";
import { MdMarkEmailRead } from "react-icons/md";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { IconName } from "../components/react-icons.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";

type AccountDeregistrationPolicyContent = {
  id: string;
  icon: { name: IconName; color: string; size: number };
  title: string;
  contents: React.ReactNode[];
};

export const getAccountDeregistrationPolicyContents = (
  fm: ScopedFormatMessage
): AccountDeregistrationPolicyContent[] => {
  const deregistrationPolicyFm = fm("deregistration.policy");
  const scopedId = (id: string) => `deregistration.policy.${id}`;

  const contents = [
    {
      id: "effect-of-deletion",
      icon: { name: IoTrash, color: "text-red-500", size: 30 },
      title: deregistrationPolicyFm("effectOfDeletion.title"),
      contents: [
        <FormattedMessage id={scopedId("effectOfDeletion.description.1")} />,
        <FormattedMessage id={scopedId("effectOfDeletion.description.2")} />,
        <FormattedMessage
          id={scopedId("effectOfDeletion.description.3")}
          values={{
            a: (chunks) => (
              <a href="#treatment-of-shared-content" className={`text-blue-600 underline`}>
                {chunks}
              </a>
            ),
          }}
        />,
        <FormattedMessage id={scopedId("effectOfDeletion.description.4")} />,
      ],
    },
    {
      id: "treatment-of-shared-content",
      icon: { name: AiFillSafetyCertificate, color: "text-sky-500", size: 30 },
      title: deregistrationPolicyFm("treatmentOfSharedContent.title"),
      contents: [
        <FormattedMessage id={scopedId("treatmentOfSharedContent.description.1")} />,
        <FormattedMessage id={scopedId("treatmentOfSharedContent.description.2")} />,
        <FormattedMessage id={scopedId("treatmentOfSharedContent.description.3")} />,
      ],
    },
    {
      id: "impact-on-linked-services",
      icon: { name: GrServices, color: "text-indigo-500", size: 30 },
      title: deregistrationPolicyFm("impactOnLinkedServices.title"),
      contents: [
        <FormattedMessage id={scopedId("impactOnLinkedServices.description.1")} />,
        <FormattedMessage id={scopedId("impactOnLinkedServices.description.2")} />,
      ],
    },
    {
      id: "data-deletion-timeline",
      icon: { name: MdMarkEmailRead, color: "text-green-500", size: 30 },
      title: deregistrationPolicyFm("dataDeletionTimeline.title"),
      contents: [
        <FormattedMessage id={scopedId("dataDeletionTimeline.description.1")} />,
        <FormattedMessage id={scopedId("dataDeletionTimeline.description.2")} />,
        <FormattedMessage id={scopedId("dataDeletionTimeline.description.3")} />,
        <FormattedMessage id={scopedId("dataDeletionTimeline.description.4")} />,
      ],
    },
    {
      id: "confirmation-and-appeal",
      icon: { name: TiWarning, color: "text-orange-400", size: 30 },
      title: deregistrationPolicyFm("confirmationAndAppeal.title"),
      contents: [
        <FormattedMessage id={scopedId("confirmationAndAppeal.description.1")} />,
        <FormattedMessage
          id={scopedId("confirmationAndAppeal.description.2")}
          values={{
            a: (chunks) => (
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${
                  import.meta.env.VITE_SENDER_EMAIL
                }`}
                target="_blank"
                className={`text-blue-600 underline`}
              >
                {chunks}
              </a>
            ),
            email: import.meta.env.VITE_SENDER_EMAIL,
          }}
        />,
      ],
    },
  ];

  return contents;
};
