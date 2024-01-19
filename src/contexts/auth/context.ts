import { createContext } from "react";
import { IAuthAction, IAuthState } from "./types";

type AuthContextType = [IAuthState, React.Dispatch<IAuthAction>];
export const AuthContext = createContext<AuthContextType | null>(null);
