import { Metadata } from 'next'
import { BillingAddressView } from '@/components/billing/billing-address-view'

export const metadata: Metadata = { title: 'Billing Address - Watch Party',
  description: 'Manage your billing address and tax information'
}

export default function BillingAddressPage() {
  return <BillingAddressView />;
}
