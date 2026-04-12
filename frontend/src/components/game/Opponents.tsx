import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import "./Opponents.css";

const Opponents: React.FC = () => {
  const { opponents, socket } = useGameStore();

  return (
    <div className="opponents-wrapper">
      {opponents.length === 0 ? (
        <div className="no-opponents">Laukiama žaidėjų...</div>
      ) : (
        opponents.map((player) => {
          const isMe = player.id === socket?.id;
          // Saugiklis: jei cards masyvo dar nėra, naudojame tuščią masyvą
          const playerCards = player.cards || [];

          return (
            <motion.div
              key={player.id}
              className={`opponent-card ${isMe ? "is-me" : ""}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="opponent-avatar">{isMe ? "⭐️" : "👤"}</div>

              <div className="opponent-info">
                <span className="name">
                  {player.username} {isMe ? "(Tu)" : ""}
                </span>

                {/* KORTŲ VIZUALIZACIJA */}
                <div className="opponent-hand-visual">
                  <div className="mini-cards-stack">
                    {/* Rodome nugarėles oponentams (iki tam tikro kiekio, kad neužkimštų ekrano) */}
                    {playerCards.slice(0, 10).map((_, i) => (
                      <motion.div
                        key={i}
                        className="card-back-mini"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          marginLeft: i === 0 ? 0 : "-12px",
                          zIndex: i,
                        }}
                      />
                    ))}
                    {/* Jei kortų daugiau nei 10, parodome pliusą */}
                    {playerCards.length > 10 && (
                      <span className="more-cards">+</span>
                    )}
                  </div>

                  <span className="card-count-text">
                    {playerCards.length} kortos
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default Opponents;
