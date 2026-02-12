import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";

const CreateRoomPage = () => {
  const [roomName, setRoomName] = useState("");
  const { username } = useAuthStore();
  const navigate = useNavigate();

  // Užtikriname, kad socketas būtų gyvas šiame puslapyje
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault(); // Neleidžiam puslapiui persikrauti

    if (!roomName.trim()) {
      alert("Please enter a room name!");
      return;
    }

    console.log("Sending create_room event with name:", roomName);

    // Išsiunčiame duomenis serveriui
    socket.emit("create_room", {
      name: roomName,
      host: username,
    });

    // Nukreipiame atgal į lobby, kur pamatysime naują sąrašą
    navigate("/lobby");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Create New Room
      </h2>

      <form onSubmit={handleCreate} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase ml-1">
            Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter a cool room name..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            autoFocus
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/lobby")}
            className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-bold text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-bold text-white shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
          >
            Create Room
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 italic">
          Host: <span className="text-indigo-400 font-bold">{username}</span>
        </p>
      </div>
    </div>
  );
};

export default CreateRoomPage;
