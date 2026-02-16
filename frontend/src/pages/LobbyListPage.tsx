import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";
import { useLobbyStore } from "../store/useLobbyStore";

const LobbyListPage = () => {
  const navigate = useNavigate();
  const { username } = useAuthStore();
  const { rooms } = useLobbyStore();

  useEffect(() => {
    // Užtikriname, kad socketas prijungtas
    if (!socket.connected) {
      socket.connect();
    }

    // Klausomės join_success, kad nukreiptume į kambarį
    socket.on("join_success", (roomId) => {
      navigate(`/room/${roomId}`);
    });

    return () => {
      socket.off("join_success");
    };
  }, [navigate]);

  const handleJoin = (roomId: string) => {
    if (!username) return;

    // 1. Pirmiausia užregistruojame vienkartinį klausytoją sėkmei
    socket.once("join_success", (id) => {
      console.log("Gavau join_success, nukreipiu...");
      navigate(`/room/${id}`);
    });

    // 2. Tada siunčiame žinutę
    socket.emit("join_room", {
      roomId: roomId,
      username: username,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Viršutinė dalis su "Create" mygtuku */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            Game <span className="text-indigo-500">Lobby</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">
            Select an active session to join
          </p>
        </div>
        <button
          onClick={() => navigate("/create")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-4 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 active:scale-95 uppercase text-sm tracking-widest"
        >
          + Create Room
        </button>
      </div>

      {/* Kambarių sąrašas */}
      <div className="grid gap-4">
        {rooms.length === 0 ? (
          <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-[2rem] p-20 text-center">
            <div className="text-5xl mb-4 opacity-20">🕳️</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest">
              No active rooms found. Be the first to create one!
            </p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className="bg-slate-800 border border-slate-700 p-6 rounded-[1.5rem] flex flex-col md:flex-row justify-between items-center gap-6 hover:border-indigo-500/50 transition-all group shadow-xl"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl border border-slate-700 group-hover:scale-110 transition-transform shadow-inner">
                  🎮
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      Hosted by{" "}
                      <span className="text-indigo-400">{room.host}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto md:gap-8 bg-slate-900/50 md:bg-transparent p-4 md:p-0 rounded-xl">
                <div className="flex flex-col items-center md:items-end">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                    Players
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xl font-mono font-black ${room.players.length >= room.maxPlayers ? "text-red-500" : "text-white"}`}
                    >
                      {room.players.length}
                    </span>
                    <span className="text-slate-600 font-black">/</span>
                    <span className="text-slate-400 font-mono font-bold">
                      {room.maxPlayers}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoin(room.id)}
                  disabled={room.playerCount >= room.maxPlayers}
                  className={`px-10 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all transform active:scale-95 shadow-lg ${
                    room.playerCount >= room.maxPlayers
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-white text-slate-900 hover:bg-indigo-500 hover:text-white"
                  }`}
                >
                  {room.players.length >= room.maxPlayers
                    ? "Full"
                    : "Join Room"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer statistika */}
      <div className="mt-10 flex justify-center gap-8 border-t border-slate-800 pt-8">
        <div className="text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
            Online Players
          </p>
          <p className="text-white font-mono font-bold">--</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
            Active Rooms
          </p>
          <p className="text-white font-mono font-bold">{rooms.length}</p>
        </div>
      </div>
    </div>
  );
};

export default LobbyListPage;
