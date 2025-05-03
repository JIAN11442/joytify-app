import authJSON from "./auth.zh-CN.json";
import playlistJSON from "./playlist.zh-CN.json";
import libraryJSON from "./library.zh-CN.json";
import passwordJSON from "./password.zh-CN.json";
import policyJSON from "./policy.zh-CN.json";
import settingsJSON from "./settings.zh-CN.json";
import toastJSON from "./toast.zh-CN.json";
import commonJSON from "./common.zh-CN.json";

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
