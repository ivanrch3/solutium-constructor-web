import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
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
import { fetchHostedPublicCatalogItem } from '../../../services/publicCatalogItems';
import { normalizePublicCatalogSlug } from '../../../utils/publicCatalogItemRoute';
import { WhatsAppOrdersAvailability } from '../../../utils/whatsappOrdersAvailability';
import {
  formatProjectCurrency,
  resolveProjectCurrencySettings,
  type ProjectCurrencySettings
} from '../../../utils/projectCurrency';
import { PHONE_COUNTRIES, getPhoneCountryFlag, type PhoneCountry } from '../../../constants/phoneCountries';
import {
  buildInternationalPhone,
  findPhoneCountry,
  getPhoneValidationError,
  normalizeNationalPhoneNumber,
  resolveInitialPhoneCountry,
  type StructuredPhone
} from '../../../utils/phoneCountry';
import {
  classifyWebOrderResult,
  normalizeWebOrderResponse
} from '../../../utils/publicWhatsAppOrderResult';
import { submitWithSingleNetworkRetry } from '../../../utils/publicWhatsAppOrderRecovery';
import {
  buildCustomerProfileStorageKey,
  mergePublicWhatsAppOrderCustomerProfiles,
  normalizePublicWhatsAppOrderCustomerProfile
} from '../../../utils/publicWhatsAppOrderCustomerProfile';

type ModuleRenderMode = 'preview' | 'published';

type ProductOptionChoice = {
  id: string;
  label: string;
  value: string;
  description: string;
  priceAdjustment: number;
  isDefault: boolean;
};

type ProductOptionGroup = {
  id: string;
  label: string;
  description: string;
  selectionType: 'single' | 'multiple' | 'quantity';
  isRequired: boolean;
  minSelections: number;
  maxSelections: number | null;
  choices: ProductOptionChoice[];
};

type SelectedOptionValue = string | string[] | Record<string, number>;
type SelectedOptions = Record<string, SelectedOptionValue>;

type CartOptionSelectionSnapshot = {
  optionId: string;
  optionName: string;
  quantity: number;
  priceAdjustment: number;
  totalAdjustment: number;
};

type CartOptionGroupSnapshot = {
  groupId: string;
  groupName: string;
  selectionType: ProductOptionGroup['selectionType'];
  selections: CartOptionSelectionSnapshot[];
  totalAdjustment: number;
};

type CartItem = {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  // price stays for carts saved before item option snapshots were introduced.
  price?: number;
  quantity: number;
  selectedOptions: SelectedOptions;
  selectedOptionsLabel: string[];
  optionGroupsSnapshot: CartOptionGroupSnapshot[];
  unitBasePrice: number;
  unitOptionsAdjustment: number;
  unitFinalPrice: number;
  optionsSummary: string[];
  notes: string | null;
};

type CheckoutFormState = StructuredPhone & {
  name: string;
  email: string;
  orderNotes: string;
};

const createEmptyCheckoutForm = (country: PhoneCountry): CheckoutFormState => ({
  name: '',
  email: '',
  orderNotes: '',
  phoneCountryCode: country.countryCode,
  phoneCallingCode: country.callingCode,
  phoneNationalNumber: ''
});

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

const buildCartItemId = (productId: string, selectedOptions: SelectedOptions, notes: string | null) =>
  `${productId}:${stableStringify(selectedOptions)}:${notes || ''}`;

const getProductAppData = (raw: any): Record<string, any> => {
  const candidates = [
    raw?.appData,
    raw?.app_data,
    raw?.product?.appData,
    raw?.product?.app_data,
    raw?.snapshot?.appData,
    raw?.snapshot?.app_data,
    raw?.rawItem?.appData,
    raw?.rawItem?.app_data
  ];

  const appData = candidates.find((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate));
  return appData || {};
};

const resolveProductOptionGroupsSource = (raw: any): unknown => {
  const appData = getProductAppData(raw);
  const candidates = [
    raw?.optionGroups,
    appData.catalogOptionGroups,
    raw?.app_data?.catalogOptionGroups,
    raw?.product?.optionGroups,
    raw?.product?.appData?.catalogOptionGroups,
    raw?.product?.app_data?.catalogOptionGroups,
    raw?.snapshot?.optionGroups,
    raw?.snapshot?.appData?.catalogOptionGroups,
    raw?.snapshot?.app_data?.catalogOptionGroups,
    raw?.rawItem?.optionGroups,
    raw?.rawItem?.appData?.catalogOptionGroups,
    raw?.rawItem?.app_data?.catalogOptionGroups
  ];

  return candidates.find((candidate) => Array.isArray(candidate));
};

const hasProductOptionGroupsSnapshot = (product: Product) =>
  Array.isArray(resolveProductOptionGroupsSource(product as any));

const normalizeProduct = (product: Product, index: number): Product => {
  const raw = product as any;
  const appData = getProductAppData(raw);
  const optionGroups = resolveProductOptionGroupsSource(raw);
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
    appData,
    optionGroups: Array.isArray(optionGroups) ? optionGroups : raw.optionGroups
  } as Product;
};

const extractOptionGroups = (product: Product): ProductOptionGroup[] => {
  const raw = product as any;
  const appData = getProductAppData(raw);
  const candidates = [
    resolveProductOptionGroupsSource(raw),
    appData.catalogOptionGroups,
    appData.options,
    appData.optionGroups,
    appData.variantOptions,
    appData.variants,
    raw.options
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;

    const groups = candidate
      .filter((group: any) => group?.isActive !== false)
      .map((group: any, index: number) => {
        const label = normalizeString(group?.label || group?.name || group?.title, `Opción ${index + 1}`);
        const groupId = normalizeString(group?.id || group?.key || group?.slug, `option_${index + 1}`);
        const rawSelectionType = normalizeString(group?.selectionType, 'single');
        const selectionType: ProductOptionGroup['selectionType'] = rawSelectionType === 'multiple' || rawSelectionType === 'quantity'
          ? rawSelectionType
          : 'single';
        const rawChoices = Array.isArray(group?.choices)
          ? group.choices
          : Array.isArray(group?.values)
            ? group.values
            : Array.isArray(group?.options)
              ? group.options
              : [];
        const choices = rawChoices
          .filter((choice: any) => typeof choice === 'string' || choice?.isActive !== false)
          .sort((left: any, right: any) => toNumber(left?.sortOrder ?? left?.sort_order, 0) - toNumber(right?.sortOrder ?? right?.sort_order, 0))
          .map((choice: any, choiceIndex: number) => {
            if (typeof choice === 'string') {
              const normalized = choice.trim();
              return normalized
                ? {
                    id: normalized,
                    label: normalized,
                    value: normalized,
                    description: '',
                    priceAdjustment: 0,
                    isDefault: false
                  }
                : null;
            }
            const choiceLabel = normalizeString(choice?.label || choice?.name || choice?.value, '');
            const choiceValue = normalizeString(choice?.value || choice?.id || choiceLabel, '');
            if (!choiceLabel && !choiceValue) return null;
            return {
              id: normalizeString(choice?.id, choiceValue || `choice_${choiceIndex + 1}`),
              label: choiceLabel || choiceValue,
              value: choiceValue || choiceLabel,
              description: normalizeString(choice?.description, ''),
              priceAdjustment: toNumber(choice?.priceAdjustment ?? choice?.price_adjustment, 0),
              isDefault: toBoolean(choice?.isDefault ?? choice?.is_default, false)
            };
          })
          .filter((choice): choice is ProductOptionChoice => Boolean(choice));

        if (!choices.length) return null;
        return {
          id: groupId,
          label,
          description: normalizeString(group?.description, ''),
          selectionType,
          isRequired: toBoolean(group?.isRequired ?? group?.is_required, false),
          minSelections: Math.max(0, toNumber(group?.minSelections ?? group?.min_selections, 0)),
          maxSelections: (() => {
            const max = toNumber(group?.maxSelections ?? group?.max_selections, 0);
            return max > 0 ? max : null;
          })(),
          choices
        };
      })
      .filter((group): group is ProductOptionGroup => Boolean(group));

    if (groups.length > 0) {
      return groups.sort((left, right) => {
        const leftSource = candidate.find((group: any) => normalizeString(group?.id || group?.key || group?.slug) === left.id);
        const rightSource = candidate.find((group: any) => normalizeString(group?.id || group?.key || group?.slug) === right.id);
        return toNumber(leftSource?.sortOrder ?? leftSource?.sort_order, 0) - toNumber(rightSource?.sortOrder ?? rightSource?.sort_order, 0);
      });
    }
  }

  return [];
};

const getSelectedChoiceValues = (selection: SelectedOptionValue | undefined): string[] => {
  if (typeof selection === 'string') return selection ? [selection] : [];
  if (Array.isArray(selection)) return selection.filter(Boolean);
  if (selection && typeof selection === 'object') {
    return Object.entries(selection)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([choiceId]) => choiceId);
  }
  return [];
};

const getSelectionCount = (selection: SelectedOptionValue | undefined, selectionType: ProductOptionGroup['selectionType']) => {
  if (selectionType !== 'quantity') return getSelectedChoiceValues(selection).length;
  if (!selection || typeof selection !== 'object' || Array.isArray(selection)) return 0;
  return Object.values(selection).reduce((total, quantity) => total + Math.max(0, Number(quantity) || 0), 0);
};

const getQuantitySelection = (selection: SelectedOptionValue | undefined): Record<string, number> => {
  return selection && typeof selection === 'object' && !Array.isArray(selection)
    ? selection
    : {};
};

const getDefaultSelectedOptions = (groups: ProductOptionGroup[]): SelectedOptions => {
  return groups.reduce<SelectedOptions>((defaults, group) => {
    const selected = group.choices.filter((choice) => choice.isDefault).map((choice) => choice.value);
    if (group.selectionType === 'single') {
      if (selected[0]) defaults[group.id] = selected[0];
    } else if (group.selectionType === 'multiple') {
      if (selected.length) defaults[group.id] = selected;
    } else if (selected.length) {
      defaults[group.id] = selected.reduce<Record<string, number>>((quantities, choiceValue) => {
        quantities[choiceValue] = 1;
        return quantities;
      }, {});
    }
    return defaults;
  }, {});
};

const getOptionSelectionValidation = (groups: ProductOptionGroup[], selectedOptions: SelectedOptions) => {
  return groups.reduce<Record<string, string>>((errors, group) => {
    const count = getSelectionCount(selectedOptions[group.id], group.selectionType);
    const minimum = Math.max(group.isRequired ? 1 : 0, group.minSelections);
    if (count < minimum) {
      errors[group.id] = minimum === 1 ? 'Selecciona una opcion.' : `Selecciona al menos ${minimum} opciones.`;
    } else if (group.maxSelections !== null && count > group.maxSelections) {
      errors[group.id] = `Puedes seleccionar hasta ${group.maxSelections} opciones.`;
    }
    return errors;
  }, {});
};

const getOptionPriceAdjustment = (groups: ProductOptionGroup[], selectedOptions: SelectedOptions) => {
  return groups.reduce((total, group) => {
    const selection = selectedOptions[group.id];
    return total + group.choices.reduce((groupTotal, choice) => {
      if (group.selectionType === 'quantity' && selection && typeof selection === 'object' && !Array.isArray(selection)) {
        return groupTotal + choice.priceAdjustment * Math.max(0, Number(selection[choice.value]) || 0);
      }
      return getSelectedChoiceValues(selection).includes(choice.value)
        ? groupTotal + choice.priceAdjustment
        : groupTotal;
    }, 0);
  }, 0);
};

const buildOptionSelectionSnapshot = (
  groups: ProductOptionGroup[],
  selectedOptions: SelectedOptions,
  formatAmount: (amount: number) => string
): { optionGroupsSnapshot: CartOptionGroupSnapshot[]; optionsSummary: string[]; unitOptionsAdjustment: number } => {
  const optionGroupsSnapshot = groups.flatMap((group) => {
    const selection = selectedOptions[group.id];
    const selections = group.choices.flatMap((choice) => {
      const quantity = group.selectionType === 'quantity'
        ? Math.max(0, Number(getQuantitySelection(selection)[choice.value]) || 0)
        : getSelectedChoiceValues(selection).includes(choice.value)
          ? 1
          : 0;

      if (quantity <= 0) return [];

      return [{
        optionId: choice.id,
        optionName: choice.label,
        quantity,
        priceAdjustment: choice.priceAdjustment,
        totalAdjustment: choice.priceAdjustment * quantity
      }];
    });

    if (selections.length === 0) return [];

    return [{
      groupId: group.id,
      groupName: group.label,
      selectionType: group.selectionType,
      selections,
      totalAdjustment: selections.reduce((total, choice) => total + choice.totalAdjustment, 0)
    }];
  });

  const optionsSummary = optionGroupsSnapshot.flatMap((group) => group.selections.map((choice) => {
    const quantitySuffix = group.selectionType === 'quantity' ? ` x${choice.quantity}` : '';
    const adjustmentSuffix = choice.totalAdjustment === 0
      ? ''
      : ` (${choice.totalAdjustment > 0 ? '+' : ''}${formatAmount(choice.totalAdjustment)})`;
    return `${group.groupName}: ${choice.optionName}${quantitySuffix}${adjustmentSuffix}`;
  }));

  return {
    optionGroupsSnapshot,
    optionsSummary,
    unitOptionsAdjustment: optionGroupsSnapshot.reduce((total, group) => total + group.totalAdjustment, 0)
  };
};

const normalizeCartItem = (item: Partial<CartItem>): CartItem | null => {
  if (!item || !normalizeString(item.productId) || !normalizeString(item.name)) return null;

  const unitFinalPrice = toNumber(item.unitFinalPrice ?? item.price, 0);
  const unitOptionsAdjustment = toNumber(item.unitOptionsAdjustment, 0);
  const selectedOptionsLabel = Array.isArray(item.selectedOptionsLabel)
    ? item.selectedOptionsLabel.filter((entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()))
    : [];
  const optionsSummary = Array.isArray(item.optionsSummary)
    ? item.optionsSummary.filter((entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()))
    : selectedOptionsLabel;

  return {
    id: normalizeString(item.id, buildCartItemId(normalizeString(item.productId), item.selectedOptions || {}, item.notes || null)),
    productId: normalizeString(item.productId),
    name: normalizeString(item.name),
    imageUrl: normalizeString(item.imageUrl, ''),
    price: unitFinalPrice,
    quantity: Math.max(1, toNumber(item.quantity, 1)),
    selectedOptions: item.selectedOptions && typeof item.selectedOptions === 'object' ? item.selectedOptions : {},
    selectedOptionsLabel,
    optionGroupsSnapshot: Array.isArray(item.optionGroupsSnapshot) ? item.optionGroupsSnapshot : [],
    unitBasePrice: toNumber(item.unitBasePrice, unitFinalPrice - unitOptionsAdjustment),
    unitOptionsAdjustment,
    unitFinalPrice,
    optionsSummary,
    notes: normalizeString(item.notes, '') || null
  };
};

const getResponseMessage = (response: PublicWhatsAppOrderQuoteResponse | null) => {
  if (!response) return null;

  if (response.message && !/failed to fetch/i.test(response.message)) return response.message;

  if (response.message) return 'No pudimos conectarnos. Verifica tu conexión e inténtalo nuevamente.';

  const fallbackByCode: Record<PublicWhatsAppOrderCode, string> = {
    OK: 'Pedido recibido. Te enviaremos la cotización a tu WhatsApp.',
    PARTIAL_SUCCESS: 'Pedido recibido. Si no recibes la cotización por WhatsApp, el negocio dará seguimiento a tu solicitud.',
    PLAN_NOT_ALLOWED: 'Disponible en planes superiores.',
    SYSTEM_NOT_READY: 'El sistema de pedidos por WhatsApp aún no está configurado para este negocio.',
    CHANNEL_NOT_AVAILABLE: 'No fue posible enviar la cotización por WhatsApp en este momento.',
    INVALID_CUSTOMER_PHONE: 'El número de WhatsApp no es válido. Revisa el código de país y el número.',
    INVALID_CUSTOMER_WHATSAPP: 'Debes ingresar un número de WhatsApp válido.',
    EMPTY_CART: 'El carrito está vacío.',
    INVALID_PRODUCT: 'El pedido contiene productos o cantidades inválidas.',
    PRODUCT_UNAVAILABLE: 'Uno o más productos ya no están disponibles para cotizar.',
    INVALID_SITE: 'No pudimos identificar el sitio publicado.',
    PAGE_NOT_FOUND: 'La página indicada no pertenece a este sitio.',
    MODULE_NOT_FOUND: 'El módulo indicado no pertenece a este sitio.',
    QUOTE_CREATION_FAILED: 'No pudimos procesar el pedido en este momento.'
  };

  return response.code ? fallbackByCode[response.code] || 'No pudimos procesar el pedido en este momento.' : 'No pudimos procesar el pedido en este momento.';
};

export const WhatsAppOrdersModule: React.FC<{
  moduleId: string;
  settingsValues: Record<string, any>;
  products?: Product[];
  renderMode?: ModuleRenderMode;
  publishedSiteId?: string | null;
  pageId?: string | null;
  projectId?: string | null;
  regionalSettings?: Partial<ProjectCurrencySettings> | Record<string, unknown> | null;
  activeViewport?: 'desktop' | 'tablet' | 'mobile';
  availability?: WhatsAppOrdersAvailability | null;
  initialProduct?: Product | null;
}> = ({
  moduleId,
  settingsValues,
  products = [],
  renderMode = 'preview',
  publishedSiteId = null,
  pageId = null,
  projectId = null,
  regionalSettings = null,
  activeViewport,
  availability = null,
  initialProduct = null
}) => {
  const projectCurrencySettings = React.useMemo(
    () => resolveProjectCurrencySettings(regionalSettings),
    [regionalSettings]
  );
  const formatPrice = React.useCallback(
    (amount: unknown) => formatProjectCurrency(amount, projectCurrencySettings),
    [projectCurrencySettings]
  );
  const initialPhoneCountry = React.useMemo(
    () => resolveInitialPhoneCountry(regionalSettings as Record<string, unknown> | null),
    [regionalSettings]
  );
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
  const neutralConfirmationDescription = 'Completa tus datos para confirmar y recibir la información del pedido.';
  const configuredConfirmationDescription = getVal(null, 'confirmationDescription', neutralConfirmationDescription);
  const confirmationDescription = configuredConfirmationDescription === 'Déjanos tu WhatsApp y te enviaremos la cotización.'
    ? neutralConfirmationDescription
    : configuredConfirmationDescription;
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
  const [isResolvingProductDetail, setIsResolvingProductDetail] = React.useState(false);
  const [productDetailNotice, setProductDetailNotice] = React.useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = React.useState(1);
  const [selectedOptions, setSelectedOptions] = React.useState<SelectedOptions>({});
  const [touchedOptionGroups, setTouchedOptionGroups] = React.useState<Set<string>>(() => new Set());
  const [hasAttemptedAdd, setHasAttemptedAdd] = React.useState(false);
  const [selectedNotes, setSelectedNotes] = React.useState('');
  const [cartOpen, setCartOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [checkoutForm, setCheckoutForm] = React.useState<CheckoutFormState>(() => createEmptyCheckoutForm(initialPhoneCountry));
  const [countryPickerOpen, setCountryPickerOpen] = React.useState(false);
  const [countrySearch, setCountrySearch] = React.useState('');
  const [checkoutPhoneError, setCheckoutPhoneError] = React.useState<string | null>(null);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [submitState, setSubmitState] = React.useState<'idle' | 'loading' | 'verifying' | 'done'>('idle');
  const [submitResponse, setSubmitResponse] = React.useState<PublicWhatsAppOrderQuoteResponse | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const submitAttemptKeyRef = React.useRef<string | null>(null);
  const checkoutFormEditedRef = React.useRef(false);
  const [hydratedStorageKey, setHydratedStorageKey] = React.useState<string | null>(null);
  const openedInitialProductRef = React.useRef<string | null>(null);
  const publicProductCacheRef = React.useRef(new Map<string, Promise<Product | null>>());
  const optionGroupRefs = React.useRef(new Map<string, HTMLFieldSetElement>());
  const catalogContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [catalogWidth, setCatalogWidth] = React.useState(0);
  const planBlocked = Boolean(availability?.known && !availability.allowed);
  const previewOrdersBlocked = renderMode === 'preview' && mode === 'orders' && planBlocked;
  const ordersInteractionEnabled = mode === 'orders' && !previewOrdersBlocked;
  const selectedPhoneCountry = React.useMemo(
    () => findPhoneCountry(checkoutForm.phoneCountryCode) || initialPhoneCountry,
    [checkoutForm.phoneCountryCode, initialPhoneCountry]
  );
  const visiblePhoneCountries = React.useMemo(() => {
    const query = countrySearch.trim().toLocaleLowerCase();
    if (!query) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter((country) => (
      country.countryName.toLocaleLowerCase().includes(query)
      || country.countryCode.toLocaleLowerCase().includes(query)
      || country.callingCode.includes(query.replace(/\s/g, ''))
    ));
  }, [countrySearch]);

  const currentOptionGroups = React.useMemo(
    () => (selectedProduct ? extractOptionGroups(selectedProduct) : []),
    [selectedProduct]
  );
  const optionSelectionErrors = React.useMemo(
    () => getOptionSelectionValidation(currentOptionGroups, selectedOptions),
    [currentOptionGroups, selectedOptions]
  );
  const selectedOptionPriceAdjustment = React.useMemo(
    () => getOptionPriceAdjustment(currentOptionGroups, selectedOptions),
    [currentOptionGroups, selectedOptions]
  );
  const selectedProductPrice = (Number(selectedProduct?.price) || 0) + selectedOptionPriceAdjustment;

  const storageScopeId = React.useMemo(() => {
    const runtimeSiteId = publishedSiteId || (window as any).SITE_ID || (window as any).currentSite?.site_id || 'preview';
    const runtimePageId = pageId || 'page';
    return [runtimeSiteId, runtimePageId, moduleId, projectId || 'project'].join(':');
  }, [moduleId, pageId, projectId, publishedSiteId]);

  const storageKey = React.useMemo(
    () => `solutium_whatsapp_orders_cart:${storageScopeId}`,
    [storageScopeId]
  );
  const customerProfileStorageKey = React.useMemo(
    () => buildCustomerProfileStorageKey(storageScopeId),
    [storageScopeId]
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      const rawProfile = window.localStorage.getItem(customerProfileStorageKey);
      const parsed = raw ? JSON.parse(raw) : null;
      const persistedProfile = rawProfile ? JSON.parse(rawProfile) : null;
      if (Array.isArray(parsed?.items)) {
        setCartItems(parsed.items.map(normalizeCartItem).filter((item): item is CartItem => Boolean(item)));
      }
      if (!checkoutFormEditedRef.current) {
        const snapshotProfile = parsed?.customer && typeof parsed.customer === 'object'
          ? normalizePublicWhatsAppOrderCustomerProfile(parsed.customer, initialPhoneCountry)
          : null;
        const profile = persistedProfile && typeof persistedProfile === 'object'
          ? normalizePublicWhatsAppOrderCustomerProfile(persistedProfile, initialPhoneCountry)
          : null;
        const resolvedProfile = mergePublicWhatsAppOrderCustomerProfiles(profile, snapshotProfile, initialPhoneCountry);
        setCheckoutForm({
          ...resolvedProfile,
          orderNotes: normalizeString(parsed?.customer?.orderNotes, '').slice(0, 1000)
        });
      }
    } catch {
      // noop
    } finally {
      setHydratedStorageKey(storageKey);
    }
  }, [customerProfileStorageKey, initialPhoneCountry, storageKey]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || hydratedStorageKey !== storageKey) return;
    try {
      if (cartItems.length === 0 && !checkoutForm.orderNotes) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      window.localStorage.setItem(storageKey, JSON.stringify({
        items: cartItems,
        customer: {
          ...checkoutForm,
          // Preserved only for legacy carts and the original API contract.
          whatsapp: buildInternationalPhone(checkoutForm)
        }
      }));
    } catch {
      // noop
    }
  }, [cartItems, checkoutForm, hydratedStorageKey, storageKey]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || hydratedStorageKey !== storageKey) return;
    try {
      window.localStorage.setItem(customerProfileStorageKey, JSON.stringify({
        name: checkoutForm.name.trim(),
        email: checkoutForm.email.trim(),
        phoneCountryCode: checkoutForm.phoneCountryCode,
        phoneCallingCode: checkoutForm.phoneCallingCode,
        phoneNationalNumber: normalizeNationalPhoneNumber(checkoutForm.phoneNationalNumber),
        whatsapp: buildInternationalPhone(checkoutForm) || undefined
      }));
    } catch {
      // noop
    }
  }, [checkoutForm, customerProfileStorageKey, hydratedStorageKey, storageKey]);

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
    () => cartItems.reduce((total, item) => total + item.unitFinalPrice * item.quantity, 0),
    [cartItems]
  );

  const resetOptionValidation = React.useCallback(() => {
    setTouchedOptionGroups(new Set());
    setHasAttemptedAdd(false);
  }, []);

  const closeProductDetail = React.useCallback(() => {
    setSelectedProduct(null);
    resetOptionValidation();
  }, [resetOptionValidation]);

  const showProductDetail = React.useCallback((product: Product) => {
    const normalizedProduct = normalizeProduct(product, 0);
    setSelectedProduct(normalizedProduct);
    setSelectedQuantity(1);
    setSelectedNotes('');
    resetOptionValidation();

    const groups = extractOptionGroups(normalizedProduct);
    setSelectedOptions(getDefaultSelectedOptions(groups));
  }, [resetOptionValidation]);

  const markOptionGroupTouched = React.useCallback((groupId: string) => {
    setTouchedOptionGroups((current) => {
      if (current.has(groupId)) return current;
      const next = new Set(current);
      next.add(groupId);
      return next;
    });
  }, []);

  const openProductDetail = React.useCallback(async (product: Product) => {
    const normalizedProduct = normalizeProduct(product, 0);
    const shouldResolvePublishedProduct =
      renderMode === 'published'
      && Boolean(normalizedProduct.id)
      && !hasProductOptionGroupsSnapshot(normalizedProduct);

    if (!shouldResolvePublishedProduct) {
      setProductDetailNotice(null);
      showProductDetail(normalizedProduct);
      return;
    }

    const categorySlug = normalizePublicCatalogSlug(normalizedProduct.category);
    const itemSlug = normalizePublicCatalogSlug(normalizedProduct.name);
    if (!categorySlug || !itemSlug) {
      setProductDetailNotice('No pudimos cargar las opciones de este producto. Puedes continuar con la información disponible.');
      showProductDetail(normalizedProduct);
      return;
    }

    const cacheKey = `${categorySlug}/${itemSlug}`;
    let request = publicProductCacheRef.current.get(cacheKey);
    if (!request) {
      request = fetchHostedPublicCatalogItem({ categorySlug, itemSlug });
      publicProductCacheRef.current.set(cacheKey, request);
    }

    setIsResolvingProductDetail(true);
    setProductDetailNotice(null);

    try {
      const resolvedProduct = await request;
      if (resolvedProduct) {
        showProductDetail(resolvedProduct);
      } else {
        publicProductCacheRef.current.delete(cacheKey);
        setProductDetailNotice('No pudimos cargar las opciones de este producto. Puedes continuar con la información disponible.');
        showProductDetail(normalizedProduct);
      }
    } catch {
      publicProductCacheRef.current.delete(cacheKey);
      setProductDetailNotice('No pudimos cargar las opciones de este producto. Puedes continuar con la información disponible.');
      showProductDetail(normalizedProduct);
    } finally {
      setIsResolvingProductDetail(false);
    }
  }, [renderMode, showProductDetail]);

  React.useEffect(() => {
    if (!initialProduct || renderMode !== 'published') return;

    const normalized = normalizeProduct(initialProduct, 0);
    const routeProductKey = `${normalized.id}:${normalized.updatedAt || ''}`;
    if (openedInitialProductRef.current === routeProductKey) return;

    openedInitialProductRef.current = routeProductKey;
    void openProductDetail(normalized);
  }, [initialProduct, openProductDetail, renderMode]);

  const addCurrentProductToCart = React.useCallback(() => {
    if (!selectedProduct) return;
    if (Object.keys(optionSelectionErrors).length > 0) {
      setHasAttemptedAdd(true);
      const firstInvalidGroupId = Object.keys(optionSelectionErrors)[0];
      const firstInvalidGroup = optionGroupRefs.current.get(firstInvalidGroupId);
      if (firstInvalidGroup) {
        firstInvalidGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidGroup.focus({ preventScroll: true });
      }
      return;
    }
    const unitBasePrice = toNumber(selectedProduct.price, 0);
    const optionSnapshot = buildOptionSelectionSnapshot(currentOptionGroups, selectedOptions, formatPrice);
    const unitFinalPrice = unitBasePrice + optionSnapshot.unitOptionsAdjustment;

    const nextItem: CartItem = {
      id: buildCartItemId(selectedProduct.id, selectedOptions, customerNotesEnabled ? selectedNotes || null : null),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      imageUrl: selectedProduct.imageUrl,
      price: unitFinalPrice,
      quantity: selectedQuantity,
      selectedOptions,
      selectedOptionsLabel: optionSnapshot.optionsSummary,
      optionGroupsSnapshot: optionSnapshot.optionGroupsSnapshot,
      unitBasePrice,
      unitOptionsAdjustment: optionSnapshot.unitOptionsAdjustment,
      unitFinalPrice,
      optionsSummary: optionSnapshot.optionsSummary,
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
    closeProductDetail();
    setCartOpen(true);
    submitAttemptKeyRef.current = null;
    setSubmitResponse(null);
    setSubmitError(null);
  }, [closeProductDetail, currentOptionGroups, customerNotesEnabled, formatPrice, optionSelectionErrors, selectedNotes, selectedOptions, selectedProduct, selectedProductPrice, selectedQuantity]);

  const updateCartQuantity = React.useCallback((cartItemId: string, quantity: number) => {
    submitAttemptKeyRef.current = null;
    if (quantity <= 0) {
      setCartItems((current) => current.filter((item) => item.id !== cartItemId));
      return;
    }
    setCartItems((current) => current.map((item) => item.id === cartItemId ? { ...item, quantity } : item));
  }, []);

  const removeCartItem = React.useCallback((cartItemId: string) => {
    submitAttemptKeyRef.current = null;
    setCartItems((current) => current.filter((item) => item.id !== cartItemId));
  }, []);

  const clearCheckoutState = React.useCallback(() => {
    setSubmitError(null);
    setSubmitResponse(null);
    setSubmitState('idle');
    setCheckoutPhoneError(null);
  }, []);

  const dismissOrderResult = React.useCallback(() => {
    clearCheckoutState();
    submitAttemptKeyRef.current = null;
    setCheckoutOpen(false);
    setCartOpen(false);
  }, [clearCheckoutState]);

  const handleSubmitOrder = React.useCallback(async () => {
    if (previewOrdersBlocked) {
      setSubmitError(availability?.message || 'Disponible en planes superiores.');
      return;
    }
    if (submitState === 'loading' || submitState === 'verifying') return;
    if (cartItems.length === 0) {
      setSubmitError('El carrito está vacío.');
      return;
    }
    const phoneError = getPhoneValidationError(checkoutForm);
    if (phoneError) {
      setCheckoutPhoneError(phoneError);
      setSubmitError(phoneError);
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
    setCheckoutPhoneError(null);
    setSubmitResponse(null);

    try {
      const payload = {
        publishedSiteId,
        pageId,
        moduleId,
        notes: checkoutForm.orderNotes.trim() || null,
        customer: {
          name: checkoutForm.name.trim() || null,
          whatsapp: buildInternationalPhone(checkoutForm),
          email: customerEmailEnabled ? (checkoutForm.email.trim() || null) : null,
          phoneCountryCode: checkoutForm.phoneCountryCode,
          phoneCallingCode: checkoutForm.phoneCallingCode,
          phoneNationalNumber: normalizeNationalPhoneNumber(checkoutForm.phoneNationalNumber)
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          optionGroupsSnapshot: item.optionGroupsSnapshot,
          unitBasePrice: item.unitBasePrice,
          unitOptionsAdjustment: item.unitOptionsAdjustment,
          unitFinalPrice: item.unitFinalPrice,
          subtotal: item.unitFinalPrice * item.quantity,
          optionsSummary: item.optionsSummary,
          notes: item.notes
        })),
        idempotencyKey
      };
      const recovery = await submitWithSingleNetworkRetry(
        () => createPublicWhatsAppOrderQuote(payload),
        () => setSubmitState('verifying')
      );

      if (recovery.kind === 'ambiguous_network_failure') {
        setSubmitState('done');
        setSubmitError('No pudimos confirmar la respuesta del servidor. El pedido podría haberse registrado. No vuelvas a enviarlo inmediatamente.');
        return;
      }

      const response = recovery.response;

      setSubmitResponse(response);
      setSubmitState('done');

      if (normalizeWebOrderResponse(response)?.quoteId) {
        setCartItems([]);
        setCheckoutForm((current) => ({ ...current, orderNotes: '' }));
        submitAttemptKeyRef.current = null;
        setCartOpen(true);
        setCheckoutOpen(false);
      } else {
        setSubmitError(getResponseMessage(response));
      }
    } catch {
      setSubmitState('done');
      setSubmitError('No pudimos conectarnos. Verifica tu conexión e inténtalo nuevamente.');
    }
  }, [
    cartItems,
    checkoutForm.email,
    checkoutForm.name,
    checkoutForm.orderNotes,
    checkoutForm.phoneCallingCode,
    checkoutForm.phoneCountryCode,
    checkoutForm.phoneNationalNumber,
    customerEmailEnabled,
    customerNameRequired,
    moduleId,
    initialPhoneCountry,
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

  const normalizedOrderResult = React.useMemo(() => normalizeWebOrderResponse(submitResponse), [submitResponse]);
  const orderResultKind = classifyWebOrderResult(normalizedOrderResult);
  const hasCompletedOrder = Boolean(normalizedOrderResult?.quoteId);
  const formatOrderResultTotal = React.useCallback((amount: number, currency: string | null) => {
    if (!currency) return formatPrice(amount);
    try {
      return new Intl.NumberFormat(projectCurrencySettings.locale, {
        style: 'currency',
        currency
      }).format(amount);
    } catch {
      return formatPrice(amount);
    }
  }, [formatPrice, projectCurrencySettings.locale]);

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
                    onClick={() => void openProductDetail(product)}
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
                            {formatPrice(product.price)}
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

      {isResolvingProductDetail ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/30 p-4" role="status" aria-live="polite">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg">
            <Loader2 size={16} className="animate-spin" />
            Cargando opciones del producto...
          </div>
        </div>
      ) : null}

      {selectedProduct && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[28px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-5 py-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">{selectedProduct.name}</h3>
                {showPrices && selectedProduct.price !== undefined ? (
                  <p className="text-sm font-bold text-[var(--primary-color,#16a34a)]">{formatPrice(selectedProduct.price)}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeProductDetail}
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
                {productDetailNotice ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800">
                    {productDetailNotice}
                  </p>
                ) : null}
                {selectedProduct.description ? (
                  <p className="text-sm leading-6 text-slate-600">{selectedProduct.description}</p>
                ) : null}

                {currentOptionGroups.map((group) => {
                  const selectedValues = getSelectedChoiceValues(selectedOptions[group.id]);
                  const selectedQuantityValues = selectedOptions[group.id];
                  const error = optionSelectionErrors[group.id];
                  const shouldShowError = Boolean(error) && (hasAttemptedAdd || touchedOptionGroups.has(group.id));
                  const errorId = `${moduleId}-${group.id}-error`;

                  return (
                    <fieldset
                      key={group.id}
                      ref={(node) => {
                        if (node) optionGroupRefs.current.set(group.id, node);
                        else optionGroupRefs.current.delete(group.id);
                      }}
                      tabIndex={-1}
                      aria-invalid={shouldShowError || undefined}
                      aria-describedby={shouldShowError ? errorId : undefined}
                      className={`space-y-2 rounded-2xl border p-3 ${shouldShowError ? 'border-rose-200 bg-rose-50/40' : 'border-black/5 bg-slate-50'}`}
                    >
                      <legend className={`px-1 text-xs font-bold uppercase tracking-wide ${shouldShowError ? 'text-rose-700' : 'text-slate-600'}`}>
                        {group.label}{group.isRequired ? ' *' : ''}
                      </legend>
                      {group.description ? <p className="text-xs leading-5 text-slate-500">{group.description}</p> : null}

                      {group.selectionType === 'single' ? (
                        <div className="space-y-2">
                          {group.choices.map((choice) => (
                            <label key={choice.value} className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                              <input
                                type="radio"
                                name={`${moduleId}-${group.id}`}
                                checked={selectedOptions[group.id] === choice.value}
                                aria-invalid={shouldShowError || undefined}
                                aria-describedby={shouldShowError ? errorId : undefined}
                                onChange={() => {
                                  markOptionGroupTouched(group.id);
                                  setSelectedOptions((current) => ({ ...current, [group.id]: choice.value }));
                                }}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block font-semibold text-slate-900">{choice.label}</span>
                                {choice.description ? <span className="block text-xs text-slate-500">{choice.description}</span> : null}
                              </span>
                              {choice.priceAdjustment !== 0 ? <span className="text-xs font-bold text-slate-600">{choice.priceAdjustment > 0 ? '+' : ''}{formatPrice(choice.priceAdjustment)}</span> : null}
                            </label>
                          ))}
                        </div>
                      ) : group.selectionType === 'multiple' ? (
                        <div className="space-y-2">
                          {group.choices.map((choice) => {
                            const checked = selectedValues.includes(choice.value);
                            return (
                              <label key={choice.value} className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  aria-invalid={shouldShowError || undefined}
                                  aria-describedby={shouldShowError ? errorId : undefined}
                                  onChange={() => {
                                    markOptionGroupTouched(group.id);
                                    setSelectedOptions((current) => {
                                      const values = getSelectedChoiceValues(current[group.id]);
                                      return {
                                        ...current,
                                        [group.id]: checked ? values.filter((value) => value !== choice.value) : [...values, choice.value]
                                      };
                                    });
                                  }}
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block font-semibold text-slate-900">{choice.label}</span>
                                  {choice.description ? <span className="block text-xs text-slate-500">{choice.description}</span> : null}
                                </span>
                                {choice.priceAdjustment !== 0 ? <span className="text-xs font-bold text-slate-600">{choice.priceAdjustment > 0 ? '+' : ''}{formatPrice(choice.priceAdjustment)}</span> : null}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {group.choices.map((choice) => {
                            const quantity = Math.max(0, Number(getQuantitySelection(selectedQuantityValues)[choice.value]) || 0);
                            return (
                              <div key={choice.value} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                                <span className="min-w-0 flex-1">
                                  <span className="block font-semibold text-slate-900">{choice.label}</span>
                                  {choice.description ? <span className="block text-xs text-slate-500">{choice.description}</span> : null}
                                </span>
                                {choice.priceAdjustment !== 0 ? <span className="text-xs font-bold text-slate-600">{choice.priceAdjustment > 0 ? '+' : ''}{formatPrice(choice.priceAdjustment)}</span> : null}
                                <div className="inline-flex items-center rounded-full border border-black/10 bg-slate-50 p-1">
                                  <button type="button" aria-invalid={shouldShowError || undefined} aria-describedby={shouldShowError ? errorId : undefined} onClick={() => {
                                    markOptionGroupTouched(group.id);
                                    setSelectedOptions((current) => {
                                      const quantities = { ...getQuantitySelection(current[group.id]) };
                                      quantities[choice.value] = Math.max(0, (Number(quantities[choice.value]) || 0) - 1);
                                      return { ...current, [group.id]: quantities };
                                    });
                                  }} className="rounded-full p-1 text-slate-600 hover:bg-white"><Minus size={14} /></button>
                                  <span className="min-w-7 text-center text-xs font-bold">{quantity}</span>
                                  <button type="button" aria-invalid={shouldShowError || undefined} aria-describedby={shouldShowError ? errorId : undefined} onClick={() => {
                                    markOptionGroupTouched(group.id);
                                    setSelectedOptions((current) => {
                                      const quantities = { ...getQuantitySelection(current[group.id]) };
                                      quantities[choice.value] = (Number(quantities[choice.value]) || 0) + 1;
                                      return { ...current, [group.id]: quantities };
                                    });
                                  }} className="rounded-full p-1 text-slate-600 hover:bg-white"><Plus size={14} /></button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {shouldShowError ? <p id={errorId} className="text-xs font-semibold text-rose-600" aria-live="polite">{error}</p> : null}
                    </fieldset>
                  );
                })}

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
                    {showPrices && selectedProduct ? (
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-semibold text-slate-500">Precio del item</span>
                        <span className="font-black text-slate-950">{formatPrice(selectedProductPrice)}</span>
                      </div>
                    ) : null}
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
                      className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary-color,#16a34a)] px-4 py-3 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                              {showPrices ? (
                                <p className="text-sm font-bold text-[var(--primary-color,#16a34a)]">{formatPrice(item.unitFinalPrice)}</p>
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

                          {item.optionsSummary.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.optionsSummary.map((entry) => (
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

              {hasCompletedOrder && normalizedOrderResult ? (
                <div
                  className={`mt-4 rounded-3xl border px-4 py-4 text-sm ${
                    orderResultKind === 'partial'
                      ? 'border-amber-200 bg-amber-50 text-amber-900'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <p className="font-black">
                          {orderResultKind === 'replay'
                            ? 'Tu pedido ya había sido confirmado.'
                            : orderResultKind === 'partial'
                              ? 'Tu pedido fue registrado.'
                              : '¡Pedido confirmado!'}
                        </p>
                        <p className="mt-1 leading-5">
                          {orderResultKind === 'partial'
                            ? 'La cotización se creó. El negocio dará seguimiento a cualquier entrega pendiente.'
                            : 'Recibirás la cotización por WhatsApp.'}
                        </p>
                      </div>
                      <dl className="grid gap-1 text-xs sm:grid-cols-2">
                        {normalizedOrderResult.quoteNumber ? <div><dt className="font-semibold">Cotización</dt><dd>{normalizedOrderResult.quoteNumber}</dd></div> : null}
                        {normalizedOrderResult.maskedPhone ? <div><dt className="font-semibold">WhatsApp</dt><dd>{normalizedOrderResult.maskedPhone}</dd></div> : null}
                        {normalizedOrderResult.total !== null ? <div><dt className="font-semibold">Total</dt><dd>{formatOrderResultTotal(normalizedOrderResult.total, normalizedOrderResult.currency)}</dd></div> : null}
                        {normalizedOrderResult.customerDelivery.status !== 'unknown' ? <div><dt className="font-semibold">Entrega</dt><dd>{normalizedOrderResult.customerDelivery.status}</dd></div> : null}
                      </dl>
                      <div className="flex flex-wrap gap-3">
                        {normalizedOrderResult.publicQuoteUrl ? (
                          <a href={normalizedOrderResult.publicQuoteUrl} target="_blank" rel="noreferrer" className="font-bold underline">
                            Ver cotización
                          </a>
                        ) : null}
                        <button type="button" onClick={dismissOrderResult} className="font-bold underline">
                          Seguir comprando
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {submitError && !hasCompletedOrder && (
                <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </div>
              )}

              {submitState === 'verifying' ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800" role="status">
                  <Loader2 size={16} className="animate-spin" />
                  Estamos verificando tu pedido...
                </div>
              ) : null}

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
                      onChange={(event) => {
                        checkoutFormEditedRef.current = true;
                        submitAttemptKeyRef.current = null;
                        setCheckoutForm((current) => ({ ...current, name: event.target.value }));
                      }}
                      className="w-full rounded-2xl border border-black/10 px-3 py-3 text-sm outline-none focus:border-[var(--primary-color,#16a34a)]"
                      placeholder="Tu nombre"
                    />
                  </label>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">WhatsApp *</span>
                    <div className="flex gap-2">
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          aria-haspopup="listbox"
                          aria-expanded={countryPickerOpen}
                          aria-label={`Código de país: ${selectedPhoneCountry.countryName} ${selectedPhoneCountry.callingCode}`}
                          onClick={() => {
                            setCountryPickerOpen((open) => !open);
                            setCountrySearch('');
                          }}
                          className="inline-flex h-full min-h-[48px] items-center gap-1 rounded-2xl border border-black/10 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition hover:bg-slate-50 focus:border-[var(--primary-color,#16a34a)]"
                        >
                          <span aria-hidden="true">{getPhoneCountryFlag(selectedPhoneCountry.countryCode)}</span>
                          <span>{selectedPhoneCountry.callingCode}</span>
                          <ChevronDown size={14} aria-hidden="true" />
                        </button>
                        {countryPickerOpen ? (
                          <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-72 rounded-2xl border border-black/10 bg-white p-2 shadow-xl">
                            <input
                              autoFocus
                              value={countrySearch}
                              onChange={(event) => setCountrySearch(event.target.value)}
                              placeholder="Buscar país o código"
                              aria-label="Buscar país o código"
                              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--primary-color,#16a34a)]"
                            />
                            <div role="listbox" aria-label="Países disponibles" className="mt-2 max-h-56 overflow-y-auto">
                              {visiblePhoneCountries.map((country) => (
                                <button
                                  key={country.countryCode}
                                  type="button"
                                  role="option"
                                  aria-selected={country.countryCode === selectedPhoneCountry.countryCode}
                                  onClick={() => {
                                    checkoutFormEditedRef.current = true;
                                    submitAttemptKeyRef.current = null;
                                    setCheckoutForm((current) => ({
                                      ...current,
                                      phoneCountryCode: country.countryCode,
                                      phoneCallingCode: country.callingCode
                                    }));
                                    setCheckoutPhoneError(null);
                                    setCountryPickerOpen(false);
                                    setCountrySearch('');
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                >
                                  <span aria-hidden="true">{getPhoneCountryFlag(country.countryCode)}</span>
                                  <span className="min-w-0 flex-1 truncate">{country.countryName}</span>
                                  <span className="font-semibold text-slate-500">{country.callingCode}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          value={checkoutForm.phoneNationalNumber}
                          onChange={(event) => {
                            const rawValue = event.target.value;
                            const countryPrefix = selectedPhoneCountry.callingCode.replace(/\D/g, '');
                            const enteredDigits = normalizeNationalPhoneNumber(rawValue);
                            const phoneNationalNumber = rawValue.trim().startsWith('+') && enteredDigits.startsWith(countryPrefix)
                              ? enteredDigits.slice(countryPrefix.length)
                              : enteredDigits;
                            checkoutFormEditedRef.current = true;
                            submitAttemptKeyRef.current = null;
                            setCheckoutForm((current) => ({ ...current, phoneNationalNumber }));
                            setCheckoutPhoneError(null);
                          }}
                          aria-invalid={checkoutPhoneError ? true : undefined}
                          aria-describedby={checkoutPhoneError ? 'whatsapp-phone-error' : undefined}
                          className={`w-full rounded-2xl border px-3 py-3 text-sm outline-none focus:border-[var(--primary-color,#16a34a)] ${
                            checkoutPhoneError ? 'border-rose-400' : 'border-black/10'
                          }`}
                          placeholder="8888 8888"
                        />
                      </div>
                    </div>
                    {checkoutPhoneError ? (
                      <p id="whatsapp-phone-error" className="text-xs font-semibold text-rose-600" role="alert">
                        {checkoutPhoneError}
                      </p>
                    ) : null}
                  </div>

                  {customerEmailEnabled && (
                    <label className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Correo electrónico</span>
                      <input
                      value={checkoutForm.email}
                      onChange={(event) => {
                        checkoutFormEditedRef.current = true;
                        submitAttemptKeyRef.current = null;
                        setCheckoutForm((current) => ({ ...current, email: event.target.value }));
                      }}
                        className="w-full rounded-2xl border border-black/10 px-3 py-3 text-sm outline-none focus:border-[var(--primary-color,#16a34a)]"
                        placeholder="tu@correo.com"
                      />
                    </label>
                  )}

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Notas para el pedido (opcional)</span>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={checkoutForm.orderNotes}
                      onChange={(event) => {
                        checkoutFormEditedRef.current = true;
                        submitAttemptKeyRef.current = null;
                        setCheckoutForm((current) => ({ ...current, orderNotes: event.target.value.slice(0, 1000) }));
                      }}
                      className="w-full resize-y rounded-2xl border border-black/10 px-3 py-3 text-sm outline-none focus:border-[var(--primary-color,#16a34a)]"
                      placeholder="Ejemplo: Sin hielo, entregar después de las 5:00 p. m., llamar al llegar..."
                    />
                    <span className="block text-right text-xs text-slate-400">{checkoutForm.orderNotes.length}/1000</span>
                  </label>
                </div>
              )}
            </div>

            <div className="border-t border-black/5 px-5 py-4">
              {showPrices && (
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-500">Subtotal estimado</span>
                  <span className="text-base font-black text-slate-950">{formatPrice(subtotal)}</span>
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
                  disabled={cartItems.length === 0 || !checkoutOpen || submitState === 'loading' || submitState === 'verifying'}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary-color,#16a34a)] px-4 py-3 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitState === 'loading' || submitState === 'verifying' ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                  {submitState === 'verifying' ? 'Verificando pedido...' : submitState === 'loading' ? 'Enviando pedido...' : 'Confirmar pedido'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
