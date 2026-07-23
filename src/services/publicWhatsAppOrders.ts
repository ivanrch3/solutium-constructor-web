import { getAppMadreBaseUrl } from './secureLaunchSession';

export type PublicWhatsAppOrderCode =
  | 'OK'
  | 'PARTIAL_SUCCESS'
  | 'INVALID_SITE'
  | 'PAGE_NOT_FOUND'
  | 'MODULE_NOT_FOUND'
  | 'PLAN_NOT_ALLOWED'
  | 'SYSTEM_NOT_READY'
  | 'INVALID_CUSTOMER_PHONE'
  | 'INVALID_CUSTOMER_WHATSAPP'
  | 'EMPTY_CART'
  | 'INVALID_PRODUCT'
  | 'PRODUCT_UNAVAILABLE'
  | 'CHANNEL_NOT_AVAILABLE'
  | 'QUOTE_CREATION_FAILED';

export type PublicWhatsAppOrderMessageStatus = 'sent' | 'skipped' | 'failed';

export interface PublicWhatsAppOrderQuotePayload {
  publishedSiteId: string;
  pageId?: string | null;
  moduleId?: string | null;
  notes?: string | null;
  customer: {
    name?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    phoneCountryCode?: string | null;
    phoneCallingCode?: string | null;
    phoneNationalNumber?: string | null;
  };
  items: Array<{
    productId: string;
    name?: string;
    quantity: number;
    selectedOptions?: Record<string, any>;
    optionGroupsSnapshot?: Array<{
      groupId: string;
      groupName: string;
      selectionType: 'single' | 'multiple' | 'quantity';
      selections: Array<{
        optionId: string;
        optionName: string;
        quantity: number;
        priceAdjustment: number;
        totalAdjustment: number;
      }>;
      totalAdjustment: number;
    }>;
    unitBasePrice?: number;
    unitOptionsAdjustment?: number;
    unitFinalPrice?: number;
    subtotal?: number;
    optionsSummary?: string[];
    notes?: string | null;
  }>;
  idempotencyKey?: string | null;
}

export interface PublicWhatsAppOrderQuoteResponse {
  ok: boolean;
  success?: boolean;
  code?: PublicWhatsAppOrderCode;
  message?: string;
  quoteId: string | null;
  quoteStatus: string | null;
  quoteNumber: string | null;
  publicQuoteUrl: string | null;
  customerMessageStatus: PublicWhatsAppOrderMessageStatus;
  internalAlertStatus: PublicWhatsAppOrderMessageStatus;
  customerMessageReason: string | null;
  internalAlertReason: string | null;
  idempotentReplay: boolean;
  warnings: string[];
  quote?: {
    id?: string | null;
    quoteNumber?: string | null;
    status?: string | null;
    publicUrl?: string | null;
    total?: number | null;
    currency?: string | null;
  } | null;
  customer?: {
    name?: string | null;
    phone?: string | null;
    maskedPhone?: string | null;
  } | null;
  delivery?: {
    customer?: {
      mode?: string | null;
      status?: PublicWhatsAppOrderMessageStatus | 'pending' | null;
      error?: string | null;
    } | null;
    owner?: {
      mode?: string | null;
      status?: PublicWhatsAppOrderMessageStatus | 'pending' | null;
      error?: string | null;
    } | null;
  } | null;
  idempotency?: {
    reused?: boolean;
  } | null;
}

const normalizeBaseUrl = (value: string) => String(value || '').trim().replace(/\/+$/, '');

export const createPublicWhatsAppOrderQuote = async (
  payload: PublicWhatsAppOrderQuotePayload
): Promise<PublicWhatsAppOrderQuoteResponse> => {
  const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_APP_MADRE_API_URL || getAppMadreBaseUrl());
  const response = await fetch(`${apiBaseUrl}/api/public/whatsapp-orders/quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => null);

  if (result && typeof result === 'object' && (
    typeof (result as any).code === 'string'
    || typeof (result as any).success === 'boolean'
    || typeof (result as any).ok === 'boolean'
    || typeof (result as any).quote === 'object'
  )) {
    return result as PublicWhatsAppOrderQuoteResponse;
  }

  return {
    ok: false,
    code: 'QUOTE_CREATION_FAILED',
    message: response.ok
      ? 'No pudimos procesar el pedido en este momento.'
      : `No pudimos procesar el pedido (HTTP ${response.status}).`,
    quoteId: null,
    quoteStatus: null,
    quoteNumber: null,
    publicQuoteUrl: null,
    customerMessageStatus: 'skipped',
    internalAlertStatus: 'skipped',
    customerMessageReason: null,
    internalAlertReason: null,
    idempotentReplay: false,
    warnings: []
  };
};
