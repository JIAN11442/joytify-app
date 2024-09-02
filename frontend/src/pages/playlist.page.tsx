import { useParams } from "react-router-dom";
import Header from "../components/header.component";
import { usePlaylistById } from "../hooks/playlist.hook";

const PlaylistPage = () => {
  const { id } = useParams();

  const { playlist } = usePlaylistById(id as string);
  const { title, cover_image, songs } = playlist ?? {};

  const isCoverImage = (cover_image?.split("default_img").length ?? 0) < 2;
  return (
    <Header
      cover_image={isCoverImage ? cover_image : undefined}
      options={false}
      className={`
        bg-gradient-to-tr
        from-neutral-800
        to-neutral-700
        rounded-b-none
        py-10
      `}
    >
      {/* Playlist header */}
      <div
        className="
          flex
          gap-x-5
        "
      >
        {/* Playlist cover image */}
        <img
          src={cover_image}
          className={`
            w-[9rem]
            h-[9rem]
            rounded-md
            shadow-lg
          `}
        />

        {/* Title */}
        <div
          className={`
            flex
            flex-col
            py-1
            items-start
            justify-between
          `}
        >
          {/* type */}
          <p>Playlist</p>

          {/* title */}
          <p
            className={`
              text-4xl
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
              xl:text-8xl
              font-extrabold
              font-serif
            `}
          >
            {title}
          </p>

          {/* other */}
          <p>{songs?.length} songs</p>
        </div>
      </div>

      {/* Playlist content */}
    </Header>
  );
};

export default PlaylistPage;
