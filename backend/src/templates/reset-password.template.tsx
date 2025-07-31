import React from "react";

import {
  Body,
  Button,
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
  validityText,
  cautionText,
  spanText,
  lowerSection,
  footerText,
  link,
  divider,
  button,
} from "./template-styles";

interface ResetPasswordProps {
  url: string;
  username: string;
}

// const baseUrl = import.meta.env.VERCEL_URL
//   ? `https://${import.meta.env.VERCEL_URL}`
//   : "";

const SendImage =
  "https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/reset-password-02.png";
const JoytifyLogoRegistered =
  "https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/joytify-logo-registered.png";

export const JoytifyResetPasswordLinkEmail = (data: ResetPasswordProps) => {
  const { url, username } = data;

  return (
    <Html>
      <Head />
      <Body style={main}>
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
              <Heading style={h1}>Hi, {username}</Heading>

              <Text style={mainText}>
                Trouble accessing your <span style={spanText}>Joytify</span> account? No problem,
                we're here to help. Select the button below to reset your password.
              </Text>

              <Button href={url} style={{ ...button, margin: "0 auto", marginBottom: "20px" }}>
                RESET PASSWORD
              </Button>

              <Section style={verificationSection}>
                <Text style={validityText}>(This link is valid for 10 minutes)</Text>
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
