export type BentoItemType = "text" | "image" | "icon_text" | "stat" | "cta" | "video";
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
  button_text?: string;
  btn_url?: string;
  badge?: string;
  highlight?: boolean;
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
  };
}
