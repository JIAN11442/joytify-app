import AuthModal from "../components/auth-modal.component";
import UploadModal from "../components/upload-modal.component";

const ModalProvider = () => {
  return (
    <>
      <AuthModal />
      <UploadModal />
    </>
  );
};

export default ModalProvider;
