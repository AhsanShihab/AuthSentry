import { useCallback, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { logOut } from "../../services/firebase";
import * as vaultService from "../../services/vault";
import {
  DownloadIcon,
  KeyIcon,
  LogoutIcon,
  RefreshIcon,
  SecretIcon,
  VerticalElipsisIcon,
} from "../Common/Icons";
import { useCredentials } from "../../contexts/credentials/provider";
import { useAuth } from "../../contexts/auth/provider";
import { CredentialsActionType } from "../../contexts/credentials/enums";
import { AuthActionType } from "../../contexts/auth/enums";
import { AUTO_LOGOUT_TIMEOUT_SECONDS } from "../../constants";
import AddPassword from "./AddPassword";
import DownloadModal from "./DownloadModal";
import ChangeMasterPasswordModal from "./ChangeMasterPasswordModal";
import ChangeSecretModal from "./ChangeSecretModal";
import VaultItemList from "./VaultItemList";

function Home() {
  const [authState, authStateDispatch] = useAuth();
  const [credentials, credentialsDispatch] = useCredentials();
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showMasterPasswordUpdateModal, setShowMasterPasswordUpdateModal] =
    useState(false);
  const [showSecretChangeModal, setShowSecretChangeModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    AUTO_LOGOUT_TIMEOUT_SECONDS
  );

  const refreshList = async () => {
    const encryptor = credentials.encryptor!;
    const isEncryptorValid = await vaultService.checkValidityOfEncryptionKey(
      encryptor
    );
    if (!isEncryptorValid) {
      // TODO
      return;
    }
    credentialsDispatch({
      type: CredentialsActionType.START_LOADING_CREDENTIALS,
    });
    const credentialsList = await vaultService.listCredentials(encryptor);
    credentialsDispatch({
      type: CredentialsActionType.LOAD_CREDENTIALS,
      payload: {
        credentials: credentialsList,
      },
    });
  };

  const signOut = useCallback(async () => {
    await logOut();
    credentialsDispatch({
      type: CredentialsActionType.CLEAR_STATE,
    });
    authStateDispatch({
      type: AuthActionType.LOGOUT_USER,
    });
  }, [credentialsDispatch, authStateDispatch]);

  const handleSecretChange = async () => {
    setShowSecretChangeModal(true);
  };

  const handleMasterPasswordChange = async () => {
    setShowMasterPasswordUpdateModal(true);
  };

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  const hidePasswordAddModal = () => setShowAddNewModal(false);

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
    <Container className="pb-5">
      <Row className="mt-3">
        <Col md={{ offset: 2, span: 8 }}>
          <div className="d-flex flex-row mt-3 mb-5">
            <img src="/logo192.png" alt="logo" width={128} height={128} />
            <div>
              <h1 className="mt-3">AuthSentry</h1>
              <h5> Your Fortress of Security</h5>
            </div>
          </div>
          <Row>
            <Col>
              <p>
                <small className="text-muted mb-0">
                  Automatic logout in: {getFormattedTime()}
                </small>
                <br />
                <small className="text-muted mt-0">
                  You will be logged out if you reload or close this window.
                </small>
              </p>
            </Col>
          </Row>
          <Row>
            <Col className="d-flex flex-row-reverse">
              <Dropdown align="start">
                <Dropdown.Toggle variant="outline-secondary">
                  <VerticalElipsisIcon />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as="button" onClick={refreshList}>
                    <span className="me-2">
                      <RefreshIcon />
                    </span>{" "}
                    Refresh List
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={handleDownload}>
                    <span className="me-2">
                      <DownloadIcon />
                    </span>{" "}
                    Download Data
                  </Dropdown.Item>
                  <Dropdown.Item
                    as="button"
                    onClick={handleMasterPasswordChange}
                  >
                    <span className="me-2">
                      <KeyIcon />
                    </span>{" "}
                    Change Master Password
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={handleSecretChange}>
                    <span className="me-2">
                      <SecretIcon />
                    </span>{" "}
                    Change Secret
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={signOut}>
                    <span className="me-2">
                      <LogoutIcon />
                    </span>{" "}
                    Log out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button
                className="me-1"
                variant="outline-secondary"
                onClick={() => setShowAddNewModal(true)}
              >
                + New
              </Button>
            </Col>
          </Row>

          <VaultItemList />
          <AddPassword
            isOpen={showAddNewModal}
            hideModal={hidePasswordAddModal}
          />
          <DownloadModal
            show={showDownloadModal}
            toggle={() => setShowDownloadModal(!showDownloadModal)}
          />
          <ChangeMasterPasswordModal
            show={showMasterPasswordUpdateModal}
            closeModal={() => setShowMasterPasswordUpdateModal(false)}
          />
          <ChangeSecretModal
            show={showSecretChangeModal}
            closeModal={() => setShowSecretChangeModal(false)}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
