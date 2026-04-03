import { Project, ProjectBranding } from '../types/schema';

export const getBrandingStyles = (project: Project): ProjectBranding => {
  // Return the branding from the project, or provide fallback defaults
  return {
    primaryColor: project.brandColors?.primary || '#3b82f6',
    secondaryColor: project.brandColors?.secondary || '#60a5fa',
    logoUrl: project.logoUrl || undefined,
  };
};
