import { VaultActionType } from "./enums";

export enum DataType {
  Note = "Note",
  Credentails = "Credentials",
  Both = "Credentials & Note",
}

export interface IVaultItemAddData {
  type: DataType;
  name: string;
  note: string;
  siteUrl: string;
  email: string;
  username: string;
  password: string;
  passwordUpdatedAt: number | null;
}

export interface IEncryptedData extends IVaultItemAddData {
  encryptorVersion: string;
}

export interface IVaultItemData extends IEncryptedData {
  id: string;
}

export interface IVaultState {
  isLoading: boolean;
  items: IVaultItemData[];
}

type VaultLoadingStartAction = {
  type: VaultActionType.START_LOADING_VAULT;
};

type VaultLoadAction = {
  type: VaultActionType.LOAD_VAULT;
  payload: Partial<IVaultState>;
};

type VaultBatchLoadAction = {
  type: VaultActionType.LOAD_ITEMS_IN_BATCH;
  payload: Partial<IVaultState>;
};

type VaultItemAddAction = {
  type: VaultActionType.ADD_NEW_VAULT_ITEM;
  payload: IVaultItemData;
};

type VaultItemUpdateAction = {
  type: VaultActionType.UPDATE_VAULT_ITEM;
  payload: {
    id: string;
    update: IVaultItemAddData;
  };
};

type VaultItemDeleteAction = {
  type: VaultActionType.DELETE_VAULT_ITEM;
  payload: {
    id: string;
  };
};

type ClearStateAction = {
  type: VaultActionType.CLEAR_STATE;
};

export type IVaultAction =
  | VaultLoadingStartAction
  | VaultLoadAction
  | VaultBatchLoadAction
  | VaultItemAddAction
  | VaultItemUpdateAction
  | VaultItemDeleteAction
  | ClearStateAction;
