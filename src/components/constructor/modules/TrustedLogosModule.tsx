import React, { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { TrustedCompanyLogo } from '../../../types/schema';
import { InlineEditableText } from '../InlineEditableText';
import { TextRenderer } from '../TextRenderer';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';

interface TrustedLogosModuleProps {
  moduleId: string;
  settingsValues: Record<string, any>;
  companies?: TrustedCompanyLogo[];
  snapshotCompanies?: TrustedCompanyLogo[];
  isPreviewMode?: boolean;
}

export const TrustedLogosModule: React.FC<TrustedLogosModuleProps> = ({
  moduleId,
  settingsValues,
  companies = [],
  snapshotCompanies: snapshotCompaniesOverride,
  isPreviewMode = false
}) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const parseNum = (value: any, fallback: number) => {
    const parsed = parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const selectedIds = getVal(`${moduleId}_el_trusted_logos_data`, 'select_companies', null);
  const settingsSnapshotCompanies = settingsValues[`${moduleId}_el_trusted_logos_items_companies`];

  const displayCompanies = useMemo(() => {
    if (Array.isArray(snapshotCompaniesOverride) && snapshotCompaniesOverride.length > 0) {
      return snapshotCompaniesOverride;
    }

    if (Array.isArray(settingsSnapshotCompanies) && settingsSnapshotCompanies.length > 0) {
      return settingsSnapshotCompanies;
    }

    if (Array.isArray(selectedIds)) {
      if (selectedIds.length === 0) return [];
      const selected = new Set(selectedIds.map(String));
      return companies.filter((company) => selected.has(String(company.company_id)));
    }

    return companies.slice(0, 8);
  }, [companies, selectedIds, settingsSnapshotCompanies, snapshotCompaniesOverride]);

  const columns = Math.max(2, parseInt(String(getVal(null, 'columns', 4)), 10) || 4);
  const gap = parseNum(getVal(null, 'gap', 32), 32);
  const paddingY = parseNum(getVal(null, 'padding_y', 80), 80);
  const logoHeight = parseNum(getVal(`${moduleId}_el_trusted_logo_style`, 'logo_height', 48), 48);
  const logoOpacity = parseNum(getVal(`${moduleId}_el_trusted_logo_style`, 'logo_opacity', 100), 100);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : '#FFFFFF');

  const eyebrow = getVal(`${moduleId}_el_trusted_logos_header`, 'eyebrow', 'CONFÍAN EN NOSOTROS');
  const title = getVal(`${moduleId}_el_trusted_logos_header`, 'title', 'Marcas y empresas que ya trabajan con nosotros');
  const subtitle = getVal(`${moduleId}_el_trusted_logos_header`, 'subtitle', 'Selecciona logotipos reales del CRM y publícalos con snapshot estable.');
  const align = getVal(`${moduleId}_el_trusted_logos_header`, 'align', 'center');
  const titleSize = getVal(`${moduleId}_el_trusted_logos_header`, 'title_size', 't2');
  const titleWeight = getVal(`${moduleId}_el_trusted_logos_header`, 'title_weight', 'black');
  const subtitleSize = getVal(`${moduleId}_el_trusted_logos_header`, 'subtitle_size', 'p');
  const subtitleWeight = getVal(`${moduleId}_el_trusted_logos_header`, 'subtitle_weight', 'normal');
  const titleColor = darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_trusted_logos_header`, 'title_color', '#0F172A');
  const subtitleColor = darkMode ? '#94A3B8' : '#64748B';
  const eyebrowColor = getVal(`${moduleId}_el_trusted_logos_header`, 'eyebrow_color', 'var(--primary-color)');

  const titleHighlightType = getVal(`${moduleId}_el_trusted_logos_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_trusted_logos_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_trusted_logos_header`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)');
  const titleHighlightBold = getVal(`${moduleId}_el_trusted_logos_header`, 'title_highlight_bold', true);

  const headerClass =
    align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';

  const getTypographyStyle = (sizeToken: string, weightToken: string) => {
    const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p;
    const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;
    return {
      fontSize: `${size.fontSize}px`,
      lineHeight: size.lineHeight,
      fontWeight: weight.value
    } as React.CSSProperties;
  };

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className={`flex flex-col mb-12 ${headerClass}`}>
          {eyebrow && (
            <span className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: eyebrowColor }}>
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_trusted_logos_header`}
                settingId="eyebrow"
                value={eyebrow}
                isPreviewMode={isPreviewMode}
              />
            </span>
          )}
          <h2 className="mb-4 leading-tight" style={{ ...getTypographyStyle(titleSize, titleWeight), color: titleColor }}>
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_trusted_logos_header`}
              settingId="title"
              value={title}
              isPreviewMode={isPreviewMode}
            >
              <TextRenderer
                text={title}
                highlightType={titleHighlightType}
                highlightColor={titleHighlightColor}
                highlightGradient={titleHighlightGradient}
                highlightBold={titleHighlightBold}
              />
            </InlineEditableText>
          </h2>
          {subtitle && (
            <p className="max-w-2xl" style={{ ...getTypographyStyle(subtitleSize, subtitleWeight), color: subtitleColor }}>
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_trusted_logos_header`}
                settingId="subtitle"
                value={subtitle}
                isPreviewMode={isPreviewMode}
              />
            </p>
          )}
        </div>

        {displayCompanies.length > 0 ? (
          <div
            className={`grid ${
              columns >= 5 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' :
              columns === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
              columns === 3 ? 'grid-cols-2 lg:grid-cols-3' :
              'grid-cols-2'
            } items-center`}
            style={{ gap: `${gap}px` }}
          >
            {displayCompanies.map((company) => {
              const logo = (
                <div
                  className={`group flex items-center justify-center rounded-2xl border px-6 py-5 transition-all ${
                    darkMode ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                  style={{ minHeight: `${logoHeight + 32}px` }}
                >
                  <img
                    src={company.logo_url}
                    alt={company.alt || `${company.name} logo`}
                    className="max-w-full object-contain transition-all duration-300 group-hover:scale-105"
                    style={{ height: `${logoHeight}px`, opacity: logoOpacity / 100 }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              );

              return company.website_url ? (
                <a key={company.company_id} href={company.website_url} target="_blank" rel="noopener noreferrer">
                  {logo}
                </a>
              ) : (
                <div key={company.company_id}>{logo}</div>
              );
            })}
          </div>
        ) : (
          <div
            className={`rounded-3xl border-2 border-dashed p-12 text-center ${
              darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-primary w-8 h-8" />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              No hay logos disponibles
            </h3>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
              Selecciona empresas con logo desde el panel del módulo para mostrarlas aquí.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
