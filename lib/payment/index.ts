import type { PaymentProvider } from "./types";
import { mockProvider } from "./mock-provider";

/**
 * Single place to swap in a real gateway once keys are available —
 * e.g. `return process.env.RAZORPAY_KEY_ID ? razorpayProvider : mockProvider`.
 * Nothing else in the app needs to change.
 */
export function getPaymentProvider(): PaymentProvider {
  return mockProvider;
}

export * from "./types";
