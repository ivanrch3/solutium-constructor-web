import type { PublicWhatsAppOrderMessageStatus, PublicWhatsAppOrderQuoteResponse } from '../services/publicWhatsAppOrders';

export type DeliverySummary = {
  mode: string | null;
  status: PublicWhatsAppOrderMessageStatus | 'pending' | 'unknown';
  error: string | null;
};

export type NormalizedWebOrderResponse = {
  quoteId: string | null;
  quoteNumber: string | null;
  quoteStatus: string | null;
  publicQuoteUrl: string | null;
  total: number | null;
  currency: string | null;
  customerPhone: string | null;
  maskedPhone: string | null;
  idempotentReplay: boolean;
  customerDelivery: DeliverySummary;
  ownerDelivery: DeliverySummary;
};

export type WebOrderResultKind = 'success' | 'partial' | 'replay' | 'error';

const asString = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;
const asNumber = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : null;
const asStatus = (value: unknown): DeliverySummary['status'] =>
  value === 'sent' || value === 'skipped' || value === 'failed' || value === 'pending' ? value : 'unknown';

const normalizeDelivery = (delivery: any, fallbackStatus: unknown, fallbackError: unknown): DeliverySummary => ({
  mode: asString(delivery?.mode),
  status: asStatus(delivery?.status ?? fallbackStatus),
  error: asString(delivery?.error ?? fallbackError)
});

export const normalizeWebOrderResponse = (response: PublicWhatsAppOrderQuoteResponse | null): NormalizedWebOrderResponse | null => {
  if (!response) return null;
  const quote = response.quote || {};
  const customer = response.customer || {};
  const delivery = response.delivery || {};
  return {
    quoteId: asString(quote.id ?? response.quoteId),
    quoteNumber: asString(quote.quoteNumber ?? response.quoteNumber),
    quoteStatus: asString(quote.status ?? response.quoteStatus),
    publicQuoteUrl: asString(quote.publicUrl ?? response.publicQuoteUrl),
    total: asNumber(quote.total),
    currency: asString(quote.currency),
    customerPhone: asString(customer.phone),
    maskedPhone: asString(customer.maskedPhone),
    idempotentReplay: response.idempotency?.reused === true || response.idempotentReplay === true,
    customerDelivery: normalizeDelivery(delivery.customer, response.customerMessageStatus, response.customerMessageReason),
    ownerDelivery: normalizeDelivery(delivery.owner, response.internalAlertStatus, response.internalAlertReason)
  };
};

export const classifyWebOrderResult = (result: NormalizedWebOrderResponse | null): WebOrderResultKind => {
  if (!result?.quoteId) return 'error';
  if (result.idempotentReplay) return 'replay';
  if (result.customerDelivery.status === 'failed' || result.ownerDelivery.status === 'failed') return 'partial';
  return 'success';
};
