import { Encryptor } from "../../services/encryption";
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
}

export interface IVaultItemData extends IVaultItemAddData {
  id: string;
}

export interface IVaultState {
  isLoading: boolean;
  encryptor?: Encryptor;
  items: IVaultItemData[];
}

type VaultLoadingStartAction = {
  type: VaultActionType.START_LOADING_VAULT;
};

type VaultLoadAction = {
  type: VaultActionType.LOAD_VAULT;
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

type UpdateEncryptorAction = {
  type: VaultActionType.UPDATE_ENCRYPTOR;
  payload: {
    encryptor: Encryptor;
  };
};

type ClearStateAction = {
  type: VaultActionType.CLEAR_STATE;
  payload?: undefined;
};

export type IVaultAction =
  | VaultLoadingStartAction
  | VaultLoadAction
  | VaultItemAddAction
  | VaultItemUpdateAction
  | VaultItemDeleteAction
  | UpdateEncryptorAction
  | ClearStateAction;
