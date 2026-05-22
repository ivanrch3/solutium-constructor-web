import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InlineEditableText } from './InlineEditableText';

interface RotatingTextProps {
  fixedText: string;
  options: string[];
  color?: string;
  gradient?: string;
  speed?: number;
  animationType?: 'fade' | 'slide' | 'typewriter';
  className?: string;
  moduleId?: string;
  isPreviewMode?: boolean;
  align?: 'left' | 'center' | 'right' | 'inherit';
  onSaveFixed?: (val: string) => void;
  onSaveOption?: (index: number, val: string) => void;
}

interface RotatingMetric {
  fontScale: number;
  fontWeight: number | null;
}

const DEFAULT_METRIC: RotatingMetric = {
  fontScale: 1,
  fontWeight: null
};

const getOptionKey = (value: string, index: number) => `${index}::${value}`;

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
  const [metrics, setMetrics] = useState<Record<string, RotatingMetric>>({});
  const lineRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const measureFrameRef = useRef<number | null>(null);

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
  const currentOptionKey = getOptionKey(currentOptionValue, index);

  const isSafeGradient = gradient && !String(gradient).includes('NaN');
  const textStyle: React.CSSProperties = {
    color: isSafeGradient ? 'transparent' : color,
    backgroundImage: isSafeGradient ? gradient : 'none',
    WebkitBackgroundClip: isSafeGradient ? 'text' : 'initial',
    backgroundClip: isSafeGradient ? 'text' : 'initial',
    display: 'inline-block'
  };

  const metricsSignature = useMemo(() => options.join('|'), [options]);

  useLayoutEffect(() => {
    const container = lineRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const getAvailableWidth = () => {
      const heading = container.closest('h1, h2, h3, h4, h5, h6') as HTMLElement | null;
      const widthCandidates = [
        container,
        container.parentElement,
        heading
      ].filter(Boolean) as HTMLElement[];

      const measuredWidths = widthCandidates
        .map((element) => Math.max(element.clientWidth, element.getBoundingClientRect().width))
        .filter((width) => Number.isFinite(width) && width > 0);

      return measuredWidths.length > 0 ? Math.max(...measuredWidths) - 2 : 0;
    };

    const computeMetrics = () => {
      const availableWidth = getAvailableWidth();
      if (!availableWidth) return;

      const computedStyle = window.getComputedStyle(container);
      const baseWeight = Number.parseInt(computedStyle.fontWeight, 10);
      const safeBaseWeight = Number.isFinite(baseWeight) ? baseWeight : 800;

      measure.style.fontFamily = computedStyle.fontFamily;
      measure.style.fontStyle = computedStyle.fontStyle;
      measure.style.fontStretch = computedStyle.fontStretch;
      measure.style.fontVariant = computedStyle.fontVariant;
      measure.style.fontKerning = computedStyle.fontKerning;
      measure.style.letterSpacing = computedStyle.letterSpacing;
      measure.style.textTransform = computedStyle.textTransform;
      const nextMetrics: Record<string, RotatingMetric> = {};

      options.forEach((option, optionIndex) => {
        const key = getOptionKey(option, optionIndex);
        const isSingleWord = !/\s/.test(String(option || '').trim());

        if (!option || !isSingleWord) {
          nextMetrics[key] = DEFAULT_METRIC;
          return;
        }

        measure.textContent = option;
        measure.style.fontSize = '1em';
        measure.style.fontWeight = String(safeBaseWeight);

        let measuredWidth = measure.scrollWidth;

        if (measuredWidth <= availableWidth) {
          nextMetrics[key] = DEFAULT_METRIC;
          return;
        }

        const weightCandidates = [safeBaseWeight, ...Array.from(
          new Set(
            [safeBaseWeight - 100, safeBaseWeight - 200, safeBaseWeight - 300, safeBaseWeight - 400, 700, 600, 500].filter(
              (candidate) => candidate >= 400 && candidate < safeBaseWeight
            )
          )
        )];

        let bestMetric: RotatingMetric = {
          fontScale: Math.max(0.64, Math.min(1, availableWidth / measuredWidth)),
          fontWeight: null
        };

        for (const candidate of weightCandidates) {
          measure.style.fontWeight = String(candidate);
          measuredWidth = measure.scrollWidth;
          const candidateMetric: RotatingMetric = {
            fontScale: Math.max(0.64, Math.min(1, availableWidth / measuredWidth)),
            fontWeight: candidate === safeBaseWeight ? null : candidate
          };

          const candidateWeightValue = candidateMetric.fontWeight ?? safeBaseWeight;
          const bestWeightValue = bestMetric.fontWeight ?? safeBaseWeight;
          const isBetterScale = candidateMetric.fontScale > bestMetric.fontScale + 0.005;
          const isBetterWeight =
            Math.abs(candidateMetric.fontScale - bestMetric.fontScale) <= 0.005 &&
            candidateWeightValue > bestWeightValue;

          if (isBetterScale || isBetterWeight) {
            bestMetric = candidateMetric;
          }
        }

        nextMetrics[key] = bestMetric;
      });

      setMetrics((prev) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(nextMetrics);

        if (prevKeys.length !== nextKeys.length) {
          return nextMetrics;
        }

        for (const key of nextKeys) {
          const previousMetric = prev[key];
          const nextMetric = nextMetrics[key];
          if (
            !previousMetric ||
            previousMetric.fontScale !== nextMetric.fontScale ||
            previousMetric.fontWeight !== nextMetric.fontWeight
          ) {
            return nextMetrics;
          }
        }

        return prev;
      });
    };

    const scheduleComputeMetrics = () => {
      if (measureFrameRef.current !== null) {
        cancelAnimationFrame(measureFrameRef.current);
      }

      measureFrameRef.current = requestAnimationFrame(() => {
        measureFrameRef.current = requestAnimationFrame(() => {
          computeMetrics();
        });
      });
    };

    scheduleComputeMetrics();

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleComputeMetrics) : null;
    if (resizeObserver) {
      resizeObserver.observe(container);
      if (container.parentElement) {
        resizeObserver.observe(container.parentElement);
      }
      const heading = container.closest('h1, h2, h3, h4, h5, h6');
      if (heading instanceof HTMLElement && heading !== container.parentElement) {
        resizeObserver.observe(heading);
      }
    } else {
      window.addEventListener('resize', scheduleComputeMetrics);
    }

    const fontSet = typeof document !== 'undefined' ? (document as Document & { fonts?: FontFaceSet }).fonts : undefined;
    const handleFontsChanged = () => {
      scheduleComputeMetrics();
    };

    if (fontSet) {
      fontSet.ready.then(handleFontsChanged).catch(() => undefined);
      fontSet.addEventListener?.('loadingdone', handleFontsChanged);
      fontSet.addEventListener?.('loadingerror', handleFontsChanged);
    }

    return () => {
      resizeObserver?.disconnect();
      if (!resizeObserver) {
        window.removeEventListener('resize', scheduleComputeMetrics);
      }
      if (fontSet) {
        fontSet.removeEventListener?.('loadingdone', handleFontsChanged);
        fontSet.removeEventListener?.('loadingerror', handleFontsChanged);
      }
      if (measureFrameRef.current !== null) {
        cancelAnimationFrame(measureFrameRef.current);
        measureFrameRef.current = null;
      }
    };
  }, [metricsSignature]);

  const isCentered = align === 'center';
  const lineAlignmentClass = isCentered ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';
  const dynamicLineMaxWidth = '100%';
  const currentMetric = metrics[currentOptionKey] || DEFAULT_METRIC;

  return (
    <span
      className={`flex w-full flex-col ${lineAlignmentClass} gap-[0.08em] whitespace-normal ${className}`}
      style={{
        textAlign: align === 'inherit' ? 'inherit' : align
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
        ref={lineRef}
        className="relative block w-full max-w-full overflow-visible py-[0.1em] -my-[0.1em] min-h-[1.2em]"
        style={{ maxWidth: dynamicLineMaxWidth }}
      >
        <span
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 inline-block whitespace-nowrap opacity-0"
          style={{
            visibility: 'hidden',
            maxWidth: 'none',
            lineHeight: 1.1
          }}
        />

        <AnimatePresence mode="wait">
          <motion.span
            key={`${index}-${currentOptionValue}`}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="block w-full max-w-full whitespace-normal break-words [overflow-wrap:anywhere] align-baseline"
          >
            <RotatingOption
              value={currentOptionValue}
              index={index}
              moduleId={moduleId}
              isPreviewMode={isPreviewMode}
              onSaveOption={onSaveOption}
              style={textStyle}
              metric={currentMetric}
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
  metric: RotatingMetric;
  setIsPaused: (paused: boolean) => void;
}> = ({ value, index, moduleId, isPreviewMode, onSaveOption, style, metric, setIsPaused }) => {
  const isSingleWord = !/\s/.test(String(value || '').trim());
  const dynamicStyle: React.CSSProperties = {
    ...style,
    lineHeight: 1.1,
    maxWidth: '100%',
    display: 'inline-block',
    fontSize: metric.fontScale < 1 ? `${metric.fontScale}em` : 'inherit',
    fontWeight: metric.fontWeight ?? style.fontWeight
  };

  return (
    <span
      style={dynamicStyle}
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
          style={dynamicStyle}
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
