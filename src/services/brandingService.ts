import { Project, ProjectBranding } from '../types/schema';
import { normalizeProjectBrandColors } from '../utils/projectTheme';

export const getBrandingStyles = (project: Project): ProjectBranding => {
  const brandTheme = normalizeProjectBrandColors(project.brandColors);
  // Return the branding from the project, or provide fallback defaults
  return {
    primaryColor: brandTheme.primary || '#3b82f6',
    secondaryColor: brandTheme.secondary || '#60a5fa',
    logoUrl: project.logoUrl || undefined,
  };
};
