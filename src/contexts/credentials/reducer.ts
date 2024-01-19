import { CredentialsActionType } from "./enums";
import { ICredentialsAction, ICredentialsState } from "./types";

export function credentialsReducer(
  state: ICredentialsState,
  action: ICredentialsAction
): ICredentialsState {
  switch (action.type) {
    case CredentialsActionType.START_LOADING_CREDENTIALS: {
      return { ...state, isLoading: true };
    }
    case CredentialsActionType.LOAD_CREDENTIALS: {
      return { ...state, ...action.payload, isLoading: false };
    }
    case CredentialsActionType.ADD_NEW_CREDENTIALS: {
      return { ...state, credentials: [...state.credentials, action.payload] };
    }
    case CredentialsActionType.UPDATE_CREDENTIALS: {
      const id = action.payload.id;
      const updatedList = state.credentials.map((item) =>
        item.id !== id ? item : { ...item, ...action.payload.update }
      );
      return { ...state, credentials: updatedList };
    }
    case CredentialsActionType.DELETE_CREDENTIALS: {
      const id = action.payload.id;
      const updatedList = state.credentials.filter((item) => item.id !== id);
      return { ...state, credentials: updatedList };
    }
    case CredentialsActionType.UPDATE_ENCRYPTOR: {
      return { ...state, encryptor: action.payload.encryptor };
    }

    case CredentialsActionType.CLEAR_STATE: {
      return { credentials: [], isLoading: false, encryptor: undefined };
    }

    default:
      return state;
  }
}
