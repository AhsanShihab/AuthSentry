import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import EncryptionSecretInput from "../Common/EncryptionSecretInput";
import { useAuth } from "../../contexts/auth/provider";
import { Encryptor, InvalidEncryptorError } from "../../services/encryption";
import * as vaultService from "../../services/vault";
import { useVault } from "../../contexts/vault/provider";
import { VaultActionType } from "../../contexts/vault/enums";

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

  const loadVault = async (
    event?: React.FormEvent<HTMLFormElement | HTMLButtonElement>
  ) => {
    if (event) {
      event.preventDefault();
    }
    vaultDispatch({
      type: VaultActionType.START_LOADING_VAULT,
    });
    setShowSecretAskModal(false);
    const user = auth.user!.userInfo;
    const encryptor = new Encryptor(user.email, user.password);
    if (!encryptor.secret && !secret) {
      // encryptor was unable to load the secret from locally saved value and have not asked the user the secret yet. open secret asking modal
      setSecretAskingMessage(
        SECRET_ASKING_MESSAGE[SecretAskingCase.NOT_SAVED_LOCALLY]
      );
      setShowSecretAskModal(true);
      return;
    } else if (secret) {
      // asked the user for a secret input, so let's use the latest secret
      encryptor.secret = secret;
      encryptor.saveSecret();
    }

    try {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user, auth.user?.userInfo]);

  return (
    <Modal show={showSecretAskModal}>
      <Modal.Header>Secret</Modal.Header>
      <Modal.Body>
        <Form onSubmit={loadVault}>
          <p>{secretAskingMessage}</p>
          <EncryptionSecretInput
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
