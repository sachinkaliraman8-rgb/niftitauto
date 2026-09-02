/**
 * Kill switch for the self-serve checkout flow (new purchases + paying off
 * an outstanding due). Off by default so nobody can "simulate payment
 * success" and get a plan for free before a real gateway is wired up.
 *
 * Flip NEXT_PUBLIC_CHECKOUT_ENABLED=true in .env.local once getPaymentProvider()
 * in lib/payment/index.ts returns a real provider instead of the mock one.
 * Admin-side manual purchases/payments in /admin/purchases are unaffected —
 * that path is trusted (admin-only) and doesn't go through this flag.
 */
export function isCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";
}
