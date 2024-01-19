import { AuthActionType } from "./enums";
import { IAuthAction, IAuthState } from "./types";

export function authReducer(
  state: IAuthState,
  action: IAuthAction
): IAuthState {
  switch (action.type) {
    case AuthActionType.LOAD_USER: {
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        loggedInTime: Date.now(),
      };
    }
    case AuthActionType.LOGOUT_USER: {
      return { isLoading: false, user: null, loggedInTime: 0 };
    }
    default:
      return state;
  }
}
