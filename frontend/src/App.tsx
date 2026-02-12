import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RegistrationPage from "./pages/RegistrationPage";
import LobbyListPage from "./pages/LobbyListPage";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { username } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white font-sans">
        {/* Štai mūsų naujas Headeris */}
        {username && (
          <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-black text-indigo-400 italic tracking-tighter">
              MAD MOUSE
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 italic">
                Logged in as:
              </span>
              <span className="bg-indigo-600 px-3 py-1 rounded-full text-sm font-bold shadow-lg border border-indigo-400">
                {username}
              </span>
            </div>
          </header>
        )}

        <Routes>
          <Route path="/" element={<RegistrationPage />} />
          <Route
            path="/lobby"
            element={username ? <LobbyListPage /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
