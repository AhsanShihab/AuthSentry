import { useCallback, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Dropdown from "react-bootstrap/Dropdown";
import Placeholder from "react-bootstrap/Placeholder";
import { logOut } from "../../services/firebase";
import * as vaultService from "../../services/vault";
import {
  DownloadIcon,
  KeyIcon,
  LogoutIcon,
  RefreshIcon,
  SecretIcon,
  VaultIcon,
  VerticalElipsisIcon,
} from "../Common/Icons";
import { useCredentials } from "../../contexts/credentials/provider";
import { useAuth } from "../../contexts/auth/provider";
import { CredentialsActionType } from "../../contexts/credentials/enums";
import { AuthActionType } from "../../contexts/auth/enums";
import { AUTO_LOGOUT_TIMEOUT_SECONDS } from "../../constants";
import StoredItem from "./StoredItem";
import AddPassword from "./AddPassword";
import DownloadModal from "./DownloadModal";
import ChangeMasterPasswordModal from "./ChangeMasterPasswordModal";
import ChangeSecretModal from "./ChangeSecretModal";

function Home() {
  const [authState, authStateDispatch] = useAuth();
  const [credentials, credentialsDispatch] = useCredentials();
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showMasterPasswordUpdateModal, setShowMasterPasswordUpdateModal] =
    useState(false);
  const [showSecretChangeModal, setShowSecretChangeModal] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(
    AUTO_LOGOUT_TIMEOUT_SECONDS
  );

  const refreshList = async () => {
    const encryptor = credentials.encryptor!;
    credentialsDispatch({
      type: CredentialsActionType.START_LOADING_CREDENTIALS,
    });
    // TODO: check encryption key validity
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
    // ask new password
    // backup data
    // re-encrypt data with new password
    // update account password
    // update encryption key hash in the cloud
    // replace the database with newly encrypted data
    // update the encryptor in the credentials state
    // delete backup
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

  const filteredCredentialsList = credentials.credentials.filter((item) =>
    item.name.toLowerCase().includes(searchString.toLowerCase())
  );

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
          <Row className="mt-3">
            <Col>
              <Form>
                <Form.Control
                  type="text"
                  placeholder="Search ..."
                  value={searchString}
                  onChange={(e) => setSearchString(e.target.value)}
                />
              </Form>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Accordion>
                {credentials.isLoading ? (
                  <>
                    <Placeholder as={Accordion.Item} xs={12} eventKey="1">
                      <Placeholder as={Accordion.Header} animation="glow">
                        <Placeholder xs={6} />
                      </Placeholder>
                    </Placeholder>
                    <Placeholder as={Accordion.Item} xs={12} eventKey="2">
                      <Placeholder as={Accordion.Header} animation="glow">
                        <Placeholder xs={8} />
                      </Placeholder>
                    </Placeholder>
                    <Placeholder as={Accordion.Item} xs={12} eventKey="3">
                      <Placeholder as={Accordion.Header} animation="glow">
                        <Placeholder xs={4} />
                      </Placeholder>
                    </Placeholder>
                  </>
                ) : credentials.credentials.length === 0 ? (
                  <div className="mt-5 text-center">
                    <VaultIcon />
                    <p className="text-center text-body-secondary mt-2">
                      Your vault is empty
                    </p>
                  </div>
                ) : filteredCredentialsList.length === 0 ? (
                  <>
                    <p className="fw-light">No result found</p>
                  </>
                ) : (
                  filteredCredentialsList.map((item) => (
                    <StoredItem item={item} key={item.id} />
                  ))
                )}
              </Accordion>
            </Col>
          </Row>
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
