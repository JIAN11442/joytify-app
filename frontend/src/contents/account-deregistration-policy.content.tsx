import { AiFillSafetyCertificate } from "react-icons/ai";
import { GrServices } from "react-icons/gr";
import { IoTrash } from "react-icons/io5";
import { MdMarkEmailRead } from "react-icons/md";
import { TiWarning } from "react-icons/ti";
import { IconName } from "../components/react-icons.component";

type AccountDeregistrationPolicyContent = {
  id: string;
  icon: { name: IconName; color: string; size: number };
  title: string;
  contents: React.ReactNode[];
};

export const accountDeregistrationPolicyContents: AccountDeregistrationPolicyContent[] = [
  {
    id: "effect-of-deletion",
    icon: { name: IoTrash, color: "text-red-500", size: 30 },
    title: "Effect of Deletion",
    contents: [
      <>
        Personal information and credentials (including email, username, and linked devices) will be
        permanently erased.
      </>,
      <>
        Platform records (including songs, playlists, albums, labels, and playback history) will be
        completely deleted.
      </>,
      <>
        Uploaded content will be handled according to the{" "}
        <a href="#treatment-of-shared-content" className={`text-blue-600 underline`}>
          Treatment of Shared Content
        </a>{" "}
        policy described below.
      </>,
      <>After deletion, you will no longer be able to log in or recover any data.</>,
    ],
  },
  {
    id: "treatment-of-shared-content",
    icon: { name: AiFillSafetyCertificate, color: "text-sky-500", size: 30 },
    title: "Treatment of Shared Content",
    contents: [
      <>
        Content you have previously shared publicly (such as uploaded music) may be retained to
        ensure continuous access for other users and platform analytics.
      </>,
      <>
        All retained content will be anonymized and will no longer be linked to your deleted
        account.
      </>,
      <>Unpublished or draft content will be permanently deleted along with the account.</>,
    ],
  },
  {
    id: "impact-on-linked-services",
    icon: { name: GrServices, color: "text-indigo-500", size: 30 },
    title: "Impact on Linked Services",
    contents: [
      <>
        Third-party connections (e.g., Google Sign-In, Github Login) will be automatically
        disconnected.
      </>,
      <>
        Any active subscriptions will be terminated. (Currently, no paid subscription services are
        provided.)
      </>,
    ],
  },
  {
    id: "data-deletion-timeline",
    icon: { name: MdMarkEmailRead, color: "text-green-500", size: 30 },
    title: "Data Deletion Timeline",
    contents: [
      <>Account deactivation: Immediately after confirmation.</>,
      <>Public content removal (if applicable): Within 5 minutes.</>,
      <>Database hard deletion: Within 30 days.</>,
      <>Backup system erasure: By the next maintenance cycle (up to 60 days).</>,
    ],
  },
  {
    id: "confirmation-and-appeal",
    icon: { name: TiWarning, color: "text-orange-400", size: 30 },
    title: "Confirmation and Appeal",
    contents: [
      <>
        After the process is complete, a termination confirmation will be sent to your registered
        email.
      </>,
      <>
        If you have any objections to the deletion process, you may file an appeal within 30 days
        via email at{" "}
        <a
          href={`https://mail.google.com/mail/?view=cm&to=${import.meta.env.VITE_SENDER_EMAIL}`}
          target="_blank"
          className={`text-blue-600 underline`}
        >
          joytify35@gmail.com
        </a>
        .
      </>,
    ],
  },
];
