export interface CreateOrderInput {
  purchaseId: string;
  amountInPaise: number;
  currency: string;
  planName: string;
}

export interface CreateOrderResult {
  redirectUrl: string;
}

export interface WebhookResult {
  purchaseId: string;
  status: "active" | "failed";
  paymentReference: string;
}

export interface PaymentProvider {
  name: string;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  verifyWebhook(payload: unknown, headers: Headers): Promise<WebhookResult>;
}
