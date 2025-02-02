import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { logIn } from "../../services/authentication";

function SignIn({
  email,
  password,
  isAuthenticating,
  onEmailChange,
  onPasswordChange,
  setIsAuthenticating,
  onSignIn,
}: {
  email: string;
  password: string;
  isAuthenticating: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  setIsAuthenticating: (value: boolean) => void;
  onSignIn: () => Promise<void>;
}) {
  const [isProcessingSignIn, setIsProcessingSignIn] = useState(false);
  const [signInErrorMsg, setSignInErrorMsg] = useState("");
  const [invalidEmailErrMsg, setInvalidEmailErrMsg] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAuthenticating(true);
    setIsProcessingSignIn(true);
    setSignInErrorMsg("");
    setInvalidEmailErrMsg("");
    try {
      await logIn(email, password);
      await onSignIn();
    } catch (err: any) {
      if (err.code === "auth/invalid-email") {
        setInvalidEmailErrMsg("Please enter a valid email address");
      } else if (err.code === "auth/invalid-credential") {
        setSignInErrorMsg("Incorrect email or password!");
      } else if (err.code === "auth/network-request-failed") {
        setSignInErrorMsg(
          "Cannot connect with server. Make sure you are connected to the internet and try again"
        );
      } else {
        setSignInErrorMsg("Something went wrong!");
      }
    } finally {
      setIsProcessingSignIn(false);
      setIsAuthenticating(false);
    }
  };

  const isReadyForLogin = !!password && !!email;

  return (
    <Form onSubmit={handleLogin}>
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

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
        <Form.Text className="text-muted">
          Forgot password? Opps!
          <br />
          There is no way to recover your password. Your data encryption is tied
          with the password. If you cannot remember the current password, your
          data can't be recovered either.
        </Form.Text>
      </Form.Group>
      {signInErrorMsg && (
        <p className="text-danger">
          <small>{signInErrorMsg}</small>
        </p>
      )}
      <Button
        variant="outline-secondary"
        type="submit"
        disabled={!isReadyForLogin || isAuthenticating}
      >
        {isProcessingSignIn ? (
          <Spinner animation="border" size="sm" role="status">
            <span className="visually-hidden">Signing in</span>
          </Spinner>
        ) : (
          <>Sign In</>
        )}
      </Button>
    </Form>
  );
}

export default SignIn;
