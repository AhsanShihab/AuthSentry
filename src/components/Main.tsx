import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Authentication from "./GuestView/Authentication";
import Home from "./UserView/Home";
import { VaultContextProvider } from "../contexts/vault/provider";
import { useAuth } from "../contexts/auth/provider";
import { usePWAContext } from "../contexts/pwa/provider";

function Main() {
  const [authState] = useAuth();
  const [isInstalled, install] = usePWAContext();
  const [showInstallMessage, setShowInstallMessage] = useState(true);

  return (
    <div>
      {!isInstalled && showInstallMessage && (
        <Alert
          className="d-block d-md-flex justify-content-center align-items-center gap-1 rounded-0"
          variant="primary"
          dismissible
          onClose={() => setShowInstallMessage(false)}
        >
          You can install AuthSentry on your device for easier access.{" "}
          <Button variant="outline-secondary" onClick={install}>
            Install App
          </Button>
        </Alert>
      )}
      {authState.isLoading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <h1 className="display-1">AuthSentry</h1>
        </div>
      ) : authState.user ? (
        <VaultContextProvider>
          <Home />
        </VaultContextProvider>
      ) : (
        <Authentication />
      )}
    </div>
  );
}

export default Main;
