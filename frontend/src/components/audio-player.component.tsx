import { useEffect, useRef } from "react";

import AnimationWrapper from "./animation-wrapper.component";
import SongTitleItem from "./song-title-item.component";
import PlayerOperation from "./player-operation.component";

import useSound from "../hooks/sound.hook";
import { useSongById } from "../hooks/song.hook";
import useSoundState from "../states/sound.state";
import PlayerVolume from "./player-volume.component";

type AudioPlayerProps = {
  songId: string;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ songId }) => {
  const songPlayedRef = useRef<string | null>(null);

  const { song, refetch } = useSongById(songId);
  const { setSound } = useSoundState();

  const sound = useSound(song?.songUrl || "");

  // Refetch song hook when songId changes
  useEffect(() => {
    refetch();
  }, [songId, refetch]);

  // while sound is ready, play audio
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
          className={{
            wrapper: `
              text-sm
              text-grey-custom/50
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
