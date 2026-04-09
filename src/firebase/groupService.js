import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "groups";

/**
 * Create a new group.
 * @param {{ name: string, schoolId: string, teacherId: string }} data
 * @returns {Promise<string>} groupId
 */
export async function createGroup({ name, schoolId, teacherId }) {
  const ref = await addDoc(collection(db, COLLECTION), {
    name,
    schoolId,
    teacherId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch a single group by ID.
 */
export async function getGroup(groupId) {
  const snap = await getDoc(doc(db, COLLECTION, groupId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Fetch all groups belonging to a school.
 * @param {string} schoolId
 */
export async function getGroupsBySchool(schoolId) {
  const q = query(collection(db, COLLECTION), where("schoolId", "==", schoolId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch all groups taught by a specific teacher.
 * @param {string} teacherId
 */
export async function getGroupsByTeacher(teacherId) {
  const q = query(collection(db, COLLECTION), where("teacherId", "==", teacherId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Update a group's fields.
 * @param {string} groupId
 * @param {Partial<{ name: string }>} updates
 */
export async function updateGroup(groupId, updates) {
  await updateDoc(doc(db, COLLECTION, groupId), updates);
}

/**
 * Delete a group document.
 * @param {string} groupId
 */
export async function deleteGroup(groupId) {
  await deleteDoc(doc(db, COLLECTION, groupId));
}

/**
 * Add a student UID to a user's groupIds array.
 * (Updates the users doc, not the group doc — groups don't store member lists.)
 * Call this after a student joins via invite.
 * @param {string} uid
 * @param {string} groupId
 */
export async function addStudentToGroup(uid, groupId) {
  await updateDoc(doc(db, "users", uid), {
    groupIds: arrayUnion(groupId),
  });
}

/**
 * Remove a student UID from their groupIds array.
 * @param {string} uid
 * @param {string} groupId
 */
export async function removeStudentFromGroup(uid, groupId) {
  await updateDoc(doc(db, "users", uid), {
    groupIds: arrayRemove(groupId),
  });
}
