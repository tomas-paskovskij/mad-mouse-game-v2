import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import { useGameStore, CardType } from "../../store/useGameStore";

export const HandSection: React.FC = () => {
  // Store būsenos ir veiksmai
  const myCards = useGameStore((s) => s.handCards) || [];
  const selectCard = useGameStore((s) => s.selectCard || s.setSelectedCard);

  const carouselRef = useRef<HTMLDivElement>(null);

  // Slinkties ir rodyklių būsenos
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hiddenLeftCount, setHiddenLeftCount] = useState(0);
  const [hiddenRightCount, setHiddenRightCount] = useState(0);

  // Drag-to-scroll (pratempimo) būsenos
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Apskaičiuojame paslėptų kortų skaičių ir ar galima slinkti
  const updateScrollState = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;

    const canLeft = scrollLeft > 5;
    const canRight = scrollLeft < scrollWidth - clientWidth - 5;

    setCanScrollLeft(canLeft);
    setCanScrollRight(canRight);

    if (myCards.length > 0 && scrollWidth > clientWidth) {
      const cardWidth = scrollWidth / myCards.length;
      const leftCount = Math.floor(scrollLeft / cardWidth);
      const rightCount = Math.floor(
        (scrollWidth - scrollLeft - clientWidth) / cardWidth,
      );

      setHiddenLeftCount(Math.max(0, leftCount));
      setHiddenRightCount(Math.max(0, rightCount));
    } else {
      setHiddenLeftCount(0);
      setHiddenRightCount(0);
    }
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [myCards]);

  // Slinkimas paspaudus rodyklę
  const handleScroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Slinkimas pelės ratuku
  const handleWheel = (e: React.WheelEvent) => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += e.deltaY;
      updateScrollState();
    }
  };

  // --- DRAG TO SCROLL LOGIKA ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !carouselRef.current) return;

    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;

    if (Math.abs(walk) > 5) {
      setIsDragging(true);
      e.preventDefault();
      carouselRef.current.scrollLeft = scrollLeft - walk;
      updateScrollState();
    }
  };

  const handleCardClick = (card: CardType) => {
    if (isDragging) return;
    if (!(card as any).hidden && selectCard) {
      selectCard(card);
    }
  };

  return (
    <section className="hand-section relative select-none">
      <div className="hand-label">YOUR HAND ({myCards.length})</div>

      <div className="relative flex items-center w-full">
        {/* Kairysis rodyklės mygtukas */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => handleScroll("left")}
              className="absolute left-2 z-30 flex items-center gap-1 bg-slate-900/90 hover:bg-indigo-600 text-white px-3 py-2 rounded-full border border-indigo-500/40 shadow-lg backdrop-blur-md cursor-pointer transition-colors"
            >
              <span className="text-sm font-bold">◀</span>
              {hiddenLeftCount > 0 && (
                <span className="text-xs bg-indigo-500/30 px-1.5 py-0.5 rounded-full font-mono">
                  +{hiddenLeftCount}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Karuselės konteineris su Tempimo (Drag) įvykiais */}
        <div
          className="hand-carousel-container w-full overflow-x-auto scrollbar-none"
          ref={carouselRef}
          onWheel={handleWheel}
          onScroll={updateScrollState}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          style={{
            cursor: isMouseDown ? "grabbing" : "grab",
          }}
        >
          <div className="hand-cards-track flex items-center py-4 px-8">
            <AnimatePresence mode="popLayout">
              {myCards.map((card: any, i: number) => (
                <motion.div
                  key={card.instanceId}
                  layout
                  className="hand-card-item shrink-0"
                  style={{
                    marginLeft: i === 0 ? 0 : 1,
                    zIndex: i,
                  }}
                  initial={{ y: 80, opacity: 0, scale: 0.7 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -80, opacity: 0, scale: 0.7 }}
                  transition={{ type: "spring", damping: 18, stiffness: 200 }}
                  whileHover={{
                    y: isDragging ? 0 : -25,
                    zIndex: 999,
                    transition: { duration: 0.1 },
                  }}
                  onClick={() => handleCardClick(card)}
                >
                  {card.hidden ? (
                    <div className="card-hidden-slot">?</div>
                  ) : (
                    <Card {...card} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {myCards.length === 0 && (
            <p className="hand-cards-empty text-center py-4 text-slate-400">
              Rankoje nėra kortų — trauk iš kaladės!
            </p>
          )}
        </div>

        {/* Dešinysis rodyklės mygtukas */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => handleScroll("right")}
              className="absolute right-2 z-30 flex items-center gap-1 bg-slate-900/90 hover:bg-indigo-600 text-white px-3 py-2 rounded-full border border-indigo-500/40 shadow-lg backdrop-blur-md cursor-pointer transition-colors"
            >
              {hiddenRightCount > 0 && (
                <span className="text-xs bg-indigo-500/30 px-1.5 py-0.5 rounded-full font-mono">
                  +{hiddenRightCount}
                </span>
              )}
              <span className="text-sm font-bold">▶</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HandSection;
