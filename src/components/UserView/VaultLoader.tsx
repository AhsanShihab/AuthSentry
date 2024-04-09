import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import SecretInput from "../Common/SecretInput";
import { useAuth } from "../../contexts/auth/provider";
import { Encryptor, InvalidEncryptorError } from "../../services/encryption";
import * as vaultService from "../../services/vault";
import { useVault } from "../../contexts/vault/provider";
import { VaultActionType } from "../../contexts/vault/enums";
import { migrateDatabaseFromCredentialsToVault } from "../../services/firebase";

enum SecretAskingCase {
  NOT_SAVED_LOCALLY = 1,
  NOT_MATCHING_WITH_CLOUD = 2,
  NOT_MATCHING_GIVEN_SECRET = 3,
}

const SECRET_ASKING_MESSAGE = {
  [SecretAskingCase.NOT_SAVED_LOCALLY]:
    "I don't seem to know your secret. What is it?",
  [SecretAskingCase.NOT_MATCHING_WITH_CLOUD]:
    "Looks like you have a new secret. What is it?",
  [SecretAskingCase.NOT_MATCHING_GIVEN_SECRET]:
    "This doesn't seem to be the latest secret. What are you forgetting to tell me?",
};

function VaultLoader() {
  const [auth] = useAuth();
  const [, vaultDispatch] = useVault();
  const [showSecretAskModal, setShowSecretAskModal] = useState(false);
  const [secretAskingMessage, setSecretAskingMessage] = useState("");
  const [secret, setSecret] = useState("");

  const loadVault = async () => {
    setShowSecretAskModal(false);
    const user = auth.user!.userInfo;
    const encryptor = new Encryptor(user.email, user.password);
    if (!encryptor.secret && !secret) {
      // encryptor were unable to load the secret from locally saved value and have not asked the user the secret yet. open secret asking modal
      setSecretAskingMessage(
        SECRET_ASKING_MESSAGE[SecretAskingCase.NOT_SAVED_LOCALLY]
      );
      setShowSecretAskModal(true);
      return;
    } else if (secret) {
      // asked the user for a secret input, so let's use the latest secret
      encryptor.secret = secret;
    }

    try {
      await migrateDatabaseFromCredentialsToVault();
      const vaultItemList = await vaultService.listVaultItems(encryptor);
      vaultDispatch({
        type: VaultActionType.LOAD_VAULT,
        payload: {
          items: vaultItemList,
          isLoading: false,
          encryptor: encryptor,
        },
      });
      setSecret("");
    } catch (err) {
      if (!(err instanceof InvalidEncryptorError)) {
        throw err;
      }
      if (!secret) {
        // locally saved secret is outdated and haven't asked for the secret yet.
        setSecretAskingMessage(
          SECRET_ASKING_MESSAGE[SecretAskingCase.NOT_MATCHING_WITH_CLOUD]
        );
        setShowSecretAskModal(true);
        return;
      }
      // secret was loaded from user input but it is incorrect
      if (encryptor.secret === secret) {
        setSecretAskingMessage(
          SECRET_ASKING_MESSAGE[SecretAskingCase.NOT_MATCHING_GIVEN_SECRET]
        );
        setShowSecretAskModal(true);
        return;
      }
    }
  };

  useEffect(() => {
    loadVault();
  }, [auth.user?.userInfo]);

  return (
    <Modal show={showSecretAskModal}>
      <Modal.Header>Secret</Modal.Header>
      <Modal.Body>
        <p>{secretAskingMessage}</p>
        <Form>
          <SecretInput
            className="mb-3"
            onChange={setSecret}
            showValidation={false}
            value={secret}
            placeholder="Your latest secret"
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={loadVault}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default VaultLoader;
