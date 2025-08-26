import UserModel from "../../../src/models/user.model";
import VerificationModel from "../../../src/models/verification.model";
import {
  sendEmail,
  verifyCode,
  verifyLink,
  sendCodeEmailToUser,
  sendLinkEmailToUser,
} from "../../../src/services/verification.service";
import { JoytifyVerificationCodeEmail } from "../../../src/templates/verification-code.template";
import { JoytifyResetPasswordLinkEmail } from "../../../src/templates/reset-password.template";
import { VerificationCodeActions } from "@joytify/shared-types/constants";
import {
  generateVerificationCode,
  generateVerificationLink,
} from "../../../src/utils/generate-code.util";
import { signToken, verifyToken, VerificationTokenSignOptions } from "../../../src/utils/jwt.util";
import { generateNanoId } from "../../../src/utils/generate-nanoid.util";
import { tenMinutesFromNow } from "../../../src/utils/date.util";
import { compareHashValue } from "../../../src/utils/bcrypt.util";
import appAssert from "../../../src/utils/app-assert.util";
import resend from "../../../src/config/resend.config";

// Mock all external dependencies
jest.mock("../../../src/models/user.model");
jest.mock("../../../src/models/verification.model");
jest.mock("../../../src/utils/jwt.util");
jest.mock("../../../src/utils/generate-code.util");
jest.mock("../../../src/utils/generate-nanoid.util");
jest.mock("../../../src/utils/date.util");
jest.mock("../../../src/utils/bcrypt.util");
jest.mock("../../../src/utils/app-assert.util");
jest.mock("../../../src/config/resend.config");
jest.mock("../../../src/templates/verification-code.template");
jest.mock("../../../src/templates/reset-password.template");
jest.mock("../../../src/constants/env-validate.constant");

// Mock template functions
jest.mock("../../../src/templates/verification-code.template", () => ({
  JoytifyVerificationCodeEmail: jest.fn().mockReturnValue("verification-template" as any),
}));

jest.mock("../../../src/templates/reset-password.template", () => ({
  JoytifyResetPasswordLinkEmail: jest.fn().mockReturnValue("reset-template" as any),
}));

// Mock type definitions
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockVerificationModel = VerificationModel as jest.Mocked<typeof VerificationModel>;
const mockSignToken = signToken as jest.MockedFunction<typeof signToken>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockGenerateVerificationCode = generateVerificationCode as jest.MockedFunction<
  typeof generateVerificationCode
>;
const mockGenerateVerificationLink = generateVerificationLink as jest.MockedFunction<
  typeof generateVerificationLink
>;
const mockGenerateNanoId = generateNanoId as jest.MockedFunction<typeof generateNanoId>;
const mockTenMinutesFromNow = tenMinutesFromNow as jest.MockedFunction<typeof tenMinutesFromNow>;
const mockCompareHashValue = compareHashValue as jest.MockedFunction<typeof compareHashValue>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;
const mockResend = resend as jest.Mocked<typeof resend>;
const mockJoytifyVerificationCodeEmail = JoytifyVerificationCodeEmail as jest.MockedFunction<
  typeof JoytifyVerificationCodeEmail
>;
const mockJoytifyResetPasswordLinkEmail = JoytifyResetPasswordLinkEmail as jest.MockedFunction<
  typeof JoytifyResetPasswordLinkEmail
>;

describe("Verification Service", () => {
  // Mock data constants
  const mockEmail = "test@example.com";
  const mockCode = "123456";
  const mockHashedSession = "hashed-session-123";
  const mockSessionToken = "session-token-123";
  const mockExpiresAt = new Date("2024-02-01T00:00:00.000Z");
  const mockDocId = "doc-id-123";

  const mockUser = {
    id: "user-123",
    email: mockEmail,
    authForThirdParty: false,
  };

  const mockVerificationDoc = {
    _id: mockDocId,
    email: mockEmail,
    session: mockHashedSession,
    verificationCode: "hashed-code",
    type: "email_verification",
    expiresAt: mockExpiresAt,
  };

  beforeEach(() => {
    // reset all mocks
    jest.clearAllMocks();

    // Setup default mock behavior
    mockGenerateVerificationCode.mockReturnValue(mockCode);
    mockGenerateNanoId.mockResolvedValue(mockHashedSession);
    mockTenMinutesFromNow.mockReturnValue(mockExpiresAt);
    mockSignToken.mockReturnValue(mockSessionToken);

    // Mock resend email service
    (mockResend.emails as any) = {
      send: jest.fn().mockResolvedValue({ data: { id: "email-id-123" }, error: null }),
    };

    // Mock appAssert to throw error when condition is false
    mockAppAssert.mockImplementation((condition, _statusCode, message) => {
      if (!condition) {
        throw new Error(message);
      }
    });
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup email parameters
      const emailParams = {
        to: mockEmail,
        subject: "Test Subject",
        content: "Test Content" as any,
      };

      // ==================== Act ====================
      // 1. execute sendEmail function
      await sendEmail(emailParams);

      // ==================== Assert Process ====================
      // 1. verify resend service called with correct parameters
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        to: mockEmail,
        subject: "Test Subject",
        from: expect.any(String),
        react: emailParams.content,
      });
    });

    it("should throw error when email sending fails", async () => {
      // ==================== Arrange ====================
      // 1. setup email service to fail
      (mockResend.emails.send as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Send failed" },
      });

      const emailParams = {
        to: mockEmail,
        subject: "Test Subject",
        content: "Test Content" as any,
      };

      // ==================== Act & Assert ====================
      // 1. expect function to throw error
      await expect(sendEmail(emailParams)).rejects.toThrow("Send failed");
    });
  });

  describe("sendCodeEmailToUser", () => {
    it("should throw error if email already exists in user collection", async () => {
      // ==================== Arrange ====================
      // 1. setup user exists scenario
      mockUserModel.findOne.mockResolvedValue(mockUser as any);
      mockVerificationModel.findOne.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for existing email
      await expect(
        sendCodeEmailToUser({ email: mockEmail, shouldResendCode: false })
      ).rejects.toThrow("Email is already in use");
    });

    it("should return existing verification when not resending and already exists", async () => {
      // ==================== Arrange ====================
      // 1. setup existing verification scenario
      mockUserModel.findOne.mockResolvedValue(null);
      mockVerificationModel.findOne.mockResolvedValue(mockVerificationDoc as any);
      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockHashedSession } } as any);

      // ==================== Act ====================
      // 1. request verification code without resending
      const result = await sendCodeEmailToUser({
        email: mockEmail,
        shouldResendCode: false,
        token: mockSessionToken,
      });

      // ==================== Assert Process ====================
      // 1. verify token validation was performed
      expect(mockVerifyToken).toHaveBeenCalledWith(mockSessionToken, {
        secret: VerificationTokenSignOptions.secret,
      });

      // 2. verify existing verification returned
      expect(result).toEqual({
        id: mockDocId,
        action: VerificationCodeActions.CODE_RETURNED,
        sessionToken: null,
      });
    });

    it("should create new verification code for new email", async () => {
      // ==================== Arrange ====================
      // 1. setup new email scenario
      const newVerificationDoc = { _id: mockDocId };
      mockUserModel.findOne.mockResolvedValue(null);
      mockVerificationModel.findOne.mockResolvedValue(null);
      mockVerificationModel.create.mockResolvedValue(newVerificationDoc as any);

      // ==================== Act ====================
      // 1. send verification code for new email
      const result = await sendCodeEmailToUser({
        email: mockEmail,
        shouldResendCode: false,
      });

      // ==================== Assert Process ====================
      // 1. verify email existence checks
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(mockVerificationModel.findOne).toHaveBeenCalledWith({
        email: mockEmail,
        type: "email_verification",
      });

      // 2. verify verification code generation
      expect(mockGenerateVerificationCode).toHaveBeenCalled();
      expect(mockGenerateNanoId).toHaveBeenCalledWith(true);

      // 3. verify verification record creation
      expect(mockVerificationModel.create).toHaveBeenCalledWith({
        email: mockEmail,
        type: "email_verification",
        session: mockHashedSession,
        verificationCode: mockCode,
        expiresAt: mockExpiresAt,
      });

      // 4. verify session token generation
      expect(mockSignToken).toHaveBeenCalledWith(
        { sessionId: mockHashedSession },
        VerificationTokenSignOptions
      );

      // 5. verify email template and sending
      expect(mockJoytifyVerificationCodeEmail).toHaveBeenCalledWith({ verificationCode: mockCode });
      expect(mockResend.emails.send).toHaveBeenCalled();

      // 6. verify correct result returned
      expect(result).toEqual({
        id: mockDocId,
        action: VerificationCodeActions.CODE_CREATED,
        sessionToken: mockSessionToken,
      });
    });

    it("should update existing verification when resending", async () => {
      // ==================== Arrange ====================
      // 1. setup existing verification with resend scenario
      const existingDoc = { _id: mockDocId, session: "old-session", email: mockEmail };
      const updatedDoc = { _id: mockDocId };

      mockUserModel.findOne.mockResolvedValue(null);
      mockVerificationModel.findOne.mockResolvedValue(existingDoc as any);
      mockVerificationModel.findOneAndUpdate.mockResolvedValue(updatedDoc as any);
      mockVerifyToken.mockResolvedValue({ payload: { sessionId: "old-session" } } as any);

      // ==================== Act ====================
      // 1. request verification code with resending
      const result = await sendCodeEmailToUser({
        email: mockEmail,
        shouldResendCode: true,
        token: mockSessionToken,
      });

      // ==================== Assert Process ====================
      // 1. verify existing verification was updated
      expect(mockVerificationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { email: mockEmail, type: "email_verification" },
        {
          session: mockHashedSession,
          verificationCode: mockCode,
          expiresAt: mockExpiresAt,
        },
        { new: true }
      );

      // 2. verify correct result for update action
      expect(result).toEqual({
        id: mockDocId,
        action: VerificationCodeActions.CODE_UPDATED,
        sessionToken: mockSessionToken,
      });
    });

    it("should throw error when session mismatch for existing verification", async () => {
      // ==================== Arrange ====================
      // 1. setup session mismatch scenario
      const existingDoc = { _id: mockDocId, session: "different-session", email: mockEmail };

      mockUserModel.findOne.mockResolvedValue(null);
      mockVerificationModel.findOne.mockResolvedValue(existingDoc as any);
      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockHashedSession } } as any);

      // ==================== Act & Assert ====================
      // 1. expect error for session mismatch
      await expect(
        sendCodeEmailToUser({
          email: mockEmail,
          shouldResendCode: false,
          token: mockSessionToken,
        })
      ).rejects.toThrow("Email is already in use");
    });
  });

  describe("verifyCode", () => {
    it("should verify code successfully and delete verification record", async () => {
      // ==================== Arrange ====================
      // 1. setup successful verification scenario
      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockHashedSession } } as any);
      mockVerificationModel.findOne.mockResolvedValue(mockVerificationDoc as any);
      mockCompareHashValue.mockResolvedValue(true);
      mockVerificationModel.findOneAndDelete.mockResolvedValue(mockVerificationDoc as any);

      // ==================== Act ====================
      // 1. verify the code
      const result = await verifyCode({
        code: mockCode,
        email: mockEmail,
        token: mockSessionToken,
      });

      // ==================== Assert Process ====================
      // 1. verify token validation
      expect(mockVerifyToken).toHaveBeenCalledWith(mockSessionToken, {
        secret: VerificationTokenSignOptions.secret,
      });

      // 2. verify verification document lookup
      expect(mockVerificationModel.findOne).toHaveBeenCalledWith({
        email: mockEmail,
        session: mockHashedSession,
        type: "email_verification",
      });

      // 3. verify code comparison
      expect(mockCompareHashValue).toHaveBeenCalledWith(mockCode, "hashed-code");

      // 4. verify verification record deletion
      expect(mockVerificationModel.findOneAndDelete).toHaveBeenCalledWith({
        email: mockEmail,
        session: mockHashedSession,
        type: "email_verification",
      });

      // 5. verify successful result
      expect(result).toEqual({ verified: true });
    });

    it("should return false when verification code does not match", async () => {
      // ==================== Arrange ====================
      // 1. setup code mismatch scenario
      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockHashedSession } } as any);
      mockVerificationModel.findOne.mockResolvedValue(mockVerificationDoc as any);
      mockCompareHashValue.mockResolvedValue(false);

      // ==================== Act ====================
      // 1. verify incorrect code
      const result = await verifyCode({
        code: mockCode,
        email: mockEmail,
        token: mockSessionToken,
      });

      // ==================== Assert Process ====================
      // 1. verify deletion was not attempted
      expect(mockVerificationModel.findOneAndDelete).not.toHaveBeenCalled();

      // 2. verify failed result
      expect(result).toEqual({ verified: false });
    });

    it("should return false when no token provided", async () => {
      // ==================== Act ====================
      // 1. verify code without token
      const result = await verifyCode({
        code: mockCode,
        email: mockEmail,
      });

      // ==================== Assert Process ====================
      // 1. verify failed result without token
      expect(result).toEqual({ verified: false });
    });

    it("should return false when verification document not found", async () => {
      // ==================== Arrange ====================
      // 1. setup document not found scenario
      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockHashedSession } } as any);
      mockVerificationModel.findOne.mockResolvedValue(null);

      // ==================== Act ====================
      // 1. verify code for non-existent verification
      const result = await verifyCode({
        code: mockCode,
        email: mockEmail,
        token: mockSessionToken,
      });

      // ==================== Assert Process ====================
      // 1. verify failed result when document not found
      expect(result).toEqual({ verified: false });
    });

    it("should throw error when verification code already used", async () => {
      // ==================== Arrange ====================
      // 1. setup already used verification scenario
      mockVerifyToken.mockResolvedValue({ payload: { sessionId: mockHashedSession } } as any);
      mockVerificationModel.findOne.mockResolvedValue(mockVerificationDoc as any);
      mockCompareHashValue.mockResolvedValue(true);
      mockVerificationModel.findOneAndDelete.mockResolvedValue(null); // deletion fails

      // ==================== Act & Assert ====================
      // 1. expect error for already used code
      await expect(
        verifyCode({
          code: mockCode,
          email: mockEmail,
          token: mockSessionToken,
        })
      ).rejects.toThrow("Verification code has already been used or expired");
    });
  });

  describe("sendLinkEmailToUser", () => {
    it("should send password reset link successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup successful password reset scenario
      const resetUrl = "http://reset-link.com";
      const sessionIdForReset = "session-id-for-reset";

      // Use different return values for different generateNanoId calls
      mockGenerateNanoId.mockImplementation((hash) =>
        Promise.resolve(hash ? mockHashedSession : sessionIdForReset)
      );

      mockUserModel.findOne.mockResolvedValue(mockUser as any);
      mockVerificationModel.findOne.mockResolvedValue(null);
      mockVerificationModel.create.mockResolvedValue({ _id: mockDocId } as any);
      mockGenerateVerificationLink.mockResolvedValue(resetUrl);

      // ==================== Act ====================
      // 1. send password reset link
      const result = await sendLinkEmailToUser(mockEmail);

      // ==================== Assert Process ====================
      // 1. verify user existence check
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockEmail });

      // 2. verify session ID generation (without hashing for reset)
      expect(mockGenerateNanoId).toHaveBeenCalledWith(false);

      // 3. verify verification record creation
      expect(mockVerificationModel.create).toHaveBeenCalledWith({
        email: mockEmail,
        type: "password_reset",
        session: sessionIdForReset,
        expiresAt: mockExpiresAt,
      });

      // 4. verify reset link generation
      expect(mockGenerateVerificationLink).toHaveBeenCalledWith(sessionIdForReset);

      // 5. verify email template generation
      expect(mockJoytifyResetPasswordLinkEmail).toHaveBeenCalledWith({
        url: resetUrl,
        username: "test",
      });

      // 6. verify correct result
      expect(result).toEqual({ url: resetUrl });
    });

    it("should update existing password reset record", async () => {
      // ==================== Arrange ====================
      // 1. setup existing reset record scenario
      const resetUrl = "http://reset-link.com";
      const existingDoc = { _id: mockDocId };

      mockUserModel.findOne.mockResolvedValue(mockUser as any);
      mockVerificationModel.findOne.mockResolvedValue(existingDoc as any);
      mockVerificationModel.findOneAndUpdate.mockResolvedValue(existingDoc as any);
      mockGenerateVerificationLink.mockResolvedValue(resetUrl);

      // ==================== Act ====================
      // 1. send password reset link for existing record
      const result = await sendLinkEmailToUser(mockEmail);

      // ==================== Assert Process ====================
      // 1. verify existing record was updated
      expect(mockVerificationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { email: mockEmail, type: "password_reset" },
        {
          session: mockHashedSession,
          expiresAt: mockExpiresAt,
        }
      );

      // 2. verify correct result
      expect(result).toEqual({ url: resetUrl });
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      // 1. setup user not found scenario
      mockUserModel.findOne.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for non-existent user
      await expect(sendLinkEmailToUser(mockEmail)).rejects.toThrow("User not found");
    });

    it("should throw error for third-party auth users", async () => {
      // ==================== Arrange ====================
      // 1. setup third-party auth user scenario
      const thirdPartyUser = { ...mockUser, authForThirdParty: true };
      mockUserModel.findOne.mockResolvedValue(thirdPartyUser as any);

      // ==================== Act & Assert ====================
      // 1. expect error for third-party users
      await expect(sendLinkEmailToUser(mockEmail)).rejects.toThrow(
        "This account was registered using a third-party service. Password reset is not supported."
      );
    });
  });

  describe("verifyLink", () => {
    it("should verify reset link successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup successful link verification scenario
      const resetToken = "reset-token-123";
      const sessionId = "session-123";
      const verificationDoc = {
        session: sessionId,
        type: "password_reset",
      };

      mockVerifyToken.mockResolvedValue({ payload: { sessionId } } as any);
      mockVerificationModel.findOne.mockResolvedValue(verificationDoc as any);

      // ==================== Act ====================
      // 1. verify reset link
      const result = await verifyLink(resetToken);

      // ==================== Assert Process ====================
      // 1. verify token validation
      expect(mockVerifyToken).toHaveBeenCalledWith(resetToken, {
        secret: VerificationTokenSignOptions.secret,
      });

      // 2. verify verification record lookup
      expect(mockVerificationModel.findOne).toHaveBeenCalledWith({
        session: sessionId,
        type: "password_reset",
      });

      // 3. verify successful result
      expect(result).toEqual({ verified: true });
    });

    it("should throw error when token is invalid", async () => {
      // ==================== Arrange ====================
      // 1. setup invalid token scenario
      const invalidToken = "invalid-token";
      mockVerifyToken.mockResolvedValue({ payload: null } as any);

      // ==================== Act & Assert ====================
      // 1. expect error for invalid token
      await expect(verifyLink(invalidToken)).rejects.toThrow(
        "Invalid or expired verification token"
      );
    });

    it("should throw error when verification record not found", async () => {
      // ==================== Arrange ====================
      // 1. setup verification record not found scenario
      const resetToken = "reset-token-123";
      const sessionId = "session-123";

      mockVerifyToken.mockResolvedValue({ payload: { sessionId } } as any);
      mockVerificationModel.findOne.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for missing verification record
      await expect(verifyLink(resetToken)).rejects.toThrow("Invalid or expired verification link");
    });
  });
});
