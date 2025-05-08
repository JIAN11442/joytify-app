import authJSON from "./auth.ja.json";
import playlistJSON from "./playlist.ja.json";
import libraryJSON from "./library.ja.json";
import passwordJSON from "./password.ja.json";
import policyJSON from "./policy.ja.json";
import settingsJSON from "./settings.ja.json";
import toastJSON from "./toast.ja.json";
import commonJSON from "./common.ja.json";
import userJSON from "./user.ja.json";
import songJSON from "./song.ja.json";

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
