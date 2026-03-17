import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import "./PlayerHand.css";

// Apibrėžiame, kokius duomenis komponentas gauna iš GamePage
interface PlayerHandProps {
  myCards: any[];
  setMyCards: React.Dispatch<React.SetStateAction<any[]>>;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ myCards, setMyCards }) => {
  const playCard = (cardId: string) => {
    setMyCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const isMadMouseReady = myCards.length >= 3;

  return (
    <div className="player-hand-wrapper">
      <div className="hand-container">
        <AnimatePresence mode="popLayout" initial={false}>
          {myCards?.map((card) => (
            <motion.div
              key={card.id}
              layout="position"
              // Animacija: korta atskrenda iš GameBoard vietos (initial y: -400)
              initial={{
                opacity: 0,
                scale: 0.3,
                y: -400,
                rotate: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                rotate: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.5,
                y: -150,
                transition: { duration: 0.2 },
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
              }}
              className="card-slot"
            >
              <Card {...card} onClick={() => playCard(card.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mad Mouse Mygtukas */}
      <div className="controls-area">
        <motion.button
          className={`mad-mouse-btn ${isMadMouseReady ? "active" : ""}`}
          animate={
            isMadMouseReady
              ? {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0px 0px 0px #ffd700",
                    "0px 0px 20px #ffd700",
                    "0px 0px 0px #ffd700",
                  ],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 2 }}
        >
          MAD MOUSE ({myCards.length}/10)
        </motion.button>
      </div>
    </div>
  );
};

export default PlayerHand;
