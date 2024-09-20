import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <Toaster
      toastOptions={{
        position: "top-center",
        duration: 1500,
        style: {
          background: "#333",
          color: "#fff",
          fontSize: "14px",
        },
      }}
    />
  );
};

export default ToasterProvider;
