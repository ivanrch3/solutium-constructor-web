import { BentoSchema, BentoItem, BentoItemType } from '../types/bentoSchema';

export const validateBentoSchema = (input: any): BentoSchema => {
  const schema = repairBentoSchema(input);
  
  if (!schema.header.title) {
    schema.header.title = "Grid de Contenido";
  }
  
  if (!Array.isArray(schema.items) || schema.items.length === 0) {
    schema.items = [
      {
        type: "icon_text",
        title: "Elemento de ejemplo",
        description: "Descripción del elemento generado.",
        icon: "Sparkles",
        col_span: 1,
        row_span: 1,
        x: 0,
        y: 0
      }
    ];
  }
  
  return schema;
};

export const normalizeBentoItem = (item: any): BentoItem => {
  const type: BentoItemType = ["text", "image", "icon_text", "stat", "cta", "video"].includes(item.type) 
    ? item.type 
    : "icon_text";
    
  return {
    type,
    title: String(item.title || item.titulo || "Título"),
    description: String(item.description || item.descripcion || item.text || ""),
    icon: String(item.icon || item.icono || "Sparkles"),
    image: String(item.image || item.image_url || ""),
    col_span: Math.max(1, Math.min(4, parseInt(String(item.col_span || item.cols || 1)))),
    row_span: Math.max(1, Math.min(4, parseInt(String(item.row_span || item.rows || 1)))),
    x: item.x !== undefined ? parseInt(String(item.x)) : undefined,
    y: item.y !== undefined ? parseInt(String(item.y)) : undefined,
    button_text: item.button_text || item.cta_text || undefined,
    btn_url: item.btn_url || item.url || undefined,
    card_style: item.card_style || "solid",
    badge: item.badge || undefined,
    highlight: !!item.highlight
  };
};

export const repairBentoSchema = (input: any): BentoSchema => {
  const header = {
    eyebrow: String(input?.header?.eyebrow || input?.eyebrow || ""),
    title: String(input?.header?.title || input?.title || input?.titulo || ""),
    subtitle: String(input?.header?.subtitle || input?.subtitle || input?.descripcion || "")
  };
  
  const rawItems = Array.isArray(input?.items) ? input.items : Array.isArray(input?.cards) ? input.cards : [];
  const columns = Math.max(1, Math.min(12, parseInt(String(input?.layout?.columns || input?.columns || 4))));
  
  const normalizedItems = rawItems.map(normalizeBentoItem);
  
  // Apply Auto-Layout if x/y are missing or for safety
  let cursorX = 0;
  let cursorY = 0;
  const grid: boolean[][] = Array.from({ length: 100 }, () => Array(columns).fill(false));

  const itemsWithLayout = normalizedItems.map(item => {
    let { x, y, col_span, row_span } = item;
    
    // Safety fallback for spans to ensure they don't exceed columns
    if (col_span > columns) col_span = columns;

    if (x === undefined || y === undefined) {
      // Search for first available spot
      let found = false;
      for (let r = 0; r < 100 && !found; r++) {
        for (let c = 0; c <= columns - col_span && !found; c++) {
          let spaceAvailable = true;
          for (let ir = 0; ir < row_span; ir++) {
            for (let ic = 0; ic < col_span; ic++) {
              if (grid[r + ir][c + ic]) {
                spaceAvailable = false;
                break;
              }
            }
            if (!spaceAvailable) break;
          }
          
          if (spaceAvailable) {
            x = c;
            y = r;
            found = true;
          }
        }
      }
      
      // If still not found after 100 rows, put it somewhere at the bottom
      if (!found) {
        x = 0;
        y = cursorY + 1;
      }
    }
    
    // Mark spots in grid
    for (let ir = 0; ir < (row_span || 1); ir++) {
      for (let ic = 0; ic < (col_span || 1); ic++) {
        const targetY = (y || 0) + ir;
        const targetX = (x || 0) + ic;
        if (targetY < 100 && targetX < columns) {
          grid[targetY][targetX] = true;
          cursorY = Math.max(cursorY, targetY);
        }
      }
    }
    
    return { ...item, x, y };
  });

  return {
    header,
    items: itemsWithLayout,
    layout: {
      columns,
      gap: parseInt(String(input?.layout?.gap || input?.gap || 20))
    }
  };
};

export const isValidBentoSchema = (input: any): boolean => {
  return !!(input && (input.header?.title || input.title) && (Array.isArray(input.items) || Array.isArray(input.cards)));
};
