import "./App.css";
import Main from "./components/Main";
import { AuthContextProvider } from "./contexts/auth/provider";
import { PWAProvider } from "./contexts/pwa/provider";

function App() {
  return (
    <PWAProvider>
      <AuthContextProvider>
        <Main />
      </AuthContextProvider>
    </PWAProvider>
  );
}

export default App;
