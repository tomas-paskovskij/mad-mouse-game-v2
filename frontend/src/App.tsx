import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import RegistrationPage from "./pages/RegistrationPage";
import LobbyListPage from "./pages/LobbyListPage";
import CreateRoomPage from "./pages/CreateRoomPage";

function App() {
  const { username } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Headeris rodomas tik kai vartotojas prisijungęs */}
        {username && (
          <header className="bg-slate-800 p-4 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-black text-indigo-400">MAD MOUSE</h1>
            <div className="bg-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
              {username}
            </div>
          </header>
        )}

        <Routes>
          {/* 1. Pagrindinis langas - Registracija */}
          <Route path="/" element={<RegistrationPage />} />

          {/* 2. Lobby sąrašas - apsaugotas (tik jei yra username) */}
          <Route
            path="/lobby"
            element={username ? <LobbyListPage /> : <Navigate to="/" />}
          />

          {/* 3. Kambario kūrimas - apsaugotas */}
          <Route
            path="/create"
            element={username ? <CreateRoomPage /> : <Navigate to="/" />}
          />

          {/* 4. Jei vartotojas suveda nesąmonę - grąžinam į pradžią */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
