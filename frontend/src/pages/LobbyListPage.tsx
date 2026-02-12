import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { useAuthStore } from "../store/useAuthStore";

const LobbyListPage = () => {
  const navigate = useNavigate();
  const { rooms } = useGameStore();
  const { username } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Viršutinė dalis: Antraštė ir kūrimo mygtukas */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            Game Lobby
          </h2>
          <p className="text-slate-400 text-sm">
            Join an existing game or create your own
          </p>
        </div>

        <button
          onClick={() => navigate("/create")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          + Create Room
        </button>
      </div>

      {/* Kambarių sąrašas */}
      <div className="grid gap-4">
        {rooms.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
            <div className="text-5xl mb-4">🐭</div>
            <h3 className="text-xl font-bold text-slate-300">No rooms found</h3>
            <p className="text-slate-500">
              Be the first one to start a madness!
            </p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className="bg-slate-800 border border-slate-700 p-5 rounded-2xl flex items-center justify-between hover:border-indigo-500/50 transition-colors shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center text-2xl">
                  🎮
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{room.name}</h3>
                  <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
                    Host: <span className="text-indigo-400">{room.host}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold text-slate-200">
                      {room.playerCount} / {room.maxPlayers}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    Players
                  </p>
                </div>

                <button
                  disabled={room.playerCount >= room.maxPlayers}
                  className={`px-6 py-2 rounded-lg font-black transition-all ${
                    room.playerCount >= room.maxPlayers
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-white text-slate-900 hover:bg-indigo-400 hover:text-white"
                  }`}
                >
                  JOIN
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer informacija */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
        <span>Region: Europe-West</span>
        <span>
          Server Status: <span className="text-green-600">Online</span>
        </span>
      </div>
    </div>
  );
};

export default LobbyListPage;
