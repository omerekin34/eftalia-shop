export type StorePolicyClaims = {
  shippingDispatchWindow: string
  shippingFinalCalculation: string
  returnWindow: string
  returnCondition: string
  refundWindow: string
  supportEmail: string
}

export const DEFAULT_STORE_POLICY_CLAIMS: StorePolicyClaims = {
  shippingDispatchWindow: 'Siparişler 1-3 iş günü içinde kargoya verilir.',
  shippingFinalCalculation:
    'Kesin kargo ücreti, teslimat seçenekleri ve tahmini teslim tarihi Shopify ödeme adımında hesaplanır.',
  returnWindow: 'Teslimden itibaren 30 gün içinde iade talebi oluşturabilirsiniz.',
  returnCondition: 'Ürün kullanılmamış, etiketli ve orijinal ambalajında olmalıdır.',
  refundWindow: 'Onaylanan iadeler 10 iş günü içinde orijinal ödeme yöntemine iade edilir.',
  supportEmail: 'eftalia.case.destek@gmail.com',
}

export const STORE_POLICY_CLAIMS = DEFAULT_STORE_POLICY_CLAIMS

export function mergeStorePolicyClaims(
  partial?: Partial<StorePolicyClaims> | null
): StorePolicyClaims {
  return {
    shippingDispatchWindow:
      String(partial?.shippingDispatchWindow || '').trim() ||
      DEFAULT_STORE_POLICY_CLAIMS.shippingDispatchWindow,
    shippingFinalCalculation:
      String(partial?.shippingFinalCalculation || '').trim() ||
      DEFAULT_STORE_POLICY_CLAIMS.shippingFinalCalculation,
    returnWindow:
      String(partial?.returnWindow || '').trim() || DEFAULT_STORE_POLICY_CLAIMS.returnWindow,
    returnCondition:
      String(partial?.returnCondition || '').trim() ||
      DEFAULT_STORE_POLICY_CLAIMS.returnCondition,
    refundWindow:
      String(partial?.refundWindow || '').trim() || DEFAULT_STORE_POLICY_CLAIMS.refundWindow,
    supportEmail:
      String(partial?.supportEmail || '').trim() || DEFAULT_STORE_POLICY_CLAIMS.supportEmail,
  }
}
