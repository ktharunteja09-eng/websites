import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();

  // Smooth physics spring for buttery responsiveness
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none origin-left"
      aria-hidden="true"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-[#2E4823] via-[#D3452B] to-[#E57315] shadow-[0_1px_6px_rgba(211,69,43,0.5)] origin-left"
        style={{ scaleX }}
      />
    </div>
  );
};
