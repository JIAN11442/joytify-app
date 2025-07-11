import authJSON from "./auth.ja.json";
import playlistJSON from "./playlist.ja.json";
import libraryJSON from "./library.ja.json";
import passwordJSON from "./password.ja.json";
import policyJSON from "./policy.ja.json";
import toastJSON from "./toast.ja.json";
import commonJSON from "./common.ja.json";
import userJSON from "./user.ja.json";
import songJSON from "./song.ja.json";
import manageJSON from "./manage.ja.json";
import settingsJSON from "./settings.ja.json";
import dashboardJSON from "./dashboard.ja.json";
import musicianJSON from "./musician.ja.json";
import albumJSON from "./album.ja.json";
import profileJSON from "./profile.ja.json";
import notificationJSON from "./notification.ja.json";

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
