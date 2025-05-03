import authJSON from "./auth.zh-TW.json";
import playlistJSON from "./playlist.zh-TW.json";
import libraryJSON from "./library.zh-TW.json";
import passwordJSON from "./password.zh-TW.json";
import policyJSON from "./policy.zh-TW.json";
import settingsJSON from "./settings.zh-TW.json";
import toastJSON from "./toast.zh-TW.json";
import commonJSON from "./common.zh-TW.json";

const modules = [
  authJSON,
  playlistJSON,
  libraryJSON,
  passwordJSON,
  policyJSON,
  settingsJSON,
  toastJSON,
  commonJSON,
];

export default Object.assign({}, ...modules);
