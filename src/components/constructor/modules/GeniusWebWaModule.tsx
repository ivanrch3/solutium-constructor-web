import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, MessageCircle, MessageSquare } from 'lucide-react';
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
    'Abrir WhatsApp'
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
  const primaryColor = getVal(`${moduleId}_el_genius_web_wa_style`, 'primary_color', '#25D366');
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

  const actionLabel = (
    <>
      {showIcon && <MessageCircle size={20} className="shrink-0" />}
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

  const renderAction = (className: string, style: React.CSSProperties) => {
    if (!waUrl) {
      return (
        <div className={className} style={{ ...style, opacity: 0.72 }} aria-disabled="true">
          {actionLabel}
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
      >
        {actionLabel}
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

            {renderAction(
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
          <div
            className="rounded-full border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
            style={{ borderRadius: `${buttonRadius}px` }}
          >
            {renderAction(
              'flex min-h-[56px] items-center gap-3 rounded-full px-3 py-2 font-bold text-slate-900 transition-all',
              {
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                borderRadius: `${buttonRadius}px`
              }
            )}
          </div>
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
