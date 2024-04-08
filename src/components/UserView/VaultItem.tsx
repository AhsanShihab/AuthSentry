import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { CheckIcon, CopyButtonIcon } from "../Common/Icons";
import { generateRandomPassword } from "../../services/password_generator";
import { deleteCredentials, updateCredentials } from "../../services/vault";
import ConfirmationModal from "../Common/ConfirmationModal";
import {
  DataType,
  ICredentialsAddData,
  ICredentialsData,
} from "../../contexts/vault/types";
import { useCredentials } from "../../contexts/vault/provider";
import { CredentialsActionType } from "../../contexts/vault/enums";
import { NOTE_CHARACTER_LIMIT } from "../../constants";

function VaultItem({ item }: { item: ICredentialsData }) {
  const [credentials, dispatchCredentials] = useCredentials();
  const [, credentialsDispatch] = useCredentials();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [name, setName] = useState(item.name);
  const [type, setType] = useState(item.type);
  const [note, setNote] = useState(item.note);
  const [siteUrl, setSiteUrl] = useState(item.siteUrl);
  const [email, setEmail] = useState(item.email);
  const [username, setUsername] = useState(item.username);
  const [password, setPassword] = useState(item.password);
  const [passwordLength, setPasswordLength] = useState(
    item.password.length || 32
  );
  const [copyBtnType, setCopyBtnType] = useState("Copy");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const changePasswordLength = (percent: string) => {
    const percentNumber = Number.parseInt(percent);
    setPasswordLength(percentNumber);
    setPassword(generateRandomPassword(percentNumber));
  };

  const handleClickOnPasswordCopy = () => {
    navigator.clipboard.writeText(password);
    setCopyBtnType("Copied");
    setTimeout(() => setCopyBtnType("Copy"), 5000);
  };

  const handleNote = (value: string) => {
    if (value.length <= NOTE_CHARACTER_LIMIT) {
      setNote(value);
    }
  };

  const handleUpdate = async () => {
    const docId = item.id;
    const data: ICredentialsAddData = {
      type,
      name,
      note,
      siteUrl,
      password,
      email,
      username,
    };
    await updateCredentials(docId, data, credentials.encryptor!);
    dispatchCredentials({
      type: CredentialsActionType.UPDATE_CREDENTIALS,
      payload: {
        id: item.id,
        update: data,
      },
    });
    setIsReadOnly(true);
  };

  const handleDelete = () => {
    setShowConfirmModal(true);
  };

  const handleDeleteConfirmation = async () => {
    await deleteCredentials(item.id);
    credentialsDispatch({
      type: CredentialsActionType.DELETE_CREDENTIALS,
      payload: {
        id: item.id,
      },
    });
  };

  const isReadyToUpdate =
    Boolean(name) &&
    (type === DataType.Credentails
      ? Boolean(password)
      : type === DataType.Note
      ? Boolean(note)
      : Boolean(password) && Boolean(note));

  return (
    <Accordion.Item eventKey={item.id}>
      <Accordion.Header>{item.name}</Accordion.Header>
      <Accordion.Body>
        {isReadOnly ? (
          <table className="border-0">
            <tbody>
              <tr>
                <td className="pt-2 pe-2 border-0">Type</td>
                <td className="pt-2 pe-2 border-0">:</td>
                <td className="pt-2 border-0">{type}</td>
              </tr>

              {[DataType.Note, DataType.Both].includes(type) && (
                <tr>
                  <td className="pt-2 pe-2 border-0 align-top">Note</td>
                  <td className="pt-2 pe-2 border-0 align-top">:</td>
                  <td
                    className="pt-2 border-0"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {note}
                  </td>
                </tr>
              )}

              {[DataType.Credentails, DataType.Both].includes(type) && (
                <>
                  <tr>
                    <td className="pt-2 pe-2 border-0">Site Url</td>
                    <td className="pt-2 pe-2 border-0">:</td>
                    <td className="pt-2 border-0">
                      <a href={siteUrl}>{siteUrl}</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="pt-2 pe-2 border-0">Email</td>
                    <td className="pt-2 pe-2 border-0">:</td>
                    <td className="pt-2 border-0">{email}</td>
                  </tr>
                  <tr>
                    <td className="pt-2 pe-2 border-0">Username</td>
                    <td className="pt-2 pe-2 border-0">:</td>
                    <td className="pt-2 border-0">{username}</td>
                  </tr>
                  <tr>
                    <td className="pt-2 pe-2 border-0">password</td>
                    <td className="pt-2 pe-2 border-0">:</td>
                    <td className="pt-2 border-0">
                      *********{" "}
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
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        ) : (
          <table className="border-0">
            <tbody>
              <tr>
                <td className="pe-2 border-0">Name</td>
                <td className="pe-2 border-0">:</td>
                <td className="border-0">
                  {" "}
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className="pe-2 border-0 align-top pt-3">Type</td>
                <td className="pe-2 border-0 align-top pt-3">:</td>
                <td className="border-0 pt-3">
                  <Form.Group>
                    <Form.Check
                      inline
                      type="radio"
                      label={DataType.Credentails}
                      name="type"
                      id="type-credentials"
                      checked={type === DataType.Credentails}
                      onChange={(e) =>
                        e.target.checked
                          ? setType(DataType.Credentails)
                          : undefined
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
                  </Form.Group>
                </td>
              </tr>

              {[DataType.Note, DataType.Both].includes(type) && (
                <tr>
                  <td className="pt-3 pe-2 border-0 align-top">Note</td>
                  <td className="pt-3 pe-2 border-0 align-top">:</td>
                  <td className="pt-3 border-0 w-100">
                    <Form.Control
                      as="textarea"
                      rows={5}
                      onChange={(e) => handleNote(e.target.value)}
                      value={note}
                    />
                  </td>
                </tr>
              )}
              {[DataType.Credentails, DataType.Both].includes(type) && (
                <>
                  <tr>
                    <td className="pt-3 pe-2 border-0">Site Url</td>
                    <td className="pt-3 pe-2 border-0">:</td>
                    <td className="pt-3 border-0">
                      <Form.Control
                        type="text"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="pt-3 pe-2 border-0">Email</td>
                    <td className="pt-3 pe-2 border-0">:</td>
                    <td className="pt-3 border-0">
                      <Form.Control
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="pt-3 pe-2 border-0">Username</td>
                    <td className="pt-3 pe-2 border-0">:</td>
                    <td className="pt-3 border-0">
                      <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="pt-3 pe-2 border-0 align-top">Password</td>
                    <td className="pt-3 pe-2 border-0 align-top">:</td>
                    <td className="pt-3 border-0">
                      <Form.Control
                        className="d-inline w-75"
                        type="password"
                        placeholder="mysupersecurepass"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />{" "}
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
                    </td>
                  </tr>
                  <tr>
                    <td className="pt-3 pe-2 border-0 align-top"></td>
                    <td className="pt-3 pe-2 border-0 align-top"></td>
                    <td className="pt-3 border-0">
                      <p
                        className={
                          passwordLength < 20 ? "text-danger" : "text-muted"
                        }
                      >
                        Password Length: {passwordLength}{" "}
                      </p>

                      <Form.Range
                        className="d-inline w-75"
                        min="8"
                        max="256"
                        onChange={(e) => changePasswordLength(e.target.value)}
                        value={passwordLength}
                      />
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        )}
        <div className="mt-3">
          <Button
            className="me-1"
            size="sm"
            variant="outline-secondary"
            onClick={() => setIsReadOnly(!isReadOnly)}
          >
            {isReadOnly ? "Edit" : "Cancel"}
          </Button>
          <Button
            className=""
            size="sm"
            variant="outline-secondary"
            onClick={isReadOnly ? handleDelete : handleUpdate}
            disabled={!isReadOnly && !isReadyToUpdate}
          >
            {isReadOnly ? "Delete" : "Update"}
          </Button>
        </div>
      </Accordion.Body>
      {showConfirmModal && (
        <ConfirmationModal
          title={"Delete password"}
          message={`Are you sure you want to delete all the credentials data for ${item.name}`}
          onCancel={() => {
            setShowConfirmModal(false);
          }}
          onConfirm={handleDeleteConfirmation}
        />
      )}
    </Accordion.Item>
  );
}

export default VaultItem;
