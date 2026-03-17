import React from "react";
import { motion } from "framer-motion";
import "./ReactionTimer.css";

const ReactionTimer: React.FC = () => {
  return (
    <div style={{ textAlign: "center", marginBottom: "10px" }}>
      <div
        style={{ fontSize: "0.7rem", color: "#ff4444", marginBottom: "4px" }}
      >
        LAUKIAM REAKCIJŲ...
      </div>
      <div
        style={{
          width: "120px",
          height: "4px",
          background: "#333",
          margin: "0 auto",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 3, ease: "linear" }}
          style={{ height: "100%", background: "#ff4444" }}
        />
      </div>
    </div>
  );
};

export default ReactionTimer;
