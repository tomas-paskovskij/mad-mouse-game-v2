import React from "react";

interface TrapsProps {
  count: number;
}

const TrapsOnTable: React.FC<TrapsProps> = ({ count }) => (
  <section className="traps-section">
    <h4 className="section-title">TRAPS ON TABLE (FACE DOWN)</h4>
    <div className="traps-list">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card-pile trap-card" />
      ))}
      <div className="trap-placeholder">+</div>
    </div>
  </section>
);

export default TrapsOnTable;
