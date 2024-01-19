import { User } from "firebase/auth";
import { AuthActionType } from "./enums";

export interface IAuthState {
  isLoading: boolean;
  user: { userInfo: User } | null;
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
