import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { useRoomStore } from "../store/useRoomStore";
import { useAuthStore } from "../store/useAuthStore";

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // Duomenys iš Store
  const {
    roomName,
    hostName,
    players,
    isAdmin,
    password,
    setRoomData,
    clearRoom,
  } = useRoomStore();
  const { username } = useAuthStore();

  // Lokalios būsenos nustatymų redagavimui
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!socket.connected) socket.connect();

    // 1. JUNGIAMĖS PRIE KAMBARIO:
    // Siunčiame join_room tik jei mūsų dar nėra žaidėjų sąraše.
    // Tai apsaugo nuo dvigubo join, kai CreateRoomPage jau mus prijungė.
    const isAlreadyIn = players.some((p) => p.username === username);

    if (roomId && username && !isAlreadyIn) {
      console.log("🚀 RoomPage: Siunčiam join_room", {
        roomId,
        username,
        password,
      });
      socket.emit("join_room", { roomId, username, password });
    }

    // Funkcija, kuri apdoroja gautus kambarių sąrašus
    // const handleUpdate = (allRooms: any[]) => {
    //   const current = allRooms.find((r) => r.id === roomId);
    //   if (current) {
    //     setRoomData(current, username);
    //     if (!isEditing) setEditName(current.name);
    //   } else {
    //     // Jei kambario sąraše nebėra (pvz. ištrintas), grįžtame į lobby
    //     navigate("/lobby");
    //   }
    // };

    // 2. Klausomės TIK šio kambario atnaujinimų
    const handleRoomUpdate = (updatedRoom: any) => {
      if (updatedRoom.id === roomId) {
        setRoomData(updatedRoom, username);
        if (!isEditing) setEditName(updatedRoom.name);
      }
    };

    socket.on("room_data_update", handleRoomUpdate);

    // Klausomės serverio pranešimų
    // socket.on("update_rooms", handleUpdate);

    socket.on("kicked_from_room", () => {
      alert("You have been kicked by the host.");
      navigate("/lobby");
    });

    // Svarbu: Vos užkrovus puslapį, pasakome serveriui, kad mes čia
    // socket.emit("join_room", { roomId, username, password });
    // console.log("password", password);
    // console.log("roomname", roomName);
    // console.log("roomnid", roomId);
    // console.log("username", username);

    return () => {
      // socket.off("update_rooms", handleUpdate);
      socket.off("room_data_update", handleRoomUpdate);
      socket.off("kicked_from_room");
      // clearRoom(); // PATARIMAS: Jei meta null, laikinai užkomentuok šitą
    };
  }, [roomId, username]);

  // useEffect(() => {
  //   // Šitą eilutę IŠTRINK arba UŽKOMENTUOK:
  //   // socket.emit("join_room", { roomId, username });

  //   const handleUpdate = (allRooms: any[]) => {
  //     const current = allRooms.find((r) => r.id === roomId);
  //     if (current) setRoomData(current, username);
  //   };

  //   socket.on("update_rooms", handleUpdate);
  //   return () => socket.off("update_rooms", handleUpdate);
  // }, [roomId]);

  const handleLeave = () => {
    socket.emit("leave_room", roomId);
    clearRoom();
    navigate("/lobby");
  };

  const handleKick = (playerId: string) => {
    socket.emit("kick_player", { roomId, playerId });
  };

  const toggleReady = () => {
    socket.emit("toggle_ready", roomId);
  };

  // Jei dar neturime duomenų, rodome krovimąsi
  if (!roomName) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white font-black uppercase tracking-widest animate-pulse">
        Connecting to squad...
      </div>
    );
  }

  const myPlayer = players.find((p) => p.username === username);
  const allReady = players.length >= 2 && players.every((p) => p.isReady);

  return (
    <div className="max-w-2xl mx-auto p-4 py-10 text-white">
      <div className="bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden">
        {/* HEADERIS */}
        <div className="bg-slate-700/30 p-8 border-b border-slate-700 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                {roomName}
              </h2>
              {password && <span title="Private Room">🔒</span>}
            </div>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1">
              Command Post: {hostName}
            </p>
          </div>
          <button
            onClick={handleLeave}
            className="bg-red-500/10 text-red-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
          >
            Leave
          </button>
        </div>

        {/* ŽAIDĖJŲ SĄRAŠAS */}
        <div className="p-8">
          <div className="grid gap-3">
            {players.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  p.username === username
                    ? "bg-indigo-600/10 border-indigo-500/40"
                    : "bg-slate-900/30 border-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${p.username === hostName ? "bg-amber-500/20 text-amber-500" : "bg-slate-700 text-slate-400"}`}
                  >
                    {p.username === hostName ? "👑" : "👤"}
                  </div>
                  <span className="font-black text-lg">
                    {p.username} {p.username === username && "(YOU)"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {isAdmin && p.username !== username && (
                    <button
                      onClick={() => handleKick(p.id)}
                      className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1.5 rounded-lg border border-red-500/30 transition-all font-black text-[10px] uppercase"
                    >
                      Kick
                    </button>
                  )}
                  <div
                    className={`px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase ${p.isReady ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}`}
                  >
                    {p.isReady ? "Ready" : "Waiting"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VEIKSMŲ ZONA */}
        <div className="p-8 bg-slate-900/50 border-t border-slate-700 flex flex-col gap-4">
          <button
            onClick={toggleReady}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest border-2 transition-all ${
              myPlayer?.isReady
                ? "border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                : "border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]"
            }`}
          >
            {myPlayer?.isReady ? "Cancel Ready" : "Set Ready"}
          </button>

          {isAdmin && (
            <button
              disabled={!allReady}
              className={`w-full py-5 rounded-2xl font-black text-xl uppercase transition-all ${
                allReady
                  ? "bg-white text-slate-900 hover:bg-indigo-500 hover:text-white shadow-2xl"
                  : "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-50"
              }`}
            >
              {allReady ? "Launch Game 🚀" : "Wait for Squad"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
