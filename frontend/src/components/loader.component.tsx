import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import * as LoaderSpinners from "react-spinners";

type LoaderOptions = keyof typeof LoaderSpinners;

type LoaderProps = {
  loader?: {
    name?: LoaderOptions | string;
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
};

const getLoaderSize = (loader: LoaderOptions) => {
  switch (loader) {
    case "BounceLoader":
    case "CircleLoader":
    case "ClipLoader":
    case "ClockLoader":
    case "DotLoader":
    case "HashLoader":
    case "MoonLoader":
    case "RingLoader":
      return 30;
    default:
      return 8;
  }
};

const isLoaderOptions = (loader: string): loader is LoaderOptions => {
  return loader !== undefined && loader in LoaderSpinners;
};

const Loader: React.FC<LoaderProps> = ({ loader, className, children }) => {
  const defaultColor = loader?.color || "rgb(82 82 82 / 0.8)";
  const defaultSize = loader?.size || 50;
  const defaultSpeed = loader?.speed || 1;
  const defaultLoader: LoaderOptions = "ClipLoader";

  const loaderName = loader?.name || defaultLoader;

  let Loading = LoaderSpinners[defaultLoader];

  if (isLoaderOptions(loaderName)) {
    Loading = LoaderSpinners[loaderName];
  } else {
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
          text-red-500
          font-mono
        "
      >
        {/* title */}
        <p className="font-semibold text-xl">
          Invalid loader name, Please choose from the list below:
        </p>

        {/* navigate to the website */}
        <Link
          to="https://www.davidhu.io/react-spinners/"
          target="_blank"
          className={`text-blue-400 hover:underline`}
        >
          <p>Refer to the following websites</p>
        </Link>

        {/* list of loaders */}
        <ul
          className={`
            grid
            grid-cols-2
          `}
        >
          {Object.keys(LoaderSpinners).map((option, i) => (
            <li
              key={i}
              className={`
                grid
                grid-cols-2
                items-center
                gap-3
                p-4
                border-[0.5px]
              `}
            >
              <span>{option}</span>
              <Loader loader={{ name: option, size: getLoaderSize(option as LoaderOptions) }} />
            </li>
          ))}
        </ul>
      </div>
    );
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
      <Loading color={defaultColor} size={defaultSize} speedMultiplier={defaultSpeed} />
      {children}
    </div>
  );
};

export default Loader;
