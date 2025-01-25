import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import AnimationWrapper from "./animation-wrapper.component";
import SongTitleItem from "./song-title-item.component";
import PlayerOperation from "./player-operation.component";
import PlayerVolume from "./player-volume.component";

import useSound from "../hooks/sound.hook";
import { useSongById } from "../hooks/song.hook";
import useSoundState from "../states/sound.state";
import { useMutation } from "@tanstack/react-query";
import { MutationKey } from "../constants/query-client-key.constant";
import { storePlaybackLog } from "../fetchs/playback.fetch";
import PlaybackStateOptions from "../constants/playback.constant";

type AudioPlayerProps = {
  songId: string;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ songId }) => {
  const navigate = useNavigate();

  const songPlayedRef = useRef<string | null>(null);

  const { song, refetch: songRefetch } = useSongById(songId);
  const { setSound, songToPlay } = useSoundState();

  const sound = useSound(song?.songUrl || "");
  const { playbackTime } = sound;

  // record playback log mutation
  const { mutate: recordPlaybackLog } = useMutation({
    mutationKey: [MutationKey.RECORD_PLAYBACK_LOG],
    mutationFn: storePlaybackLog,
    onError: (error) => {
      console.log(error);
    },
  });

  // handle navigate to target song playlist
  const handleNavigateToPlaylist = () => {
    navigate(`/playlist/${songToPlay?.playlist_for}`);
  };

  // Refetch song hook when songId changes
  useEffect(() => {
    if (songId && songPlayedRef.current && songPlayedRef.current !== songId) {
      // while song is playing and switch to another song,
      // record playback log before refetch new song data
      if (sound.timestamp < sound.duration - 1) {
        recordPlaybackLog({
          songId: songPlayedRef.current,
          duration: playbackTime,
          state: PlaybackStateOptions.PLAYING,
          timestamp: new Date(),
        });
      }

      songRefetch();
    }
  }, [songId, songPlayedRef, songRefetch]);

  // while sound and song are ready, play audio
  useEffect(() => {
    if (sound && song && songPlayedRef.current !== song._id) {
      // play audio
      sound.play();
      // to avoid playing audio again
      songPlayedRef.current = song._id;
      // set sound to sound state
      setSound(sound);
    }
  }, [song, sound, songPlayedRef]);

  // If song is not found, return null
  if (!song) return null;

  // if song is found, return the song title item
  const { title, imageUrl, artist } = song;

  return (
    <AnimationWrapper
      visible={Boolean(song)}
      initial={{ opacity: 0, transformOrigin: "bottom" }}
      animate={{ opacity: 1, transformOrigin: "bottom" }}
      className={`
        fixed
        bottom-0
        left-0
        flex
        p-4
        w-full
        h-[75px]
        bg-black
        shadow-[1px_0px_15px_5px]
        shadow-black/50
      `}
    >
      <div
        className={`
          flex  
          w-full
          gap-10
          items-center
          justify-between
        `}
      >
        {/* song item */}
        <SongTitleItem
          title={title}
          imageUrl={imageUrl}
          artist={artist}
          switchFunc={false}
          onClick={handleNavigateToPlaylist}
          className={{
            wrapper: `
              text-sm
              text-grey-custom/50
              cursor-pointer
            `,
          }}
        />

        {/* slider && operation button */}
        <PlayerOperation
          song={song}
          sound={sound}
          className={`
            flex-1
            flex-shrink-0
            min-w-[350px]
            max-w-[50%]
          `}
        />

        {/* volume */}
        <PlayerVolume
          className={`
            flex
            justify-end
          `}
        />
      </div>
    </AnimationWrapper>
  );
};

export default AudioPlayer;
