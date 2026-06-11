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
  fontSizePx: number | null;
  fontWeight: number | null;
}

const DEFAULT_METRIC: RotatingMetric = {
  fontSizePx: null,
  fontWeight: null
};

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
  const [sharedMetric, setSharedMetric] = useState<RotatingMetric>(DEFAULT_METRIC);
  const lineRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const activeOptionRef = useRef<HTMLSpanElement>(null);
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
      const width = Math.max(container.clientWidth, container.getBoundingClientRect().width);
      return Number.isFinite(width) && width > 0 ? width - 2 : 0;
    };

    const roundMetric = (metric: RotatingMetric): RotatingMetric => ({
      fontSizePx: metric.fontSizePx === null ? null : Math.round(metric.fontSizePx * 100) / 100,
      fontWeight: metric.fontWeight
    });

    const computeMetrics = () => {
      const availableWidth = getAvailableWidth();
      if (!availableWidth) return;

      const computedStyle = window.getComputedStyle(container);
      const baseWeight = Number.parseInt(computedStyle.fontWeight, 10);
      const safeBaseWeight = Number.isFinite(baseWeight) ? baseWeight : 800;
      const baseFontSize = Number.parseFloat(computedStyle.fontSize);
      const safeBaseFontSize = Number.isFinite(baseFontSize) ? baseFontSize : 16;
      const minimumFontSize = 12;

      measure.style.fontFamily = computedStyle.fontFamily;
      measure.style.fontStyle = computedStyle.fontStyle;
      measure.style.fontStretch = computedStyle.fontStretch;
      measure.style.fontVariant = computedStyle.fontVariant;
      measure.style.fontKerning = computedStyle.fontKerning;
      measure.style.letterSpacing = computedStyle.letterSpacing;
      measure.style.textTransform = computedStyle.textTransform;
      measure.style.whiteSpace = 'nowrap';
      measure.style.display = 'inline-block';

      let nextMetric: RotatingMetric = DEFAULT_METRIC;

      options.forEach((option) => {
        const safeOption = String(option || '').trim();
        if (!safeOption) return;

        let bestMetricForOption: RotatingMetric = DEFAULT_METRIC;
        measure.textContent = option;
        measure.style.fontSize = '1em';
        measure.style.fontWeight = String(safeBaseWeight);

        let measuredWidth = measure.scrollWidth;
        const weightCandidates = [safeBaseWeight, ...Array.from(
          new Set(
            [safeBaseWeight - 100, safeBaseWeight - 200, safeBaseWeight - 300, safeBaseWeight - 400, 700, 600, 500].filter(
              (candidate) => candidate >= 400 && candidate < safeBaseWeight
            )
          )
        )];

        for (const candidate of weightCandidates) {
          measure.style.fontWeight = String(candidate);
          measuredWidth = measure.scrollWidth;
          const nextFontSizePx = Math.max(
            minimumFontSize,
            Math.min(safeBaseFontSize, safeBaseFontSize * (availableWidth / measuredWidth))
          );
          const candidateMetric: RotatingMetric = {
            fontSizePx: nextFontSizePx,
            fontWeight: candidate === safeBaseWeight ? null : candidate
          };

          const candidateWeightValue = candidateMetric.fontWeight ?? safeBaseWeight;
          const bestWeightValue = bestMetricForOption.fontWeight ?? safeBaseWeight;
          const candidateScale = candidateMetric.fontSizePx / safeBaseFontSize;
          const bestScale = (bestMetricForOption.fontSizePx ?? safeBaseFontSize) / safeBaseFontSize;
          const isBetterScale = candidateScale > bestScale + 0.005;
          const isBetterWeight =
            Math.abs(candidateScale - bestScale) <= 0.005 &&
            candidateWeightValue > bestWeightValue;

          if (isBetterScale || isBetterWeight) {
            bestMetricForOption = candidateMetric;
          }
        }

        const bestScale = (bestMetricForOption.fontSizePx ?? safeBaseFontSize) / safeBaseFontSize;
        const currentScale = (nextMetric.fontSizePx ?? safeBaseFontSize) / safeBaseFontSize;
        const shouldReplaceSharedMetric =
          bestScale < currentScale - 0.005 ||
          (
            Math.abs(bestScale - currentScale) <= 0.005 &&
            (bestMetricForOption.fontWeight ?? safeBaseWeight) < (nextMetric.fontWeight ?? safeBaseWeight)
          );

        if (shouldReplaceSharedMetric) {
          nextMetric = bestMetricForOption;
        }
      });

      const roundedMetric = roundMetric(nextMetric);
      setSharedMetric((prev) => {
        if (
          prev.fontSizePx === roundedMetric.fontSizePx &&
          prev.fontWeight === roundedMetric.fontWeight
        ) {
          return prev;
        }
        return roundedMetric;
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

  useLayoutEffect(() => {
    const container = lineRef.current;
    const activeOption = activeOptionRef.current;
    if (!container || !activeOption) return;

    let frameId = requestAnimationFrame(() => {
      const availableWidth = Math.max(container.clientWidth, container.getBoundingClientRect().width) - 2;
      if (!Number.isFinite(availableWidth) || availableWidth <= 0) return;

      const optionWidth = activeOption.scrollWidth;
      if (!Number.isFinite(optionWidth) || optionWidth <= availableWidth + 1.5) return;

      const computedStyle = window.getComputedStyle(activeOption);
      const currentFontSize = Number.parseFloat(computedStyle.fontSize);
      const safeCurrentFontSize = Number.isFinite(currentFontSize)
        ? currentFontSize
        : (sharedMetric.fontSizePx ?? 16);
      const nextFontSizePx = Math.max(
        12,
        Math.floor((safeCurrentFontSize * (availableWidth / optionWidth)) * 100) / 100
      );

      if (!Number.isFinite(nextFontSizePx) || safeCurrentFontSize - nextFontSizePx < 1) {
        return;
      }

      setSharedMetric((prev) => {
        const previousFontSize = prev.fontSizePx ?? safeCurrentFontSize;
        if (previousFontSize - nextFontSizePx < 0.5) {
          return prev;
        }
        return {
          ...prev,
          fontSizePx: nextFontSizePx
        };
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [currentOptionValue, index, sharedMetric.fontSizePx]);

  const isCentered = align === 'center';
  const lineAlignmentClass = isCentered ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';
  const dynamicLineMaxWidth = '100%';
  const currentMetric = sharedMetric;

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
        data-solutium-rotating-line="true"
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
            className="block w-full max-w-full whitespace-nowrap align-baseline"
          >
            <RotatingOption
              value={currentOptionValue}
              index={index}
              moduleId={moduleId}
              isPreviewMode={isPreviewMode}
              onSaveOption={onSaveOption}
              style={textStyle}
              metric={currentMetric}
              optionRef={activeOptionRef}
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
  optionRef?: React.RefObject<HTMLSpanElement | null>;
  style: React.CSSProperties;
  metric: RotatingMetric;
  setIsPaused: (paused: boolean) => void;
}> = ({ value, index, moduleId, isPreviewMode, onSaveOption, optionRef, style, metric, setIsPaused }) => {
  const dynamicStyle: React.CSSProperties = {
    ...style,
    lineHeight: 1.1,
    display: 'inline-block',
    fontSize: metric.fontSizePx ? `${metric.fontSizePx}px` : 'inherit',
    fontWeight: metric.fontWeight ?? style.fontWeight,
    whiteSpace: 'nowrap',
    maxWidth: 'none',
    overflow: 'visible',
    textOverflow: 'clip',
    wordBreak: 'normal',
    overflowWrap: 'normal'
  };

  return (
    <span
      ref={optionRef}
      data-solutium-rotating-option="true"
      style={dynamicStyle}
      className="inline-block whitespace-nowrap"
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
          className="inline-block whitespace-nowrap"
          onClick={() => setIsPaused(true)}
        />
      ) : (
        value
      )}
    </span>
  );
};
