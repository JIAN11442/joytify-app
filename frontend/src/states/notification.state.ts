import { create } from "zustand";

type NotificationParams = {
  shouldPlayNotificationSound: boolean;
  setShouldPlayNotificationSound: (state: boolean) => void;
};

const useNotificationState = create<NotificationParams>((set) => ({
  shouldPlayNotificationSound: false,
  setShouldPlayNotificationSound: (state) => set({ shouldPlayNotificationSound: state }),
}));

export default useNotificationState;
