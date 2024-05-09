import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { logOut } from "../../services/authentication";
import * as vaultService from "../../services/vault";
import {
  DownloadIcon,
  KeyIcon,
  LogoutIcon,
  RefreshIcon,
  SecretIcon,
  VerticalElipsisIcon,
} from "../Common/Icons";
import { useVault } from "../../contexts/vault/provider";
import { useAuth } from "../../contexts/auth/provider";
import { VaultActionType } from "../../contexts/vault/enums";
import { AuthActionType } from "../../contexts/auth/enums";
import AddPasswordModal from "./AddPasswordModal";
import DownloadModal from "./DownloadModal";
import ChangeMasterPasswordModal from "./ChangeMasterPasswordModal";
import ChangeSecretModal from "./ChangeSecretModal";
import VaultItemList from "./VaultItemList";
import LogoutCountdownTime from "./LogoutCountdownTime";
import VaultLoader from "./VaultLoader";
import InvalidEncryptorErrorModal from "./InvalidEncryptorErrorModal";
import { InvalidEncryptorError } from "../../services/encryption";

function Home() {
  const [, authStateDispatch] = useAuth();
  const [, vaultDispatch] = useVault();
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showMasterPasswordUpdateModal, setShowMasterPasswordUpdateModal] =
    useState(false);
  const [showSecretChangeModal, setShowSecretChangeModal] = useState(false);
  const [showInvalidEncryptorErrorModal, setShowInvalidEncryptorErrorModal] =
    useState(false);

  const handleInvalidEncryptorError = () => {
    setShowInvalidEncryptorErrorModal(true);
  };

  const refreshList = async () => {
    try {
      vaultDispatch({
        type: VaultActionType.START_LOADING_VAULT,
      });

      for await (let item of vaultService.listVaultItemsGenerator()) {
        vaultDispatch({
          type: VaultActionType.LOAD_ITEMS_IN_BATCH,
          payload: {
            items: item,
          },
        });
      }
      vaultDispatch({
        type: VaultActionType.LOAD_ITEMS_IN_BATCH,
        payload: {
          isLoading: false,
        },
      });
    } catch (err) {
      if (err instanceof InvalidEncryptorError) {
        handleInvalidEncryptorError();
      } else {
        throw err;
      }
    }
  };

  const signOut = () => {
    logOut();
    authStateDispatch({
      type: AuthActionType.LOGOUT_USER,
    });
    vaultDispatch({
      type: VaultActionType.CLEAR_STATE,
    });
  };

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

  return (
    <Container className="pb-5">
      <Row className="mt-3">
        <Col md={{ offset: 2, span: 8 }}>
          <div className="d-flex flex-row mt-3 mb-5">
            <img src={process.env.PUBLIC_URL + "/logo192.png"} alt="logo" width={128} height={128} />
            <div>
              <h1 className="mt-3">AuthSentry</h1>
              <h5> Your Fortress of Security</h5>
            </div>
          </div>
          <Row>
            <Col>
              <LogoutCountdownTime />
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
          <AddPasswordModal
            isOpen={showAddNewModal}
            hideModal={hidePasswordAddModal}
            onInvalidEncryptorError={handleInvalidEncryptorError}
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
          <InvalidEncryptorErrorModal
            show={showInvalidEncryptorErrorModal}
            signout={signOut}
          />
        </Col>
      </Row>
      <VaultLoader />
    </Container>
  );
}

export default Home;
