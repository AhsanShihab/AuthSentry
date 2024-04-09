/*
Q:  Why am I making direct REST api calls to firebase instead of using the firebase sdk package?
A:  I initially did use the SDK. But then I noticed the app got injected with some google tracker,
    of which I had no idea. For a security focused app, like a password manager,
    having an unknown tracker is not acceptable. So I removed the package, and
    reimplemented it using the direct REST API calls.
*/

import axios, { AxiosError } from "axios";
import { IVaultItemData } from "../contexts/vault/types";
import { META_INFO_ENCRYPTION_KEY_HASH_FIELD } from "../constants";
import firebaseConfigDev from "../config/firebase_config_dev.json";
import firebaseConfigProd from "../config/firebase_config_prod.json";

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

const firebaseConfig =
  process.env.NODE_ENV === "production"
    ? firebaseConfigProd
    : firebaseConfigDev;

const FIREBASE_AUTH_ENDPOINT = "https://identitytoolkit.googleapis.com/v1";
const apiKey = firebaseConfig.apiKey;
const databaseURL = firebaseConfig.databaseURL;

let currentUserEmail: string | null = null;
let currentUserPassword: string | null = null;
let currentIdToken: string | null = null;
let currentRefreshToken: string | null = null;
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

    const { idToken, refreshToken, localId: userId } = res.data;
    currentIdToken = idToken;
    currentRefreshToken = refreshToken;
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

    const { idToken, refreshToken, localId: userId } = res.data;
    currentUserEmail = email;
    currentIdToken = idToken;
    currentRefreshToken = refreshToken;
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

export async function logOut() {
  currentIdToken = null;
  currentRefreshToken = null;
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

  const { idToken, refreshToken } = res.data;
  currentIdToken = idToken;
  currentRefreshToken = refreshToken;
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


export async function migrateDatabaseFromCredentialsToVault() {
  const { data } = await axios.get(
    `${databaseURL}/users/${getCurrentUserId()}/credentials.json?auth=${currentIdToken}`
  );
  if (!data) {
    return;
  }
  await axios.put(
    `${databaseURL}/users/${getCurrentUserId()}/vault.json?auth=${currentIdToken}`,
    data
  );
  await axios.delete(
    `${databaseURL}/users/${getCurrentUserId()}/credentials.json?auth=${currentIdToken}`
  );
}
