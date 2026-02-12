import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { socket } from "./services/socket";
import { useAuthStore } from "./store/useAuthStore";
import { useGameStore } from "./store/useGameStore";

// Puslapių importai
import RegistrationPage from "./pages/RegistrationPage";
import LobbyListPage from "./pages/LobbyListPage";
import CreateRoomPage from "./pages/CreateRoomPage";

function App() {
  const { username } = useAuthStore();
  const { setRooms } = useGameStore();

  useEffect(() => {
    // Jei turime vartotojo vardą, jungiamės prie serverio
    if (username) {
      socket.connect();

      // Klausomės serverio pranešimų apie atnaujintą kambarių sąrašą
      socket.on("update_rooms", (updatedRooms) => {
        console.log("Received rooms from server:", updatedRooms); // Ar matai tai konsolėje?
        setRooms(updatedRooms);
      });
    }

    // Atsijungimo logika, kai komponentas išjungiamas arba pasikeičia username
    return () => {
      socket.off("update_rooms");
      socket.disconnect();
    };
  }, [username, setRooms]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white font-sans">
        {/* Header - rodomas tik prisijungus */}
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
          {/* Pradinis langas */}
          <Route path="/" element={<RegistrationPage />} />

          {/* Lobby sąrašas (apsaugotas) */}
          <Route
            path="/lobby"
            element={username ? <LobbyListPage /> : <Navigate to="/" />}
          />

          {/* Kambario kūrimas (apsaugotas) */}
          <Route
            path="/create"
            element={username ? <CreateRoomPage /> : <Navigate to="/" />}
          />

          {/* Jei adresas nerastas, metam į pradžią */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
