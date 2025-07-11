import authJSON from "./auth.zh-CN.json";
import playlistJSON from "./playlist.zh-CN.json";
import libraryJSON from "./library.zh-CN.json";
import passwordJSON from "./password.zh-CN.json";
import policyJSON from "./policy.zh-CN.json";
import toastJSON from "./toast.zh-CN.json";
import commonJSON from "./common.zh-CN.json";
import userJSON from "./user.zh-CN.json";
import songJSON from "./song.zh-CN.json";
import manageJSON from "./manage.zh-CN.json";
import settingsJSON from "./settings.zh-CN.json";
import dashboardJSON from "./dashboard.zh-CN.json";
import musicianJSON from "./musician.zh-CN.json";
import albumJSON from "./album.zh-CN.json";
import profileJSON from "./profile.zh-CN.json";
import notificationJSON from "./notification.zh-CN.json";

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
