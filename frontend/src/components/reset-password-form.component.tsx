import { useMemo } from "react";
import { useIntl } from "react-intl";
import UpdatePasswordForm from "./update-password-form.component";
import { useResetPasswordMutation } from "../hooks/user-mutate.hook";
import { useVerifyResetPasswordLinkQuery } from "../hooks/verification-query.hook";

type ResetPasswordFormProps = {
  token: string;
  className?: string;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, className }) => {
  const intl = useIntl();
  const { verified, isFetching } = useVerifyResetPasswordLinkQuery(token, 1800);
  const { mutate: resetPasswordFn, isPending } = useResetPasswordMutation();

  const disabledEdit = useMemo(() => {
    return !verified || isPending;
  }, [verified, isPending]);

  return (
    <UpdatePasswordForm
      title={intl.formatMessage({ id: "reset.password.form.title" })}
      description={intl.formatMessage({ id: "reset.password.form.description" })}
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
