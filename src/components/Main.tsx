import Authentication from "./GuestView/Authentication";
import Home from "./UserView/Home";
import { useAuth } from "../contexts/auth/provider";
import { usePWAContext } from "../contexts/pwa/provider";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { useState } from "react";

function Main() {
  const [authState] = useAuth();
  const [isInstalled, install] = usePWAContext();
  const [showInstallMessage, setShowInstallMessage] = useState(true);

  return (
    <div>
      {!isInstalled && showInstallMessage && (
        <Alert variant="primary d-block d-md-flex justify-content-center align-items-center gap-1 rounded-0" dismissible onClose={() => setShowInstallMessage(false)}>
          You can install AuthSentry on your device for easier access.{" "}
          <Button variant="outline-secondary" onClick={install}>Install App</Button>
        </Alert>
      )}
      {authState.isLoading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <h1 className="display-1">AuthSentry</h1>
        </div>
      ) : authState.user ? (
        <Home />
      ) : (
        <Authentication />
      )}
    </div>
  );
}

export default Main;
