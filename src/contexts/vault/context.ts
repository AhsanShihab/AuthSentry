import { createContext } from "react";
import { IVaultAction, IVaultState } from "./types";

type VaultContextType = [
  IVaultState,
  React.Dispatch<IVaultAction>
];

export const VaultContext = createContext<VaultContextType | null>(
  null
);
