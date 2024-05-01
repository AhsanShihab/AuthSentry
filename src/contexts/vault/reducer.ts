import { VaultActionType } from "./enums";
import { IVaultAction, IVaultState } from "./types";

export function vaultReducer(
  state: IVaultState,
  action: IVaultAction
): IVaultState {
  switch (action.type) {
    case VaultActionType.START_LOADING_VAULT: {
      return { ...state, items: [], isLoading: true };
    }
    case VaultActionType.LOAD_VAULT: {
      return { ...state, ...action.payload, isLoading: false };
    }
    case VaultActionType.LOAD_ITEMS_IN_BATCH: {
      let items = state.items;
      const existingItemIds = items.map((item) => item.id);
      for (const item of action.payload.items || []) {
        if (!existingItemIds.includes(item.id)) {
          items.push(item);
        }
      }
      return { ...state, ...action.payload, items };
    }
    case VaultActionType.ADD_NEW_VAULT_ITEM: {
      const newItemsList = [...state.items, action.payload]
      newItemsList.sort((a, b) => a.name > b.name ? 1 : -1);
      return { ...state, items: newItemsList };
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

    case VaultActionType.CLEAR_STATE: {
      return { items: [], isLoading: false };
    }

    default:
      return state;
  }
}
