import "./App.css";
import Main from "./components/Main";
import { AuthContextProvider } from "./contexts/auth/provider";
import { CredentialsContextProvider } from "./contexts/credentials/provider";

function App() {
  return (
    <AuthContextProvider>
      <CredentialsContextProvider>
        <Main />
      </CredentialsContextProvider>
    </AuthContextProvider>
  );
}

export default App;
