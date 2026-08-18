import React from "react";

interface Card {
  id: number;
  type: string;
  icon: string;
}

interface ChainPreviewProps {
  cards: Card[];
}

const ChainPreview: React.FC<ChainPreviewProps> = ({ cards }) => (
  <section className="chain-section">
    <h4 className="section-title">CHAIN (WILL RESOLVE IN ORDER)</h4>
    <div className="chain-list">
      {cards.map((card, idx) => (
        <React.Fragment key={card.id}>
          <div className="chain-card">
            <span className="step-number">{idx + 1}</span>
            <div className="mini-card">
              <span className="card-icon">{card.icon}</span>
            </div>
          </div>
          {idx < cards.length - 1 && <span className="arrow">➔</span>}
        </React.Fragment>
      ))}
    </div>
  </section>
);

export default ChainPreview;
