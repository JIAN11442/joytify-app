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
  cautionText,
  spanText,
  lowerSection,
  footerText,
  link,
  divider,
} from "./template-styles";

import { S3_DEFAULT_IMAGES } from "@joytify/shared-types/constants";

interface ResetPasswordProps {
  username: string;
}

// const baseUrl = import.meta.env.VERCEL_URL
//   ? `https://${import.meta.env.VERCEL_URL}`
//   : "";

const registeredLogoSrc = S3_DEFAULT_IMAGES.REGISTERED_LOGO;

export const JoytifyPasswordChangedEmail = (data: ResetPasswordProps) => {
  const { username } = data;

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
                  <Img src={registeredLogoSrc} width="150" />
                </td>
              </tr>
            </table>

            {/* content */}
            <Section style={{ ...upperSection, textAlign: "start" }}>
              {/* title */}
              <Section style={{ ...h1, fontSize: "35px" }}>
                <Heading>Hi, {username}</Heading>
                <Heading>Your password has been successfully updated</Heading>
              </Section>

              {/* main content */}
              <Text style={mainText}>
                If you didn't request this change, we're here to help secure your account. Please
                visit our{" "}
                <Link href="https://joytify.com/support" style={link}>
                  support page
                </Link>{" "}
                for assistance.
              </Text>
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
