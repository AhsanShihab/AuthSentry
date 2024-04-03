import "./App.css";
import Main from "./components/Main";
import { AuthContextProvider } from "./contexts/auth/provider";
import { CredentialsContextProvider } from "./contexts/credentials/provider";
import { PWAProvider } from "./contexts/pwa/provider";

function App() {
  return (
    <PWAProvider>
      <AuthContextProvider>
        <CredentialsContextProvider>
          <Main />
        </CredentialsContextProvider>
      </AuthContextProvider>
    </PWAProvider>
  );
}

export default App;
