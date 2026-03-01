import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";
import { useRoomStore } from "../store/useRoomStore";

const CreateRoomPage = () => {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const { setRoomData } = useRoomStore();

  const { username } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // Sėkmingo prisijungimo klausomės čia.
    // Jis suveiks po to, kai po kambario sukūrimo išsiųsime 'join_room'
    socket.on("join_success", (roomId) => {
      navigate(`/room/${roomId}`);
    });

    return () => {
      socket.off("join_success");
      socket.off("room_created");
    };
  }, [navigate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName.trim()) {
      alert("Please enter a room name!");
      return;
    }

    const roomInfo = {
      name: roomName,
      host: username,
      maxPlayers: maxPlayers,
      password: password.trim() || null, // Jei tuščias, siunčiam null
    };

    // 1. Išsiunčiame užklausą sukurti kambarį
    socket.emit("create_room", roomInfo);

    // socket.once("room_created", (newRoomId: string) => {
    //   console.log("dsfdsf", newRoomId);
    //   navigate(`/room/${newRoomId}`);
    // });

    // 2. Vienkartinis pasiklausymas: kai serveris patvirtina sukūrimą ir atsiunčia ID
    socket.once("room_created", (newRoom: any) => {
      setRoomData({
        roomId: newRoom.id,
        roomName: newRoom.name,
        hostName: null,
        players: [],
        maxPlayers: newRoom.maxPlayers,
        password: newRoom.password,
        isAdmin: false,
      });
      // 3. Iškart jungiamės prie to kambario naudodami ką tik suvestą slaptažodį
      socket.emit("join_room", {
        roomId: newRoom.id,
        username: username,
        password: roomInfo.password,
      });
      // navigate(`/room/${newRoom.id}`);
    });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl">
      <h2 className="text-3xl font-black mb-8 text-center text-white uppercase italic tracking-tighter">
        Create <span className="text-indigo-500">Mission</span>
      </h2>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Room Name Input */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Operation: Alpha..."
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
            autoFocus
          />
        </div>

        {/* Max Players Input */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">
            Max Operatives
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono font-bold text-xl"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest ml-1">
            Secret Access Key (Optional)
          </label>
          <input
            type="text" // Naudojame 'text', kad hostas matytų, ką rašo kurdamas
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave empty for public mission..."
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold placeholder:text-slate-700"
          />
          <p className="text-[9px] text-slate-600 mt-2 ml-1 uppercase font-bold italic">
            * Others will need this key to join your squad
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/lobby")}
            className="flex-1 bg-slate-700 hover:bg-slate-600 py-4 rounded-2xl font-black text-slate-300 transition-colors uppercase text-[10px] tracking-widest"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-white shadow-lg shadow-indigo-900/40 transition-all active:scale-95 uppercase text-[10px] tracking-widest"
          >
            Deploy Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomPage;
