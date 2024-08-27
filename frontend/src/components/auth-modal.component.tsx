import Modal from "./modal.component";
import AuthForm from "./auth-form.component";

import AuthForOptions from "../constants/auth-type.constant";
import useAuthModalState from "../states/auth-modal.state";

const AuthModal = () => {
  const { activeModal, authFor, closeAuthModal } = useAuthModalState();

  const SIGN_IN = AuthForOptions.SIGN_IN;

  const title = authFor === SIGN_IN ? "Welcome back" : "Join use today";
  const description =
    authFor === SIGN_IN
      ? "Login to your account"
      : "Sign up to get own account";

  return (
    <Modal
      title={title}
      description={description}
      activeState={activeModal}
      closeModalFn={closeAuthModal}
    >
      <AuthForm />
    </Modal>
  );
};

export default AuthModal;
