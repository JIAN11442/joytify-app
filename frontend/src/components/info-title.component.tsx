import { useAutoFitFont } from "../hooks/autofit-font.hook";

type AutoFitTitleProps = {
  children: string;
  onClick?: () => void;
  className?: string;
};

export const AutoFitTitle: React.FC<AutoFitTitleProps> = ({ children, onClick, className }) => {
  const { ref, fontSize } = useAutoFitFont({
    text: children,
    maxSingle: 6,
    maxDouble: 3,
    min: 1.5,
  });

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        fontSize: `${fontSize}rem`,
        lineHeight: 1.15,
        fontWeight: 800,
        fontFamily: "Montserrat",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
      className={className}
    >
      {children}
    </div>
  );
};
