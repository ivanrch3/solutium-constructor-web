import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { TYPOGRAPHY_SCALE } from '../../../constants/typography';
import { normalizeBentoCompositeElements, normalizeBentoCompositeListItems, resolveBentoCompositeLayout, type BentoCompositeElement } from '../../../utils/bentoComposite';

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
  const align = item?.composite_align === 'center' ? 'center' : item?.composite_align === 'end' ? 'flex-end' : 'flex-start';
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
      letterSpacing: `${Number(element.letter_spacing) || 0}px`,
      fontFamily: element.font_family && element.font_family !== 'inherit' ? element.font_family : undefined
    } as React.CSSProperties;

    if (element.type === 'image') {
      if (!element.src) return null;
      return <img key={element.id} src={element.src} alt={element.alt || ''} className="max-h-48 w-full max-w-[220px] object-contain" style={{ borderRadius: `${Number(element.radius) || 16}px` }} />;
    }
    if (element.type === 'icon') {
      const Icon = (LucideIcons as any)[element.name] || Sparkles;
      return <div key={element.id} className="flex shrink-0 items-center justify-center rounded-2xl bg-primary/10" style={{ width: Number(element.size) || 36, height: Number(element.size) || 36, color: element.color || 'var(--color-primary, #2563EB)' }}><Icon size={Math.max(16, Number(element.size) - 8)} /></div>;
    }
    if (element.type === 'label') return <span key={element.id} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{element.text}</span>;
    if (element.type === 'title') return <h3 key={element.id} style={commonTextStyle}>{element.text}</h3>;
    if (element.type === 'description') return <p key={element.id} style={{ ...commonTextStyle, color: element.color || mutedColor }}>{element.text}</p>;
    if (element.type === 'list') {
      const items = normalizeBentoCompositeListItems(element.items);
      return <div key={element.id} className="space-y-2" style={{ color: element.color || mutedColor }}>{items.map((entry) => <div key={entry.id} className="flex items-start gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-primary" /><span>{entry.text}</span></div>)}</div>;
    }
    const isSecondary = element.type === 'button_secondary';
    return <a key={element.id} href={element.url || '#'} target={element.target === '_blank' ? '_blank' : undefined} rel={element.target === '_blank' ? 'noopener noreferrer' : undefined} onClick={(event) => { event.stopPropagation(); if (!isPreviewMode) event.preventDefault(); }} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${isSecondary || element.style === 'outline' ? 'border border-primary bg-transparent text-primary' : element.style === 'ghost' ? 'bg-transparent text-primary' : 'bg-primary text-white'}`}>{element.text}<ArrowRight size={14} /></a>;
  };

  const renderGroup = (group: BentoCompositeElement[], groupClassName = '') => (
    <div className={`flex min-w-0 flex-col ${groupClassName}`} style={{ gap: `${gap}px`, alignItems: item?.composite_align === 'center' ? 'center' : item?.composite_align === 'end' ? 'flex-end' : 'flex-start' }}>
      {group.map(renderElement)}
    </div>
  );

  return <div className="relative z-20 flex h-full w-full min-w-0">
    {isHorizontal
      ? <div className="flex h-full w-full items-center" style={{ gap: `${gap}px`, justifyContent: align }}><div className="flex min-w-0 flex-1 items-center justify-center" style={{ gap: `${gap}px` }}>{visual.map(renderElement)}</div>{renderGroup(content, 'flex-1')}</div>
      : <div className="flex h-full w-full flex-col" style={{ gap: `${gap}px`, alignItems: item?.composite_align === 'center' ? 'center' : item?.composite_align === 'end' ? 'flex-end' : 'flex-start' }}>{elements.map(renderElement)}</div>}
  </div>;
};
