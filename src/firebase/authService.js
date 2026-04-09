import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

/**
 * Register a new user and create their Firestore profile.
 * @param {{ email: string, password: string, name: string, role: "teacher"|"student", schoolId?: string }} params
 */
export async function signUp({ email, password, name, role, schoolId = null }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", user.uid), {
    name,
    email: user.email,
    role,
    schoolId,
    groupIds: [],
    createdAt: serverTimestamp(),
  });

  return user;
}

/**
 * Sign in with email and password.
 */
export async function signIn({ email, password }) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Sign the current user out.
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Send a password-reset email.
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
