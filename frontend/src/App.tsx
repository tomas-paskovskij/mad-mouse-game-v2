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
  const { username } = useAuthStore();

  useEffect(() => {
    // 1. Jungiamės prie socket tik jei turime vartotojo vardą
    if (username) {
      if (!socket.connected) {
        socket.connect();
      }
    }

    // 2. Globalios klaidos (nebūtina, bet naudinga)
    socket.on("error_message", (msg) => {
      alert(msg);
    });

    return () => {
      socket.off("error_message");
      // update_rooms čia NEBEKLAUSOME - tai darys LobbyListPage ir RoomPage atskirai
    };
  }, [username]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500/30">
        {/* Header - rodomas tik prisijungus */}
        {username && (
          <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => (window.location.href = "/lobby")}
              >
                <span className="text-2xl group-hover:rotate-12 transition-transform">
                  🐭
                </span>
                <h1 className="text-xl font-black italic tracking-tighter uppercase">
                  Mad <span className="text-indigo-500">Mouse</span>
                </h1>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Operative:
                </span>
                <span className="text-sm font-black text-indigo-400">
                  {username}
                </span>
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                  {username[0].toUpperCase()}
                </div>
              </div>
            </div>
          </header>
        )}

        <main className="container mx-auto px-4 py-8">
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

        <footer className="py-10 text-center opacity-50">
          <div className="inline-block px-4 py-1 rounded-full border border-slate-800">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em]">
              Mouse Engine v1.0.4{" "}
              <span className="text-green-600 ml-2 animate-pulse">●</span>
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
