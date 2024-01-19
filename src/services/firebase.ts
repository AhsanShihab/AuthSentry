import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  push,
  update,
  get,
  child,
  remove,
} from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  inMemoryPersistence,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import "firebase/firestore";
import { ICredentialsData } from "../contexts/credentials/types";
import { META_INFO_ENCRYPTION_KEY_HASH_FIELD } from "../constants";


const firebaseConfig =
  process.env.NODE_ENV === "production"
    ? {
        apiKey: "AIzaSyD79wTgq_sZioGcgtZLRYc6NpXJ44OjHl0",
        authDomain: "authsentry.firebaseapp.com",
        databaseURL:
          "https://authsentry-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "authsentry",
        storageBucket: "authsentry.appspot.com",
        messagingSenderId: "181560378156",
        appId: "1:181560378156:web:ec3705d83b31fc513fe289",
      }
    : {
        apiKey: "AIzaSyDv7o0acOLkjnQsd95TyynnCu-F9oPVUk0",
        authDomain: "try-firebase-e6e74.firebaseapp.com",
        databaseURL:
          "https://try-firebase-e6e74-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "try-firebase-e6e74",
        storageBucket: "try-firebase-e6e74.appspot.com",
        messagingSenderId: "524431787845",
        appId: "1:524431787845:web:da6ac9c08f5afd5f14202c",
      };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export async function signUp(email: string, password: string) {
  await auth.setPersistence(inMemoryPersistence);
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

export async function logIn(email: string, password: string) {
  await auth.setPersistence(inMemoryPersistence);
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

export async function logOut() {
  return signOut(auth);
}

export async function verifyPassword(password: string) {
  const credential = EmailAuthProvider.credential(
    auth.currentUser!.email!,
    password
  );
  return await reauthenticateWithCredential(auth.currentUser!, credential);
}

export async function updateMasterPassword(newPassword: string) {
  return await updatePassword(auth.currentUser!, newPassword);
}

function getCurrentUserId() {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error("User is not loggedin");
  }
  return userId;
}

export async function listCredentials() {
  const userId = getCurrentUserId();
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, `users/${userId}/credentials`));
  const credentialsList: ICredentialsData[] = [];
  snapshot.forEach((doc) => {
    credentialsList.push({
      id: doc.key,
      ...doc.val(),
    });
  });
  return credentialsList;
}

export async function createBackup() {
  const userId = getCurrentUserId();
  const credList = await listCredentials();
  const formatted: any = {};
  credList.forEach((item) => {
    const { id, ...data } = item;
    formatted[id] = data;
  });

  const db = getDatabase();
  const metaInfo = await getMetaInfo();
  const updates: any = {};
  updates[`/users/${userId}/metaInfo-backup`] = metaInfo;
  updates[`/users/${userId}/credentials-backup`] = formatted;
  await update(ref(db), updates);
}

export async function restoreBackup() {
  const userId = getCurrentUserId();
  const db = getDatabase();
  const dbRef = ref(db);
  const credsBackupSnapshot = await get(
    child(dbRef, `users/${userId}/credentials-backup`)
  );
  const credsBackup = credsBackupSnapshot.val();

  const metaInfoBackupSnapshot = await get(
    child(dbRef, `users/${userId}/metaInfo-backup`)
  );
  const metaInfoBackup = metaInfoBackupSnapshot.val();
  const updates: any = {};
  updates[`/users/${userId}/metaInfo`] = metaInfoBackup;
  updates[`/users/${userId}/credentials`] = credsBackup;
  await update(ref(db), updates);
}

export async function deleteBackup() {
  const userId = getCurrentUserId();
  const db = getDatabase();
  const credsBackupRef = ref(db, `users/${userId}/credentials-backup`);
  await remove(credsBackupRef);
  const metaInfoBackupRef = ref(db, `users/${userId}/metaInfo-backup`);
  await remove(metaInfoBackupRef);
}

export async function replaceAllCredentialsWithNewData(data: any, encryptionKeyHash: string) {
  const userId = getCurrentUserId();
  const db = getDatabase();
  const updates: any = {};
  updates[`/users/${userId}/credentials`] = data;
  updates[`/users/${userId}/metaInfo/${META_INFO_ENCRYPTION_KEY_HASH_FIELD}`] = encryptionKeyHash;
  await update(ref(db), updates);
}

export async function addCredentials(data: any) {
  const userId = getCurrentUserId();
  const db = getDatabase();
  const collectionRef = ref(db, `users/${userId}/credentials`);
  const newDocRef = push(collectionRef);
  await set(newDocRef, data);
  return newDocRef;
}

export async function updateCredentials(docId: string, data: any) {
  const userId = getCurrentUserId();
  const db = getDatabase();
  const updates: any = {};
  updates[`/users/${userId}/credentials/${docId}`] = data;
  await update(ref(db), updates);
}

export async function deleteCredentials(docId: string) {
  const userId = getCurrentUserId();
  const db = getDatabase();
  const docRef = ref(db, `users/${userId}/credentials/${docId}`);
  await remove(docRef);
}

export async function getMetaInfo() {
  const userId = getCurrentUserId();
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, `users/${userId}/metaInfo`));
  const metaInfo = snapshot.val() || {};
  return metaInfo;
}

export async function updateMetaInfo(field: string, value: any) {
  const userId = getCurrentUserId();
  const db = getDatabase();
  const updates: any = {};
  updates[`/users/${userId}/metaInfo/${field}`] = value;
  await update(ref(db), updates);
}
