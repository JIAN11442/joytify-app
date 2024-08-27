import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";

const FirebaseProvider = {
  GOOGLE: new GoogleAuthProvider(),
  GITHUB: (() => {
    const provider = new GithubAuthProvider();
    provider.addScope("user:email"); // Request github to access the user's email address

    return provider;
  })(),
};

export default FirebaseProvider;
