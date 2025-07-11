import authJSON from "./auth.en-US.json";
import playlistJSON from "./playlist.en-US.json";
import libraryJSON from "./library.en-US.json";
import passwordJSON from "./password.en-US.json";
import policyJSON from "./policy.en-US.json";
import toastJSON from "./toast.en-US.json";
import commonJSON from "./common.en-US.json";
import userJSON from "./user.en-US.json";
import songJSON from "./song.en-US.json";
import manageJSON from "./manage.en-US.json";
import settingsJSON from "./settings.en-US.json";
import dashboardJSON from "./dashboard.en-US.json";
import musicianJSON from "./musician.en-US.json";
import albumJSON from "./album.en-US.json";
import profileJSON from "./profile.en-US.json";
import notificationJSON from "./notification.en-US.json";

const modules = [
  authJSON,
  playlistJSON,
  libraryJSON,
  passwordJSON,
  policyJSON,
  toastJSON,
  commonJSON,
  userJSON,
  songJSON,
  manageJSON,
  settingsJSON,
  dashboardJSON,
  musicianJSON,
  albumJSON,
  profileJSON,
  notificationJSON,
];

export default Object.assign({}, ...modules);
