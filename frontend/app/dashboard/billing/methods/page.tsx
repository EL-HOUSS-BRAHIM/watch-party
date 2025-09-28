import { PaymentMethods } from "@/components/billing/payment-methods"

export default function PaymentMethodsPage() {}
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground mt-2">
            Manage your saved payment methods and billing information;
          </p>
        </div>
        <PaymentMethods />
      </div>
    </div>
  )
}
