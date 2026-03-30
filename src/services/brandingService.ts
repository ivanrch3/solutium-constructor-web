import { Project, ProjectBranding } from '../types/schema';

export const getBrandingStyles = (project: Project): ProjectBranding => {
  // Return the branding from the project, or provide fallback defaults
  return {
    primaryColor: project.branding?.primaryColor || '#3b82f6',
    secondaryColor: project.branding?.secondaryColor || '#60a5fa',
    logoUrl: project.branding?.logoUrl || undefined,
  };
};
