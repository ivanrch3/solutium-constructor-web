export const INDUSTRIES = [
  { id: 'agriculture', label: 'Agricultura / Ganadería', category: 'agriculture', colors: { primary: '#2D5A27', secondary: '#F5F5DC', accent: '#8B4513' } },
  { id: 'food', label: 'Comida / Restaurante / Gastronomía', category: 'food', colors: { primary: '#E63946', secondary: '#F1FAEE', accent: '#A8DADC' } },
  { id: 'art', label: 'Arte / Diseño / Creativo', category: 'art', colors: { primary: '#8338EC', secondary: '#FF006E', accent: '#3A86FF' } },
  { id: 'automotive', label: 'Automotriz / Taller', category: 'automotive', colors: { primary: '#1B263B', secondary: '#E0E1DD', accent: '#E63946' } },
  { id: 'beauty', label: 'Belleza / Spa / Estética', category: 'beauty', colors: { primary: '#FFB7C5', secondary: '#FFF5F5', accent: '#D4A373' } },
  { id: 'realestate', label: 'Inmobiliaria / Bienes Raíces', category: 'realestate', colors: { primary: '#2A9D8F', secondary: '#E9C46A', accent: '#264653' } },
  { id: 'influencer', label: 'Influencer / Blog / Personal', category: 'influencer', colors: { primary: '#FF006E', secondary: '#FB5607', accent: '#FFBE0B' } },
  { id: 'ecommerce', label: 'eCommerce / Tienda online', category: 'ecommerce', colors: { primary: '#3A86FF', secondary: '#8338EC', accent: '#FFBE0B' } },
  { id: 'construction', label: 'Construcción / Reforma', category: 'construction', colors: { primary: '#F4A261', secondary: '#E76F51', accent: '#264653' } },
  { id: 'health', label: 'Salud / Clínica / Dental', category: 'health', colors: { primary: '#00B4D8', secondary: '#CAF0F8', accent: '#0077B6' } },
  { id: 'technology', label: 'Tecnología / Software / Digital', category: 'tech', colors: { primary: '#4361EE', secondary: '#4CC9F0', accent: '#3F37C9' } },
  { id: 'finance', label: 'Finanzas / Seguros / Contabilidad', category: 'finance', colors: { primary: '#023047', secondary: '#8ECAE6', accent: '#FFB703' } },
  { id: 'legal', label: 'Legal / Abogado', category: 'legal', colors: { primary: '#14213D', secondary: '#E5E5E5', accent: '#FCA311' } },
  { id: 'sports', label: 'Deporte / Gym / Fitness', category: 'sports', colors: { primary: '#D90429', secondary: '#EF233C', accent: '#8D99AE' } },
  { id: 'architecture', label: 'Arquitectura', category: 'architecture', colors: { primary: '#3D405B', secondary: '#F4F1DE', accent: '#E07A5F' } },
  { id: 'pets', label: 'Mascotas / Veterinaria', category: 'pets', colors: { primary: '#F28482', secondary: '#F7EDE2', accent: '#84A59D' } },
  { id: 'fashion', label: 'Moda / Ropa', category: 'fashion', colors: { primary: '#000000', secondary: '#FFFFFF', accent: '#FFD700' } },
  { id: 'travel', label: 'Viaje / Turismo / Hotel', category: 'travel', colors: { primary: '#0077B6', secondary: '#90E0EF', accent: '#CAF0F8' } },
  { id: 'education', label: 'Educación / Cursos', category: 'education', colors: { primary: '#588157', secondary: '#A3B18A', accent: '#344E41' } },
  { id: 'entertainment', label: 'Entretenimiento / Eventos', category: 'entertainment', colors: { primary: '#7209B7', secondary: '#B5179E', accent: '#4361EE' } },
  { id: 'cleaning', label: 'Limpieza / Servicios domésticos', category: 'cleaning', colors: { primary: '#00B4D8', secondary: '#90E0EF', accent: '#0077B6' } },
  { id: 'logistics', label: 'Logística / Transporte', category: 'logistics', colors: { primary: '#2B2D42', secondary: '#8D99AE', accent: '#EF233C' } },
  { id: 'consulting', label: 'Consultoría / Coaching', category: 'professional', colors: { primary: '#1D3557', secondary: '#F1FAEE', accent: '#457B9D' } },
  { id: 'photography', label: 'Fotografía', category: 'photography', colors: { primary: '#212529', secondary: '#F8F9FA', accent: '#ADB5BD' } },
  { id: 'marketing', label: 'Marketing / Publicidad', category: 'marketing', colors: { primary: '#FF4D6D', secondary: '#FF758F', accent: '#C9184A' } },
  { id: 'ngo', label: 'ONG / Sin fines de lucro', category: 'ngo', colors: { primary: '#2A9D8F', secondary: '#E9C46A', accent: '#F4A261' } },
  { id: 'other', label: 'Otro (Especificar)', category: 'business', colors: { primary: '#4A4A4A', secondary: '#F5F5F5', accent: '#000000' } }
];

export const getIndustryById = (id: string) => INDUSTRIES.find(i => i.id === id);
export const getIndustryByLabel = (label: string) => INDUSTRIES.find(i => i.label.toLowerCase() === label.toLowerCase());
