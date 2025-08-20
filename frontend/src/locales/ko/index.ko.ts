import authJSON from "./auth.ko.json";
import playlistJSON from "./playlist.ko.json";
import libraryJSON from "./library.ko.json";
import passwordJSON from "./password.ko.json";
import policyJSON from "./policy.ko.json";
import toastJSON from "./toast.ko.json";
import commonJSON from "./common.ko.json";
import userJSON from "./user.ko.json";
import songJSON from "./song.ko.json";
import manageJSON from "./manage.ko.json";
import settingsJSON from "./settings.ko.json";
import searchJSON from "./search.ko.json";
import musicianJSON from "./musician.ko.json";
import albumJSON from "./album.ko.json";
import profileJSON from "./profile.ko.json";
import statsJSON from "./stats.ko.json";
import labelJSON from "./label.ko.json";
import homepageJSON from "./homepage.ko.json";

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
];

export default Object.assign({}, ...modules);
