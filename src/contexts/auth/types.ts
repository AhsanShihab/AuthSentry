import { AuthActionType } from "./enums";

export interface IAuthState {
  isLoading: boolean;
  user: {
    userInfo: {
      uid: string;
      email: string;
      password: string;
    };
  } | null;
  loggedInTime: number;
}

type LoadUserActionType = {
  type: AuthActionType.LOAD_USER;
  payload: IAuthState["user"];
};

type LogoutUserActionType = {
  type: AuthActionType.LOGOUT_USER;
};

export type IAuthAction = LoadUserActionType | LogoutUserActionType;
