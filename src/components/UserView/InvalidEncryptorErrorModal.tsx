import { Button, Modal } from "react-bootstrap";

export default function InvalidEncryptorErrorModal({
  show,
  signout,
}: {
  show: boolean;
  signout: () => void;
}) {
  return (
    <Modal onHide={signout} show={show} backdrop="static" keyboard={false}>
      <Modal.Header><strong>Invalid Encryptor Key</strong></Modal.Header>
      <Modal.Body>
        An Encryption/Decryption operation has been rejected due to mismatched{" "}
        <strong>Encryption Secret</strong> or <strong>Master Password</strong>{" "}
        in the current session. Looks like at least one of them has been
        modified from another session. Please logout and then login again
        to create a new session.
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={signout} variant="outline-danger">
          Logout
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
