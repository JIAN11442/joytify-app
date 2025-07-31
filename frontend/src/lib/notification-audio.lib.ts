import NotificationSoundEffect from "../../public/sounds/notification-sound-effect-v2.mp3";

let notificationAudio: HTMLAudioElement | null = null;
let isAudioUnlocked = false;

export const initializeNotificationAudioInstance = async (): Promise<HTMLAudioElement> => {
  const audio = new Audio();
  audio.src = NotificationSoundEffect;
  audio.preload = "auto";

  // wait for audio to be ready,
  // ensure Safari can set volume correctly
  await new Promise<void>((resolve) => {
    if (audio.readyState >= 3) {
      resolve();
    } else {
      audio.addEventListener("canplay", () => resolve(), { once: true });
    }
  });

  if (!isAudioUnlocked) {
    try {
      audio.volume = 0;
      await audio.play();
      audio.pause();

      audio.volume = 1;
      audio.currentTime = 0;
      isAudioUnlocked = true;

      console.log("🔊 Notification audio unlocked");
    } catch (error) {
      console.warn("⚠️ Audio unlock failed:", error);
    }
  }

  return audio;
};

const getNotificationAudioInstance = async (): Promise<HTMLAudioElement> => {
  if (!notificationAudio) {
    notificationAudio = await initializeNotificationAudioInstance();
  }

  return notificationAudio;
};

export const playNotificationSound = async (): Promise<void> => {
  try {
    const audio = await getNotificationAudioInstance();

    if (!isAudioUnlocked) return;

    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    console.warn("Failed to play notification sound:", error);
  }
};
