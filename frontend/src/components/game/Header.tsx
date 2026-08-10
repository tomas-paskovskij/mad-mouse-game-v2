import React from "react";

interface HeaderProps {
  round: string;
  turnText: string;
  timer: string;
}

const Header: React.FC<HeaderProps> = ({ round, turnText, timer }) => (
  <header className="game-header">
    <div className="round-badge">{round}</div>
    <div className="turn-pill active">{turnText}</div>
    <div className="timer-badge">{timer}</div>
  </header>
);

export default Header;
