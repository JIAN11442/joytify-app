import authJSON from "./auth.en-US.json";
import playlistJSON from "./playlist.en-US.json";
import libraryJSON from "./library.en-US.json";
import passwordJSON from "./password.en-US.json";
import policyJSON from "./policy.en-US.json";
import settingsJSON from "./settings.en-US.json";
import toastJSON from "./toast.en-US.json";
import commonJSON from "./common.en-US.json";

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
