import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { socket } from "./services/socket";
import { useAuthStore } from "./store/useAuthStore";

// Puslapiai
import RegistrationPage from "./pages/RegistrationPage";
import LobbyListPage from "./pages/LobbyListPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import RoomPage from "./pages/RoomPage";
import GamePage from "./pages/GamePage";

function App() {
  const { username, activeGameId, setActiveGameId } = useAuthStore();

  useEffect(() => {
    // 1. Loguoja VISUS gautus įvykius iš serverio
    socket.onAny((event, ...args) => {
      console.log(
        `%c 📥 [Gauta iš Serverio] -> ${event}`,
        "color: #00ff00; font-weight: bold;",
        args,
      );
    });

    // 2. Loguoja VISUS išsiųstus įvykius iš React
    socket.onAnyOutgoing((event, ...args) => {
      console.log(
        `%c 📤 [Išsiųsta iš React] -> ${event}`,
        "color: #00bfff; font-weight: bold;",
        args,
      );
    });

    return () => {
      socket.offAny();
      socket.offAnyOutgoing();
    };
  }, []);

  useEffect(() => {
    // 1. Jungiamės prie socket tik jei turime vartotojo vardą
    if (username) {
      if (!socket.connected) {
        socket.connect();
      }
    }

    // 2. AUTOMATINIS REJOIN PO F5 PERKROVIMO
    const handleConnect = () => {
      const currentUsername = useAuthStore.getState().username;
      const currentGameId = useAuthStore.getState().activeGameId;

      if (currentUsername && currentGameId) {
        console.log(
          `🔄 Bandoma grįžti į žaidimą po perkrovimo: ${currentGameId}`,
        );
        socket.emit("rejoin_game", {
          roomId: currentGameId,
          username: currentUsername,
        });
      }
    };

    // 3. Jei nepavyko grįžti (žaidimas baigėsi arba buvo ištrintas)
    const handleRejoinFailed = (err: { message: string }) => {
      console.warn("⚠️ Nepavyko grįžti į žaidimą:", err?.message);
      setActiveGameId(null); // Ištriname seną ID, nes žaidimo nebėra
    };

    // Globalios klaidos
    const handleError = (msg: string) => {
      alert(msg);
    };

    socket.on("connect", handleConnect);
    socket.on("rejoin_failed", handleRejoinFailed);
    socket.on("error_message", handleError);

    // Jei socket JAU buvo prisijungęs užsikraunant komponentui
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("rejoin_failed", handleRejoinFailed);
      socket.off("error_message", handleError);
    };
  }, [username, setActiveGameId]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500/30">
        <main className="container mx-auto px-4 py-4">
          <Routes>
            <Route
              path="/"
              element={
                !username ? <RegistrationPage /> : <Navigate to="/lobby" />
              }
            />

            <Route
              path="/lobby"
              element={username ? <LobbyListPage /> : <Navigate to="/" />}
            />

            <Route
              path="/create"
              element={username ? <CreateRoomPage /> : <Navigate to="/" />}
            />

            <Route
              path="/room/:roomId"
              element={username ? <RoomPage /> : <Navigate to="/" />}
            />

            <Route path="/game/:roomId" element={<GamePage />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
