import ImageLabel from "./image-label.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorAlbumResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";

type AlbumHeroSectionProps = {
  album: RefactorAlbumResponse;
};

const AlbumHeroSection: React.FC<AlbumHeroSectionProps> = ({ album }) => {
  const { fm } = useScopedIntl();
  const albumHeroSectionFm = fm("album.hero.section");

  const { collapseSideBarState } = useSidebarState();

  const { isCollapsed } = collapseSideBarState;
  const { title, coverImage, songs } = album;

  return (
    <div
      className={`
        relative
        flex
        px-6
        gap-x-5
        w-full
    `}
    >
      {/* cover image */}
      <ImageLabel src={coverImage} subfolder={UploadFolder.ALBUMS_IMAGE} isDefault={true} />

      {/* content */}
      <div
        className={`
          flex
          flex-col
          w-full
          lg:py-0
          items-start
          justify-between
        `}
      >
        {/* album */}
        <p>{albumHeroSectionFm("type")}</p>

        {/* title */}
        <h1
          style={{ lineHeight: "1.15" }}
          className={`
            info-title
            ${isCollapsed ? "max-sm:text-[2rem] sm:text-[3rem] lg:text-[5rem]" : "lg:text-[4.5rem]"}
          `}
        >
          {title}
        </h1>

        {/* other - songs count */}
        <p className={`text-grey-custom/50 line-clamp-1`}>
          {albumHeroSectionFm("description", { count: songs.length })}
        </p>
      </div>
    </div>
  );
};

export default AlbumHeroSection;
