import { SkeletonTheme } from "react-loading-skeleton";

interface SkeletonThemeProviderProps {
  children: React.ReactNode;
}

const SkeletonThemeProvider: React.FC<SkeletonThemeProviderProps> = ({ children }) => {
  return (
    <SkeletonTheme baseColor="#1e1e1e" highlightColor="#3c3c3c">
      {children}
    </SkeletonTheme>
  );
};

export default SkeletonThemeProvider;
