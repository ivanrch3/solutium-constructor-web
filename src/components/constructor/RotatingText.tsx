import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InlineEditableText } from './InlineEditableText';

interface RotatingTextProps {
  fixedText: string;
  options: string[];
  color?: string;
  gradient?: string;
  speed?: number; // duration in ms
  animationType?: 'fade' | 'slide' | 'typewriter';
  className?: string;
  moduleId?: string;
  isPreviewMode?: boolean;
  align?: 'left' | 'center' | 'right' | 'inherit';
  onSaveFixed?: (val: string) => void;
  onSaveOption?: (index: number, val: string) => void;
}

export const RotatingText: React.FC<RotatingTextProps> = ({
  fixedText,
  options,
  color = '#3B82F6',
  gradient,
  speed = 3000,
  animationType = 'fade',
  className = '',
  moduleId,
  isPreviewMode = false,
  align = 'inherit',
  onSaveFixed,
  onSaveOption
}) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (index >= options.length) {
      setIndex(0);
    }
  }, [options.length, index]);

  useEffect(() => {
    if (options.length <= 1 || isPaused) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % options.length);
    }, speed);

    return () => clearInterval(interval);
  }, [options, speed, isPaused]);

  const variants = {
    fade: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 }
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    typewriter: {
      initial: { opacity: 0, width: 0 },
      animate: { opacity: 1, width: 'auto' },
      exit: { opacity: 0 }
    }
  };

  const currentVariant = variants[animationType] || variants.fade;
  const currentOptionValue = options[index] || '';

  const isSafeGradient = gradient && !String(gradient).includes('NaN');
  const textStyle: React.CSSProperties = {
    color: isSafeGradient ? 'transparent' : color,
    backgroundImage: isSafeGradient ? gradient : 'none',
    WebkitBackgroundClip: isSafeGradient ? 'text' : 'initial',
    backgroundClip: isSafeGradient ? 'text' : 'initial',
    display: 'inline-block'
  };

  const isCentered = align === 'center';
  const lineAlignmentClass = isCentered ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';
  const dynamicLineMaxWidth = 'min(100%, 14ch)';

  return (
    <span 
      className={`flex w-full flex-col ${lineAlignmentClass} gap-[0.08em] whitespace-normal ${className}`}
      style={{ 
        textAlign: align === 'inherit' ? 'inherit' : align,
      }}
    >
      {fixedText && (
        <span className="block w-full max-w-full break-words [overflow-wrap:anywhere]">
          {moduleId ? (
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_hero_typography`}
              settingId="rotating_fixed"
              value={fixedText}
              isPreviewMode={isPreviewMode}
              onSave={onSaveFixed}
              tagName="span"
              className="block w-full max-w-full break-words [overflow-wrap:anywhere]"
            />
          ) : (
            <span className="block w-full max-w-full break-words [overflow-wrap:anywhere]">{fixedText}</span>
          )}
        </span>
      )}
      <span
        className="relative block w-full max-w-full overflow-visible py-[0.1em] -my-[0.1em] min-h-[1.2em]"
        style={{ maxWidth: dynamicLineMaxWidth }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={`${index}-${currentOptionValue}`}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="block w-full max-w-full whitespace-normal break-words [overflow-wrap:anywhere] align-baseline"
          >
            <RotatingOption
              value={currentOptionValue}
              index={index}
              moduleId={moduleId}
              isPreviewMode={isPreviewMode}
              onSaveOption={onSaveOption}
              style={textStyle}
              setIsPaused={setIsPaused}
            />
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
};

const RotatingOption: React.FC<{
  value: string;
  index: number;
  moduleId?: string;
  isPreviewMode: boolean;
  onSaveOption?: (index: number, val: string) => void;
  style: React.CSSProperties;
  setIsPaused: (paused: boolean) => void;
}> = ({ value, index, moduleId, isPreviewMode, onSaveOption, style, setIsPaused }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [fontScale, setFontScale] = useState(1);
  const isSingleWord = !/\s/.test(String(value || '').trim());

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const findAvailableWidth = () => {
      let node: HTMLElement | null = element.parentElement;

      while (node) {
        const computed = window.getComputedStyle(node);
        const width = node.clientWidth;
        const isUsableBlock = width > 0 && computed.display !== 'inline';

        if (isUsableBlock) {
          return width;
        }

        node = node.parentElement;
      }

      return 0;
    };

    const measure = () => {
      if (!element) return;

      element.style.fontSize = '1em';
      const naturalWidth = element.scrollWidth;
      const availableWidth = findAvailableWidth();

      if (!isSingleWord || !availableWidth || naturalWidth <= availableWidth) {
        setFontScale(1);
        return;
      }

      const nextScale = Math.max(0.72, Math.min(1, availableWidth / naturalWidth));
      setFontScale(nextScale);
    };

    measure();

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (resizeObserver) {
      let node: HTMLElement | null = element;
      let hops = 0;
      while (node && hops < 4) {
        resizeObserver.observe(node);
        node = node.parentElement;
        hops += 1;
      }
    } else {
      window.addEventListener('resize', measure);
    }

    return () => {
      resizeObserver?.disconnect();
      if (!resizeObserver) {
        window.removeEventListener('resize', measure);
      }
    };
  }, [value, isSingleWord]);

  return (
    <span 
      ref={ref}
      style={{
        ...style,
        lineHeight: 1.1,
        maxWidth: '100%',
        display: 'inline-block',
        fontSize: fontScale < 1 ? `${fontScale}em` : 'inherit'
      }}
      className={`inline-block max-w-full ${isSingleWord ? 'whitespace-nowrap' : 'whitespace-normal break-words [overflow-wrap:anywhere]'}`}
    >
      {moduleId ? (
        <InlineEditableText
          moduleId={moduleId}
          elementId={`${moduleId}_el_hero_typography`}
          settingId="rotating_options"
          value={value}
          isPreviewMode={isPreviewMode}
          onSave={(val) => {
            onSaveOption?.(index, val);
            setIsPaused(false);
          }}
          tagName="span"
          className={`inline-block max-w-full ${isSingleWord ? 'whitespace-nowrap' : 'whitespace-normal break-words [overflow-wrap:anywhere]'}`}
          onClick={() => setIsPaused(true)}
        />
      ) : (
        value
      )}
    </span>
  );
};
