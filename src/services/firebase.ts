/*
Q:  Why am I using REST API instead of the firebase sdk package?
A:  Firebase SDK was injecting the app with some google trackers. To keep this app tracker free,
    I removed the SDK and reimplemented them using the REST API endpoints.
*/

import axios, { AxiosError } from "axios";
import { IVaultItemData } from "../contexts/vault/types";
import { META_INFO_ENCRYPTION_KEY_HASH_FIELD } from "../constants";

interface FirebaseErrorResponse {
  error?: { errors?: { message: string }[] };
}

class FirebaseStyleError extends Error {
  code?: string;
  constructor(message?: string, code?: string) {
    super(message);
    this.code = code;
  }
}

const FIREBASE_AUTH_ENDPOINT = "https://identitytoolkit.googleapis.com/v1";
const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
const databaseURL = process.env.REACT_APP_FIREBASE_REALTIME_DATABASE_URL;

let currentUserEmail: string | null = null;
let currentUserPassword: string | null = null;
let currentIdToken: string | null = null;
let currentUserId: string | null = null;

const throwFirebaseStyleError = (err: AxiosError) => {
  const firebaseError = new FirebaseStyleError(err.message);
  if (err.code === "ERR_NETWORK") {
    firebaseError.code = "auth/network-request-failed";
  }
  const errorDetails = (err.response?.data as FirebaseErrorResponse).error
    ?.errors;
  if (errorDetails && errorDetails.length) {
    if (errorDetails[0].message === "EMAIL_EXISTS") {
      firebaseError.code = "auth/email-already-in-use";
    } else if (errorDetails[0].message === "INVALID_EMAIL") {
      firebaseError.code = "auth/invalid-email";
    } else if (errorDetails[0].message === "INVALID_LOGIN_CREDENTIALS") {
      firebaseError.code = "auth/invalid-credential";
    }
  }
  throw firebaseError;
};

export const getCurrentUser = () => {
  if (!currentUserId) return null;
  return {
    uid: currentUserId,
    email: currentUserEmail!,
    password: currentUserPassword!,
  };
};

export async function signUp(email: string, password: string) {
  try {
    const res = await axios.post(
      `${FIREBASE_AUTH_ENDPOINT}/accounts:signUp?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken, localId: userId } = res.data;
    currentIdToken = idToken;
    currentUserId = userId;
    currentUserEmail = email;
    currentUserPassword = password;
  } catch (err) {
    if (err instanceof AxiosError) {
      throwFirebaseStyleError(err);
    } else {
      throw err;
    }
  }
}

export async function logIn(email: string, password: string) {
  try {
    const res = await axios.post(
      `${FIREBASE_AUTH_ENDPOINT}/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken, localId: userId } = res.data;
    currentUserEmail = email;
    currentIdToken = idToken;
    currentUserId = userId;
    currentUserPassword = password;
  } catch (err) {
    if (err instanceof AxiosError) {
      throwFirebaseStyleError(err);
    } else {
      throw err;
    }
  }
}

export function logOut() {
  currentIdToken = null;
  currentUserId = null;
  currentUserEmail = null;
  currentUserPassword = null;
}

export async function verifyPassword(password: string) {
  return await logIn(currentUserEmail!, password);
}

export async function updateMasterPassword(newPassword: string) {
  const res = await axios.post(
    `${FIREBASE_AUTH_ENDPOINT}/accounts:update?key=${apiKey}`,
    {
      idToken: currentIdToken,
      password: newPassword,
      returnSecureToken: true,
    }
  );

  const { idToken } = res.data;
  currentIdToken = idToken;
  currentUserPassword = newPassword;
}

function getCurrentUserId() {
  if (!currentUserId) {
    throw new Error("User is not loggedin");
  }
  return currentUserId;
}

export async function listVaultItems() {
  const vaultItemList: IVaultItemData[] = [];
  const { data } = await axios.get(
    `${databaseURL}/users/${getCurrentUserId()}/vault.json?auth=${currentIdToken}`
  );
  for (let key in data) {
    vaultItemList.push({
      id: key,
      ...data[key],
    });
  }
  return vaultItemList;
}

export async function createBackup() {
  const { data } = await axios.get(
    `${databaseURL}/users/${getCurrentUserId()}.json?auth=${currentIdToken}`
  );
  const { vault, metaInfo } = data;
  await axios.patch(
    `${databaseURL}/users/${getCurrentUserId()}.json?auth=${currentIdToken}`,
    {
      "vault-backup": vault,
      "metaInfo-backup": metaInfo,
    }
  );
}

export async function restoreBackup() {
  const { data } = await axios.get(
    `${databaseURL}/users/${getCurrentUserId()}.json?auth=${currentIdToken}`
  );
  const vault = data["vault-backup"];
  const metaInfo = data["metaInfo-backup"];
  await axios.patch(
    `${databaseURL}/users/${getCurrentUserId()}.json?auth=${currentIdToken}`,
    {
      vault,
      metaInfo,
    }
  );
}

export async function deleteBackup() {
  await axios.delete(
    `${databaseURL}/users/${getCurrentUserId()}/vault-backup.json?auth=${currentIdToken}`
  );
  await axios.delete(
    `${databaseURL}/users/${getCurrentUserId()}/metaInfo-backup.json?auth=${currentIdToken}`
  );
}

export async function replaceVaultWithNewData(
  data: any,
  encryptionKeyHash: string
) {
  await axios.patch(
    `${databaseURL}/users/${getCurrentUserId()}.json?auth=${currentIdToken}`,
    {
      vault: data,
    }
  );
  await axios.patch(
    `${databaseURL}/users/${getCurrentUserId()}/metaInfo.json?auth=${currentIdToken}`,
    {
      [META_INFO_ENCRYPTION_KEY_HASH_FIELD]: encryptionKeyHash,
    }
  );
}

export async function addVaultItem(data: any) {
  const res = await axios.post(
    `${databaseURL}/users/${getCurrentUserId()}/vault.json?auth=${currentIdToken}`,
    data
  );
  return { key: res.data.name };
}

export async function updateVaultItem(docId: string, data: any) {
  await axios.put(
    `${databaseURL}/users/${getCurrentUserId()}/vault/${docId}.json?auth=${currentIdToken}`,
    data
  );
}

export async function deleteVaultItem(docId: string) {
  await axios.delete(
    `${databaseURL}/users/${getCurrentUserId()}/vault/${docId}.json?auth=${currentIdToken}`
  );
}

export async function getMetaInfo() {
  const res = await axios.get(
    `${databaseURL}/users/${getCurrentUserId()}/metaInfo.json?auth=${currentIdToken}`
  );
  return res.data || {};
}

export async function updateMetaInfo(field: string, value: any) {
  await axios.patch(
    `${databaseURL}/users/${getCurrentUserId()}/metaInfo.json?auth=${currentIdToken}`,
    { [field]: value }
  );
}
