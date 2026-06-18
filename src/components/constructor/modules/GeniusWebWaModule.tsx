import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { InlineEditableText } from '../InlineEditableText';
import { SectionAnimation } from '../animations/SectionAnimation';
import { useEditorStore } from '../../../store/editorStore';
import { normalizeSectionAnimation } from '../../../constants/moduleAnimations';
import { parseNumSafe } from '../utils';

type DisplayMode = 'inline' | 'floating';
type RenderMode = 'editor' | 'preview' | 'live';

type GeniusWebWaModuleProps = {
  moduleId: string;
  settingsValues: Record<string, any>;
  renderMode?: RenderMode;
};

const WHATSAPP_GREEN = '#25D366';
const WHATSAPP_ACTION_LABEL = 'Enviar mensaje por WhatsApp';

const WhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg
    viewBox="0 0 32 32"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    width={size}
    height={size}
    className={className}
  >
    <path d="M19.11 17.33c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.6.14-.18.27-.69.86-.84 1.04-.16.18-.31.2-.58.07-.27-.14-1.12-.41-2.13-1.31-.79-.7-1.32-1.56-1.47-1.82-.16-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.6-1.45-.82-1.99-.22-.52-.44-.45-.6-.46h-.51c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.26 0 1.33.97 2.62 1.1 2.8.13.18 1.9 2.9 4.6 4.06.64.28 1.14.44 1.54.56.65.21 1.24.18 1.71.11.52-.08 1.57-.64 1.79-1.26.22-.61.22-1.13.16-1.24-.07-.11-.25-.18-.52-.32Z" />
    <path d="M16.01 3.2c-7.07 0-12.8 5.72-12.8 12.78 0 2.26.59 4.47 1.71 6.4L3.1 28.8l6.58-1.72a12.78 12.78 0 0 0 6.33 1.67h.01c7.06 0 12.78-5.72 12.78-12.79 0-3.42-1.33-6.63-3.75-9.04A12.68 12.68 0 0 0 16.01 3.2Zm0 23.39h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.9 1.02 1.04-3.8-.25-.39a10.58 10.58 0 0 1-1.63-5.66c0-5.85 4.77-10.61 10.63-10.61 2.83 0 5.49 1.1 7.49 3.11a10.54 10.54 0 0 1 3.11 7.5c0 5.86-4.76 10.62-10.61 10.62Z" />
  </svg>
);

const normalizePhoneNumber = (value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).replace(/[^\d]/g, '');
};

const buildWaUrl = (phoneNumber: unknown, message: unknown) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  if (!normalizedPhone) return '';

  const encodedMessage = encodeURIComponent(typeof message === 'string' ? message : '');
  return `https://wa.me/${normalizedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  if (typeof value === 'number') return value === 1;
  return fallback;
};

const normalizeDisplayMode = (value: unknown): DisplayMode => {
  return value === 'floating' ? 'floating' : 'inline';
};

const getTypographyStyle = (sizeToken: string, weightToken: string, align?: 'left' | 'center' | 'right') => {
  const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p;
  const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;

  return {
    fontSize: `${size.fontSize}px`,
    lineHeight: size.lineHeight,
    fontWeight: weight.value,
    textAlign: align
  } as React.CSSProperties;
};

export const GeniusWebWaModule: React.FC<GeniusWebWaModuleProps> = ({
  moduleId,
  settingsValues,
  renderMode = 'live'
}) => {
  const { selectSection, selectElement } = useEditorStore();
  const isEditorMode = renderMode === 'editor';
  const isPreviewMode = renderMode !== 'editor';

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const enabled = toBoolean(getVal(null, 'enabled', true), true);
  const displayMode = normalizeDisplayMode(getVal(null, 'display_mode', 'inline'));
  const position = getVal(null, 'position', 'bottom-right') === 'bottom-left' ? 'bottom-left' : 'bottom-right';
  const maxWidth = parseNumSafe(getVal(null, 'max_width', 1120), 1120);
  const paddingY = parseNumSafe(getVal(null, 'padding_y', 56), 56);
  const borderRadius = parseNumSafe(getVal(null, 'border_radius', 24), 24);
  const darkMode = toBoolean(getVal(null, 'dark_mode', false), false);
  const sectionAnimation = normalizeSectionAnimation(
    settingsValues.global_theme_section_animation ??
      getVal(null, 'section_animation', undefined) ??
      getVal(null, 'entrance_anim', 'fade-up'),
    'fade-up'
  );
  const sectionAnimationSpeed = parseNumSafe(settingsValues.global_theme_section_animation_speed, 1);

  const title = getVal(`${moduleId}_el_genius_web_wa_content`, 'title', 'Conversa con Genius');
  const subtitle = getVal(
    `${moduleId}_el_genius_web_wa_content`,
    'subtitle',
    'Estamos listos para ayudarte por WhatsApp'
  );
  const buttonText = getVal(
    `${moduleId}_el_genius_web_wa_content`,
    'button_text',
    'Enviar mensaje'
  );
  const defaultMessage = getVal(
    `${moduleId}_el_genius_web_wa_content`,
    'default_message',
    'Hola, necesito ayuda con...'
  );
  const titleSize = getVal(`${moduleId}_el_genius_web_wa_content`, 'title_size', 't3');
  const titleWeight = getVal(`${moduleId}_el_genius_web_wa_content`, 'title_weight', 'extrabold');
  const subtitleSize = getVal(`${moduleId}_el_genius_web_wa_content`, 'subtitle_size', 'p');
  const subtitleWeight = getVal(`${moduleId}_el_genius_web_wa_content`, 'subtitle_weight', 'normal');
  const textAlign = getVal(`${moduleId}_el_genius_web_wa_content`, 'text_align', 'left');

  const phoneNumber = getVal(`${moduleId}_el_genius_web_wa_config`, 'phone_number', '');
  const showIcon = toBoolean(getVal(`${moduleId}_el_genius_web_wa_config`, 'show_icon', true), true);

  const bgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : '#F8FAFC');
  const cardBg = getVal(`${moduleId}_el_genius_web_wa_style`, 'card_bg', darkMode ? '#111827' : '#FFFFFF');
  const primaryColor = getVal(`${moduleId}_el_genius_web_wa_style`, 'primary_color', WHATSAPP_GREEN);
  const textColor = getVal(`${moduleId}_el_genius_web_wa_style`, 'text_color', '#FFFFFF');
  const titleColor = getVal(`${moduleId}_el_genius_web_wa_style`, 'title_color', darkMode ? '#FFFFFF' : '#0F172A');
  const subtitleColor = getVal(
    `${moduleId}_el_genius_web_wa_style`,
    'subtitle_color',
    darkMode ? '#CBD5E1' : '#475569'
  );
  const buttonRadius = parseNumSafe(getVal(`${moduleId}_el_genius_web_wa_style`, 'button_radius', 999), 999);

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const waUrl = buildWaUrl(phoneNumber, defaultMessage);
  const showInline = displayMode === 'inline';
  const showFloating = displayMode === 'floating';
  const isLeft = position === 'bottom-left';

  const handleSelect = (event: React.MouseEvent, elementId: string) => {
    if (!isEditorMode) return;
    event.stopPropagation();
    selectSection(moduleId);
    selectElement(elementId);
  };

  const pendingNotice = !normalizedPhone ? (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold">Configura un numero de WhatsApp</p>
        <p className="text-xs opacity-80">El enlace se activara cuando el numero tenga al menos un digito.</p>
      </div>
    </div>
  ) : null;

  const disabledBadge = !enabled && isEditorMode ? (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
      <AlertCircle size={14} />
      Desactivado en preview y sitio publicado
    </div>
  ) : null;

  const inlineActionLabel = (
    <>
      {showIcon && <WhatsAppIcon size={20} className="shrink-0" />}
      <InlineEditableText
        moduleId={moduleId}
        elementId={`${moduleId}_el_genius_web_wa_content`}
        settingId="button_text"
        value={buttonText}
        tagName="span"
        isPreviewMode={isPreviewMode}
      />
    </>
  );

  const renderInlineAction = (className: string, style: React.CSSProperties) => {
    if (!waUrl) {
      return (
        <div
          className={className}
          style={{ ...style, opacity: 0.72 }}
          aria-disabled="true"
          aria-label={WHATSAPP_ACTION_LABEL}
          title={WHATSAPP_ACTION_LABEL}
        >
          {inlineActionLabel}
        </div>
      );
    }

    return (
      <motion.a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={className}
        style={style}
        aria-label={WHATSAPP_ACTION_LABEL}
        title={WHATSAPP_ACTION_LABEL}
      >
        {inlineActionLabel}
      </motion.a>
    );
  };

  const renderFloatingAction = () => {
    const floatingCommonProps = {
      className:
        'flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-[0_18px_40px_rgba(37,211,102,0.28)] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/35',
      style: {
        backgroundColor: WHATSAPP_GREEN,
        color: '#FFFFFF'
      } as React.CSSProperties,
      'aria-label': WHATSAPP_ACTION_LABEL,
      title: WHATSAPP_ACTION_LABEL
    };

    if (!waUrl) {
      return (
        <div {...floatingCommonProps} style={{ ...floatingCommonProps.style, opacity: 0.72 }} aria-disabled="true">
          <WhatsAppIcon size={28} />
        </div>
      );
    }

    return (
      <motion.a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -2, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        {...floatingCommonProps}
      >
        <WhatsAppIcon size={28} />
      </motion.a>
    );
  };

  const inlineNode = (
    <SectionAnimation animation={sectionAnimation} speed={sectionAnimationSpeed}>
      <section
        id={showInline ? moduleId : `${moduleId}_inline`}
        className="w-full @container"
        onClick={(event) => handleSelect(event, `${moduleId}_global`)}
        style={{
          backgroundColor: bgColor,
          paddingTop: `${paddingY}px`,
          paddingBottom: `${paddingY}px`
        }}
      >
        <div className="mx-auto w-full px-4 @md:px-6" style={{ maxWidth: `${maxWidth}px` }}>
          {disabledBadge}
          <div
            className="flex min-w-0 flex-col gap-6 border p-5 @4xl:flex-row @4xl:items-center @4xl:justify-between @md:p-8"
            style={{
              backgroundColor: cardBg,
              borderRadius: `${borderRadius}px`,
              borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
              boxShadow: darkMode
                ? '0 18px 40px rgba(15,23,42,0.28)'
                : '0 18px 40px rgba(15,23,42,0.12)'
            }}
          >
            <div
              className={`flex min-w-0 flex-col ${
                textAlign === 'center'
                  ? 'items-center text-center'
                  : textAlign === 'right'
                    ? 'items-end text-right'
                    : 'items-start text-left'
              }`}
            >
              <h2
                className="mb-3 max-w-full break-words"
                style={{ ...getTypographyStyle(titleSize, titleWeight, textAlign), color: titleColor }}
              >
                <InlineEditableText
                  moduleId={moduleId}
                  elementId={`${moduleId}_el_genius_web_wa_content`}
                  settingId="title"
                  value={title}
                  tagName="span"
                  isPreviewMode={isPreviewMode}
                >
                  <TextRenderer text={title} />
                </InlineEditableText>
              </h2>
              <p
                className="max-w-full break-words"
                style={{ ...getTypographyStyle(subtitleSize, subtitleWeight, textAlign), color: subtitleColor }}
              >
                <InlineEditableText
                  moduleId={moduleId}
                  elementId={`${moduleId}_el_genius_web_wa_content`}
                  settingId="subtitle"
                  value={subtitle}
                  tagName="span"
                  isPreviewMode={isPreviewMode}
                >
                  <TextRenderer text={subtitle} />
                </InlineEditableText>
              </p>
              {pendingNotice}
            </div>

            {renderInlineAction(
              'inline-flex min-h-[52px] w-full items-center justify-center gap-3 px-5 py-4 text-center text-sm font-black transition-all @md:w-auto @md:px-6',
              {
                backgroundColor: primaryColor,
                color: textColor,
                borderRadius: `${buttonRadius}px`
              }
            )}
          </div>
        </div>
      </section>
    </SectionAnimation>
  );

  const floatingPlaceholder = (
    <section
      id={moduleId}
      className="w-full"
      onClick={(event) => handleSelect(event, `${moduleId}_global`)}
    >
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-700">
        {disabledBadge}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/12 text-[#25D366]">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Genius Web-WA</p>
            <p className="mt-1 text-sm font-semibold">Widget flotante activo</p>
            <p className="mt-1 text-xs text-slate-500">Se mostrara en la esquina de la pagina publicada.</p>
            {pendingNotice}
          </div>
        </div>
      </div>
    </section>
  );

  const floatingNode = (
    <div
      id={moduleId}
      data-genius-web-wa-mode="floating"
      className="fixed z-[120] max-w-[calc(100vw-1.5rem)]"
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        ...(isLeft ? { left: 16 } : { right: 16 })
      }}
    >
      {!enabled ? null : (
        <div className="flex flex-col gap-3">
          {renderFloatingAction()}
          {pendingNotice}
        </div>
      )}
    </div>
  );

  if (!enabled && !isEditorMode) return null;

  if (showInline) {
    return inlineNode;
  }

  if (isEditorMode) {
    return floatingPlaceholder;
  }

  return floatingNode;
};
