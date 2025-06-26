import { twMerge } from "tailwind-merge";

type ManagePlaylistCardImageProps = {
  coverImage: string;
  className?: string;
  children?: React.ReactNode;
  tw?: { img?: string; mask?: string };
};

const ManagePlaylistCardImage: React.FC<ManagePlaylistCardImageProps> = ({
  coverImage,
  className,
  children,
  tw,
}) => {
  return (
    <div className={twMerge(`relative overflow-hidden shrink-0`, className)}>
      {/* image */}
      <img
        src={coverImage}
        className={twMerge(
          `
          w-full
          h-[250px]
          object-cover
          rounded-md
          duration-300
        `,
          tw?.img
        )}
      />
      {/* mask */}
      <div className={twMerge(`image-bottom-mask`, tw?.mask)} />

      {/* children */}
      {children}
    </div>
  );
};

export default ManagePlaylistCardImage;
