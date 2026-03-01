"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import {
  useCheckoutForm,
  useBuyNow,
  useSavedAddresses,
  useCheckoutSubmit,
} from "./hooks";
import {
  CheckoutSuccess,
  CheckoutLoading,
  CheckoutEmpty,
  ContactInfoSection,
  ShippingAddressSection,
  GuestBenefitsPrompt,
  PaymentMethodSection,
  OrderSummarySection,
} from "./components";
import { CHECKOUT_ROUTES } from "./constants";
import type { CheckoutPageClientProps } from "./types";

export function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const t = useTranslations("checkout");
  const { items: cartItems, total: cartTotal, isLoading: cartLoading } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Buy now mode
  const { isBuyNow, buyNowItem, isBuyNowLoading } = useBuyNow();

  // Determine which items to use (buy-now or cart)
  const items = isBuyNow && buyNowItem ? [buyNowItem] : cartItems;
  const total = isBuyNow && buyNowItem ? buyNowItem.price * buyNowItem.quantity : cartTotal;

  // Saved addresses
  const { savedAddresses, isLoadingAddresses, saveNewAddress } = useSavedAddresses();

  // Form state
  const {
    formState,
    updateField,
    selectedAddressId,
    selectAddress,
    saveAddress,
    setSaveAddress,
  } = useCheckoutForm(savedAddresses);

  // Submit handler
  const { isSubmitting, orderId, orderSuccess, handleSubmit } = useCheckoutSubmit({
    items,
    formState,
    isBuyNow,
    selectedAddressId,
    saveAddress,
    onSaveAddress: async () => {
      await saveNewAddress({
        firstName: formState.firstName,
        lastName: formState.lastName,
        phone: formState.phone,
        street: formState.address,
        city: formState.city,
        state: formState.area || formState.city,
      });
    },
  });

  // Success state
  if (orderSuccess && orderId) {
    return <CheckoutSuccess orderId={orderId} />;
  }

  // Loading state
  if (cartLoading || authLoading || (isBuyNow && isBuyNowLoading)) {
    return <CheckoutLoading />;
  }

  // Empty cart
  if (!isBuyNow && items.length === 0) {
    return <CheckoutEmpty />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to cart */}
      <Link
        href={CHECKOUT_ROUTES.CART}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("backToCart")}
      </Link>

      <h1 className="text-2xl font-semibold mb-8">{t("title")}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-8">
            <ContactInfoSection formState={formState} onUpdateField={updateField} />

            <ShippingAddressSection
              formState={formState}
              onUpdateField={updateField}
              savedAddresses={savedAddresses}
              isLoadingAddresses={isLoadingAddresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={selectAddress}
              saveAddress={saveAddress}
              onSaveAddressChange={setSaveAddress}
            />

            {/* Guest checkout benefits prompt */}
            {!isAuthenticated && <GuestBenefitsPrompt />}

            <PaymentMethodSection />
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummarySection
              items={items}
              total={total}
              locale={locale}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
