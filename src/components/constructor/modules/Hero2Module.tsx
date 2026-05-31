import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { InlineEditableText } from '../InlineEditableText';
import { TextRenderer } from '../TextRenderer';
import { parseNumSafe } from '../utils';

type Hero2Card = {
  id?: string;
  subtitle?: string;
  description?: string;
  bullets?: Array<{ text?: string } | string>;
};

const TITLE_SIZE_MAP: Record<string, keyof typeof TYPOGRAPHY_SCALE> = {
  t1: 't1',
  t2: 't2',
  t3: 't3'
};

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 20px 45px -28px rgba(15, 23, 42, 0.28)',
  md: '0 28px 60px -26px rgba(15, 23, 42, 0.34)'
};

const SPEED_MAP = {
  slow: 22,
  medium: 14,
  fast: 8
};

const GRAVITY_DISTANCE_MAP = {
  low: 6,
  medium: 12,
  high: 18
};

const GRAVITY_DURATION_MAP = {
  slow: 7,
  medium: 5,
  fast: 3.4
};

const DRIFT_AMOUNT_MAP = {
  subtle: 10,
  medium: 18,
  strong: 28
};

const toBoolean = (value: unknown, fallback: boolean) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  if (typeof value === 'number') return value === 1;
  return fallback;
};

const normalizeBullets = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && 'text' in item) return String((item as { text?: string }).text || '').trim();
      return '';
    })
    .filter(Boolean);
};

const normalizeCards = (raw: unknown): Hero2Card[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;

      const card = item as Record<string, unknown>;
      return {
        id: String(card.id || `card-${index + 1}`),
        subtitle: String(card.subtitle || ''),
        description: String(card.description || ''),
        bullets: Array.isArray(card.bullets) ? (card.bullets as Array<{ text?: string } | string>) : []
      };
    })
    .filter(Boolean) as Hero2Card[];
};

const isLikelyTransparentImage = (value: unknown) => {
  const normalized = String(value || '').toLowerCase().trim();
  if (!normalized) return false;

  return (
    /\.png($|[?#])/.test(normalized) ||
    /\.svg($|[?#])/.test(normalized) ||
    normalized.includes('format=png') ||
    normalized.includes('transparent')
  );
};

const getTypographyStyle = (sizeToken: string, weightToken: string) => {
  const size = TYPOGRAPHY_SCALE[(TITLE_SIZE_MAP[sizeToken] || sizeToken || 't2') as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.t2;
  const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.extrabold;
  return {
    fontSize: `${size.fontSize}px`,
    lineHeight: size.lineHeight,
    fontWeight: weight.value
  } as React.CSSProperties;
};

const getCardEffectVariants = (effect: string, phase: 'enter' | 'exit', reducedMotion: boolean) => {
  if (reducedMotion) {
    return { opacity: phase === 'enter' ? 1 : 0 };
  }

  switch (effect) {
    case 'fade-up':
      return phase === 'enter' ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -18, scale: 0.985 };
    case 'fade-down':
      return phase === 'enter' ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.985 };
    case 'fade-left':
      return phase === 'enter' ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -22, scale: 0.985 };
    case 'fade-right':
      return phase === 'enter' ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 22, scale: 0.985 };
    case 'zoom':
      return phase === 'enter' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 };
    case 'blur':
      return phase === 'enter'
        ? { opacity: 1, filter: 'blur(0px)', scale: 1 }
        : { opacity: 0, filter: 'blur(8px)', scale: 0.985 };
    case 'fade':
    default:
      return phase === 'enter' ? { opacity: 1 } : { opacity: 0 };
  }
};

export const Hero2Module: React.FC<{
  moduleId: string;
  settingsValues: Record<string, any>;
  isPreviewMode?: boolean;
}> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeCardIndex, setActiveCardIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);

  const getVal = React.useCallback((elementId: string | null, settingId: string, defaultValue: any) => {
    const prefixedKey = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;

    if (settingsValues[prefixedKey] !== undefined) {
      const value = settingsValues[prefixedKey];
      return value && typeof value === 'object' && 'value' in value && !Array.isArray(value) ? value.value : value;
    }

    if (elementId && elementId.startsWith(`${moduleId}_`)) {
      const fallbackElementId = elementId.replace(`${moduleId}_`, '');
      const fallbackKey = `${fallbackElementId}_${settingId}`;
      if (settingsValues[fallbackKey] !== undefined) {
        const value = settingsValues[fallbackKey];
        return value && typeof value === 'object' && 'value' in value && !Array.isArray(value) ? value.value : value;
      }
    }

    if (!elementId && settingsValues[settingId] !== undefined) {
      return settingsValues[settingId];
    }

    return defaultValue;
  }, [moduleId, settingsValues]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(media.matches);
    sync();

    const handler = () => sync();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }

    media.addListener(handler);
    return () => media.removeListener(handler);
  }, []);

  const layout = getVal(null, 'layout', 'main-left-secondary-right');
  const paddingTop = parseNumSafe(getVal(null, 'padding_top', 96), 96);
  const paddingBottom = parseNumSafe(getVal(null, 'padding_bottom', 96), 96);
  const minHeight = parseNumSafe(getVal(null, 'min_height', 640), 640);
  const contentMaxWidth = parseNumSafe(getVal(null, 'content_max_width', 1240), 1240);

  const backgroundType = getVal(null, 'background_type', 'gradient');
  const backgroundColor = getVal(null, 'background_color', '#0F172A');
  const gradientFrom = getVal(null, 'gradient_from', '#0F172A');
  const gradientTo = getVal(null, 'gradient_to', '#172554');
  const gradientDirection = getVal(null, 'gradient_direction', '135deg');
  const backgroundImage = getVal(null, 'background_image', '');
  const backgroundImagePosition = getVal(null, 'background_image_position', 'center center');
  const backgroundImageSize = getVal(null, 'background_image_size', 'cover');
  const overlayColor = getVal(null, 'overlay_color', '#020617');
  const overlayOpacity = Math.max(0, Math.min(100, parseNumSafe(getVal(null, 'overlay_opacity', 28), 28)));

  const speedLinesEnabled = toBoolean(getVal(null, 'speed_lines_enabled', true), true);
  const speedLinesDirection = getVal(null, 'speed_lines_direction', 'left-to-right');
  const speedLinesSpeed = getVal(null, 'speed_lines_speed', 'medium');
  const speedLinesIntensity = getVal(null, 'speed_lines_intensity', 'medium');
  const speedLinesColor = getVal(null, 'speed_lines_color', 'rgba(255,255,255,0.22)');
  const speedLinesOpacity = Math.max(0, Math.min(100, parseNumSafe(getVal(null, 'speed_lines_opacity', 36), 36)));
  const speedLinesMobileEnabled = toBoolean(getVal(null, 'speed_lines_mobile_enabled', false), false);

  const mainElementId = `${moduleId}_el_hero2_main`;
  const secondaryElementId = `${moduleId}_el_hero2_secondary`;
  const mediaElementId = `${moduleId}_el_hero2_media`;

  const mainEyebrow = getVal(mainElementId, 'main_eyebrow', 'PORTADA SOLUTIUM');
  const mainTitle = getVal(mainElementId, 'main_title', 'Automatiza, disena y publica con una portada lista para impactar.');
  const mainDescription = getVal(mainElementId, 'main_description', 'Una portada avanzada con estructura clara, movimiento controlado y espacio para mensajes secundarios rotativos sin romper el render publicado.');
  const mainTitleSize = getVal(mainElementId, 'main_title_size', 't1');
  const mainTitleColor = getVal(mainElementId, 'main_title_color', '#FFFFFF');
  const mainDescriptionColor = getVal(mainElementId, 'main_description_color', 'rgba(226,232,240,0.92)');
  const mainTextAlign = getVal(mainElementId, 'main_text_align', 'left');
  const primaryLabel = getVal(mainElementId, 'main_cta_primary_label', 'Solicitar demo');
  const primaryUrl = getVal(mainElementId, 'main_cta_primary_url', '#');
  const secondaryLabel = getVal(mainElementId, 'main_cta_secondary_label', 'Ver soluciones');
  const secondaryUrl = getVal(mainElementId, 'main_cta_secondary_url', '#');
  const mainGravityEnabled = toBoolean(getVal(mainElementId, 'main_gravity_enabled', true), true);
  const mainGravityIntensity = getVal(mainElementId, 'main_gravity_intensity', 'medium');
  const mainGravitySpeed = getVal(mainElementId, 'main_gravity_speed', 'medium');

  const secondaryCardsEnabled = toBoolean(getVal(secondaryElementId, 'secondary_cards_enabled', true), true);
  const secondaryCardIntervalMs = Math.max(1200, parseNumSafe(getVal(secondaryElementId, 'secondary_card_interval_ms', 4200), 4200));
  const secondaryCardEnterEffect = getVal(secondaryElementId, 'secondary_card_enter_effect', 'fade-up');
  const secondaryCardExitEffect = getVal(secondaryElementId, 'secondary_card_exit_effect', 'fade');
  const secondaryCardMotionDirection = getVal(secondaryElementId, 'secondary_card_motion_direction', 'right');
  const secondaryCardMotionIntensity = getVal(secondaryElementId, 'secondary_card_motion_intensity', 'subtle');
  const secondaryCardGravityEnabled = toBoolean(getVal(secondaryElementId, 'secondary_card_gravity_enabled', true), true);
  const secondaryCardGravityIntensity = getVal(secondaryElementId, 'secondary_card_gravity_intensity', 'low');
  const secondaryCardGravitySpeed = getVal(secondaryElementId, 'secondary_card_gravity_speed', 'slow');
  const rawCards = getVal(secondaryElementId, 'secondary_cards', []) as Hero2Card[];
  const secondaryCards = normalizeCards(rawCards);

  const heroImage = getVal(mediaElementId, 'hero2_image', '');
  const heroImageAlt = getVal(mediaElementId, 'hero2_image_alt', 'Visual principal');
  const imagePosition = getVal(mediaElementId, 'image_position', 'center center');
  const imageFit = getVal(mediaElementId, 'image_fit', 'contain');
  const imageRadius = parseNumSafe(getVal(mediaElementId, 'image_radius', 28), 28);
  const imageShadow = getVal(mediaElementId, 'image_shadow', 'sm');

  const activeCard = secondaryCards[activeCardIndex] || null;
  const shouldRotateCards =
    secondaryCardsEnabled &&
    !prefersReducedMotion &&
    secondaryCards.length > 1;

  React.useEffect(() => {
    if (!shouldRotateCards) {
      setActiveCardIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveCardIndex((current) => (current + 1) % secondaryCards.length);
    }, secondaryCardIntervalMs);

    return () => window.clearInterval(interval);
  }, [secondaryCardIntervalMs, secondaryCards.length, shouldRotateCards]);

  const mainGravityDistance = mainGravityEnabled && !prefersReducedMotion
    ? GRAVITY_DISTANCE_MAP[mainGravityIntensity as keyof typeof GRAVITY_DISTANCE_MAP] || 12
    : 0;
  const mainGravityDuration = GRAVITY_DURATION_MAP[mainGravitySpeed as keyof typeof GRAVITY_DURATION_MAP] || 5;

  const secondaryGravityDistance = secondaryCardGravityEnabled && !prefersReducedMotion
    ? GRAVITY_DISTANCE_MAP[secondaryCardGravityIntensity as keyof typeof GRAVITY_DISTANCE_MAP] || 6
    : 0;
  const secondaryGravityDuration = GRAVITY_DURATION_MAP[secondaryCardGravitySpeed as keyof typeof GRAVITY_DURATION_MAP] || 7;

  const driftAmount = !prefersReducedMotion && !isMobile && secondaryCards.length > 1
    ? DRIFT_AMOUNT_MAP[secondaryCardMotionIntensity as keyof typeof DRIFT_AMOUNT_MAP] || 10
    : 0;
  const driftTarget = secondaryCardMotionDirection === 'left'
    ? -driftAmount
    : secondaryCardMotionDirection === 'right'
      ? driftAmount
      : 0;

  const usesImageLayout = layout === 'main-left-image-right' || layout === 'image-left-main-right';
  const isImageFirst = layout === 'image-left-main-right';
  const isSecondaryFirst = layout === 'secondary-left-main-right';
  const safeImageShadow = SHADOW_MAP[imageShadow] || SHADOW_MAP.sm;
  const transparentImage = isLikelyTransparentImage(heroImage);

  const sectionBackground =
    backgroundType === 'gradient'
      ? `linear-gradient(${gradientDirection}, ${gradientFrom} 0%, ${gradientTo} 100%)`
      : backgroundType === 'color'
        ? backgroundColor
        : backgroundColor;

  const cardEnter = getCardEffectVariants(secondaryCardEnterEffect, 'enter', !!prefersReducedMotion);
  const cardExit = getCardEffectVariants(secondaryCardExitEffect, 'exit', !!prefersReducedMotion);
  const alignClass =
    mainTextAlign === 'center'
      ? 'items-center text-center'
      : mainTextAlign === 'right'
        ? 'items-end text-right'
        : 'items-start text-left';

  const mainBlock = (
    <motion.div
      className={`relative z-20 flex w-full max-w-[640px] flex-col gap-6 ${alignClass}`}
      animate={mainGravityDistance > 0 ? { y: [0, -mainGravityDistance, 0] } : undefined}
      transition={mainGravityDistance > 0 ? { duration: mainGravityDuration, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {mainEyebrow ? (
        <InlineEditableText
          moduleId={moduleId}
          elementId={mainElementId}
          settingId="main_eyebrow"
          value={mainEyebrow}
          tagName="span"
          isPreviewMode={isPreviewMode}
          className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/88 backdrop-blur-sm"
        />
      ) : null}

      <h2
        className="max-w-[12ch] break-words tracking-tight"
        style={{
          ...getTypographyStyle(mainTitleSize, 'extrabold'),
          color: mainTitleColor,
          textWrap: 'balance'
        }}
      >
        <InlineEditableText
          moduleId={moduleId}
          elementId={mainElementId}
          settingId="main_title"
          value={mainTitle}
          tagName="span"
          isPreviewMode={isPreviewMode}
          className="inline-block"
        >
          <TextRenderer text={mainTitle} highlightType="none" />
        </InlineEditableText>
      </h2>

      {mainDescription ? (
        <p
          className="max-w-[58ch] text-base leading-8 @md:text-lg"
          style={{ color: mainDescriptionColor, textWrap: 'pretty' }}
        >
          <InlineEditableText
            moduleId={moduleId}
            elementId={mainElementId}
            settingId="main_description"
            value={mainDescription}
            tagName="span"
            isPreviewMode={isPreviewMode}
          >
            <TextRenderer text={mainDescription} highlightType="none" />
          </InlineEditableText>
        </p>
      ) : null}

      <div className={`flex w-full flex-wrap gap-3 ${mainTextAlign === 'center' ? 'justify-center' : mainTextAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
        {String(primaryLabel || '').trim() ? (
          <a
            href={primaryUrl || '#'}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition-transform hover:-translate-y-0.5"
          >
            <InlineEditableText
              moduleId={moduleId}
              elementId={mainElementId}
              settingId="main_cta_primary_label"
              value={primaryLabel}
              tagName="span"
              isPreviewMode={isPreviewMode}
            />
          </a>
        ) : null}

        {String(secondaryLabel || '').trim() ? (
          <a
            href={secondaryUrl || '#'}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/18 bg-white/6 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white/92 backdrop-blur-sm transition-transform hover:-translate-y-0.5"
          >
            <InlineEditableText
              moduleId={moduleId}
              elementId={mainElementId}
              settingId="main_cta_secondary_label"
              value={secondaryLabel}
              tagName="span"
              isPreviewMode={isPreviewMode}
            />
          </a>
        ) : null}
      </div>
    </motion.div>
  );

  const secondaryBlock = secondaryCardsEnabled ? (
    <motion.div
      className="relative z-20 w-full max-w-[430px]"
      animate={secondaryGravityDistance > 0 ? { y: [0, -secondaryGravityDistance, 0] } : undefined}
      transition={secondaryGravityDistance > 0 ? { duration: secondaryGravityDuration, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <motion.div
        className="rounded-[32px] border border-white/12 bg-white/[0.08] p-6 text-white shadow-[0_30px_90px_-32px_rgba(15,23,42,0.85)] backdrop-blur-xl"
        animate={driftTarget !== 0 ? { x: [0, driftTarget, 0] } : undefined}
        transition={driftTarget !== 0 ? { duration: 5.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <AnimatePresence mode="wait">
          {activeCard ? (
            <motion.div
              key={activeCard.id || activeCard.subtitle || activeCardIndex}
              initial={cardExit}
              animate={cardEnter}
              exit={cardExit}
              transition={{ duration: prefersReducedMotion ? 0.18 : 0.48, ease: 'easeOut' }}
              className="space-y-4"
            >
              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: prefersReducedMotion ? 0 : 0 }}
                className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/90"
              >
                {activeCard.subtitle || 'Bloque secundario'}
              </motion.p>

              {activeCard.description ? (
                <motion.p
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.36, delay: prefersReducedMotion ? 0 : 0.1 }}
                  className="text-lg font-semibold leading-8 text-white/96"
                >
                  {activeCard.description}
                </motion.p>
              ) : null}

              {normalizeBullets(activeCard.bullets).length > 0 ? (
                <motion.ul
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.36, delay: prefersReducedMotion ? 0 : 0.2 }}
                  className="space-y-3"
                >
                  {normalizeBullets(activeCard.bullets).map((bullet, index) => (
                    <li key={`${bullet}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-slate-200/92">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-cyan-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </motion.ul>
              ) : null}
            </motion.div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/90">Portada secundaria</p>
              <p className="text-lg font-semibold leading-8 text-white/96">Agrega tarjetas secundarias para reforzar el mensaje principal.</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  ) : null;

  const imageBlock = usesImageLayout && heroImage ? (
    <div className="relative z-20 w-full max-w-[520px]">
      <div
        className="overflow-visible"
        style={{
          borderRadius: transparentImage ? 0 : `${imageRadius}px`,
          boxShadow: transparentImage ? 'none' : safeImageShadow,
          backgroundColor: 'transparent'
        }}
      >
        <img
          src={heroImage}
          alt={heroImageAlt || 'Visual principal'}
          className="block w-full"
          style={{
            objectFit: imageFit as React.CSSProperties['objectFit'],
            objectPosition: imagePosition,
            borderRadius: transparentImage ? 0 : `${imageRadius}px`
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  ) : null;

  const rightColumn = usesImageLayout ? imageBlock : secondaryBlock;
  const leftColumn = usesImageLayout ? mainBlock : isSecondaryFirst ? secondaryBlock : mainBlock;
  const secondColumn = usesImageLayout ? (isImageFirst ? mainBlock : imageBlock) : isSecondaryFirst ? mainBlock : secondaryBlock;

  return (
    <section
      id={moduleId}
      className="relative w-full overflow-hidden"
      style={{
        background: sectionBackground,
        minHeight: `${minHeight}px`
      }}
    >
      {backgroundType === 'image' && backgroundImage ? (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: backgroundImagePosition,
            backgroundRepeat: 'no-repeat',
            backgroundSize: backgroundImageSize
          }}
        />
      ) : null}

      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity / 100
        }}
      />

      {speedLinesEnabled && (!isMobile || speedLinesMobileEnabled) ? (
        <div
          className="hero2-speed-lines pointer-events-none absolute inset-0 z-10"
          style={{
            opacity: speedLinesOpacity / 100,
            ['--hero2-speed-lines-color' as string]: speedLinesColor,
            ['--hero2-speed-lines-duration' as string]: `${SPEED_MAP[speedLinesSpeed as keyof typeof SPEED_MAP] || 14}s`,
            ['--hero2-speed-lines-direction' as string]: speedLinesDirection === 'right-to-left' ? '-180px' : '180px',
            ['--hero2-speed-lines-density' as string]:
              speedLinesIntensity === 'high' ? '24px' : speedLinesIntensity === 'low' ? '42px' : '32px'
          }}
        />
      ) : null}

      <div
        className="relative z-20 mx-auto w-full px-6 @md:px-10 @lg:px-12"
        style={{
          maxWidth: `${contentMaxWidth}px`,
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`
        }}
      >
        <div className="grid grid-cols-1 items-center gap-10 @5xl:grid-cols-2 @5xl:gap-16">
          {usesImageLayout ? (
            <>
              {isImageFirst ? imageBlock : mainBlock}
              {isImageFirst ? mainBlock : imageBlock}
            </>
          ) : (
            <>
              {leftColumn}
              {secondColumn}
            </>
          )}
        </div>
      </div>

      <style>{`
        .hero2-speed-lines {
          background-image: repeating-linear-gradient(
            -24deg,
            transparent 0,
            transparent calc(var(--hero2-speed-lines-density) - 2px),
            var(--hero2-speed-lines-color) calc(var(--hero2-speed-lines-density) - 2px),
            var(--hero2-speed-lines-color) var(--hero2-speed-lines-density)
          );
          background-size: 200px 200px;
          animation: hero2-speed-lines-move var(--hero2-speed-lines-duration) linear infinite;
          mix-blend-mode: screen;
        }

        @keyframes hero2-speed-lines-move {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(var(--hero2-speed-lines-direction));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero2-speed-lines {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};
