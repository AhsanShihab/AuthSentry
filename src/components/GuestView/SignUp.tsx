import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import secureLocalStorage from "react-secure-storage";
import MasterPasswordRegistrationInput from "../Common/MasterPasswordRegistrationInput";
import { register } from "../../services/authentication";
import SecretInput from "../Common/SecretInput";

function SignUp({
  email,
  password,
  secret,
  isAuthenticating,
  setEmail,
  setPassword,
  setSecret,
  setIsAuthenticating,
  onSignUp,
}: {
  email: string;
  password: string;
  secret: string;
  isAuthenticating: boolean;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setSecret: React.Dispatch<React.SetStateAction<string>>;
  setIsAuthenticating: React.Dispatch<React.SetStateAction<boolean>>;
  onSignUp: () => Promise<void>;
}) {
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [invalidEmailErrMsg, setInvalidEmailErrMsg] = useState("");
  const [signUpErrorMsg, setSignUpErrorMsg] = useState("");
  const [isSecretReady, setIsSecretReady] = useState(false);
  const [isProcessingSignUp, setIsProcessingSignUp] = useState(false);

  const handleSignup = async () => {
    setIsAuthenticating(true);
    setIsProcessingSignUp(true);
    setInvalidEmailErrMsg("");
    setSignUpErrorMsg("");
    try {
      await register(email, password);
      secureLocalStorage.setItem("last_logged_in_email", email);
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
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          isInvalid={Boolean(invalidEmailErrMsg)}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Form.Control.Feedback type="invalid">
          {invalidEmailErrMsg}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>
      <MasterPasswordRegistrationInput
        className="mb-3"
        label="Master Password"
        value={password}
        placeholder="Master Password"
        formText="This is the only password you will need to remember. If you forget
      this, there will be no way to recover your data."
        onChange={setPassword}
        onValidityChange={setIsPasswordValid}
      />
      <SecretInput
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
          <strong>exact secret</strong> you enter here.
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
      </SecretInput>

      {signUpErrorMsg && (
        <p className="text-danger">
          <small>{signUpErrorMsg}</small>
        </p>
      )}
      <Button
        variant="outline-secondary"
        onClick={handleSignup}
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
