import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import MasterPasswordRegistrationInput from "../Common/MasterPasswordRegistrationInput";
import { CheckIcon, CrossIcon, ExclaimationIcon } from "../Common/Icons";
import { useVault } from "../../contexts/vault/provider";
import { VaultActionType } from "../../contexts/vault/enums";
import { updateMasterPassword } from "../../services/authentication";

function ChangeMasterPasswordModal({
  show,
  closeModal,
}: {
  show: boolean;
  closeModal: () => void;
}) {
  const [vault, vaultDispatch] = useVault();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(false);

  const [isRunningUpdate, setIsRunningUpdate] = useState(false);
  const [operationStatus, setOperationStatus] = useState<
    { msg: string; status: string }[]
  >([]);

  const handleModalClose = () => {
    closeModal();
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsNewPasswordValid(false);
    setIsRunningUpdate(false);
    setOperationStatus([]);
  };

  const handleMasterPasswordUpdate = async () => {
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

    updateMasterPassword(
      newPassword,
      currentPassword,
      vault.encryptor!,
      operationStatusUpdateCallback
    )
      .then((newEncryptor) => {
        if (newEncryptor) {
          vaultDispatch({
            type: VaultActionType.UPDATE_ENCRYPTOR,
            payload: {
              encryptor: newEncryptor!,
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

  const isReady =
    isNewPasswordValid &&
    Boolean(confirmNewPassword) &&
    Boolean(currentPassword);

  return (
    <Modal show={show} size="lg" fullscreen="sm-down">
      <Modal.Header>Change Master Password</Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Current password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Current Master Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Form.Group>
          <MasterPasswordRegistrationInput
            className="mb-3"
            value={newPassword}
            label="New password"
            placeholder="New Master Password"
            onChange={setNewPassword}
            onValidityChange={setIsNewPasswordValid}
          />
          <Form.Group className="mb-3">
            <Form.Label>Re-type the new password</Form.Label>
            <Form.Control
              type="password"
              placeholder="New Master Password"
              isValid={
                Boolean(confirmNewPassword) &&
                newPassword === confirmNewPassword
              }
              isInvalid={
                Boolean(confirmNewPassword) &&
                newPassword !== confirmNewPassword
              }
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <Form.Control.Feedback>
              <CheckIcon /> Matched with your new password
            </Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              <CrossIcon /> Not matching with your new password
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
        <div className="mt-2">
          {operationStatus.length === 0 ? (
            <p>
              <small>
                Note: it's a good idea to download your data before moving
                forward.
                <br />
                In case something goes wrong, you can recover the data from your
                local backup.
                <br />
                We will also be doing a cloud backup of your data before
                proceeding.
              </small>
            </p>
          ) : (
            operationStatus.map((operation, index) => (
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
            ))
          )}
        </div>
        <div className="mt-3">
          <Button
            className="me-1"
            variant="outline-secondary"
            disabled={isRunningUpdate || !isReady}
            onClick={handleMasterPasswordUpdate}
          >
            Update
          </Button>
          <Button
            className="me-1"
            variant="outline-secondary"
            onClick={handleModalClose}
            disabled={isRunningUpdate}
          >
            Close
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ChangeMasterPasswordModal;
