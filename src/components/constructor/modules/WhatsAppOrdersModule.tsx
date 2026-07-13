import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X
} from 'lucide-react';
import { Product } from '../../../types/schema';
import {
  createPublicWhatsAppOrderQuote,
  PublicWhatsAppOrderCode,
  PublicWhatsAppOrderQuoteResponse
} from '../../../services/publicWhatsAppOrders';
import { resolveProductsForSelection } from '../../../utils/productsSelection';
import { resolveProductPrimaryImageUrl } from '../../../utils/productImage';
import { WhatsAppOrdersAvailability } from '../../../utils/whatsappOrdersAvailability';

type ModuleRenderMode = 'preview' | 'published';

type ProductOptionChoice = {
  label: string;
  value: string;
};

type ProductOptionGroup = {
  id: string;
  label: string;
  choices: ProductOptionChoice[];
};

type CartItem = {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  price?: number;
  quantity: number;
  selectedOptions: Record<string, string>;
  selectedOptionsLabel: string[];
  notes: string | null;
};

type CheckoutFormState = {
  name: string;
  whatsapp: string;
  email: string;
};

const EMPTY_CHECKOUT_FORM: CheckoutFormState = {
  name: '',
  whatsapp: '',
  email: ''
};

const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 960;

const toBoolean = (value: unknown, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'si' || normalized === 'yes';
  }
  return Boolean(value);
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.,-]/g, '').replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeString = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

const buildCartItemId = (productId: string, selectedOptions: Record<string, string>, notes: string | null) =>
  `${productId}:${stableStringify(selectedOptions)}:${notes || ''}`;

const normalizeProduct = (product: Product, index: number): Product => {
  const raw = product as any;
  return {
    ...product,
    id: String(raw.id || `product-${index}`),
    name: normalizeString(raw.name || raw.title, 'Producto'),
    description: normalizeString(raw.description || raw.shortDescription || raw.short_description, ''),
    imageUrl: normalizeString(resolveProductPrimaryImageUrl(raw), ''),
    image2Url: normalizeString(raw.image2Url || raw.image_2_url, ''),
    price: raw.price !== undefined && raw.price !== null ? toNumber(raw.price, 0) : undefined,
    category: normalizeString(raw.category || raw.categoria, 'General'),
    status: normalizeString(raw.status, ''),
    stock: raw.stock !== undefined && raw.stock !== null ? toNumber(raw.stock, 0) : undefined,
    appData: raw.appData || raw.app_data || {}
  };
};

const extractOptionGroups = (product: Product): ProductOptionGroup[] => {
  const raw = product as any;
  const appData = raw.appData || raw.app_data || {};
  const candidates = [
    appData.options,
    appData.optionGroups,
    appData.variantOptions,
    appData.variants,
    raw.options
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;

    const groups = candidate
      .map((group: any, index: number) => {
        const label = normalizeString(group?.label || group?.name || group?.title, `Opción ${index + 1}`);
        const groupId = normalizeString(group?.id || group?.key || group?.slug, `option_${index + 1}`);
        const rawChoices = Array.isArray(group?.choices)
          ? group.choices
          : Array.isArray(group?.values)
            ? group.values
            : Array.isArray(group?.options)
              ? group.options
              : [];
        const choices = rawChoices
          .map((choice: any, choiceIndex: number) => {
            if (typeof choice === 'string') {
              const normalized = choice.trim();
              return normalized ? { label: normalized, value: normalized } : null;
            }
            const choiceLabel = normalizeString(choice?.label || choice?.name || choice?.value, '');
            const choiceValue = normalizeString(choice?.value || choice?.id || choiceLabel, '');
            if (!choiceLabel && !choiceValue) return null;
            return {
              label: choiceLabel || choiceValue,
              value: choiceValue || choiceLabel
            };
          })
          .filter((choice): choice is ProductOptionChoice => Boolean(choice));

        if (!choices.length) return null;
        return {
          id: groupId,
          label,
          choices
        };
      })
      .filter((group): group is ProductOptionGroup => Boolean(group));

    if (groups.length > 0) return groups;
  }

  return [];
};

const getResponseTone = (response: PublicWhatsAppOrderQuoteResponse | null) => {
  if (!response) return 'idle';
  if (response.ok && response.code === 'OK') return 'success';
  if (response.ok && response.code === 'PARTIAL_SUCCESS') return 'warning';
  return 'error';
};

const getResponseMessage = (response: PublicWhatsAppOrderQuoteResponse | null) => {
  if (!response) return null;

  if (response.message) return response.message;

  const fallbackByCode: Record<PublicWhatsAppOrderCode, string> = {
    OK: 'Pedido recibido. Te enviaremos la cotización a tu WhatsApp.',
    PARTIAL_SUCCESS: 'Pedido recibido. Si no recibes la cotización por WhatsApp, el negocio dará seguimiento a tu solicitud.',
    PLAN_NOT_ALLOWED: 'Disponible en planes superiores.',
    SYSTEM_NOT_READY: 'El sistema de pedidos por WhatsApp aún no está configurado para este negocio.',
    CHANNEL_NOT_AVAILABLE: 'No fue posible enviar la cotización por WhatsApp en este momento.',
    INVALID_CUSTOMER_WHATSAPP: 'Debes ingresar un número de WhatsApp válido.',
    EMPTY_CART: 'El carrito está vacío.',
    INVALID_PRODUCT: 'El pedido contiene productos o cantidades inválidas.',
    PRODUCT_UNAVAILABLE: 'Uno o más productos ya no están disponibles para cotizar.',
    INVALID_SITE: 'No pudimos identificar el sitio publicado.',
    PAGE_NOT_FOUND: 'La página indicada no pertenece a este sitio.',
    MODULE_NOT_FOUND: 'El módulo indicado no pertenece a este sitio.',
    QUOTE_CREATION_FAILED: 'No pudimos procesar el pedido en este momento.'
  };

  return fallbackByCode[response.code] || 'No pudimos procesar el pedido en este momento.';
};

export const WhatsAppOrdersModule: React.FC<{
  moduleId: string;
  settingsValues: Record<string, any>;
  products?: Product[];
  renderMode?: ModuleRenderMode;
  publishedSiteId?: string | null;
  pageId?: string | null;
  projectId?: string | null;
  activeViewport?: 'desktop' | 'tablet' | 'mobile';
  availability?: WhatsAppOrdersAvailability | null;
}> = ({
  moduleId,
  settingsValues,
  products = [],
  renderMode = 'preview',
  publishedSiteId = null,
  pageId = null,
  projectId = null,
  activeViewport,
  availability = null
}) => {
  const getVal = React.useCallback((elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  }, [moduleId, settingsValues]);

  const title = getVal(`${moduleId}_el_whatsapp_orders_header`, 'title', 'Pedidos por WhatsApp');
  const subtitle = getVal(`${moduleId}_el_whatsapp_orders_header`, 'subtitle', 'Muestra tu catálogo y recibe pedidos confirmados desde tu web.');
  const mode = normalizeString(getVal(null, 'mode', 'orders'), 'orders') === 'visual' ? 'visual' : 'orders';
  const selectionMode = normalizeString(getVal(`${moduleId}_el_whatsapp_orders_catalog`, 'selection_mode', 'auto'), 'auto').toLowerCase();
  const selectedProductIds = Array.isArray(getVal(`${moduleId}_el_whatsapp_orders_catalog`, 'select_products', []))
    ? getVal(`${moduleId}_el_whatsapp_orders_catalog`, 'select_products', [])
    : [];
  const layout = normalizeString(getVal(null, 'layout', 'grid'), 'grid') === 'list' ? 'list' : 'grid';
  const columns = Math.max(1, Math.min(4, Number(getVal(null, 'columns', 3)) || 3));
  const gap = Math.max(8, Math.min(48, Number(getVal(null, 'gap', 24)) || 24));
  const paddingY = Math.max(24, Math.min(160, Number(getVal(null, 'padding_y', 56)) || 56));
  const showPrices = toBoolean(getVal(null, 'showPrices', true), true);
  const showDescriptions = toBoolean(getVal(null, 'showDescriptions', true), true);
  const showSearch = toBoolean(getVal(null, 'showSearch', true), true);
  const showCategories = toBoolean(getVal(null, 'showCategories', false), false);
  const buttonLabel = getVal(null, 'buttonLabel', 'Agregar al pedido');
  const emptyStateText = getVal(null, 'emptyStateText', 'No hay productos disponibles en este momento.');
  const confirmationTitle = getVal(null, 'confirmationTitle', 'Confirma tu pedido');
  const confirmationDescription = getVal(null, 'confirmationDescription', 'Déjanos tu WhatsApp y te enviaremos la cotización.');
  const customerNameRequired = toBoolean(getVal(null, 'customerNameRequired', false), false);
  const customerEmailEnabled = toBoolean(getVal(null, 'customerEmailEnabled', true), true);
  const customerNotesEnabled = toBoolean(getVal(null, 'customerNotesEnabled', false), false);

  const normalizedProducts = React.useMemo(
    () => (Array.isArray(products) ? products : []).map((product, index) => normalizeProduct(product, index)),
    [products]
  );

  const filteredBySelection = React.useMemo(() => {
    if (selectionMode !== 'manual') return normalizedProducts;
    return resolveProductsForSelection({
      selectionMode,
      selectedIds: selectedProductIds,
      availableProducts: normalizedProducts
    });
  }, [normalizedProducts, selectedProductIds, selectionMode]);

  const categories = React.useMemo(() => {
    const allCategories = Array.from(new Set(filteredBySelection.map((product) => normalizeString(product.category, 'General'))));
    return allCategories.filter(Boolean);
  }, [filteredBySelection]);

  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = React.useState(1);
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});
  const [selectedNotes, setSelectedNotes] = React.useState('');
  const [cartOpen, setCartOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [checkoutForm, setCheckoutForm] = React.useState<CheckoutFormState>(EMPTY_CHECKOUT_FORM);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [submitState, setSubmitState] = React.useState<'idle' | 'loading' | 'done'>('idle');
  const [submitResponse, setSubmitResponse] = React.useState<PublicWhatsAppOrderQuoteResponse | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const submitAttemptKeyRef = React.useRef<string | null>(null);
  const catalogContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [catalogWidth, setCatalogWidth] = React.useState(0);
  const planBlocked = Boolean(availability?.known && !availability.allowed);
  const previewOrdersBlocked = renderMode === 'preview' && mode === 'orders' && planBlocked;
  const ordersInteractionEnabled = mode === 'orders' && !previewOrdersBlocked;

  const currentOptionGroups = React.useMemo(
    () => (selectedProduct ? extractOptionGroups(selectedProduct) : []),
    [selectedProduct]
  );

  const storageScopeId = React.useMemo(() => {
    const runtimeSiteId = publishedSiteId || (window as any).SITE_ID || (window as any).currentSite?.site_id || 'preview';
    const runtimePageId = pageId || 'page';
    return [runtimeSiteId, runtimePageId, moduleId, projectId || 'project'].join(':');
  }, [moduleId, pageId, projectId, publishedSiteId]);

  const storageKey = React.useMemo(
    () => `solutium_whatsapp_orders_cart:${storageScopeId}`,
    [storageScopeId]
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.items)) {
        setCartItems(parsed.items);
      }
      if (parsed?.customer && typeof parsed.customer === 'object') {
        setCheckoutForm({
          name: normalizeString(parsed.customer.name, ''),
          whatsapp: normalizeString(parsed.customer.whatsapp, ''),
          email: normalizeString(parsed.customer.email, '')
        });
      }
    } catch {
      // noop
    }
  }, [storageKey]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (cartItems.length === 0 && !checkoutForm.name && !checkoutForm.whatsapp && !checkoutForm.email) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      window.localStorage.setItem(storageKey, JSON.stringify({
        items: cartItems,
        customer: checkoutForm
      }));
    } catch {
      // noop
    }
  }, [cartItems, checkoutForm, storageKey]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    const node = catalogContainerRef.current;
    if (!node) return;

    const updateWidth = () => {
      setCatalogWidth(node.getBoundingClientRect().width || 0);
    };

    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!previewOrdersBlocked) return;
    setCartOpen(false);
    setCheckoutOpen(false);
    setSubmitResponse(null);
    setSubmitError(null);
  }, [previewOrdersBlocked]);

  const visibleProducts = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return filteredBySelection.filter((product) => {
      const matchesCategory = activeCategory === 'Todos' || normalizeString(product.category, 'General') === activeCategory;
      const matchesSearch = !normalizedSearch
        || product.name.toLowerCase().includes(normalizedSearch)
        || normalizeString(product.description, '').toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, filteredBySelection, search]);

  const cartCount = React.useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const subtotal = React.useMemo(
    () => cartItems.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0),
    [cartItems]
  );

  const openProductDetail = React.useCallback((product: Product) => {
    setSelectedProduct(product);
    setSelectedQuantity(1);
    setSelectedNotes('');

    const groups = extractOptionGroups(product);
    const defaults: Record<string, string> = {};
    groups.forEach((group) => {
      defaults[group.id] = group.choices[0]?.value || '';
    });
    setSelectedOptions(defaults);
  }, []);

  const addCurrentProductToCart = React.useCallback(() => {
    if (!selectedProduct) return;
    const optionLabels = currentOptionGroups
      .map((group) => {
        const selectedValue = selectedOptions[group.id];
        const choice = group.choices.find((entry) => entry.value === selectedValue);
        return choice ? `${group.label}: ${choice.label}` : null;
      })
      .filter(Boolean) as string[];

    const nextItem: CartItem = {
      id: buildCartItemId(selectedProduct.id, selectedOptions, customerNotesEnabled ? selectedNotes || null : null),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      imageUrl: selectedProduct.imageUrl,
      price: selectedProduct.price,
      quantity: selectedQuantity,
      selectedOptions,
      selectedOptionsLabel: optionLabels,
      notes: customerNotesEnabled ? (selectedNotes || null) : null
    };

    setCartItems((current) => {
      const existingIndex = current.findIndex((item) => item.id === nextItem.id);
      if (existingIndex === -1) {
        return [...current, nextItem];
      }
      return current.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: item.quantity + nextItem.quantity }
          : item
      );
    });
    setSelectedProduct(null);
    setCartOpen(true);
    setSubmitResponse(null);
    setSubmitError(null);
  }, [currentOptionGroups, customerNotesEnabled, selectedNotes, selectedOptions, selectedProduct, selectedQuantity]);

  const updateCartQuantity = React.useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((current) => current.filter((item) => item.id !== cartItemId));
      return;
    }
    setCartItems((current) => current.map((item) => item.id === cartItemId ? { ...item, quantity } : item));
  }, []);

  const removeCartItem = React.useCallback((cartItemId: string) => {
    setCartItems((current) => current.filter((item) => item.id !== cartItemId));
  }, []);

  const clearCheckoutState = React.useCallback(() => {
    setSubmitError(null);
    setSubmitResponse(null);
    setSubmitState('idle');
  }, []);

  const handleSubmitOrder = React.useCallback(async () => {
    if (previewOrdersBlocked) {
      setSubmitError(availability?.message || 'Disponible en planes superiores.');
      return;
    }
    if (submitState === 'loading') return;
    if (cartItems.length === 0) {
      setSubmitError('El carrito está vacío.');
      return;
    }
    if (!checkoutForm.whatsapp.trim()) {
      setSubmitError('Debes ingresar un número de WhatsApp válido.');
      return;
    }
    if (customerNameRequired && !checkoutForm.name.trim()) {
      setSubmitError('Debes ingresar tu nombre para confirmar el pedido.');
      return;
    }
    if (!publishedSiteId) {
      setSubmitError('Este flujo de confirmación está disponible cuando el sitio ya está publicado.');
      return;
    }

    const idempotencyKey = submitAttemptKeyRef.current || crypto.randomUUID();
    submitAttemptKeyRef.current = idempotencyKey;
    setSubmitState('loading');
    setSubmitError(null);
    setSubmitResponse(null);

    try {
      const response = await createPublicWhatsAppOrderQuote({
        publishedSiteId,
        pageId,
        moduleId,
        customer: {
          name: checkoutForm.name.trim() || null,
          whatsapp: checkoutForm.whatsapp.trim(),
          email: customerEmailEnabled ? (checkoutForm.email.trim() || null) : null
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          notes: item.notes
        })),
        idempotencyKey
      });

      setSubmitResponse(response);
      setSubmitState('done');

      if (response.ok) {
        setCartItems([]);
        setCartOpen(true);
        setCheckoutOpen(false);
        submitAttemptKeyRef.current = null;
      } else {
        setSubmitError(getResponseMessage(response));
      }
    } catch (error: any) {
      setSubmitState('done');
      setSubmitError(error?.message || 'No pudimos procesar el pedido en este momento.');
    }
  }, [
    cartItems,
    checkoutForm.email,
    checkoutForm.name,
    checkoutForm.whatsapp,
    customerEmailEnabled,
    customerNameRequired,
    moduleId,
    pageId,
    publishedSiteId,
    previewOrdersBlocked,
    submitState
  ]);

  const effectiveColumns = React.useMemo(() => {
    if (layout === 'list') return 1;
    if (activeViewport === 'mobile') return 1;
    if (activeViewport === 'tablet') return Math.min(columns, 2);
    if (activeViewport === 'desktop') return columns;
    if (catalogWidth > 0 && catalogWidth < MOBILE_BREAKPOINT) return 1;
    if (catalogWidth > 0 && catalogWidth < TABLET_BREAKPOINT) return Math.min(columns, 2);
    return columns;
  }, [activeViewport, catalogWidth, columns, layout]);

  const gridStyle = React.useMemo<React.CSSProperties>(() => {
    if (layout === 'list') {
      return { gap, gridTemplateColumns: 'minmax(0, 1fr)' };
    }
    return {
      gap,
      gridTemplateColumns: `repeat(${effectiveColumns}, minmax(0, 1fr))`
    };
  }, [effectiveColumns, gap, layout]);

  const floatingCartButtonClass =
    catalogWidth > 0 && catalogWidth < TABLET_BREAKPOINT
      ? 'fixed bottom-4 right-4 z-[70] flex items-center gap-2 rounded-full border border-black/10 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg backdrop-blur'
      : 'fixed right-4 top-4 z-[70] flex items-center gap-2 rounded-full border border-black/10 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg backdrop-blur';

  const responseTone = getResponseTone(submitResponse);
  const responseMessage = getResponseMessage(submitResponse);

  if (renderMode === 'published' && planBlocked) {
    return null;
  }

  return (
    <section
      data-module-type="whatsapp_orders"
      className="relative w-full"
      style={{
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
        background: 'var(--background-color, #ffffff)',
        color: 'var(--text-color, #0f172a)'
      }}
    >
      {ordersInteractionEnabled && (
        <button
          type="button"
          onClick={() => {
            setCartOpen(true);
            clearCheckoutState();
          }}
          className={floatingCartButtonClass}
        >
          <ShoppingCart size={16} />
          <span>{cartCount}</span>
        </button>
      )}

      <div ref={catalogContainerRef} className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary-color,#16a34a)]">
            <MessageCircle size={16} />
            <span>{mode === 'orders' ? 'Pedidos por WhatsApp' : 'Catálogo visual'}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
          {subtitle ? (
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>
          ) : null}
          {previewOrdersBlocked ? (
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
              <AlertCircle size={16} />
              <span>{availability?.message || 'Disponible en planes superiores.'}</span>
            </div>
          ) : null}
        </div>

        {(showSearch || (showCategories && categories.length > 0)) && (
          <div className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm backdrop-blur">
            {showSearch && (
              <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 py-3">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar productos"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>
            )}

            {showCategories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {['Todos', ...categories].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                      activeCategory === category
                        ? 'bg-[var(--primary-color,#16a34a)] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            {emptyStateText}
          </div>
        ) : (
          <div className="grid" style={gridStyle}>
            {visibleProducts.map((product) => {
              const isUnavailable = normalizeString(product.status, '').toLowerCase() === 'inactive';
              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => openProductDetail(product)}
                    className="flex w-full flex-col text-left"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <ShoppingCart size={36} />
                        </div>
                      )}
                      {isUnavailable && (
                        <span className="absolute left-3 top-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          No disponible
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-slate-950">{product.name}</h3>
                          {product.category ? (
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{product.category}</p>
                          ) : null}
                        </div>
                        {showPrices && product.price !== undefined ? (
                          <span className="text-base font-black text-[var(--primary-color,#16a34a)]">
                            ${Number(product.price || 0).toFixed(2)}
                          </span>
                        ) : null}
                      </div>

                      {showDescriptions && product.description ? (
                        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{product.description}</p>
                      ) : null}

                      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                        <span className="text-xs font-semibold text-slate-400">
                          {ordersInteractionEnabled ? 'Ver detalle y agregar' : 'Ver detalle'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-900">
                          Abrir
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[28px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-5 py-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">{selectedProduct.name}</h3>
                {showPrices && selectedProduct.price !== undefined ? (
                  <p className="text-sm font-bold text-[var(--primary-color,#16a34a)]">${Number(selectedProduct.price || 0).toFixed(2)}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="grid gap-6 p-5"
              style={{
                gridTemplateColumns:
                  catalogWidth > 0 && catalogWidth < TABLET_BREAKPOINT
                    ? 'minmax(0, 1fr)'
                    : 'minmax(0, 1.05fr) minmax(0, 0.95fr)'
              }}
            >
              <div className="overflow-hidden rounded-[24px] bg-slate-100">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center text-slate-400">
                    <ShoppingCart size={44} />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {selectedProduct.description ? (
                  <p className="text-sm leading-6 text-slate-600">{selectedProduct.description}</p>
                ) : null}

                {currentOptionGroups.map((group) => (
                  <label key={group.id} className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{group.label}</span>
                    <select
                      value={selectedOptions[group.id] || ''}
                      onChange={(event) => setSelectedOptions((current) => ({
                        ...current,
                        [group.id]: event.target.value
                      }))}
                      className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-[var(--primary-color,#16a34a)]"
                    >
                      {group.choices.map((choice) => (
                        <option key={choice.value} value={choice.value}>{choice.label}</option>
                      ))}
                    </select>
                  </label>
                ))}

                {customerNotesEnabled && mode === 'orders' && (
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Notas para este producto</span>
                    <textarea
                      rows={3}
                      value={selectedNotes}
                      onChange={(event) => setSelectedNotes(event.target.value)}
                      placeholder="Ej. sin cebolla, empaque de regalo, entrega en la tarde"
                      className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-[var(--primary-color,#16a34a)]"
                    />
                  </label>
                )}

                {ordersInteractionEnabled ? (
                  <>
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Cantidad</span>
                      <div className="inline-flex items-center rounded-full border border-black/10 bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setSelectedQuantity((value) => Math.max(1, value - 1))}
                          className="rounded-full p-2 text-slate-700 transition hover:bg-white"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="min-w-[2.5rem] text-center text-base font-black text-slate-950">{selectedQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedQuantity((value) => value + 1)}
                          className="rounded-full p-2 text-slate-700 transition hover:bg-white"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addCurrentProductToCart}
                      className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary-color,#16a34a)] px-4 py-3 text-sm font-black text-white transition hover:opacity-90"
                    >
                      {buttonLabel}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && ordersInteractionEnabled && (
        <div className="fixed inset-0 z-[75] flex justify-end bg-slate-950/40">
          <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">Tu pedido</h3>
                <p className="text-sm text-slate-500">{cartCount} producto(s)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(false);
                }}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                  El carrito está vacío.
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-black/5 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <ShoppingCart size={20} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-black text-slate-950">{item.name}</h4>
                              {showPrices && item.price !== undefined ? (
                                <p className="text-sm font-bold text-[var(--primary-color,#16a34a)]">${Number(item.price || 0).toFixed(2)}</p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCartItem(item.id)}
                              className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-rose-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {item.selectedOptionsLabel.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.selectedOptionsLabel.map((entry) => (
                                <span key={entry} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                  {entry}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.notes ? (
                            <p className="mt-2 text-xs leading-5 text-slate-500">{item.notes}</p>
                          ) : null}

                          <div className="mt-3 inline-flex items-center rounded-full border border-black/10 bg-white p-1">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="rounded-full p-2 text-slate-700 transition hover:bg-slate-100"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="min-w-[2.5rem] text-center text-sm font-black text-slate-950">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="rounded-full p-2 text-slate-700 transition hover:bg-slate-100"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {responseMessage && (
                <div
                  className={`mt-4 rounded-3xl border px-4 py-3 text-sm ${
                    responseTone === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : responseTone === 'warning'
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {responseTone === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <div>
                      <p className="font-semibold">{responseMessage}</p>
                      {submitResponse?.publicQuoteUrl ? (
                        <a
                          href={submitResponse.publicQuoteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex text-xs font-bold underline"
                        >
                          Ver cotización
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {submitError && !responseMessage && (
                <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </div>
              )}

              {renderMode === 'preview' && !publishedSiteId && checkoutOpen && (
                <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  En preview puedes validar la experiencia del carrito. La confirmación real se habilita cuando el sitio ya está publicado.
                </div>
              )}

              {checkoutOpen && (
                <div className="mt-5 space-y-4 rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-slate-950">{confirmationTitle}</h4>
                    <p className="text-sm leading-6 text-slate-500">{confirmationDescription}</p>
                  </div>

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Nombre {customerNameRequired ? '*' : '(opcional)'}
                    </span>
                    <input
                      value={checkoutForm.name}
                      onChange={(event) => setCheckoutForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-2xl border border-black/10 px-3 py-3 text-sm outline-none focus:border-[var(--primary-color,#16a34a)]"
                      placeholder="Tu nombre"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">WhatsApp *</span>
                    <input
                      value={checkoutForm.whatsapp}
                      onChange={(event) => setCheckoutForm((current) => ({ ...current, whatsapp: event.target.value }))}
                      className="w-full rounded-2xl border border-black/10 px-3 py-3 text-sm outline-none focus:border-[var(--primary-color,#16a34a)]"
                      placeholder="+506 8888 8888"
                    />
                  </label>

                  {customerEmailEnabled && (
                    <label className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Correo electrónico</span>
                      <input
                        value={checkoutForm.email}
                        onChange={(event) => setCheckoutForm((current) => ({ ...current, email: event.target.value }))}
                        className="w-full rounded-2xl border border-black/10 px-3 py-3 text-sm outline-none focus:border-[var(--primary-color,#16a34a)]"
                        placeholder="tu@correo.com"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-black/5 px-5 py-4">
              {showPrices && (
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-500">Subtotal estimado</span>
                  <span className="text-base font-black text-slate-950">${subtotal.toFixed(2)}</span>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setCheckoutOpen((current) => !current)}
                  disabled={cartItems.length === 0}
                  className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkoutOpen ? 'Seguir comprando' : 'Confirmar pedido'}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={cartItems.length === 0 || !checkoutOpen || submitState === 'loading'}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary-color,#16a34a)] px-4 py-3 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                  {submitState === 'loading' ? 'Enviando pedido...' : 'Confirmar pedido'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
