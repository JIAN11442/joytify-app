import { useEffect } from "react";
import { useParams } from "react-router-dom";

import Header from "../components/header.component";
import Loader from "../components/loader.component";
import PlaylistHeader from "../components/playlist-header.component";
import PlaylistBody from "../components/playlist-body.component";

import { QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";
import { usePlaylistById } from "../hooks/playlist.hook";

const PlaylistPage = () => {
  const { id } = useParams();

  const { playlist, refetch: playlistRefetch } = usePlaylistById(String(id));
  const { paletee } = playlist ?? {};

  useEffect(() => {
    // refetch query playlist while id changed
    playlistRefetch();

    // clean up query data while unmount
    return () => {
      queryClient.setQueryData([QueryKey.GET_TARGET_PLAYLIST], null);
    };
  }, [id]);

  // If any of these data are not available, show loader
  if (!playlist) {
    return (
      <Loader
        className={{
          container: `
            h-full
          `,
        }}
      />
    );
  }

  return (
    <Header
      options={false}
      style={{
        backgroundImage: `linear-gradient(
          to bottom,
          ${paletee?.vibrant} 0%,
          ${paletee?.darkVibrant} 10%,
          #171717 70%
        )`,
      }}
      className={`
        h-full
        pt-10
        rounded-b-none
        overflow-y-hidden
      `}
    >
      {/* Playlist header */}
      <PlaylistHeader playlist={playlist} className={`px-6`} />

      {/* Playlist content */}
      <PlaylistBody playlist={playlist} />
    </Header>
  );
};

export default PlaylistPage;
