import React, { useContext, useReducer } from "react";
import { authReducer } from "./reducer";
import { AuthContext } from "./context";
import { IAuthState } from "./types";

const initialState: IAuthState = {
  isLoading: false,
  user: null,
  loggedInTime: 0,
};

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={[auth, dispatch]}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthContext is not available to this component");
  }
  return context;
}
