import { Toaster } from "react-hot-toast";

interface ToasterProviderProps {
  children: React.ReactNode;
}

const ToasterProvider: React.FC<ToasterProviderProps> = ({ children }) => {
  return (
    <>
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
      {children}
    </>
  );
};

export default ToasterProvider;
