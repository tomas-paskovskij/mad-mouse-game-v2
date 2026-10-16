import React from "react";
import { useGameStore } from "../../store/useGameStore"; // Pritaikyk kelią pagal save

interface TaskTestPanelProps {
  roomId?: string;
}

export const TaskTestPanel: React.FC<TaskTestPanelProps> = ({ roomId }) => {
  // Paimame tą naujai sukurtą funkciją tiesiai iš store
  const testDrawCard = useGameStore((s) => s.testDrawCard);

  const handleClick = (type: "blessing" | "curse") => {
    if (!roomId) {
      console.warn("⚠️ Nėra roomId!");
      return;
    }
    testDrawCard(roomId, type);
  };

  return (
    <div
      style={{
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        backgroundColor: "rgba(18, 18, 18, 0.95)",
        border: "1px solid #444",
        padding: "14px",
        borderRadius: "10px",
        color: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: "bold",
          color: "#aaa",
          textTransform: "uppercase",
        }}
      >
        🧪 TaskDeck Testavimas
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => handleClick("blessing")}
          style={{
            background: "#2e7d32",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          + Blessing 🌟
        </button>
        <button
          onClick={() => handleClick("curse")}
          style={{
            background: "#c62828",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          + Curse 💀
        </button>
      </div>
    </div>
  );
};

export default TaskTestPanel;
