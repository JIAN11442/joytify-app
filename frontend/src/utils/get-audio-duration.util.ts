import { timeoutForEventListener } from "../lib/timeout.lib";

const getAudioDuration = (audio: HTMLAudioElement) => {
  return new Promise<number>((resolve, reject) => {
    // listen for the loadedmetadata event
    const handleLoadedMetadata = () => {
      resolve(audio.duration);
      cleanupAll();
    };

    // listen for the error event
    const handleError = () => {
      reject(new Error("Failed to load audio metadata"));
      cleanupAll();
    };

    // add loaded event listeners
    const cleanupLoaded = timeoutForEventListener(
      audio,
      "loadedmetadata",
      handleLoadedMetadata
    );

    // add error event listeners
    const cleanupError = timeoutForEventListener(audio, "error", handleError);

    // cleanup
    const cleanupAll = () => {
      cleanupLoaded();
      cleanupError();
    };
  });
};

export default getAudioDuration;
