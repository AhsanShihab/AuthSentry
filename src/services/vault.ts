import { META_INFO_ENCRYPTION_KEY_HASH_FIELD } from "../constants";
import {
  ICredentialsAddData,
  ICredentialsData,
} from "../contexts/credentials/types";
import { Encryptor, InvalidEncryptorError } from "./encryption";
import * as firebase from "./firebase";

const decryptData = async (
  data: ICredentialsData,
  encryptor: Encryptor
): Promise<ICredentialsData> => {
  const [name, note, email, password, username, siteUrl] = await Promise.all([
    encryptor.decrypt(data.name),
    data.note ? encryptor.decrypt(data.note) : Promise.resolve(""),
    data.email ? encryptor.decrypt(data.email) : Promise.resolve(""),
    data.password ? encryptor.decrypt(data.password) : Promise.resolve(""),
    data.username ? encryptor.decrypt(data.username) : Promise.resolve(""),
    data.siteUrl ? encryptor.decrypt(data.siteUrl) : Promise.resolve(""),
  ]);
  return {
    id: data.id,
    type: data.type,
    name,
    note,
    email,
    password,
    username,
    siteUrl,
  };
};

const encryptData = async (
  data: ICredentialsAddData,
  encryptor: Encryptor
): Promise<ICredentialsAddData> => {
  const [name, note, email, password, username, siteUrl] = await Promise.all([
    encryptor.encrypt(data.name),
    data.note ? encryptor.encrypt(data.note) : Promise.resolve(""),
    data.email ? encryptor.encrypt(data.email) : Promise.resolve(""),
    data.password ? encryptor.encrypt(data.password) : Promise.resolve(""),
    data.username ? encryptor.encrypt(data.username) : Promise.resolve(""),
    data.siteUrl ? encryptor.encrypt(data.siteUrl) : Promise.resolve(""),
  ]);
  return { type: data.type, name, note, email, password, username, siteUrl };
};

export const addCredential = async (
  data: ICredentialsAddData,
  encryptor: Encryptor
): Promise<ICredentialsData> => {
  const isValidEncryptor = await checkValidityOfEncryptionKey(encryptor);
  if (!isValidEncryptor) {
    throw new InvalidEncryptorError();
  }
  const encryptedData = await encryptData(data, encryptor);
  const docReference = await firebase.addCredentials(encryptedData);

  return { ...data, id: docReference.key! };
};

export const updateCredentials = async (
  docId: string,
  data: ICredentialsAddData,
  encryptor: Encryptor
): Promise<void> => {
  const isValidEncryptor = await checkValidityOfEncryptionKey(encryptor);
  if (!isValidEncryptor) {
    throw new InvalidEncryptorError();
  }
  const encryptedData = await encryptData(data, encryptor);
  await firebase.updateCredentials(docId, encryptedData);
};

export const deleteCredentials = async (docId: string): Promise<void> => {
  await firebase.deleteCredentials(docId);
};

export const listCredentials = async (
  encryptor: Encryptor
): Promise<ICredentialsData[]> => {
  const isValidEncryptor = await checkValidityOfEncryptionKey(encryptor);
  if (!isValidEncryptor) {
    throw new InvalidEncryptorError();
  }
  const encryptedCredList = await firebase.listCredentials();
  const decryptedListPromise = encryptedCredList.map((data) =>
    decryptData(data, encryptor)
  );
  return await Promise.all(decryptedListPromise);
};

export const listEncryptedCredentials = async (): Promise<
  ICredentialsData[]
> => {
  const encryptedCredList = await firebase.listCredentials();
  return encryptedCredList;
};

export const reEncryptData = async (
  oldEncryptor: Encryptor,
  newEncryptor: Encryptor
) => {
  const credentialsList = await listCredentials(oldEncryptor);
  const reEncryptedDataPromise = credentialsList.map(async (item) => {
    const { id, ...data } = item;
    const encryptedData = await encryptData(data, newEncryptor);
    return {
      id,
      ...encryptedData,
    };
  });
  const reEncryptedCredsList = await Promise.all(reEncryptedDataPromise);
  const mappedData: Record<string, ICredentialsAddData> = {};
  reEncryptedCredsList.forEach((item) => {
    const { id, ...data } = item;
    mappedData[id] = data;
  });
  await Promise.all([
    firebase.updateMetaInfo(
      META_INFO_ENCRYPTION_KEY_HASH_FIELD,
      await newEncryptor.getEncryptionKeyHash()
    ),
    firebase.replaceAllCredentialsWithNewData(mappedData),
  ]);
};

export const restoreBackup = async () => {
  await firebase.restoreBackup();
};

export const checkValidityOfEncryptionKey = async (
  encryptor: Encryptor
): Promise<boolean> => {
  const metaInfo = await firebase.getMetaInfo();
  const encryptionKeyHashOnCloud =
    metaInfo[META_INFO_ENCRYPTION_KEY_HASH_FIELD];
  const encryptionKeyHashOnMemory = await encryptor.getEncryptionKeyHash();
  if (!encryptionKeyHashOnCloud) {
    await firebase.updateMetaInfo(
      META_INFO_ENCRYPTION_KEY_HASH_FIELD,
      encryptionKeyHashOnMemory
    );
    return true;
  } else {
    return encryptionKeyHashOnMemory === encryptionKeyHashOnCloud;
  }
};
