import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { TYPOGRAPHY_SCALE } from '../../../constants/typography';
import { getBentoButtonSizePreset, normalizeBentoCompositeElements, normalizeBentoCompositeListItems, resolveBentoCompositeContainerSizing, resolveBentoCompositeLayout, resolveBentoCompositeTextAlign, shouldRenderBentoImagePlaceholder, type BentoCompositeElement } from '../../../utils/bentoComposite';

const getFontSize = (token: unknown, fallback: keyof typeof TYPOGRAPHY_SCALE) => (
  TYPOGRAPHY_SCALE[String(token) as keyof typeof TYPOGRAPHY_SCALE]?.fontSize
    || TYPOGRAPHY_SCALE[fallback]?.fontSize
    || 16
);

const visualTypes = new Set(['image', 'icon']);

export const BentoCompositeContent = ({ item, darkMode, breakpoint = 'desktop', isPreviewMode }: any) => {
  const elements = normalizeBentoCompositeElements(item?.composite_elements).filter((element) => element.enabled);
  const isHorizontal = resolveBentoCompositeLayout(item?.composite_layout, breakpoint) === 'horizontal';
  const gap = Math.max(0, Number(item?.composite_gap) || 12);
  const textAlign = resolveBentoCompositeTextAlign(item?.composite_align);
  const align = textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start';
  const color = darkMode ? '#F8FAFC' : '#0F172A';
  const mutedColor = darkMode ? '#CBD5E1' : '#64748B';
  const visual = elements.filter((element) => visualTypes.has(element.type));
  const content = elements.filter((element) => !visualTypes.has(element.type));

  const renderElement = (element: BentoCompositeElement) => {
    const commonTextStyle = {
      color: element.color || color,
      fontSize: `${getFontSize(element.font_size, element.type === 'title' ? 't3' : 'p')}px`,
      fontWeight: element.font_weight || (element.type === 'title' ? 800 : 400),
      lineHeight: element.line_height || 1.45,
      letterSpacing: `${Number(element.letter_spacing) || 0}px`
    } as React.CSSProperties;

    if (element.type === 'image') {
      if (shouldRenderBentoImagePlaceholder(element.src, isPreviewMode)) {
        return <div key={element.id} className="flex min-h-28 w-full max-w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-slate-400">
          <div className="flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
            <LucideIcons.Image size={36} strokeWidth={1.5} />
            <span>Imagen</span>
          </div>
        </div>;
      }
      if (!element.src) return null;
      return <img key={element.id} src={element.src} alt={element.alt || ''} className="block max-h-48 w-full max-w-full object-contain" style={{ borderRadius: `${Number(element.radius) || 16}px` }} />;
    }
    if (element.type === 'icon') {
      const Icon = (LucideIcons as any)[element.name] || Sparkles;
      return <div key={element.id} className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10" style={{ width: Number(element.size) || 36, height: Number(element.size) || 36, color: element.color || 'var(--color-primary, #2563EB)' }}><Icon size={Math.max(16, Number(element.size) - 8)} /></div>;
    }
    if (element.type === 'label') return <span key={element.id} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{element.text}</span>;
    if (element.type === 'title') return <h3 key={element.id} className="block min-w-0 w-full max-w-full break-words" style={{ ...commonTextStyle, textAlign }}>{element.text}</h3>;
    if (element.type === 'description') return <p key={element.id} className="block min-w-0 w-full max-w-full break-words" style={{ ...commonTextStyle, color: element.color || mutedColor, textAlign }}>{element.text}</p>;
    if (element.type === 'list') {
      const items = normalizeBentoCompositeListItems(element.items);
      return <div key={element.id} className="w-full min-w-0 max-w-full space-y-2" style={{ color: element.color || mutedColor }}>{items.map((entry) => <div key={entry.id} className="flex min-w-0 items-start gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-primary" /><span className="min-w-0 break-words">{entry.text}</span></div>)}</div>;
    }
    const isSecondary = element.type === 'button_secondary';
    const preset = getBentoButtonSizePreset(element.buttonSize);
    return <a key={element.id} href={element.url || '#'} target={element.target === '_blank' ? '_blank' : undefined} rel={element.target === '_blank' ? 'noopener noreferrer' : undefined} onClick={(event) => { event.stopPropagation(); if (!isPreviewMode) event.preventDefault(); }} className={`inline-flex max-w-full items-center justify-center whitespace-normal rounded-2xl font-bold transition-colors ${isSecondary || element.style === 'outline' ? 'border border-primary bg-transparent text-primary' : element.style === 'ghost' ? 'bg-transparent text-primary' : 'bg-primary text-white'}`} style={{ padding: `${preset.paddingY}px ${preset.paddingX}px`, minHeight: `${preset.minHeight}px`, fontSize: `${preset.fontSize}px`, fontWeight: element.font_weight || 700, color: element.color || undefined, gap: `${preset.iconGap}px`, borderRadius: '16px' }}>{element.text}<ArrowRight size={preset.iconSize} /></a>;
  };

  const renderGroup = (group: BentoCompositeElement[], groupClassName = '') => (
    <div className={`flex min-w-0 flex-col ${groupClassName}`} style={{ gap: `${gap}px`, alignItems: align, textAlign }}>
      {group.map(renderElement)}
    </div>
  );

  return <div className={`relative z-20 min-w-0 max-w-full ${breakpoint === 'mobile' ? 'w-full' : 'inline-flex'}`} style={resolveBentoCompositeContainerSizing(breakpoint)}>
    {isHorizontal
      ? <div className="inline-flex max-w-full items-center" style={{ gap: `${gap}px`, justifyContent: align }}><div className="flex min-w-0 items-center justify-center" style={{ gap: `${gap}px` }}>{visual.map(renderElement)}</div>{renderGroup(content)}</div>
      : <div className="flex w-full min-w-0 max-w-full flex-col" style={{ gap: `${gap}px`, alignItems: align, textAlign }}>{elements.map(renderElement)}</div>}
  </div>;
};
