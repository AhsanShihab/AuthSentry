import { useCallback, useEffect, useState } from "react";
import { AUTO_LOGOUT_TIMEOUT_SECONDS } from "../../constants";
import { useAuth } from "../../contexts/auth/provider";
import { logOut } from "../../services/firebase";
import { useVault } from "../../contexts/vault/provider";
import { VaultActionType } from "../../contexts/vault/enums";
import { AuthActionType } from "../../contexts/auth/enums";

function LogoutCountdownTime() {
  const [authState, authStateDispatch] = useAuth();
  const [, vaultDispatch] = useVault();
  const [remainingSeconds, setRemainingSeconds] = useState(
    AUTO_LOGOUT_TIMEOUT_SECONDS
  );

  const signOut = useCallback(async () => {
    await logOut();
    vaultDispatch({
      type: VaultActionType.CLEAR_STATE,
    });
    authStateDispatch({
      type: AuthActionType.LOGOUT_USER,
    });
  }, [vaultDispatch, authStateDispatch]);

  const getFormattedTime = () => {
    let time = "";
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);
    if (minutes <= 9) {
      time += "0";
    }
    time += minutes.toString() + ":";
    if (seconds <= 9) {
      time += "0";
    }
    time += seconds.toString();

    return time;
  };

  useEffect(() => {
    const reset = setInterval(() => {
      const signInTime = authState.loggedInTime;
      const currentTime = Date.now();
      const elapsedTime = currentTime - signInTime;
      const remains = AUTO_LOGOUT_TIMEOUT_SECONDS * 1000 - elapsedTime;
      const remainingSecondss = Math.max(remains / 1000, 0);
      if (remainingSecondss === 0) {
        signOut();
      }
      setRemainingSeconds(remainingSecondss);
    }, 1000);

    return () => clearInterval(reset);
  }, [authState.loggedInTime, signOut]);

  return (
    <p>
      <small className="text-muted mb-0">
        Automatic logout in: {getFormattedTime()}
      </small>
      <br />
      <small className="text-muted mt-0">
        You will be logged out if you reload or close this window.
      </small>
    </p>
  );
}

export default LogoutCountdownTime;
