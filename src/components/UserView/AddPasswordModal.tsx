import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { CheckIcon, CopyButtonIcon } from "../Common/Icons";
import { useVault } from "../../contexts/vault/provider";
import {
  DataType,
  IVaultItemAddData,
} from "../../contexts/vault/types";
import { VaultActionType } from "../../contexts/vault/enums";
import { generateRandomPassword } from "../../services/password_generator";
import * as vaultService from "../../services/vault";
import { NOTE_CHARACTER_LIMIT } from "../../constants";

function AddPasswordModal({
  isOpen,
  hideModal,
}: {
  isOpen: boolean;
  hideModal: () => void;
}) {
  const [vault, vaultDispatch] = useVault();
  const [name, setName] = useState("");
  const [type, setType] = useState<DataType>(DataType.Credentails);
  const [note, setNote] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [passwordLength, setPasswordLength] = useState(64);
  const [copyBtnType, setCopyBtnType] = useState("Copy");
  const [password, setPassword] = useState(
    generateRandomPassword(passwordLength)
  );

  const handleNote = (value: string) => {
    if (value.length <= NOTE_CHARACTER_LIMIT) {
      setNote(value);
    }
  };

  useEffect(() => {
    setPassword(generateRandomPassword(passwordLength));
  }, [passwordLength]);

  const changePasswordLength = (percent: string) => {
    const percentNumber = Number.parseInt(percent);
    setPasswordLength(percentNumber);
  };

  const handleClickOnPasswordCopy = () => {
    navigator.clipboard.writeText(password);
    setCopyBtnType("Copied");
    setTimeout(() => setCopyBtnType("Copy"), 5000);
  };

  const closeModal = () => {
    hideModal();
    setType(DataType.Credentails);
    setNote("");
    setName("");
    setSiteUrl("");
    setEmail("");
    setUsername("");
    setPassword(generateRandomPassword(passwordLength));
  };

  const handleAdd = async () => {
    const submitData: IVaultItemAddData = {
      type,
      name,
      note: [DataType.Note, DataType.Both].includes(type) ? note : "",
      siteUrl: [DataType.Credentails, DataType.Both].includes(type)
        ? siteUrl
        : "",
      email: [DataType.Credentails, DataType.Both].includes(type) ? email : "",
      username: [DataType.Credentails, DataType.Both].includes(type)
        ? username
        : "",
      password: [DataType.Credentails, DataType.Both].includes(type)
        ? password
        : "",
    };
    const data = await vaultService.addVaultItem(
      submitData,
      vault.encryptor!
    );
    vaultDispatch({
      type: VaultActionType.ADD_NEW_VAULT_ITEM,
      payload: data,
    });
    closeModal();
  };
  const isReadyToAdd =
    Boolean(name) &&
    (type === DataType.Credentails
      ? Boolean(password)
      : type === DataType.Note
      ? Boolean(note)
      : Boolean(password) && Boolean(note));
  return (
    <Modal show={isOpen} fullscreen="sm-down" onHide={closeModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Entry</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Form>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" lg="2">
                Name *
              </Form.Label>
              <Col sm="9" lg="10">
                <Form.Control
                  type="text"
                  placeholder="e.g. My Facebook, Work Email etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="3" lg="2">
                Type
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

            {(type === DataType.Note || type === DataType.Both) && (
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="3" lg="2">
                  Note *
                </Form.Label>
                <Col sm="9" lg="10">
                  <Form.Control
                    as="textarea"
                    rows={5}
                    onChange={(e) => handleNote(e.target.value)}
                    value={note}
                  />
                  <Form.Text className="text-muted">
                    {note.length} / {NOTE_CHARACTER_LIMIT}
                  </Form.Text>
                </Col>
              </Form.Group>
            )}

            {(type === DataType.Credentails || type === DataType.Both) && (
              <>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="3" lg="2">
                    Site URL
                  </Form.Label>
                  <Col sm="9" lg="10">
                    <Form.Control
                      type="text"
                      placeholder="https://www.facebook.com"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="3" lg="2">
                    Email
                  </Form.Label>
                  <Col sm="9" lg="10">
                    <Form.Control
                      type="email"
                      placeholder="myname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="3" lg="2">
                    Username
                  </Form.Label>
                  <Col sm="9" lg="10">
                    <Form.Control
                      type="text"
                      placeholder="myusername"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="3" lg="2">
                    Password *
                  </Form.Label>
                  <Col sm="9" lg="10">
                    <div className="d-flex flex-row">
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        className="ms-2 border-0"
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleClickOnPasswordCopy}
                      >
                        {copyBtnType === "Copied" ? (
                          <CheckIcon />
                        ) : (
                          <CopyButtonIcon />
                        )}
                      </Button>
                    </div>
                  </Col>
                  <Col sm={{ offset: 3 }} lg={{ offset: 2 }}>
                    <Form.Text className="text-muted">
                      Length of the randomly generated password:{" "}
                      {passwordLength}
                      <Form.Range
                        min="8"
                        max="256"
                        onChange={(e) => changePasswordLength(e.target.value)}
                        value={passwordLength}
                      />
                    </Form.Text>
                  </Col>
                </Form.Group>
              </>
            )}
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          disabled={!isReadyToAdd}
          onClick={handleAdd}
        >
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddPasswordModal;
