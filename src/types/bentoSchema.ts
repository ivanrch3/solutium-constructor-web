export type BentoItemType = "text" | "image" | "icon_text" | "stat" | "metric" | "cta" | "video" | "hero" | "compact" | "visual" | "feature" | "step" | "app_card" | "testimonial" | "trust_signal";
export type BentoCardStyle = "solid" | "gradient" | "glass" | "glow" | "transparent";
export type BentoTone = "professional" | "friendly" | "premium" | "tech" | "minimal";

export interface BentoItem {
  id?: string;
  type: BentoItemType;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  col_span: number;
  row_span: number;
  x?: number;
  y?: number;
  card_style?: BentoCardStyle;
  card_bg?: string;
  card_gradient?: string;
  card_image?: string;
  card_overlay?: number;
  card_radius?: number;
  card_shadow?: string;
  button_text?: string;
  btn_url?: string;
  badge?: string;
  highlight?: boolean;
  priority?: 'hero' | 'feature' | 'compact' | 'stat' | 'cta' | 'standard';
  title_size?: string;
  desc_size?: string;
  metric_suffix?: string;
  accent_color?: string;
  show_description?: boolean;
  content_position?: 'left' | 'center' | 'right';
  align_items?: 'start' | 'center' | 'end';
  text_contrast?: 'auto' | 'white' | 'black';
  layouts?: {
    desktop?: { x: number; y: number; w: number; h: number };
    tablet?: { x: number; y: number; w: number; h: number };
    mobile?: { x: number; y: number; w: number; h: number };
  };
}

export interface BentoIntent {
  goal: string;
  tone: BentoTone;
  count: number;
}

export interface BentoSchema {
  header: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
  };
  items: BentoItem[];
  layout: {
    columns: number;
    gap: number;
    bento_type?: string;
  };
}
