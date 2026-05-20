import React from 'react';
import { motion, MotionValue, useScroll, useTransform } from 'motion/react';
import { parseNumSafe } from './utils';

type ScrollContainerRef = React.RefObject<HTMLElement | null>;

export const ParallaxScrollContext = React.createContext<ScrollContainerRef | null>(null);

export const useParallaxScrollProgress = (targetRef: React.RefObject<HTMLElement | null>) => {
  const scrollContainerRef = React.useContext(ParallaxScrollContext);

  return useScroll(
    scrollContainerRef
      ? {
          container: scrollContainerRef,
          target: targetRef,
          offset: ['start end', 'end start']
        }
      : {
          target: targetRef,
          offset: ['start end', 'end start']
        }
  );
};

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
