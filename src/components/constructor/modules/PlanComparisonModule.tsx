import React from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Minus, X } from 'lucide-react';
import { FONT_WEIGHTS, TYPOGRAPHY_SCALE } from '../../../constants/typography';
import { readPlanComparisonConfig, type ComparisonCellValue, type ComparisonPlan } from './planComparisonConfig';

type Props = { moduleId: string; settingsValues: Record<string, any>; isPreviewMode?: boolean };
type TypographyKey = 'header_eyebrow' | 'header_title' | 'header_description' | 'plan_name' | 'plan_price' | 'plan_description' | 'section_title' | 'feature_name' | 'feature_description' | 'cell_value' | 'cta';

const settingKey = (moduleId: string) => `${moduleId}_global_config`;
const getTypography = (settings: Record<string, any>, moduleId: string, key: TypographyKey, fallbackSize: keyof typeof TYPOGRAPHY_SCALE, fallbackWeight: keyof typeof FONT_WEIGHTS) => {
  const globalPrefix = `${moduleId}_global_${key}`;
  const family = settings[`${globalPrefix}_font_family`] ?? 'inherit';
  const sizeToken = settings[`${globalPrefix}_size`];
  const weightToken = settings[`${globalPrefix}_weight`];
  const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE[fallbackSize];
  const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS[fallbackWeight];
  return { fontFamily: family === 'inherit' ? undefined : family, fontSize: `${size.fontSize}px`, lineHeight: size.lineHeight, fontWeight: weight.value, color: settings[`${globalPrefix}_color`] ?? 'var(--brand-text)' } as React.CSSProperties;
};

const cellContent = (cell: ComparisonCellValue) => {
  if (cell.type === 'included') return <Check aria-hidden="true" size={17} strokeWidth={2.5} />;
  if (cell.type === 'excluded') return <X aria-hidden="true" size={17} strokeWidth={2.5} />;
  if (cell.type === 'not_applicable') return <Minus aria-hidden="true" size={17} />;
  return cell.text || '';
};

const PlanHeader: React.FC<{ plan: ComparisonPlan; styles: Record<TypographyKey, React.CSSProperties>; featuredColor: string }> = ({ plan, styles, featuredColor }) => (
  <div className="space-y-1.5">
    {plan.badge && <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: `${featuredColor}55`, color: featuredColor }}>{plan.badge}</span>}
    <div style={styles.plan_name}>{plan.name}</div>
    {plan.description && <div style={styles.plan_description}>{plan.description}</div>}
    {plan.price && <div style={styles.plan_price}>{plan.price}</div>}
    {plan.secondaryPrice && <div className="text-xs text-[color:var(--brand-muted)]">{plan.secondaryPrice}</div>}
    {plan.cta?.label && <a href={plan.cta.url || '#'} className="mt-2 inline-flex rounded-md border border-[color:var(--border-color)] px-3 py-1.5 text-xs font-semibold transition hover:border-[color:var(--primary-color)]" style={styles.cta}>{plan.cta.label}</a>}
  </div>
);

export const PlanComparisonModule: React.FC<Props> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const config = readPlanComparisonConfig(settingsValues[settingKey(moduleId)]);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(() => Object.fromEntries(config.sections.map((section) => [section.id, section.defaultExpanded])));
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = React.useState({ canLeft: false, canRight: false, hasOverflow: false });
  const visiblePlans = config.plans.filter((plan) => plan.visible);
  const visibleSections = config.sections.filter((section) => section.visible);
  const allowSectionCollapse = settingsValues[`${moduleId}_global_section_collapse_enabled`] !== false;
  const styles = Object.fromEntries((['header_eyebrow', 'header_title', 'header_description', 'plan_name', 'plan_price', 'plan_description', 'section_title', 'feature_name', 'feature_description', 'cell_value', 'cta'] as TypographyKey[]).map((key) => [key, getTypography(settingsValues, moduleId, key, key.includes('title') ? 't2' : key.includes('price') ? 't3' : key.includes('name') ? 'p' : 's', key.includes('title') || key.includes('name') ? 'extrabold' : 'normal')])) as Record<TypographyKey, React.CSSProperties>;
  const paddingY = Number(settingsValues[`${moduleId}_global_padding_y`] ?? 56);
  const maxWidth = Number(settingsValues[`${moduleId}_global_max_width`] ?? 1200);
  const showShadow = settingsValues[`${moduleId}_global_show_shadow`] !== false;
  const radius = Number(settingsValues[`${moduleId}_global_border_radius`] ?? 12);
  const rowPadding = Number(settingsValues[`${moduleId}_global_row_padding`] ?? 18);
  const featuredColor = settingsValues[`${moduleId}_global_featured_color`] || 'var(--primary-color)';

  const updateScrollState = React.useCallback(() => {
    const node = viewportRef.current;
    if (!node) return;
    const max = Math.max(0, node.scrollWidth - node.clientWidth);
    setScrollState({ hasOverflow: max > 1, canLeft: node.scrollLeft > 1, canRight: node.scrollLeft < max - 1 });
  }, []);
  React.useEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;
    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(node);
    node.addEventListener('scroll', updateScrollState, { passive: true });
    return () => { observer.disconnect(); node.removeEventListener('scroll', updateScrollState); };
  }, [updateScrollState, visiblePlans.length, visibleSections.length]);
  const scroll = (direction: 'left' | 'right') => viewportRef.current?.scrollBy({ left: direction === 'left' ? -Math.max(240, viewportRef.current.clientWidth * 0.75) : Math.max(240, viewportRef.current.clientWidth * 0.75), behavior: 'smooth' });

  return <section className="relative w-full @container" style={{ paddingTop: `${paddingY}px`, paddingBottom: `${paddingY}px`, color: 'var(--brand-text)' }}>
    <div className="mx-auto px-4 @md:px-8" style={{ maxWidth }}>
      {(config.header.eyebrow || config.header.title || config.header.description) && <header className="mb-8 max-w-3xl space-y-2">
        {config.header.eyebrow && <p style={styles.header_eyebrow}>{config.header.eyebrow}</p>}
        {config.header.title && <h2 style={styles.header_title}>{config.header.title}</h2>}
        {config.header.description && <p style={styles.header_description}>{config.header.description}</p>}
      </header>}
      <div className="relative">
        {scrollState.hasOverflow && <><button type="button" aria-label="Desplazar tabla a la izquierda" onClick={() => scroll('left')} disabled={!scrollState.canLeft} className="absolute left-1 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--border-color)] bg-[color:var(--background-color)] p-2 shadow-sm disabled:invisible @md:block"><ChevronLeft size={16} /></button><button type="button" aria-label="Desplazar tabla a la derecha" onClick={() => scroll('right')} disabled={!scrollState.canRight} className="absolute right-1 top-1/2 z-30 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--border-color)] bg-[color:var(--background-color)] p-2 shadow-sm disabled:invisible @md:block"><ChevronRight size={16} /></button></>}
        <div ref={viewportRef} className="overflow-x-auto rounded-[var(--comparison-radius)]" style={{ '--comparison-radius': `${radius}px`, boxShadow: showShadow ? '0 8px 30px color-mix(in srgb, var(--foreground-color) 8%, transparent)' : 'none' } as React.CSSProperties}>
          <table className="w-full min-w-[760px] border-collapse text-left" style={{ borderColor: 'var(--border-color)' }}>
            <thead><tr>
              <th scope="col" className="sticky left-0 top-0 z-20 min-w-[220px] border-b border-r bg-[color:var(--background-color)] px-4 py-4 align-bottom" style={{ borderColor: 'var(--border-color)' }}>Característica</th>
              {visiblePlans.map((plan) => <th scope="col" key={plan.id} className="sticky top-0 z-10 min-w-[180px] border-b bg-[color:var(--background-color)] px-4 py-4 align-top" style={{ borderColor: plan.featured ? featuredColor : 'var(--border-color)', backgroundColor: plan.featured ? `color-mix(in srgb, ${featuredColor} 5%, var(--background-color))` : undefined }}><PlanHeader plan={plan} styles={styles} featuredColor={featuredColor} /></th>)}
            </tr></thead>
            <tbody>{visibleSections.map((section) => { const isExpanded = expanded[section.id] ?? section.defaultExpanded; return <React.Fragment key={section.id}>
              <tr id={`plan-comparison-${section.id}`}><th scope="colgroup" colSpan={visiblePlans.length + 1} className="border-b bg-[color:var(--background-color)] px-4" style={{ borderColor: 'var(--border-color)', paddingTop: `${rowPadding}px`, paddingBottom: `${rowPadding}px` }}><button type="button" className="flex w-full items-center gap-2 text-left" aria-expanded={allowSectionCollapse && section.collapsible ? isExpanded : true} aria-controls={`plan-comparison-${section.id}`} onClick={() => allowSectionCollapse && section.collapsible && setExpanded((current) => ({ ...current, [section.id]: !isExpanded }))} disabled={!allowSectionCollapse || !section.collapsible}><span style={styles.section_title}>{section.title}</span>{allowSectionCollapse && section.collapsible && <ChevronDown size={17} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}</button></th></tr>
              {isExpanded && section.features.filter((feature) => feature.visible).map((feature) => <tr key={feature.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--border-color)' }}><th scope="row" className="sticky left-0 z-10 min-w-[220px] border-r bg-[color:var(--background-color)] px-4 align-top" style={{ borderColor: 'var(--border-color)', paddingTop: `${rowPadding}px`, paddingBottom: `${rowPadding}px` }}><div style={styles.feature_name}>{feature.name}</div>{feature.description && <div style={styles.feature_description}>{feature.description}</div>}</th>{visiblePlans.map((plan) => { const cell = feature.values[plan.id] || { type: 'not_applicable' as const }; const semantic = cell.type === 'included' ? 'var(--accent-color, #16a34a)' : cell.type === 'excluded' ? '#dc2626' : 'var(--brand-muted)'; return <td key={plan.id} className="min-w-[180px] px-4 text-center align-middle" style={{ paddingTop: `${rowPadding}px`, paddingBottom: `${rowPadding}px`, color: cell.type === 'text' ? 'var(--brand-text)' : semantic, backgroundColor: plan.featured ? `color-mix(in srgb, ${featuredColor} 3%, var(--background-color))` : undefined }}><span style={cell.type === 'text' ? styles.cell_value : undefined}>{cellContent(cell)}</span></td>; })}</tr>)}
            </React.Fragment>; })}</tbody>
          </table>
        </div>
      </div>
      {config.bottomCta.enabled && <div className="mt-6 flex flex-wrap justify-end gap-3">{visiblePlans.filter((plan) => plan.cta?.label).map((plan) => <a key={plan.id} href={plan.cta?.url || '#'} className="rounded-md border border-[color:var(--border-color)] px-3 py-2" style={styles.cta}>{plan.cta?.label}</a>)}</div>}
    </div>
  </section>;
};
