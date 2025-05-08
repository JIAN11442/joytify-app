import authJSON from "./auth.ms.json";
import playlistJSON from "./playlist.ms.json";
import libraryJSON from "./library.ms.json";
import passwordJSON from "./password.ms.json";
import policyJSON from "./policy.ms.json";
import settingsJSON from "./settings.ms.json";
import toastJSON from "./toast.ms.json";
import commonJSON from "./common.ms.json";
import userJSON from "./user.ms.json";
import songJSON from "./song.ms.json";

const modules = [
  authJSON,
  playlistJSON,
  libraryJSON,
  passwordJSON,
  policyJSON,
  settingsJSON,
  toastJSON,
  commonJSON,
  userJSON,
  songJSON,
];

export default Object.assign({}, ...modules);
