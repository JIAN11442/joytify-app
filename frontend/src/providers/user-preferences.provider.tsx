import { useEffect, useRef } from "react";

import { getSongById } from "../fetchs/song.fetch";
import { useGetUserPreferencesCookieQuery } from "../hooks/cookie-query.hook";
import { useUpdateUserPreferencesMutation } from "../hooks/cookie-mutate.hook";
import { LoopMode, SupportedLocale } from "@joytify/shared-types/constants";
import usePlaybackControlState from "../states/playback-control.state";
import useSidebarState from "../states/sidebar.state";
import useCookieState from "../states/cookie.state";
import useLocaleState from "../states/locale.state";
import useUserState from "../states/user.state";
import { Queue } from "@joytify/shared-types/types";
import { getAudioInstance } from "../lib/audio.lib";
import { timeoutForDelay } from "../lib/timeout.lib";

type UserPreferencesProps = {
  children: React.ReactNode;
};

const UserPreferencesProvider: React.FC<UserPreferencesProps> = ({ children }) => {
  const initializePlayerRef = useRef<boolean>(false);

  const { authUser } = useUserState();
  const { setThemeLocale } = useLocaleState();
  const { setCollapseSideBarState, collapseSideBarState } = useSidebarState();
  const {
    setIsShuffle,
    setLoopMode,
    setAudioVolume,
    setPlaybackQueue,
    setPlaylistSongs,
    setInitializedFormCookie,
  } = usePlaybackControlState();
  const { setRefactorCookiePlayer } = useCookieState();

  const { mutate: updateUserPreferencesFn } = useUpdateUserPreferencesMutation();
  const { userPreferences } = useGetUserPreferencesCookieQuery();
  const { sidebarCollapsed, locale, player } = userPreferences ?? {};
  const { EN_US } = SupportedLocale;

  const audio = getAudioInstance();

  // initialize sidebar collapsed state
  // initialize theme locale
  useEffect(() => {
    // if login, initialize sidebar collapsed state with user preferences cookie
    // if not login or logout, initialize sidebar collapsed state with false
    setCollapseSideBarState({
      ...collapseSideBarState,
      isCollapsed: !!sidebarCollapsed,
    });

    // if login, initialize theme locale with user preferences cookie
    // if not login or logout, initialize theme locale with EN_US
    setThemeLocale(authUser ? locale ?? EN_US : EN_US);
  }, [authUser]);

  // initialize player state
  useEffect(() => {
    const initializePlayer = async () => {
      if (player && !initializePlayerRef.current) {
        const { shuffle, loop, volume, playlistSongs, playbackQueue } = player;
        const { queue, currentIndex } = playbackQueue;

        setIsShuffle(shuffle);
        setLoopMode(loop);
        setAudioVolume(volume);

        try {
          const refactorPlaylistSongs = await Promise.all(
            playlistSongs.map(async (songId) => {
              const song = await getSongById(songId);
              return song;
            })
          );

          const songMap = new Map(refactorPlaylistSongs.map((song) => [song?._id, song]));

          const refactorQueue = queue.map((songId) => songMap.get(songId));
          const refactorPlaybackQueue = { queue: refactorQueue as Queue, currentIndex };
          const refactorPlayer = {
            ...player,
            playlistSongs: refactorPlaylistSongs,
            playbackQueue: refactorPlaybackQueue,
          };

          setRefactorCookiePlayer(refactorPlayer);
          setPlaybackQueue(refactorPlaybackQueue);
          setPlaylistSongs(refactorPlaylistSongs);
          setInitializedFormCookie(true);

          if (refactorQueue[currentIndex]) {
            audio.src = refactorQueue[currentIndex].songUrl;
          }

          initializePlayerRef.current = true;
        } catch (error) {
          console.log(error);

          timeoutForDelay(() => {
            // reset user preferences player state
            updateUserPreferencesFn({
              player: {
                shuffle: false,
                loop: LoopMode.NONE,
                volume: 0.5,
                playlistSongs: [],
                playbackQueue: { queue: [], currentIndex: 0 },
              },
            });
          });
        }
      }
    };

    initializePlayer();
  }, [player, updateUserPreferencesFn]);

  return <>{children}</>;
};

export default UserPreferencesProvider;
