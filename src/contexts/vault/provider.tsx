import React, { useContext, useReducer } from "react";
import { vaultReducer } from "./reducer";
import { VaultContext } from "./context";
import { IVaultState } from "./types";

const initialState: IVaultState = {
  isLoading: true,
  items: [],
};

export function VaultContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [vault, dispatch] = useReducer(vaultReducer, initialState);

  return (
    <VaultContext.Provider value={[vault, dispatch]}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("Vault context is not available on this component");
  }
  return context;
}
