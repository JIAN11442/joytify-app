import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import * as LoaderSpinners from "react-spinners";

interface LoaderProps {
  loader?: {
    name?: string;
    color?: string;
    loading?: boolean;
    size?: number;
    speed?: number;
  };
  className?: {
    container?: string;
    text?: string;
  };
  children?: React.ReactNode;
}

const Loader: React.FC<LoaderProps> = ({ loader, className, children }) => {
  const color = loader?.color || "rgb(209,213,219)";
  const size = loader?.size || 50;
  const speed = loader?.speed || 1;

  const loaderName = (loader?.name || "") as keyof typeof LoaderSpinners;

  // 將該庫所有提供的選項轉成陣列
  const spinnerOptions = Object.keys(LoaderSpinners);

  // 預設 Loading 用的是該庫的 ClipLoader
  let Loading = LoaderSpinners["ClipLoader"];

  // 如果有指定 loaderName，檢查該庫是否有提供該 loaderName
  // 根據情況決定是否改變預設的 Loading 值
  if (loaderName) {
    // 有的話，則使用指定的 loader
    if (spinnerOptions.includes(loaderName)) {
      Loading = LoaderSpinners[loaderName];
    } else {
      // 反之，顯示錯誤訊息並列出所有可選項
      return (
        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            max-w-[900px]
            p-5
            my-10
            gap-y-5
            border
            border-dotted
            border-red-500/50
            rounded-lg
            text-lg
            text-red-500
            font-mono
            bg-red-100/30
          "
        >
          <p className="font-semibold text-xl">
            Invalid loader name, Please choose from the list below:
          </p>
          <Link
            to="https://www.davidhu.io/react-spinners/"
            target="_blank"
            className="
              text-blue-400
              hover:underline
            "
          >
            <p>Refer to the following websites</p>
          </Link>
          <ul
            className="
              grid
              grid-cols-2
              gap-x-20
            "
          >
            {spinnerOptions.map((option, i) => (
              <li
                key={i}
                style={{ listStyleType: "disc" }}
                className="text-start"
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }

  return (
    <div
      className={twMerge(
        `
        flex
        items-center
        justify-center
      `,
        className?.container
      )}
    >
      <Loading color={color} size={size} speedMultiplier={speed} />
      {children}
    </div>
  );
};

export default Loader;
