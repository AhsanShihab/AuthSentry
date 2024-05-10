import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import MasterPasswordRegistrationInput from "../Common/MasterPasswordRegistrationInput";
import { register } from "../../services/authentication";
import EncryptionSecretInput from "../Common/EncryptionSecretInput";
import { Encryptor } from "../../services/encryption";

function SignUp({
  email,
  password,
  isAuthenticating,
  onEmailChange,
  onPasswordChange,
  setIsAuthenticating,
  onSignUp,
}: {
  email: string;
  password: string;
  isAuthenticating: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  setIsAuthenticating: (value: boolean) => void;
  onSignUp: () => Promise<void>;
}) {
  const [secret, setSecret] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [invalidEmailErrMsg, setInvalidEmailErrMsg] = useState("");
  const [signUpErrorMsg, setSignUpErrorMsg] = useState("");
  const [isSecretReady, setIsSecretReady] = useState(false);
  const [isProcessingSignUp, setIsProcessingSignUp] = useState(false);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAuthenticating(true);
    setIsProcessingSignUp(true);
    setInvalidEmailErrMsg("");
    setSignUpErrorMsg("");
    try {
      await register(email, password);
      const encryptor = new Encryptor(email, password);
      encryptor.secret = secret;
      encryptor.saveSecret();
      await onSignUp();
    } catch (err: any) {
      if (err.code === "auth/invalid-email") {
        setInvalidEmailErrMsg("Invalid email address!");
      } else if (err.code === "auth/email-already-in-use") {
        setInvalidEmailErrMsg("Account already exists!");
      } else if (err.code === "auth/network-request-failed") {
        setSignUpErrorMsg(
          "Cannot connect to the server. Make sure you are connected to the internet and try again"
        );
      } else if (err.code === "auth/admin-only") {
        setSignUpErrorMsg("Signup is restricted by admin");
      } else {
        setSignUpErrorMsg("Something went wrong!");
      }
    } finally {
      setIsProcessingSignUp(false);
      setIsAuthenticating(false);
    }
  };

  const isPasswordReady = Boolean(password) && isPasswordValid;
  const isEmailReady = Boolean(email);
  const isReadyForSignUp = isPasswordReady && isEmailReady && isSecretReady;

  return (
    <Form onSubmit={handleSignup}>
      <Form.Group className="mb-3">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          isInvalid={Boolean(invalidEmailErrMsg)}
          onChange={(e) => onEmailChange(e.target.value)}
        />
        <Form.Control.Feedback type="invalid">
          {invalidEmailErrMsg}
        </Form.Control.Feedback>
      </Form.Group>
      <MasterPasswordRegistrationInput
        className="mb-3"
        label="Master Password"
        value={password}
        placeholder="Master Password"
        formText="This is the only password you will need to remember. If you forget
      this, there will be no way to recover your data."
        onChange={onPasswordChange}
        onValidityChange={setIsPasswordValid}
      />
      <EncryptionSecretInput
        className="mb-3"
        label="Tell me a secret"
        placeholder="Secret"
        value={secret}
        onChange={setSecret}
        showValidation={true}
        onValidationChange={setIsSecretReady}
      >
        <Form.Text className="text-muted">
          The Secret will be stored locally in a secured way. You won't be asked
          the secret again unless you login from another device or clear your
          browser data. In those cases, you will need to remember the{" "}
          <strong>exact value</strong> you enter here.
          <br />
          <br />
          Your data encryption key is derived from combining both your master
          password and the secret. The secret never leaves your device. So, even
          if someone hacks your account, the hacker won't be able to see your
          data because it cannot be decrypted without the secret!
          <br />
          <br />
          NOTE that if you forget either your master password or secret, there
          is <strong>NO WAY</strong> to recover your data.
        </Form.Text>
      </EncryptionSecretInput>

      {signUpErrorMsg && (
        <p className="text-danger">
          <small>{signUpErrorMsg}</small>
        </p>
      )}
      <Button
        variant="outline-secondary"
        type="submit"
        disabled={!isReadyForSignUp || isAuthenticating}
      >
        {isProcessingSignUp ? (
          <Spinner animation="border" size="sm" role="status">
            <span className="visually-hidden">Signing up ...</span>
          </Spinner>
        ) : (
          <>Sign Up</>
        )}
      </Button>
    </Form>
  );
}

export default SignUp;
