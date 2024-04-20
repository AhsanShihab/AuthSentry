import { META_INFO_ENCRYPTION_KEY_HASH_FIELD } from "../constants";
import { IVaultItemAddData, IVaultItemData } from "../contexts/vault/types";
import { Encryptor, InvalidEncryptorError } from "./encryption";
import * as firebase from "./firebase";

const decryptData = async (
  data: IVaultItemData,
  encryptor: Encryptor
): Promise<IVaultItemData> => {
  const [note, email, password, username, siteUrl] = await Promise.all([
    data.note ? encryptor.decrypt(data.note) : Promise.resolve(""),
    data.email ? encryptor.decrypt(data.email) : Promise.resolve(""),
    data.password ? encryptor.decrypt(data.password) : Promise.resolve(""),
    data.username ? encryptor.decrypt(data.username) : Promise.resolve(""),
    data.siteUrl ? encryptor.decrypt(data.siteUrl) : Promise.resolve(""),
  ]);
  return {
    id: data.id,
    type: data.type,
    name: data.name,
    passwordUpdatedAt: data.passwordUpdatedAt,
    note,
    email,
    password,
    username,
    siteUrl,
  };
};

const encryptData = async (
  data: IVaultItemAddData,
  encryptor: Encryptor
): Promise<IVaultItemAddData> => {
  const [note, email, password, username, siteUrl] = await Promise.all([
    data.note ? encryptor.encrypt(data.note) : Promise.resolve(""),
    data.email ? encryptor.encrypt(data.email) : Promise.resolve(""),
    data.password ? encryptor.encrypt(data.password) : Promise.resolve(""),
    data.username ? encryptor.encrypt(data.username) : Promise.resolve(""),
    data.siteUrl ? encryptor.encrypt(data.siteUrl) : Promise.resolve(""),
  ]);
  return {
    type: data.type,
    name: data.name,
    passwordUpdatedAt: data.passwordUpdatedAt,
    note,
    email,
    password,
    username,
    siteUrl,
  };
};

export const addVaultItem = async (
  data: IVaultItemAddData,
  encryptor: Encryptor
): Promise<IVaultItemData> => {
  const isValidEncryptor = await checkValidityOfEncryptionKey(encryptor);
  if (!isValidEncryptor) {
    throw new InvalidEncryptorError();
  }
  const encryptedData = await encryptData(data, encryptor);
  const docReference = await firebase.addVaultItem(encryptedData);

  return { ...data, id: docReference.key! };
};

export const updateVaultItem = async (
  docId: string,
  data: IVaultItemAddData,
  encryptor: Encryptor
): Promise<void> => {
  const isValidEncryptor = await checkValidityOfEncryptionKey(encryptor);
  if (!isValidEncryptor) {
    throw new InvalidEncryptorError();
  }
  const encryptedData = await encryptData(data, encryptor);
  await firebase.updateVaultItem(docId, encryptedData);
};

export const deleteVaultItem = async (docId: string): Promise<void> => {
  await firebase.deleteVaultItem(docId);
};

export async function* listVaultItemsGenerator(encryptor: Encryptor) {
  const isValidEncryptor = await checkValidityOfEncryptionKey(encryptor);
  if (!isValidEncryptor) {
    throw new InvalidEncryptorError();
  }
  const encryptedVaultItemList = await firebase.listVaultItems();
  encryptedVaultItemList.sort((a, b) => a.name > b.name ? 1 : -1);
  while (encryptedVaultItemList.length) {
    const batch = encryptedVaultItemList.splice(0, 10);
    const resultPromise = batch.map((item) => decryptData(item, encryptor));
    yield await Promise.all(resultPromise);
  }
}

const listVaultItems = async (
  encryptor: Encryptor
): Promise<IVaultItemData[]> => {
  const isValidEncryptor = await checkValidityOfEncryptionKey(encryptor);
  if (!isValidEncryptor) {
    throw new InvalidEncryptorError();
  }
  const encryptedVaultItemList = await firebase.listVaultItems();
  const decryptedListPromise = encryptedVaultItemList.map((data) =>
    decryptData(data, encryptor)
  );
  const decrypted = await Promise.all(decryptedListPromise);
  return decrypted;
};

export const listEncryptedVaultItems = async (): Promise<IVaultItemData[]> => {
  const encryptedVaultItemList = await firebase.listVaultItems();
  return encryptedVaultItemList;
};

export const reEncryptData = async (
  oldEncryptor: Encryptor,
  newEncryptor: Encryptor
) => {
  const vaultItemList = await listVaultItems(oldEncryptor);
  const reEncryptedDataPromise = vaultItemList.map(async (item) => {
    const { id, ...data } = item;
    const encryptedData = await encryptData(data, newEncryptor);
    return {
      id,
      ...encryptedData,
    };
  });
  const reEncryptedCredsList = await Promise.all(reEncryptedDataPromise);
  const mappedData: Record<string, IVaultItemAddData> = {};
  reEncryptedCredsList.forEach((item) => {
    const { id, ...data } = item;
    mappedData[id] = data;
  });
  const newEncryptionKeyHash = await newEncryptor.getEncryptionKeyHash();
  await firebase.replaceVaultWithNewData(mappedData, newEncryptionKeyHash);
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
