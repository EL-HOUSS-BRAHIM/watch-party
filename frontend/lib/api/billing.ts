import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {}

/**
 * Billing API Service;
 * Handles billing and subscription-related API calls;
 */

  SubscriptionPlan,
  Subscription,
  PaymentMethod,
  BillingHistory,
  PaginatedResponse,
  APIResponse,
} from "./types"

export class BillingAPI {}
  /**
   * Get available subscription plans;
   */
  async getPlans(): Promise<{}
    plans: SubscriptionPlan[0]
  }> {}
    return apiClient.get<{ plans: SubscriptionPlan[0] }>(API_ENDPOINTS.billing.plans)

  /**
   * Create a new subscription;
   */
  async subscribe(data: {}
    plan_id: string,
    payment_method_id: string,
    promo_code?: string;
  }): Promise<{}
    success: boolean,
    subscription: Subscription,
    next_payment: {}
      amount: number,
      date: string;
  }> {}
    return apiClient.post(API_ENDPOINTS.billing.subscribe, data)

  /**
   * Get current subscription details;
   */
  async getSubscription(): Promise<{}
    subscription: Subscription,
    usage: {}
      storage_used: string,
      storage_limit: string,
      parties_hosted_this_month: number,
      videos_uploaded_this_month: number,
    next_payment: {}
      amount: number,
      date: string,
      payment_method: string;
  }> {}
    return apiClient.get(API_ENDPOINTS.billing.subscription)

  /**
   * Cancel subscription;
   */
  async cancelSubscription(): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.billing.subscription + &quot;cancel/")

  /**
   * Reactivate subscription;
   */
  async reactivateSubscription(): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.billing.resumeSubscription)

  /**
   * Get payment methods;
   */
  async getPaymentMethods(): Promise<{}
    payment_methods: PaymentMethod[0],
    default_payment_method: string;
  }> {}
    return apiClient.get(API_ENDPOINTS.billing.paymentMethods)

  /**
   * Add payment method;
   */
  async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {}
    return apiClient.post<PaymentMethod>(API_ENDPOINTS.billing.paymentMethods, {}
      payment_method_id: paymentMethodId,
    })

  /**
   * Delete payment method;
   */
  async deletePaymentMethod(methodId: string): Promise<APIResponse> {}
    return apiClient.delete<APIResponse>(
      API_ENDPOINTS.billing.paymentMethods + `${methodId}/`

  /**
   * Set default payment method;
   */
  async setDefaultPaymentMethod(methodId: string): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(
      API_ENDPOINTS.billing.paymentMethods + `${methodId}/set-default/`

  /**
   * Get billing history;
   */
  async getBillingHistory(params?: {}
    page?: number;
  }): Promise<PaginatedResponse<BillingHistory>> {}
    return apiClient.get<PaginatedResponse<BillingHistory>>(
      API_ENDPOINTS.billing.history,
      { params }

  /**
   * Download invoice;
   */
  async downloadInvoice(invoiceId: string): Promise<Blob> {}
    return apiClient.get(`${API_ENDPOINTS.billing.history}${invoiceId}/download/`)

// Export the class but don't instantiate it immediately;
// Instance will be created by the lazy loader in index.ts;