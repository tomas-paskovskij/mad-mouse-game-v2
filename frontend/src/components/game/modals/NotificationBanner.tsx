import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../../store/useGameStore";

export const NotificationBanner: React.FC = () => {
  // Pasiimame pranešimo būseną tiesiai iš Zustand store
  const notification = useGameStore((s) => s.notification);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className={`notif notif--${notification.type}`}
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
        >
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
