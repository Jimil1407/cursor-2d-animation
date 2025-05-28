// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCXE7NrRlYYNrkMMESL_bOAezkbFCd_MdA",
    authDomain: "prompmotion-auth.firebaseapp.com",
    projectId: "prompmotion-auth",
    storageBucket: "prompmotion-auth.firebasestorage.app",
    messagingSenderId: "397157377679",
    appId: "1:397157377679:web:e914a96717f0130b2432fa"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, googleProvider, githubProvider };
