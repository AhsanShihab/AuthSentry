import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Modal from "react-bootstrap/Modal";
import secureLocalStorage from "react-secure-storage";
import { useCredentials } from "../../contexts/credentials/provider";
import { useAuth } from "../../contexts/auth/provider";
import { CredentialsActionType } from "../../contexts/credentials/enums";
import { AuthActionType } from "../../contexts/auth/enums";
import * as vaultService from "../../services/vault";
import { getCurrentUser } from "../../services/authentication";
import { Encryptor } from "../../services/encryption";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

enum SecretAskingCase {
  NOT_SAVED_LOCALLY = 1,
  NOT_MATCHING_WITH_CLOUD = 2,
  NOT_MATCHING_GIVEN_SECRET = 3,
}

const SECRET_ASKING_MESSAGE = {
  [SecretAskingCase.NOT_SAVED_LOCALLY]:
    "I don't seem to know your secret. What is it?",
  [SecretAskingCase.NOT_MATCHING_WITH_CLOUD]:
    "I don't seem to know your latest secret. What's your new secret?",
  [SecretAskingCase.NOT_MATCHING_GIVEN_SECRET]:
    "This doesn't seem to be the corrent secret. What are you forgetting to tell me?",
};

function Authentication() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecretAskModal, setShowSecretAskModal] = useState(false);
  const [secretAskingMessage, setSecretAskingMessage] = useState("");
  const [, authDispatch] = useAuth();
  const [, credentialsDispatch] = useCredentials();

  const prepareApp = async () => {
    setShowSecretAskModal(false);
    const user = getCurrentUser()!;
    const encryptor = new Encryptor(email, password);
    if (!encryptor.secret) {
      if (!secret) {
        setSecretAskingMessage(
          SECRET_ASKING_MESSAGE[SecretAskingCase.NOT_SAVED_LOCALLY]
        );
        setShowSecretAskModal(true);
        return;
      } else if (secret) {
        encryptor.secret = secret;
      }
    }

    const isValidEncryptionKey =
      await vaultService.checkValidityOfEncryptionKey(encryptor);
    if (!isValidEncryptionKey) {
      if (!secret) {
        setSecretAskingMessage(
          SECRET_ASKING_MESSAGE[SecretAskingCase.NOT_MATCHING_WITH_CLOUD]
        );
        setShowSecretAskModal(true);
        return;
      }
      if (encryptor.secret === secret) {
        setSecretAskingMessage(
          SECRET_ASKING_MESSAGE[SecretAskingCase.NOT_MATCHING_GIVEN_SECRET]
        );
        setShowSecretAskModal(true);
        return;
      }

      encryptor.secret = secret;
      const isValidEncryptionKey = await vaultService.checkValidityOfEncryptionKey(encryptor);
      if (!isValidEncryptionKey) {
        setSecretAskingMessage(
          SECRET_ASKING_MESSAGE[SecretAskingCase.NOT_MATCHING_GIVEN_SECRET]
        );
        setShowSecretAskModal(true);
        return;
      }
    }
    const credentialsList = await vaultService.listCredentials(encryptor);
    credentialsDispatch({
      type: CredentialsActionType.LOAD_CREDENTIALS,
      payload: {
        credentials: credentialsList,
        isLoading: false,
        encryptor: encryptor,
      },
    });
    authDispatch({
      type: AuthActionType.LOAD_USER,
      payload: {
        userInfo: user,
      },
    });
  };

  useEffect(() => {
    const value = secureLocalStorage.getItem("last_logged_in_email");
    if (value) {
      setEmail(value as string);
    }
  }, []);

  useEffect(() => {
    authDispatch({
      type: AuthActionType.LOGOUT_USER,
    });
  }, [authDispatch]);

  return (
    <Container className="pb-5">
      <Row className="mt-3">
        <Col md={{ offset: 2, span: 8 }}>
          <div className="d-flex flex-row justify-content-center align-items-center mb-3">
            <img src="/logo192.png" alt="logo" width={116} height={116} />
            <div>
              <h1 className="mt-3">AuthSentry</h1>
              <h5> Your Fortress of Security</h5>
            </div>
          </div>
          <Tabs defaultActiveKey="signin" className="mb-3" fill>
            <Tab eventKey="signin" title="Sign In">
              <SignIn
                email={email}
                password={password}
                isAuthenticating={isAuthenticating}
                setEmail={setEmail}
                setPassword={setPassword}
                onSignIn={prepareApp}
                setIsAuthenticating={setIsAuthenticating}
              />
            </Tab>
            <Tab eventKey="signup" title="Sign Up">
              <SignUp
                email={email}
                password={password}
                secret={secret}
                setEmail={setEmail}
                setPassword={setPassword}
                setSecret={setSecret}
                isAuthenticating={isAuthenticating}
                onSignUp={prepareApp}
                setIsAuthenticating={setIsAuthenticating}
              />
            </Tab>
          </Tabs>
        </Col>
      </Row>
      <Modal show={showSecretAskModal}>
        <Modal.Header>Secret</Modal.Header>
        <Modal.Body>
          <p>{secretAskingMessage}</p>
          <Form>
            <Form.Control
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={prepareApp}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Authentication;
