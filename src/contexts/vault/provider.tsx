import React, { useContext, useReducer } from "react";
import { credentialsReducer } from "./reducer";
import { CredentialsContext } from "./context";
import { ICredentialsState } from "./types";

const initialState: ICredentialsState = {
  isLoading: true,
  encryptor: undefined,
  credentials: [],
};

export function CredentialsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [credentials, dispatch] = useReducer(credentialsReducer, initialState);

  return (
    <CredentialsContext.Provider value={[credentials, dispatch]}>
      {children}
    </CredentialsContext.Provider>
  );
}

export function useCredentials() {
  const context = useContext(CredentialsContext);
  if (!context) {
    throw new Error("Credentials context is not available on this component");
  }
  return context;
}
