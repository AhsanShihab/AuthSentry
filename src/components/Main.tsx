import Authentication from "./GuestView/Authentication";
import Home from "./UserView/Home";
import { useAuth } from "../contexts/auth/provider";

function Main() {
  const [authState] = useAuth();

  return (
    <div>
      {authState.isLoading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <h1 className="display-1">AuthSentry</h1>
        </div>
      ) : authState.user ? (
        <Home />
      ) : (
        <Authentication />
      )}
    </div>
  );
}

export default Main;
