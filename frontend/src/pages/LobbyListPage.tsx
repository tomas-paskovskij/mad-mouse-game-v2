import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";
import { useLobbyStore } from "../store/useLobbyStore";
import { useRoomStore } from "../store/useRoomStore";

const LobbyListPage = () => {
  const navigate = useNavigate();
  const { username } = useAuthStore();
  const { rooms, setRooms } = useLobbyStore();
  const { clearRoom, setRoomData } = useRoomStore();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // 1. Išvalome seną būseną
    clearRoom();

    // 2. Klausomės sąrašo atnaujinimų
    socket.on("update_rooms", (serverRooms) => {
      const formatted = serverRooms.map((r: any) => ({
        id: r.id,
        name: r.name,
        host: r.host,
        playerCount: r.players.length,
        maxPlayers: r.maxPlayers,
        hasPassword: !!r.password,
      }));
      setRooms(formatted);
    });

    // 3. Klausomės sėkmingo prisijungimo patvirtinimo
    socket.on("join_success", (roomId) => {
      navigate(`/room/${roomId}`);
    });

    socket.emit("get_rooms");

    return () => {
      socket.off("update_rooms");
      socket.off("join_success");
    };
  }, [navigate, setRooms, clearRoom]);

  const handleJoin = (room: any) => {
    let passwordToSend: string | null = null;

    if (room.hasPassword) {
      const pass = prompt(
        `[ENCRYPTION REQUIRED] Enter Access Key for ${room.name}:`,
      );
      if (pass === null) return;
      passwordToSend = pass.trim();
    }

    // Paruošiam store ir siunčiam užklausą
    setRoomData({ id: room.id, password: passwordToSend }, username || "");

    socket.emit("join_room", {
      roomId: room.id,
      username: username,
      password: passwordToSend,
    });

    // navigate(`/room/${room.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* HEADERIS */}
      <div className="flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
            Available <span className="text-indigo-500">Missions</span>
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 ml-1">
            Status: Scanning for active signals...
          </p>
        </div>

        <button
          onClick={() => navigate("/create")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-indigo-900/40 border-b-4 border-indigo-800"
        >
          Create New Mission
        </button>
      </div>

      {/* KAMBARIŲ SĄRAŠAS */}
      <div className="grid gap-6">
        {rooms.length === 0 ? (
          <div className="bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-[3rem] py-24 text-center">
            <div className="text-5xl mb-4 opacity-20">📡</div>
            <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.5em]">
              No encrypted signals detected in this sector
            </p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className="bg-slate-800/50 border border-slate-700 p-8 rounded-[2.5rem] flex justify-between items-center group hover:bg-slate-800 hover:border-indigo-500/50 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center gap-8">
                {/* Status Icon */}
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl border-2 transition-all ${
                    room.hasPassword
                      ? "bg-slate-900 border-slate-700 text-slate-500 group-hover:border-amber-500/50 group-hover:text-amber-500"
                      : "bg-slate-900 border-slate-700 text-slate-500 group-hover:border-indigo-500/50 group-hover:text-indigo-500"
                  }`}
                >
                  {room.hasPassword ? "🔒" : "🔓"}
                </div>

                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Commander:
                      </span>
                      <span className="text-[11px] font-black text-slate-300 uppercase">
                        {room.host}
                      </span>
                    </div>
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Squad:
                      </span>
                      <span
                        className={`text-[11px] font-black uppercase ${
                          room.playerCount >= room.maxPlayers
                            ? "text-red-500"
                            : "text-indigo-400"
                        }`}
                      >
                        {room.playerCount} / {room.maxPlayers}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleJoin(room)}
                disabled={room.playerCount >= room.maxPlayers}
                className={`px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all ${
                  room.playerCount >= room.maxPlayers
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                    : "bg-white text-slate-900 hover:bg-indigo-500 hover:text-white active:scale-95 shadow-xl"
                }`}
              >
                {room.playerCount >= room.maxPlayers
                  ? "Mission Full"
                  : "Deploy Join"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LobbyListPage;
