import { useMemo } from "react";
import UpdatePasswordForm from "./update-password-form.component";
import { useResetPasswordMutation } from "../hooks/user-mutate.hook";
import { useVerifyResetPasswordLinkQuery } from "../hooks/verification-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";

type ResetPasswordFormProps = {
  token: string;
  className?: string;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, className }) => {
  const { fm } = useScopedIntl();
  const resetPasswordFormFm = fm("reset.password.form");

  const { verified, isFetching } = useVerifyResetPasswordLinkQuery(token, 1800);
  const { mutate: resetPasswordFn, isPending } = useResetPasswordMutation();

  const disabledEdit = useMemo(() => {
    return !verified || isPending;
  }, [verified, isPending]);

  return (
    <UpdatePasswordForm
      title={resetPasswordFormFm("title")}
      description={resetPasswordFormFm("description")}
      updatePasswordFn={(params) => resetPasswordFn({ token, ...params })}
      isFetching={isFetching}
      verified={verified as boolean}
      disabled={disabledEdit}
      isPending={isPending}
      className={className}
    />
  );
};

export default ResetPasswordForm;
