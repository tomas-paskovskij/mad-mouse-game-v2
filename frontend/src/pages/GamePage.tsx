import React, { useState } from "react";
import { motion } from "framer-motion";
import GameBoard from "../components/game/GameBoard";
import PlayerHand from "../components/game/PlayerHand";
import Scoreboard from "../components/game/Scoreboard";
import Opponents from "../components/game/Opponents";
import cardsData from "../data/cards.json"; // Tavo kortų duomenų bazė
import "./GamePage.css";

const GamePage: React.FC = () => {
  const [currentPlayer] = useState("Tomas");

  // PAGRINDINĖ BŪSENA: čia gyvena tavo rankos kortos
  const [myCards, setMyCards] = useState<any[]>([]);

  // FUNKCIJA: Kortos traukimas
  const handleDrawCard = () => {
    console.log("1. Mygtukas paspaustas");

    if (myCards.length >= 10) {
      console.log("Limit pasiektas");
      return;
    }

    // Patikrinam ar cardsData apskritai egzistuoja
    if (!cardsData || cardsData.length === 0) {
      console.error("Klaida: cards.json tuščias arba neįkeltas!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * cardsData.length);
    const cardTemplate = cardsData[randomIndex];

    // Sukuriam visiškai naują objektą su unikaliu ID
    const newCard = {
      ...cardTemplate,
      id: `card-${Date.now()}-${Math.random()}`,
    };

    console.log("2. Nauja korta sukurta:", newCard);

    // SVARBU: Naudojame spread operatorių [...prev, newCard],
    // kad React suprastų, jog tai NAUJAS masyvas
    setMyCards((prev) => [...prev, newCard]);

    console.log("3. Būsena atnaujinta");
  };

  return (
    <motion.div
      className="game-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* VIRŠUS: Kiti žaidėjai */}
      <header className="game-header">
        <Opponents />
      </header>

      <main className="game-main-layout">
        {/* KAIRĖ: Rezultatai */}
        <aside className="game-sidebar">
          <Scoreboard />
        </aside>

        {/* VIDURYS: Stalas */}
        <section className="game-center">
          <div className="turn-indicator">
            Ėjimą atlieka: <span>{currentPlayer}</span>
          </div>

          {/* Perduodame traukimo funkciją į GameBoard */}
          <GameBoard onDraw={handleDrawCard} />
        </section>
      </main>

      {/* APAČIA: Tavo kortos */}
      <footer className="game-footer">
        {/* Perduodame kortas ir jų valdymo funkciją */}
        <PlayerHand myCards={myCards} setMyCards={setMyCards} />
      </footer>
    </motion.div>
  );
};

export default GamePage;
