import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { nanoid } from "nanoid";

const COLLECTION = "invites";

/**
 * Create a new invite with a random short code.
 * @param {{ groupId: string, schoolId: string, createdBy: string }} data
 * @returns {Promise<string>} invite code
 */
export async function createInvite({ groupId, schoolId, createdBy }) {
  const code = nanoid(8); // e.g. "aB3kR7xQ"
  await setDoc(doc(db, COLLECTION, code), {
    groupId,
    schoolId,
    createdBy,
    createdAt: serverTimestamp(),
  });
  return code;
}

/**
 * Fetch an invite by its code.
 * @param {string} code
 * @returns {Promise<{ code: string, groupId: string, schoolId: string, createdBy: string, createdAt: any } | null>}
 */
export async function getInvite(code) {
  const snap = await getDoc(doc(db, COLLECTION, code));
  if (!snap.exists()) return null;
  return { code: snap.id, ...snap.data() };
}

/**
 * Delete (consume) an invite after use.
 * @param {string} code
 */
export async function deleteInvite(code) {
  await deleteDoc(doc(db, COLLECTION, code));
}

/**
 * Resolve an invite code and return the invite data,
 * or null if the code is invalid / expired.
 * @param {string} code
 */
export async function resolveInvite(code) {
  return getInvite(code.trim());
}
