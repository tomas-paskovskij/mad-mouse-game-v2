import React, { useRef, useState, useEffect, useCallback } from "react";
import "./CardSlider.css";

interface CardSliderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  showSeparators?: boolean;
  className?: string;
}

export function CardSlider<T>({
  items,
  renderItem,
  showSeparators = false,
  className = "",
}: CardSliderProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hiddenLeft, setHiddenLeft] = useState(0);
  const [hiddenRight, setHiddenRight] = useState(0);

  // Drag (vilkimo) būsenos
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const updateCounts = useCallback(() => {
    const el = containerRef.current;
    if (!el || items.length === 0) return;

    const scrollLeft = el.scrollLeft;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;

    // Tikriname, ar turinys išvis telpa
    if (scrollWidth <= clientWidth + 5) {
      setHiddenLeft(0);
      setHiddenRight(0);
      return;
    }

    const itemWidth = scrollWidth / items.length;

    const leftCount = Math.max(0, Math.ceil((scrollLeft - 5) / itemWidth));
    const rightCount = Math.max(
      0,
      Math.ceil((scrollWidth - scrollLeft - clientWidth - 5) / itemWidth),
    );

    setHiddenLeft(leftCount);
    setHiddenRight(rightCount);
  }, [items.length]);

  useEffect(() => {
    updateCounts();
    window.addEventListener("resize", updateCounts);
    return () => window.removeEventListener("resize", updateCounts);
  }, [updateCounts]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const amount = containerRef.current.clientWidth * 0.6;
      containerRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  // Pelės vilkimas (Drag to scroll)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftPos(containerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeftPos - walk;
    updateCounts();
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={`poker-slider-wrapper ${className}`}>
      {hiddenLeft > 0 && (
        <button
          className="slider-pill-btn slider-pill-btn--left"
          onClick={() => scroll("left")}
        >
          <span className="arrow-icon">◀</span>
          <span className="count-badge">+{hiddenLeft}</span>
        </button>
      )}

      <div
        className={`poker-slider-container ${isMouseDown ? "dragging" : ""}`}
        ref={containerRef}
        onScroll={updateCounts}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div className="poker-slider-item">{renderItem(item, index)}</div>
            {showSeparators && index < items.length - 1 && (
              <div className="slider-arrow-separator">➔</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {hiddenRight > 0 && (
        <button
          className="slider-pill-btn slider-pill-btn--right"
          onClick={() => scroll("right")}
        >
          <span className="count-badge">+{hiddenRight}</span>
          <span className="arrow-icon">▶</span>
        </button>
      )}
    </div>
  );
}

export default CardSlider;
