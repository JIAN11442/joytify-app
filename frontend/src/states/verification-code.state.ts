import { create } from "zustand";
import {
  VerificationForType,
  VerificationForOptions,
  VerificationCodeActionType,
} from "../constants/verification-code.constant";

type VerificationCodeModalType = {
  active: boolean;
  type: VerificationForType;
  userEmail?: string | null;
  isResendSuccessful: boolean;
  isVerified: boolean;
  action?: VerificationCodeActionType | null;
  registerFn?: () => void;
};

type VerificationCodeModalState = {
  activeVerificationCodeModal: VerificationCodeModalType;
  verificationProcessPending: boolean;
  verifyCodePending: boolean;

  openVerificationCodeModal: (
    email: string,
    action: VerificationCodeActionType,
    registerFn?: () => void
  ) => void;
  closeVerificationCodeModal: () => void;

  openResendStatusModal: (status: boolean) => void;
  openVerifyStatusModal: (status: boolean) => void;

  backToInitialPage: (
    page: VerificationForType,
    action?: VerificationCodeActionType
  ) => void;

  setActiveVerificationCodeModal: (state: VerificationCodeModalType) => void;
  setVerificationProcessPending: (state: boolean) => void;
  setVerifyCodePending: (state: boolean) => void;
};

const { EMAIL_VERIFICATION, RESEND_EMAIL_VERIFICATION, VERIFY_EMAIL } =
  VerificationForOptions;

const initialParams = {
  active: false,
  type: EMAIL_VERIFICATION,
  userEmail: null,
  isResendSuccessful: false,
  isVerified: false,
  action: null,
  registerFn: () => {},
};

const useVerificationCodeModalState = create<VerificationCodeModalState>(
  (set, get) => {
    const getCurrentModalState = () => get().activeVerificationCodeModal;

    return {
      activeVerificationCodeModal: initialParams,
      verificationProcessPending: false,
      verifyCodePending: false,

      openVerificationCodeModal: (email, action, registerFn) =>
        set({
          activeVerificationCodeModal: {
            ...getCurrentModalState(),
            active: true,
            userEmail: email,
            action: action,
            ...(registerFn && { registerFn: registerFn }),
          },
        }),
      closeVerificationCodeModal: () =>
        set({
          activeVerificationCodeModal: initialParams,
          verificationProcessPending: false,
          verifyCodePending: false,
        }),

      openResendStatusModal: (status) =>
        set({
          activeVerificationCodeModal: {
            ...getCurrentModalState(),
            type: RESEND_EMAIL_VERIFICATION,
            isResendSuccessful: status,
          },
        }),
      openVerifyStatusModal: (status) =>
        set({
          activeVerificationCodeModal: {
            ...getCurrentModalState(),
            type: VERIFY_EMAIL,
            isVerified: status,
          },
        }),

      backToInitialPage: (page, action) =>
        set({
          activeVerificationCodeModal: {
            ...getCurrentModalState(),
            type: page,
            ...(action && { action: action }),
          },
        }),

      setActiveVerificationCodeModal: (state) =>
        set({ activeVerificationCodeModal: state }),
      setVerificationProcessPending: (state: boolean) =>
        set({ verificationProcessPending: state }),
      setVerifyCodePending: (state: boolean) =>
        set({ verifyCodePending: state }),
    };
  }
);

export default useVerificationCodeModalState;
