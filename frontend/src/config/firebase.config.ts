import { initializeApp } from "firebase/app";
import {
  AuthProvider,
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  User,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3Okxnhe3nSHk3c-GC6oKmXfMPOhATLBg",
  authDomain: "mern-joytify.firebaseapp.com",
  projectId: "mern-joytify",
  storageBucket: "mern-joytify.appspot.com",
  messagingSenderId: "60007537976",
  appId: "1:60007537976:web:507c51a4296c7088bab5cd",
  measurementId: "G-02LBZLFJC4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Pop-up a sign third-party sign-in window
export const authWithThirdPartyUsingPopup = async (
  provider: AuthProvider
): Promise<User | null> => {
  let user = null;

  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((error) => {
      if (error.code === "auth/account-exists-with-different-credential") {
        throw new Error(
          `An account already exists by using a different sign-in method. Please sign in with the associated provider.`
        );
      } else {
        console.error(error);
      }
    });

  return user;
};

// Redirect to Google sign-in page
export const authWithThirdPartyUsingRedirect = async (
  provider: AuthProvider
) => {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.log(error);
  }
};
