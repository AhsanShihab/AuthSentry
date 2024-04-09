import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useVault } from "../../contexts/vault/provider";
import * as vaultService from "../../services/vault";
import * as authentication from "../../services/authentication";
import { useState } from "react";
import { DataType } from "../../contexts/vault/types";

function DownloadModal({
  show,
  toggle,
}: {
  show: boolean;
  toggle: () => void;
}) {
  const [vault,] = useVault();
  const [downloadUnencrypted, setDownloadUnencrypted] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);
  const [type, setType] = useState(DataType.Credentails);

  const onClose = () => {
    setPassword("");
    setDownloadUnencrypted(false);
    toggle();
  }

  const downloadFile = async () => {
    const isPasswordValid = await authentication.verifyPassword(password);
    if (!isPasswordValid) {
      setIsPasswordIncorrect(true);
      return;
    }
    const vaultItemList = downloadUnencrypted
      ? vault.items
      : await vaultService.listEncryptedVaultItems();
    const filteredList = vaultItemList.filter(item => item.type === type);

    // create file in browser
    const fileName = `AuthSentry - list of ${type}`;
    const json = JSON.stringify(filteredList, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    // create "a" HTLM element with href to file
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);

    setPassword("");
    setDownloadUnencrypted(false);
    toggle();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>Download</Modal.Header>
      <Modal.Body>
        <Form className="mb-3">
          <Form.Group className="mb-3">
            <Form.Label>Enter your password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              isInvalid={isPasswordIncorrect}
              onChange={(e) => {
                setPassword(e.target.value);
                setIsPasswordIncorrect(false);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Password is incorrect
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="12">
              Which data do you want to download?
            </Form.Label>
            <Col sm="9" lg="10" className="d-flex align-items-center">
              <Form.Check
                inline
                type="radio"
                label={DataType.Credentails}
                name="type"
                id="type-credentials"
                checked={type === DataType.Credentails}
                onChange={(e) =>
                  e.target.checked ? setType(DataType.Credentails) : undefined
                }
              />
              <Form.Check
                inline
                type="radio"
                label={DataType.Note}
                name="type"
                id="type-note"
                checked={type === DataType.Note}
                onChange={(e) =>
                  e.target.checked ? setType(DataType.Note) : undefined
                }
              />
              <Form.Check
                inline
                type="radio"
                label={DataType.Both}
                name="type"
                id="type-both"
                checked={type === DataType.Both}
                onChange={(e) =>
                  e.target.checked ? setType(DataType.Both) : undefined
                }
              />
            </Col>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Download as unencrypted (Risky)"
              checked={downloadUnencrypted}
              onChange={(e) => setDownloadUnencrypted(e.target.checked)}
            />
          </Form.Group>
        </Form>
        <Button
          variant="outline-secondary me-1"
          disabled={!password}
          onClick={downloadFile}
        >
          Download
        </Button>
        <Button variant="outline-secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Body>
    </Modal>
  );
}

export default DownloadModal;
