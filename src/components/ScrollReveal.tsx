import React from 'react';
import { motion, useInView } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.65,
  className = '',
  distance = 32,
  once = true,
}) => {
  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance };
      case 'down':
        return { opacity: 0, y: -distance };
      case 'left':
        return { opacity: 0, x: distance };
      case 'right':
        return { opacity: 0, x: -distance };
      case 'scale':
        return { opacity: 0, scale: 0.94 };
      case 'fade':
      default:
        return { opacity: 0 };
    }
  };

  const getTargetTransform = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      case 'scale':
        return { opacity: 1, scale: 1 };
      case 'fade':
      default:
        return { opacity: 1 };
    }
  };

  return (
    <motion.div
      initial={getInitialTransform()}
      whileInView={getTargetTransform()}
      viewport={{ once, margin: '-60px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Buttery cubic bezier deceleration curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
