import React from 'react';
import { motion, MotionValue, useTransform } from 'motion/react';
import { parseNumSafe } from './utils';

interface ParallaxBackgroundProps {
  scrollYProgress: MotionValue<number>;
  enabled: boolean;
  imageUrl: string;
  opacity: number;
  overlayColor: string;
  speed: number;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  scrollYProgress,
  enabled,
  imageUrl,
  opacity,
  overlayColor,
  speed
}) => {
  const validSpeed = parseNumSafe(speed, 100);
  const y = useTransform(scrollYProgress, [0, 1], [0, -validSpeed]);

  if (!enabled || !imageUrl) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div
        style={{ 
          y,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: `calc(100% + ${validSpeed}px)`,
          top: 0
        }}
        className="absolute inset-0 w-full"
      />
      <div 
        className="absolute inset-0 z-10" 
        style={{ 
          backgroundColor: overlayColor,
          opacity: opacity / 100
        }} 
      />
    </div>
  );
};
