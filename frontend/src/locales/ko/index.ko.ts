import authJSON from "./auth.ko.json";
import playlistJSON from "./playlist.ko.json";
import libraryJSON from "./library.ko.json";
import passwordJSON from "./password.ko.json";
import policyJSON from "./policy.ko.json";
import settingsJSON from "./settings.ko.json";
import toastJSON from "./toast.ko.json";
import commonJSON from "./common.ko.json";
import userJSON from "./user.ko.json";
import songJSON from "./song.ko.json";

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
