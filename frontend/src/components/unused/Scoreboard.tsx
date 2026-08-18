import React from "react";
import "./Scoreboard.css";

const Scoreboard: React.FC = () => {
  const scores = [
    { name: "Tu", points: 4 },
    { name: "Aistė", points: 2 },
    { name: "Giedrius", points: 8 },
  ];

  return (
    <div className="scoreboard">
      <h3>Taškai</h3>
      {scores.map((s, i) => (
        <div key={i} className="score-row">
          <span className="score-name">{s.name}</span>
          <div className="score-bar-bg">
            <div
              className="score-bar-fill"
              style={{ width: `${(s.points / 10) * 100}%` }}
            ></div>
          </div>
          <span className="score-num">{s.points}/10</span>
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;
