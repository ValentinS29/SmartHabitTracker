import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { User } from "../../types";

const firebaseConfig = {
  apiKey: "AIzaSyCbABgcLI_p8NP1DUT6x62Pxgsqcrda44I",
  authDomain: "smarthabittracker-43aa7.firebaseapp.com",
  projectId: "smarthabittracker-43aa7",
  storageBucket: "smarthabittracker-43aa7.firebasestorage.app",
  messagingSenderId: "914092916614",
  appId: "1:914092916614:web:9b52d2d5e2e25ea0f7bb23",
};

console.log("🔥 [FIREBASE] Initializing Firebase");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("✅ [FIREBASE] Firebase initialized successfully");

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || undefined,
  };
};

export const registerUser = async (
  email: string,
  password: string
): Promise<User> => {
  console.log("🔐 [AUTH SERVICE] Registering user:", email);
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = mapFirebaseUser(userCredential.user);
  console.log("✅ [AUTH SERVICE] User registered:", user.email);
  return user;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  console.log("🔐 [AUTH SERVICE] Logging in user:", email);
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = mapFirebaseUser(userCredential.user);
  console.log("✅ [AUTH SERVICE] User logged in:", user.email);
  return user;
};

export const logoutUser = async (): Promise<void> => {
  console.log("🔐 [AUTH SERVICE] Logging out");
  await signOut(auth);
  console.log("✅ [AUTH SERVICE] User logged out");
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
): (() => void) => {
  console.log("🔐 [AUTH SERVICE] Subscribing to auth changes");
  return onAuthStateChanged(auth, (firebaseUser) => {
    const user = firebaseUser ? mapFirebaseUser(firebaseUser) : null;
    console.log(
      "🔄 [AUTH] Auth state changed - User:",
      user ? user.email : "logged out"
    );
    callback(user);
  });
};

export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser;
  return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
};
