import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { CheckIcon, CrossIcon, ExclaimationIcon } from "../Common/Icons";
import { useCredentials } from "../../contexts/credentials/provider";
import { CredentialsActionType } from "../../contexts/credentials/enums";
import { updateSecret } from "../../services/authentication";

function ChangeSecretModal({
  show,
  closeModal,
}: {
  show: boolean;
  closeModal: () => void;
}) {
  const [credentials, credentialsDispatch] = useCredentials();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [isRunningUpdate, setIsRunningUpdate] = useState(false);
  const [operationStatus, setOperationStatus] = useState<
    { msg: string; status: string }[]
  >([]);

  const handleClose = () => {
    closeModal();
    setCurrentPassword("");
    setNewSecret("");
    setIsRunningUpdate(false);
    setOperationStatus([]);
  }

  const handleSecretUpdate = async () => {
    setIsRunningUpdate(true);
    setOperationStatus([]);

    const operationStatusUpdateCallback = (
      type: string,
      data: { msg?: string; status: string }
    ) => {
      setOperationStatus((state) => {
        let newState: { msg: string; status: string }[];
        const status = data.status;
        if (type === "previous") {
          newState = state.map((item, index) =>
            index === state.length - 1 ? { ...item, status: status } : item
          );
        } else {
          newState = [...state, { msg: data.msg!, status }];
        }
        return newState;
      });
    };

    updateSecret(
      newSecret,
      currentPassword,
      credentials.encryptor!,
      operationStatusUpdateCallback
    )
      .then((newEncryptor) => {
        if (newEncryptor) {
          credentialsDispatch({
            type: CredentialsActionType.UPDATE_ENCRYPTOR,
            payload: {
              encryptor: newEncryptor,
            },
          });
        }
        setIsRunningUpdate(false);
      })
      .catch((err) => {
        alert("Something went wrong! " + err.message);
        setIsRunningUpdate(false);
      });
  };

  const isReady = newSecret.length >= 10;

  return (
    <Modal show={show} size="lg" fullscreen="sm-down">
      <Modal.Header>Change Secret</Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Enter your password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Your Master Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tell me a secret</Form.Label>
            <Form.Text className="d-block text-warning mb-1">
              <ExclaimationIcon /> Watch out! This is a plain text input field.
              Make sure no one is watching!
            </Form.Text>
            <Form.Control
              type="text"
              placeholder="New Secret"
              value={newSecret}
              isInvalid={Boolean(newSecret) && newSecret.length < 10}
              onChange={(e) => setNewSecret(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Need to be at least 10 characters long
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
        <div className="mt-2">
          {operationStatus.map((operation, index) => (
            <p className="text-muted mb-0 mt-0" key={index}>
              <small>
                <span className="me-3">
                  {operation.status === "failed" ? (
                    <CrossIcon />
                  ) : operation.status === "ongoing" ? (
                    <Spinner size="sm" />
                  ) : operation.status === "warning" ? (
                    <ExclaimationIcon />
                  ) : (
                    <CheckIcon />
                  )}
                </span>
                {operation.msg}
              </small>
            </p>
          ))}
        </div>
        <div className="mt-3">
          <Button
            className="me-1"
            variant="outline-secondary"
            disabled={isRunningUpdate || !isReady}
            onClick={handleSecretUpdate}
          >
            Update
          </Button>
          <Button
            className="me-1"
            variant="outline-secondary"
            onClick={handleClose}
            disabled={isRunningUpdate}
          >
            Close
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ChangeSecretModal;
