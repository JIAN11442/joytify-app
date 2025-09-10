import { useCallback } from "react";
import usePlaybackControl from "./playback-control.hook";
import { useRecordPlaybackLogMutation } from "./playback-mutate.hook";
import { PlaybackStateType } from "@joytify/types/types";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";

interface PlaybackCompletionParams {
  songId: string;
  duration: number;
  state: PlaybackStateType;
  onContinuePlayback: () => void;
}

export const usePlaybackCompletion = () => {
  const { setActiveSongRateModal } = useSongState();
  const { mutate: recordPlaybackLogFn } = useRecordPlaybackLogMutation();
  const { pausePlayback } = usePlaybackControl();

  const handlePlaybackCompletion = useCallback(
    ({ songId, duration, state, onContinuePlayback }: PlaybackCompletionParams) => {
      recordPlaybackLogFn(
        { songId, duration, state },
        {
          onSuccess: (data) => {
            const { shouldPrompt, song } = data;

            if (shouldPrompt) {
              // pause playback and show rating modal
              pausePlayback();

              // show rating modal
              timeoutForDelay(() => {
                setActiveSongRateModal({ active: true, song });
              });
            } else {
              // continue with normal playback flow
              onContinuePlayback();
            }
          },
          onError: () => {
            // on error, continue with normal playback
            onContinuePlayback();
          },
        }
      );
    },
    [recordPlaybackLogFn, setActiveSongRateModal, pausePlayback]
  );

  return {
    handlePlaybackCompletion,
  };
};
