import resend from "../config/resend.config";
import { NODE_ENV, SENDER_EMAIL } from "../constants/env-validate.constant";

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export const getEmailFrom = () => {
  return NODE_ENV === "development" ? "onboarding@resend.dev" : SENDER_EMAIL;
};

// export const getEmailTo = (to: string) => {
//   return NODE_ENV === "development" ? "delivered@resend.dev" : to;
// };

const sendEmail = async ({ to, subject, text, html }: SendEmailParams) => {
  return await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject,
    text,
    html,
  });
};

export default sendEmail;
