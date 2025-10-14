import { motion } from "framer-motion";

export default function FloatingBot() {
  return (
    <motion.img
      src="/src/assets/robot-floating.png"
      alt="Robot flotante"
      className="w-48 h-48 absolute top-1/3 right-10 opacity-90 drop-shadow-xl"
      animate={{
        y: [0, -20, 0],
        rotate: [0, 3, -3, 0],
      }}
      transition={{
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
  );
}
