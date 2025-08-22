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
import searchJSON from "./search.ja.json";
import musicianJSON from "./musician.ja.json";
import albumJSON from "./album.ja.json";
import profileJSON from "./profile.ja.json";
import statsJSON from "./stats.ja.json";
import labelJSON from "./label.ja.json";
import homepageJSON from "./homepage.ja.json";
import shortcutJSON from "./shortcut.ja.json";

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
  searchJSON,
  musicianJSON,
  albumJSON,
  profileJSON,
  statsJSON,
  labelJSON,
  homepageJSON,
  shortcutJSON,
];

export default Object.assign({}, ...modules);
