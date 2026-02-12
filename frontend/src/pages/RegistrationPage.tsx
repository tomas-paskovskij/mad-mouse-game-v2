import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const RegistrationPage = () => {
  const [inputValue, setInputValue] = useState("");
  const setUsername = useAuthStore((state) => state.setUsername);
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length < 3) {
      alert("Vardas turi būti bent iš 3 simbolių!");
      return;
    }

    // Išsaugom į Zustand
    setUsername(inputValue);
    // Einam į Lobby sąrašą
    navigate("/lobby");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-slate-800 to-slate-950">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-96">
        <h1 className="text-4xl font-black text-center mb-2 text-indigo-400 tracking-tighter italic">
          MAD MOUSE
        </h1>
        <p className="text-slate-400 text-center mb-8 text-sm">
          Enter your nickname to start
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-1 ml-1">
              Nickname
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="E.g. SpeedRunner"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
          >
            ENTER GAME
          </button>
        </form>
      </div>

      <p className="mt-8 text-slate-600 text-xs">
        v1.0.0 Alpha • Playing as Guest
      </p>
    </div>
  );
};

export default RegistrationPage;
