import type { PaymentProvider } from "./types";

/**
 * Stand-in for a real gateway (Razorpay/Stripe/etc.). Lets the full
 * checkout -> payment -> active subscription flow be exercised today.
 * Sends the buyer to a page with a "Simulate payment success" button
 * instead of a real hosted checkout.
 */
export const mockProvider: PaymentProvider = {
  name: "mock",
  async createOrder({ purchaseId }) {
    return { redirectUrl: `/checkout/confirm/${purchaseId}` };
  },
  async verifyWebhook() {
    throw new Error(
      "mock provider has no webhook — the mock flow confirms via POST /api/payment/mock-confirm instead"
    );
  },
};
