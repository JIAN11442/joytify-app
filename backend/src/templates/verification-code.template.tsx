import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Section,
  Text,
} from "@react-email/components";
import {
  main,
  container,
  coverSection,
  upperSection,
  h1,
  mainText,
  verificationSection,
  codeText,
  validityText,
  cautionText,
  spanText,
  lowerSection,
  footerText,
  link,
  divider,
} from "./template-styles";

interface VerifyEmailProps {
  verificationCode: string;
}

// const baseUrl = import.meta.env.VERCEL_URL
//   ? `https://${import.meta.env.VERCEL_URL}`
//   : "";

const SendImage =
  "https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/send-email.png";
const JoytifyLogoRegistered =
  "https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/joytify-logo-registered.png";

export const JoytifyVerificationCodeEmail = (data: VerifyEmailProps) => {
  const { verificationCode } = data;

  return (
    <Html>
      <Head />
      <Body style={main}>
        {/* preview */}
        {/* <Preview>Joytify Email Verification</Preview> */}

        {/* container */}
        <Container style={container}>
          <Section style={coverSection}>
            {/* logo */}
            <table
              role="presentation"
              align="center"
              width="100%"
              style={{ marginTop: "10px", marginBottom: "20px" }}
            >
              <tr>
                <td align="center">
                  <Img src={JoytifyLogoRegistered} width="150" />
                </td>
              </tr>
            </table>

            {/* image */}
            <table role="presentation" align="center" width="100%">
              <tr>
                <td align="center">
                  <Img src={SendImage} height="200" />
                </td>
              </tr>
            </table>

            {/* content */}
            <Section style={upperSection}>
              <Heading style={h1}>Verify your email address</Heading>

              <Text style={mainText}>
                Thanks for starting the new <span style={spanText}>Joytify</span> account creation
                process. We want to make sure it's really you. Please verify your account with the
                code below. If you don&apos;t want to create the account, you can ignore this
                message.
              </Text>

              <Section style={verificationSection}>
                <Text style={codeText}>{verificationCode}</Text>
                <Text style={validityText}>(This code is valid for 10 minutes)</Text>
              </Section>
            </Section>

            {/* hr */}
            <Hr />

            {/* caution */}
            <Section style={lowerSection}>
              <Text style={cautionText}>
                <span style={spanText}>Joytify</span> will never ask you to reveal or verify your
                credit card or bank account details via email.
              </Text>
            </Section>
          </Section>
        </Container>

        {/* footer */}
        <Section>
          <Text style={footerText}>
            <span style={divider}>
              <Link href="#" target="_blank" style={link}>
                Terms of Service
              </Link>
            </span>
            <span style={divider}>
              <Link href="#" target="_blank" style={link}>
                Privacy Policy
              </Link>
            </span>
            <span style={divider}>
              <Link href="#" target="_blank" style={link}>
                About Joytify
              </Link>
            </span>
            <span style={{ padding: "0 0 0 8px" }}>
              <Link href="#" target="_blank" style={link}>
                Support
              </Link>
            </span>
          </Text>
          <Text style={footerText}>© Copyright 2025 Joytify Corporation</Text>
        </Section>
      </Body>
    </Html>
  );
};
