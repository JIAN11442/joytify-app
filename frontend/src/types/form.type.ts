import { FieldValues, UseFormSetError, UseFormSetValue, UseFormTrigger } from "react-hook-form";
import {
  defaultCreateAlbumData,
  defaultCreateLabelData,
  defaultCreatePlaylistData,
  defaultForgotPasswordData,
  defaultLoginData,
  defaultMovingPlaylistData,
  defaultPlaylistEditData,
  defaultProfileEditData,
  defaultResetPasswordData,
  defaultSongData,
  defaultVerificationCodeInput,
} from "../constants/form.constant";

export type DefaultAuthForm = typeof defaultLoginData & {
  confirmPassword?: string;
};

export type DefaultSongForm = typeof defaultSongData;
export type DefaultForgotPasswordForm = typeof defaultForgotPasswordData;
export type DefaultResetPasswordForm = typeof defaultResetPasswordData;
export type DefaultEditPlaylistForm = typeof defaultPlaylistEditData;
export type DefaultCreateLabelForm = typeof defaultCreateLabelData;
export type DefaultMovingPlaylistForm = typeof defaultMovingPlaylistData;
export type DefaultCreatePlaylistForm = typeof defaultCreatePlaylistData;
export type DefaultCreateAlbumForm = typeof defaultCreateAlbumData;
export type DefaultVerificationCodeForm = typeof defaultVerificationCodeInput;
export type DefaultEditProfileForm = typeof defaultProfileEditData;

export type FormMethods<T extends FieldValues> = {
  setFormValue: UseFormSetValue<T>;
  setFormError: UseFormSetError<T>;
  trigger: UseFormTrigger<T>;
};
