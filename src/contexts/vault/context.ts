import { createContext } from "react";
import { ICredentialsAction, ICredentialsState } from "./types";

type CredentialsContextType = [
  ICredentialsState,
  React.Dispatch<ICredentialsAction>
];

export const CredentialsContext = createContext<CredentialsContextType | null>(
  null
);
