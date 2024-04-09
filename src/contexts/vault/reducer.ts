import { VaultActionType } from "./enums";
import { IVaultAction, IVaultState } from "./types";

export function vaultReducer(
  state: IVaultState,
  action: IVaultAction
): IVaultState {
  switch (action.type) {
    case VaultActionType.START_LOADING_VAULT: {
      return { ...state, isLoading: true };
    }
    case VaultActionType.LOAD_VAULT: {
      return { ...state, ...action.payload, isLoading: false };
    }
    case VaultActionType.ADD_NEW_VAULT_ITEM: {
      return { ...state, items: [...state.items, action.payload] };
    }
    case VaultActionType.UPDATE_VAULT_ITEM: {
      const id = action.payload.id;
      const updatedList = state.items.map((item) =>
        item.id !== id ? item : { ...item, ...action.payload.update }
      );
      return { ...state, items: updatedList };
    }
    case VaultActionType.DELETE_VAULT_ITEM: {
      const id = action.payload.id;
      const updatedList = state.items.filter((item) => item.id !== id);
      return { ...state, items: updatedList };
    }
    case VaultActionType.UPDATE_ENCRYPTOR: {
      return { ...state, encryptor: action.payload.encryptor };
    }

    case VaultActionType.CLEAR_STATE: {
      return { items: [], isLoading: false, encryptor: undefined };
    }

    default:
      return state;
  }
}
