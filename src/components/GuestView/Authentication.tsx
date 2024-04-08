import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import secureLocalStorage from "react-secure-storage";
import { useAuth } from "../../contexts/auth/provider";
import { AuthActionType } from "../../contexts/auth/enums";
import { getCurrentUser } from "../../services/authentication";
import SignIn from "./SignIn";
import SignUp from "./SignUp";


function Authentication() {
  const [, authDispatch] = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const prepareApp = async () => {
    const user = getCurrentUser();
    if (!user) {
      return;
    }
    secureLocalStorage.setItem("last_logged_in_email", email);
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
                setEmail={setEmail}
                setPassword={setPassword}
                isAuthenticating={isAuthenticating}
                onSignUp={prepareApp}
                setIsAuthenticating={setIsAuthenticating}
              />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default Authentication;
