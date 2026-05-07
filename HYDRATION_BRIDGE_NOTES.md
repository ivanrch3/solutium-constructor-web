# Hydration Bridge Integration Notes - Solutium Constructor

## Products Implementation (Atomic Snapshot)

### Overview
To ensure published sites are independent of the project's real-time catalog database (which requires Supabase credentials not available in live mode), the Constructor implements an **Atomic Snapshot** during the publication flow.

### Flow
1. **Design Time**: User selects products from the project catalog or auto-selection in the editor. `ProductsModule` displays them using data fetched from Supabase.
2. **Publication**: When the user clicks "Publish Site", `WebConstructor.tsx` intercepts the `products` modules.
3. **Resolution**: Final products are resolved based on `selection_mode` and `select_products`.
4. **Normalization**: Products are passed through a normalization layer to ensure correct types (price as number, stock as number, etc.).
5. **Snapshot Injection**: The resulting array is injected into the publication contract under the deep key `${moduleId}_el_products_items_products` and `section.content.products`.
6. **Viewer Runtime**: In the published site, `Viewer.tsx` detects the snapshot. It prioritzies this data and avoids calling the database catalog.

### Technical Keys
- **Snapshot Key**: `${moduleId}_el_products_items_products`
- **Fallback Content Key**: `section.content.products`
- **Selection Mode Key**: `${moduleId}_el_products_config_selection_mode`

### Normalization Rules
Each product in the snapshot must conform to:
```typescript
interface Product {
  id: string; // Required
  name: string; // Required (fallback: "Producto {n}")
  description: string;
  price: number | undefined;
  priceReference: number | undefined;
  category: string;
  imageUrl: string;
  image2Url: string;
  badgeText: string;
  stock: number | undefined;
  ratingAverage: number;
  reviewCount: number;
}
```

### Benefits
- **Zero-Handshake in Live**: Live sites do not wait for `supabase_url` handshake.
- **Performance**: instant rendering from contract data.
- **Stability**: Site content doesn't change unless the owner re-publishes.

### Diagnostic Logs
- **Publication**: `[PRODUCTS_PUBLISH_SNAPSHOT_DEBUG]`
- **Viewer**: `[PRODUCTS_VIEWER_RESOLUTION_DEBUG]` (Source: `published_snapshot`)
