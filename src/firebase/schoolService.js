import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "schools";

/**
 * Create a new school.
 * @param {{ name: string }} data
 * @returns {Promise<string>} schoolId
 */
export async function createSchool({ name }) {
  const ref = await addDoc(collection(db, COLLECTION), {
    name,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch a single school by ID.
 * @param {string} schoolId
 * @returns {Promise<{ id: string, name: string, createdAt: any } | null>}
 */
export async function getSchool(schoolId) {
  const snap = await getDoc(doc(db, COLLECTION, schoolId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Update a school's fields.
 * @param {string} schoolId
 * @param {Partial<{ name: string }>} updates
 */
export async function updateSchool(schoolId, updates) {
  await updateDoc(doc(db, COLLECTION, schoolId), updates);
}

/**
 * Delete a school document.
 * @param {string} schoolId
 */
export async function deleteSchool(schoolId) {
  await deleteDoc(doc(db, COLLECTION, schoolId));
}
