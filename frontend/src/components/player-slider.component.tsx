import { useEffect, useState } from "react";
import useSoundState from "../states/sound.state";
import usePlayerState from "../states/player.state";
import usePlaylistState from "../states/playlist.state";
import { refactorResSong } from "../constants/axios-response.constant";
import SongLoopOptions from "../constants/song-loop-mode.constant";
import { SoundOutputType } from "../hooks/sound.hook";
import { getDuration } from "../utils/get-time.util";

type PlayerSliderProps = {
  song: refactorResSong;
  sound: SoundOutputType;
};

const PlayerSlider: React.FC<PlayerSliderProps> = ({ song, sound }) => {
  const { duration } = song;

  const [displayTime, setDisplayTime] = useState("0:00");
  const {
    currentPlaybackTime,
    isPlaying,
    songIds,
    activeSongId,
    setActiveSongId,
    setSongIds,
    shuffleSongIds,
  } = useSoundState();
  const { isShuffle, loopType } = usePlayerState();
  const { targetPlaylist } = usePlaylistState();

  const formattedProgressTime = getDuration(currentPlaybackTime);
  const formattedDurationTime = getDuration(duration);

  // handle change song seek
  const handleChangeSongSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    // Ensure playback starts when slider is clicked, even if the song had previously finished
    // This handles cases where isPlaying is false due to the song ending naturally
    if (!isPlaying) {
      sound.play();
    }

    sound.seek(value);
  };

  // Update display time every second ,
  // since we're using seconds as the time unit (formattedProgressTime)
  useEffect(() => {
    setDisplayTime(formattedProgressTime);

    // If the song has finished playing (display time equals song duration),
    // stop the audio
    if (formattedProgressTime === formattedDurationTime) {
      const currentIndex = songIds.indexOf(activeSongId);

      // if loop type is stack, always play same song id again
      if (loopType === SongLoopOptions.TRACK) {
        sound.stop();
        sound.play();
      }
      // if user not setting any type of loop of shuffle
      // mean original player state, then just stop while play ended
      else if (loopType === SongLoopOptions.OFF && !isShuffle) {
        sound.stop();
      }
      // otherwise, other situation is play to next song id
      // like shuffle or loop playlist
      else {
        // while next song is last index song
        const lastSongPlayed = currentIndex + 1 === songIds.length - 1;

        // if shuffle set to true, shuffle song ids
        if (isShuffle) {
          if (lastSongPlayed && shuffleSongIds) {
            shuffleSongIds(songIds[currentIndex + 1]);
          }
        }
        // if shuffle is false, mean no setting shuffle function
        // then just restore songIds to original sort arrange
        else {
          if (targetPlaylist) {
            setSongIds(targetPlaylist?.songs.map((song) => song._id));
          }
        }

        // finally, both of situation just set to next song id to play
        setActiveSongId(
          songIds[currentIndex === songIds.length - 1 ? 0 : currentIndex + 1]
        );
      }
    }
  }, [formattedProgressTime]);

  return (
    <div
      className={`
        flex 
        w-full
        gap-3
        items-center
    `}
    >
      {/* start time */}
      <p className={`slider-time`}>{displayTime}</p>

      {/* slider */}
      <input
        type="range"
        min={0}
        max={duration}
        value={currentPlaybackTime}
        step={1}
        onChange={handleChangeSongSeek}
        className={`input-slider`}
      />

      {/* end time */}
      <p className={`slider-time`}>{formattedDurationTime}</p>
    </div>
  );
};

export default PlayerSlider;
