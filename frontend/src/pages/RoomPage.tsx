import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { useRoomStore } from "../store/useRoomStore";
import { useAuthStore } from "../store/useAuthStore";
import { useLobbyStore } from "../store/useLobbyStore";

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const { roomName, hostName, players, isAdmin, clearRoom } = useRoomStore();
  const { username } = useAuthStore();
  const { rooms } = useLobbyStore();

  // Surandame patį save tarp žaidėjų, kad žinotume savo statusą
  const me = players.find((p) => p.username === username);
  const isAllReady = players.length >= 2 && players.every((p) => p.isReady);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // Prisijungimo informacija serveriui (kad refreshinus puslapį vėl įtrauktų)
    if (roomId && username) {
      socket.emit("join_room", { roomId, username });
    }

    return () => {
      // Išvalome store išeinant
      clearRoom();
    };
  }, [roomId, username, clearRoom]);

  const handleLeave = () => {
    socket.emit("leave_room", roomId);
    navigate("/lobby");
  };

  const toggleReady = () => {
    socket.emit("toggle_ready", roomId);
  };

  const handleStartGame = () => {
    if (isAllReady && isAdmin) {
      socket.emit("start_game", roomId);
    }
  };

  // Jei duomenys dar kraunami
  if (!roomName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">
          Entering Room...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden">
        {/* Headeris */}
        <div className="bg-slate-700/30 p-8 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              {roomName}
            </h2>
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">
              Host: {hostName}
            </p>
          </div>
          <button
            onClick={handleLeave}
            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2 rounded-xl border border-red-500/30 transition-all font-black text-[10px] uppercase"
          >
            Leave
          </button>
        </div>

        {/* Žaidėjų sąrašas */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">
              Squad Status
            </h3>
            <span className="bg-slate-900 text-indigo-400 px-3 py-1 rounded-lg text-xs font-mono border border-slate-700">
              {players.length} / 4
            </span>
          </div>

          <div className="grid gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                  player.username === username
                    ? "bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                    : "bg-slate-900/50 border-slate-800"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      player.username === hostName
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {player.username === hostName ? "👑" : "👤"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-lg tracking-tight">
                        {player.username}
                      </span>
                      {player.username === username && (
                        <span className="bg-indigo-500 text-[8px] px-1.5 py-0.5 rounded font-black text-white uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase">
                      {player.username === hostName ? "Commander" : "Operative"}
                    </p>
                  </div>
                </div>

                {/* SPALVOTAS READY STATUSAS */}
                <div
                  className={`px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${
                    player.isReady
                      ? "bg-green-500/10 border-green-500/50 text-green-500"
                      : "bg-red-500/10 border-red-500/50 text-red-500"
                  }`}
                >
                  {player.isReady ? "Ready" : "Not Ready"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Veiksmų zona */}
        <div className="p-8 bg-slate-900/50 border-t border-slate-700 flex flex-col gap-4">
          {/* READY MYGTUKAS (Visiems žaidėjams) */}
          <button
            onClick={toggleReady}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all transform active:scale-[0.97] border-2 ${
              me?.isReady
                ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10"
                : "bg-green-500/10 border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white shadow-lg shadow-green-500/10"
            }`}
          >
            {me?.isReady ? "Cancel Ready" : "I am Ready!"}
          </button>

          {/* START GAME MYGTUKAS (Tik Hostui) */}
          {isAdmin && (
            <button
              onClick={handleStartGame}
              disabled={!isAllReady}
              className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-tight transition-all transform ${
                isAllReady
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40 hover:-translate-y-1"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700"
              }`}
            >
              {players.length < 2
                ? "Waiting for Players..."
                : isAllReady
                  ? "Launch Match 🚀"
                  : "Waiting for Squad..."}
            </button>
          )}

          {!isAdmin && !isAllReady && (
            <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
              Waiting for all players to be ready...
            </p>
          )}
        </div>
      </div>

      <p className="text-center mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">
        Room ID: {roomId} • Secure Connection
      </p>
    </div>
  );
};

export default RoomPage;
