import { Encryptor } from "../../services/encryption";
import { CredentialsActionType } from "./enums";

export enum DataType {
  Note = "Note",
  Credentails = "Credentials",
  Both = "Credentials & Note",
}

export interface ICredentialsAddData {
  type: DataType;
  name: string;
  note: string;
  siteUrl: string;
  email: string;
  username: string;
  password: string;
}

export interface ICredentialsData extends ICredentialsAddData {
  id: string;
}

export interface ICredentialsState {
  isLoading: boolean;
  encryptor?: Encryptor;
  credentials: ICredentialsData[];
}

type CredentialsLoadingStartAction = {
  type: CredentialsActionType.START_LOADING_CREDENTIALS;
};

type CredentialsLoadAction = {
  type: CredentialsActionType.LOAD_CREDENTIALS;
  payload: Partial<ICredentialsState>;
};

type CredentialsAddAction = {
  type: CredentialsActionType.ADD_NEW_CREDENTIALS;
  payload: ICredentialsData;
};

type CredentialsUpdateAction = {
  type: CredentialsActionType.UPDATE_CREDENTIALS;
  payload: {
    id: string;
    update: ICredentialsAddData;
  };
};

type CredentialsDeleteAction = {
  type: CredentialsActionType.DELETE_CREDENTIALS;
  payload: {
    id: string;
  };
};

type UpdateEncryptorAction = {
  type: CredentialsActionType.UPDATE_ENCRYPTOR;
  payload: {
    encryptor: Encryptor;
  };
};

type ClearStateAction = {
  type: CredentialsActionType.CLEAR_STATE;
  payload?: undefined;
};

export type ICredentialsAction =
  | CredentialsLoadingStartAction
  | CredentialsLoadAction
  | CredentialsAddAction
  | CredentialsUpdateAction
  | CredentialsDeleteAction
  | UpdateEncryptorAction
  | ClearStateAction;
