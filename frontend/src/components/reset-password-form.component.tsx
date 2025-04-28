import UpdatePasswordForm from "./update-password-form.component";
import { useResetPasswordMutation } from "../hooks/user-mutate.hook";
import { useVerifyResetPasswordLinkQuery } from "../hooks/verification-query.hook";

type ResetPasswordFormProps = {
  token: string;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  // verify reset password link
  const { verified, isFetching } = useVerifyResetPasswordLinkQuery(token, 1800);

  // reset password mutation
  const { mutate: resetPasswordFn, isPending } = useResetPasswordMutation();

  // disable edit
  const disabledEdit = !verified || isPending;

  return (
    <UpdatePasswordForm
      title="Reset your password"
      description="Enter your current password and your new password."
      updatePasswordFn={(params) => resetPasswordFn({ token, ...params })}
      isFetching={isFetching}
      verified={verified as boolean}
      disabled={disabledEdit}
      isPending={isPending}
    />
  );
};

export default ResetPasswordForm;
